// Enhanced Storage Management with Beautiful Interactions

class BlessingStorage {
    constructor() {
        this.storageKey = 'alhamdulillah-app';
        this.historyKey = 'alhamdulillah-history';
        this.preferencesKey = 'alhamdulillah-preferences';
        
        // Default user preferences based on design document
        this.defaultPreferences = {
            language: 'english',
            theme: 'light',
            animations: 'full',
            notifications: false,
            lastVisit: 0,
            installPromptDismissed: false
        };
        
        // Default app data
        this.defaultData = {
            lastBlessingIndex: 0,
            visitCount: 0,
            initialized: true
        };
        
        // Storage availability flag
        this.storageAvailable = this.checkStorageAvailability();
        
        this.init();
    }

    init() {
        if (!this.storageAvailable) {
            console.warn('LocalStorage is not available. App will function with limited features.');
            this.showStorageUnavailableMessage();
            return;
        }
        
        // Initialize preferences if not exists
        if (!this.getPreferences()) {
            this.setPreferences(this.defaultPreferences);
        }
        
        // Initialize app data if not exists
        if (!this.getData()) {
            this.setData(this.defaultData);
        }
        
        // Update visit tracking
        this.updateVisitTracking();
    }
    
    checkStorageAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    showStorageUnavailableMessage() {
        // This method can be called by the main app to show a user-friendly message
        if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification('Storage unavailable. History and preferences will not be saved.', 'warning');
        }
    }

    getData() {
        if (!this.storageAvailable) {
            return this.defaultData;
        }
        
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) return null;
            
            const parsed = JSON.parse(data);
            // Validate data structure
            if (typeof parsed !== 'object' || parsed === null) {
                console.warn('Invalid data structure in localStorage, resetting to defaults');
                this.setData(this.defaultData);
                return this.defaultData;
            }
            
            return parsed;
        } catch (error) {
            console.warn('Error reading app data from localStorage:', error);
            // Handle corrupted data gracefully
            this.handleCorruptedData('app data');
            return this.defaultData;
        }
    }

    setData(data) {
        if (!this.storageAvailable) {
            return false;
        }
        
        try {
            // Validate data before storing
            if (typeof data !== 'object' || data === null) {
                console.error('Invalid data provided to setData');
                return false;
            }
            
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn('Error writing app data to localStorage:', error);
            this.handleStorageError(error);
            return false;
        }
    }

    updateData(updates) {
        const currentData = this.getData() || this.defaultData;
        const newData = { ...currentData, ...updates };
        return this.setData(newData);
    }

    // Enhanced Preferences Management
    getPreferences() {
        if (!this.storageAvailable) {
            return this.defaultPreferences;
        }
        
        try {
            const prefs = localStorage.getItem(this.preferencesKey);
            if (!prefs) return null;
            
            const parsed = JSON.parse(prefs);
            // Merge with defaults to ensure all required fields exist
            return { ...this.defaultPreferences, ...parsed };
        } catch (error) {
            console.warn('Error reading preferences from localStorage:', error);
            this.handleCorruptedData('preferences');
            return this.defaultPreferences;
        }
    }

    setPreferences(preferences) {
        if (!this.storageAvailable) {
            return false;
        }
        
        try {
            // Validate preferences structure
            if (typeof preferences !== 'object' || preferences === null) {
                console.error('Invalid preferences provided');
                return false;
            }
            
            // Merge with current preferences to avoid losing data
            const currentPrefs = this.getPreferences() || this.defaultPreferences;
            const updatedPrefs = { ...currentPrefs, ...preferences };
            
            localStorage.setItem(this.preferencesKey, JSON.stringify(updatedPrefs));
            return true;
        } catch (error) {
            console.warn('Error writing preferences to localStorage:', error);
            this.handleStorageError(error);
            return false;
        }
    }

    getPreference(key) {
        const preferences = this.getPreferences();
        return preferences ? preferences[key] : this.defaultPreferences[key];
    }

    setPreference(key, value) {
        const preferences = this.getPreferences() || this.defaultPreferences;
        preferences[key] = value;
        return this.setPreferences(preferences);
    }

    // Settings Management (legacy support)
    getSetting(key) {
        // Check if it's a preference first
        if (key in this.defaultPreferences) {
            return this.getPreference(key);
        }
        
        const data = this.getData();
        return data ? data[key] : this.defaultData[key];
    }

    setSetting(key, value) {
        // Check if it's a preference first
        if (key in this.defaultPreferences) {
            return this.setPreference(key, value);
        }
        
        const data = this.getData() || this.defaultData;
        data[key] = value;
        return this.setData(data);
    }

    // Language Management
    getLanguage() {
        return this.getPreference('language');
    }

    setLanguage(language) {
        // Validate language value
        const validLanguages = ['arabic', 'english'];
        if (!validLanguages.includes(language)) {
            console.warn(`Invalid language: ${language}. Using default.`);
            language = this.defaultPreferences.language;
        }
        
        return this.setPreference('language', language);
    }

    // Theme Management
    getTheme() {
        return this.getPreference('theme');
    }

    setTheme(theme) {
        // Validate theme value
        const validThemes = ['light', 'dark', 'auto'];
        if (!validThemes.includes(theme)) {
            console.warn(`Invalid theme: ${theme}. Using default.`);
            theme = this.defaultPreferences.theme;
        }
        
        return this.setPreference('theme', theme);
    }

    // Animation Preferences
    getAnimationPreference() {
        return this.getPreference('animations');
    }

    setAnimationPreference(animations) {
        // Validate animation value
        const validAnimations = ['full', 'reduced', 'off'];
        if (!validAnimations.includes(animations)) {
            console.warn(`Invalid animation preference: ${animations}. Using default.`);
            animations = this.defaultPreferences.animations;
        }
        
        return this.setPreference('animations', animations);
    }

    // Enhanced History Management
    getHistory() {
        if (!this.storageAvailable) {
            return [];
        }
        
        try {
            const history = localStorage.getItem(this.historyKey);
            if (!history) return [];
            
            const parsed = JSON.parse(history);
            // Validate history structure
            if (!Array.isArray(parsed)) {
                console.warn('Invalid history structure, resetting to empty array');
                this.clearHistory();
                return [];
            }
            
            return parsed;
        } catch (error) {
            console.warn('Error reading history from localStorage:', error);
            this.handleCorruptedData('history');
            return [];
        }
    }

    setHistory(history) {
        if (!this.storageAvailable) {
            return false;
        }
        
        try {
            if (!Array.isArray(history)) {
                console.error('History must be an array');
                return false;
            }
            
            localStorage.setItem(this.historyKey, JSON.stringify(history));
            return true;
        } catch (error) {
            console.warn('Error writing history to localStorage:', error);
            this.handleStorageError(error);
            return false;
        }
    }

    addToHistory(blessingData) {
        if (!this.storageAvailable) {
            return false;
        }
        
        const history = this.getHistory();
        const blessingId = blessingData.id || blessingData.index || Date.now().toString();
        
        // Find existing entry for this blessing
        const existingIndex = history.findIndex(entry => entry.blessingId === blessingId);
        
        if (existingIndex !== -1) {
            // Remove existing entry and preserve its marked status
            const existingEntry = history.splice(existingIndex, 1)[0];
            
            // Create new entry with updated timestamp but preserve marked status
            const historyEntry = {
                blessingId: blessingId,
                timestamp: Date.now(),
                language: blessingData.language || this.getPreference('language'),
                marked: existingEntry.marked // Preserve favorite status
            };
            
            // Add to end (most recent)
            history.push(historyEntry);
        } else {
            // Create new history entry
            const historyEntry = {
                blessingId: blessingId,
                timestamp: Date.now(),
                language: blessingData.language || this.getPreference('language'),
                marked: false
            };
            
            history.push(historyEntry);
        }
        
        // Keep only last 50 items to prevent storage bloat
        if (history.length > 50) {
            history.shift();
        }
        
        return this.setHistory(history);
    }

    clearHistory() {
        return this.setHistory([]);
    }

    markBlessingInHistory(blessingId, marked = true) {
        const history = this.getHistory();
        let updated = false;
        
        history.forEach(entry => {
            if (entry.blessingId === blessingId) {
                entry.marked = marked;
                updated = true;
            }
        });
        
        return updated ? this.setHistory(history) : false;
    }

    // Blessing Index Management
    getLastBlessingIndex() {
        return this.getSetting('lastBlessingIndex');
    }

    setLastBlessingIndex(index) {
        return this.setSetting('lastBlessingIndex', index);
    }

    // Visit Tracking
    updateVisitTracking() {
        if (!this.storageAvailable) {
            return false;
        }
        
        const data = this.getData() || this.defaultData;
        data.visitCount = (data.visitCount || 0) + 1;
        
        // Update last visit in preferences
        this.setPreference('lastVisit', Date.now());
        
        return this.setData(data);
    }

    getVisitCount() {
        const data = this.getData();
        return data ? data.visitCount || 0 : 0;
    }

    getLastVisit() {
        return this.getPreference('lastVisit');
    }

    // Error Handling Methods
    handleStorageError(error) {
        console.error('Storage operation failed:', error);
        
        // Check if it's a quota exceeded error
        if (error.name === 'QuotaExceededError' || error.code === 22) {
            this.handleQuotaExceeded();
        }
        
        // Notify the app about storage issues
        if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification('Storage operation failed. Some features may not work properly.', 'error');
        }
    }

    handleCorruptedData(dataType) {
        console.warn(`Corrupted ${dataType} detected, resetting to defaults`);
        
        switch (dataType) {
            case 'preferences':
                this.setPreferences(this.defaultPreferences);
                break;
            case 'history':
                this.clearHistory();
                break;
            case 'app data':
                this.setData(this.defaultData);
                break;
        }
        
        if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification(`${dataType} was corrupted and has been reset.`, 'warning');
        }
    }

    handleQuotaExceeded() {
        console.warn('Storage quota exceeded, attempting cleanup');
        
        // Try to free up space by removing old history entries
        const history = this.getHistory();
        if (history.length > 20) {
            const trimmedHistory = history.slice(-20);
            this.setHistory(trimmedHistory);
            console.log('Trimmed history to free up storage space');
        }
        
        if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification('Storage space low. Old history entries have been removed.', 'warning');
        }
    }

    // Data Export/Import
    exportData() {
        if (!this.storageAvailable) {
            return null;
        }
        
        const data = this.getData();
        const preferences = this.getPreferences();
        const history = this.getHistory();
        
        if (!data && !preferences && !history.length) {
            return null;
        }
        
        return {
            appData: data || this.defaultData,
            preferences: preferences || this.defaultPreferences,
            history: history,
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
    }

    importData(importedData) {
        if (!this.storageAvailable) {
            console.warn('Cannot import data: storage unavailable');
            return false;
        }
        
        try {
            // Validate imported data
            if (!importedData || typeof importedData !== 'object') {
                throw new Error('Invalid data format');
            }
            
            let success = true;
            
            // Import app data
            if (importedData.appData) {
                const mergedData = { ...this.defaultData, ...importedData.appData };
                delete mergedData.exportDate;
                delete mergedData.version;
                success = this.setData(mergedData) && success;
            }
            
            // Import preferences
            if (importedData.preferences) {
                const mergedPrefs = { ...this.defaultPreferences, ...importedData.preferences };
                success = this.setPreferences(mergedPrefs) && success;
            }
            
            // Import history
            if (importedData.history && Array.isArray(importedData.history)) {
                success = this.setHistory(importedData.history) && success;
            }
            
            if (success && typeof window !== 'undefined' && window.showNotification) {
                window.showNotification('Data imported successfully!', 'success');
            }
            
            return success;
        } catch (error) {
            console.error('Error importing data:', error);
            if (typeof window !== 'undefined' && window.showNotification) {
                window.showNotification('Failed to import data. Please check the file format.', 'error');
            }
            return false;
        }
    }

    // Reset to defaults
    reset() {
        if (!this.storageAvailable) {
            return false;
        }
        
        const success = this.setData(this.defaultData) && 
                       this.setPreferences(this.defaultPreferences) && 
                       this.clearHistory();
        
        if (success && typeof window !== 'undefined' && window.showNotification) {
            window.showNotification('All data has been reset to defaults.', 'info');
        }
        
        return success;
    }

    // Check if storage is available
    isStorageAvailable() {
        return this.storageAvailable;
    }

    // Get comprehensive storage usage info
    getStorageInfo() {
        if (!this.isStorageAvailable()) {
            return { 
                available: false,
                reason: 'LocalStorage is not supported or disabled'
            };
        }

        const data = this.getData();
        const preferences = this.getPreferences();
        const history = this.getHistory();
        
        const dataSize = data ? JSON.stringify(data).length : 0;
        const preferencesSize = preferences ? JSON.stringify(preferences).length : 0;
        const historySize = history ? JSON.stringify(history).length : 0;
        const totalSize = dataSize + preferencesSize + historySize;
        
        return {
            available: true,
            totalSize: totalSize,
            totalSizeFormatted: this.formatBytes(totalSize),
            breakdown: {
                appData: {
                    size: dataSize,
                    formatted: this.formatBytes(dataSize)
                },
                preferences: {
                    size: preferencesSize,
                    formatted: this.formatBytes(preferencesSize)
                },
                history: {
                    size: historySize,
                    formatted: this.formatBytes(historySize),
                    entries: history.length
                }
            },
            lastUpdate: this.getLastVisit(),
            visitCount: this.getVisitCount()
        };
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Utility method to check if user is a returning visitor
    isReturningUser() {
        return this.getVisitCount() > 1;
    }

    // Utility method to get user's preferred settings summary
    getUserSettingsSummary() {
        const preferences = this.getPreferences();
        const history = this.getHistory();
        
        return {
            language: preferences.language,
            theme: preferences.theme,
            animations: preferences.animations,
            notifications: preferences.notifications,
            historyCount: history.length,
            visitCount: this.getVisitCount(),
            lastVisit: preferences.lastVisit,
            isReturningUser: this.isReturningUser()
        };
    }

    // Method to validate all stored data integrity
    validateDataIntegrity() {
        if (!this.storageAvailable) {
            return { valid: false, reason: 'Storage unavailable' };
        }

        const issues = [];
        
        // Check app data
        const data = this.getData();
        if (data && typeof data !== 'object') {
            issues.push('App data is not an object');
        }
        
        // Check preferences
        const preferences = this.getPreferences();
        if (preferences && typeof preferences !== 'object') {
            issues.push('Preferences data is not an object');
        }
        
        // Check history
        const history = this.getHistory();
        if (!Array.isArray(history)) {
            issues.push('History is not an array');
        }
        
        return {
            valid: issues.length === 0,
            issues: issues,
            checkedAt: Date.now()
        };
    }
}

// Create global storage instance
window.blessingStorage = new BlessingStorage();