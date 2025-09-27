/**
 * Language Management Module
 * Handles language switching, RTL/LTR text direction, and localization
 */

class LanguageManager {
  constructor() {
    this.currentLanguage = 'english';
    this.supportedLanguages = ['arabic', 'english'];
    this.isRTL = false;
    
    // Language-specific configurations
    this.languageConfig = {
      arabic: {
        code: 'ar',
        name: 'العربية',
        direction: 'rtl',
        fontFamily: 'var(--font-arabic)',
        displayName: 'Arabic'
      },
      english: {
        code: 'en',
        name: 'English',
        direction: 'ltr',
        fontFamily: 'var(--font-english)',
        displayName: 'English'
      }
    };
    
    // UI text translations
    this.translations = {
      arabic: {
        appTitle: 'تذكير النعم',
        newBlessing: 'نعمة جديدة',
        history: 'التاريخ',
        settings: 'الإعدادات',
        loading: 'جاري التحميل...',
        error: 'خطأ',
        comingSoon: 'قريباً',
        praiseBeToAllah: 'الحمد لله'
      },
      english: {
        appTitle: 'Blessing Reminder',
        newBlessing: 'New Blessing',
        history: 'History',
        settings: 'Settings',
        loading: 'Loading...',
        error: 'Error',
        comingSoon: 'Coming Soon',
        praiseBeToAllah: 'Praise be to Allah'
      }
    };
  }
  
  /**
   * Initialize language manager
   */
  init() {
    try {
      console.log('Initializing Language Manager...');
      
      // Detect user's preferred language
      this.detectPreferredLanguage();
      
      // Set initial language
      this.setLanguage(this.currentLanguage);
      
      console.log(`Language Manager initialized with language: ${this.currentLanguage}`);
      
    } catch (error) {
      console.error('Failed to initialize Language Manager:', error);
      this.currentLanguage = 'english';
      this.isRTL = false;
    }
  }
  
  /**
   * Detect user's preferred language from browser settings
   */
  detectPreferredLanguage() {
    try {
      // Check browser language
      const browserLang = navigator.language || navigator.userLanguage;
      
      if (browserLang) {
        const langCode = browserLang.toLowerCase().split('-')[0];
        
        // Check if we support this language
        if (langCode === 'ar') {
          this.currentLanguage = 'arabic';
        } else {
          this.currentLanguage = 'english';
        }
      }
      
      console.log('Detected preferred language:', this.currentLanguage);
      
    } catch (error) {
      console.warn('Could not detect preferred language:', error);
      this.currentLanguage = 'english';
    }
  }
  
  /**
   * Set the current language
   */
  setLanguage(language) {
    if (!this.supportedLanguages.includes(language)) {
      console.warn(`Unsupported language: ${language}, falling back to English`);
      language = 'english';
    }
    
    this.currentLanguage = language;
    this.isRTL = this.languageConfig[language].direction === 'rtl';
    
    // Update DOM
    this.updateDocumentLanguage();
    this.updateUIElements();
    
    console.log(`Language set to: ${language} (RTL: ${this.isRTL})`);
  }
  
  /**
   * Get current language
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }
  
  /**
   * Check if current language is RTL
   */
  isCurrentLanguageRTL() {
    return this.isRTL;
  }
  
  /**
   * Toggle between Arabic and English
   */
  toggleLanguage() {
    const newLanguage = this.currentLanguage === 'arabic' ? 'english' : 'arabic';
    this.setLanguage(newLanguage);
    return newLanguage;
  }
  
  /**
   * Update document-level language attributes
   */
  updateDocumentLanguage() {
    const config = this.languageConfig[this.currentLanguage];
    const html = document.documentElement;
    const body = document.body;
    
    // Update HTML lang and dir attributes
    html.setAttribute('lang', config.code);
    html.setAttribute('dir', config.direction);
    
    // Update body direction class
    body.classList.remove('rtl', 'ltr');
    body.classList.add(config.direction);
    
    // Update app container
    const app = document.getElementById('app');
    if (app) {
      app.setAttribute('data-language', this.currentLanguage);
      app.setAttribute('dir', config.direction);
    }
  }
  
  /**
   * Update UI elements with current language
   */
  updateUIElements() {
    // Update language toggle button
    this.updateLanguageToggle();
    
    // Update navigation labels
    this.updateNavigationLabels();
    
    // Update button texts
    this.updateButtonTexts();
    
    // Update title
    this.updateTitle();
  }
  
  /**
   * Update language toggle button
   */
  updateLanguageToggle() {
    const languageToggle = document.getElementById('languageToggle');
    if (languageToggle) {
      const otherLanguage = this.currentLanguage === 'arabic' ? 'english' : 'arabic';
      const config = this.languageConfig[otherLanguage];
      
      languageToggle.textContent = config.name;
      languageToggle.setAttribute('data-language', otherLanguage);
      languageToggle.setAttribute('aria-label', `Switch to ${config.displayName}`);
    }
  }
  
  /**
   * Update navigation labels
   */
  updateNavigationLabels() {
    const historyBtn = document.getElementById('historyBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    
    if (historyBtn) {
      const historyLabel = historyBtn.querySelector('.nav-label');
      if (historyLabel) {
        historyLabel.textContent = this.translate('history');
      }
      historyBtn.setAttribute('aria-label', this.translate('history'));
    }
    
    if (settingsBtn) {
      const settingsLabel = settingsBtn.querySelector('.nav-label');
      if (settingsLabel) {
        settingsLabel.textContent = this.translate('settings');
      }
      settingsBtn.setAttribute('aria-label', this.translate('settings'));
    }
  }
  
  /**
   * Update button texts
   */
  updateButtonTexts() {
    const newBlessingBtn = document.getElementById('newBlessingBtn');
    if (newBlessingBtn) {
      const btnText = newBlessingBtn.querySelector('.btn-text');
      if (btnText) {
        btnText.textContent = this.translate('newBlessing');
      }
      newBlessingBtn.setAttribute('aria-label', this.translate('newBlessing'));
    }
  }
  
  /**
   * Update page title
   */
  updateTitle() {
    const titleEnglish = document.querySelector('.title-english');
    const titleArabic = document.querySelector('.title-arabic');
    
    if (titleEnglish) {
      titleEnglish.textContent = this.translations.english.appTitle;
    }
    
    if (titleArabic) {
      titleArabic.textContent = this.translations.arabic.appTitle;
    }
    
    // Update document title
    document.title = this.translate('appTitle') + ' - Alhamdulillah';
  }
  
  /**
   * Translate a key to current language
   */
  translate(key) {
    const translations = this.translations[this.currentLanguage];
    return translations && translations[key] ? translations[key] : key;
  }
  
  /**
   * Get text direction for current language
   */
  getTextDirection() {
    return this.languageConfig[this.currentLanguage].direction;
  }
  
  /**
   * Get font family for current language
   */
  getFontFamily() {
    return this.languageConfig[this.currentLanguage].fontFamily;
  }
  
  /**
   * Format text for display based on language
   */
  formatText(text, language = null) {
    const lang = language || this.currentLanguage;
    const config = this.languageConfig[lang];
    
    if (!config) return text;
    
    // Create a span with proper language attributes
    const span = document.createElement('span');
    span.textContent = text;
    span.setAttribute('lang', config.code);
    span.setAttribute('dir', config.direction);
    span.style.fontFamily = config.fontFamily;
    
    return span;
  }
  
  /**
   * Apply text direction to an element
   */
  applyTextDirection(element, language = null) {
    const lang = language || this.currentLanguage;
    const config = this.languageConfig[lang];
    
    if (element && config) {
      element.setAttribute('dir', config.direction);
      element.style.textAlign = config.direction === 'rtl' ? 'right' : 'left';
      element.style.fontFamily = config.fontFamily;
    }
  }
  
  /**
   * Get language configuration
   */
  getLanguageConfig(language = null) {
    const lang = language || this.currentLanguage;
    return this.languageConfig[lang] || this.languageConfig.english;
  }
  
  /**
   * Get all supported languages
   */
  getSupportedLanguages() {
    return this.supportedLanguages.map(lang => ({
      code: lang,
      ...this.languageConfig[lang]
    }));
  }
  
  /**
   * Check if a language is supported
   */
  isLanguageSupported(language) {
    return this.supportedLanguages.includes(language);
  }
  
  /**
   * Get opposite language
   */
  getOppositeLanguage() {
    return this.currentLanguage === 'arabic' ? 'english' : 'arabic';
  }
  
  /**
   * Format date/time for current language
   */
  formatDateTime(timestamp, options = {}) {
    const date = new Date(timestamp);
    const config = this.languageConfig[this.currentLanguage];
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    
    try {
      return date.toLocaleDateString(config.code, formatOptions);
    } catch (error) {
      console.warn('Date formatting failed, using fallback:', error);
      return date.toLocaleDateString('en-US', formatOptions);
    }
  }
  
  /**
   * Get reading direction class
   */
  getDirectionClass() {
    return this.isRTL ? 'rtl' : 'ltr';
  }
  
  /**
   * Handle language-specific keyboard events
   */
  handleKeyboardInput(event) {
    // Handle RTL-specific keyboard shortcuts or behaviors
    if (this.isRTL) {
      // Swap left/right arrow keys for RTL navigation
      if (event.key === 'ArrowLeft') {
        // In RTL, left arrow should move forward
        event.preventDefault();
        // Trigger right arrow behavior
        return 'ArrowRight';
      } else if (event.key === 'ArrowRight') {
        // In RTL, right arrow should move backward
        event.preventDefault();
        // Trigger left arrow behavior
        return 'ArrowLeft';
      }
    }
    
    return event.key;
  }
  
  /**
   * Get language-specific CSS classes
   */
  getLanguageClasses() {
    const config = this.languageConfig[this.currentLanguage];
    return [
      `lang-${this.currentLanguage}`,
      `dir-${config.direction}`,
      this.isRTL ? 'rtl' : 'ltr'
    ];
  }
}

// Make LanguageManager available globally
window.LanguageManager = LanguageManager;