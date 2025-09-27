/**
 * Storage Management Module
 * Handles local storage operations for user preferences and blessing history
 */

class StorageManager {
  constructor() {
    this.storagePrefix = 'blessing-reminder-';
    this.isAvailable = false;
    this.preferences = {};
    this.history = [];
    
    // Default preferences
    this.defaultPreferences = {
      language: 'english',
      theme: 'auto',
      animations: 'full',
      notifications: false,
      lastVisit: null,
      installPromptDismissed: false
    };
  }
  
  /**
   * Initialize storage manager
   */
  init() {
    try {
      console.log('Initializing Storage Manager...');
      
      // Check if localStorage is available
      this.checkStorageAvailability();
      
      if (this.isAvailable) {
        // Load existing data
        this.loadPreferences();
        this.loadHistory();
        
        // Update last visit
        this.updateLastVisit();
        
        console.log('Storage Manager initialized successfully');
      } else {
        console.warn('LocalStorage not available, using memory storage');
        this.initializeDefaults();
      }
      
    } catch (error) {
      console.error('Failed to initialize Storage Manager:', error);
      this.handleStorageError(error);
    }
  }
  
  /**
   * Check if localStorage is available
   */
  checkStorageAvailability() {
    try {
      const testKey = this.storagePrefix + 'test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.isAvailable = true;
    } catch (error) {
      this.isAvailable = false;
      console.warn('LocalStorage not available:', error.message);
    }
  }
  
  /**
   * Load user preferences from storage
   */
  loadPreferences() {
    try {
      const stored = localStorage.getItem(this.storagePrefix + 'preferences');
      
      if (stored) {
        const parsed = JSON.parse(stored);
        this.preferences = { ...this.defaultPreferences, ...parsed };
      } else {
        this.preferences = { ...this.defaultPreferences };
      }
      
      console.log('Preferences loaded:', this.preferences);
      
    } catch (error) {
      console.error('Failed to load preferences:', error);
      this.preferences = { ...this.defaultPreferences };
    }
  }
  
  /**
   * Save user preferences to storage
   */
  savePreferences() {
    if (!this.isAvailable) return false;
    
    try {
      const data = JSON.stringify(this.preferences);
      localStorage.setItem(this.storagePrefix + 'preferences', data);
      console.log('Preferences saved successfully');
      return true;
      
    } catch (error) {
      console.error('Failed to save preferences:', error);
      this.handleStorageError(error);
      return false;
    }
  }
  
  /**
   * Get user preferences
   */
  getPreferences() {
    return { ...this.preferences };
  }
  
  /**
   * Save a specific preference
   */
  savePreference(key, value) {
    this.preferences[key] = value;
    return this.savePreferences();
  }
  
  /**
   * Get a specific preference
   */
  getPreference(key, defaultValue = null) {
    return this.preferences.hasOwnProperty(key) 
      ? this.preferences[key] 
      : defaultValue;
  }
  
  /**
   * Load blessing history from storage
   */
  loadHistory() {
    try {
      const stored = localStorage.getItem(this.storagePrefix + 'history');
      
      if (stored) {
        const parsed = JSON.parse(stored);
        this.history = Array.isArray(parsed) ? parsed : [];
        
        // Sort by timestamp (newest first)
        this.history.sort((a, b) => b.timestamp - a.timestamp);
      } else {
        this.history = [];
      }
      
      console.log(`History loaded: ${this.history.length} entries`);
      
    } catch (error) {
      console.error('Failed to load history:', error);
      this.history = [];
    }
  }
  
  /**
   * Save blessing history to storage
   */
  saveHistory() {
    if (!this.isAvailable) return false;
    
    try {
      // Limit history size to prevent storage bloat
      const maxHistorySize = 1000;
      if (this.history.length > maxHistorySize) {
        this.history = this.history.slice(0, maxHistorySize);
      }
      
      const data = JSON.stringify(this.history);
      localStorage.setItem(this.storagePrefix + 'history', data);
      console.log('History saved successfully');
      return true;
      
    } catch (error) {
      console.error('Failed to save history:', error);
      this.handleStorageError(error);
      return false;
    }
  }
  
  /**
   * Add blessing to history
   */
  addToHistory(blessingId, language = 'english', marked = false) {
    const historyEntry = {
      blessingId: blessingId,
      timestamp: Date.now(),
      language: language,
      marked: marked
    };
    
    // Add to beginning of array (newest first)
    this.history.unshift(historyEntry);
    
    // Save to storage
    this.saveHistory();
    
    console.log('Added to history:', historyEntry);
    return historyEntry;
  }
  
  /**
   * Get blessing history
   */
  getHistory(limit = null) {
    const history = [...this.history];
    return limit ? history.slice(0, limit) : history;
  }
  
  /**
   * Remove specific entry from history
   */
  removeFromHistory(timestamp) {
    const initialLength = this.history.length;
    this.history = this.history.filter(entry => entry.timestamp !== timestamp);
    
    if (this.history.length < initialLength) {
      this.saveHistory();
      console.log('Removed entry from history');
      return true;
    }
    
    return false;
  }
  
  /**
   * Clear all history
   */
  clearHistory() {
    this.history = [];
    this.saveHistory();
    console.log('History cleared');
  }
  
  /**
   * Mark/unmark blessing in history
   */
  toggleHistoryMark(timestamp) {
    const entry = this.history.find(item => item.timestamp === timestamp);
    
    if (entry) {
      entry.marked = !entry.marked;
      this.saveHistory();
      console.log('History entry mark toggled:', entry);
      return entry.marked;
    }
    
    return false;
  }
  
  /**
   * Get marked blessings from history
   */
  getMarkedBlessings() {
    return this.history.filter(entry => entry.marked);
  }
  
  /**
   * Search history
   */
  searchHistory(query) {
    if (!query || query.trim().length === 0) {
      return this.history;
    }
    
    const searchTerm = query.toLowerCase().trim();
    
    return this.history.filter(entry => {
      // Search by blessing ID
      if (entry.blessingId.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Search by language
      if (entry.language.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      return false;
    });
  }
  
  /**
   * Get history statistics
   */
  getHistoryStatistics() {
    const stats = {
      total: this.history.length,
      marked: this.getMarkedBlessings().length,
      languages: {},
      dateRange: null
    };
    
    // Count by language
    this.history.forEach(entry => {
      stats.languages[entry.language] = (stats.languages[entry.language] || 0) + 1;
    });
    
    // Get date range
    if (this.history.length > 0) {
      const timestamps = this.history.map(entry => entry.timestamp);
      stats.dateRange = {
        oldest: Math.min(...timestamps),
        newest: Math.max(...timestamps)
      };
    }
    
    return stats;
  }
  
  /**
   * Update last visit timestamp
   */
  updateLastVisit() {
    this.savePreference('lastVisit', Date.now());
  }
  
  /**
   * Get storage usage information
   */
  getStorageInfo() {
    if (!this.isAvailable) {
      return { available: false };
    }
    
    try {
      let totalSize = 0;
      let appSize = 0;
      
      // Calculate total localStorage usage
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
          
          // Calculate app-specific usage
          if (key.startsWith(this.storagePrefix)) {
            appSize += localStorage[key].length + key.length;
          }
        }
      }
      
      return {
        available: true,
        totalSize: totalSize,
        appSize: appSize,
        entries: Object.keys(localStorage).filter(key => 
          key.startsWith(this.storagePrefix)
        ).length
      };
      
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { available: false, error: error.message };
    }
  }
  
  /**
   * Export all data
   */
  exportData() {
    return {
      preferences: this.preferences,
      history: this.history,
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0'
      }
    };
  }
  
  /**
   * Import data
   */
  importData(data) {
    try {
      if (data.preferences && typeof data.preferences === 'object') {
        this.preferences = { ...this.defaultPreferences, ...data.preferences };
        this.savePreferences();
      }
      
      if (data.history && Array.isArray(data.history)) {
        this.history = data.history.filter(entry => 
          entry && 
          typeof entry.blessingId === 'string' &&
          typeof entry.timestamp === 'number'
        );
        this.saveHistory();
      }
      
      console.log('Data imported successfully');
      return true;
      
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
  
  /**
   * Clear all app data
   */
  clearAllData() {
    if (!this.isAvailable) return false;
    
    try {
      // Remove all app-specific keys
      const keysToRemove = [];
      for (let key in localStorage) {
        if (key.startsWith(this.storagePrefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Reset in-memory data
      this.initializeDefaults();
      
      console.log('All app data cleared');
      return true;
      
    } catch (error) {
      console.error('Failed to clear data:', error);
      return false;
    }
  }
  
  /**
   * Initialize default values
   */
  initializeDefaults() {
    this.preferences = { ...this.defaultPreferences };
    this.history = [];
  }
  
  /**
   * Handle storage errors
   */
  handleStorageError(error) {
    console.error('Storage error:', error);
    
    // Check if it's a quota exceeded error
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      console.warn('Storage quota exceeded, attempting cleanup...');
      this.cleanupStorage();
    }
  }
  
  /**
   * Cleanup storage when quota is exceeded
   */
  cleanupStorage() {
    try {
      // Remove oldest history entries
      const maxHistorySize = 500;
      if (this.history.length > maxHistorySize) {
        this.history = this.history.slice(0, maxHistorySize);
        this.saveHistory();
        console.log('History cleaned up due to storage constraints');
      }
      
    } catch (error) {
      console.error('Failed to cleanup storage:', error);
    }
  }
}

// Make StorageManager available globally
window.StorageManager = StorageManager;