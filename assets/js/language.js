// Enhanced Language Management with Beautiful Transitions

class LanguageManager {
    constructor() {
        this.currentLanguage = 'both';
        this.supportedLanguages = ['both', 'en', 'ar'];
        this.elements = {};
        this.init();
    }

    init() {
        this.cacheElements();
        this.loadSavedLanguage();
        this.setupEventListeners();
    }

    cacheElements() {
        this.elements = {
            langButtons: document.querySelectorAll('.lang-btn'),
            blessingEn: document.getElementById('blessing-en'),
            blessingAr: document.getElementById('blessing-ar'),
            historyContainer: document.getElementById('history-container')
        };
    }

    setupEventListeners() {
        this.elements.langButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                if (lang && this.supportedLanguages.includes(lang)) {
                    this.setLanguage(lang);
                }
            });
        });
    }

    loadSavedLanguage() {
        if (window.blessingStorage) {
            const savedLang = window.blessingStorage.getLanguage();
            if (savedLang && this.supportedLanguages.includes(savedLang)) {
                this.setLanguage(savedLang, false); // Don't save again
            }
        }
    }

    setLanguage(language, save = true) {
        if (!this.supportedLanguages.includes(language)) {
            console.warn(`Unsupported language: ${language}`);
            return;
        }

        this.currentLanguage = language;
        
        // Update button states with smooth transition
        this.updateButtonStates(language);
        
        // Update content visibility with fade effect
        this.updateContentVisibility(language);
        
        // Update history items
        this.updateHistoryVisibility(language);
        
        // Save to storage
        if (save && window.blessingStorage) {
            window.blessingStorage.setLanguage(language);
        }

        // Trigger custom event
        this.dispatchLanguageChangeEvent(language);
    }

    updateButtonStates(language) {
        this.elements.langButtons.forEach(btn => {
            const isActive = btn.dataset.lang === language;
            
            // Remove active class with transition
            btn.classList.remove('active');
            
            // Add active class to selected button
            if (isActive) {
                // Small delay for smooth transition
                setTimeout(() => {
                    btn.classList.add('active');
                }, 50);
            }
        });
    }

    updateContentVisibility(language) {
        const { blessingEn, blessingAr } = this.elements;
        
        if (!blessingEn || !blessingAr) return;

        // Add fade-out effect
        this.addFadeTransition([blessingEn, blessingAr], () => {
            // Update visibility based on language
            switch (language) {
                case 'en':
                    blessingEn.style.display = 'block';
                    blessingAr.style.display = 'none';
                    break;
                case 'ar':
                    blessingEn.style.display = 'none';
                    blessingAr.style.display = 'block';
                    break;
                case 'both':
                default:
                    blessingEn.style.display = 'block';
                    blessingAr.style.display = 'block';
                    break;
            }
        });
    }

    updateHistoryVisibility(language) {
        const historyCards = this.elements.historyContainer?.querySelectorAll('.history-card');
        
        if (!historyCards) return;

        historyCards.forEach(card => {
            const enElement = card.querySelector('.blessing-english');
            const arElement = card.querySelector('.blessing-arabic');
            
            if (enElement && arElement) {
                this.updateElementVisibility(enElement, arElement, language);
            }
        });
    }

    updateElementVisibility(enElement, arElement, language) {
        switch (language) {
            case 'en':
                enElement.style.display = 'block';
                arElement.style.display = 'none';
                break;
            case 'ar':
                enElement.style.display = 'none';
                arElement.style.display = 'block';
                break;
            case 'both':
            default:
                enElement.style.display = 'block';
                arElement.style.display = 'block';
                break;
        }
    }

    addFadeTransition(elements, callback) {
        // Add fade-out class
        elements.forEach(el => {
            if (el) {
                el.style.opacity = '0.7';
                el.style.transition = 'opacity 0.2s ease';
            }
        });

        // Execute callback after fade-out
        setTimeout(() => {
            callback();
            
            // Fade back in
            elements.forEach(el => {
                if (el) {
                    el.style.opacity = '1';
                }
            });
            
            // Clean up transition
            setTimeout(() => {
                elements.forEach(el => {
                    if (el) {
                        el.style.transition = '';
                    }
                });
            }, 200);
        }, 100);
    }

    dispatchLanguageChangeEvent(language) {
        const event = new CustomEvent('languageChanged', {
            detail: { 
                language,
                previousLanguage: this.currentLanguage 
            }
        });
        document.dispatchEvent(event);
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    isRTL() {
        return this.currentLanguage === 'ar';
    }

    getLanguageDirection() {
        return this.isRTL() ? 'rtl' : 'ltr';
    }

    getLanguageDisplayName(lang) {
        const names = {
            'both': 'Both',
            'en': 'English',
            'ar': 'العربية'
        };
        return names[lang] || lang;
    }

    // Method to update blessing content with language consideration
    updateBlessingContent(blessing) {
        const { blessingEn, blessingAr } = this.elements;
        
        if (!blessing || !blessingEn || !blessingAr) return;

        // Update content
        blessingEn.textContent = blessing.english || blessing.en || '';
        blessingAr.textContent = blessing.arabic || blessing.ar || '';

        // Apply current language visibility
        this.updateContentVisibility(this.currentLanguage);

        // Add fade-in animation
        if (blessingEn.style.display !== 'none') {
            blessingEn.classList.remove('fade-in');
            void blessingEn.offsetWidth; // Force reflow
            blessingEn.classList.add('fade-in');
        }

        if (blessingAr.style.display !== 'none') {
            blessingAr.classList.remove('fade-in');
            void blessingAr.offsetWidth; // Force reflow
            blessingAr.classList.add('fade-in');
        }
    }

    // Method to create history card with proper language handling
    createHistoryCard(blessing) {
        const card = document.createElement('div');
        card.className = 'history-card slide-in-up';
        
        const enElement = document.createElement('p');
        enElement.className = 'blessing-english';
        enElement.textContent = blessing.english || blessing.en || '';
        
        const arElement = document.createElement('p');
        arElement.className = 'blessing-arabic';
        arElement.textContent = blessing.arabic || blessing.ar || '';
        
        card.appendChild(enElement);
        card.appendChild(arElement);
        
        // Apply current language visibility
        this.updateElementVisibility(enElement, arElement, this.currentLanguage);
        
        return card;
    }

    // Refresh all language-dependent content
    refresh() {
        this.updateContentVisibility(this.currentLanguage);
        this.updateHistoryVisibility(this.currentLanguage);
        this.updateButtonStates(this.currentLanguage);
    }
}

// Create global language manager instance
window.languageManager = new LanguageManager();

// Listen for DOM changes to refresh language settings
document.addEventListener('DOMContentLoaded', () => {
    if (window.languageManager) {
        window.languageManager.refresh();
    }
});