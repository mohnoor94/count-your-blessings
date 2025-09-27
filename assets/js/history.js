// History Management System

class HistoryManager {
    constructor() {
        this.elements = {};
        this.isSearchPanelVisible = false;
        this.isHistoryCollapsed = false;
        this.currentSearchQuery = '';
        this.currentCategoryFilter = '';
        this.currentLanguageFilter = '';
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.populateFilters();
        this.updateDisplay();
    }

    cacheElements() {
        this.elements = {
            historyContainer: document.getElementById('history-container'),
            historySearchBtn: document.getElementById('history-search-btn'),
            historyClearBtn: document.getElementById('history-clear-btn'),
            historyToggleBtn: document.getElementById('history-toggle-btn'),
            historySearchPanel: document.getElementById('history-search-panel'),
            historySearchInput: document.getElementById('history-search-input'),
            historySearchClear: document.getElementById('history-search-clear'),
            historyCategoryFilter: document.getElementById('history-category-filter'),
            historyLanguageFilter: document.getElementById('history-language-filter'),
            statsTotal: document.getElementById('stats-total'),
            statsFavorites: document.getElementById('stats-favorites'),
            historyStats: document.getElementById('history-stats')
        };
    }

    setupEventListeners() {
        // Search button
        if (this.elements.historySearchBtn) {
            this.elements.historySearchBtn.addEventListener('click', () => {
                this.toggleSearchPanel();
            });
        }

        // Clear history button
        if (this.elements.historyClearBtn) {
            this.elements.historyClearBtn.addEventListener('click', () => {
                this.showClearConfirmation();
            });
        }

        // Toggle history button
        if (this.elements.historyToggleBtn) {
            this.elements.historyToggleBtn.addEventListener('click', () => {
                this.toggleHistoryVisibility();
            });
        }

        // Search input
        if (this.elements.historySearchInput) {
            this.elements.historySearchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
        }

        // Search clear button
        if (this.elements.historySearchClear) {
            this.elements.historySearchClear.addEventListener('click', () => {
                this.clearSearch();
            });
        }

        // Filter selects
        if (this.elements.historyCategoryFilter) {
            this.elements.historyCategoryFilter.addEventListener('change', (e) => {
                this.currentCategoryFilter = e.target.value;
                this.updateDisplay();
            });
        }

        if (this.elements.historyLanguageFilter) {
            this.elements.historyLanguageFilter.addEventListener('change', (e) => {
                this.currentLanguageFilter = e.target.value;
                this.updateDisplay();
            });
        }

        // Listen for history updates
        document.addEventListener('historyUpdated', (e) => {
            this.updateDisplay();
        });

        // Listen for blessings loaded to populate filters
        document.addEventListener('blessingsLoaded', () => {
            this.populateFilters();
        });
    }

    toggleSearchPanel() {
        this.isSearchPanelVisible = !this.isSearchPanelVisible;
        
        if (this.elements.historySearchPanel) {
            if (this.isSearchPanelVisible) {
                this.elements.historySearchPanel.classList.add('active');
                // Focus on search input
                setTimeout(() => {
                    if (this.elements.historySearchInput) {
                        this.elements.historySearchInput.focus();
                    }
                }, 100);
            } else {
                this.elements.historySearchPanel.classList.remove('active');
                this.clearSearch();
            }
        }
    }

    toggleHistoryVisibility() {
        this.isHistoryCollapsed = !this.isHistoryCollapsed;
        
        if (this.elements.historyContainer) {
            if (this.isHistoryCollapsed) {
                this.elements.historyContainer.classList.add('collapsed');
            } else {
                this.elements.historyContainer.classList.remove('collapsed');
            }
        }

        if (this.elements.historyStats) {
            if (this.isHistoryCollapsed) {
                this.elements.historyStats.classList.add('collapsed');
            } else {
                this.elements.historyStats.classList.remove('collapsed');
            }
        }

        // Update toggle button icon
        if (this.elements.historyToggleBtn) {
            if (this.isHistoryCollapsed) {
                this.elements.historyToggleBtn.classList.add('collapsed');
            } else {
                this.elements.historyToggleBtn.classList.remove('collapsed');
            }
        }
    }

    handleSearchInput(query) {
        this.currentSearchQuery = query.toLowerCase();
        
        // Show/hide clear button
        if (this.elements.historySearchClear) {
            if (query.length > 0) {
                this.elements.historySearchClear.classList.add('visible');
            } else {
                this.elements.historySearchClear.classList.remove('visible');
            }
        }
        
        // Update display with debouncing
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.updateDisplay();
        }, 300);
    }

    clearSearch() {
        this.currentSearchQuery = '';
        if (this.elements.historySearchInput) {
            this.elements.historySearchInput.value = '';
        }
        if (this.elements.historySearchClear) {
            this.elements.historySearchClear.classList.remove('visible');
        }
        this.updateDisplay();
    }

    populateFilters() {
        if (!window.blessingsManager || !this.elements.historyCategoryFilter) return;
        
        const categories = window.blessingsManager.getCategories();
        
        // Clear existing options (except "All Categories")
        const categoryFilter = this.elements.historyCategoryFilter;
        while (categoryFilter.children.length > 1) {
            categoryFilter.removeChild(categoryFilter.lastChild);
        }
        
        // Add category options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categoryFilter.appendChild(option);
        });
    }

    updateDisplay() {
        if (!this.elements.historyContainer || !window.blessingsManager) return;
        
        const history = this.getFilteredHistory();
        this.renderHistory(history);
        this.updateStats(history);
    }

    getFilteredHistory() {
        if (!window.blessingsManager) return [];
        
        let history = window.blessingsManager.getHistory();
        
        // Apply search filter
        if (this.currentSearchQuery) {
            history = history.filter(blessing => 
                blessing.english.toLowerCase().includes(this.currentSearchQuery) ||
                blessing.arabic.includes(this.currentSearchQuery) ||
                blessing.category.toLowerCase().includes(this.currentSearchQuery) ||
                (blessing.tags && blessing.tags.some(tag => 
                    tag.toLowerCase().includes(this.currentSearchQuery)
                ))
            );
        }
        
        // Apply category filter
        if (this.currentCategoryFilter) {
            history = history.filter(blessing => 
                blessing.category === this.currentCategoryFilter
            );
        }
        
        // Apply language filter
        if (this.currentLanguageFilter) {
            history = history.filter(blessing => 
                blessing.language === this.currentLanguageFilter
            );
        }
        
        // Sort by timestamp (newest first)
        return history.sort((a, b) => b.timestamp - a.timestamp);
    }

    renderHistory(history) {
        if (!this.elements.historyContainer) return;
        
        // Clear existing content
        this.elements.historyContainer.innerHTML = '';
        
        if (history.length === 0) {
            this.renderEmptyState();
            return;
        }
        
        // Render history items
        history.forEach((blessing, index) => {
            const card = this.createHistoryCard(blessing, index);
            this.elements.historyContainer.appendChild(card);
        });
    }

    renderEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'history-empty';
        emptyState.innerHTML = `
            <svg class="history-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20m8-10H4"></path>
            </svg>
            <div class="history-empty-text">
                ${this.currentSearchQuery || this.currentCategoryFilter || this.currentLanguageFilter 
                    ? 'No blessings found matching your filters.' 
                    : 'Your blessing history will appear here as you explore.'}
            </div>
        `;
        this.elements.historyContainer.appendChild(emptyState);
    }

    createHistoryCard(blessing, index) {
        const card = document.createElement('div');
        card.className = `history-card slide-in-up ${blessing.marked ? 'marked' : ''}`;
        card.style.animationDelay = `${index * 50}ms`;
        
        const timestamp = new Date(blessing.timestamp);
        const timeString = this.formatTimestamp(timestamp);
        
        // Get current language for display
        const currentLanguage = window.languageManager 
            ? window.languageManager.getCurrentLanguage() 
            : 'both';
        
        card.innerHTML = `
            <div class="history-card-header">
                <span class="history-card-timestamp">${timeString}</span>
                <div class="history-card-actions">
                    <button class="history-card-btn favorite ${blessing.marked ? 'active' : ''}" 
                            data-blessing-id="${blessing.id}" 
                            data-timestamp="${blessing.timestamp}"
                            aria-label="Toggle Favorite">
                        <svg viewBox="0 0 24 24" fill="${blessing.marked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                        </svg>
                    </button>
                    <button class="history-card-btn delete" 
                            data-blessing-id="${blessing.id}" 
                            data-timestamp="${blessing.timestamp}"
                            aria-label="Delete from History">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="history-card-content">
                ${this.shouldShowLanguage('english', currentLanguage, blessing.language) 
                    ? `<p class="blessing-english" lang="en" dir="ltr">${blessing.english}</p>` 
                    : ''}
                ${this.shouldShowLanguage('arabic', currentLanguage, blessing.language) 
                    ? `<p class="blessing-arabic" lang="ar" dir="rtl">${blessing.arabic}</p>` 
                    : ''}
                <div class="history-card-category">${blessing.category}</div>
            </div>
        `;
        
        // Add event listeners
        this.setupCardEventListeners(card);
        
        return card;
    }

    shouldShowLanguage(language, currentLanguage, blessingLanguage) {
        if (currentLanguage === 'both') return true;
        if (currentLanguage === language) return true;
        if (currentLanguage === 'auto' && blessingLanguage === language) return true;
        return false;
    }

    setupCardEventListeners(card) {
        // Favorite button
        const favoriteBtn = card.querySelector('.favorite');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavorite(
                    favoriteBtn.dataset.blessingId,
                    parseInt(favoriteBtn.dataset.timestamp)
                );
            });
        }
        
        // Delete button
        const deleteBtn = card.querySelector('.delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showDeleteConfirmation(
                    deleteBtn.dataset.blessingId,
                    parseInt(deleteBtn.dataset.timestamp)
                );
            });
        }
        
        // Card click to show blessing
        card.addEventListener('click', () => {
            const blessingId = card.querySelector('[data-blessing-id]').dataset.blessingId;
            this.showBlessingFromHistory(blessingId);
        });
    }

    toggleFavorite(blessingId, timestamp) {
        if (!window.blessingsManager) return;
        
        // Find the blessing in history
        const history = window.blessingsManager.getHistory();
        const blessing = history.find(b => 
            b.id === blessingId && b.timestamp === timestamp
        );
        
        if (blessing) {
            const newMarkedState = !blessing.marked;
            window.blessingsManager.markBlessingInHistory(blessingId, newMarkedState);
            
            // Show notification
            if (window.showNotification) {
                window.showNotification(
                    newMarkedState ? 'Added to favorites' : 'Removed from favorites',
                    'info'
                );
            }
        }
    }

    showBlessingFromHistory(blessingId) {
        if (!window.blessingsManager) return;
        
        const blessing = window.blessingsManager.getBlessingById(blessingId);
        if (blessing && window.alhamdulillahApp) {
            // Update the current blessing display
            window.alhamdulillahApp.updateBlessingContent(blessing);
            
            // Update the current index
            const allBlessings = window.blessingsManager.blessings;
            const index = allBlessings.findIndex(b => b.id === blessingId);
            if (index !== -1) {
                window.blessingsManager.currentIndex = index;
                window.alhamdulillahApp.updateBlessingNumber();
            }
            
            // Show notification
            if (window.showNotification) {
                window.showNotification('Blessing restored from history', 'info');
            }
        }
    }

    showDeleteConfirmation(blessingId, timestamp) {
        const dialog = this.createConfirmationDialog(
            'Delete Blessing',
            'Are you sure you want to remove this blessing from your history?',
            () => this.deleteFromHistory(blessingId, timestamp)
        );
        document.body.appendChild(dialog);
        setTimeout(() => dialog.classList.add('active'), 10);
    }

    showClearConfirmation() {
        const dialog = this.createConfirmationDialog(
            'Clear History',
            'Are you sure you want to clear all your blessing history? This cannot be undone.',
            () => this.clearAllHistory()
        );
        document.body.appendChild(dialog);
        setTimeout(() => dialog.classList.add('active'), 10);
    }

    createConfirmationDialog(title, message, onConfirm) {
        const dialog = document.createElement('div');
        dialog.className = 'confirmation-dialog';
        dialog.innerHTML = `
            <div class="confirmation-content">
                <h3 class="confirmation-title">${title}</h3>
                <p class="confirmation-message">${message}</p>
                <div class="confirmation-actions">
                    <button class="confirmation-btn secondary cancel-btn">Cancel</button>
                    <button class="confirmation-btn primary confirm-btn">Confirm</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const cancelBtn = dialog.querySelector('.cancel-btn');
        const confirmBtn = dialog.querySelector('.confirm-btn');
        
        const closeDialog = () => {
            dialog.classList.remove('active');
            setTimeout(() => dialog.remove(), 300);
        };
        
        cancelBtn.addEventListener('click', closeDialog);
        confirmBtn.addEventListener('click', () => {
            onConfirm();
            closeDialog();
        });
        
        // Close on backdrop click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                closeDialog();
            }
        });
        
        return dialog;
    }

    deleteFromHistory(blessingId, timestamp) {
        if (!window.blessingsManager) return;
        
        window.blessingsManager.removeFromHistory(blessingId, timestamp);
        
        if (window.showNotification) {
            window.showNotification('Blessing removed from history', 'info');
        }
    }

    clearAllHistory() {
        if (!window.blessingsManager) return;
        
        window.blessingsManager.clearHistory();
        
        if (window.showNotification) {
            window.showNotification('History cleared successfully', 'info');
        }
    }

    updateStats(history) {
        if (!this.elements.statsTotal || !this.elements.statsFavorites) return;
        
        const total = history.length;
        const favorites = history.filter(b => b.marked).length;
        
        this.elements.statsTotal.textContent = total;
        this.elements.statsFavorites.textContent = favorites;
    }

    formatTimestamp(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    }

    // Public API methods
    exportHistory() {
        if (!window.blessingsManager) return null;
        return window.blessingsManager.exportHistory();
    }

    importHistory(data) {
        if (!window.blessingsManager) return false;
        const success = window.blessingsManager.importHistory(data);
        if (success) {
            this.updateDisplay();
        }
        return success;
    }

    getHistoryStats() {
        if (!window.blessingsManager) return null;
        return window.blessingsManager.getHistoryStats();
    }
}

// Create global instance
window.historyManager = new HistoryManager();