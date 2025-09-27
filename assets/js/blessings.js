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
        console.log('Loading blessings from JSON data file...');
        
        // Check if we're running locally (file:// protocol)
        const isFileProtocol = window.location.protocol === 'file:';
        
        if (isFileProtocol) {
            console.log('File protocol detected - loading full embedded blessings for offline use');
            return this.loadFullEmbeddedBlessings();
        }
        
        // For HTTP/HTTPS, try to fetch the JSON file
        try {
            console.log('HTTP protocol detected - fetching JSON file...');
            
            const possiblePaths = [
                './assets/data/blessings.json',
                'assets/data/blessings.json',
                '/assets/data/blessings.json'
            ];
            
            let response = null;
            let successfulPath = null;
            
            for (const path of possiblePaths) {
                try {
                    console.log(`Trying path: ${path}`);
                    response = await fetch(path, {
                        method: 'GET',
                        headers: { 'Accept': 'application/json' },
                        cache: 'no-cache'
                    });
                    
                    if (response.ok) {
                        successfulPath = path;
                        console.log(`✓ Successfully connected to: ${path}`);
                        break;
                    }
                } catch (pathError) {
                    console.log(`✗ Path ${path} failed:`, pathError.message);
                }
            }
            
            if (!response || !response.ok) {
                throw new Error(`Failed to fetch JSON file. Status: ${response ? response.status : 'No response'}`);
            }
            
            const data = await response.json();
            
            if (!data.blessings || !Array.isArray(data.blessings)) {
                throw new Error('Invalid JSON structure: missing or invalid blessings array');
            }
            
            this.blessings = data.blessings;
            this.isLoaded = true;
            
            // Initialize frequency weights from storage
            this.initializeFrequencyWeights();
            
            // Dispatch event to notify app
            document.dispatchEvent(new CustomEvent('blessingsLoaded', {
                detail: {
                    count: this.blessings.length,
                    categories: [...new Set(this.blessings.map(b => b.category))],
                    fallback: false
                }
            }));
            
            console.log(`✓ Successfully loaded ${this.blessings.length} blessings from JSON file`);
            
        } catch (error) {
            console.error('Failed to load from JSON, falling back to embedded blessings:', error);
            this.loadFullEmbeddedBlessings();
        }
    }

    loadFullEmbeddedBlessings() {
        // Load the complete set of blessings embedded in the code for offline use
        console.log('Loading full embedded blessings for offline use...');
        
        this.blessings = [
            {"id": "blessing-001", "arabic": "الحمد لله رب العالمين", "english": "Praise be to Allah, Lord of all the worlds", "transliteration": "Alhamdulillahi rabbil alameen", "category": "general", "tags": ["praise", "gratitude", "lord", "worlds"]},
            {"id": "blessing-002", "arabic": "الحمد لله الذي أطعمنا وسقانا", "english": "Praise be to Allah who has fed us and given us drink", "transliteration": "Alhamdulillahi allathee at'amana wa saqana", "category": "sustenance", "tags": ["food", "drink", "sustenance", "nourishment"]},
            {"id": "blessing-003", "arabic": "الحمد لله الذي عافاني في بدني", "english": "Praise be to Allah who has granted me health in my body", "transliteration": "Alhamdulillahi allathee afanee fee badanee", "category": "health", "tags": ["health", "body", "wellness", "strength"]},
            {"id": "blessing-004", "arabic": "الحمد لله الذي كساني هذا الثوب", "english": "Praise be to Allah who has clothed me with this garment", "transliteration": "Alhamdulillahi allathee kasanee hatha ath-thawb", "category": "sustenance", "tags": ["clothing", "protection", "covering", "provision"]},
            {"id": "blessing-005", "arabic": "الحمد لله الذي آواني", "english": "Praise be to Allah who has given me shelter", "transliteration": "Alhamdulillahi allathee awanee", "category": "protection", "tags": ["shelter", "home", "safety", "protection"]},
            {"id": "blessing-006", "arabic": "الحمد لله الذي هداني للإسلام", "english": "Praise be to Allah who has guided me to Islam", "transliteration": "Alhamdulillahi allathee hadanee lil-Islam", "category": "guidance", "tags": ["guidance", "islam", "faith", "direction"]},
            {"id": "blessing-007", "arabic": "الحمد لله الذي علمني ما لم أكن أعلم", "english": "Praise be to Allah who has taught me what I did not know", "transliteration": "Alhamdulillahi allathee allamanee ma lam akun a'lam", "category": "knowledge", "tags": ["knowledge", "learning", "wisdom", "education"]},
            {"id": "blessing-008", "arabic": "الحمد لله الذي بنعمته تتم الصالحات", "english": "Praise be to Allah, by whose grace good deeds are completed", "transliteration": "Alhamdulillahi allathee bi ni'matihi tatimmu as-salihat", "category": "general", "tags": ["grace", "good deeds", "completion", "success"]},
            {"id": "blessing-009", "arabic": "الحمد لله الذي أحياني بعد ما أماتني", "english": "Praise be to Allah who has given me life after death (sleep)", "transliteration": "Alhamdulillahi allathee ahyanee ba'da ma amatanee", "category": "general", "tags": ["life", "awakening", "sleep", "renewal"]},
            {"id": "blessing-010", "arabic": "الحمد لله الذي رزقني الأهل والولد", "english": "Praise be to Allah who has blessed me with family and children", "transliteration": "Alhamdulillahi allathee razaqanee al-ahl wal-walad", "category": "family", "tags": ["family", "children", "love", "relationships"]},
            {"id": "blessing-011", "arabic": "الحمد لله الذي جعل لي عينين أبصر بهما", "english": "Praise be to Allah who has given me eyes with which to see", "transliteration": "Alhamdulillahi allathee ja'ala lee aynayn ubsiru bihima", "category": "health", "tags": ["sight", "eyes", "vision", "senses"]},
            {"id": "blessing-012", "arabic": "الحمد لله الذي جعل لي أذنين أسمع بهما", "english": "Praise be to Allah who has given me ears with which to hear", "transliteration": "Alhamdulillahi allathee ja'ala lee uthunayn asma'u bihima", "category": "health", "tags": ["hearing", "ears", "sound", "senses"]},
            {"id": "blessing-013", "arabic": "الحمد لله الذي جعل لي لساناً أنطق به", "english": "Praise be to Allah who has given me a tongue with which to speak", "transliteration": "Alhamdulillahi allathee ja'ala lee lisanan antiqu bihi", "category": "health", "tags": ["speech", "tongue", "communication", "expression"]},
            {"id": "blessing-014", "arabic": "الحمد لله الذي سخر لنا هذا", "english": "Praise be to Allah who has made this subservient to us", "transliteration": "Alhamdulillahi allathee sakhkhara lana hatha", "category": "general", "tags": ["provision", "service", "blessing", "gratitude"]},
            {"id": "blessing-015", "arabic": "الحمد لله الذي أنزل من السماء ماءً", "english": "Praise be to Allah who sends down water from the sky", "transliteration": "Alhamdulillahi allathee anzala min as-sama'i ma'an", "category": "nature", "tags": ["water", "rain", "sky", "nature"]},
            {"id": "blessing-016", "arabic": "الحمد لله الذي أنبت لنا الزرع", "english": "Praise be to Allah who causes crops to grow for us", "transliteration": "Alhamdulillahi allathee anbata lana az-zar'", "category": "nature", "tags": ["crops", "growth", "agriculture", "sustenance"]},
            {"id": "blessing-017", "arabic": "الحمد لله الذي جعل الشمس ضياءً", "english": "Praise be to Allah who made the sun a source of light", "transliteration": "Alhamdulillahi allathee ja'ala ash-shamsa diya'an", "category": "nature", "tags": ["sun", "light", "warmth", "energy"]},
            {"id": "blessing-018", "arabic": "الحمد لله الذي جعل القمر نوراً", "english": "Praise be to Allah who made the moon a source of light", "transliteration": "Alhamdulillahi allathee ja'ala al-qamara nuran", "category": "nature", "tags": ["moon", "light", "night", "guidance"]},
            {"id": "blessing-019", "arabic": "الحمد لله الذي خلق الليل والنهار", "english": "Praise be to Allah who created the night and the day", "transliteration": "Alhamdulillahi allathee khalaqa al-layla wan-nahar", "category": "nature", "tags": ["night", "day", "time", "cycle"]},
            {"id": "blessing-020", "arabic": "الحمد لله الذي جعل لنا النوم سباتاً", "english": "Praise be to Allah who made sleep a rest for us", "transliteration": "Alhamdulillahi allathee ja'ala lana an-nawma subatan", "category": "health", "tags": ["sleep", "rest", "peace", "recovery"]},
            {"id": "blessing-021", "arabic": "الحمد لله الذي شفاني من مرضي", "english": "Praise be to Allah who has healed me from my illness", "transliteration": "Alhamdulillahi allathee shafanee min maradee", "category": "health", "tags": ["healing", "recovery", "health", "cure"]},
            {"id": "blessing-022", "arabic": "الحمد لله الذي أذهب عني الهم والحزن", "english": "Praise be to Allah who has removed worry and sadness from me", "transliteration": "Alhamdulillahi allathee athhaba annee al-hamma wal-huzn", "category": "peace", "tags": ["peace", "comfort", "relief", "tranquility"]},
            {"id": "blessing-023", "arabic": "الحمد لله الذي فرج عني الكرب", "english": "Praise be to Allah who has relieved me from distress", "transliteration": "Alhamdulillahi allathee farraja annee al-karb", "category": "peace", "tags": ["relief", "distress", "comfort", "ease"]},
            {"id": "blessing-024", "arabic": "الحمد لله الذي رزقني من الطيبات", "english": "Praise be to Allah who has provided me with good things", "transliteration": "Alhamdulillahi allathee razaqanee min at-tayyibat", "category": "sustenance", "tags": ["provision", "good things", "blessing", "sustenance"]},
            {"id": "blessing-025", "arabic": "الحمد لله الذي جعلني من المسلمين", "english": "Praise be to Allah who has made me among the Muslims", "transliteration": "Alhamdulillahi allathee ja'alanee min al-muslimeen", "category": "guidance", "tags": ["islam", "faith", "community", "guidance"]},
            {"id": "blessing-026", "arabic": "الحمد لله الذي وفقني لطاعته", "english": "Praise be to Allah who has enabled me to obey Him", "transliteration": "Alhamdulillahi allathee waffaqanee li ta'atihi", "category": "guidance", "tags": ["obedience", "worship", "guidance", "success"]},
            {"id": "blessing-027", "arabic": "الحمد لله الذي بارك لي في رزقي", "english": "Praise be to Allah who has blessed my sustenance", "transliteration": "Alhamdulillahi allathee baraka lee fee rizqee", "category": "sustenance", "tags": ["blessing", "sustenance", "abundance", "provision"]},
            {"id": "blessing-028", "arabic": "الحمد لله الذي أعطاني القوة", "english": "Praise be to Allah who has given me strength", "transliteration": "Alhamdulillahi allathee a'tanee al-quwwah", "category": "health", "tags": ["strength", "power", "ability", "energy"]},
            {"id": "blessing-029", "arabic": "الحمد لله الذي حفظني من الشر", "english": "Praise be to Allah who has protected me from evil", "transliteration": "Alhamdulillahi allathee hafizanee min ash-sharr", "category": "protection", "tags": ["protection", "safety", "evil", "security"]},
            {"id": "blessing-030", "arabic": "الحمد لله الذي جعل لي أصدقاء صالحين", "english": "Praise be to Allah who has given me righteous friends", "transliteration": "Alhamdulillahi allathee ja'ala lee asdiqa'a saliheen", "category": "family", "tags": ["friends", "companionship", "righteousness", "relationships"]},
            {"id": "blessing-031", "arabic": "الحمد لله الذي يسر لي أموري", "english": "Praise be to Allah who has made my affairs easy", "transliteration": "Alhamdulillahi allathee yassara lee umuree", "category": "general", "tags": ["ease", "affairs", "facilitation", "success"]},
            {"id": "blessing-032", "arabic": "الحمد لله الذي أنعم علي بالصحة", "english": "Praise be to Allah who has blessed me with health", "transliteration": "Alhamdulillahi allathee an'ama alayya bil-sihhah", "category": "health", "tags": ["health", "blessing", "wellness", "vitality"]},
            {"id": "blessing-033", "arabic": "الحمد لله الذي رزقني العقل", "english": "Praise be to Allah who has blessed me with intellect", "transliteration": "Alhamdulillahi allathee razaqanee al-aql", "category": "knowledge", "tags": ["intellect", "mind", "reasoning", "wisdom"]},
            {"id": "blessing-034", "arabic": "الحمد لله الذي جعل لي قلباً يخشاه", "english": "Praise be to Allah who has given me a heart that fears Him", "transliteration": "Alhamdulillahi allathee ja'ala lee qalban yakhshahu", "category": "guidance", "tags": ["heart", "fear", "reverence", "spirituality"]},
            {"id": "blessing-035", "arabic": "الحمد لله الذي ستر عيوبي", "english": "Praise be to Allah who has concealed my faults", "transliteration": "Alhamdulillahi allathee satara uyubee", "category": "protection", "tags": ["concealment", "faults", "mercy", "privacy"]},
            {"id": "blessing-036", "arabic": "الحمد لله الذي غفر لي ذنوبي", "english": "Praise be to Allah who has forgiven my sins", "transliteration": "Alhamdulillahi allathee ghafara lee thunubee", "category": "guidance", "tags": ["forgiveness", "sins", "mercy", "redemption"]},
            {"id": "blessing-037", "arabic": "الحمد لله الذي رزقني الصبر", "english": "Praise be to Allah who has blessed me with patience", "transliteration": "Alhamdulillahi allathee razaqanee as-sabr", "category": "guidance", "tags": ["patience", "endurance", "perseverance", "strength"]},
            {"id": "blessing-038", "arabic": "الحمد لله الذي أنعم علي بالأمن", "english": "Praise be to Allah who has blessed me with security", "transliteration": "Alhamdulillahi allathee an'ama alayya bil-amn", "category": "protection", "tags": ["security", "safety", "peace", "protection"]},
            {"id": "blessing-039", "arabic": "الحمد لله الذي جعل لي عملاً أتكسب منه", "english": "Praise be to Allah who has given me work to earn from", "transliteration": "Alhamdulillahi allathee ja'ala lee amalan atakaasabu minhu", "category": "sustenance", "tags": ["work", "earning", "livelihood", "provision"]},
            {"id": "blessing-040", "arabic": "الحمد لله الذي بارك لي في وقتي", "english": "Praise be to Allah who has blessed my time", "transliteration": "Alhamdulillahi allathee baraka lee fee waqtee", "category": "general", "tags": ["time", "blessing", "productivity", "efficiency"]},
            {"id": "blessing-041", "arabic": "الحمد لله الذي جعل لي مكاناً آمناً", "english": "Praise be to Allah who has given me a safe place", "transliteration": "Alhamdulillahi allathee ja'ala lee makanan aminan", "category": "protection", "tags": ["safety", "place", "security", "shelter"]},
            {"id": "blessing-042", "arabic": "الحمد لله الذي أطال في عمري", "english": "Praise be to Allah who has extended my life", "transliteration": "Alhamdulillahi allathee atala fee umree", "category": "general", "tags": ["life", "longevity", "time", "blessing"]},
            {"id": "blessing-043", "arabic": "الحمد لله الذي جعلني أمشي على قدمي", "english": "Praise be to Allah who enables me to walk on my feet", "transliteration": "Alhamdulillahi allathee ja'alanee amshee ala qadamayya", "category": "health", "tags": ["walking", "mobility", "feet", "movement"]},
            {"id": "blessing-044", "arabic": "الحمد لله الذي جعل لي يدين أعمل بهما", "english": "Praise be to Allah who has given me hands to work with", "transliteration": "Alhamdulillahi allathee ja'ala lee yadayn a'malu bihima", "category": "health", "tags": ["hands", "work", "ability", "dexterity"]},
            {"id": "blessing-045", "arabic": "الحمد لله الذي نجاني من البلاء", "english": "Praise be to Allah who has saved me from trials", "transliteration": "Alhamdulillahi allathee najjanee min al-bala'", "category": "protection", "tags": ["salvation", "trials", "protection", "relief"]},
            {"id": "blessing-046", "arabic": "الحمد لله الذي أعانني على ذكره", "english": "Praise be to Allah who has helped me remember Him", "transliteration": "Alhamdulillahi allathee a'ananee ala thikrihi", "category": "guidance", "tags": ["remembrance", "help", "worship", "spirituality"]},
            {"id": "blessing-047", "arabic": "الحمد لله الذي جعل لي قلباً يحبه", "english": "Praise be to Allah who has given me a heart that loves Him", "transliteration": "Alhamdulillahi allathee ja'ala lee qalban yuhibbuhu", "category": "guidance", "tags": ["love", "heart", "devotion", "spirituality"]},
            {"id": "blessing-048", "arabic": "الحمد لله الذي رزقني التوبة", "english": "Praise be to Allah who has blessed me with repentance", "transliteration": "Alhamdulillahi allathee razaqanee at-tawbah", "category": "guidance", "tags": ["repentance", "forgiveness", "return", "guidance"]},
            {"id": "blessing-049", "arabic": "الحمد لله الذي جعل لي نعماً لا تحصى", "english": "Praise be to Allah who has given me countless blessings", "transliteration": "Alhamdulillahi allathee ja'ala lee ni'aman la tuhsa", "category": "gratitude", "tags": ["countless", "blessings", "abundance", "gratitude"]},
            {"id": "blessing-050", "arabic": "الحمد لله على كل حال", "english": "Praise be to Allah in all circumstances", "transliteration": "Alhamdulillahi ala kulli hal", "category": "general", "tags": ["circumstances", "all conditions", "gratitude", "acceptance"]}
        ];
        
        this.isLoaded = true;
        
        // Initialize frequency weights from storage
        this.initializeFrequencyWeights();
        
        // Dispatch event to notify app
        document.dispatchEvent(new CustomEvent('blessingsLoaded', {
            detail: {
                count: this.blessings.length,
                categories: [...new Set(this.blessings.map(b => b.category))],
                fallback: false // This is the full collection, just embedded
            }
        }));
        
        console.log(`✓ Successfully loaded ${this.blessings.length} embedded blessings (offline mode)`);
        
        // Show a positive notification about offline capability
        setTimeout(() => {
            if (window.showNotification) {
                window.showNotification('✓ Running offline with full blessing collection (50 blessings)', 'success');
            }
        }, 2000);
    }

    initializeFrequencyWeights() {
        // Load frequency weights from storage or initialize new ones
        this.frequencyWeights = window.blessingStorage ? 
            window.blessingStorage.getFrequencyWeights() : {};
        
        // Initialize weights for any new blessings
        this.blessings.forEach(blessing => {
            if (!this.frequencyWeights.hasOwnProperty(blessing.id)) {
                this.frequencyWeights[blessing.id] = 0;
            }
        });
        
        // Save updated weights back to storage
        this.saveFrequencyWeights();
        
        console.log('Initialized frequency weights for', Object.keys(this.frequencyWeights).length, 'blessings');
    }

    saveFrequencyWeights() {
        if (window.blessingStorage) {
            window.blessingStorage.setFrequencyWeights(this.frequencyWeights);
        }
    }

    incrementBlessingWeight(blessingId) {
        if (this.frequencyWeights.hasOwnProperty(blessingId)) {
            this.frequencyWeights[blessingId]++;
            this.saveFrequencyWeights();
        }
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
        
        // Get next blessing with smart frequency-based selection
        const nextBlessing = this.selectNextBlessing();
        
        // Increment frequency weight for the selected blessing
        this.incrementBlessingWeight(nextBlessing.id);
        
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

    /**
     * Smart blessing selection with frequency-based weighting
     * 
     * This method implements a two-tier selection system:
     * 1. First, it excludes recently viewed blessings (last 3-5 based on collection size)
     * 2. Then, it applies frequency weighting to favor less-viewed blessings
     * 
     * The frequency system tracks how often each blessing has been shown and gives
     * higher probability to blessings that have been seen less frequently.
     * Never-seen blessings get the highest priority.
     * 
     * When all blessings have been recently viewed, it switches to stronger
     * frequency weighting to ensure variety over time.
     */
    selectNextBlessing() {
        if (this.blessings.length === 0) return null;
        if (this.blessings.length === 1) return this.blessings[0];
        
        // Build frequency table from history
        const frequencyTable = this.buildFrequencyTable();
        
        // Get recently viewed blessing IDs (last 3-5 based on total blessings)
        const recentHistorySize = Math.min(5, Math.max(3, Math.floor(this.blessings.length * 0.3)));
        const recentIds = this.history
            .slice(-recentHistorySize)
            .map(entry => entry.blessingId);
        
        // Filter out recently viewed blessings unless all have been shown recently
        let availableBlessings = this.blessings.filter(blessing => 
            !recentIds.includes(blessing.id)
        );
        
        // If all blessings have been seen recently, allow all but apply stronger frequency weighting
        const useFrequencyWeighting = availableBlessings.length === 0;
        if (useFrequencyWeighting) {
            availableBlessings = this.blessings;
        }
        
        // Apply frequency-based selection
        return this.selectWithFrequencyWeighting(availableBlessings, frequencyTable, useFrequencyWeighting);
    }

    buildFrequencyTable() {
        // Return the stored frequency weights directly
        return { ...this.frequencyWeights };
    }

    selectWithFrequencyWeighting(candidateBlessings, frequencyTable, strongWeighting = false) {
        if (candidateBlessings.length === 1) return candidateBlessings[0];
        
        // Calculate weights for each blessing (inverse frequency)
        const maxFrequency = Math.max(...Object.values(frequencyTable));
        const totalBlessings = this.blessings.length;
        
        const weights = candidateBlessings.map(blessing => {
            const frequency = frequencyTable[blessing.id] || 0;
            
            // Calculate inverse weight - less viewed blessings get higher weight
            let weight;
            if (strongWeighting) {
                // When all blessings were recently shown, apply stronger frequency bias
                weight = Math.max(1, (maxFrequency + 2) - frequency);
                // Give extra boost to never-seen blessings, scaled by total blessings
                if (frequency === 0) {
                    weight *= Math.min(5, Math.max(2, Math.floor(totalBlessings / 10)));
                }
            } else {
                // Normal weighting - still favor less viewed but not as strongly
                weight = Math.max(1, (maxFrequency + 3) - frequency);
                if (frequency === 0) {
                    weight *= Math.min(3, Math.max(1.5, Math.floor(totalBlessings / 15)));
                }
            }
            
            return weight;
        });
        
        // Select blessing using weighted random selection
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let randomValue = Math.random() * totalWeight;
        
        for (let i = 0; i < candidateBlessings.length; i++) {
            randomValue -= weights[i];
            if (randomValue <= 0) {
                return candidateBlessings[i];
            }
        }
        
        // Fallback to last blessing (shouldn't happen)
        return candidateBlessings[candidateBlessings.length - 1];
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

    // Reset frequency data while keeping recent history
    resetFrequencyData() {
        // Reset all frequency weights to 0
        this.blessings.forEach(blessing => {
            this.frequencyWeights[blessing.id] = 0;
        });
        
        // Save reset weights to storage
        this.saveFrequencyWeights();
        
        // Keep only the last few entries to maintain some recent context
        const recentEntries = this.history.slice(-3);
        this.history = recentEntries;
        
        // Update storage
        if (window.blessingStorage) {
            window.blessingStorage.setHistory(this.history);
        }
        
        // Update display
        this.updateHistoryDisplay();
        
        // Show notification
        if (window.showNotification) {
            window.showNotification('Frequency data reset - all blessings now have equal weight', 'info');
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

    // Frequency analysis methods
    getFrequencyStats() {
        const frequencyTable = this.buildFrequencyTable();
        const frequencies = Object.values(frequencyTable);
        
        return {
            frequencyTable,
            totalViews: frequencies.reduce((sum, freq) => sum + freq, 0),
            averageViews: frequencies.length > 0 ? frequencies.reduce((sum, freq) => sum + freq, 0) / frequencies.length : 0,
            maxViews: Math.max(...frequencies),
            minViews: Math.min(...frequencies),
            neverViewed: frequencies.filter(freq => freq === 0).length,
            mostViewed: this.getMostViewedBlessings(frequencyTable),
            leastViewed: this.getLeastViewedBlessings(frequencyTable)
        };
    }

    getMostViewedBlessings(frequencyTable = null) {
        if (!frequencyTable) frequencyTable = this.buildFrequencyTable();
        
        const maxFreq = Math.max(...Object.values(frequencyTable));
        return Object.entries(frequencyTable)
            .filter(([_, freq]) => freq === maxFreq)
            .map(([id, freq]) => ({
                blessing: this.getBlessingById(id),
                frequency: freq
            }))
            .filter(item => item.blessing !== undefined);
    }

    getLeastViewedBlessings(frequencyTable = null) {
        if (!frequencyTable) frequencyTable = this.buildFrequencyTable();
        
        const minFreq = Math.min(...Object.values(frequencyTable));
        return Object.entries(frequencyTable)
            .filter(([_, freq]) => freq === minFreq)
            .map(([id, freq]) => ({
                blessing: this.getBlessingById(id),
                frequency: freq
            }))
            .filter(item => item.blessing !== undefined);
    }

    // Debug method to simulate selection and see frequency distribution
    simulateSelections(count = 100) {
        const results = {};
        const originalHistory = [...this.history];
        
        for (let i = 0; i < count; i++) {
            const blessing = this.selectNextBlessing();
            if (blessing) {
                results[blessing.id] = (results[blessing.id] || 0) + 1;
                // Simulate adding to history for next selection
                this.history.push({
                    blessingId: blessing.id,
                    timestamp: Date.now() + i,
                    language: 'english',
                    marked: false
                });
            }
        }
        
        // Restore original history
        this.history = originalHistory;
        
        return {
            selections: results,
            totalSelections: count,
            uniqueBlessingsSelected: Object.keys(results).length,
            distribution: Object.entries(results)
                .sort(([,a], [,b]) => b - a)
                .map(([id, count]) => ({
                    blessing: this.getBlessingById(id),
                    count,
                    percentage: (count / count * 100).toFixed(1)
                }))
        };
    }
}

// Create global instance
window.blessingsManager = new BlessingsManager();