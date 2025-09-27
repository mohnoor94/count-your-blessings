/**
 * Blessing Management Module
 * Handles blessing data, selection logic, and display functionality
 */

class BlessingManager {
  constructor() {
    this.blessings = [];
    this.isInitialized = false;
    this.lastSelectedIds = new Set();
    this.maxHistorySize = 10; // Avoid repeating last 10 blessings
    
    // Default fallback blessings
    this.fallbackBlessings = [
      {
        id: 'default-1',
        arabic: 'الحمد لله رب العالمين',
        english: 'Praise be to Allah, Lord of all the worlds',
        category: 'general',
        tags: ['praise', 'gratitude']
      },
      {
        id: 'default-2',
        arabic: 'الحمد لله الذي أطعمنا وسقانا',
        english: 'Praise be to Allah who has fed us and given us drink',
        category: 'sustenance',
        tags: ['food', 'drink', 'sustenance']
      },
      {
        id: 'default-3',
        arabic: 'الحمد لله الذي عافاني في بدني',
        english: 'Praise be to Allah who has granted me health in my body',
        category: 'health',
        tags: ['health', 'body', 'wellness']
      }
    ];
  }
  
  /**
   * Initialize the blessing manager
   */
  async init() {
    try {
      console.log('Initializing Blessing Manager...');
      
      // Load blessings data
      await this.loadBlessings();
      
      // Validate data
      this.validateBlessings();
      
      this.isInitialized = true;
      console.log(`Blessing Manager initialized with ${this.blessings.length} blessings`);
      
    } catch (error) {
      console.error('Failed to initialize Blessing Manager:', error);
      this.handleInitializationError();
    }
  }
  
  /**
   * Load blessings from data source
   */
  async loadBlessings() {
    try {
      // Try to load from external JSON file (will be created in later task)
      const response = await fetch('assets/data/blessings.json');
      
      if (response.ok) {
        const data = await response.json();
        this.blessings = data.blessings || data;
        console.log('Blessings loaded from JSON file');
      } else {
        throw new Error('Failed to fetch blessings data');
      }
      
    } catch (error) {
      console.warn('Could not load external blessings data, using fallback:', error);
      this.blessings = [...this.fallbackBlessings];
    }
  }
  
  /**
   * Validate blessing data structure
   */
  validateBlessings() {
    const validBlessings = [];
    
    for (const blessing of this.blessings) {
      if (this.isValidBlessing(blessing)) {
        validBlessings.push(blessing);
      } else {
        console.warn('Invalid blessing data:', blessing);
      }
    }
    
    this.blessings = validBlessings;
    
    // Ensure we have at least some blessings
    if (this.blessings.length === 0) {
      console.warn('No valid blessings found, using fallback data');
      this.blessings = [...this.fallbackBlessings];
    }
  }
  
  /**
   * Check if a blessing object is valid
   */
  isValidBlessing(blessing) {
    return (
      blessing &&
      typeof blessing === 'object' &&
      typeof blessing.id === 'string' &&
      blessing.id.length > 0 &&
      (typeof blessing.arabic === 'string' || typeof blessing.english === 'string')
    );
  }
  
  /**
   * Get a random blessing, avoiding recent selections
   */
  async getRandomBlessing() {
    if (!this.isInitialized) {
      await this.init();
    }
    
    if (this.blessings.length === 0) {
      throw new Error('No blessings available');
    }
    
    // Get available blessings (excluding recently selected ones)
    const availableBlessings = this.getAvailableBlessings();
    
    // If all blessings have been recently selected, reset the history
    const blessingsToChooseFrom = availableBlessings.length > 0 
      ? availableBlessings 
      : this.blessings;
    
    // Select random blessing
    const randomIndex = Math.floor(Math.random() * blessingsToChooseFrom.length);
    const selectedBlessing = blessingsToChooseFrom[randomIndex];
    
    // Add to recent selections
    this.addToRecentSelections(selectedBlessing.id);
    
    // Clean up old selections if needed
    this.cleanupRecentSelections();
    
    return selectedBlessing;
  }
  
  /**
   * Get blessings that haven't been recently selected
   */
  getAvailableBlessings() {
    return this.blessings.filter(blessing => !this.lastSelectedIds.has(blessing.id));
  }
  
  /**
   * Add blessing ID to recent selections
   */
  addToRecentSelections(blessingId) {
    this.lastSelectedIds.add(blessingId);
  }
  
  /**
   * Clean up recent selections if they exceed max size
   */
  cleanupRecentSelections() {
    if (this.lastSelectedIds.size > this.maxHistorySize) {
      // Convert to array, remove oldest entries, convert back to Set
      const recentArray = Array.from(this.lastSelectedIds);
      const keepCount = Math.floor(this.maxHistorySize * 0.7); // Keep 70% of max
      const toKeep = recentArray.slice(-keepCount);
      this.lastSelectedIds = new Set(toKeep);
    }
  }
  
  /**
   * Get blessing by ID
   */
  getBlessingById(id) {
    return this.blessings.find(blessing => blessing.id === id);
  }
  
  /**
   * Get blessings by category
   */
  getBlessingsByCategory(category) {
    return this.blessings.filter(blessing => 
      blessing.category && blessing.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  /**
   * Search blessings by text content
   */
  searchBlessings(query) {
    if (!query || query.trim().length === 0) {
      return this.blessings;
    }
    
    const searchTerm = query.toLowerCase().trim();
    
    return this.blessings.filter(blessing => {
      // Search in Arabic text
      if (blessing.arabic && blessing.arabic.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Search in English text
      if (blessing.english && blessing.english.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Search in tags
      if (blessing.tags && Array.isArray(blessing.tags)) {
        return blessing.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm)
        );
      }
      
      // Search in category
      if (blessing.category && blessing.category.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      return false;
    });
  }
  
  /**
   * Get all available categories
   */
  getCategories() {
    const categories = new Set();
    
    this.blessings.forEach(blessing => {
      if (blessing.category) {
        categories.add(blessing.category);
      }
    });
    
    return Array.from(categories).sort();
  }
  
  /**
   * Get blessing statistics
   */
  getStatistics() {
    return {
      total: this.blessings.length,
      categories: this.getCategories().length,
      recentlySelected: this.lastSelectedIds.size,
      available: this.getAvailableBlessings().length
    };
  }
  
  /**
   * Reset recent selections history
   */
  resetRecentSelections() {
    this.lastSelectedIds.clear();
    console.log('Recent selections history cleared');
  }
  
  /**
   * Handle initialization errors
   */
  handleInitializationError() {
    console.warn('Using fallback blessings due to initialization error');
    this.blessings = [...this.fallbackBlessings];
    this.isInitialized = true;
  }
  
  /**
   * Refresh blessings data
   */
  async refresh() {
    console.log('Refreshing blessings data...');
    this.isInitialized = false;
    this.blessings = [];
    await this.init();
  }
  
  /**
   * Export blessings data (for backup/sharing)
   */
  exportBlessings() {
    return {
      blessings: this.blessings,
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        count: this.blessings.length
      }
    };
  }
  
  /**
   * Import blessings data
   */
  importBlessings(data) {
    try {
      if (data && Array.isArray(data.blessings)) {
        const validBlessings = data.blessings.filter(blessing => 
          this.isValidBlessing(blessing)
        );
        
        if (validBlessings.length > 0) {
          this.blessings = validBlessings;
          this.resetRecentSelections();
          console.log(`Imported ${validBlessings.length} blessings`);
          return true;
        }
      }
      
      throw new Error('Invalid import data format');
      
    } catch (error) {
      console.error('Failed to import blessings:', error);
      return false;
    }
  }
}

// Make BlessingManager available globally
window.BlessingManager = BlessingManager;