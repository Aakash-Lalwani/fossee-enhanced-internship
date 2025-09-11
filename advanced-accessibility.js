/**
 * Advanced Accessibility Features for FOSSEE Workshops
 * Features: Voice navigation, screen reader optimization, keyboard shortcuts, high contrast modes
 */

class AdvancedAccessibilityEngine {
  constructor() {
    this.voiceRecognition = null;
    this.speechSynthesis = null;
    this.keyboardShortcuts = new Map();
    this.screenReaderMode = false;
    this.highContrastMode = false;
    this.voiceNavigationActive = false;
    this.focusManager = null;
    this.announcements = [];
    
    this.init();
  }

  async init() {
    this.setupVoiceNavigation();
    this.setupScreenReaderOptimization();
    this.setupKeyboardShortcuts();
    this.setupHighContrastMode();
    this.setupFocusManagement();
    this.setupARIAEnhancements();
    this.createAccessibilityPanel();
    this.setupTextToSpeech();
    this.initializeSemanticNavigation();
  }

  // Voice Navigation System
  setupVoiceNavigation() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.voiceRecognition = new SpeechRecognition();
      
      this.voiceRecognition.continuous = true;
      this.voiceRecognition.interimResults = true;
      this.voiceRecognition.lang = 'en-US';
      
      this.voiceRecognition.onresult = (event) => {
        this.handleVoiceCommand(event);
      };
      
      this.voiceRecognition.onerror = (event) => {
        console.warn('Voice recognition error:', event.error);
      };
      
      this.setupVoiceCommands();
    }
  }

  setupVoiceCommands() {
    this.voiceCommands = new Map([
      // Navigation commands
      ['go to home', () => this.navigateToSection('home')],
      ['go to workshops', () => this.navigateToSection('workshops')],
      ['go to about', () => this.navigateToSection('about')],
      ['go to contact', () => this.navigateToSection('contact')],
      
      // Action commands
      ['open menu', () => this.openMenu()],
      ['close menu', () => this.closeMenu()],
      ['search workshops', () => this.focusSearch()],
      ['show help', () => this.showHelp()],
      ['read this', () => this.readCurrentSection()],
      ['stop reading', () => this.stopReading()],
      
      // Workshop commands
      ['enroll now', () => this.enrollInWorkshop()],
      ['show details', () => this.showWorkshopDetails()],
      ['next workshop', () => this.navigateWorkshops('next')],
      ['previous workshop', () => this.navigateWorkshops('previous')],
      
      // Accessibility commands
      ['high contrast on', () => this.toggleHighContrast(true)],
      ['high contrast off', () => this.toggleHighContrast(false)],
      ['larger text', () => this.adjustFontSize('increase')],
      ['smaller text', () => this.adjustFontSize('decrease')],
      ['zoom in', () => this.adjustZoom('in')],
      ['zoom out', () => this.adjustZoom('out')]
    ]);
  }

  handleVoiceCommand(event) {
    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
    
    // Check for exact matches first
    if (this.voiceCommands.has(transcript)) {
      this.voiceCommands.get(transcript)();
      this.announceAction(`Command executed: ${transcript}`);
      return;
    }
    
    // Check for partial matches
    for (const [command, action] of this.voiceCommands) {
      if (transcript.includes(command)) {
        action();
        this.announceAction(`Command executed: ${command}`);
        return;
      }
    }
    
    // If no command found, try to interpret intent
    this.interpretVoiceIntent(transcript);
  }

  interpretVoiceIntent(transcript) {
    // Basic intent recognition
    if (transcript.includes('find') || transcript.includes('search')) {
      const searchTerm = transcript.replace(/(find|search)/g, '').trim();
      if (searchTerm) {
        this.performVoiceSearch(searchTerm);
      }
    } else if (transcript.includes('tell me about')) {
      const topic = transcript.replace('tell me about', '').trim();
      this.describeElement(topic);
    } else if (transcript.includes('help')) {
      this.announceVoiceCommands();
    }
  }

  // Screen Reader Optimization
  setupScreenReaderOptimization() {
    this.detectScreenReader();
    this.enhanceAriaLabels();
    this.setupLiveRegions();
    this.optimizeTabOrder();
    this.addSkipLinks();
  }

  detectScreenReader() {
    // Detect common screen readers
    const userAgent = navigator.userAgent.toLowerCase();
    const screenReaders = ['nvda', 'jaws', 'voiceover', 'orca', 'narrator'];
    
    this.screenReaderMode = screenReaders.some(sr => userAgent.includes(sr));
    
    // Also check for screen reader specific behaviors
    if (!this.screenReaderMode) {
      this.screenReaderMode = this.detectScreenReaderBehavior();
    }
    
    if (this.screenReaderMode) {
      document.body.classList.add('screen-reader-mode');
      this.optimizeForScreenReader();
    }
  }

  detectScreenReaderBehavior() {
    // Check for screen reader specific navigation patterns
    let screenReaderIndicators = 0;
    
    // Monitor for rapid tab navigation
    let rapidTabCount = 0;
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        rapidTabCount++;
        setTimeout(() => rapidTabCount--, 1000);
        if (rapidTabCount > 5) screenReaderIndicators++;
      }
    });
    
    // Check for arrow key navigation in non-input elements
    document.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const target = e.target;
        if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
          screenReaderIndicators++;
        }
      }
    });
    
    return screenReaderIndicators > 3;
  }

  optimizeForScreenReader() {
    // Add more descriptive content
    this.addScreenReaderContent();
    
    // Improve navigation announcements
    this.setupNavigationAnnouncements();
    
    // Add content structure information
    this.addStructuralInfo();
  }

  addScreenReaderContent() {
    // Add hidden descriptions for complex elements
    const complexElements = document.querySelectorAll('.workshop-card, .metric-card, .chart-panel');
    
    complexElements.forEach(element => {
      const description = this.generateElementDescription(element);
      if (description) {
        const srDescription = document.createElement('div');
        srDescription.className = 'sr-only';
        srDescription.textContent = description;
        element.appendChild(srDescription);
      }
    });
  }

  generateElementDescription(element) {
    if (element.classList.contains('workshop-card')) {
      const title = element.querySelector('h3')?.textContent || 'Workshop';
      const description = element.querySelector('.workshop-description')?.textContent || '';
      const duration = element.querySelector('.workshop-duration')?.textContent || '';
      return `${title}. ${description}. Duration: ${duration}. Press Enter to view details or Space to enroll.`;
    }
    
    if (element.classList.contains('metric-card')) {
      const value = element.querySelector('.metric-value')?.textContent || '';
      const label = element.querySelector('.metric-label')?.textContent || '';
      const change = element.querySelector('.metric-change')?.textContent || '';
      return `${label}: ${value}. Change: ${change}.`;
    }
    
    return null;
  }

  // Enhanced Keyboard Navigation
  setupKeyboardShortcuts() {
    this.keyboardShortcuts.set('Alt+1', () => this.navigateToSection('home'));
    this.keyboardShortcuts.set('Alt+2', () => this.navigateToSection('workshops'));
    this.keyboardShortcuts.set('Alt+3', () => this.navigateToSection('about'));
    this.keyboardShortcuts.set('Alt+4', () => this.navigateToSection('contact'));
    this.keyboardShortcuts.set('Alt+S', () => this.focusSearch());
    this.keyboardShortcuts.set('Alt+M', () => this.toggleMenu());
    this.keyboardShortcuts.set('Alt+H', () => this.showKeyboardHelp());
    this.keyboardShortcuts.set('Alt+R', () => this.toggleVoiceNavigation());
    this.keyboardShortcuts.set('Alt+C', () => this.toggleHighContrast());
    this.keyboardShortcuts.set('Ctrl+Plus', () => this.adjustFontSize('increase'));
    this.keyboardShortcuts.set('Ctrl+Minus', () => this.adjustFontSize('decrease'));
    this.keyboardShortcuts.set('Escape', () => this.closeActiveModals());
    
    // Workshop navigation
    this.keyboardShortcuts.set('J', () => this.navigateWorkshops('next'));
    this.keyboardShortcuts.set('K', () => this.navigateWorkshops('previous'));
    this.keyboardShortcuts.set('Enter', () => this.activateCurrentElement());
    this.keyboardShortcuts.set('Space', () => this.quickEnroll());
    
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcut(e);
    });
  }

  handleKeyboardShortcut(event) {
    const key = this.getKeyboardShortcut(event);
    
    if (this.keyboardShortcuts.has(key)) {
      event.preventDefault();
      this.keyboardShortcuts.get(key)();
      this.announceAction(`Keyboard shortcut activated: ${key}`);
    }
    
    // Handle focus management
    this.manageFocus(event);
  }

  getKeyboardShortcut(event) {
    const parts = [];
    
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    
    // Handle special keys
    if (event.key === '+') parts.push('Plus');
    else if (event.key === '-') parts.push('Minus');
    else parts.push(event.key);
    
    return parts.join('+');
  }

  // High Contrast Mode
  setupHighContrastMode() {
    this.createHighContrastStyles();
    
    // Check for system preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.enableHighContrast();
    }
    
    // Listen for system changes
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      if (e.matches) {
        this.enableHighContrast();
      }
    });
  }

  createHighContrastStyles() {
    const style = document.createElement('style');
    style.id = 'high-contrast-styles';
    style.textContent = `
      .high-contrast {
        filter: contrast(150%) brightness(120%);
      }
      
      .high-contrast * {
        border-color: #000 !important;
        outline: 2px solid transparent;
      }
      
      .high-contrast *:focus {
        outline: 3px solid #ffff00 !important;
        outline-offset: 2px;
      }
      
      .high-contrast .btn {
        border: 2px solid #000 !important;
        font-weight: bold;
      }
      
      .high-contrast .btn:hover {
        background: #ffff00 !important;
        color: #000 !important;
      }
      
      .high-contrast .workshop-card {
        border: 3px solid #000 !important;
        box-shadow: 5px 5px 0 #000 !important;
      }
      
      .high-contrast .nav-link:hover,
      .high-contrast .nav-link:focus {
        background: #ffff00 !important;
        color: #000 !important;
      }
    `;
    
    document.head.appendChild(style);
  }

  // Focus Management
  setupFocusManagement() {
    this.focusManager = {
      focusableElements: [],
      currentFocus: -1,
      focusHistory: [],
      skipLinks: []
    };
    
    this.updateFocusableElements();
    this.setupFocusTrapping();
    this.addFocusIndicators();
  }

  updateFocusableElements() {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');
    
    this.focusManager.focusableElements = Array.from(
      document.querySelectorAll(focusableSelectors)
    ).filter(el => this.isElementVisible(el));
  }

  isElementVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.offsetParent !== null;
  }

  manageFocus(event) {
    // Track focus for better navigation
    if (event.type === 'focus' || event.key === 'Tab') {
      this.focusManager.focusHistory.push(document.activeElement);
      
      // Limit history size
      if (this.focusManager.focusHistory.length > 10) {
        this.focusManager.focusHistory.shift();
      }
    }
    
    // Handle roving tabindex for complex widgets
    this.handleRovingTabindex(event);
  }

  handleRovingTabindex(event) {
    const currentElement = event.target;
    const parent = currentElement.closest('[role="menu"], [role="menubar"], [role="tablist"], [role="grid"]');
    
    if (parent && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      this.navigateWithArrowKeys(parent, currentElement, event.key);
    }
  }

  navigateWithArrowKeys(container, currentElement, key) {
    const items = Array.from(container.querySelectorAll('[role="menuitem"], [role="tab"], [role="gridcell"]'));
    const currentIndex = items.indexOf(currentElement);
    
    let nextIndex;
    
    switch (key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
    }
    
    if (nextIndex !== undefined && items[nextIndex]) {
      // Update tabindex
      items.forEach(item => item.setAttribute('tabindex', '-1'));
      items[nextIndex].setAttribute('tabindex', '0');
      items[nextIndex].focus();
    }
  }

  // ARIA Enhancements
  setupARIAEnhancements() {
    this.addMissingAriaLabels();
    this.setupLiveRegions();
    this.addLandmarkRoles();
    this.enhanceFormAccessibility();
  }

  addMissingAriaLabels() {
    // Add ARIA labels to elements that need them
    const buttonsWithoutLabels = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    buttonsWithoutLabels.forEach(button => {
      const text = button.textContent.trim() || button.getAttribute('title') || 'Button';
      button.setAttribute('aria-label', text);
    });
    
    // Enhance form inputs
    const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    inputsWithoutLabels.forEach(input => {
      const label = input.getAttribute('placeholder') || input.getAttribute('name') || 'Input field';
      input.setAttribute('aria-label', label);
    });
  }

  setupLiveRegions() {
    // Create announcement region
    const announceRegion = document.createElement('div');
    announceRegion.id = 'accessibility-announcements';
    announceRegion.setAttribute('aria-live', 'polite');
    announceRegion.setAttribute('aria-atomic', 'true');
    announceRegion.className = 'sr-only';
    document.body.appendChild(announceRegion);
    
    // Create status region for immediate announcements
    const statusRegion = document.createElement('div');
    statusRegion.id = 'accessibility-status';
    statusRegion.setAttribute('aria-live', 'assertive');
    statusRegion.setAttribute('aria-atomic', 'true');
    statusRegion.className = 'sr-only';
    document.body.appendChild(statusRegion);
  }

  addLandmarkRoles() {
    // Add landmark roles to improve navigation
    const header = document.querySelector('header');
    if (header) header.setAttribute('role', 'banner');
    
    const nav = document.querySelector('nav');
    if (nav) nav.setAttribute('role', 'navigation');
    
    const main = document.querySelector('main, .main-content');
    if (main) main.setAttribute('role', 'main');
    
    const footer = document.querySelector('footer');
    if (footer) footer.setAttribute('role', 'contentinfo');
    
    // Add complementary roles to sidebars
    const sidebars = document.querySelectorAll('.sidebar, aside');
    sidebars.forEach(sidebar => sidebar.setAttribute('role', 'complementary'));
  }

  // Text-to-Speech
  setupTextToSpeech() {
    if ('speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
      this.setupSpeechControls();
    }
  }

  setupSpeechControls() {
    // Add read buttons to sections
    const readableElements = document.querySelectorAll('h1, h2, h3, p, .workshop-description');
    
    readableElements.forEach(element => {
      if (element.offsetParent !== null) { // Only visible elements
        this.addReadButton(element);
      }
    });
  }

  addReadButton(element) {
    const readButton = document.createElement('button');
    readButton.className = 'read-button';
    readButton.innerHTML = '<i class="fas fa-volume-up"></i>';
    readButton.setAttribute('aria-label', 'Read this section aloud');
    readButton.setAttribute('title', 'Read aloud');
    
    readButton.addEventListener('click', () => {
      this.readText(element.textContent);
    });
    
    element.style.position = 'relative';
    element.appendChild(readButton);
  }

  readText(text, options = {}) {
    // Stop any current speech
    this.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 0.8;
    
    // Choose appropriate voice
    const voices = this.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && voice.name.includes('Female')
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => {
      this.announceAction('Reading aloud started');
    };
    
    utterance.onend = () => {
      this.announceAction('Reading aloud finished');
    };
    
    this.speechSynthesis.speak(utterance);
  }

  // Accessibility Panel
  createAccessibilityPanel() {
    const panel = document.createElement('div');
    panel.className = 'accessibility-panel';
    panel.innerHTML = `
      <button class="accessibility-toggle" aria-label="Open accessibility options">
        <i class="fas fa-universal-access"></i>
      </button>
      
      <div class="accessibility-menu" id="accessibility-menu" role="menu" aria-hidden="true">
        <h3>Accessibility Options</h3>
        
        <div class="accessibility-section">
          <h4>Vision</h4>
          <button class="accessibility-option" id="toggle-high-contrast" role="menuitem">
            <i class="fas fa-adjust"></i> High Contrast
          </button>
          <button class="accessibility-option" id="increase-font-size" role="menuitem">
            <i class="fas fa-search-plus"></i> Larger Text
          </button>
          <button class="accessibility-option" id="decrease-font-size" role="menuitem">
            <i class="fas fa-search-minus"></i> Smaller Text
          </button>
        </div>
        
        <div class="accessibility-section">
          <h4>Navigation</h4>
          <button class="accessibility-option" id="toggle-voice-nav" role="menuitem">
            <i class="fas fa-microphone"></i> Voice Navigation
          </button>
          <button class="accessibility-option" id="show-shortcuts" role="menuitem">
            <i class="fas fa-keyboard"></i> Keyboard Shortcuts
          </button>
          <button class="accessibility-option" id="skip-to-content" role="menuitem">
            <i class="fas fa-forward"></i> Skip to Content
          </button>
        </div>
        
        <div class="accessibility-section">
          <h4>Audio</h4>
          <button class="accessibility-option" id="read-page" role="menuitem">
            <i class="fas fa-volume-up"></i> Read Page
          </button>
          <button class="accessibility-option" id="stop-reading" role="menuitem">
            <i class="fas fa-volume-mute"></i> Stop Reading
          </button>
          <div class="speech-controls">
            <label for="speech-rate">Reading Speed:</label>
            <input type="range" id="speech-rate" min="0.5" max="2" step="0.1" value="0.9">
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);
    this.setupAccessibilityPanelHandlers();
  }

  setupAccessibilityPanelHandlers() {
    const toggle = document.querySelector('.accessibility-toggle');
    const menu = document.getElementById('accessibility-menu');
    
    toggle.addEventListener('click', () => {
      const isOpen = menu.getAttribute('aria-hidden') === 'false';
      menu.setAttribute('aria-hidden', !isOpen);
      menu.classList.toggle('open');
      
      if (!isOpen) {
        menu.querySelector('.accessibility-option').focus();
      }
    });
    
    // Option handlers
    document.getElementById('toggle-high-contrast')?.addEventListener('click', () => {
      this.toggleHighContrast();
    });
    
    document.getElementById('increase-font-size')?.addEventListener('click', () => {
      this.adjustFontSize('increase');
    });
    
    document.getElementById('decrease-font-size')?.addEventListener('click', () => {
      this.adjustFontSize('decrease');
    });
    
    document.getElementById('toggle-voice-nav')?.addEventListener('click', () => {
      this.toggleVoiceNavigation();
    });
    
    document.getElementById('show-shortcuts')?.addEventListener('click', () => {
      this.showKeyboardHelp();
    });
    
    document.getElementById('read-page')?.addEventListener('click', () => {
      this.readCurrentSection();
    });
    
    document.getElementById('stop-reading')?.addEventListener('click', () => {
      this.stopReading();
    });
    
    document.getElementById('speech-rate')?.addEventListener('input', (e) => {
      this.speechRate = parseFloat(e.target.value);
    });
  }

  // Public API Methods
  announceAction(message) {
    const announceRegion = document.getElementById('accessibility-announcements');
    if (announceRegion) {
      announceRegion.textContent = message;
      
      // Clear after 3 seconds
      setTimeout(() => {
        announceRegion.textContent = '';
      }, 3000);
    }
  }

  toggleVoiceNavigation() {
    if (!this.voiceRecognition) {
      this.announceAction('Voice navigation not supported in this browser');
      return;
    }
    
    this.voiceNavigationActive = !this.voiceNavigationActive;
    
    if (this.voiceNavigationActive) {
      this.voiceRecognition.start();
      this.announceAction('Voice navigation activated. Say "help" for commands.');
    } else {
      this.voiceRecognition.stop();
      this.announceAction('Voice navigation deactivated');
    }
  }

  toggleHighContrast(force) {
    this.highContrastMode = force !== undefined ? force : !this.highContrastMode;
    
    if (this.highContrastMode) {
      document.body.classList.add('high-contrast');
      this.announceAction('High contrast mode enabled');
    } else {
      document.body.classList.remove('high-contrast');
      this.announceAction('High contrast mode disabled');
    }
    
    localStorage.setItem('fossee-high-contrast', this.highContrastMode);
  }

  adjustFontSize(direction) {
    const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const newSize = direction === 'increase' ? currentSize * 1.1 : currentSize * 0.9;
    
    // Limit font size range
    if (newSize >= 12 && newSize <= 24) {
      document.documentElement.style.fontSize = `${newSize}px`;
      this.announceAction(`Font size ${direction === 'increase' ? 'increased' : 'decreased'}`);
      localStorage.setItem('fossee-font-size', newSize);
    }
  }

  readCurrentSection() {
    const activeElement = document.activeElement;
    const section = activeElement.closest('section, .workshop-card, .main-content') || 
                   document.querySelector('main, .main-content');
    
    if (section) {
      const text = this.extractReadableText(section);
      this.readText(text);
    }
  }

  extractReadableText(element) {
    // Extract meaningful text while skipping decorative elements
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (parent.classList.contains('sr-only') || 
              parent.style.display === 'none' ||
              parent.getAttribute('aria-hidden') === 'true') {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    const textNodes = [];
    let node;
    
    while (node = walker.nextNode()) {
      const text = node.textContent.trim();
      if (text) {
        textNodes.push(text);
      }
    }
    
    return textNodes.join(' ');
  }

  stopReading() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
      this.announceAction('Reading stopped');
    }
  }

  showKeyboardHelp() {
    const helpModal = document.createElement('div');
    helpModal.className = 'keyboard-help-modal';
    helpModal.setAttribute('role', 'dialog');
    helpModal.setAttribute('aria-labelledby', 'keyboard-help-title');
    helpModal.innerHTML = `
      <div class="modal-content">
        <h2 id="keyboard-help-title">Keyboard Shortcuts</h2>
        <div class="shortcuts-grid">
          <div class="shortcut-section">
            <h3>Navigation</h3>
            <dl>
              <dt><kbd>Alt</kbd> + <kbd>1</kbd></dt><dd>Go to Home</dd>
              <dt><kbd>Alt</kbd> + <kbd>2</kbd></dt><dd>Go to Workshops</dd>
              <dt><kbd>Alt</kbd> + <kbd>3</kbd></dt><dd>Go to About</dd>
              <dt><kbd>Alt</kbd> + <kbd>S</kbd></dt><dd>Focus Search</dd>
              <dt><kbd>J</kbd></dt><dd>Next Workshop</dd>
              <dt><kbd>K</kbd></dt><dd>Previous Workshop</dd>
            </dl>
          </div>
          
          <div class="shortcut-section">
            <h3>Accessibility</h3>
            <dl>
              <dt><kbd>Alt</kbd> + <kbd>C</kbd></dt><dd>Toggle High Contrast</dd>
              <dt><kbd>Alt</kbd> + <kbd>R</kbd></dt><dd>Toggle Voice Navigation</dd>
              <dt><kbd>Ctrl</kbd> + <kbd>+</kbd></dt><dd>Increase Font Size</dd>
              <dt><kbd>Ctrl</kbd> + <kbd>-</kbd></dt><dd>Decrease Font Size</dd>
            </dl>
          </div>
        </div>
        <button class="close-help" aria-label="Close help">Close</button>
      </div>
    `;
    
    document.body.appendChild(helpModal);
    
    helpModal.querySelector('.close-help').addEventListener('click', () => {
      helpModal.remove();
    });
    
    helpModal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        helpModal.remove();
      }
    });
    
    helpModal.querySelector('.close-help').focus();
  }

  // Navigation helpers
  navigateToSection(sectionName) {
    const section = document.getElementById(sectionName) || 
                   document.querySelector(`[data-section="${sectionName}"]`) ||
                   document.querySelector(`#${sectionName}-section`);
    
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      section.focus();
      this.announceAction(`Navigated to ${sectionName} section`);
    }
  }

  navigateWorkshops(direction) {
    const workshops = document.querySelectorAll('.workshop-card');
    const currentIndex = Array.from(workshops).findIndex(w => w.contains(document.activeElement));
    
    let nextIndex;
    if (direction === 'next') {
      nextIndex = currentIndex < workshops.length - 1 ? currentIndex + 1 : 0;
    } else {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : workshops.length - 1;
    }
    
    if (workshops[nextIndex]) {
      workshops[nextIndex].focus();
      workshops[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  initializeSemanticNavigation() {
    // Load saved preferences
    const savedFontSize = localStorage.getItem('fossee-font-size');
    if (savedFontSize) {
      document.documentElement.style.fontSize = `${savedFontSize}px`;
    }
    
    const savedHighContrast = localStorage.getItem('fossee-high-contrast') === 'true';
    if (savedHighContrast) {
      this.toggleHighContrast(true);
    }
    
    // Add semantic navigation landmarks
    this.addNavigationLandmarks();
  }

  addNavigationLandmarks() {
    // Add skip links
    const skipLinks = document.createElement('div');
    skipLinks.className = 'skip-links';
    skipLinks.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#navigation" class="skip-link">Skip to navigation</a>
      <a href="#workshops" class="skip-link">Skip to workshops</a>
    `;
    
    document.body.insertBefore(skipLinks, document.body.firstChild);
  }
}

// Initialize Advanced Accessibility Engine
window.accessibilityEngine = new AdvancedAccessibilityEngine();
