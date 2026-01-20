// Configuration
const CONFIG = {
    DATA_URL: 'https://github.netvark.net/mess/ActualMenus.json',
    CACHE_NAME: 'menu-app-cache',
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
    const daysSet = new Set();
    
    // Filter data for today and future
    const filtered = appState.menuData.filter(item => {
        const itemDate = new Date(item.date);
        const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
        return itemDateOnly >= today;
    });
    
    if (filtered.length === 0) {
        showNoData();
        return;
    }
    
    // Extract unique dates
    filtered.forEach(item => {
        const itemDate = new Date(item.date);
        const dateKey = itemDate.toISOString().split('T')[0];
        daysSet.add(dateKey);
    });
    
    // Sort and render
    appState.days = Array.from(daysSet).sort();
    
    if (appState.days.length === 0) {
        showNoData();
        return;
    }
    
    document.getElementById('loading').style.display = 'none';
    renderCarousel();
    document.getElementById('carousel').style.display = 'flex';
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
        const slide = createSlide(dateStr);
        container.appendChild(slide);
        
        const dot = document.createElement('div');
        dot.className = `dot${index === 0 ? ' active' : ''}`;
        dotContainer.appendChild(dot);
    });
    
    updateCarousel();
}

/**
 * Create carousel slide
 */
function createSlide(dateStr) {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    
    const date = new Date(dateStr + 'T00:00:00');
    const menuItems = getMenuItemsForDate(dateStr);
    
    // Header
    const header = document.createElement('div');
    header.className = 'slide-header';
    header.innerHTML = `
        <div class="date-info">
            ${DUTCH_DAYS[date.getDay()]}<br>
            ${date.getDate()} ${DUTCH_MONTHS[date.getMonth()]}
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
            ${DUTCH_DAYS[date.getDay()]}<br>
            ${date.getDate()} ${DUTCH_MONTHS[date.getMonth()]}
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
        items[type] = item ? item.menu1 : '';
    });
    return items;
}

/**
 * Update carousel position and dots
 */
function updateCarousel() {
    const container = document.getElementById('carouselSlides');
    container.style.transform = `translateX(-${appState.currentDayIndex * 100}%)`;
    
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

/**
 * Refresh data when app comes to focus
 */
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && appState.menuData) {
        loadMenuData();
    }
});
