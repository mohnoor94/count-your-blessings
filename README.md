# Blessing Reminder - Alhamdulillah

A spiritual Progressive Web Application (PWA) that displays random blessings in Arabic and English to encourage gratitude and mindfulness.

## Features

- 🌟 Random blessing display with smooth animations
- 🌍 Bilingual support (Arabic & English) with proper RTL/LTR handling
- 📱 Mobile-first responsive design
- 💾 Local storage for blessing history and preferences
- 🔄 PWA functionality with offline support
- ✨ Modern UI with spiritual color palette
- ♿ Accessibility features and keyboard navigation

## Project Structure

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
│   │   └── blessings.json    # Comprehensive blessing database (to be created)
│   └── icons/                # PWA icons in various sizes (to be created)
└── README.md
```

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **PWA**: Service Worker + Web App Manifest
- **Storage**: Browser LocalStorage
- **Deployment**: GitHub Pages (static hosting)

## Getting Started

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. For development, serve the files using a local web server
4. For production, deploy to GitHub Pages or any static hosting service

## Development

The application is built with vanilla JavaScript and CSS for optimal performance and simplicity. No build process is required - just open the HTML file in a browser.

### Key Components

- **BlessingManager**: Handles blessing data and selection logic
- **StorageManager**: Manages local storage for preferences and history
- **LanguageManager**: Handles Arabic/English switching and RTL support
- **Main App**: Coordinates all components and handles UI interactions

## Browser Support

- Modern browsers with ES6+ support
- PWA features require HTTPS (except localhost)
- Service Worker support for offline functionality
- LocalStorage for data persistence

## Contributing

This is a spiritual project aimed at promoting gratitude and mindfulness. Contributions are welcome, especially:

- Additional blessings in Arabic and English
- UI/UX improvements
- Accessibility enhancements
- Performance optimizations

## License

See LICENSE file for details.

---

*"And if you would count the graces of Allah, never could you be able to count them. Truly! Allah is Oft-Forgiving, Most Merciful."* - Quran 16:18