// Enhanced Main Application with Beautiful Interactions

class AlhamdulillahApp {
    constructor() {
        this.elements = {};
        this.state = {
            currentBlessingIndex: 0,
            hintHasBeenHidden: false,
            isInitialized: false
        };
        this.init();
    }

    async init() {
        this.cacheElements();
        this.setupEventListeners();
        
        // Simple initialization without complex dependency waiting
        setTimeout(() => {
            this.initializeApp();
            this.setupGlassmorphism();
        }, 500); // Give other scripts time to load
    }

    cacheElements() {
        this.elements = {
            app: document.getElementById('app'),
            blessingCard: document.getElementById('blessing-card'),
            blessingEn: document.getElementById('blessing-en'),
            blessingAr: document.getElementById('blessing-ar'),
            blessingNumber: document.getElementById('blessing-number'),
            interactionHint: document.getElementById('interaction-hint'),
            historyContainer: document.getElementById('history-container'),
            glowEffect: document.getElementById('glow-effect'),
            loadingScreen: document.getElementById('loadingScreen'),
            langButtons: document.querySelectorAll('.lang-btn'),
            settingsBtn: document.getElementById('settings-btn')
        };
    }

    setupEventListeners() {
        // Blessing card click
        if (this.elements.blessingCard) {
            console.log('Setting up blessing card click listener');
            this.elements.blessingCard.addEventListener('click', () => {
                console.log('Blessing card clicked!');
                this.handleNewBlessingRequest();
            });
        } else {
            console.error('Blessing card element not found!');
        }

        // Settings button click
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }

        // Custom events from other modules
        document.addEventListener('blessingChanged', (e) => {
            this.handleBlessingChanged(e.detail);
        });

        document.addEventListener('languageChanged', (e) => {
            this.handleLanguageChanged(e.detail);
        });

        document.addEventListener('blessingsLoaded', (e) => {
            this.handleBlessingsLoaded(e.detail);
        });



        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Touch gestures for mobile
        this.setupTouchGestures();
    }

    async waitForDependencies() {
        // Wait for all modules to be loaded
        const maxWait = 5000; // 5 seconds
        const startTime = Date.now();
        
        while (!window.blessingsManager || !window.languageManager || !window.blessingStorage) {
            if (Date.now() - startTime > maxWait) {
                console.warn('Some dependencies failed to load within timeout');
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    initializeApp() {
        console.log('Initializing app...');
        this.showLoadingScreen();
        
        // Initialize from storage
        if (window.blessingsManager) {
            window.blessingsManager.initializeFromStorage();
        }

        // Set initial blessing
        this.displayCurrentBlessing();
        
        // Initialize history
        this.initializeHistory();
        
        // Hide loading screen and mark as initialized
        setTimeout(() => {
            this.hideLoadingScreen();
            this.state.isInitialized = true;
            console.log('App initialized successfully');
        }, 1000);
    }

    setupGlassmorphism() {
        // Add glassmorphism class to language selector
        const langSelector = document.querySelector('.content-language-selector');
        if (langSelector) {
            langSelector.classList.add('glass-ui');
        }
    }

    displayCurrentBlessing() {
        if (window.blessingsManager) {
            const blessing = window.blessingsManager.getCurrentBlessing();
            if (blessing) {
                this.updateBlessingContent(blessing);
                this.updateBlessingNumber();
                return;
            }
        }
        
        // Fallback: use simple embedded blessing
        const fallbackBlessing = {
            english: "For the gift of sight to see the world's colors",
            arabic: "لنعمة البصر لرؤية ألوان العالم"
        };
        this.updateBlessingContent(fallbackBlessing);
        if (this.elements.blessingNumber) {
            this.elements.blessingNumber.textContent = '#1';
        }
    }

    updateBlessingContent(blessing) {
        if (!blessing || !this.elements.blessingEn || !this.elements.blessingAr) return;

        // Use language manager to update content with proper transitions
        if (window.languageManager) {
            window.languageManager.updateBlessingContent(blessing);
        } else {
            // Fallback direct update
            this.elements.blessingEn.textContent = blessing.english || '';
            this.elements.blessingAr.textContent = blessing.arabic || '';
        }
    }

    updateBlessingNumber() {
        if (!this.elements.blessingNumber || !window.blessingsManager) return;
        
        const currentIndex = window.blessingsManager.getCurrentIndex();
        this.elements.blessingNumber.textContent = `#${currentIndex + 1}`;
    }

    handleNewBlessingRequest() {
        console.log('handleNewBlessingRequest called, isInitialized:', this.state.isInitialized);
        
        if (!this.state.isInitialized) {
            console.log('App not initialized yet, ignoring request');
            return;
        }

        // Hide hint after first interaction
        this.hideInteractionHint();

        // Trigger glow effect
        this.triggerGlowEffect();

        // Request new blessing
        if (window.blessingsManager) {
            console.log('Requesting new blessing...');
            const newBlessing = window.blessingsManager.getNewBlessing();
            console.log('New blessing received:', newBlessing);
            // History display is automatically updated by the HistoryManager
        } else {
            console.log('blessingsManager not available, using simple fallback');
            // Simple fallback with embedded blessings
            this.handleSimpleBlessingChange();
        }
    }

    hideInteractionHint() {
        if (this.state.hintHasBeenHidden || !this.elements.interactionHint) return;
        
        this.elements.interactionHint.style.opacity = '0';
        this.elements.interactionHint.style.height = '0';
        this.elements.interactionHint.style.margin = '0';
        this.state.hintHasBeenHidden = true;
    }

    triggerGlowEffect() {
        if (!this.elements.glowEffect) return;
        
        this.elements.glowEffect.classList.add('active');
        setTimeout(() => {
            this.elements.glowEffect.classList.remove('active');
        }, 1000);
    }

    handleBlessingChanged(detail) {
        this.updateBlessingContent(detail.blessing);
        this.updateBlessingNumber();
    }

    handleLanguageChanged(detail) {
        // Language manager handles the content updates
        // History display is automatically updated by the HistoryManager
    }

    handleBlessingsLoaded(detail) {
        console.log(`Loaded ${detail.count} blessings in ${detail.categories.length} categories`);
        this.displayCurrentBlessing();
    }

    initializeHistory() {
        // History is now managed by the HistoryManager
        // Just trigger an initial update
        if (window.historyManager) {
            window.historyManager.updateDisplay();
        }
    }

    setupTouchGestures() {
        let startY = 0;
        let startX = 0;
        
        if (this.elements.blessingCard) {
            this.elements.blessingCard.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
                startX = e.touches[0].clientX;
            });
            
            this.elements.blessingCard.addEventListener('touchend', (e) => {
                const endY = e.changedTouches[0].clientY;
                const endX = e.changedTouches[0].clientX;
                const diffY = startY - endY;
                const diffX = startX - endX;
                
                // Swipe up gesture for new blessing
                if (Math.abs(diffY) > Math.abs(diffX) && diffY > 50) {
                    this.handleNewBlessingRequest();
                }
            });
        }
    }

    handleKeyboardShortcuts(e) {
        if (!this.state.isInitialized) return;
        
        switch (e.key) {
            case ' ':
            case 'Enter':
                e.preventDefault();
                this.handleNewBlessingRequest();
                break;
        }
    }

    showLoadingScreen() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.add('active');
        }
    }

    hideLoadingScreen() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.remove('active');
        }
    }



    // Public API methods
    getNewBlessing() {
        this.handleNewBlessingRequest();
    }

    getCurrentBlessing() {
        return window.blessingsManager ? window.blessingsManager.getCurrentBlessing() : null;
    }

    setLanguage(language) {
        if (window.languageManager) {
            window.languageManager.setLanguage(language);
        }
    }

    // Simple fallback method for when modules aren't loaded
    handleSimpleBlessingChange() {
        const simpleBlessings = [
            { english: "For the gift of sight to see the world's colors", arabic: "لنعمة البصر لرؤية ألوان العالم" },
            { english: "For every single heartbeat, a silent drum of life", arabic: "لكل نبضة قلب، طبل حياة صامت" },
            { english: "For the air that fills our lungs without a thought", arabic: "للهواء الذي يملأ رئتينا دون تفكير" },
            { english: "For the simple ability to stand, walk, and move freely", arabic: "للقدرة البسيطة على الوقوف والمشي والحركة بحرية" },
            { english: "For the restful sleep that recharges mind and body", arabic: "للنوم المريح الذي يعيد شحن العقل والجسد" }
        ];
        
        // Get random blessing
        const randomIndex = Math.floor(Math.random() * simpleBlessings.length);
        const blessing = simpleBlessings[randomIndex];
        
        // Update content
        this.updateBlessingContent(blessing);
        
        if (this.elements.blessingNumber) {
            this.elements.blessingNumber.textContent = `#${randomIndex + 1}`;
        }
        
        console.log('Simple blessing updated:', blessing);
    }

    // Settings functionality
    showSettings() {
        // Create settings modal
        const modal = this.createSettingsModal();
        document.body.appendChild(modal);
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    createSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'settings-modal';
        modal.innerHTML = `
            <div class="settings-content glass-ui">
                <div class="settings-header">
                    <h2>Settings</h2>
                    <button class="close-btn" onclick="this.closest('.settings-modal').remove()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="settings-body">
                    <div class="setting-item">
                        <label>Animations</label>
                        <input type="checkbox" id="animations-toggle" checked>
                    </div>
                    <div class="setting-item">
                        <label>Auto-advance (seconds)</label>
                        <input type="range" id="auto-advance" min="0" max="30" value="0">
                        <span id="auto-advance-value">Off</span>
                    </div>
                    <div class="setting-item">
                        <label>Visit Count</label>
                        <span>${window.blessingStorage ? window.blessingStorage.getVisitCount() : 1}</span>
                    </div>
                    <div class="setting-item">
                        <button class="reset-btn" onclick="window.alhamdulillahApp.resetData()">Reset All Data</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    }

    resetData() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            if (window.blessingStorage) {
                window.blessingStorage.reset();
            }
            location.reload();
        }
    }

    // Notification system for storage messages
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.alhamdulillahApp = new AlhamdulillahApp();
    
    // Make notification system available globally for storage system
    window.showNotification = window.alhamdulillahApp.showNotification.bind(window.alhamdulillahApp);
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}