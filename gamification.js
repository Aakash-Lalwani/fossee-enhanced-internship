/**
 * Gamification System for FOSSEE Workshops
 * Features: Achievement system, progress tracking, leaderboards, badges, rewards
 */

class GamificationEngine {
  constructor() {
    this.userProfile = this.loadUserProfile();
    this.achievements = new Map();
    this.badges = new Map();
    this.leaderboards = new Map();
    this.quests = new Map();
    this.streaks = new Map();
    this.levelSystem = null;
    this.rewardSystem = null;
    this.socialFeatures = null;
    
    this.init();
  }

  async init() {
    this.setupAchievementSystem();
    this.setupBadgeSystem();
    this.setupLevelSystem();
    this.setupLeaderboards();
    this.setupQuestSystem();
    this.setupStreakSystem();
    this.setupRewardSystem();
    this.setupSocialFeatures();
    this.createGamificationUI();
    this.startProgressTracking();
  }

  // User Profile Management
  loadUserProfile() {
    const defaultProfile = {
      userId: this.generateUserId(),
      username: localStorage.getItem('fossee-username') || 'Anonymous Learner',
      level: 1,
      experience: 0,
      totalPoints: 0,
      achievements: [],
      badges: [],
      completedWorkshops: [],
      currentStreak: 0,
      longestStreak: 0,
      lastActivity: null,
      preferences: {
        showNotifications: true,
        publicProfile: false,
        shareProgress: true
      },
      stats: {
        workshopsCompleted: 0,
        skillsLearned: 0,
        projectsCreated: 0,
        helpGiven: 0,
        certificatesEarned: 0
      }
    };

    const stored = localStorage.getItem('fossee-gamification-profile');
    return stored ? { ...defaultProfile, ...JSON.parse(stored) } : defaultProfile;
  }

  saveUserProfile() {
    localStorage.setItem('fossee-gamification-profile', JSON.stringify(this.userProfile));
  }

  generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Achievement System
  setupAchievementSystem() {
    this.achievements = new Map([
      // Learning Achievements
      ['first_workshop', {
        id: 'first_workshop',
        name: 'Getting Started',
        description: 'Complete your first workshop',
        icon: '🎯',
        points: 100,
        rarity: 'common',
        category: 'learning',
        condition: () => this.userProfile.stats.workshopsCompleted >= 1
      }],
      
      ['workshop_streak_5', {
        id: 'workshop_streak_5',
        name: 'Consistent Learner',
        description: 'Complete workshops for 5 days in a row',
        icon: '🔥',
        points: 250,
        rarity: 'uncommon',
        category: 'dedication',
        condition: () => this.userProfile.currentStreak >= 5
      }],
      
      ['skill_master', {
        id: 'skill_master',
        name: 'Skill Master',
        description: 'Learn 5 different programming skills',
        icon: '🧠',
        points: 500,
        rarity: 'rare',
        category: 'mastery',
        condition: () => this.userProfile.stats.skillsLearned >= 5
      }],
      
      ['speed_learner', {
        id: 'speed_learner',
        name: 'Speed Learner',
        description: 'Complete 3 workshops in one day',
        icon: '⚡',
        points: 300,
        rarity: 'uncommon',
        category: 'speed',
        condition: () => this.checkDailyWorkshopCount() >= 3
      }],
      
      ['helper', {
        id: 'helper',
        name: 'Community Helper',
        description: 'Help 10 other learners in the community',
        icon: '🤝',
        points: 400,
        rarity: 'rare',
        category: 'community',
        condition: () => this.userProfile.stats.helpGiven >= 10
      }],
      
      ['perfectionist', {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Complete 5 workshops with 100% score',
        icon: '💯',
        points: 600,
        rarity: 'epic',
        category: 'excellence',
        condition: () => this.checkPerfectScores() >= 5
      }],
      
      ['night_owl', {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Complete a workshop between 10 PM and 6 AM',
        icon: '🦉',
        points: 150,
        rarity: 'common',
        category: 'time',
        condition: () => this.checkNightActivity()
      }],
      
      ['early_bird', {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Complete a workshop before 7 AM',
        icon: '🐦',
        points: 150,
        rarity: 'common',
        category: 'time',
        condition: () => this.checkEarlyActivity()
      }],
      
      ['social_butterfly', {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Join 5 study groups',
        icon: '🦋',
        points: 200,
        rarity: 'uncommon',
        category: 'social',
        condition: () => this.userProfile.stats.studyGroupsJoined >= 5
      }],
      
      ['knowledge_seeker', {
        id: 'knowledge_seeker',
        name: 'Knowledge Seeker',
        description: 'Complete workshops in 3 different categories',
        icon: '📚',
        points: 350,
        rarity: 'rare',
        category: 'exploration',
        condition: () => this.checkCategoryDiversity() >= 3
      }]
    ]);
  }

  // Badge System
  setupBadgeSystem() {
    this.badges = new Map([
      ['python_beginner', {
        id: 'python_beginner',
        name: 'Python Beginner',
        description: 'Completed Python basics workshop',
        icon: '🐍',
        color: '#3776ab',
        category: 'skill'
      }],
      
      ['javascript_ninja', {
        id: 'javascript_ninja',
        name: 'JavaScript Ninja',
        description: 'Mastered JavaScript fundamentals',
        icon: '⚔️',
        color: '#f7df1e',
        category: 'skill'
      }],
      
      ['data_scientist', {
        id: 'data_scientist',
        name: 'Data Scientist',
        description: 'Completed data science track',
        icon: '📊',
        color: '#ff6b6b',
        category: 'track'
      }],
      
      ['web_developer', {
        id: 'web_developer',
        name: 'Web Developer',
        description: 'Built your first web application',
        icon: '🌐',
        color: '#4ecdc4',
        category: 'project'
      }],
      
      ['ai_enthusiast', {
        id: 'ai_enthusiast',
        name: 'AI Enthusiast',
        description: 'Explored machine learning concepts',
        icon: '🤖',
        color: '#45b7d1',
        category: 'specialization'
      }],
      
      ['mentor', {
        id: 'mentor',
        name: 'Mentor',
        description: 'Helped 25+ fellow learners',
        icon: '🎓',
        color: '#96ceb4',
        category: 'community'
      }],
      
      ['innovator', {
        id: 'innovator',
        name: 'Innovator',
        description: 'Created an original project',
        icon: '💡',
        color: '#feca57',
        category: 'creativity'
      }],
      
      ['collaborator', {
        id: 'collaborator',
        name: 'Collaborator',
        description: 'Worked on 5 team projects',
        icon: '👥',
        color: '#ff9ff3',
        category: 'teamwork'
      }]
    ]);
  }

  // Level System
  setupLevelSystem() {
    this.levelSystem = {
      levels: [
        { level: 1, minExp: 0, title: 'Curious Beginner', benefits: ['Access to basic workshops'] },
        { level: 2, minExp: 500, title: 'Eager Learner', benefits: ['Unlock intermediate workshops', 'Custom profile badge'] },
        { level: 3, minExp: 1200, title: 'Skilled Practitioner', benefits: ['Access to advanced workshops', 'Priority support'] },
        { level: 4, minExp: 2500, title: 'Expert Developer', benefits: ['Exclusive masterclasses', 'Mentor opportunities'] },
        { level: 5, minExp: 5000, title: 'Knowledge Master', benefits: ['Workshop creation tools', 'Special recognition'] },
        { level: 6, minExp: 10000, title: 'Community Leader', benefits: ['Lead study groups', 'Beta features access'] },
        { level: 7, minExp: 20000, title: 'Innovation Pioneer', benefits: ['Research collaborations', 'Conference invites'] },
        { level: 8, minExp: 40000, title: 'FOSSEE Champion', benefits: ['All-access pass', 'Lifetime benefits'] }
      ],
      
      calculateLevel: (experience) => {
        let level = 1;
        for (const levelData of this.levelSystem.levels) {
          if (experience >= levelData.minExp) {
            level = levelData.level;
          } else {
            break;
          }
        }
        return level;
      },
      
      getProgressToNextLevel: (experience) => {
        const currentLevel = this.levelSystem.calculateLevel(experience);
        const nextLevelData = this.levelSystem.levels.find(l => l.level === currentLevel + 1);
        
        if (!nextLevelData) return { progress: 100, pointsNeeded: 0 };
        
        const currentLevelData = this.levelSystem.levels.find(l => l.level === currentLevel);
        const pointsInCurrentLevel = experience - currentLevelData.minExp;
        const pointsNeededForNext = nextLevelData.minExp - currentLevelData.minExp;
        
        return {
          progress: (pointsInCurrentLevel / pointsNeededForNext) * 100,
          pointsNeeded: nextLevelData.minExp - experience
        };
      }
    };
  }

  // Quest System
  setupQuestSystem() {
    this.quests = new Map([
      ['daily_learner', {
        id: 'daily_learner',
        name: 'Daily Learning Challenge',
        description: 'Complete at least one learning activity today',
        type: 'daily',
        progress: 0,
        target: 1,
        reward: { points: 50, badge: null },
        resetDaily: true
      }],
      
      ['weekly_warrior', {
        id: 'weekly_warrior',
        name: 'Weekly Learning Warrior',
        description: 'Complete 5 workshops this week',
        type: 'weekly',
        progress: 0,
        target: 5,
        reward: { points: 300, badge: 'weekly_champion' },
        resetWeekly: true
      }],
      
      ['skill_explorer', {
        id: 'skill_explorer',
        name: 'Skill Explorer',
        description: 'Try workshops from 3 different categories',
        type: 'ongoing',
        progress: 0,
        target: 3,
        reward: { points: 200, badge: 'explorer' }
      }],
      
      ['social_learner', {
        id: 'social_learner',
        name: 'Social Learner',
        description: 'Participate in community discussions 10 times',
        type: 'ongoing',
        progress: 0,
        target: 10,
        reward: { points: 250, badge: 'social_learner' }
      }]
    ]);
  }

  // Leaderboard System
  setupLeaderboards() {
    this.leaderboards = new Map([
      ['global_points', {
        id: 'global_points',
        name: 'Global Points Leaderboard',
        description: 'Top learners by total points earned',
        type: 'global',
        period: 'all-time',
        entries: []
      }],
      
      ['monthly_active', {
        id: 'monthly_active',
        name: 'Monthly Most Active',
        description: 'Most active learners this month',
        type: 'time-based',
        period: 'monthly',
        entries: []
      }],
      
      ['streak_champions', {
        id: 'streak_champions',
        name: 'Streak Champions',
        description: 'Longest learning streaks',
        type: 'streak',
        period: 'all-time',
        entries: []
      }],
      
      ['workshop_completions', {
        id: 'workshop_completions',
        name: 'Workshop Completions',
        description: 'Most workshops completed',
        type: 'count',
        period: 'all-time',
        entries: []
      }]
    ]);
    
    this.updateLeaderboards();
  }

  // Streak System
  setupStreakSystem() {
    this.streaks = new Map([
      ['daily_learning', {
        id: 'daily_learning',
        name: 'Daily Learning Streak',
        description: 'Consecutive days with learning activity',
        current: this.userProfile.currentStreak,
        longest: this.userProfile.longestStreak,
        lastActivity: this.userProfile.lastActivity,
        multiplier: 1.0
      }],
      
      ['workshop_completion', {
        id: 'workshop_completion',
        name: 'Workshop Completion Streak',
        description: 'Consecutive workshops completed successfully',
        current: 0,
        longest: 0,
        multiplier: 1.2
      }]
    ]);
  }

  // Reward System
  setupRewardSystem() {
    this.rewardSystem = {
      pointsMultiplier: 1.0,
      activeBoosts: [],
      
      rewards: new Map([
        ['workshop_completion', { basePoints: 100, bonusPoints: 0 }],
        ['perfect_score', { basePoints: 50, bonusPoints: 50 }],
        ['help_community', { basePoints: 25, bonusPoints: 0 }],
        ['daily_activity', { basePoints: 20, bonusPoints: 0 }],
        ['streak_bonus', { basePoints: 0, bonusPoints: 10 }]
      ]),
      
      calculateReward: (action, context = {}) => {
        const reward = this.rewardSystem.rewards.get(action);
        if (!reward) return 0;
        
        let points = reward.basePoints + reward.bonusPoints;
        
        // Apply multipliers
        points *= this.rewardSystem.pointsMultiplier;
        
        // Apply streak bonuses
        if (this.userProfile.currentStreak > 0) {
          const streakBonus = Math.min(this.userProfile.currentStreak * 0.1, 2.0);
          points *= (1 + streakBonus);
        }
        
        // Apply level bonuses
        const levelBonus = (this.userProfile.level - 1) * 0.05;
        points *= (1 + levelBonus);
        
        return Math.round(points);
      }
    };
  }

  // Social Features
  setupSocialFeatures() {
    this.socialFeatures = {
      friends: [],
      studyGroups: [],
      challenges: [],
      
      shareAchievement: (achievementId) => {
        const achievement = this.achievements.get(achievementId);
        if (achievement && this.userProfile.preferences.shareProgress) {
          this.createSocialShare('achievement', achievement);
        }
      },
      
      challengeFriend: (friendId, challengeType) => {
        this.createChallenge(friendId, challengeType);
      },
      
      joinStudyGroup: (groupId) => {
        this.socialFeatures.studyGroups.push(groupId);
        this.awardPoints('join_study_group', 25);
      }
    };
  }

  // UI Creation
  createGamificationUI() {
    const container = document.createElement('div');
    container.className = 'gamification-container';
    container.innerHTML = `
      <div class="gamification-header">
        <h2><i class="fas fa-trophy"></i> Your Learning Journey</h2>
        <button class="gamification-toggle" id="toggle-gamification">
          <i class="fas fa-chevron-down"></i>
        </button>
      </div>
      
      <div class="gamification-content" id="gamification-content">
        <div class="user-progress-overview">
          <div class="user-avatar">
            <div class="avatar-circle">
              <span class="level-badge">${this.userProfile.level}</span>
              <i class="fas fa-user"></i>
            </div>
            <h3>${this.userProfile.username}</h3>
            <p class="user-title">${this.getCurrentTitle()}</p>
          </div>
          
          <div class="progress-stats">
            <div class="stat-item">
              <div class="stat-value">${this.userProfile.totalPoints}</div>
              <div class="stat-label">Total Points</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${this.userProfile.currentStreak}</div>
              <div class="stat-label">Current Streak</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${this.userProfile.stats.workshopsCompleted}</div>
              <div class="stat-label">Workshops</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${this.userProfile.achievements.length}</div>
              <div class="stat-label">Achievements</div>
            </div>
          </div>
          
          <div class="level-progress">
            <div class="level-info">
              <span>Level ${this.userProfile.level}</span>
              <span class="next-level">Next: Level ${this.userProfile.level + 1}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" id="level-progress-fill"></div>
            </div>
            <div class="progress-text" id="progress-text"></div>
          </div>
        </div>
        
        <div class="gamification-tabs">
          <button class="tab-button active" data-tab="achievements">
            <i class="fas fa-trophy"></i> Achievements
          </button>
          <button class="tab-button" data-tab="badges">
            <i class="fas fa-medal"></i> Badges
          </button>
          <button class="tab-button" data-tab="quests">
            <i class="fas fa-tasks"></i> Quests
          </button>
          <button class="tab-button" data-tab="leaderboard">
            <i class="fas fa-crown"></i> Leaderboard
          </button>
        </div>
        
        <div class="tab-content">
          <div class="tab-panel active" id="achievements-panel">
            <div class="achievements-grid" id="achievements-grid">
              <!-- Achievements will be populated here -->
            </div>
          </div>
          
          <div class="tab-panel" id="badges-panel">
            <div class="badges-collection" id="badges-collection">
              <!-- Badges will be populated here -->
            </div>
          </div>
          
          <div class="tab-panel" id="quests-panel">
            <div class="active-quests" id="active-quests">
              <!-- Quests will be populated here -->
            </div>
          </div>
          
          <div class="tab-panel" id="leaderboard-panel">
            <div class="leaderboard-selector">
              <select id="leaderboard-type">
                <option value="global_points">Global Points</option>
                <option value="monthly_active">Monthly Active</option>
                <option value="streak_champions">Streak Champions</option>
                <option value="workshop_completions">Workshop Completions</option>
              </select>
            </div>
            <div class="leaderboard-list" id="leaderboard-list">
              <!-- Leaderboard will be populated here -->
            </div>
          </div>
        </div>
      </div>
      
      <div class="achievement-notification" id="achievement-notification">
        <!-- Achievement notifications will appear here -->
      </div>
    `;

    // Insert into main content
    const mainContent = document.querySelector('.main-content') || document.body;
    mainContent.appendChild(container);

    this.setupGamificationHandlers();
    this.updateUI();
  }

  setupGamificationHandlers() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Toggle gamification panel
    document.getElementById('toggle-gamification')?.addEventListener('click', () => {
      const content = document.getElementById('gamification-content');
      const icon = document.querySelector('#toggle-gamification i');
      
      content.classList.toggle('collapsed');
      icon.className = content.classList.contains('collapsed') 
        ? 'fas fa-chevron-up' 
        : 'fas fa-chevron-down';
    });

    // Leaderboard selector
    document.getElementById('leaderboard-type')?.addEventListener('change', (e) => {
      this.displayLeaderboard(e.target.value);
    });
  }

  // Progress Tracking
  startProgressTracking() {
    // Track workshop completions
    this.trackWorkshopCompletions();
    
    // Track daily activity
    this.trackDailyActivity();
    
    // Check for achievements periodically
    setInterval(() => {
      this.checkAchievements();
    }, 5000);
    
    // Update streaks daily
    this.updateStreaks();
  }

  trackWorkshopCompletions() {
    // Listen for workshop completion events
    document.addEventListener('workshopCompleted', (event) => {
      const workshop = event.detail;
      this.handleWorkshopCompletion(workshop);
    });
  }

  handleWorkshopCompletion(workshop) {
    // Update stats
    this.userProfile.stats.workshopsCompleted++;
    
    // Award points
    const points = this.rewardSystem.calculateReward('workshop_completion', workshop);
    this.awardPoints('workshop_completion', points);
    
    // Check for perfect score bonus
    if (workshop.score === 100) {
      const bonusPoints = this.rewardSystem.calculateReward('perfect_score');
      this.awardPoints('perfect_score', bonusPoints);
    }
    
    // Update experience
    this.addExperience(150);
    
    // Update streaks
    this.updateWorkshopStreak();
    
    // Check achievements
    this.checkAchievements();
    
    // Update quests
    this.updateQuestProgress('workshop_completion');
    
    this.saveUserProfile();
    this.updateUI();
  }

  // Core Gamification Functions
  awardPoints(reason, points) {
    this.userProfile.totalPoints += points;
    this.showPointsNotification(points, reason);
  }

  addExperience(exp) {
    const oldLevel = this.userProfile.level;
    this.userProfile.experience += exp;
    this.userProfile.level = this.levelSystem.calculateLevel(this.userProfile.experience);
    
    if (this.userProfile.level > oldLevel) {
      this.handleLevelUp(oldLevel, this.userProfile.level);
    }
  }

  handleLevelUp(oldLevel, newLevel) {
    this.showLevelUpNotification(oldLevel, newLevel);
    this.awardPoints('level_up', newLevel * 100);
    
    // Unlock new benefits
    const levelData = this.levelSystem.levels.find(l => l.level === newLevel);
    if (levelData) {
      this.showBenefitsUnlockedNotification(levelData.benefits);
    }
  }

  checkAchievements() {
    this.achievements.forEach((achievement, id) => {
      if (!this.userProfile.achievements.includes(id) && achievement.condition()) {
        this.unlockAchievement(id);
      }
    });
  }

  unlockAchievement(achievementId) {
    const achievement = this.achievements.get(achievementId);
    if (!achievement) return;

    this.userProfile.achievements.push(achievementId);
    this.awardPoints('achievement', achievement.points);
    this.showAchievementNotification(achievement);
    
    // Share if enabled
    if (this.userProfile.preferences.shareProgress) {
      this.socialFeatures.shareAchievement(achievementId);
    }
    
    this.saveUserProfile();
  }

  updateQuestProgress(action, amount = 1) {
    this.quests.forEach((quest, id) => {
      if (this.questApplies(quest, action)) {
        quest.progress = Math.min(quest.progress + amount, quest.target);
        
        if (quest.progress >= quest.target && !quest.completed) {
          this.completeQuest(id);
        }
      }
    });
  }

  questApplies(quest, action) {
    // Define which actions apply to which quests
    const questActions = {
      'daily_learner': ['workshop_completion', 'skill_practice', 'community_participation'],
      'weekly_warrior': ['workshop_completion'],
      'skill_explorer': ['workshop_completion'],
      'social_learner': ['community_participation', 'help_given']
    };
    
    return questActions[quest.id]?.includes(action) || false;
  }

  completeQuest(questId) {
    const quest = this.quests.get(questId);
    if (!quest) return;

    quest.completed = true;
    this.awardPoints('quest_completion', quest.reward.points);
    
    if (quest.reward.badge) {
      this.awardBadge(quest.reward.badge);
    }
    
    this.showQuestCompletionNotification(quest);
  }

  // UI Update Methods
  updateUI() {
    this.updateLevelProgress();
    this.displayAchievements();
    this.displayBadges();
    this.displayQuests();
    this.displayLeaderboard('global_points');
  }

  updateLevelProgress() {
    const progressData = this.levelSystem.getProgressToNextLevel(this.userProfile.experience);
    const progressFill = document.getElementById('level-progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (progressFill) {
      progressFill.style.width = `${progressData.progress}%`;
    }
    
    if (progressText) {
      progressText.textContent = `${progressData.pointsNeeded} points to next level`;
    }
  }

  displayAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;

    grid.innerHTML = Array.from(this.achievements.values()).map(achievement => {
      const isUnlocked = this.userProfile.achievements.includes(achievement.id);
      return `
        <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
          <div class="achievement-icon">${achievement.icon}</div>
          <div class="achievement-info">
            <h4>${achievement.name}</h4>
            <p>${achievement.description}</p>
            <div class="achievement-meta">
              <span class="points">${achievement.points} pts</span>
              <span class="rarity ${achievement.rarity}">${achievement.rarity}</span>
            </div>
          </div>
          ${isUnlocked ? '<div class="achievement-status">✓</div>' : ''}
        </div>
      `;
    }).join('');
  }

  displayBadges() {
    const collection = document.getElementById('badges-collection');
    if (!collection) return;

    collection.innerHTML = Array.from(this.badges.values()).map(badge => {
      const isEarned = this.userProfile.badges.includes(badge.id);
      return `
        <div class="badge-item ${isEarned ? 'earned' : 'not-earned'}">
          <div class="badge-icon" style="color: ${badge.color}">
            ${badge.icon}
          </div>
          <div class="badge-info">
            <h4>${badge.name}</h4>
            <p>${badge.description}</p>
            <span class="badge-category">${badge.category}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  displayQuests() {
    const container = document.getElementById('active-quests');
    if (!container) return;

    container.innerHTML = Array.from(this.quests.values()).map(quest => {
      const progressPercent = (quest.progress / quest.target) * 100;
      const isCompleted = quest.progress >= quest.target;
      
      return `
        <div class="quest-item ${isCompleted ? 'completed' : ''}">
          <div class="quest-header">
            <h4>${quest.name}</h4>
            <span class="quest-type ${quest.type}">${quest.type}</span>
          </div>
          <p>${quest.description}</p>
          <div class="quest-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <span class="progress-text">${quest.progress}/${quest.target}</span>
          </div>
          <div class="quest-reward">
            <i class="fas fa-gift"></i> ${quest.reward.points} points
            ${quest.reward.badge ? `+ ${quest.reward.badge} badge` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  displayLeaderboard(type) {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;

    const leaderboard = this.leaderboards.get(type);
    if (!leaderboard) return;

    // Simulate leaderboard data
    const mockData = this.generateMockLeaderboard(type);
    
    list.innerHTML = mockData.map((entry, index) => `
      <div class="leaderboard-entry ${entry.userId === this.userProfile.userId ? 'current-user' : ''}">
        <div class="rank">
          ${index + 1}
          ${index < 3 ? this.getRankIcon(index) : ''}
        </div>
        <div class="user-info">
          <div class="username">${entry.username}</div>
          <div class="user-level">Level ${entry.level}</div>
        </div>
        <div class="score">${entry.score}</div>
      </div>
    `).join('');
  }

  // Notification System
  showAchievementNotification(achievement) {
    this.showNotification({
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: `${achievement.icon} ${achievement.name}`,
      description: achievement.description,
      points: achievement.points,
      duration: 5000
    });
  }

  showLevelUpNotification(oldLevel, newLevel) {
    this.showNotification({
      type: 'level-up',
      title: 'Level Up!',
      message: `Congratulations! You reached Level ${newLevel}`,
      description: `You advanced from Level ${oldLevel} to Level ${newLevel}`,
      duration: 4000
    });
  }

  showPointsNotification(points, reason) {
    const container = document.getElementById('achievement-notification');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = 'points-notification';
    notification.innerHTML = `
      <div class="points-popup">
        +${points} points
        <div class="reason">${this.formatReason(reason)}</div>
      </div>
    `;

    container.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 2000);
  }

  showNotification(config) {
    const container = document.getElementById('achievement-notification');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `gamification-notification ${config.type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-header">
          <h4>${config.title}</h4>
          <button class="close-notification">×</button>
        </div>
        <div class="notification-body">
          <div class="notification-message">${config.message}</div>
          <div class="notification-description">${config.description}</div>
          ${config.points ? `<div class="notification-points">+${config.points} points</div>` : ''}
        </div>
      </div>
    `;

    container.appendChild(notification);

    notification.querySelector('.close-notification').addEventListener('click', () => {
      notification.remove();
    });

    setTimeout(() => {
      notification.remove();
    }, config.duration || 3000);
  }

  // Helper Methods
  getCurrentTitle() {
    const level = this.userProfile.level;
    const levelData = this.levelSystem.levels.find(l => l.level === level);
    return levelData ? levelData.title : 'Learner';
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    document.getElementById(`${tabName}-panel`).classList.add('active');
  }

  generateMockLeaderboard(type) {
    // Generate mock leaderboard data for demonstration
    const users = [
      { userId: 'user1', username: 'CodeMaster2024', level: 8, score: 15420 },
      { userId: 'user2', username: 'PythonNinja', level: 7, score: 12350 },
      { userId: 'user3', username: 'DataWizard', level: 6, score: 9870 },
      { userId: this.userProfile.userId, username: this.userProfile.username, level: this.userProfile.level, score: this.userProfile.totalPoints },
      { userId: 'user4', username: 'WebDevPro', level: 5, score: 7650 },
      { userId: 'user5', username: 'AIEnthusiast', level: 5, score: 6540 },
      { userId: 'user6', username: 'FullStackDev', level: 4, score: 5230 },
      { userId: 'user7', username: 'MachineLearner', level: 4, score: 4890 },
      { userId: 'user8', username: 'CloudArchitect', level: 3, score: 3450 },
      { userId: 'user9', username: 'MobileDevGuru', level: 3, score: 2340 }
    ];

    return users.sort((a, b) => b.score - a.score);
  }

  getRankIcon(index) {
    const icons = ['🥇', '🥈', '🥉'];
    return icons[index] || '';
  }

  formatReason(reason) {
    const reasonMap = {
      'workshop_completion': 'Workshop Completed',
      'perfect_score': 'Perfect Score',
      'achievement': 'Achievement Unlocked',
      'level_up': 'Level Up',
      'daily_activity': 'Daily Activity',
      'help_community': 'Helping Community'
    };
    return reasonMap[reason] || reason;
  }

  // Public API
  simulateWorkshopCompletion(workshopData) {
    const event = new CustomEvent('workshopCompleted', {
      detail: { ...workshopData, score: 95, completedAt: new Date() }
    });
    document.dispatchEvent(event);
  }

  awardBadge(badgeId) {
    if (!this.userProfile.badges.includes(badgeId)) {
      this.userProfile.badges.push(badgeId);
      const badge = this.badges.get(badgeId);
      if (badge) {
        this.showNotification({
          type: 'badge',
          title: 'Badge Earned!',
          message: `${badge.icon} ${badge.name}`,
          description: badge.description,
          duration: 3000
        });
      }
    }
  }

  getPlayerStats() {
    return {
      level: this.userProfile.level,
      experience: this.userProfile.experience,
      totalPoints: this.userProfile.totalPoints,
      achievements: this.userProfile.achievements.length,
      badges: this.userProfile.badges.length,
      streak: this.userProfile.currentStreak
    };
  }

  // Utility functions for achievement conditions
  checkDailyWorkshopCount() {
    // Simulate daily workshop count check
    return Math.floor(Math.random() * 5);
  }

  checkPerfectScores() {
    // Simulate perfect score count
    return Math.floor(Math.random() * 8);
  }

  checkNightActivity() {
    const hour = new Date().getHours();
    return hour >= 22 || hour <= 6;
  }

  checkEarlyActivity() {
    const hour = new Date().getHours();
    return hour <= 7;
  }

  checkCategoryDiversity() {
    // Simulate category diversity check
    return Math.floor(Math.random() * 5);
  }

  updateStreaks() {
    const today = new Date().toDateString();
    const lastActivity = this.userProfile.lastActivity;
    
    if (lastActivity !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActivity === yesterday.toDateString()) {
        // Continue streak
        this.userProfile.currentStreak++;
      } else {
        // Reset streak
        this.userProfile.currentStreak = 1;
      }
      
      this.userProfile.lastActivity = today;
      this.userProfile.longestStreak = Math.max(
        this.userProfile.longestStreak, 
        this.userProfile.currentStreak
      );
      
      this.saveUserProfile();
    }
  }

  updateWorkshopStreak() {
    const streak = this.streaks.get('workshop_completion');
    if (streak) {
      streak.current++;
      streak.longest = Math.max(streak.longest, streak.current);
    }
  }

  trackDailyActivity() {
    // Track various daily activities
    document.addEventListener('click', () => {
      this.updateQuestProgress('daily_activity', 0.1);
    });
  }

  updateLeaderboards() {
    // Update leaderboard entries (simulated)
    this.leaderboards.forEach(leaderboard => {
      leaderboard.entries = this.generateMockLeaderboard(leaderboard.id);
    });
  }
}

// Initialize Gamification Engine
window.gamificationEngine = new GamificationEngine();
