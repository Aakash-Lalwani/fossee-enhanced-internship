/**
 * FOSSEE Workshop Enhanced JavaScript
 * Modern, performant, and accessible interactions
 */

// =================================================================
// Utility Functions
// =================================================================

/**
 * Debounce function to limit function calls
 */
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Throttle function for scroll events
 */
const throttle = (func, delay) => {
  let timeoutId;
  let lastExecTime = 0;
  return (...args) => {
    const currentTime = Date.now();
    if (currentTime - lastExecTime > delay) {
      func.apply(null, args);
      lastExecTime = currentTime;
    }
  };
};

/**
 * Check if element is in viewport
 */
const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Animate number counter
 */
const animateNumber = (element, target, duration = 2000) => {
  const start = 0;
  const startTime = performance.now();
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(start + (target - start) * easeOutQuart);
    
    element.textContent = current.toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      element.textContent = target.toLocaleString();
    }
  };
  
  requestAnimationFrame(animate);
};

// =================================================================
// Main Application Class
// =================================================================

class FOSSEEWorkshop {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initializeComponents();
    this.handleAccessibility();
    this.initAnimations();
    
    // Initialize after DOM is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.onDOMReady();
      });
    } else {
      this.onDOMReady();
    }
  }

  onDOMReady() {
    this.initializeIntersectionObserver();
    this.setupLazyLoading();
    this.preloadCriticalResources();
  }

  // =================================================================
  // Event Listeners
  // =================================================================

  setupEventListeners() {
    // Navigation
    this.setupNavigation();
    
    // Workshop filtering and search
    this.setupWorkshopFilters();
    
    // Scroll events
    this.setupScrollEvents();
    
    // Form interactions
    this.setupFormInteractions();
    
    // Window events
    window.addEventListener('resize', debounce(() => {
      this.handleResize();
    }, 250));
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e);
    });
  }

  setupNavigation() {
    const navToggle = document.querySelector('.navbar-toggle');
    const navMenu = document.querySelector('.navbar-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const dropdowns = document.querySelectorAll('.dropdown');

    // Mobile menu toggle
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        this.toggleMobileMenu();
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
          this.closeMobileMenu();
        }
      });
    }

    // Smooth scroll for navigation links
    navLinks.forEach(link => {
      if (link.getAttribute('href')?.startsWith('#')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.smoothScrollTo(link.getAttribute('href'));
          this.closeMobileMenu();
        });
      }
    });

    // Dropdown keyboard accessibility
    dropdowns.forEach(dropdown => {
      const toggle = dropdown.querySelector('.dropdown-toggle');
      const menu = dropdown.querySelector('.dropdown-menu');
      
      if (toggle && menu) {
        toggle.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggleDropdown(dropdown);
          }
        });
      }
    });

    // Active navigation highlighting
    this.setupActiveNavigation();
  }

  setupWorkshopFilters() {
    const searchInput = document.getElementById('workshop-search');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const workshopCards = document.querySelectorAll('.workshop-card');
    const loadMoreBtn = document.getElementById('load-more-btn');

    // Search functionality
    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        this.filterWorkshops(e.target.value, this.getCurrentFilter());
      }, 300));
    }

    // Filter tabs
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.setActiveFilter(tab);
        this.filterWorkshops(searchInput?.value || '', tab.dataset.filter);
      });
    });

    // Bookmark functionality
    const bookmarkBtns = document.querySelectorAll('.bookmark-btn');
    bookmarkBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleBookmark(btn);
      });
    });

    // Load more functionality
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.loadMoreWorkshops();
      });
    }

    // Workshop card interactions
    workshopCards.forEach(card => {
      this.setupWorkshopCardInteractions(card);
    });
  }

  setupScrollEvents() {
    const backToTopBtn = document.getElementById('backToTop');
    const header = document.querySelector('.header');

    // Back to top button
    if (backToTopBtn) {
      window.addEventListener('scroll', throttle(() => {
        if (window.pageYOffset > 500) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }
      }, 100));

      backToTopBtn.addEventListener('click', () => {
        this.smoothScrollTo('#');
      });
    }

    // Header scroll effect
    if (header) {
      window.addEventListener('scroll', throttle(() => {
        if (window.pageYOffset > 50) {
          header.style.background = 'rgba(255, 255, 255, 0.98)';
          header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
          header.style.background = 'rgba(255, 255, 255, 0.95)';
          header.style.boxShadow = 'none';
        }
      }, 100));
    }
  }

  setupFormInteractions() {
    // Form validation and enhancement would go here
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        if (!this.validateForm(form)) {
          e.preventDefault();
        }
      });
    });
  }

  // =================================================================
  // Navigation Methods
  // =================================================================

  toggleMobileMenu() {
    const navToggle = document.querySelector('.navbar-toggle');
    const navMenu = document.querySelector('.navbar-menu');
    
    if (navToggle && navMenu) {
      const isActive = navToggle.classList.contains('active');
      
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
      navToggle.setAttribute('aria-expanded', !isActive);
      
      // Prevent body scroll when menu is open
      document.body.style.overflow = isActive ? '' : 'hidden';
    }
  }

  closeMobileMenu() {
    const navToggle = document.querySelector('.navbar-toggle');
    const navMenu = document.querySelector('.navbar-menu');
    
    if (navToggle && navMenu) {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  setupActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const targetId = entry.target.id;
          const activeLink = document.querySelector(`.nav-link[href="#${targetId}"]`);
          
          // Remove active class from all links
          navLinks.forEach(link => link.classList.remove('active'));
          
          // Add active class to current link
          if (activeLink) {
            activeLink.classList.add('active');
          }
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '-100px 0px -50% 0px'
    });

    sections.forEach(section => observer.observe(section));
  }

  smoothScrollTo(target) {
    const element = target === '#' ? document.body : document.querySelector(target);
    if (element) {
      const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
      const targetPosition = target === '#' ? 0 : element.offsetTop - headerHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }

  // =================================================================
  // Workshop Filter Methods
  // =================================================================

  filterWorkshops(searchTerm = '', category = 'all') {
    const workshopCards = document.querySelectorAll('.workshop-card');
    let visibleCount = 0;

    workshopCards.forEach(card => {
      const title = card.querySelector('.workshop-title')?.textContent.toLowerCase() || '';
      const description = card.querySelector('.workshop-description')?.textContent.toLowerCase() || '';
      const cardCategory = card.dataset.category || '';
      
      const matchesSearch = !searchTerm || 
        title.includes(searchTerm.toLowerCase()) || 
        description.includes(searchTerm.toLowerCase());
      
      const matchesCategory = category === 'all' || cardCategory === category;
      
      if (matchesSearch && matchesCategory) {
        this.showWorkshopCard(card);
        visibleCount++;
      } else {
        this.hideWorkshopCard(card);
      }
    });

    // Update results count or show no results message
    this.updateFilterResults(visibleCount);
  }

  setActiveFilter(activeTab) {
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => tab.classList.remove('active'));
    activeTab.classList.add('active');
  }

  getCurrentFilter() {
    const activeTab = document.querySelector('.filter-tab.active');
    return activeTab?.dataset.filter || 'all';
  }

  showWorkshopCard(card) {
    card.style.display = '';
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    // Animate in
    requestAnimationFrame(() => {
      card.style.transition = 'all 0.3s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });
  }

  hideWorkshopCard(card) {
    card.style.transition = 'all 0.3s ease';
    card.style.opacity = '0';
    card.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
      card.style.display = 'none';
    }, 300);
  }

  updateFilterResults(count) {
    // Could add a results counter or no results message
    const resultsContainer = document.querySelector('.filter-results');
    if (resultsContainer) {
      resultsContainer.textContent = count === 0 ? 'No workshops found' : `${count} workshops found`;
    }
  }

  setupWorkshopCardInteractions(card) {
    // Hover effects
    card.addEventListener('mouseenter', () => {
      this.onWorkshopCardHover(card, true);
    });

    card.addEventListener('mouseleave', () => {
      this.onWorkshopCardHover(card, false);
    });

    // Click tracking
    card.addEventListener('click', (e) => {
      if (!e.target.closest('button')) {
        this.onWorkshopCardClick(card);
      }
    });
  }

  onWorkshopCardHover(card, isHover) {
    const image = card.querySelector('.workshop-image i');
    if (image) {
      if (isHover) {
        image.style.transform = 'scale(1.1) rotate(5deg)';
      } else {
        image.style.transform = 'scale(1) rotate(0deg)';
      }
    }
  }

  onWorkshopCardClick(card) {
    const title = card.querySelector('.workshop-title')?.textContent;
    console.log(`Clicked on workshop: ${title}`);
    // Here you would navigate to workshop details
  }

  toggleBookmark(btn) {
    const icon = btn.querySelector('i');
    const isBookmarked = icon.classList.contains('fas');
    
    if (isBookmarked) {
      icon.classList.remove('fas');
      icon.classList.add('far');
      btn.setAttribute('aria-pressed', 'false');
      this.showToast('Bookmark removed');
    } else {
      icon.classList.remove('far');
      icon.classList.add('fas');
      btn.setAttribute('aria-pressed', 'true');
      this.showToast('Workshop bookmarked');
    }
    
    // Add animation
    btn.style.transform = 'scale(1.2)';
    setTimeout(() => {
      btn.style.transform = 'scale(1)';
    }, 150);
  }

  loadMoreWorkshops() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    if (loadingIndicator) {
      loadingIndicator.classList.add('active');
    }
    
    if (loadMoreBtn) {
      loadMoreBtn.disabled = true;
      loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    }
    
    // Simulate API call
    setTimeout(() => {
      // Add new workshop cards here
      this.addMoreWorkshops();
      
      if (loadingIndicator) {
        loadingIndicator.classList.remove('active');
      }
      
      if (loadMoreBtn) {
        loadMoreBtn.disabled = false;
        loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Load More Workshops';
      }
    }, 2000);
  }

  addMoreWorkshops() {
    // This would typically fetch data from an API
    // For demo purposes, we'll just show a message
    this.showToast('More workshops loaded!');
  }

  // =================================================================
  // Statistics Animation
  // =================================================================

  initializeIntersectionObserver() {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '0px 0px -100px 0px'
    };

    // Animate statistics when they come into view
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    if (statNumbers.length > 0) {
      const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            const target = parseInt(entry.target.dataset.count);
            animateNumber(entry.target, target);
            entry.target.classList.add('animated');
          }
        });
      }, observerOptions);

      statNumbers.forEach(stat => statsObserver.observe(stat));
    }

    // Animate workshop cards when they come into view
    const workshopCards = document.querySelectorAll('.workshop-card');
    if (workshopCards.length > 0) {
      const cardsObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
            }, index * 100); // Stagger animation
          }
        });
      }, observerOptions);

      workshopCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        cardsObserver.observe(card);
      });
    }
  }

  // =================================================================
  // Chart Initialization
  // =================================================================

  initializeComponents() {
    this.initializeChart();
    this.setupChartFilters();
  }

  initializeChart() {
    const canvas = document.getElementById('participationChart');
    if (!canvas) return;

    // Simple chart implementation (in a real app, you'd use Chart.js or similar)
    const ctx = canvas.getContext('2d');
    this.drawChart(ctx, canvas.width, canvas.height);
  }

  drawChart(ctx, width, height) {
    // Simple line chart drawing
    const data = [120, 150, 180, 220, 280, 320, 350, 380, 420, 450, 480, 520];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const padding = 60;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const valueRange = maxValue - minValue;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    
    // Vertical grid lines
    for (let i = 0; i < data.length; i++) {
      const x = padding + (chartWidth / (data.length - 1)) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }
    
    // Draw data line
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((value, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      const y = height - padding - ((value - minValue) / valueRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw data points
    ctx.fillStyle = '#2563eb';
    data.forEach((value, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      const y = height - padding - ((value - minValue) / valueRange) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Draw labels
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    months.forEach((month, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      ctx.fillText(month, x, height - padding + 20);
    });
  }

  setupChartFilters() {
    const chartFilters = document.querySelectorAll('.chart-filter');
    
    chartFilters.forEach(filter => {
      filter.addEventListener('click', () => {
        // Remove active class from all filters
        chartFilters.forEach(f => f.classList.remove('active'));
        
        // Add active class to clicked filter
        filter.classList.add('active');
        
        // Update chart data based on selected period
        this.updateChartData(filter.dataset.period);
      });
    });
  }

  updateChartData(period) {
    console.log(`Updating chart for period: ${period}`);
    // In a real application, you would fetch new data and redraw the chart
    this.showToast(`Chart updated for ${period}`);
  }

  // =================================================================
  // Accessibility Features
  // =================================================================

  handleAccessibility() {
    // Focus management
    this.setupFocusManagement();
    
    // Keyboard navigation
    this.setupKeyboardShortcuts();
    
    // ARIA attributes
    this.setupARIAAttributes();
  }

  setupFocusManagement() {
    // Focus visible polyfill for better keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // ESC key to close mobile menu or modals
      if (e.key === 'Escape') {
        this.closeMobileMenu();
        this.closeModals();
      }
      
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('workshop-search');
        if (searchInput) {
          searchInput.focus();
        }
      }
    });
  }

  setupARIAAttributes() {
    // Ensure all interactive elements have proper ARIA attributes
    const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    buttons.forEach(button => {
      if (!button.textContent.trim()) {
        console.warn('Button without accessible text:', button);
      }
    });
  }

  handleKeyboardNavigation(e) {
    // Additional keyboard navigation logic
    const focusableElements = document.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    
    if (e.key === 'Tab') {
      // Custom tab navigation if needed
    }
  }

  // =================================================================
  // Performance Optimization
  // =================================================================

  setupLazyLoading() {
    // Lazy load images if any
    const images = document.querySelectorAll('img[data-src]');
    
    if (images.length > 0) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    }
  }

  preloadCriticalResources() {
    // Preload critical resources for better performance
    const criticalResources = [
      // Add URLs of critical resources here
    ];
    
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = 'fetch';
      document.head.appendChild(link);
    });
  }

  // =================================================================
  // Utility Methods
  // =================================================================

  initAnimations() {
    // Initialize any additional animations
    this.setupScrollAnimations();
  }

  setupScrollAnimations() {
    // Add scroll-triggered animations
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    if (animatedElements.length > 0) {
      const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const animation = entry.target.dataset.animate;
            entry.target.classList.add(`animate-${animation}`);
          }
        });
      }, { threshold: 0.1 });

      animatedElements.forEach(el => animationObserver.observe(el));
    }
  }

  handleResize() {
    // Handle window resize events
    this.closeMobileMenu();
    
    // Redraw chart if canvas exists
    const canvas = document.getElementById('participationChart');
    if (canvas) {
      this.initializeChart();
    }
  }

  validateForm(form) {
    // Basic form validation
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        this.showFieldError(field, 'This field is required');
        isValid = false;
      } else {
        this.clearFieldError(field);
      }
    });

    return isValid;
  }

  showFieldError(field, message) {
    field.classList.add('error');
    
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'field-error';
      field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
  }

  clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  showToast(message, type = 'info') {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${type === 'error' ? '#ef4444' : '#10b981'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  closeModals() {
    // Close any open modals
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
      modal.classList.remove('active');
    });
  }

  toggleDropdown(dropdown) {
    const menu = dropdown.querySelector('.dropdown-menu');
    const isOpen = menu.style.opacity === '1';
    
    if (isOpen) {
      menu.style.opacity = '0';
      menu.style.visibility = 'hidden';
    } else {
      menu.style.opacity = '1';
      menu.style.visibility = 'visible';
    }
  }
}

// =================================================================
// Initialize Application
// =================================================================

// Initialize the application when the script loads
const app = new FOSSEEWorkshop();

// Export for potential use in other scripts
window.FOSSEEWorkshop = FOSSEEWorkshop;
