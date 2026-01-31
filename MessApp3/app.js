// Configuration
const CONFIG = {
    DATA_URL: 'https://github.netvark.net/mess/ActualMenusNew.json',
    CACHE_NAME: 'menu-app-cache-v2',
    DATA_CACHE_KEY: 'menu-data-cache',
    MENU_TYPES: ['soep', 'vlees', 'veggie', 'grill', 'groentvdw'],
    MENU_IMAGES: {
        soep: 'images/soep.png',
        vlees: 'images/vlees.png',
        veggie: 'images/veggie.png',
        grill: 'images/grill.png',
        groentvdw: 'images/groentvdw.png'
    }
};

// Dutch locale
const DUTCH_DAYS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
const DUTCH_MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

// App State
let appState = {
    menuData: null,
    days: [],
    currentDayIndex: 0,
    dragging: false,
    dragStartX: 0,
    dragStartTime: 0,
    containerWidth: 0
};

// Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(registration => {
            console.log('Service Worker registered');
            setInterval(() => registration.update(), 60000);
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        window.location.reload();
                    }
                });
            });
        })
        .catch(err => console.error('Service Worker registration failed:', err));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadMenuData();
    setupEventListeners();
});

/**
 * Setup event listeners for carousel interaction
 */
function setupEventListeners() {
    const container = document.getElementById('carouselSlides');
    
    // Touch events
    container.addEventListener('touchstart', handleDragStart, { passive: true });
    container.addEventListener('touchmove', handleDragMove, { passive: false });
    container.addEventListener('touchend', handleDragEnd, false);
    container.addEventListener('touchcancel', handleDragEnd, false);
    
    // Mouse events
    container.addEventListener('mousedown', handleDragStart, false);
    document.addEventListener('mousemove', handleDragMove, false);
    document.addEventListener('mouseup', handleDragEnd, false);
    document.addEventListener('mouseleave', handleDragEnd, false);
    
    // Keyboard navigation
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') prevDay();
        else if (e.key === 'ArrowRight') nextDay();
    });
    
    // Dot clicks
    document.addEventListener('click', e => {
        if (e.target.classList.contains('dot')) {
            const index = Array.from(document.querySelectorAll('.dot')).indexOf(e.target);
            goToDay(index);
        }
    });
}

/**
 * Load menu data from URL or cache
 */
async function loadMenuData() {
    try {
        const response = await fetch(CONFIG.DATA_URL);
        if (response.ok) {
            const data = await response.json();
            appState.menuData = data;
            await cacheMenuData(data);
            processMenuData();
            return;
        }
    } catch (error) {
        console.error('Error fetching menu data:', error);
    }
    
    // Fallback to cache
    const cached = await getCachedMenuData();
    if (cached && cached.length > 0) {
        appState.menuData = cached;
        processMenuData();
    } else {
        showNoData();
    }
}

/**
 * Process menu data and extract days
 */
function processMenuData() {
    const today = getToday();
    const todayStr = formatDate(today);
    const previousWorkday = getPreviousWorkday(today);
    const previousWorkdayStr = formatDate(previousWorkday);
    const daysSet = new Set();
    
    // Filter data for today and future, excluding weekends (Saturday=6, Sunday=0)
    const filtered = appState.menuData.filter(item => {
        // Parse date string "YYYY-MM-DDTHH:MM:SS"
        const dateParts = item.date.split('T')[0].split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        const day = parseInt(dateParts[2]);
        // Use UTC to avoid timezone confusion
        const itemDateUTC = new Date(Date.UTC(year, month - 1, day));
        const dayOfWeek = itemDateUTC.getUTCDay();
        // Skip Saturdays (6) and Sundays (0)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return false;
        }
        // Create local date for comparison
        const itemDateLocal = new Date(year, month - 1, day);
        return itemDateLocal >= today;
    });
    
    if (filtered.length === 0) {
        showNoData();
        return;
    }
    
    // Extract unique dates from filtered data (use date string directly to avoid timezone issues)
    filtered.forEach(item => {
        const dateKey = item.date.split('T')[0]; // Extract YYYY-MM-DD part
        daysSet.add(dateKey);
    });

    // Add previous workday if available in data
    if (hasMenuForDate(previousWorkdayStr)) {
        daysSet.add(previousWorkdayStr);
    }
    
    // Sort and render
    appState.days = Array.from(daysSet).sort();

    const defaultIndex = appState.days.findIndex(dateStr => dateStr >= todayStr);
    appState.currentDayIndex = defaultIndex >= 0 ? defaultIndex : 0;
    
    if (appState.days.length === 0) {
        showNoData();
        return;
    }
    
    document.getElementById('loading').style.display = 'none';
    document.getElementById('carousel').style.display = 'flex';
    
    // Render carousel
    renderCarousel();
}

/**
 * Render carousel
 */
function renderCarousel() {
    const container = document.getElementById('carouselSlides');
    const dotContainer = document.getElementById('dotNavigation');
    
    container.innerHTML = '';
    dotContainer.innerHTML = '';
    
    appState.days.forEach((dateStr, index) => {
        const slide = createSlide(dateStr, index);
        // Add data attribute for debugging
        slide.setAttribute('data-day-index', index);
        slide.setAttribute('data-date', dateStr);
        container.appendChild(slide);
        
        const dot = document.createElement('div');
        dot.className = `dot${index === appState.currentDayIndex ? ' active' : ''}`;
        dotContainer.appendChild(dot);
    });
    
    // Initialize carousel - disable transition and set to show default slide
    container.style.transition = 'none';
    container.style.transform = `translateX(${-appState.currentDayIndex * 100}%)`;
    
    // Wait for browser to layout, then enable transition for future navigation
    requestAnimationFrame(() => {
        container.style.transition = 'transform 0.35s ease-in-out';
    });
}

/**
 * Create carousel slide
 */
function createSlide(dateStr, index) {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    
    // Parse date string directly to avoid timezone issues
    const dateParts = dateStr.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]);
    const day = parseInt(dateParts[2]);
    const dateUTC = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = dateUTC.getUTCDay();
    
    const menuItems = getMenuItemsForDate(dateStr);
    
    // Header
    const header = document.createElement('div');
    header.className = 'slide-header';
    header.innerHTML = `
        <div class="date-info">
            ${DUTCH_DAYS[dayOfWeek]}<br>
            ${day} ${DUTCH_MONTHS[month - 1]}
        </div>
        <img src="images/header.png" alt="Header" class="header-logo" onerror="this.style.display='none'">
    `;
    
    // Menu items
    const menuContainer = document.createElement('div');
    menuContainer.className = 'menu-items';
    
    CONFIG.MENU_TYPES.forEach(type => {
        const row = document.createElement('div');
        row.className = 'menu-row';
        row.innerHTML = `
            <img src="${CONFIG.MENU_IMAGES[type]}" alt="${type}" class="menu-row-image" onerror="this.style.display='none'">
            <div class="menu-row-text">${menuItems[type] || 'Niet beschikbaar'}</div>
        `;
        menuContainer.appendChild(row);
    });
    
    // Footer
    const footer = document.createElement('div');
    footer.className = 'slide-footer';
    footer.innerHTML = `
        <img src="images/header.png" alt="Header" class="footer-logo" onerror="this.style.display='none'">
        <div class="footer-date-info">
            ${DUTCH_DAYS[dayOfWeek]}<br>
            ${day} ${DUTCH_MONTHS[month - 1]}
        </div>
    `;
    
    slide.appendChild(header);
    slide.appendChild(menuContainer);
    slide.appendChild(footer);
    
    return slide;
}

/**
 * Get menu items for date
 */
function getMenuItemsForDate(dateStr) {
    const items = {};
    CONFIG.MENU_TYPES.forEach(type => {
        const item = appState.menuData.find(d => d.date.startsWith(dateStr) && d.type === type);
        items[type] = item ? item.menu1 : 'Niet beschikbaar';
    });
    return items;
}

/**
 * Check if menu data exists for a date
 */
function hasMenuForDate(dateStr) {
    return appState.menuData.some(item => item.date.startsWith(dateStr));
}

/**
 * Update carousel position and dots
 */
function updateCarousel() {
    const container = document.getElementById('carouselSlides');
    
    // Calculate the transform
    const translateValue = -appState.currentDayIndex * 100;
    
    // Apply both transition and transform
    container.style.transition = 'transform 0.35s ease-in-out';
    container.style.transform = `translateX(${translateValue}%)`;
    
    // Update dots
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === appState.currentDayIndex);
    });
}

/**
 * Navigate to day
 */
function goToDay(index) {
    if (index >= 0 && index < appState.days.length) {
        appState.currentDayIndex = index;
        updateCarousel();
    }
}

function nextDay() {
    if (appState.currentDayIndex < appState.days.length - 1) {
        goToDay(appState.currentDayIndex + 1);
    }
}

function prevDay() {
    if (appState.currentDayIndex > 0) {
        goToDay(appState.currentDayIndex - 1);
    }
}

/**
 * Drag handling
 */
function handleDragStart(e) {
    if (e.type === 'mousedown' && e.button !== 0) return;
    
    const touch = e.touches ? e.touches[0] : e;
    appState.dragging = true;
    appState.dragStartX = touch.clientX;
    appState.dragStartTime = Date.now();
    
    const container = document.getElementById('carouselSlides');
    appState.containerWidth = container.clientWidth || window.innerWidth;
    container.style.transition = 'none';
}

function handleDragMove(e) {
    if (!appState.dragging) return;
    
    const touch = e.touches ? e.touches[0] : e;
    
    // Allow scroll in menu items
    if (e.target && e.target.closest && e.target.closest('.menu-items')) {
        return;
    }
    
    e.preventDefault();
    
    const deltaX = touch.clientX - appState.dragStartX;
    const container = document.getElementById('carouselSlides');
    const percent = (deltaX / appState.containerWidth) * 100;
    const base = -appState.currentDayIndex * 100;
    container.style.transform = `translateX(${base + percent}%)`;
}

function handleDragEnd(e) {
    if (!appState.dragging) return;
    appState.dragging = false;
    
    const touch = e.changedTouches ? e.changedTouches[0] : e;
    const deltaX = touch.clientX - appState.dragStartX;
    const duration = Date.now() - appState.dragStartTime;
    const absX = Math.abs(deltaX);
    const threshold = Math.max(30, appState.containerWidth * 0.12);
    
    const container = document.getElementById('carouselSlides');
    container.style.transition = 'transform 0.35s ease-in-out';
    
    if (absX > threshold && duration < 1000) {
        if (deltaX < 0) {
            nextDay();
        } else {
            prevDay();
        }
    } else {
        updateCarousel();
    }
}

/**
 * Show no data
 */
function showNoData() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('noData').style.display = 'flex';
}

/**
 * Caching
 */
async function cacheMenuData(data) {
    try {
        if (window.caches) {
            const cache = await caches.open(CONFIG.CACHE_NAME);
            const response = new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
            await cache.put(CONFIG.DATA_URL, response);
        } else {
            localStorage.setItem(CONFIG.DATA_CACHE_KEY, JSON.stringify(data));
        }
    } catch (error) {
        console.error('Error caching data:', error);
    }
}

async function getCachedMenuData() {
    try {
        if (window.caches) {
            const cache = await caches.open(CONFIG.CACHE_NAME);
            const response = await cache.match(CONFIG.DATA_URL);
            if (response) return await response.json();
        } else {
            const cached = localStorage.getItem(CONFIG.DATA_CACHE_KEY);
            if (cached) return JSON.parse(cached);
        }
    } catch (error) {
        console.error('Error retrieving cached data:', error);
    }
    return null;
}

/**
 * Utility functions
 */
function getToday() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getPreviousWorkday(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    do {
        d.setDate(d.getDate() - 1);
    } while (d.getDay() === 0 || d.getDay() === 6);
    return d;
}

/**
 * Refresh data when app comes to focus
 */
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && appState.menuData) {
        loadMenuData();
    }
});
