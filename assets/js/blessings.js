// Enhanced Blessing Management with History Tracking

class BlessingsManager {
    constructor() {
        this.blessings = [];
        this.currentIndex = 0;
        this.history = [];
        this.isLoaded = false;
        this.init();
    }

    async init() {
        await this.loadBlessings();
        this.initializeFromStorage();
        this.setupEventListeners();
    }

    async loadBlessings() {
        try {
            console.log('Attempting to load blessings from JSON...');
            
            // Try multiple possible paths
            const possiblePaths = [
                'assets/data/blessings.json',
                './assets/data/blessings.json',
                '/assets/data/blessings.json'
            ];
            
            let response = null;
            let successfulPath = null;
            
            for (const path of possiblePaths) {
                try {
                    console.log(`Trying path: ${path}`);
                    response = await fetch(path);
                    if (response.ok) {
                        successfulPath = path;
                        break;
                    }
                } catch (pathError) {
                    console.log(`Path ${path} failed:`, pathError.message);
                }
            }
            
            if (!response || !response.ok) {
                throw new Error(`All paths failed. Last status: ${response ? response.status : 'No response'}`);
            }
            
            console.log(`Successfully fetched from: ${successfulPath}`);
            console.log('Fetch response:', response.status, response.ok);
            
            const data = await response.json();
            console.log('JSON data loaded:', data);
            
            if (!data.blessings || !Array.isArray(data.blessings)) {
                throw new Error('Invalid JSON structure: missing or invalid blessings array');
            }
            
            console.log('Blessings array:', data.blessings);
            console.log('Number of blessings:', data.blessings.length);
            
            this.blessings = data.blessings;
            this.isLoaded = true;
            
            // Dispatch event to notify app
            document.dispatchEvent(new CustomEvent('blessingsLoaded', {
                detail: {
                    count: this.blessings.length,
                    categories: [...new Set(this.blessings.map(b => b.category))],
                    fallback: false
                }
            }));
            
            console.log(`Successfully loaded ${this.blessings.length} blessings from JSON`);
        } catch (error) {
            console.error('Error loading blessings:', error);
            console.log('Falling back to hardcoded blessings...');
            this.loadFallbackBlessings();
        }
    }

    loadFallbackBlessings() {
        // Extended fallback blessings if JSON fails to load
        this.blessings = [
            {
                id: "fallback-001",
                arabic: "الحمد لله رب العالمين",
                english: "Praise be to Allah, Lord of all the worlds",
                transliteration: "Alhamdulillahi rabbil alameen",
                category: "general",
                tags: ["praise", "gratitude", "lord", "worlds"]
            },
            {
                id: "fallback-002",
                arabic: "الحمد لله الذي أطعمنا وسقانا",
                english: "Praise be to Allah who has fed us and given us drink",
                transliteration: "Alhamdulillahi allathee at'amana wa saqana",
                category: "sustenance",
                tags: ["food", "drink", "sustenance", "nourishment"]
            },
            {
                id: "fallback-003",
                arabic: "الحمد لله الذي عافاني في بدني",
                english: "Praise be to Allah who has granted me health in my body",
                transliteration: "Alhamdulillahi allathee afanee fee badanee",
                category: "health",
                tags: ["health", "body", "wellness", "strength"]
            },
            {
                id: "fallback-004",
                arabic: "الحمد لله الذي كساني هذا الثوب",
                english: "Praise be to Allah who has clothed me with this garment",
                transliteration: "Alhamdulillahi allathee kasanee hatha ath-thawb",
                category: "sustenance",
                tags: ["clothing", "garment", "provision", "covering"]
            },
            {
                id: "fallback-005",
                arabic: "الحمد لله الذي آواني",
                english: "Praise be to Allah who has given me shelter",
                transliteration: "Alhamdulillahi allathee awanee",
                category: "sustenance",
                tags: ["shelter", "home", "protection", "refuge"]
            },
            {
                id: "fallback-006",
                arabic: "الحمد لله الذي هداني للإسلام",
                english: "Praise be to Allah who has guided me to Islam",
                transliteration: "Alhamdulillahi allathee hadanee lil-Islam",
                category: "guidance",
                tags: ["guidance", "Islam", "faith", "direction"]
            },
            {
                id: "fallback-007",
                arabic: "الحمد لله الذي علمني ما لم أكن أعلم",
                english: "Praise be to Allah who has taught me what I did not know",
                transliteration: "Alhamdulillahi allathee allamanee ma lam akun a'lam",
                category: "knowledge",
                tags: ["knowledge", "learning", "education", "wisdom"]
            },
            {
                id: "fallback-008",
                arabic: "الحمد لله الذي بنعمته تتم الصالحات",
                english: "Praise be to Allah, by whose grace good deeds are completed",
                transliteration: "Alhamdulillahi allathee bi ni'matihi tatimmu as-salihat",
                category: "general",
                tags: ["grace", "good deeds", "completion", "blessing"]
            },
            {
                id: "fallback-009",
                arabic: "الحمد لله الذي أحياني بعد ما أماتني",
                english: "Praise be to Allah who has given me life after death (sleep)",
                transliteration: "Alhamdulillahi allathee ahyanee ba'da ma amatanee",
                category: "general",
                tags: ["life", "awakening", "sleep", "renewal"]
            },
            {
                id: "fallback-010",
                arabic: "الحمد لله الذي رزقني الأهل والولد",
                english: "Praise be to Allah who has blessed me with family and children",
                transliteration: "Alhamdulillahi allathee razaqanee al-ahl wal-walad",
                category: "family",
                tags: ["family", "children", "blessing", "relationships"]
            }
        ];
        this.isLoaded = true;
        console.log('Loaded fallback blessings - total:', this.blessings.length);
        
        // Dispatch event to notify app even with fallback
        document.dispatchEvent(new CustomEvent('blessingsLoaded', {
            detail: {
                count: this.blessings.length,
                categories: [...new Set(this.blessings.map(b => b.category))],
                fallback: true
            }
        }));
    }

    initializeFromStorage() {
        if (!window.blessingStorage) return;
        
        // Load last blessing index
        const lastIndex = window.blessingStorage.getLastBlessingIndex();
        if (lastIndex !== undefined && lastIndex < this.blessings.length) {
            this.currentIndex = lastIndex;
        }
        
        // Load history from storage
        this.history = window.blessingStorage.getHistory() || [];
    }

    setupEventListeners() {
        // Listen for language changes to update history display
        document.addEventListener('languageChanged', () => {
            this.updateHistoryDisplay();
        });
    }

    getCurrentBlessing() {
        if (!this.isLoaded || this.blessings.length === 0) return null;
        return this.blessings[this.currentIndex] || this.blessings[0];
    }

    getCurrentIndex() {
        return this.currentIndex;
    }

    getNewBlessing() {
        if (!this.isLoaded || this.blessings.length === 0) return null;
        
        const currentBlessing = this.getCurrentBlessing();
        
        // Add current blessing to history before getting new one
        if (currentBlessing) {
            this.addToHistory(currentBlessing);
        }
        
        // Get next blessing with history avoidance
        const nextBlessing = this.selectNextBlessing();
        
        // Update current index
        this.currentIndex = this.blessings.findIndex(b => b.id === nextBlessing.id);
        
        // Save to storage
        if (window.blessingStorage) {
            window.blessingStorage.setLastBlessingIndex(this.currentIndex);
        }
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('blessingChanged', {
            detail: { blessing: nextBlessing, index: this.currentIndex }
        }));
        
        return nextBlessing;
    }

    selectNextBlessing() {
        if (this.blessings.length === 0) return null;
        if (this.blessings.length === 1) return this.blessings[0];
        
        // Get recently viewed blessing IDs (last 5)
        const recentIds = this.history
            .slice(-5)
            .map(entry => entry.blessingId);
        
        // Filter out recently viewed blessings
        const availableBlessings = this.blessings.filter(blessing => 
            !recentIds.includes(blessing.id)
        );
        
        // If all blessings have been seen recently, use all blessings
        const candidateBlessings = availableBlessings.length > 0 
            ? availableBlessings 
            : this.blessings;
        
        // Select random blessing from candidates
        const randomIndex = Math.floor(Math.random() * candidateBlessings.length);
        return candidateBlessings[randomIndex];
    }

    addToHistory(blessing) {
        if (!blessing || !window.blessingStorage) return;
        
        const currentLanguage = window.languageManager 
            ? window.languageManager.getCurrentLanguage() 
            : 'english';
        
        // Check if this blessing already exists in local history
        const existingIndex = this.history.findIndex(entry => entry.blessingId === blessing.id);
        
        if (existingIndex !== -1) {
            // Remove existing entry and preserve its marked status
            const existingEntry = this.history.splice(existingIndex, 1)[0];
            
            // Create new entry with updated timestamp but preserve marked status
            const historyEntry = {
                blessingId: blessing.id,
                timestamp: Date.now(),
                language: currentLanguage,
                marked: existingEntry.marked // Preserve favorite status
            };
            
            // Add to end (most recent)
            this.history.push(historyEntry);
        } else {
            // Create new history entry
            const historyEntry = {
                blessingId: blessing.id,
                timestamp: Date.now(),
                language: currentLanguage,
                marked: false
            };
            
            this.history.push(historyEntry);
        }
        
        // Keep only last 50 entries
        if (this.history.length > 50) {
            this.history.shift();
        }
        
        // Save to storage (this also has duplicate prevention)
        window.blessingStorage.addToHistory({
            id: blessing.id,
            language: currentLanguage
        });
        
        // Update history display
        this.updateHistoryDisplay();
    }

    getHistory() {
        return this.history.map(entry => {
            const blessing = this.blessings.find(b => b.id === entry.blessingId);
            return blessing ? { ...blessing, ...entry } : null;
        }).filter(Boolean);
    }

    getBlessingById(id) {
        return this.blessings.find(blessing => blessing.id === id);
    }

    markBlessingInHistory(blessingId, marked = true) {
        // Update local history
        const entry = this.history.find(h => h.blessingId === blessingId);
        if (entry) {
            entry.marked = marked;
        }
        
        // Update storage
        if (window.blessingStorage) {
            window.blessingStorage.markBlessingInHistory(blessingId, marked);
        }
        
        // Update display
        this.updateHistoryDisplay();
    }

    removeFromHistory(blessingId, timestamp) {
        // Remove from local history
        this.history = this.history.filter(entry => 
            !(entry.blessingId === blessingId && entry.timestamp === timestamp)
        );
        
        // Update storage
        if (window.blessingStorage) {
            window.blessingStorage.setHistory(this.history);
        }
        
        // Update display
        this.updateHistoryDisplay();
    }

    clearHistory() {
        this.history = [];
        
        // Clear storage
        if (window.blessingStorage) {
            window.blessingStorage.clearHistory();
        }
        
        // Update display
        this.updateHistoryDisplay();
        
        // Show notification
        if (window.showNotification) {
            window.showNotification('History cleared successfully', 'info');
        }
    }

    updateHistoryDisplay() {
        // Dispatch event for UI to update
        document.dispatchEvent(new CustomEvent('historyUpdated', {
            detail: { history: this.getHistory() }
        }));
    }

    searchHistory(query) {
        if (!query) return this.getHistory();
        
        const lowerQuery = query.toLowerCase();
        return this.getHistory().filter(blessing => 
            blessing.english.toLowerCase().includes(lowerQuery) ||
            blessing.arabic.includes(query) ||
            blessing.category.toLowerCase().includes(lowerQuery) ||
            blessing.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    getHistoryByCategory(category) {
        return this.getHistory().filter(blessing => 
            blessing.category === category
        );
    }

    getHistoryByDateRange(startDate, endDate) {
        return this.getHistory().filter(blessing => 
            blessing.timestamp >= startDate && blessing.timestamp <= endDate
        );
    }

    getHistoryStats() {
        const history = this.getHistory();
        const categories = {};
        const languages = {};
        let markedCount = 0;
        
        history.forEach(blessing => {
            // Count categories
            categories[blessing.category] = (categories[blessing.category] || 0) + 1;
            
            // Count languages
            languages[blessing.language] = (languages[blessing.language] || 0) + 1;
            
            // Count marked
            if (blessing.marked) markedCount++;
        });
        
        return {
            total: history.length,
            categories,
            languages,
            marked: markedCount,
            oldest: history.length > 0 ? Math.min(...history.map(h => h.timestamp)) : null,
            newest: history.length > 0 ? Math.max(...history.map(h => h.timestamp)) : null
        };
    }

    exportHistory() {
        const history = this.getHistory();
        const stats = this.getHistoryStats();
        
        return {
            history,
            stats,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    importHistory(data) {
        if (!data || !Array.isArray(data.history)) {
            console.error('Invalid history data format');
            return false;
        }
        
        try {
            // Validate and convert history entries
            const validEntries = data.history
                .filter(entry => entry.blessingId && entry.timestamp)
                .map(entry => ({
                    blessingId: entry.blessingId,
                    timestamp: entry.timestamp,
                    language: entry.language || 'english',
                    marked: Boolean(entry.marked)
                }));
            
            // Update local history
            this.history = validEntries;
            
            // Save to storage
            if (window.blessingStorage) {
                window.blessingStorage.setHistory(this.history);
            }
            
            // Update display
            this.updateHistoryDisplay();
            
            if (window.showNotification) {
                window.showNotification(`Imported ${validEntries.length} history entries`, 'success');
            }
            
            return true;
        } catch (error) {
            console.error('Error importing history:', error);
            if (window.showNotification) {
                window.showNotification('Failed to import history', 'error');
            }
            return false;
        }
    }

    // Utility methods
    getTotalBlessingsCount() {
        return this.blessings.length;
    }

    getCategories() {
        return [...new Set(this.blessings.map(b => b.category))];
    }

    getBlessingsByCategory(category) {
        return this.blessings.filter(b => b.category === category);
    }

    isLoaded() {
        return this.isLoaded;
    }
}

// Create global instance
window.blessingsManager = new BlessingsManager();