/**
 * 3D and WebGL Features for FOSSEE Workshops
 * Features: Interactive 3D models, particle systems, immersive animations
 */

class WebGL3DEngine {
  constructor() {
    this.canvas = null;
    this.gl = null;
    this.scene = {
      objects: [],
      lights: [],
      camera: { x: 0, y: 0, z: 5, rotX: 0, rotY: 0 }
    };
    this.shaders = new Map();
    this.textures = new Map();
    this.animations = new Map();
    this.isInitialized = false;
    
    this.init();
  }

  async init() {
    this.create3DContainer();
    this.initWebGL();
    this.loadShaders();
    this.setupScene();
    this.startRenderLoop();
    this.addInteractiveElements();
  }

  // WebGL Initialization
  create3DContainer() {
    const container = document.createElement('div');
    container.className = 'webgl-3d-container';
    container.innerHTML = `
      <div class="3d-header">
        <h3><i class="fas fa-cube"></i> Interactive 3D Experience</h3>
        <div class="3d-controls">
          <button id="toggle-3d" class="btn btn-sm">
            <i class="fas fa-eye"></i> Toggle 3D
          </button>
          <button id="reset-view" class="btn btn-sm">
            <i class="fas fa-undo"></i> Reset View
          </button>
        </div>
      </div>
      
      <canvas id="webgl-canvas" width="800" height="600"></canvas>
      
      <div class="3d-info-panel">
        <div class="scene-info">
          <h4>Scene Information</h4>
          <div class="info-item">
            <span>Objects:</span> <span id="object-count">0</span>
          </div>
          <div class="info-item">
            <span>FPS:</span> <span id="fps-counter">60</span>
          </div>
          <div class="info-item">
            <span>Triangles:</span> <span id="triangle-count">0</span>
          </div>
        </div>
        
        <div class="interaction-guide">
          <h4>Controls</h4>
          <div class="control-item">
            <kbd>Mouse</kbd> Rotate view
          </div>
          <div class="control-item">
            <kbd>Scroll</kbd> Zoom in/out
          </div>
          <div class="control-item">
            <kbd>Space</kbd> Play/Pause animation
          </div>
        </div>
      </div>
      
      <div class="particle-system-controls">
        <h4>Particle Effects</h4>
        <div class="particle-controls">
          <button class="particle-btn" data-effect="knowledge-flow">Knowledge Flow</button>
          <button class="particle-btn" data-effect="skill-burst">Skill Burst</button>
          <button class="particle-btn" data-effect="learning-path">Learning Path</button>
          <button class="particle-btn" data-effect="achievement">Achievement</button>
        </div>
      </div>
    `;

    // Insert into main content
    const mainContent = document.querySelector('.main-content') || document.body;
    mainContent.appendChild(container);

    this.canvas = document.getElementById('webgl-canvas');
    this.setupCanvasInteraction();
  }

  initWebGL() {
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    
    if (!this.gl) {
      console.warn('WebGL not supported, falling back to 2D canvas');
      this.initCanvas2D();
      return;
    }

    // WebGL settings
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.clearColor(0.05, 0.05, 0.1, 1.0);

    this.isInitialized = true;
  }

  initCanvas2D() {
    // Fallback for systems without WebGL
    this.ctx = this.canvas.getContext('2d');
    this.render2DFallback();
  }

  // Shader Management
  loadShaders() {
    // Vertex shader for 3D objects
    const vertexShaderSource = `
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      attribute vec2 aTexCoord;
      
      uniform mat4 uModelMatrix;
      uniform mat4 uViewMatrix;
      uniform mat4 uProjectionMatrix;
      uniform mat3 uNormalMatrix;
      
      varying vec3 vNormal;
      varying vec2 vTexCoord;
      varying vec3 vPosition;
      
      void main() {
        vec4 worldPosition = uModelMatrix * vec4(aPosition, 1.0);
        vPosition = worldPosition.xyz;
        vNormal = normalize(uNormalMatrix * aNormal);
        vTexCoord = aTexCoord;
        
        gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
      }
    `;

    // Fragment shader for lighting
    const fragmentShaderSource = `
      precision mediump float;
      
      varying vec3 vNormal;
      varying vec2 vTexCoord;
      varying vec3 vPosition;
      
      uniform vec3 uLightPosition;
      uniform vec3 uLightColor;
      uniform vec3 uAmbientColor;
      uniform vec3 uDiffuseColor;
      uniform float uTime;
      
      void main() {
        vec3 lightDirection = normalize(uLightPosition - vPosition);
        float lightIntensity = max(dot(vNormal, lightDirection), 0.0);
        
        vec3 ambient = uAmbientColor * 0.3;
        vec3 diffuse = uDiffuseColor * lightIntensity;
        
        // Add some animation based on time
        float pulse = sin(uTime * 2.0) * 0.1 + 0.9;
        
        gl_FragColor = vec4((ambient + diffuse) * pulse, 0.8);
      }
    `;

    // Particle shader
    const particleVertexShader = `
      attribute vec3 aPosition;
      attribute float aSize;
      attribute vec3 aVelocity;
      attribute float aLife;
      
      uniform mat4 uProjectionMatrix;
      uniform mat4 uViewMatrix;
      uniform float uTime;
      
      varying float vLife;
      
      void main() {
        vec3 pos = aPosition + aVelocity * uTime;
        vLife = aLife;
        
        gl_Position = uProjectionMatrix * uViewMatrix * vec4(pos, 1.0);
        gl_PointSize = aSize * (1.0 - uTime * 0.1);
      }
    `;

    const particleFragmentShader = `
      precision mediump float;
      
      varying float vLife;
      uniform float uTime;
      
      void main() {
        float dist = distance(gl_PointCoord, vec2(0.5));
        if (dist > 0.5) discard;
        
        float alpha = (1.0 - dist * 2.0) * vLife;
        vec3 color = mix(vec3(0.2, 0.8, 1.0), vec3(1.0, 0.4, 0.8), sin(uTime));
        
        gl_FragColor = vec4(color, alpha);
      }
    `;

    if (this.gl) {
      this.shaders.set('main', this.createShaderProgram(vertexShaderSource, fragmentShaderSource));
      this.shaders.set('particle', this.createShaderProgram(particleVertexShader, particleFragmentShader));
    }
  }

  createShaderProgram(vertexSource, fragmentSource) {
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
    
    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Shader program failed to link:', this.gl.getProgramInfoLog(program));
      return null;
    }
    
    return program;
  }

  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader failed to compile:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }

  // 3D Scene Setup
  setupScene() {
    // Create 3D models representing learning concepts
    this.createKnowledgeTree();
    this.createSkillNodes();
    this.createLearningPath();
    this.setupLighting();
    this.initParticleSystem();
  }

  createKnowledgeTree() {
    // Create a tree-like structure representing knowledge branches
    const tree = {
      name: 'knowledge-tree',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      vertices: this.generateTreeVertices(),
      animation: 'gentle-sway'
    };
    
    this.scene.objects.push(tree);
  }

  generateTreeVertices() {
    // Simplified tree geometry
    const vertices = [];
    const branches = 8;
    
    // Trunk
    for (let i = 0; i < 10; i++) {
      const y = i * 0.2;
      const radius = 0.1 * (1 - i * 0.05);
      
      for (let j = 0; j < 8; j++) {
        const angle = (j / 8) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        vertices.push(x, y, z);
      }
    }
    
    // Branches (representing different skills)
    for (let b = 0; b < branches; b++) {
      const baseY = 1.5;
      const angle = (b / branches) * Math.PI * 2;
      const baseX = Math.cos(angle) * 0.5;
      const baseZ = Math.sin(angle) * 0.5;
      
      for (let i = 0; i < 5; i++) {
        const t = i / 4;
        const x = baseX + Math.cos(angle + t) * t * 0.3;
        const y = baseY + t * 0.4;
        const z = baseZ + Math.sin(angle + t) * t * 0.3;
        
        vertices.push(x, y, z);
      }
    }
    
    return vertices;
  }

  createSkillNodes() {
    const skills = [
      { name: 'Python', position: [-2, 1, 0], color: [0.2, 0.6, 1.0] },
      { name: 'JavaScript', position: [2, 1, 0], color: [1.0, 0.8, 0.2] },
      { name: 'Data Science', position: [0, 2, -1], color: [0.6, 1.0, 0.4] },
      { name: 'Machine Learning', position: [-1, 0.5, 1], color: [1.0, 0.4, 0.8] },
      { name: 'Web Development', position: [1, 0.5, 1], color: [0.8, 0.2, 1.0] }
    ];

    skills.forEach(skill => {
      const node = {
        name: `skill-${skill.name.toLowerCase().replace(' ', '-')}`,
        type: 'sphere',
        position: skill.position,
        color: skill.color,
        scale: [0.3, 0.3, 0.3],
        animation: 'pulse',
        vertices: this.generateSphereVertices(0.3, 16, 12)
      };
      
      this.scene.objects.push(node);
    });
  }

  generateSphereVertices(radius, segments, rings) {
    const vertices = [];
    
    for (let ring = 0; ring <= rings; ring++) {
      const theta = (ring / rings) * Math.PI;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      
      for (let segment = 0; segment <= segments; segment++) {
        const phi = (segment / segments) * 2 * Math.PI;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        
        const x = radius * sinTheta * cosPhi;
        const y = radius * cosTheta;
        const z = radius * sinTheta * sinPhi;
        
        vertices.push(x, y, z);
      }
    }
    
    return vertices;
  }

  createLearningPath() {
    // Create a spiraling path showing learning progression
    const path = {
      name: 'learning-path',
      type: 'path',
      vertices: this.generatePathVertices(),
      color: [0.4, 0.8, 1.0],
      animation: 'flow'
    };
    
    this.scene.objects.push(path);
  }

  generatePathVertices() {
    const vertices = [];
    const steps = 100;
    
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const angle = t * Math.PI * 6; // 3 full rotations
      const radius = 2 - t * 1.5; // Spiral inward
      const height = t * 3; // Move upward
      
      const x = Math.cos(angle) * radius;
      const y = height;
      const z = Math.sin(angle) * radius;
      
      vertices.push(x, y, z);
    }
    
    return vertices;
  }

  setupLighting() {
    this.scene.lights.push({
      type: 'directional',
      position: [2, 4, 3],
      color: [1.0, 1.0, 1.0],
      intensity: 1.0
    });
    
    this.scene.lights.push({
      type: 'ambient',
      color: [0.3, 0.3, 0.4],
      intensity: 0.4
    });
  }

  // Particle System
  initParticleSystem() {
    this.particleSystem = {
      particles: [],
      maxParticles: 1000,
      emitters: [],
      effects: new Map()
    };
    
    this.setupParticleEffects();
  }

  setupParticleEffects() {
    // Knowledge Flow Effect
    this.particleSystem.effects.set('knowledge-flow', {
      particleCount: 200,
      emissionRate: 10,
      lifetime: 3.0,
      startVelocity: [0, 0.5, 0],
      gravity: [0, -0.1, 0],
      color: [0.2, 0.8, 1.0, 1.0],
      size: 0.05
    });
    
    // Skill Burst Effect
    this.particleSystem.effects.set('skill-burst', {
      particleCount: 500,
      emissionRate: 50,
      lifetime: 2.0,
      startVelocity: [0, 0, 0],
      gravity: [0, 0, 0],
      color: [1.0, 0.6, 0.2, 1.0],
      size: 0.08,
      burst: true
    });
    
    // Learning Path Effect
    this.particleSystem.effects.set('learning-path', {
      particleCount: 300,
      emissionRate: 15,
      lifetime: 4.0,
      followPath: true,
      color: [0.6, 1.0, 0.4, 1.0],
      size: 0.03
    });
    
    // Achievement Effect
    this.particleSystem.effects.set('achievement', {
      particleCount: 100,
      emissionRate: 20,
      lifetime: 2.5,
      startVelocity: [0, 1.0, 0],
      gravity: [0, -0.2, 0],
      color: [1.0, 0.8, 0.2, 1.0],
      size: 0.1,
      sparkle: true
    });
  }

  // Animation System
  startRenderLoop() {
    const startTime = Date.now();
    let frameCount = 0;
    
    const render = () => {
      const currentTime = (Date.now() - startTime) / 1000;
      frameCount++;
      
      // Update FPS counter
      if (frameCount % 60 === 0) {
        const fps = Math.round(60000 / (Date.now() - (startTime + (frameCount - 60) * 16.67)));
        document.getElementById('fps-counter').textContent = fps;
      }
      
      if (this.isInitialized) {
        this.updateScene(currentTime);
        this.renderWebGL(currentTime);
      } else {
        this.render2DFallback();
      }
      
      requestAnimationFrame(render);
    };
    
    render();
  }

  updateScene(time) {
    // Update camera
    this.updateCamera();
    
    // Update animations
    this.scene.objects.forEach(obj => {
      this.updateObjectAnimation(obj, time);
    });
    
    // Update particles
    this.updateParticleSystem(time);
    
    // Update info panel
    document.getElementById('object-count').textContent = this.scene.objects.length;
  }

  updateObjectAnimation(obj, time) {
    if (obj.animation === 'gentle-sway') {
      obj.rotation[2] = Math.sin(time * 0.5) * 0.1;
    } else if (obj.animation === 'pulse') {
      const scale = 1.0 + Math.sin(time * 2.0) * 0.1;
      obj.scale = [scale, scale, scale];
    } else if (obj.animation === 'flow') {
      // Animate the learning path
      obj.flowOffset = (obj.flowOffset || 0) + 0.02;
    }
  }

  updateParticleSystem(time) {
    // Update existing particles
    this.particleSystem.particles = this.particleSystem.particles.filter(particle => {
      particle.life -= 0.016; // Assuming 60 FPS
      
      if (particle.life <= 0) return false;
      
      // Update position based on velocity and gravity
      particle.position[0] += particle.velocity[0] * 0.016;
      particle.position[1] += particle.velocity[1] * 0.016;
      particle.position[2] += particle.velocity[2] * 0.016;
      
      if (particle.gravity) {
        particle.velocity[0] += particle.gravity[0] * 0.016;
        particle.velocity[1] += particle.gravity[1] * 0.016;
        particle.velocity[2] += particle.gravity[2] * 0.016;
      }
      
      return true;
    });
    
    // Emit new particles from active emitters
    this.particleSystem.emitters.forEach(emitter => {
      if (emitter.active) {
        this.emitParticles(emitter);
      }
    });
  }

  renderWebGL(time) {
    if (!this.gl) return;
    
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
    // Render 3D objects
    this.renderObjects(time);
    
    // Render particles
    this.renderParticles(time);
  }

  renderObjects(time) {
    const program = this.shaders.get('main');
    if (!program) return;
    
    this.gl.useProgram(program);
    
    // Set up matrices
    const projectionMatrix = this.createProjectionMatrix();
    const viewMatrix = this.createViewMatrix();
    
    // Set uniforms
    const projectionLocation = this.gl.getUniformLocation(program, 'uProjectionMatrix');
    const viewLocation = this.gl.getUniformLocation(program, 'uViewMatrix');
    const timeLocation = this.gl.getUniformLocation(program, 'uTime');
    
    this.gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix);
    this.gl.uniformMatrix4fv(viewLocation, false, viewMatrix);
    this.gl.uniform1f(timeLocation, time);
    
    // Render each object
    this.scene.objects.forEach(obj => {
      this.renderObject(obj, program);
    });
  }

  renderParticles(time) {
    const program = this.shaders.get('particle');
    if (!program || this.particleSystem.particles.length === 0) return;
    
    this.gl.useProgram(program);
    this.gl.enable(this.gl.BLEND);
    
    // Render particle buffer
    this.renderParticleBuffer(program, time);
  }

  // Canvas 2D Fallback
  render2DFallback() {
    if (!this.ctx) return;
    
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
    
    // Draw a beautiful 2D representation
    this.draw2DKnowledgeVisualization();
  }

  draw2DKnowledgeVisualization() {
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw animated background
    const time = Date.now() / 1000;
    const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) / 2);
    gradient.addColorStop(0, `hsla(${Math.sin(time) * 30 + 210}, 70%, 20%, 0.8)`);
    gradient.addColorStop(1, 'hsla(240, 80%, 5%, 1)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
    
    // Draw skill nodes
    const skills = [
      { name: 'Python', x: centerX - 150, y: centerY - 50, color: '#3498db' },
      { name: 'JavaScript', x: centerX + 150, y: centerY - 50, color: '#f1c40f' },
      { name: 'Data Science', x: centerX, y: centerY - 120, color: '#2ecc71' },
      { name: 'ML', x: centerX - 75, y: centerY + 80, color: '#e91e63' },
      { name: 'Web Dev', x: centerX + 75, y: centerY + 80, color: '#9c27b0' }
    ];
    
    // Draw connections
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 2;
    
    skills.forEach((skill, i) => {
      skills.forEach((other, j) => {
        if (i < j) {
          this.ctx.beginPath();
          this.ctx.moveTo(skill.x, skill.y);
          this.ctx.lineTo(other.x, other.y);
          this.ctx.stroke();
        }
      });
    });
    
    // Draw skill nodes
    skills.forEach((skill, i) => {
      const pulse = Math.sin(time * 2 + i) * 0.2 + 1;
      const radius = 30 * pulse;
      
      // Glow effect
      const glowGradient = this.ctx.createRadialGradient(skill.x, skill.y, 0, skill.x, skill.y, radius * 2);
      glowGradient.addColorStop(0, skill.color);
      glowGradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = glowGradient;
      this.ctx.fillRect(skill.x - radius * 2, skill.y - radius * 2, radius * 4, radius * 4);
      
      // Node circle
      this.ctx.fillStyle = skill.color;
      this.ctx.beginPath();
      this.ctx.arc(skill.x, skill.y, radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Label
      this.ctx.fillStyle = 'white';
      this.ctx.font = 'bold 14px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(skill.name, skill.x, skill.y + 5);
    });
    
    // Draw floating particles
    this.draw2DParticles(time);
  }

  draw2DParticles(time) {
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.sin(time * 0.5 + i) * 200) + this.canvas.width / 2;
      const y = (Math.cos(time * 0.3 + i * 0.5) * 150) + this.canvas.height / 2;
      const size = Math.sin(time * 2 + i) * 2 + 3;
      const alpha = Math.sin(time + i) * 0.5 + 0.5;
      
      this.ctx.fillStyle = `hsla(${i * 10 + time * 30}, 70%, 60%, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  // Interaction Handlers
  setupCanvasInteraction() {
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    
    this.canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        
        this.scene.camera.rotY += deltaX * 0.01;
        this.scene.camera.rotX += deltaY * 0.01;
        
        lastX = e.clientX;
        lastY = e.clientY;
      }
    });
    
    this.canvas.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.scene.camera.z += e.deltaY * 0.01;
      this.scene.camera.z = Math.max(1, Math.min(10, this.scene.camera.z));
    });
    
    // Particle effect buttons
    document.querySelectorAll('.particle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const effect = btn.dataset.effect;
        this.triggerParticleEffect(effect);
      });
    });
    
    // 3D controls
    document.getElementById('toggle-3d')?.addEventListener('click', () => {
      this.toggle3DView();
    });
    
    document.getElementById('reset-view')?.addEventListener('click', () => {
      this.resetCamera();
    });
  }

  addInteractiveElements() {
    // Add interactive workshops as 3D objects
    const workshops = [
      { name: 'Python Workshop', position: [-1, 0, 0] },
      { name: 'Data Science Workshop', position: [1, 0, 0] },
      { name: 'Web Dev Workshop', position: [0, 1, 0] }
    ];
    
    workshops.forEach(workshop => {
      const obj = {
        name: workshop.name,
        type: 'interactive',
        position: workshop.position,
        clickable: true,
        onHover: () => this.showWorkshopInfo(workshop),
        onClick: () => this.openWorkshop(workshop)
      };
      
      this.scene.objects.push(obj);
    });
  }

  // Public API
  triggerParticleEffect(effectName) {
    const effect = this.particleSystem.effects.get(effectName);
    if (!effect) return;
    
    const emitter = {
      position: [0, 0, 0],
      effect: effectName,
      active: true,
      duration: effect.burst ? 0.5 : 3.0,
      startTime: Date.now() / 1000
    };
    
    this.particleSystem.emitters.push(emitter);
    
    // Auto-deactivate after duration
    setTimeout(() => {
      emitter.active = false;
    }, emitter.duration * 1000);
  }

  toggle3DView() {
    const container = document.querySelector('.webgl-3d-container');
    container.classList.toggle('minimized');
  }

  resetCamera() {
    this.scene.camera = { x: 0, y: 0, z: 5, rotX: 0, rotY: 0 };
  }

  showWorkshopInfo(workshop) {
    // Show workshop details on hover
    console.log(`Hovering over: ${workshop.name}`);
  }

  openWorkshop(workshop) {
    // Open workshop details
    console.log(`Opening: ${workshop.name}`);
  }

  // Matrix operations (simplified)
  createProjectionMatrix() {
    // Create perspective projection matrix
    const aspect = this.canvas.width / this.canvas.height;
    const fov = Math.PI / 4;
    const near = 0.1;
    const far = 100;
    
    // Simplified matrix creation
    return new Float32Array([
      1 / (aspect * Math.tan(fov / 2)), 0, 0, 0,
      0, 1 / Math.tan(fov / 2), 0, 0,
      0, 0, -(far + near) / (far - near), -1,
      0, 0, -2 * far * near / (far - near), 0
    ]);
  }

  createViewMatrix() {
    // Create view matrix based on camera
    const { camera } = this.scene;
    // Simplified view matrix
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      -camera.x, -camera.y, -camera.z, 1
    ]);
  }

  emitParticles(emitter) {
    // Emit particles based on emitter settings
    const effect = this.particleSystem.effects.get(emitter.effect);
    if (!effect) return;
    
    for (let i = 0; i < effect.emissionRate / 60; i++) {
      if (this.particleSystem.particles.length >= this.particleSystem.maxParticles) break;
      
      const particle = {
        position: [...emitter.position],
        velocity: [
          (Math.random() - 0.5) * 2,
          Math.random() * 2,
          (Math.random() - 0.5) * 2
        ],
        life: effect.lifetime,
        size: effect.size,
        color: [...effect.color],
        gravity: effect.gravity || [0, 0, 0]
      };
      
      this.particleSystem.particles.push(particle);
    }
  }

  renderObject(obj, program) {
    // Render individual 3D object
    // Implementation would include vertex buffer setup and drawing
  }

  renderParticleBuffer(program, time) {
    // Render all particles in a single draw call
    // Implementation would include particle vertex buffer management
  }

  updateCamera() {
    // Apply camera rotation and position updates
    // Implementation for smooth camera transitions
  }
}

// Initialize 3D Engine
window.webgl3DEngine = new WebGL3DEngine();
