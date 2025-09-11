/**
 * Real-time Features for FOSSEE Workshops
 * Features: Live chat, real-time updates, collaborative tools, live polls
 */

class RealTimeEngine {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.userId = this.generateUserId();
    this.activeUsers = new Map();
    this.notifications = [];
    this.livePolls = new Map();
    
    this.init();
  }

  async init() {
    this.setupWebSocket();
    this.setupLiveChat();
    this.setupRealTimeUpdates();
    this.setupCollaborativeFeatures();
    this.setupLivePolls();
    this.setupNotificationSystem();
  }

  // WebSocket Connection (Simulated)
  setupWebSocket() {
    // Simulate WebSocket connection with EventTarget
    this.socket = new EventTarget();
    this.simulateConnection();
    
    this.socket.addEventListener('message', (event) => {
      this.handleMessage(event.detail);
    });

    this.socket.addEventListener('userJoined', (event) => {
      this.handleUserJoined(event.detail);
    });

    this.socket.addEventListener('userLeft', (event) => {
      this.handleUserLeft(event.detail);
    });
  }

  simulateConnection() {
    setTimeout(() => {
      this.isConnected = true;
      this.socket.dispatchEvent(new CustomEvent('connected'));
      this.showConnectionStatus('Connected to FOSSEE Live');
      
      // Simulate other users joining
      this.simulateUsers();
    }, 1000);
  }

  simulateUsers() {
    const simulatedUsers = [
      { id: 'user1', name: 'Priya Sharma', status: 'online', avatar: '👩‍💻' },
      { id: 'user2', name: 'Arjun Patel', status: 'online', avatar: '👨‍🔬' },
      { id: 'user3', name: 'Kavya Reddy', status: 'away', avatar: '👩‍🎓' },
      { id: 'user4', name: 'Rohit Kumar', status: 'online', avatar: '👨‍💻' }
    ];

    simulatedUsers.forEach((user, index) => {
      setTimeout(() => {
        this.activeUsers.set(user.id, user);
        this.socket.dispatchEvent(new CustomEvent('userJoined', { detail: user }));
      }, (index + 1) * 500);
    });
  }

  generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  // Live Chat System
  setupLiveChat() {
    const chatContainer = this.createChatContainer();
    document.body.appendChild(chatContainer);
    
    this.setupChatHandlers();
    this.loadChatHistory();
  }

  createChatContainer() {
    const container = document.createElement('div');
    container.className = 'live-chat-container';
    container.innerHTML = `
      <div class="chat-header">
        <h3><i class="fas fa-comments"></i> Live Discussion</h3>
        <div class="active-users-count">
          <i class="fas fa-users"></i>
          <span id="user-count">0</span> online
        </div>
        <button class="chat-toggle" id="chat-toggle">
          <i class="fas fa-chevron-down"></i>
        </button>
      </div>
      
      <div class="chat-body" id="chat-body">
        <div class="active-users-list" id="active-users">
          <!-- Active users will be populated here -->
        </div>
        
        <div class="chat-messages" id="chat-messages">
          <!-- Messages will be populated here -->
        </div>
        
        <div class="chat-input-container">
          <input type="text" id="chat-input" placeholder="Type your message..." maxlength="500">
          <button id="send-message" class="btn btn-primary">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;

    return container;
  }

  setupChatHandlers() {
    const chatToggle = document.getElementById('chat-toggle');
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-message');

    chatToggle.addEventListener('click', () => {
      chatBody.classList.toggle('collapsed');
      const icon = chatToggle.querySelector('i');
      icon.className = chatBody.classList.contains('collapsed') 
        ? 'fas fa-chevron-up' 
        : 'fas fa-chevron-down';
    });

    const sendMessage = () => {
      const message = chatInput.value.trim();
      if (message) {
        this.sendChatMessage(message);
        chatInput.value = '';
      }
    };

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    // Auto-resize input
    chatInput.addEventListener('input', () => {
      if (chatInput.value.length > 100) {
        chatInput.style.height = 'auto';
        chatInput.style.height = chatInput.scrollHeight + 'px';
      }
    });
  }

  sendChatMessage(message) {
    const messageData = {
      id: Date.now().toString(),
      userId: this.userId,
      userName: this.getCurrentUserName(),
      message: message,
      timestamp: new Date().toISOString(),
      type: 'message'
    };

    this.addMessageToChat(messageData);
    
    // Simulate message to other users
    setTimeout(() => {
      this.simulateIncomingMessage();
    }, Math.random() * 3000 + 1000);
  }

  addMessageToChat(messageData) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${messageData.userId === this.userId ? 'own-message' : ''}`;
    
    const time = new Date(messageData.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    messageElement.innerHTML = `
      <div class="message-header">
        <span class="user-name">${messageData.userName}</span>
        <span class="message-time">${time}</span>
      </div>
      <div class="message-content">${this.formatMessage(messageData.message)}</div>
    `;

    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  formatMessage(message) {
    // Add basic formatting support
    return message
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
  }

  simulateIncomingMessage() {
    const users = Array.from(this.activeUsers.values());
    const randomUser = users[Math.floor(Math.random() * users.length)];
    
    const responses = [
      "Great workshop! Really enjoying the content 👍",
      "Can someone share the link to the documentation?",
      "This is exactly what I was looking for!",
      "The instructor is doing an amazing job explaining this",
      "Anyone else working on the practical exercises?",
      "Looking forward to the next session",
      "The code examples are very helpful 💻"
    ];

    if (randomUser) {
      const messageData = {
        id: Date.now().toString(),
        userId: randomUser.id,
        userName: randomUser.name,
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString(),
        type: 'message'
      };

      this.addMessageToChat(messageData);
    }
  }

  loadChatHistory() {
    // Load previous chat messages
    const history = [
      {
        id: '1',
        userId: 'instructor',
        userName: 'Dr. Sarah Wilson',
        message: 'Welcome everyone! Feel free to ask questions during the workshop.',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        type: 'announcement'
      }
    ];

    history.forEach(message => this.addMessageToChat(message));
  }

  getCurrentUserName() {
    return localStorage.getItem('fossee-user-name') || 'Anonymous User';
  }

  // Real-time Updates
  setupRealTimeUpdates() {
    this.createUpdatePanel();
    this.startUpdatePolling();
  }

  createUpdatePanel() {
    const panel = document.createElement('div');
    panel.className = 'real-time-updates';
    panel.innerHTML = `
      <div class="updates-header">
        <h4><i class="fas fa-broadcast-tower"></i> Live Updates</h4>
        <span class="live-indicator">🔴 LIVE</span>
      </div>
      <div class="updates-content" id="updates-content">
        <!-- Updates will be populated here -->
      </div>
    `;

    const sidebar = document.querySelector('.sidebar') || document.body;
    sidebar.appendChild(panel);
  }

  startUpdatePolling() {
    this.showUpdate('System online - Real-time updates active', 'system');
    
    // Simulate periodic updates
    setInterval(() => {
      this.simulateUpdate();
    }, 15000);
  }

  simulateUpdate() {
    const updates = [
      { message: 'New workshop "Advanced Python" added to catalog', type: 'workshop' },
      { message: '25 students joined "Data Science Fundamentals"', type: 'enrollment' },
      { message: 'Live Q&A session starting in 10 minutes', type: 'event' },
      { message: 'Workshop materials updated with latest examples', type: 'content' },
      { message: 'Certificate generation system upgraded', type: 'system' }
    ];

    const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
    this.showUpdate(randomUpdate.message, randomUpdate.type);
  }

  showUpdate(message, type) {
    const updatesContent = document.getElementById('updates-content');
    if (!updatesContent) return;

    const update = document.createElement('div');
    update.className = `update-item ${type}`;
    update.innerHTML = `
      <div class="update-icon">
        ${this.getUpdateIcon(type)}
      </div>
      <div class="update-content">
        <div class="update-message">${message}</div>
        <div class="update-time">${new Date().toLocaleTimeString()}</div>
      </div>
    `;

    updatesContent.insertBefore(update, updatesContent.firstChild);

    // Remove old updates (keep only last 5)
    while (updatesContent.children.length > 5) {
      updatesContent.removeChild(updatesContent.lastChild);
    }

    // Animate in
    requestAnimationFrame(() => {
      update.style.opacity = '1';
      update.style.transform = 'translateX(0)';
    });
  }

  getUpdateIcon(type) {
    const icons = {
      system: '<i class="fas fa-cog"></i>',
      workshop: '<i class="fas fa-plus-circle"></i>',
      enrollment: '<i class="fas fa-user-plus"></i>',
      event: '<i class="fas fa-calendar-alt"></i>',
      content: '<i class="fas fa-file-alt"></i>'
    };
    return icons[type] || '<i class="fas fa-info-circle"></i>';
  }

  // Collaborative Features
  setupCollaborativeFeatures() {
    this.createCollaborationPanel();
    this.setupSharedWorkspace();
    this.setupPeerLearning();
  }

  createCollaborationPanel() {
    const panel = document.createElement('div');
    panel.className = 'collaboration-panel';
    panel.innerHTML = `
      <div class="collab-header">
        <h4><i class="fas fa-users-cog"></i> Collaborate</h4>
      </div>
      <div class="collab-features">
        <button class="collab-btn" id="share-screen">
          <i class="fas fa-desktop"></i> Share Screen
        </button>
        <button class="collab-btn" id="start-group">
          <i class="fas fa-user-friends"></i> Study Group
        </button>
        <button class="collab-btn" id="peer-help">
          <i class="fas fa-hands-helping"></i> Get Help
        </button>
        <button class="collab-btn" id="whiteboard">
          <i class="fas fa-chalkboard"></i> Whiteboard
        </button>
      </div>
      <div class="active-collaborations" id="active-collaborations">
        <!-- Active collaborations will appear here -->
      </div>
    `;

    const mainContent = document.querySelector('.main-content') || document.body;
    mainContent.appendChild(panel);

    this.setupCollaborationHandlers();
  }

  setupCollaborationHandlers() {
    document.getElementById('share-screen')?.addEventListener('click', () => {
      this.startScreenShare();
    });

    document.getElementById('start-group')?.addEventListener('click', () => {
      this.createStudyGroup();
    });

    document.getElementById('peer-help')?.addEventListener('click', () => {
      this.requestPeerHelp();
    });

    document.getElementById('whiteboard')?.addEventListener('click', () => {
      this.openWhiteboard();
    });
  }

  startScreenShare() {
    this.showNotification('Screen sharing initiated! Others can now see your screen.', 'success');
    this.addActiveCollaboration('Screen Share', 'sharing');
  }

  createStudyGroup() {
    const groupName = prompt('Enter study group name:') || 'Study Group';
    this.showNotification(`Created study group: ${groupName}`, 'success');
    this.addActiveCollaboration(groupName, 'group');
  }

  requestPeerHelp() {
    this.showNotification('Help request sent to online peers!', 'info');
    this.addActiveCollaboration('Help Request', 'help');
  }

  openWhiteboard() {
    this.showNotification('Opening collaborative whiteboard...', 'info');
    this.addActiveCollaboration('Whiteboard', 'whiteboard');
  }

  addActiveCollaboration(name, type) {
    const container = document.getElementById('active-collaborations');
    if (!container) return;

    const collab = document.createElement('div');
    collab.className = `active-collab ${type}`;
    collab.innerHTML = `
      <div class="collab-info">
        <strong>${name}</strong>
        <span class="collab-participants">
          <i class="fas fa-users"></i> ${Math.floor(Math.random() * 5) + 1}
        </span>
      </div>
      <button class="btn btn-sm btn-outline" onclick="this.parentElement.remove()">
        Leave
      </button>
    `;

    container.appendChild(collab);
  }

  // Live Polls System
  setupLivePolls() {
    this.createPollsPanel();
    this.simulateLivePoll();
  }

  createPollsPanel() {
    const panel = document.createElement('div');
    panel.className = 'live-polls-panel';
    panel.innerHTML = `
      <div class="polls-header">
        <h4><i class="fas fa-poll"></i> Live Polls</h4>
      </div>
      <div class="polls-content" id="polls-content">
        <!-- Polls will be populated here -->
      </div>
    `;

    const sidebar = document.querySelector('.sidebar') || document.body;
    sidebar.appendChild(panel);
  }

  simulateLivePoll() {
    setTimeout(() => {
      const poll = {
        id: 'poll1',
        question: 'What programming language would you like to learn next?',
        options: [
          { id: 'python', text: 'Python', votes: 0 },
          { id: 'javascript', text: 'JavaScript', votes: 0 },
          { id: 'java', text: 'Java', votes: 0 },
          { id: 'cpp', text: 'C++', votes: 0 }
        ],
        totalVotes: 0,
        isActive: true
      };

      this.displayPoll(poll);
    }, 5000);
  }

  displayPoll(poll) {
    const pollsContent = document.getElementById('polls-content');
    if (!pollsContent) return;

    const pollElement = document.createElement('div');
    pollElement.className = 'live-poll';
    pollElement.innerHTML = `
      <div class="poll-question">${poll.question}</div>
      <div class="poll-options">
        ${poll.options.map(option => `
          <button class="poll-option" data-option-id="${option.id}" data-poll-id="${poll.id}">
            <span class="option-text">${option.text}</span>
            <span class="option-votes">${option.votes} votes</span>
            <div class="vote-bar">
              <div class="vote-fill" style="width: ${poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0}%"></div>
            </div>
          </button>
        `).join('')}
      </div>
      <div class="poll-footer">
        <span class="total-votes">${poll.totalVotes} total votes</span>
        <span class="poll-status ${poll.isActive ? 'active' : 'closed'}">
          ${poll.isActive ? 'Live' : 'Closed'}
        </span>
      </div>
    `;

    pollsContent.appendChild(pollElement);

    // Add vote handlers
    pollElement.querySelectorAll('.poll-option').forEach(button => {
      button.addEventListener('click', () => {
        if (poll.isActive) {
          this.votePoll(poll.id, button.dataset.optionId);
        }
      });
    });

    this.livePolls.set(poll.id, poll);
  }

  votePoll(pollId, optionId) {
    const poll = this.livePolls.get(pollId);
    if (!poll || !poll.isActive) return;

    // Add vote
    const option = poll.options.find(opt => opt.id === optionId);
    if (option) {
      option.votes++;
      poll.totalVotes++;
      
      // Update display
      this.updatePollDisplay(poll);
      
      this.showNotification('Vote submitted!', 'success');
    }
  }

  updatePollDisplay(poll) {
    const pollElement = document.querySelector(`[data-poll-id="${poll.id}"]`)?.closest('.live-poll');
    if (!pollElement) return;

    poll.options.forEach(option => {
      const optionButton = pollElement.querySelector(`[data-option-id="${option.id}"]`);
      if (optionButton) {
        optionButton.querySelector('.option-votes').textContent = `${option.votes} votes`;
        const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0;
        optionButton.querySelector('.vote-fill').style.width = `${percentage}%`;
      }
    });

    pollElement.querySelector('.total-votes').textContent = `${poll.totalVotes} total votes`;
  }

  // Notification System
  setupNotificationSystem() {
    this.createNotificationContainer();
  }

  createNotificationContainer() {
    const container = document.createElement('div');
    container.className = 'notification-container';
    container.id = 'notification-container';
    document.body.appendChild(container);
  }

  showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${this.getNotificationIcon(type)}"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close">×</button>
    `;

    container.appendChild(notification);

    // Close handler
    notification.querySelector('.notification-close').addEventListener('click', () => {
      this.removeNotification(notification);
    });

    // Auto-remove
    setTimeout(() => {
      this.removeNotification(notification);
    }, duration);

    // Animate in
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });
  }

  removeNotification(notification) {
    notification.classList.add('hide');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  getNotificationIcon(type) {
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
  }

  showConnectionStatus(message) {
    const status = document.createElement('div');
    status.className = 'connection-status';
    status.textContent = message;
    document.body.appendChild(status);

    setTimeout(() => {
      status.classList.add('show');
    }, 100);

    setTimeout(() => {
      status.classList.remove('show');
      setTimeout(() => status.remove(), 300);
    }, 3000);
  }

  // User Management
  handleUserJoined(user) {
    this.activeUsers.set(user.id, user);
    this.updateActiveUsersList();
    this.showNotification(`${user.name} joined the session`, 'info', 2000);
  }

  handleUserLeft(user) {
    this.activeUsers.delete(user.id);
    this.updateActiveUsersList();
    this.showNotification(`${user.name} left the session`, 'info', 2000);
  }

  updateActiveUsersList() {
    const usersList = document.getElementById('active-users');
    const userCount = document.getElementById('user-count');
    
    if (userCount) {
      userCount.textContent = this.activeUsers.size;
    }

    if (usersList) {
      usersList.innerHTML = Array.from(this.activeUsers.values()).map(user => `
        <div class="active-user ${user.status}">
          <span class="user-avatar">${user.avatar}</span>
          <span class="user-name">${user.name}</span>
          <span class="user-status ${user.status}"></span>
        </div>
      `).join('');
    }
  }

  // Public API
  sendSystemMessage(message, type = 'system') {
    this.showUpdate(message, type);
  }

  broadcastNotification(message, type = 'info') {
    this.showNotification(message, type);
  }

  getCurrentActiveUsers() {
    return Array.from(this.activeUsers.values());
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Initialize Real-time Engine
window.realTimeEngine = new RealTimeEngine();
