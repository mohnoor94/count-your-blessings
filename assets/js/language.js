/**
 * Content Language Manager
 * Handles blessing content language selection (English, Arabic, or Both)
 * UI stays in English - this only affects the blessing text display
 */

class ContentLanguageManager {
  constructor() {
    this.contentLanguage = 'both'; // Default to showing both languages
    this.supportedLanguages = ['english', 'arabic', 'both'];
  }
  
  /**
   * Initialize content language manager
   */
  init() {
    try {
      console.log('Initializing Content Language Manager...');
      
      // Load saved preference
      this.loadSavedPreference();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Apply initial content language
      this.updateContentDisplay();
      
      console.log(`Content Language Manager initialized with: ${this.contentLanguage}`);
      
    } catch (error) {
      console.error('Failed to initialize Content Language Manager:', error);
      this.contentLanguage = 'both';
    }
  }
  
  /**
   * Set up event listeners for content language selection
   */
  setupEventListeners() {
    const languageSelect = document.getElementById('contentLanguage');
    if (languageSelect) {
      console.log('Setting up content language selector');
      languageSelect.addEventListener('change', (e) => {
        this.setContentLanguage(e.target.value);
      });
    } else {
      console.warn('Content language selector not found!');
    }
  }
  
  /**
   * Set content language
   */
  setContentLanguage(language) {
    if (!this.supportedLanguages.includes(language)) {
      console.warn(`Unsupported content language: ${language}, falling back to both`);
      language = 'both';
    }
    
    const previousLanguage = this.contentLanguage;
    this.contentLanguage = language;
    
    console.log(`Content language set to: ${language}`);
    
    // Update the select element
    const languageSelect = document.getElementById('contentLanguage');
    if (languageSelect) {
      languageSelect.value = language;
    }
    
    // Update content display
    this.updateContentDisplay();
    
    // Save preference
    this.savePreference();
    
    // Trigger custom event
    const event = new CustomEvent('contentLanguageChanged', {
      detail: { 
        previousLanguage: previousLanguage,
        currentLanguage: language 
      }
    });
    document.dispatchEvent(event);
    
    return language;
  }
  
  /**
   * Get current content language
   */
  getContentLanguage() {
    return this.contentLanguage;
  }
  
  /**
   * Load saved preference from storage
   */
  loadSavedPreference() {
    if (window.storageManager) {
      const saved = window.storageManager.getPreference('contentLanguage');
      if (saved && this.supportedLanguages.includes(saved)) {
        this.contentLanguage = saved;
      }
    }
  }
  
  /**
   * Save preference to storage
   */
  savePreference() {
    if (window.storageManager) {
      window.storageManager.savePreference('contentLanguage', this.contentLanguage);
    }
  }
  
  /**
   * Update content display based on selected language
   */
  updateContentDisplay() {
    const blessingText = document.querySelector('.blessing-text');
    const arabicText = document.querySelector('.blessing-arabic');
    const englishText = document.querySelector('.blessing-english');
    
    if (!blessingText || !arabicText || !englishText) return;
    
    // Remove existing classes
    blessingText.classList.remove('content-arabic', 'content-english', 'content-both');
    
    // Apply content language styling
    switch (this.contentLanguage) {
      case 'arabic':
        // Show ONLY Arabic text
        blessingText.classList.add('content-arabic');
        arabicText.style.display = 'block';
        englishText.style.display = 'none';
        break;
        
      case 'english':
        // Show ONLY English text
        blessingText.classList.add('content-english');
        englishText.style.display = 'block';
        arabicText.style.display = 'none';
        break;
        
      case 'both':
      default:
        // Show BOTH languages
        blessingText.classList.add('content-both');
        arabicText.style.display = 'block';
        englishText.style.display = 'block';
        break;
    }
    
    // Always ensure proper attributes
    arabicText.setAttribute('dir', 'rtl');
    arabicText.setAttribute('lang', 'ar');
    englishText.setAttribute('dir', 'ltr');
    englishText.setAttribute('lang', 'en');
  }
}

// Make ContentLanguageManager available globally
window.ContentLanguageManager = ContentLanguageManager;