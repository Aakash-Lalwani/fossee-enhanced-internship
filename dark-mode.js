/**
 * Advanced Dark Mode Implementation
 * Features: System preference detection, smooth transitions, custom themes
 */

class AdvancedDarkMode {
  constructor() {
    this.themes = {
      light: {
        primary: '#2563eb',
        primaryDark: '#1d4ed8',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#334155',
        textSecondary: '#64748b',
        border: '#e2e8f0'
      },
      dark: {
        primary: '#60a5fa',
        primaryDark: '#3b82f6',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
        textSecondary: '#cbd5e1',
        border: '#334155'
      },
      auto: 'system-preference'
    };
    
    this.currentTheme = this.getStoredTheme() || 'auto';
    this.init();
  }

  init() {
    this.setupThemeToggle();
    this.applyTheme(this.currentTheme);
    this.setupSystemPreferenceListener();
    this.addCustomCSS();
  }

  setupThemeToggle() {
    // Find existing theme toggle in HTML
    const themeBtn = document.querySelector('.theme-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.cycleTheme());
    }
  }

  addCustomCSS() {
    const style = document.createElement('style');
    style.textContent = `
      .theme-toggle {
        position: relative;
        margin-left: 1rem;
      }

      .theme-btn {
        position: relative;
        width: 80px;
        height: 36px;
        background: var(--gray-200);
        border: none;
        border-radius: 18px;
        cursor: pointer;
        transition: all 0.3s ease;
        overflow: hidden;
      }

      .theme-icon {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        font-size: 16px;
        transition: all 0.3s ease;
        opacity: 0.5;
      }

      .sun-icon { left: 8px; }
      .moon-icon { left: 32px; }
      .auto-icon { right: 8px; }

      .theme-slider {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 24px;
        height: 24px;
        background: white;
        border-radius: 12px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }

      /* Theme states */
      .theme-light .theme-slider { transform: translateX(0); }
      .theme-dark .theme-slider { transform: translateX(26px); }
      .theme-auto .theme-slider { transform: translateX(52px); }

      .theme-light .sun-icon { opacity: 1; }
      .theme-dark .moon-icon { opacity: 1; }
      .theme-auto .auto-icon { opacity: 1; }

      /* Dark mode styles */
      [data-theme="dark"] {
        --primary-color: #60a5fa;
        --primary-dark: #3b82f6;
        --primary-light: #93c5fd;
        --gray-50: #1e293b;
        --gray-100: #334155;
        --gray-200: #475569;
        --gray-300: #64748b;
        --gray-600: #cbd5e1;
        --gray-700: #f1f5f9;
        --gray-800: #f8fafc;
        --gray-900: #ffffff;
        --white: #0f172a;
      }

      /* Smooth theme transitions */
      * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
      }

      /* Theme-aware gradients */
      [data-theme="dark"] .hero {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      }

      [data-theme="dark"] .cta-section {
        background: linear-gradient(135deg, #1e293b, #334155);
      }

      /* Glowing effects for dark mode */
      [data-theme="dark"] .workshop-card:hover {
        box-shadow: 0 20px 25px -5px rgba(96, 165, 250, 0.1), 0 0 20px rgba(96, 165, 250, 0.05);
      }

      [data-theme="dark"] .btn-primary {
        box-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
      }
    `;
    document.head.appendChild(style);
  }

  cycleTheme() {
    const themes = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);
  }

  setTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem('fossee-theme', theme);
    this.applyTheme(theme);
    this.updateToggleState();
  }

  applyTheme(theme) {
    const root = document.documentElement;
    const toggle = document.querySelector('.theme-toggle');
    
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
    
    if (toggle) {
      toggle.className = `theme-toggle theme-${theme}`;
    }
  }

  updateToggleState() {
    const themeBtn = document.querySelector('.theme-btn');
    if (themeBtn) {
      themeBtn.setAttribute('data-theme', this.currentTheme);
    }
  }

  getStoredTheme() {
    return localStorage.getItem('fossee-theme');
  }

  setupSystemPreferenceListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (this.currentTheme === 'auto') {
        this.applyTheme('auto');
      }
    });
  }
}

// Initialize dark mode
const darkMode = new AdvancedDarkMode();
