# Menu App PWA

A Progressive Web App for displaying daily menus with offline support, optimized for iOS and Android.

## Features

- **Progressive Web App**: Installable on iOS and Android home screens
- **Offline Support**: Full functionality even without internet connection
- **Carousel Navigation**: Swipe left/right to navigate between days
- **Dot Navigation**: Tap dots to jump to specific days
- **Auto-Caching**: Automatically caches menu data for offline use
- **Responsive Design**: Optimized for portrait orientation on mobile devices
- **Safe Area Support**: Works correctly with notched devices

## Directory Structure

```
MessApp2/
├── index.html          # Main HTML file
├── styles.css          # Stylesheet
├── app.js              # Main JavaScript application
├── service-worker.js   # Service Worker for offline support
├── manifest.json       # PWA manifest file
├── fonts/              # Font files (Filmcryptic.ttf)
└── images/             # Image assets
    ├── background.png  # App background
    ├── header.png      # Header/footer logo
    ├── soep.png        # Soup menu icon
    ├── vlees.png       # Meat menu icon
    ├── veggie.png      # Vegetarian menu icon
    ├── grill.png       # Grill menu icon
    ├── groentevdw.png  # Vegetables menu icon
    ├── icon-192.png    # PWA icon 192x192
    ├── icon-512.png    # PWA icon 512x512
    └── ...other icons
```

## Installation on Mobile

### iOS (iPhone/iPad)
1. Open Safari and navigate to the app URL
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Name the app and tap "Add"

### Android (Chrome)
1. Open Chrome and navigate to the app URL
2. Tap the menu button (three dots)
3. Tap "Install app" or "Add to Home screen"
4. Follow the prompts

## Data Source

The app fetches menu data from: `https://github.netvark.net/mess/ActualMenus.json`

The JSON structure expected:
```json
[
  {
    "id": "7303",
    "date": "2025-12-22T00:00:00",
    "type": "soep",
    "menu1": "Witloofsoep"
  },
  ...
]
```

Menu types: `soep`, `vlees`, `veggie`, `grill`, `groentevdw`

## Offline Functionality

The app automatically caches:
- Essential HTML, CSS, and JavaScript files
- Menu data (most recent successful fetch)
- All images and fonts

When offline, the app will:
1. Display cached menu data if available
2. Show today and future dates from cached data
3. Allow full navigation of cached menus
4. Show "No data available" if there's no cache

## Navigation

### Swipe Gestures
- **Swipe Left**: Go to next day
- **Swipe Right**: Go to previous day

### Dot Navigation
- **Tap Dot**: Jump to specific day

### Keyboard (Testing)
- **Arrow Left**: Go to previous day
- **Arrow Right**: Go to next day

## Technical Details

### Caching Strategy
- **Cache First**: Images, fonts, CSS, JS
- **Network First**: JSON data (with fallback to cache)
- **Stale While Revalidate**: Menu data

### Browser Support
- iOS Safari 11+
- Android Chrome 40+
- Firefox Mobile 68+
- Edge Mobile 79+

### Performance
- Lightweight (no external dependencies)
- Fast load times with service worker caching
- Smooth carousel animations
- Efficient touch handling

## Configuration

Edit the `CONFIG` object in `app.js` to customize:
- `DATA_URL`: URL to fetch menu data from
- `CACHE_NAME`: Service worker cache name
- `MENU_TYPES`: Types of menus to display
- `MENU_IMAGES`: Image paths for each menu type

## Development

To test the app locally:
1. Serve the MessApp2 directory via HTTPS or localhost
2. Open `index.html` in a browser
3. Test swipe gestures and navigation
4. Check browser console for any errors

Note: Service Worker requires HTTPS or localhost for registration.

## Browser DevTools Tips

- **Application Tab**: View service worker status and cached files
- **Network Tab**: See cache strategy in action
- **Lighthouse**: Audit PWA features
- **Responsive Design Mode**: Test mobile layout

## Troubleshooting

### Service Worker not registering
- Ensure app is served over HTTPS or localhost
- Check browser console for registration errors
- Clear browser cache and reload

### Data not loading
- Check the DATA_URL in app.js
- Ensure JSON endpoint is accessible
- Check browser console for CORS errors
- Verify cached data exists for offline use

### Layout issues on notched devices
- App automatically handles safe areas
- Check manifest.json viewport settings
- Clear cached styles and hard refresh

## License

This PWA is part of the BeckersTom.github.io project.
