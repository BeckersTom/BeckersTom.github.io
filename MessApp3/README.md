# Menu App PWA

A Progressive Web App for displaying daily menus with offline support, optimized for iOS and Android.

## Overview

This PWA displays menu data for today and all future days in a smooth carousel interface. It works offline, automatically updates when changes are deployed, and can be installed on mobile home screens.

## Features

- **Progressive Web App** — Installable on iOS and Android
- **Offline Support** — Full functionality without internet using Service Worker caching
- **Fluent Carousel** — Smooth sliding with touch swipe and mouse drag support
- **Responsive Design** — Optimized for portrait mobile layouts
- **Auto-Update** — Automatically detects and applies changes to the webapp and menu data
- **Safe Area Support** — Works correctly with notched devices (iPhone X, etc.)
- **Dutch Localization** — Dates displayed in Dutch

## Directory Structure

```
MessApp2/
├── index.html              # Main HTML structure
├── styles.css              # Stylesheet with responsive design
├── app.js                  # Main application logic
├── service-worker.js       # Service Worker for offline support
├── manifest.json           # PWA manifest for installation
├── README.md               # This file
├── fonts/                  # Font files
│   └── Filmcryptic.ttf     # Custom font used throughout
└── images/                 # Image assets
    ├── background.png      # App background (stretched)
    ├── header.png          # Header/footer logo
    ├── soep.png            # Soup menu icon
    ├── vlees.png           # Meat menu icon
    ├── veggie.png          # Vegetarian menu icon
    ├── grill.png           # Grill menu icon
    ├── groentvdw.png       # Vegetables menu icon
    ├── icon-192.png        # PWA icon 192x192
    ├── icon-192.svg        # PWA icon SVG (maskable)
    ├── icon-512.png        # PWA icon 512x512
    └── icon-512.svg        # PWA icon SVG (maskable)
```

## Installation on Mobile

### iOS (iPhone/iPad)
1. Open Safari and navigate to the app URL
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Name the app and tap "Add"
5. The app will appear as an icon on your home screen

### Android (Chrome/Firefox)
1. Open Chrome or Firefox and navigate to the app URL
2. Tap the menu button (three dots)
3. Tap "Install app" or "Add to Home screen"
4. Follow the prompts
5. The app will appear as an icon on your home screen

## Page Layout

### Header
- **Left**: Day name, date, and month in Dutch (vertically stacked)
- **Right**: Header logo image (header.png)

### Content
5 menu rows, each displaying:
- **Left**: Icon for the menu type (soep.png, vlees.png, etc.)
- **Right**: Menu text (wrapped and centered)

Menu types: soep, vlees, veggie, grill, groentvdw

### Footer
- **Left**: Header logo image (header.png)
- **Right**: Day name, date, and month in Dutch (vertically stacked)

## Navigation

### Swipe Gestures (Touch)
- **Swipe Left**: Go to next day
- **Swipe Right**: Go to previous day

### Mouse Drag (Desktop)
- **Click and Drag Left**: Go to next day
- **Click and Drag Right**: Go to previous day

### Dot Navigation
- **Tap Dot**: Jump to a specific day

### Keyboard (Testing)
- **Arrow Left**: Go to previous day
- **Arrow Right**: Go to next day

## Data Source

The app fetches menu data from: `https://github.netvark.net/mess/ActualMenus.json`

### Expected JSON Format
```json
[
  {
    "id": "7303",
    "date": "2025-12-22T00:00:00",
    "type": "soep",
    "menu1": "Witloofsoep"
  },
  {
    "id": "7304",
    "date": "2025-12-22T00:00:00",
    "type": "veggie",
    "menu1": "Gevulde paprika met rijst en groenten"
  },
  ...
]
```

- Each object represents one menu item for a specific date and type
- Supported types: `soep`, `vlees`, `veggie`, `grill`, `groentevdw`
- The app only shows pages for dates with all 5 menu types
- If no data exists for today or future dates, an empty screen is shown

## Offline Functionality

### How It Works
1. The Service Worker caches all essential files on first visit:
   - HTML, CSS, JavaScript files
   - Images and fonts
   - Menu data (JSON)

2. **Online Mode**
   - App fetches fresh menu data from the URL
   - Updates cache with new data
   - Automatically reloads if source files are modified

3. **Offline Mode**
   - App serves all files from cache
   - Displays cached menu data if available
   - Shows "No data available" if cache has no data for today or future

### Cache Strategy
- **JSON Data**: Network-first (try online, fall back to cache)
- **Assets** (CSS, JS, images, fonts): Cache-first (use cache, fall back to network)
- **HTML**: Network-first

### Cache Invalidation
- Cache names include timestamps to force fresh downloads when the app is deployed
- Service Worker checks for updates every 60 seconds
- Automatically reloads the page when updates are available

## Technical Details

### Browser Support
- iOS Safari 11+
- Android Chrome 40+
- Firefox Mobile 68+
- Edge Mobile 79+

### Performance
- Lightweight (no external dependencies)
- Optimized for mobile devices
- Smooth 60fps carousel animations
- Efficient touch/mouse event handling

### Configuration
Edit the `CONFIG` object in `app.js` to customize:
- `DATA_URL`: URL to fetch menu data from
- `CACHE_NAME`: Service Worker cache name
- `MENU_TYPES`: Types of menus to display
- `MENU_IMAGES`: Image paths for each menu type

## Development

### Local Testing
To test the app locally:

```bash
# Using Python (Windows)
python -m http.server 8000

# Or using Node.js
npx http-server
```

Then open: `http://localhost:8000/MessApp2/`

**Note**: Service Worker registration requires HTTPS or localhost

### Testing Tips
- Use browser DevTools responsive design mode to test mobile layouts
- Clear DevTools Application > Cache Storage to reset cached data
- Check DevTools Application > Service Workers to see registration status
- Use arrow keys for desktop navigation testing
- Use mouse drag to simulate swipe gestures

### Debugging
- Open browser console to see error messages
- Check Application tab in DevTools for service worker status
- Check Network tab to see cache strategy in action
- Use Lighthouse to audit PWA features

## Making Changes

When you update source files:
1. Upload changes to your server
2. The app will detect changes within 60 seconds
3. Automatically reload to apply updates
4. Users get the latest version without manual intervention

### Files That Trigger Updates
- `index.html`
- `app.js`
- `styles.css`
- Menu data from the JSON URL

## Troubleshooting

### Service Worker not registering
- Ensure app is served over HTTPS or localhost
- Check browser console for registration errors
- Clear browser cache and reload

### Data not loading
- Verify the `DATA_URL` is accessible
- Check browser Network tab for fetch errors
- Check if CORS headers are properly set on the data endpoint
- Verify JSON format matches the expected schema

### Cached data not updating
- Service Worker has a 60-second update interval
- Clear browser cache to force immediate refresh
- Check if the data endpoint is returning valid JSON

### Layout issues on notched devices
- Safe area paddings are automatically applied
- Check `@supports (padding: max(0px))` section in CSS

### Carousel not sliding smoothly
- Ensure hardware acceleration is enabled in browser
- Check for JavaScript errors in DevTools console
- Test with fresh browser cache

## License

This PWA is part of the BeckersTom.github.io project.
