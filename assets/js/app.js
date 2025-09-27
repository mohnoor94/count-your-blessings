/**
 * Main Application Controller
 * Handles app initialization, routing, and core functionality
 */

class BlessingReminderApp {
  constructor() {
    this.isInitialized = false;
    this.currentLanguage = 'english';
    this.loadingScreen = null;

    // Bind methods
    this.init = this.init.bind(this);
    this.handleLanguageToggle = this.handleLanguageToggle.bind(this);
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
    await this.waitForModules(['BlessingManager', 'StorageManager', 'LanguageManager']);

    // Initialize modules
    if (window.BlessingManager) {
      window.blessingManager = new window.BlessingManager();
      await window.blessingManager.init();
    }

    if (window.StorageManager) {
      window.storageManager = new window.StorageManager();
      window.storageManager.init();
    }

    if (window.LanguageManager) {
      window.languageManager = new window.LanguageManager();
      window.languageManager.init();
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
    // Language toggle
    const languageToggle = document.getElementById('languageToggle');
    if (languageToggle) {
      languageToggle.addEventListener('click', this.handleLanguageToggle);
    }

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

      // Set language preference
      if (preferences.language) {
        this.currentLanguage = preferences.language;
        this.updateLanguageUI();
      }

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
          if (window.storageManager) {
            window.storageManager.addToHistory(blessing.id, this.currentLanguage);
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

  /**
   * Handle language toggle
   */
  handleLanguageToggle() {
    if (!this.isInitialized) return;

    // Toggle between Arabic and English
    this.currentLanguage = this.currentLanguage === 'arabic' ? 'english' : 'arabic';

    // Update UI
    this.updateLanguageUI();

    // Save preference
    if (window.storageManager) {
      window.storageManager.savePreference('language', this.currentLanguage);
    }

    // Update language manager
    if (window.languageManager) {
      window.languageManager.setLanguage(this.currentLanguage);
    }

    console.log('Language switched to:', this.currentLanguage);
  }

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
        if (window.storageManager) {
          window.storageManager.addToHistory(blessing.id, this.currentLanguage);
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
   * Update blessing display based on current language and content
   */
  updateBlessingDisplay(blessing) {
    const blessingText = document.querySelector('.blessing-text');
    const arabicText = document.querySelector('.blessing-arabic');
    const englishText = document.querySelector('.blessing-english');
    const app = document.getElementById('app');

    if (!blessingText || !arabicText || !englishText || !app) return;

    // Reset classes
    blessingText.classList.remove('bilingual', 'arabic-only', 'english-only');
    arabicText.style.display = '';
    englishText.style.display = '';

    // Set proper text direction and display based on language preference
    switch (this.currentLanguage) {
      case 'arabic':
        // Arabic primary, English secondary
        blessingText.classList.add('arabic-primary');
        arabicText.style.fontSize = 'var(--text-2xl)';
        arabicText.style.color = 'var(--text-primary)';
        arabicText.style.marginBottom = 'var(--space-4)';

        if (blessing.english) {
          englishText.style.fontSize = 'var(--text-base)';
          englishText.style.color = 'var(--text-secondary)';
          englishText.style.opacity = '0.8';
        } else {
          englishText.style.display = 'none';
        }

        // Set RTL direction for the container
        blessingText.setAttribute('dir', 'rtl');
        break;

      case 'english':
        // English primary, Arabic secondary
        blessingText.classList.add('english-primary');
        englishText.style.fontSize = 'var(--text-2xl)';
        englishText.style.color = 'var(--text-primary)';
        englishText.style.marginBottom = 'var(--space-4)';

        if (blessing.arabic) {
          arabicText.style.fontSize = 'var(--text-base)';
          arabicText.style.color = 'var(--text-secondary)';
          arabicText.style.opacity = '0.8';
        } else {
          arabicText.style.display = 'none';
        }

        // Set LTR direction for the container
        blessingText.setAttribute('dir', 'ltr');
        break;

      default:
        // Both languages equal (bilingual mode)
        blessingText.classList.add('bilingual');
        blessingText.removeAttribute('dir');

        arabicText.style.fontSize = 'var(--text-2xl)';
        englishText.style.fontSize = 'var(--text-lg)';
        arabicText.style.color = 'var(--text-arabic)';
        englishText.style.color = 'var(--text-primary)';
        arabicText.style.opacity = '1';
        englishText.style.opacity = '1';
    }

    // Ensure proper text direction for individual elements
    arabicText.setAttribute('dir', 'rtl');
    arabicText.setAttribute('lang', 'ar');
    englishText.setAttribute('dir', 'ltr');
    englishText.setAttribute('lang', 'en');

    // Update app language attribute
    app.setAttribute('data-language', this.currentLanguage);
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

  /**
   * Update language UI elements
   */
  updateLanguageUI() {
    const app = document.getElementById('app');
    const languageToggle = document.getElementById('languageToggle');

    if (app) {
      app.setAttribute('data-language', this.currentLanguage);
    }

    if (languageToggle) {
      languageToggle.textContent = this.currentLanguage === 'arabic' ? 'English' : 'عربي';
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
}

// Initialize the app
window.app = new BlessingReminderApp();