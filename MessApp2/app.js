// Configuration
const CONFIG = {
    DATA_URL: 'https://github.netvark.net/mess/ActualMenus.json',
    CACHE_NAME: 'menu-app-cache',
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
        console.log('Fetching menu data from:', CONFIG.DATA_URL);
        const response = await fetch(CONFIG.DATA_URL);
        console.log('Fetch response status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('Data loaded successfully, items:', data.length);
            appState.menuData = data;
            await cacheMenuData(data);
            processMenuData();
            return;
        } else {
            console.warn('Fetch failed with status:', response.status);
        }
    } catch (error) {
        console.error('Error fetching menu data:', error);
    }
    
    // Fallback to cache
    console.log('Attempting to load cached data...');
    const cached = await getCachedMenuData();
    if (cached && cached.length > 0) {
        console.log('Cached data found, items:', cached.length);
        appState.menuData = cached;
        processMenuData();
    } else {
        console.log('No cached data available');
        showNoData();
    }
}

/**
 * Process menu data and extract days
 */
function processMenuData() {
    const today = getToday();
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
    
    // Sort and render
    appState.days = Array.from(daysSet).sort();
    
    console.log('Filtered days:', appState.days);
    console.log('Days with data count:', appState.days.length);
    
    // Log what items exist for each day
    appState.days.forEach(dateStr => {
        const itemsForDay = appState.menuData.filter(d => d.date.startsWith(dateStr));
        console.log(`Date ${dateStr}: ${itemsForDay.length} items -`, itemsForDay.map(i => i.type).join(', '));
    });
    
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
    
    console.log('Rendering carousel with', appState.days.length, 'days');
    
    appState.days.forEach((dateStr, index) => {
        console.log(`Creating slide ${index + 1} for ${dateStr}`);
        const slide = createSlide(dateStr);
        console.log(`Slide ${index + 1} created, children:`, slide.children.length);
        container.appendChild(slide);
        
        const dot = document.createElement('div');
        dot.className = `dot${index === 0 ? ' active' : ''}`;
        dotContainer.appendChild(dot);
    });
    
    console.log('Total slides in container:', container.children.length);
    
    // Wait for browser to layout the container before updating carousel
    requestAnimationFrame(() => {
        updateCarousel();
    });
}

/**
 * Create carousel slide
 */
function createSlide(dateStr) {
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
    
    console.log(`Menu container for ${dateStr} has ${menuContainer.children.length} rows`);
    
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
    
    console.log(`Slide for ${dateStr} height: ${slide.offsetHeight}, menu-items height: ${menuContainer.offsetHeight}`);
    
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
    console.log(`Menu items for ${dateStr}:`, items);
    return items;
}

/**
 * Update carousel position and dots
 */
function updateCarousel() {
    const container = document.getElementById('carouselSlides');
    console.log('Updating carousel to day index:', appState.currentDayIndex);
    
    // Ensure transition is enabled
    container.style.transition = 'transform 0.35s ease-in-out';
    
    const translateValue = -appState.currentDayIndex * 100;
    const transformString = `translateX(${translateValue}%)`;
    console.log('Applying transform:', transformString);
    
    // Force a repaint to ensure transition works
    void container.offsetWidth;
    
    container.style.transform = transformString;
    console.log('Transform actually applied:', container.style.transform);
    
    // Log slides
    Array.from(container.children).forEach((slide, i) => {
        const rect = slide.getBoundingClientRect();
        console.log(`Slide ${i}: width=${slide.clientWidth}, visible=${rect.width > 0}, left=${Math.round(rect.left)}`);
    });
    
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
