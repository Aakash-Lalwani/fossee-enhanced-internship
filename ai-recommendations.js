/**
 * AI Recommendation Engine for FOSSEE Workshops
 * Features: Personalized suggestions, ML-based filtering, user behavior analysis
 */

class AIRecommendationEngine {
  constructor() {
    this.userProfile = this.loadUserProfile();
    this.behaviorData = this.loadBehaviorData();
    this.workshopData = [];
    this.modelWeights = {
      skillMatch: 0.3,
      interestAlignment: 0.25,
      difficultyFit: 0.2,
      completionRate: 0.15,
      timePreference: 0.1
    };
    
    this.init();
  }

  async init() {
    await this.loadWorkshopData();
    this.setupBehaviorTracking();
    this.generateRecommendations();
  }

  // User profiling and behavior analysis
  loadUserProfile() {
    const defaultProfile = {
      skills: [],
      interests: [],
      experienceLevel: 'beginner',
      preferredDuration: 'medium',
      completedWorkshops: [],
      timeSlotPreferences: [],
      learningStyle: 'visual'
    };

    const stored = localStorage.getItem('fossee-user-profile');
    return stored ? { ...defaultProfile, ...JSON.parse(stored) } : defaultProfile;
  }

  saveUserProfile() {
    localStorage.setItem('fossee-user-profile', JSON.stringify(this.userProfile));
  }

  loadBehaviorData() {
    const defaultBehavior = {
      clickPatterns: {},
      searchQueries: [],
      sessionDuration: [],
      pageViews: {},
      scrollDepth: {},
      interactionHeatmap: {}
    };

    const stored = localStorage.getItem('fossee-behavior-data');
    return stored ? { ...defaultBehavior, ...JSON.parse(stored) } : defaultBehavior;
  }

  saveBehaviorData() {
    localStorage.setItem('fossee-behavior-data', JSON.stringify(this.behaviorData));
  }

  // Machine Learning Components
  async loadWorkshopData() {
    // Simulated workshop data with ML features
    this.workshopData = [
      {
        id: 1,
        title: "Python for Data Science",
        skills: ["python", "data-analysis", "pandas", "numpy"],
        difficulty: "intermediate",
        duration: "6 hours",
        category: "data-science",
        prerequisites: ["basic-python"],
        rating: 4.8,
        completionRate: 0.85,
        features: [0.8, 0.6, 0.7, 0.9, 0.5] // Encoded features for ML
      },
      {
        id: 2,
        title: "Machine Learning Fundamentals",
        skills: ["machine-learning", "python", "scikit-learn"],
        difficulty: "advanced",
        duration: "8 hours",
        category: "ai-ml",
        prerequisites: ["python", "statistics"],
        rating: 4.9,
        completionRate: 0.78,
        features: [0.9, 0.8, 0.9, 0.8, 0.7]
      },
      {
        id: 3,
        title: "Web Development with JavaScript",
        skills: ["javascript", "html", "css", "react"],
        difficulty: "beginner",
        duration: "4 hours",
        category: "web-development",
        prerequisites: [],
        rating: 4.6,
        completionRate: 0.92,
        features: [0.6, 0.7, 0.4, 0.9, 0.8]
      }
    ];
  }

  // Recommendation Algorithms
  generateRecommendations() {
    const recommendations = this.workshopData.map(workshop => {
      const score = this.calculateRecommendationScore(workshop);
      return { ...workshop, recommendationScore: score };
    }).sort((a, b) => b.recommendationScore - a.recommendationScore);

    this.displayRecommendations(recommendations.slice(0, 3));
    return recommendations;
  }

  calculateRecommendationScore(workshop) {
    const skillScore = this.calculateSkillMatch(workshop);
    const interestScore = this.calculateInterestAlignment(workshop);
    const difficultyScore = this.calculateDifficultyFit(workshop);
    const completionScore = workshop.completionRate;
    const timeScore = this.calculateTimePreference(workshop);

    return (
      skillScore * this.modelWeights.skillMatch +
      interestScore * this.modelWeights.interestAlignment +
      difficultyScore * this.modelWeights.difficultyFit +
      completionScore * this.modelWeights.completionRate +
      timeScore * this.modelWeights.timePreference
    );
  }

  calculateSkillMatch(workshop) {
    const userSkills = this.userProfile.skills;
    const workshopSkills = workshop.skills;
    
    if (userSkills.length === 0) return 0.5; // Neutral for new users
    
    const intersection = userSkills.filter(skill => 
      workshopSkills.some(ws => ws.toLowerCase().includes(skill.toLowerCase()))
    );
    
    return intersection.length / Math.max(userSkills.length, workshopSkills.length);
  }

  calculateInterestAlignment(workshop) {
    const userInterests = this.userProfile.interests;
    const category = workshop.category;
    
    if (userInterests.includes(category)) return 1.0;
    
    // Semantic similarity based on category relationships
    const categoryMap = {
      'data-science': ['ai-ml', 'analytics'],
      'ai-ml': ['data-science', 'automation'],
      'web-development': ['frontend', 'backend', 'fullstack']
    };
    
    const relatedCategories = categoryMap[category] || [];
    const hasRelatedInterest = userInterests.some(interest => 
      relatedCategories.includes(interest)
    );
    
    return hasRelatedInterest ? 0.7 : 0.3;
  }

  calculateDifficultyFit(workshop) {
    const userLevel = this.userProfile.experienceLevel;
    const workshopDifficulty = workshop.difficulty;
    
    const levelMap = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
    const userLevelNum = levelMap[userLevel] || 1;
    const workshopLevelNum = levelMap[workshopDifficulty] || 1;
    
    const difference = Math.abs(userLevelNum - workshopLevelNum);
    return Math.max(0, 1 - (difference * 0.3));
  }

  calculateTimePreference(workshop) {
    const userPreference = this.userProfile.preferredDuration;
    const workshopDuration = this.parseDuration(workshop.duration);
    
    const preferenceMap = {
      'short': { min: 0, max: 3 },
      'medium': { min: 3, max: 6 },
      'long': { min: 6, max: 12 }
    };
    
    const range = preferenceMap[userPreference] || preferenceMap['medium'];
    
    if (workshopDuration >= range.min && workshopDuration <= range.max) {
      return 1.0;
    }
    
    const distance = Math.min(
      Math.abs(workshopDuration - range.min),
      Math.abs(workshopDuration - range.max)
    );
    
    return Math.max(0, 1 - (distance * 0.2));
  }

  parseDuration(duration) {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : 4;
  }

  // Behavior Tracking
  setupBehaviorTracking() {
    this.trackClicks();
    this.trackScrollDepth();
    this.trackSessionTime();
    this.trackSearchBehavior();
  }

  trackClicks() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-workshop-id]');
      if (target) {
        const workshopId = target.dataset.workshopId;
        this.behaviorData.clickPatterns[workshopId] = 
          (this.behaviorData.clickPatterns[workshopId] || 0) + 1;
        this.saveBehaviorData();
        this.updateUserProfile(workshopId);
      }
    });
  }

  trackScrollDepth() {
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      maxScroll = Math.max(maxScroll, scrollPercent);
      this.behaviorData.scrollDepth[window.location.pathname] = maxScroll;
    });
  }

  trackSessionTime() {
    const sessionStart = Date.now();
    window.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - sessionStart;
      this.behaviorData.sessionDuration.push(sessionDuration);
      this.saveBehaviorData();
    });
  }

  trackSearchBehavior() {
    const searchInput = document.querySelector('#search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length > 2) {
          this.behaviorData.searchQueries.push({
            query,
            timestamp: Date.now()
          });
          this.extractSearchIntents(query);
        }
      });
    }
  }

  extractSearchIntents(query) {
    const skillKeywords = {
      'python': ['python', 'py', 'programming'],
      'javascript': ['javascript', 'js', 'web'],
      'data-science': ['data', 'analytics', 'science'],
      'machine-learning': ['ml', 'ai', 'artificial', 'learning']
    };

    Object.entries(skillKeywords).forEach(([skill, keywords]) => {
      if (keywords.some(keyword => query.includes(keyword))) {
        if (!this.userProfile.interests.includes(skill)) {
          this.userProfile.interests.push(skill);
        }
      }
    });

    this.saveUserProfile();
  }

  updateUserProfile(workshopId) {
    const workshop = this.workshopData.find(w => w.id == workshopId);
    if (workshop) {
      // Update skills based on interaction
      workshop.skills.forEach(skill => {
        if (!this.userProfile.skills.includes(skill)) {
          this.userProfile.skills.push(skill);
        }
      });

      // Update interests
      if (!this.userProfile.interests.includes(workshop.category)) {
        this.userProfile.interests.push(workshop.category);
      }

      this.saveUserProfile();
      this.generateRecommendations(); // Refresh recommendations
    }
  }

  // Display and UI Integration
  displayRecommendations(recommendations) {
    const container = document.querySelector('#ai-recommendations');
    if (!container) return;

    container.innerHTML = `
      <div class="ai-recommendations">
        <h3><i class="fas fa-robot"></i> AI Recommended for You</h3>
        <div class="recommendation-grid">
          ${recommendations.map(workshop => this.createRecommendationCard(workshop)).join('')}
        </div>
      </div>
    `;
  }

  createRecommendationCard(workshop) {
    const confidence = Math.round(workshop.recommendationScore * 100);
    const reasons = this.getRecommendationReasons(workshop);

    return `
      <div class="recommendation-card" data-workshop-id="${workshop.id}">
        <div class="confidence-badge">${confidence}% match</div>
        <h4>${workshop.title}</h4>
        <div class="workshop-meta">
          <span class="difficulty ${workshop.difficulty}">${workshop.difficulty}</span>
          <span class="duration">${workshop.duration}</span>
          <span class="rating">★ ${workshop.rating}</span>
        </div>
        <div class="recommendation-reasons">
          <h5>Why this workshop?</h5>
          <ul>
            ${reasons.map(reason => `<li>${reason}</li>`).join('')}
          </ul>
        </div>
        <button class="btn btn-primary" onclick="window.aiEngine.enrollWorkshop(${workshop.id})">
          Enroll Now
        </button>
      </div>
    `;
  }

  getRecommendationReasons(workshop) {
    const reasons = [];
    
    if (this.calculateSkillMatch(workshop) > 0.7) {
      reasons.push("Matches your existing skills");
    }
    
    if (this.calculateInterestAlignment(workshop) > 0.8) {
      reasons.push("Aligns with your interests");
    }
    
    if (workshop.completionRate > 0.8) {
      reasons.push("High completion rate among students");
    }
    
    if (workshop.rating > 4.7) {
      reasons.push("Highly rated by participants");
    }

    return reasons.length > 0 ? reasons : ["Great for expanding your skills"];
  }

  // Public API
  enrollWorkshop(workshopId) {
    const workshop = this.workshopData.find(w => w.id == workshopId);
    if (workshop) {
      // Track enrollment
      this.userProfile.completedWorkshops.push(workshopId);
      this.saveUserProfile();
      
      // Show enrollment modal or redirect
      this.showEnrollmentModal(workshop);
    }
  }

  showEnrollmentModal(workshop) {
    const modal = document.createElement('div');
    modal.className = 'enrollment-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Enroll in ${workshop.title}</h2>
        <p>Duration: ${workshop.duration}</p>
        <p>Difficulty: ${workshop.difficulty}</p>
        <form class="enrollment-form">
          <input type="text" placeholder="Full Name" required>
          <input type="email" placeholder="Email" required>
          <input type="tel" placeholder="Phone Number" required>
          <button type="submit" class="btn btn-primary">Complete Enrollment</button>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close').onclick = () => modal.remove();
    modal.onclick = (e) => e.target === modal && modal.remove();
  }

  // Advanced Features
  getPersonalizedLearningPath() {
    const userSkills = this.userProfile.skills;
    const userLevel = this.userProfile.experienceLevel;
    
    // Create a learning progression based on skills and difficulty
    const path = this.workshopData
      .filter(workshop => !this.userProfile.completedWorkshops.includes(workshop.id))
      .sort((a, b) => {
        const aFit = this.calculateDifficultyFit(a);
        const bFit = this.calculateDifficultyFit(b);
        return bFit - aFit;
      });
      
    return path.slice(0, 5); // Top 5 workshops in learning path
  }

  exportUserProfile() {
    const exportData = {
      profile: this.userProfile,
      behavior: this.behaviorData,
      recommendations: this.generateRecommendations().slice(0, 10),
      learningPath: this.getPersonalizedLearningPath(),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fossee-learning-profile.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Initialize AI Recommendation Engine
window.aiEngine = new AIRecommendationEngine();
