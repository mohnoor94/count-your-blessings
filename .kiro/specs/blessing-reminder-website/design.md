# Design Document

## Overview

The Blessing Reminder PWA is a mobile-first spiritual application that combines modern web technologies with mindful design principles. The app will feature a card-based interface with smooth animations, supporting both Arabic and English languages with proper RTL/LTR text handling. The design emphasizes simplicity, tranquility, and spiritual connection through carefully chosen colors, typography, and micro-interactions.

## Architecture

### Technology Stack
- **Frontend Framework**: Vanilla JavaScript with modern ES6+ features for lightweight performance
- **CSS Framework**: Custom CSS with CSS Grid and Flexbox for responsive layouts
- **PWA Features**: Service Worker for offline functionality, Web App Manifest for installation
- **Storage**: Browser LocalStorage for blessing history and user preferences
- **Build Process**: Simple static file structure optimized for GitHub Pages deployment

### Application Structure
```
blessing-reminder-pwa/
├── index.html                 # Main application entry point
├── manifest.json             # PWA manifest for installation
├── sw.js                     # Service worker for offline functionality
├── assets/
│   ├── css/
│   │   ├── main.css          # Main styles with CSS variables
│   │   ├── animations.css    # Animation and transition definitions
│   │   └── arabic.css        # Arabic-specific typography and RTL styles
│   ├── js/
│   │   ├── app.js            # Main application logic
│   │   ├── blessings.js      # Blessing management and display
│   │   ├── storage.js        # LocalStorage management
│   │   └── language.js       # Language switching and RTL handling
│   ├── data/
│   │   └── blessings.json    # Comprehensive blessing database
│   └── icons/                # PWA icons in various sizes
└── README.md
```

## Components and Interfaces

### Core Components

#### 1. Blessing Card Component
- **Purpose**: Display individual blessings with elegant typography in the selected language
- **Features**: 
  - Responsive card layout with subtle shadows and rounded corners
  - Dynamic text direction (RTL for Arabic, LTR for English) based on user selection
  - Smooth fade-in animations when new blessings appear with proper text direction transitions
  - Touch-friendly tap interactions with haptic feedback simulation
  - Optional transliteration display for Arabic blessings
- **States**: Loading, Display, Transitioning, Clicked

#### 2. Language Toggle Component
- **Purpose**: Allow users to switch between Arabic or English languages
- **Features**:
  - Toggle switch design for binary language selection
  - Clear visual indicators for Arabic (العربية) and English modes
  - Smooth transitions when switching languages with proper text direction changes
  - Persistent user preference storage

#### 3. History Panel Component
- **Purpose**: Display previously seen blessings with timestamps
- **Features**:
  - Slide-up modal design optimized for mobile
  - Chronological list with search/filter capabilities
  - Swipe-to-delete individual history items
  - Reset all history with confirmation dialog

#### 4. Settings Panel Component
- **Purpose**: Manage app preferences and customization
- **Features**:
  - Theme selection (Light, Dark, Auto)
  - Animation preferences (Full, Reduced, Off)
  - Notification settings for daily reminders
  - Data management (export/import history)

### Interface Design Patterns

#### Mobile-First Navigation
- **Bottom Navigation**: Primary actions accessible by thumb
- **Gesture Support**: Swipe gestures for navigation and interactions
- **Safe Area Handling**: Proper spacing for notched devices
- **Touch Targets**: Minimum 44px touch targets following accessibility guidelines

#### Visual Hierarchy
- **Typography Scale**: Harmonious font sizes optimized for mobile reading
- **Color System**: Calming palette inspired by nature and spirituality
- **Spacing System**: Consistent 8px grid system for visual rhythm
- **Elevation**: Subtle shadows and layers to create depth

## Data Models

### Blessing Model
```javascript
{
  id: string,                    // Unique identifier
  arabic: string,               // Arabic blessing text
  english: string,              // English blessing text
  transliteration?: string,     // Optional romanized Arabic
  category: string,             // Category (health, family, nature, etc.)
  tags: string[],               // Searchable tags for both languages
  difficulty?: 'simple' | 'intermediate' | 'advanced'  // Reading complexity
}
```

### User History Model
```javascript
{
  blessingId: string,           // Reference to blessing
  timestamp: number,            // Unix timestamp when viewed
  language: 'arabic' | 'english',  // Language mode when viewed
  marked: boolean               // User marked as favorite
}
```

### User Preferences Model
```javascript
{
  language: 'arabic' | 'english',
  theme: 'light' | 'dark' | 'auto',
  animations: 'full' | 'reduced' | 'off',
  notifications: boolean,
  lastVisit: number,
  installPromptDismissed: boolean
}
```

## Error Handling

### Offline Scenarios
- **No Internet Connection**: App continues functioning with cached blessings
- **Failed Data Loading**: Graceful fallback to embedded default blessings
- **Storage Quota Exceeded**: Automatic cleanup of oldest history entries

### Data Corruption
- **Invalid JSON**: Fallback to default blessing set with user notification
- **Corrupted LocalStorage**: Reset to defaults with option to retry
- **Missing Translations**: Display available language with note about missing content

### Browser Compatibility
- **Unsupported Features**: Progressive enhancement with feature detection
- **Old Browsers**: Core functionality maintained without advanced animations
- **iOS Safari Quirks**: Specific handling for viewport and PWA installation

## Testing Strategy

### Unit Testing
- **Blessing Selection Logic**: Ensure randomization and history avoidance
- **Language Switching**: Verify proper RTL/LTR handling and text direction
- **Storage Operations**: Test LocalStorage read/write operations
- **PWA Features**: Validate service worker caching and offline functionality

### Integration Testing
- **User Flows**: Complete blessing viewing and history management workflows
- **Cross-Language**: Switching between Arabic and English modes
- **Installation Process**: PWA installation on various mobile devices
- **Offline Functionality**: App behavior without internet connection

### Accessibility Testing
- **Screen Reader**: VoiceOver (iOS) and TalkBack (Android) compatibility
- **Keyboard Navigation**: Full app navigation without touch
- **Color Contrast**: WCAG AA compliance for all text and UI elements
- **Motion Sensitivity**: Respect for prefers-reduced-motion settings

### Performance Testing
- **Load Times**: Initial app load under 3 seconds on 3G
- **Animation Performance**: 60fps animations on mid-range devices
- **Memory Usage**: Efficient blessing caching without memory leaks
- **Battery Impact**: Minimal battery drain during extended use

## UI/UX Design Specifications

### Color Palette
```css
:root {
  /* Primary Colors - Inspired by nature and spirituality */
  --primary-green: #2D5A27;      /* Deep forest green */
  --primary-gold: #D4AF37;       /* Warm gold accent */
  --primary-cream: #F7F5F3;      /* Soft cream background */
  
  /* Semantic Colors */
  --text-primary: #1A1A1A;       /* High contrast text */
  --text-secondary: #666666;     /* Secondary text */
  --text-arabic: #2D5A27;        /* Arabic text color */
  --background: #FEFEFE;          /* Main background */
  --surface: #FFFFFF;            /* Card surfaces */
  --border: #E5E5E5;             /* Subtle borders */
  
  /* Dark Theme */
  --dark-background: #0F1419;
  --dark-surface: #1A1F24;
  --dark-text: #E6E6E6;
  --dark-border: #2A2F34;
}
```

### Typography System
```css
/* Arabic Typography */
@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');

/* English Typography */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

:root {
  --font-arabic: 'Amiri', serif;
  --font-english: 'Inter', sans-serif;
  
  /* Scale */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
}
```

### Animation Principles
- **Easing**: Custom cubic-bezier curves for natural motion
- **Duration**: 200-300ms for micro-interactions, 400-600ms for transitions
- **Choreography**: Staggered animations for multiple elements
- **Purpose**: Every animation serves a functional purpose (feedback, guidance, delight)

### Responsive Breakpoints
```css
:root {
  --mobile: 320px;      /* Small phones */
  --mobile-lg: 480px;   /* Large phones */
  --tablet: 768px;      /* Tablets */
  --desktop: 1024px;    /* Desktop (graceful scaling) */
}
```

## PWA Implementation Details

### Service Worker Strategy
- **Cache First**: Static assets (CSS, JS, images)
- **Network First**: Blessing data with fallback to cache
- **Stale While Revalidate**: App shell for instant loading

### Manifest Configuration
```json
{
  "name": "Blessing Reminder - Alhamdulillah",
  "short_name": "Blessings",
  "description": "Daily reminders of life's blessings",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#2D5A27",
  "background_color": "#F7F5F3",
  "categories": ["lifestyle", "health", "spirituality"]
}
```

### Installation Experience
- **Install Prompt**: Custom UI for PWA installation
- **Onboarding**: Brief introduction to app features
- **Permissions**: Optional notification permissions for daily reminders