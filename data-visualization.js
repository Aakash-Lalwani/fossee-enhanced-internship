/**
 * Advanced Data Visualization for FOSSEE Workshops
 * Features: Interactive charts, analytics dashboard, real-time statistics
 */

class DataVisualizationEngine {
  constructor() {
    this.charts = new Map();
    this.dataCache = new Map();
    this.animationQueue = [];
    this.isAnimating = false;
    
    this.init();
  }

  async init() {
    this.loadData();
    this.createDashboard();
    this.setupRealTimeUpdates();
    this.createInteractiveCharts();
    this.setupAnalytics();
  }

  // Data Management
  loadData() {
    // Workshop enrollment data
    this.dataCache.set('enrollments', {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Workshop Enrollments',
        data: [120, 150, 180, 220, 280, 320],
        trend: 'increasing'
      }]
    });

    // Skills distribution
    this.dataCache.set('skills', {
      labels: ['Python', 'JavaScript', 'Data Science', 'Web Dev', 'AI/ML', 'Cloud'],
      data: [35, 28, 22, 18, 15, 12],
      colors: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c']
    });

    // Completion rates
    this.dataCache.set('completion', {
      workshops: [
        { name: 'Python Basics', completion: 92, participants: 150 },
        { name: 'Data Science', completion: 85, participants: 120 },
        { name: 'Web Development', completion: 88, participants: 200 },
        { name: 'Machine Learning', completion: 78, participants: 80 },
        { name: 'Cloud Computing', completion: 82, participants: 90 }
      ]
    });

    // Real-time metrics
    this.dataCache.set('realtime', {
      activeUsers: 1247,
      ongoingWorkshops: 8,
      certificatesIssued: 2456,
      avgRating: 4.7
    });
  }

  // Dashboard Creation
  createDashboard() {
    const dashboard = document.createElement('div');
    dashboard.className = 'analytics-dashboard';
    dashboard.innerHTML = `
      <div class="dashboard-header">
        <h2><i class="fas fa-chart-line"></i> Analytics Dashboard</h2>
        <div class="dashboard-controls">
          <select id="time-range">
            <option value="7d">Last 7 days</option>
            <option value="30d" selected>Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button id="export-data" class="btn btn-outline">
            <i class="fas fa-download"></i> Export
          </button>
        </div>
      </div>
      
      <div class="metrics-overview">
        <div class="metric-card" id="metric-users">
          <div class="metric-icon"><i class="fas fa-users"></i></div>
          <div class="metric-content">
            <div class="metric-value" id="active-users">0</div>
            <div class="metric-label">Active Users</div>
            <div class="metric-change positive">+12%</div>
          </div>
        </div>
        
        <div class="metric-card" id="metric-workshops">
          <div class="metric-icon"><i class="fas fa-chalkboard-teacher"></i></div>
          <div class="metric-content">
            <div class="metric-value" id="ongoing-workshops">0</div>
            <div class="metric-label">Live Workshops</div>
            <div class="metric-change positive">+3</div>
          </div>
        </div>
        
        <div class="metric-card" id="metric-certificates">
          <div class="metric-icon"><i class="fas fa-certificate"></i></div>
          <div class="metric-content">
            <div class="metric-value" id="certificates-issued">0</div>
            <div class="metric-label">Certificates Issued</div>
            <div class="metric-change positive">+156</div>
          </div>
        </div>
        
        <div class="metric-card" id="metric-rating">
          <div class="metric-icon"><i class="fas fa-star"></i></div>
          <div class="metric-content">
            <div class="metric-value" id="avg-rating">0</div>
            <div class="metric-label">Average Rating</div>
            <div class="metric-change positive">+0.2</div>
          </div>
        </div>
      </div>
      
      <div class="charts-container">
        <div class="chart-panel">
          <h3>Enrollment Trends</h3>
          <canvas id="enrollment-chart"></canvas>
        </div>
        
        <div class="chart-panel">
          <h3>Skills Distribution</h3>
          <canvas id="skills-chart"></canvas>
        </div>
        
        <div class="chart-panel">
          <h3>Workshop Completion Rates</h3>
          <div id="completion-chart"></div>
        </div>
        
        <div class="chart-panel">
          <h3>Learning Progress</h3>
          <div id="progress-visualization"></div>
        </div>
      </div>
      
      <div class="interactive-features">
        <div class="feature-panel">
          <h3>Interactive Filters</h3>
          <div class="filter-controls" id="filter-controls">
            <!-- Filter controls will be populated here -->
          </div>
        </div>
        
        <div class="feature-panel">
          <h3>Real-time Activity</h3>
          <div class="activity-feed" id="activity-feed">
            <!-- Activity feed will be populated here -->
          </div>
        </div>
      </div>
    `;

    // Insert dashboard into main content
    const mainContent = document.querySelector('.main-content') || document.body;
    mainContent.appendChild(dashboard);

    this.setupDashboardHandlers();
    this.animateMetrics();
  }

  setupDashboardHandlers() {
    // Time range selector
    document.getElementById('time-range')?.addEventListener('change', (e) => {
      this.updateDashboard(e.target.value);
    });

    // Export data
    document.getElementById('export-data')?.addEventListener('click', () => {
      this.exportDashboardData();
    });
  }

  // Animated Metrics
  animateMetrics() {
    const realTimeData = this.dataCache.get('realtime');
    
    this.animateValue('active-users', 0, realTimeData.activeUsers, 2000);
    this.animateValue('ongoing-workshops', 0, realTimeData.ongoingWorkshops, 1500);
    this.animateValue('certificates-issued', 0, realTimeData.certificatesIssued, 2500);
    this.animateValue('avg-rating', 0, realTimeData.avgRating, 1800, 1);
  }

  animateValue(elementId, start, end, duration, decimals = 0) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        current = end;
        clearInterval(timer);
      }
      element.textContent = decimals > 0 ? current.toFixed(decimals) : Math.floor(current);
    }, 16);
  }

  // Chart Creation
  createInteractiveCharts() {
    this.createEnrollmentChart();
    this.createSkillsChart();
    this.createCompletionChart();
    this.createProgressVisualization();
  }

  createEnrollmentChart() {
    const canvas = document.getElementById('enrollment-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const data = this.dataCache.get('enrollments');
    
    // Custom chart implementation (simplified)
    this.drawLineChart(ctx, data, {
      width: canvas.width,
      height: canvas.height,
      animate: true,
      showPoints: true,
      gradient: true
    });

    this.charts.set('enrollment', { canvas, ctx, data });
  }

  createSkillsChart() {
    const canvas = document.getElementById('skills-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const data = this.dataCache.get('skills');
    
    this.drawDoughnutChart(ctx, data, {
      width: canvas.width,
      height: canvas.height,
      animate: true,
      showLabels: true,
      interactive: true
    });

    this.charts.set('skills', { canvas, ctx, data });
  }

  createCompletionChart() {
    const container = document.getElementById('completion-chart');
    if (!container) return;

    const data = this.dataCache.get('completion');
    
    container.innerHTML = data.workshops.map(workshop => `
      <div class="completion-bar-container">
        <div class="workshop-info">
          <span class="workshop-name">${workshop.name}</span>
          <span class="completion-rate">${workshop.completion}%</span>
        </div>
        <div class="completion-bar">
          <div class="completion-fill" 
               style="width: 0%; background: linear-gradient(90deg, #3498db, #2ecc71);"
               data-width="${workshop.completion}%">
          </div>
        </div>
        <div class="participant-count">${workshop.participants} participants</div>
      </div>
    `).join('');

    // Animate bars
    setTimeout(() => {
      container.querySelectorAll('.completion-fill').forEach(bar => {
        bar.style.width = bar.dataset.width;
        bar.style.transition = 'width 1.5s ease-out';
      });
    }, 500);
  }

  createProgressVisualization() {
    const container = document.getElementById('progress-visualization');
    if (!container) return;

    container.innerHTML = `
      <div class="progress-viz">
        <div class="learning-path">
          <div class="path-step completed" data-step="1">
            <div class="step-icon"><i class="fas fa-play"></i></div>
            <div class="step-label">Getting Started</div>
            <div class="step-progress">100%</div>
          </div>
          
          <div class="path-step current" data-step="2">
            <div class="step-icon"><i class="fas fa-code"></i></div>
            <div class="step-label">Core Skills</div>
            <div class="step-progress">67%</div>
          </div>
          
          <div class="path-step" data-step="3">
            <div class="step-icon"><i class="fas fa-project-diagram"></i></div>
            <div class="step-label">Advanced Projects</div>
            <div class="step-progress">23%</div>
          </div>
          
          <div class="path-step" data-step="4">
            <div class="step-icon"><i class="fas fa-graduation-cap"></i></div>
            <div class="step-label">Certification</div>
            <div class="step-progress">0%</div>
          </div>
        </div>
        
        <div class="skill-radar">
          <canvas id="skill-radar-chart" width="200" height="200"></canvas>
        </div>
      </div>
    `;

    this.createRadarChart();
  }

  createRadarChart() {
    const canvas = document.getElementById('skill-radar-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const skills = [
      { name: 'Programming', level: 0.8 },
      { name: 'Problem Solving', level: 0.7 },
      { name: 'Collaboration', level: 0.9 },
      { name: 'Communication', level: 0.6 },
      { name: 'Leadership', level: 0.5 }
    ];

    this.drawRadarChart(ctx, skills, {
      width: canvas.width,
      height: canvas.height,
      animate: true
    });
  }

  // Custom Chart Drawing Methods
  drawLineChart(ctx, data, options) {
    const { width, height, animate, showPoints, gradient } = options;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create gradient if specified
    if (gradient) {
      const grad = ctx.createLinearGradient(0, padding, 0, height - padding);
      grad.addColorStop(0, 'rgba(52, 152, 219, 0.3)');
      grad.addColorStop(1, 'rgba(52, 152, 219, 0.05)');
      ctx.fillStyle = grad;
    }

    // Draw axes
    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw data line
    const points = data.datasets[0].data;
    const maxValue = Math.max(...points);
    const stepX = chartWidth / (points.length - 1);

    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 3;
    ctx.beginPath();

    points.forEach((value, index) => {
      const x = padding + index * stepX;
      const y = height - padding - (value / maxValue) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw points if specified
    if (showPoints) {
      ctx.fillStyle = '#3498db';
      points.forEach((value, index) => {
        const x = padding + index * stepX;
        const y = height - padding - (value / maxValue) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // Draw labels
    ctx.fillStyle = '#7f8c8d';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    data.labels.forEach((label, index) => {
      const x = padding + index * stepX;
      ctx.fillText(label, x, height - 10);
    });
  }

  drawDoughnutChart(ctx, data, options) {
    const { width, height, animate } = options;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    const innerRadius = radius * 0.6;

    let currentAngle = -Math.PI / 2;
    const total = data.data.reduce((sum, value) => sum + value, 0);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    data.data.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI;
      
      // Draw slice
      ctx.fillStyle = data.colors[index];
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fill();

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius + innerRadius) / 2;
      const labelY = centerY + Math.sin(labelAngle) * (radius + innerRadius) / 2;
      
      ctx.fillStyle = '#2c3e50';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round((value / total) * 100)}%`, labelX, labelY);

      currentAngle += sliceAngle;
    });

    // Center text
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Skills', centerX, centerY - 5);
    ctx.font = '12px Arial';
    ctx.fillText('Distribution', centerX, centerY + 10);
  }

  drawRadarChart(ctx, skills, options) {
    const { width, height, animate } = options;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 30;
    const levels = 5;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background web
    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 1;

    for (let level = 1; level <= levels; level++) {
      const levelRadius = (radius / levels) * level;
      
      ctx.beginPath();
      for (let i = 0; i < skills.length; i++) {
        const angle = (i / skills.length) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + Math.cos(angle) * levelRadius;
        const y = centerY + Math.sin(angle) * levelRadius;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw axis lines
    for (let i = 0; i < skills.length; i++) {
      const angle = (i / skills.length) * 2 * Math.PI - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius
      );
      ctx.stroke();
    }

    // Draw data
    ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = 0; i < skills.length; i++) {
      const angle = (i / skills.length) * 2 * Math.PI - Math.PI / 2;
      const value = skills[i].level;
      const x = centerX + Math.cos(angle) * radius * value;
      const y = centerY + Math.sin(angle) * radius * value;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = '#2c3e50';
    ctx.font = '12px Arial';
    
    for (let i = 0; i < skills.length; i++) {
      const angle = (i / skills.length) * 2 * Math.PI - Math.PI / 2;
      const labelRadius = radius + 15;
      const x = centerX + Math.cos(angle) * labelRadius;
      const y = centerY + Math.sin(angle) * labelRadius;
      
      ctx.textAlign = x > centerX ? 'left' : x < centerX ? 'right' : 'center';
      ctx.fillText(skills[i].name, x, y);
    }
  }

  // Real-time Updates
  setupRealTimeUpdates() {
    setInterval(() => {
      this.updateRealTimeMetrics();
      this.updateActivityFeed();
    }, 5000);
  }

  updateRealTimeMetrics() {
    const realTimeData = this.dataCache.get('realtime');
    
    // Simulate data changes
    realTimeData.activeUsers += Math.floor(Math.random() * 10) - 5;
    realTimeData.ongoingWorkshops += Math.random() > 0.8 ? 1 : 0;
    realTimeData.certificatesIssued += Math.floor(Math.random() * 3);
    
    // Update display without animation
    document.getElementById('active-users').textContent = realTimeData.activeUsers;
    document.getElementById('ongoing-workshops').textContent = realTimeData.ongoingWorkshops;
    document.getElementById('certificates-issued').textContent = realTimeData.certificatesIssued;
  }

  updateActivityFeed() {
    const feed = document.getElementById('activity-feed');
    if (!feed) return;

    const activities = [
      '🎓 New user enrolled in Python Basics',
      '⭐ Workshop "Data Science" rated 5 stars',
      '🏆 Certificate issued for Machine Learning',
      '👥 Study group created for Web Development',
      '📊 New analytics report generated',
      '🔄 Workshop content updated'
    ];

    const activity = activities[Math.floor(Math.random() * activities.length)];
    const time = new Date().toLocaleTimeString();

    const activityElement = document.createElement('div');
    activityElement.className = 'activity-item';
    activityElement.innerHTML = `
      <span class="activity-text">${activity}</span>
      <span class="activity-time">${time}</span>
    `;

    feed.insertBefore(activityElement, feed.firstChild);

    // Keep only last 10 activities
    while (feed.children.length > 10) {
      feed.removeChild(feed.lastChild);
    }
  }

  // Data Export
  exportDashboardData() {
    const exportData = {
      timestamp: new Date().toISOString(),
      metrics: this.dataCache.get('realtime'),
      enrollments: this.dataCache.get('enrollments'),
      skills: this.dataCache.get('skills'),
      completion: this.dataCache.get('completion')
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fossee-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  updateDashboard(timeRange) {
    console.log(`Updating dashboard for time range: ${timeRange}`);
    // Simulate data refresh based on time range
    this.loadData();
    this.animateMetrics();
    
    // Redraw charts
    this.charts.forEach((chart, name) => {
      if (name === 'enrollment') {
        this.drawLineChart(chart.ctx, chart.data, {
          width: chart.canvas.width,
          height: chart.canvas.height,
          animate: true,
          showPoints: true,
          gradient: true
        });
      }
    });
  }

  // Public API
  addCustomChart(name, data, type = 'line') {
    console.log(`Adding custom chart: ${name}`);
    // API for adding custom visualizations
  }

  updateChartData(chartName, newData) {
    const chart = this.charts.get(chartName);
    if (chart) {
      chart.data = newData;
      // Redraw chart with new data
    }
  }

  getChartData(chartName) {
    const chart = this.charts.get(chartName);
    return chart ? chart.data : null;
  }
}

// Initialize Data Visualization Engine
window.dataVizEngine = new DataVisualizationEngine();
