// Configuration
const CONFIG = {
    DATA_URL: 'https://github.netvark.net/mess/ActualMenus.json',
    CACHE_NAME: 'menu-app-cache-v1',
    DATA_CACHE_KEY: 'menu-data-cache',
    MENU_TYPES: ['soep', 'vlees', 'veggie', 'grill', 'groentevdw'],
    MENU_IMAGES: {
        soep: 'images/soep.png',
        vlees: 'images/vlees.png',
        veggie: 'images/veggie.png',
        grill: 'images/grill.png',
        groentevdw: 'images/groentvdw.png'
    }
};

// Dutch locale data
const DUTCH_DAYS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
const DUTCH_MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

// App State
let appState = {
    menuData: null,
    days: [],
    currentDayIndex: 0,
    touchStartX: 0,
    touchStartTime: 0,
    touchDragging: false,
    containerWidth: 0
};

// Initialize Service Worker and check for updates
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(registration => {
            console.log('Service Worker registered');
            
            // Check for updates periodically
            setInterval(() => {
                registration.update();
            }, 60000); // Check every minute
            
            // Listen for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New service worker is ready, refresh the page
                        console.log('PWA update available, reloading...');
                        window.location.reload();
                    }
                });
            });
        })
        .catch(err => console.error('Service Worker registration failed:', err));
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadMenuData();
    setupEventListeners();
});

/**
 * Setup event listeners for touch and navigation
 */
function setupEventListeners() {
    const carouselSlides = document.getElementById('carouselSlides');
    
    // Touch events for swipe
    carouselSlides.addEventListener('touchstart', handleTouchStart, { passive: true });
    carouselSlides.addEventListener('touchmove', handleTouchMove, { passive: false });
    carouselSlides.addEventListener('touchend', handleTouchEnd, false);
    carouselSlides.addEventListener('touchcancel', handleTouchEnd, false);
    
    // Mouse events for drag support (desktop)
    carouselSlides.addEventListener('mousedown', handleMouseDown, false);
    // mousemove/up are attached to document to capture drags outside the element
    document.addEventListener('mousemove', handleMouseMove, false);
    document.addEventListener('mouseup', handleMouseUp, false);
    document.addEventListener('mouseleave', handleMouseUp, false);
    
    // Keyboard navigation for testing
    document.addEventListener('keydown', handleKeyPress);
}

/**
 * Load menu data from URL or cache
 */
async function loadMenuData() {
    try {
        // Try to fetch from URL
        const response = await fetch(CONFIG.DATA_URL);
        if (response.ok) {
            const data = await response.json();
            appState.menuData = data;
            // Cache the data
            await cacheMenuData(data);
            processMenuData();
            return;
        }
    } catch (error) {
        console.error('Error fetching menu data:', error);
    }
    
    // Fallback to cached data
    const cachedData = await getCachedMenuData();
    if (cachedData && cachedData.length > 0) {
        appState.menuData = cachedData;
        processMenuData();
    } else {
        showNoData();
    }
}

/**
 * Process menu data and extract days with future dates
 */
function processMenuData() {
    const today = getToday();
    const daysSet = new Set();
    
    // Filter data for today and future dates
    const filteredData = appState.menuData.filter(item => {
        const itemDate = new Date(item.date);
        const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
        return itemDateOnly >= today;
    });
    
    if (filteredData.length === 0) {
        showNoData();
        return;
    }
    
    // Extract unique dates
    filteredData.forEach(item => {
        const itemDate = new Date(item.date);
        const dateKey = itemDate.toISOString().split('T')[0];
        daysSet.add(dateKey);
    });
    
    // Sort dates and create days array
    appState.days = Array.from(daysSet).sort();
    
    if (appState.days.length === 0) {
        showNoData();
        return;
    }
    
    // Hide loading and render carousel
    document.getElementById('loadingIndicator').style.display = 'none';
    renderCarousel();
    showCarousel();
}

/**
 * Render the carousel slides and dots
 */
function renderCarousel() {
    const carouselSlides = document.getElementById('carouselSlides');
    const dotNavigation = document.getElementById('dotNavigation');
    
    carouselSlides.innerHTML = '';
    dotNavigation.innerHTML = '';
    
    appState.days.forEach((dateStr, index) => {
        // Create slide
        const slide = createSlide(dateStr, index);
        carouselSlides.appendChild(slide);
        
        // Create dot
        const dot = document.createElement('div');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToDay(index));
        dotNavigation.appendChild(dot);
    });
    
    // Set active slide
    updateActiveSlide();
}

/**
 * Create a carousel slide for a specific date
 */
function createSlide(dateStr, dayIndex) {
    const slide = document.createElement('div');
    slide.className = `carousel-slide ${dayIndex === 0 ? 'active' : ''}`;
    slide.setAttribute('data-day-index', dayIndex);
    
    const date = new Date(dateStr + 'T00:00:00');
    const menuItems = getMenuItemsForDate(dateStr);
    
    // Header
    const header = document.createElement('div');
    header.className = 'slide-header';
    header.innerHTML = `
        <div class="date-info">
            ${getDutchDayName(date.getDay())}<br>
            ${date.getDate()} ${getDutchMonthName(date.getMonth())}
        </div>
        <img src="images/header.png" alt="Header" class="header-logo" onerror="this.style.display='none'">
    `;
    
    // Menu Items
    const menuContainer = document.createElement('div');
    menuContainer.className = 'menu-items';
    
    CONFIG.MENU_TYPES.forEach(type => {
        const menuItem = menuItems[type] || '';
        const row = document.createElement('div');
        row.className = 'menu-row';
        
        row.innerHTML = `
            <img src="${CONFIG.MENU_IMAGES[type]}" alt="${type}" class="menu-row-image" onerror="this.style.display='none'">
            <div class="menu-row-text">${menuItem}</div>
        `;
        
        menuContainer.appendChild(row);
    });
    
    // Footer
    const footer = document.createElement('div');
    footer.className = 'slide-footer';
    footer.innerHTML = `
        <img src="images/header.png" alt="Header" class="footer-logo" onerror="this.style.display='none'">
        <div class="footer-date-info">
            ${getDutchDayName(date.getDay())}<br>
            ${date.getDate()} ${getDutchMonthName(date.getMonth())}
        </div>
    `;
    
    slide.appendChild(header);
    slide.appendChild(menuContainer);
    slide.appendChild(footer);
    
    return slide;
}

/**
 * Get menu items for a specific date
 */
function getMenuItemsForDate(dateStr) {
    const items = {};
    
    CONFIG.MENU_TYPES.forEach(type => {
        const item = appState.menuData.find(
            data => data.date.startsWith(dateStr) && data.type === type
        );
        items[type] = item ? item.menu1 : 'Niet beschikbaar';
    });
    
    return items;
}

/**
 * Update active slide and dot
 */
function updateActiveSlide() {
    // Slide the container using transform for smooth animation
    const container = document.getElementById('carouselSlides');
    container.style.transition = 'transform 0.35s ease-in-out';
    container.style.transform = `translateX(-${appState.currentDayIndex * 100}%)`;

    // Update dots
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === appState.currentDayIndex);
    });
}

/**
 * Go to a specific day
 */
function goToDay(index) {
    if (index >= 0 && index < appState.days.length) {
        appState.currentDayIndex = index;
        updateActiveSlide();
    }
}

/**
 * Navigate to next day
 */
function nextDay() {
    if (appState.currentDayIndex < appState.days.length - 1) {
        goToDay(appState.currentDayIndex + 1);
    }
}

/**
 * Navigate to previous day
 */
function prevDay() {
    if (appState.currentDayIndex > 0) {
        goToDay(appState.currentDayIndex - 1);
    }
}

// Touch handling
function handleTouchStart(e) {
    const touch = e.changedTouches[0];
    appState.touchStartX = touch.clientX;
    appState.touchStartTime = Date.now();
    appState.touchDragging = true;
    const container = document.getElementById('carouselSlides');
    appState.containerWidth = container.clientWidth || window.innerWidth;
    // stop any ongoing transition while dragging
    container.style.transition = 'none';
}

function handleTouchMove(e) {
    // Prevent scrolling while swiping
    if (!appState.touchDragging) return;
    if (e.target.closest('.menu-items')) {
        // allow scrolling inside menu items
        return;
    }
    e.preventDefault();
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - appState.touchStartX;
    const container = document.getElementById('carouselSlides');
    const percent = (deltaX / appState.containerWidth) * 100;
    const base = -appState.currentDayIndex * 100;
    container.style.transform = `translateX(${base + percent}%)`;
}

function handleTouchEnd(e) {
    if (!appState.touchDragging) return;
    appState.touchDragging = false;
    const touch = e.changedTouches ? e.changedTouches[0] : null;
    const touchEndX = touch ? touch.clientX : appState.touchStartX;
    const touchDuration = Date.now() - appState.touchStartTime;
    const deltaX = touchEndX - appState.touchStartX;
    const absX = Math.abs(deltaX);
    const minSwipeDistance = Math.max(30, appState.containerWidth * 0.12); // adaptive threshold
    const container = document.getElementById('carouselSlides');
    // restore transition
    container.style.transition = 'transform 0.35s ease-in-out';

    if (absX > minSwipeDistance && touchDuration < 1000) {
        if (deltaX < 0) {
            nextDay();
        } else {
            prevDay();
        }
    } else {
        // snap back to current
        container.style.transform = `translateX(-${appState.currentDayIndex * 100}%)`;
    }
}

// Mouse handling (desktop drag)
function handleMouseDown(e) {
    if (e.button !== 0) return; // only left button
    appState.touchStartX = e.clientX;
    appState.touchStartTime = Date.now();
    appState.touchDragging = true;
    const container = document.getElementById('carouselSlides');
    appState.containerWidth = container.clientWidth || window.innerWidth;
    container.style.transition = 'none';
    e.preventDefault();
}

function handleMouseMove(e) {
    if (!appState.touchDragging) return;
    if (e.target && e.target.closest && e.target.closest('.menu-items')) {
        return; // allow scrolling inside menu items
    }
    e.preventDefault();
    const deltaX = e.clientX - appState.touchStartX;
    const container = document.getElementById('carouselSlides');
    const percent = (deltaX / appState.containerWidth) * 100;
    const base = -appState.currentDayIndex * 100;
    container.style.transform = `translateX(${base + percent}%)`;
}

function handleMouseUp(e) {
    if (!appState.touchDragging) return;
    appState.touchDragging = false;
    const touchEndX = e.clientX;
    const touchDuration = Date.now() - appState.touchStartTime;
    const deltaX = touchEndX - appState.touchStartX;
    const absX = Math.abs(deltaX);
    const minSwipeDistance = Math.max(30, appState.containerWidth * 0.12);
    const container = document.getElementById('carouselSlides');
    container.style.transition = 'transform 0.35s ease-in-out';

    if (absX > minSwipeDistance && touchDuration < 1000) {
        if (deltaX < 0) {
            nextDay();
        } else {
            prevDay();
        }
    } else {
        container.style.transform = `translateX(-${appState.currentDayIndex * 100}%)`;
    }
}

// Keyboard navigation for testing
function handleKeyPress(e) {
    if (e.key === 'ArrowRight') {
        nextDay();
    } else if (e.key === 'ArrowLeft') {
        prevDay();
    }
}

/**
 * Show carousel
 */
function showCarousel() {
    document.getElementById('carouselSlides').parentElement.style.display = 'flex';
}

/**
 * Show no data message
 */
function showNoData() {
    document.getElementById('loadingIndicator').style.display = 'none';
    document.getElementById('noDataMessage').style.display = 'flex';
}

/**
 * Cache menu data
 */
async function cacheMenuData(data) {
    try {
        const cacheStorage = window.caches || localStorage;
        if (window.caches) {
            const cache = await caches.open(CONFIG.CACHE_NAME);
            const response = new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' }
            });
            await cache.put(CONFIG.DATA_URL, response);
        } else {
            localStorage.setItem(CONFIG.DATA_CACHE_KEY, JSON.stringify(data));
        }
    } catch (error) {
        console.error('Error caching menu data:', error);
    }
}

/**
 * Get cached menu data
 */
async function getCachedMenuData() {
    try {
        if (window.caches) {
            const cache = await caches.open(CONFIG.CACHE_NAME);
            const response = await cache.match(CONFIG.DATA_URL);
            if (response) {
                return await response.json();
            }
        } else {
            const cached = localStorage.getItem(CONFIG.DATA_CACHE_KEY);
            if (cached) {
                return JSON.parse(cached);
            }
        }
    } catch (error) {
        console.error('Error retrieving cached menu data:', error);
    }
    return null;
}

/**
 * Get today's date at midnight
 */
function getToday() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

/**
 * Get Dutch day name
 */
function getDutchDayName(dayIndex) {
    return DUTCH_DAYS[dayIndex];
}

/**
 * Get Dutch month name
 */
function getDutchMonthName(monthIndex) {
    return DUTCH_MONTHS[monthIndex];
}

/**
 * Refresh menu data when app comes to focus
 */
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && appState.menuData) {
        loadMenuData();
    }
});
