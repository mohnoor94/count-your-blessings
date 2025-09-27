// Enhanced Storage Management with Beautiful Interactions

class BlessingStorage {
    constructor() {
        this.storageKey = 'alhamdulillah-app';
        this.defaultSettings = {
            language: 'both',
            theme: 'gradient',
            lastBlessingIndex: 0,
            history: [],
            visitCount: 0,
            lastVisit: null,
            preferences: {
                animations: true,
                notifications: false,
                autoAdvance: false
            }
        };
        this.init();
    }

    init() {
        // Initialize storage if not exists
        if (!this.getData()) {
            this.setData(this.defaultSettings);
        }
        
        // Update visit tracking
        this.updateVisitTracking();
    }

    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn('Error reading from localStorage:', error);
            return null;
        }
    }

    setData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn('Error writing to localStorage:', error);
            return false;
        }
    }

    updateData(updates) {
        const currentData = this.getData() || this.defaultSettings;
        const newData = { ...currentData, ...updates };
        return this.setData(newData);
    }

    // Settings Management
    getSetting(key) {
        const data = this.getData();
        return data ? data[key] : this.defaultSettings[key];
    }

    setSetting(key, value) {
        const data = this.getData() || this.defaultSettings;
        data[key] = value;
        return this.setData(data);
    }

    // Language Management
    getLanguage() {
        return this.getSetting('language');
    }

    setLanguage(language) {
        return this.setSetting('language', language);
    }

    // History Management
    getHistory() {
        return this.getSetting('history') || [];
    }

    addToHistory(blessingIndex) {
        const history = this.getHistory();
        
        // Avoid duplicates at the end
        if (history.length > 0 && history[history.length - 1] === blessingIndex) {
            return;
        }
        
        history.push(blessingIndex);
        
        // Keep only last 20 items
        if (history.length > 20) {
            history.shift();
        }
        
        return this.setSetting('history', history);
    }

    clearHistory() {
        return this.setSetting('history', []);
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
        const data = this.getData() || this.defaultSettings;
        data.visitCount = (data.visitCount || 0) + 1;
        data.lastVisit = new Date().toISOString();
        return this.setData(data);
    }

    getVisitCount() {
        return this.getSetting('visitCount') || 0;
    }

    getLastVisit() {
        return this.getSetting('lastVisit');
    }

    // Preferences Management
    getPreferences() {
        return this.getSetting('preferences') || this.defaultSettings.preferences;
    }

    setPreference(key, value) {
        const preferences = this.getPreferences();
        preferences[key] = value;
        return this.setSetting('preferences', preferences);
    }

    getPreference(key) {
        const preferences = this.getPreferences();
        return preferences[key];
    }

    // Data Export/Import
    exportData() {
        const data = this.getData();
        if (!data) return null;
        
        return {
            ...data,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    importData(importedData) {
        try {
            // Validate imported data
            if (!importedData || typeof importedData !== 'object') {
                throw new Error('Invalid data format');
            }
            
            // Merge with defaults to ensure all required fields exist
            const mergedData = { ...this.defaultSettings, ...importedData };
            
            // Remove export metadata
            delete mergedData.exportDate;
            delete mergedData.version;
            
            return this.setData(mergedData);
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Reset to defaults
    reset() {
        return this.setData(this.defaultSettings);
    }

    // Check if storage is available
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Get storage usage info
    getStorageInfo() {
        if (!this.isStorageAvailable()) {
            return { available: false };
        }

        const data = this.getData();
        const dataSize = data ? JSON.stringify(data).length : 0;
        
        return {
            available: true,
            dataSize: dataSize,
            dataSizeFormatted: this.formatBytes(dataSize),
            lastUpdate: data?.lastVisit || null
        };
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Create global storage instance
window.blessingStorage = new BlessingStorage();