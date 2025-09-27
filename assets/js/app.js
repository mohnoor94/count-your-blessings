/**
 * Main Application Controller
 * Handles app initialization, routing, and core functionality
 */

class BlessingReminderApp {
  constructor() {
    this.isInitialized = false;
    this.loadingScreen = null;

    // Bind methods
    this.init = this.init.bind(this);
    this.handleNewBlessing = this.handleNewBlessing.bind(this);
    this.handleHistoryView = this.handleHistoryView.bind(this);
    this.handleSettings = this.handleSettings.bind(this);

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.init);
    } else {
      this.init();
    }
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('Initializing Blessing Reminder App...');

      // Show loading screen
      this.showLoadingScreen();

      // Initialize core modules
      await this.initializeModules();

      // Set up event listeners
      this.setupEventListeners();
      
      // Set up language change listener
      this.setupLanguageChangeListener();

      // Load user preferences
      this.loadUserPreferences();

      // Register service worker for PWA functionality
      await this.registerServiceWorker();

      // Load initial blessing
      await this.loadInitialBlessing();

      // Hide loading screen
      this.hideLoadingScreen();

      this.isInitialized = true;
      console.log('App initialized successfully');

    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Initialize core application modules
   */
  async initializeModules() {
    // Wait for other modules to be available
    await this.waitForModules(['BlessingManager', 'StorageManager', 'ContentLanguageManager']);

    // Initialize modules
    if (window.BlessingManager) {
      window.blessingManager = new window.BlessingManager();
      await window.blessingManager.init();
    }

    if (window.StorageManager) {
      window.storageManager = new window.StorageManager();
      window.storageManager.init();
    }

    if (window.ContentLanguageManager) {
      window.contentLanguageManager = new window.ContentLanguageManager();
      window.contentLanguageManager.init();
    }
  }

  /**
   * Wait for required modules to load
   */
  waitForModules(moduleNames, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkModules = () => {
        const allLoaded = moduleNames.every(name => window[name]);

        if (allLoaded) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Timeout waiting for modules: ${moduleNames.join(', ')}`));
        } else {
          setTimeout(checkModules, 100);
        }
      };

      checkModules();
    });
  }

  /**
   * Set up event listeners for UI interactions
   */
  setupEventListeners() {
    // Note: Content language selection is handled by ContentLanguageManager
    
    // New blessing button
    const newBlessingBtn = document.getElementById('newBlessingBtn');
    if (newBlessingBtn) {
      newBlessingBtn.addEventListener('click', this.handleNewBlessing);
    }

    // History button
    const historyBtn = document.getElementById('historyBtn');
    if (historyBtn) {
      historyBtn.addEventListener('click', this.handleHistoryView);
    }

    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', this.handleSettings);
    }

    // Handle app visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Handle online/offline status
    window.addEventListener('online', this.handleOnlineStatus.bind(this));
    window.addEventListener('offline', this.handleOfflineStatus.bind(this));

    // Set up touch interactions for blessing card
    this.setupTouchInteractions();

    console.log('Event listeners set up successfully');
  }

  /**
   * Load user preferences from storage
   */
  loadUserPreferences() {
    if (window.storageManager) {
      const preferences = window.storageManager.getPreferences();

      // Apply theme preference
      if (preferences.theme) {
        this.applyTheme(preferences.theme);
      }

      console.log('User preferences loaded:', preferences);
    }
  }

  /**
   * Load initial blessing on app startup
   */
  async loadInitialBlessing() {
    if (window.blessingManager) {
      try {
        const blessing = await window.blessingManager.getRandomBlessing();
        if (blessing) {
          this.displayBlessing(blessing);

          // Add to history
          if (window.storageManager && window.contentLanguageManager) {
            const contentLang = window.contentLanguageManager.getContentLanguage();
            window.storageManager.addToHistory(blessing.id, contentLang);
          }
        }
      } catch (error) {
        console.warn('Failed to load initial blessing:', error);
        // App will show default blessing from HTML
      }
    }
  }

  /**
   * Register service worker for PWA functionality
   */
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          console.log('Service Worker update found');
        });

      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
  }

  // Language toggle is now handled by ContentLanguageManager

  /**
   * Handle new blessing request
   */
  async handleNewBlessing() {
    if (!this.isInitialized || !window.blessingManager) return;

    try {
      // Add loading state to button
      const button = document.getElementById('newBlessingBtn');
      if (button) {
        button.disabled = true;
        button.innerHTML = '<span class="btn-text">Loading...</span><span class="btn-icon">⏳</span>';
      }

      // Get new blessing
      const blessing = await window.blessingManager.getRandomBlessing();

      if (blessing) {
        // Display the blessing
        this.displayBlessing(blessing);

        // Add to history
        if (window.storageManager && window.contentLanguageManager) {
          const contentLang = window.contentLanguageManager.getContentLanguage();
          window.storageManager.addToHistory(blessing.id, contentLang);
        }
      }

    } catch (error) {
      console.error('Failed to get new blessing:', error);
      this.showError('Failed to load new blessing. Please try again.');

    } finally {
      // Reset button state
      const button = document.getElementById('newBlessingBtn');
      if (button) {
        button.disabled = false;
        button.innerHTML = '<span class="btn-text">New Blessing</span><span class="btn-icon">✨</span>';
      }
    }
  }

  /**
   * Display a blessing in the UI with proper language handling
   */
  displayBlessing(blessing) {
    const blessingCard = document.getElementById('blessingCard');
    const blessingText = blessingCard.querySelector('.blessing-text');
    const arabicText = blessingCard.querySelector('.blessing-arabic');
    const englishText = blessingCard.querySelector('.blessing-english');

    if (!blessingCard || !blessingText || !arabicText || !englishText) {
      console.error('Required blessing display elements not found');
      return;
    }

    // Add transition class for smooth animation
    blessingCard.classList.add('transitioning');

    setTimeout(() => {
      // Update text content
      arabicText.textContent = blessing.arabic || 'الحمد لله';
      englishText.textContent = blessing.english || 'Praise be to Allah';

      // Handle language-specific display
      this.updateBlessingDisplay(blessing);

      // Remove transition class and add entering class
      blessingCard.classList.remove('transitioning');
      blessingCard.classList.add('entering');

      // Remove entering class after animation completes
      setTimeout(() => {
        blessingCard.classList.remove('entering');
      }, 400);

    }, 250);
  }

  /**
   * Update blessing display based on current content language
   */
  updateBlessingDisplay(blessing) {
    // Let the content language manager handle the display logic
    if (window.contentLanguageManager) {
      window.contentLanguageManager.updateContentDisplay();
    }
  }

  /**
   * Handle history view
   */
  handleHistoryView() {
    if (!this.isInitialized) return;

    console.log('Opening history view...');
    // This will be implemented in a later task
    this.showComingSoon('History feature coming soon!');
  }

  /**
   * Handle settings
   */
  handleSettings() {
    if (!this.isInitialized) return;

    console.log('Opening settings...');
    // This will be implemented in a later task
    this.showComingSoon('Settings feature coming soon!');
  }

  // UI language is now always English - no need to update
  
  /**
   * Refresh blessing display with current language settings
   */
  refreshBlessingDisplay() {
    const blessingCard = document.getElementById('blessingCard');
    const arabicText = document.querySelector('.blessing-arabic');
    const englishText = document.querySelector('.blessing-english');
    
    if (!blessingCard || !arabicText || !englishText) return;
    
    // Get current blessing text
    const currentBlessing = {
      arabic: arabicText.textContent,
      english: englishText.textContent
    };
    
    // Re-display with new content language settings
    if (window.contentLanguageManager) {
      window.contentLanguageManager.updateContentDisplay();
    }
  }

  /**
   * Apply theme to the application
   */
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  /**
   * Show loading screen
   */
  showLoadingScreen() {
    this.loadingScreen = document.getElementById('loadingScreen');
    if (this.loadingScreen) {
      this.loadingScreen.classList.remove('hidden');
    }
  }

  /**
   * Hide loading screen
   */
  hideLoadingScreen() {
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('hidden');

      // Remove from DOM after transition
      setTimeout(() => {
        if (this.loadingScreen && this.loadingScreen.parentNode) {
          this.loadingScreen.parentNode.removeChild(this.loadingScreen);
        }
      }, 600);
    }
  }

  /**
   * Handle initialization errors
   */
  handleInitializationError(error) {
    console.error('App initialization failed:', error);

    // Hide loading screen
    this.hideLoadingScreen();

    // Show error message
    this.showError('Failed to initialize the app. Please refresh the page.');
  }

  /**
   * Show error message to user
   */
  showError(message) {
    // Create simple error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ff4444;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      font-size: 14px;
    `;

    document.body.appendChild(errorDiv);

    // Remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  /**
   * Show coming soon message
   */
  showComingSoon(message) {
    // Create simple notification
    const notificationDiv = document.createElement('div');
    notificationDiv.className = 'coming-soon-notification';
    notificationDiv.textContent = message;
    notificationDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--primary-green);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      font-size: 14px;
    `;

    document.body.appendChild(notificationDiv);

    // Remove after 3 seconds
    setTimeout(() => {
      if (notificationDiv.parentNode) {
        notificationDiv.parentNode.removeChild(notificationDiv);
      }
    }, 3000);
  }

  /**
   * Handle app visibility changes
   */
  handleVisibilityChange() {
    if (document.hidden) {
      console.log('App hidden');
    } else {
      console.log('App visible');
      // Refresh blessing if needed
    }
  }

  /**
   * Handle online status
   */
  handleOnlineStatus() {
    console.log('App is online');
    // Update UI to show online status
  }

  /**
   * Handle offline status
   */
  handleOfflineStatus() {
    console.log('App is offline');
    // Update UI to show offline status
  }

  /**
   * Set up touch interactions for mobile devices
   */
  setupTouchInteractions() {
    const blessingCard = document.getElementById('blessingCard');

    if (blessingCard) {
      let touchStartTime = 0;
      let touchStartY = 0;

      // Touch start
      blessingCard.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now();
        touchStartY = e.touches[0].clientY;
        blessingCard.style.transform = 'scale(0.98)';
      }, { passive: true });

      // Touch end
      blessingCard.addEventListener('touchend', (e) => {
        const touchEndTime = Date.now();
        const touchEndY = e.changedTouches[0].clientY;
        const touchDuration = touchEndTime - touchStartTime;
        const touchDistance = Math.abs(touchEndY - touchStartY);

        // Reset transform
        blessingCard.style.transform = '';

        // If it was a tap (short duration, minimal movement)
        if (touchDuration < 300 && touchDistance < 10) {
          this.handleBlessingCardTap();
        }
      }, { passive: true });

      // Touch cancel
      blessingCard.addEventListener('touchcancel', () => {
        blessingCard.style.transform = '';
      }, { passive: true });

      // Also handle click for desktop
      blessingCard.addEventListener('click', () => {
        this.handleBlessingCardTap();
      });
    }
  }

  /**
   * Handle blessing card tap/click
   */
  handleBlessingCardTap() {
    // Add a subtle animation feedback
    const blessingCard = document.getElementById('blessingCard');
    if (blessingCard) {
      blessingCard.style.transform = 'scale(1.02)';
      setTimeout(() => {
        blessingCard.style.transform = '';
      }, 150);
    }

    // Optionally trigger new blessing or other action
    // For now, just provide visual feedback
    console.log('Blessing card tapped');
  }
  
  /**
   * Set up content language change event listener
   */
  setupLanguageChangeListener() {
    document.addEventListener('contentLanguageChanged', (event) => {
      const { previousLanguage, currentLanguage } = event.detail;
      
      console.log(`Content language changed from ${previousLanguage} to ${currentLanguage}`);
      
      // Refresh current blessing display with new content language
      this.refreshBlessingDisplay();
    });
  }
  
  /**
   * Update content language dependent elements
   */
  updateLanguageDependentElements() {
    // UI stays in English - only content language changes
    // This method is kept for compatibility but doesn't need to do anything
    console.log('Content language updated');
  }
}

// Initialize the app
window.app = new BlessingReminderApp();