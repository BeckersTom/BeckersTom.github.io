// Carousel that is populated from a JSON menu source.
// Behavior:
// - Fetch JSON from remote URL, fallback to local `../mess/ActualMenus.json`.
// - Group menu items by date (YYYY-MM-DD).
// - Use `?date=YYYY-MM-DD` or `#YYYY-MM-DD` to select a day; default to today.
// - Build slides for the selected day (one slide per menu type) and initialize carousel behavior.
(function () {
  const JSON_URL = 'https://github.netvark.net/mess/ActualMenus.json';
  const LOCAL_FALLBACK = '../mess/ActualMenus.json';
  const AUTOPLAY_MS = 4000;

  const track = document.querySelector('.carousel-track');
  const dotsContainer = document.querySelector('.carousel-dots');
  const carouselEl = document.querySelector('.carousel');
  if (!track || !dotsContainer || !carouselEl) return;

  let currentIndex = 0;
  let intervalId = null;

  function formatDateKey(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  async function fetchJson() {
    try {
      const resp = await fetch(JSON_URL, { cache: 'no-store' });
      if (!resp.ok) throw new Error('network');
      return await resp.json();
    } catch (e) {
      try {
        const resp = await fetch(LOCAL_FALLBACK);
        if (!resp.ok) throw new Error('local network');
        return await resp.json();
      } catch (err) {
        console.error('Failed to load menus from remote and local fallback', err);
        return null;
      }
    }
  }

  function groupByDate(items) {
    const map = new Map();
    items.forEach((it) => {
      const key = formatDateKey(it.date || it.Date || it.day || it);
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    });
    return map;
  }

  function getRequestedDate() {
    const params = new URLSearchParams(window.location.search);
    let date = params.get('date') || window.location.hash.replace('#', '');
    if (!date) {
      const now = new Date();
      date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    return date;
  }

  function clearTrack() {
    track.innerHTML = '';
    dotsContainer.innerHTML = '';
  }

  const TYPE_IMAGE = {
    'grill': 'grill.png',
    'soep': 'soep.png',
    'veggie': 'veggie.png',
    'vlees': 'vlees.png',
    'groentvdw': 'header.png'
  };

  function buildSlidesForDay(items) {
    clearTrack();
    if (!items || items.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'slide';
      empty.innerHTML = '<p>No menu available for this day.</p>';
      track.appendChild(empty);
      createDots();
      goToSlide(0);
      return;
    }

    // Sort or group entries by a preferred order
    const order = ['grill', 'soep', 'veggie', 'vlees', 'groentvdw'];
    items.sort((a, b) => (order.indexOf(a.type) - order.indexOf(b.type)));

    items.forEach((it, i) => {
      const slide = document.createElement('div');
      slide.className = 'slide';
      slide.id = `slide-${i}`;

      const imgName = TYPE_IMAGE[it.type] || 'header.png';
      const img = document.createElement('img');
      img.src = `images/${imgName}`;
      img.alt = it.type || 'menu';

      const caption = document.createElement('div');
      caption.className = 'slide-caption';
      const title = document.createElement('h3');
      title.textContent = it.type ? it.type.toUpperCase() : 'Menu';
      const text = document.createElement('p');
      text.textContent = it.menu1 || it.menu || '';

      caption.appendChild(title);
      caption.appendChild(text);

      slide.appendChild(img);
      slide.appendChild(caption);
      track.appendChild(slide);
    });

    createDots();
    goToSlide(0);
    startAutoplay();
  }

  function createDots() {
    const slides = Array.from(track.children);
    slides.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'carousel-dot';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      btn.setAttribute('aria-controls', `slide-${i}`);
      btn.dataset.index = i;
      btn.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(btn);
    });
    updateDots();
  }

  function updateDots() {
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === currentIndex);
      d.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
    });
  }

  function goToSlide(index) {
    const slides = Array.from(track.children);
    if (slides.length === 0) return;
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentIndex = index;
    const offset = -index * 100;
    track.style.transform = `translateX(${offset}%)`;
    updateDots();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function startAutoplay() {
    stopAutoplay();
    intervalId = setInterval(nextSlide, AUTOPLAY_MS);
  }

  function stopAutoplay() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  // keyboard navigation
  carouselEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
    if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
  });

  carouselEl.addEventListener('mouseenter', stopAutoplay);
  carouselEl.addEventListener('focusin', stopAutoplay);
  carouselEl.addEventListener('mouseleave', startAutoplay);
  carouselEl.addEventListener('focusout', startAutoplay);

  // Bootstrapping: fetch data and build slides for requested date
  (async function init() {
    const data = await fetchJson();
    if (!data) {
      buildSlidesForDay([]);
      return;
    }
    const grouped = groupByDate(data);
    const requested = getRequestedDate();
    const items = grouped.get(requested) || [];
    buildSlidesForDay(items);
  })();

})();
