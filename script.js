const revealItems = document.querySelectorAll('.reveal');
const nav = document.querySelector('.nav');
const menuToggle = document.querySelector('.menu-toggle');
const toastLayer = document.querySelector('[data-toast-layer]');
const logPreview = document.querySelector('[data-log-preview]');
const dashboardLog = document.querySelector('[data-dashboard-log]');
const simulateHazardBtn = document.getElementById('simulate-hazard');
const robotStatus = document.querySelector('[data-robot-status]');
const patrolStatus = document.querySelector('[data-patrol-status]');
const waypointStatus = document.querySelector('[data-waypoint]');
const gaugeCards = document.querySelectorAll('[data-gauge-card]');
const video = document.getElementById('robot-demo-video');
const videoPlay = document.querySelector('[data-video-play]');
const videoFallback = document.querySelector('[data-video-fallback]');
const commandButtons = document.querySelectorAll('[data-command]');
const assetMedia = document.querySelectorAll('[data-asset-media]');

const demoEvents = [
  { time: '08:42', type: 'Missing Helmet Detected', location: 'Waypoint 2', tag: 'warning' },
  { time: '08:45', type: 'High Gas Concentration', location: 'Sector A3', tag: 'danger' },
  { time: '08:47', type: 'Waypoint 3 Reached', location: 'Inspection Route', tag: 'info' },
  { time: '08:50', type: 'Obstacle Detected', location: 'Loading Bay', tag: 'warning' },
  { time: '08:52', type: 'Patrol Resumed', location: 'Main Corridor', tag: 'success' },
];

const sensorState = {
  temperature: 28,
  humidity: 47,
  gas: 220,
  noise: 62,
};

function formatClock() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderEventList(listElement, items, limit = 5) {
  if (!listElement) return;
  listElement.innerHTML = items.slice(0, limit).map((entry) => `
    <div class="event-card">
      <div class="event-card__time">${entry.time}</div>
      <div>
        <div class="event-card__type">${entry.type}</div>
        <div class="event-card__loc">${entry.location}</div>
      </div>
      <div class="event-tag event-tag--${entry.tag}">${entry.tag}</div>
    </div>
  `).join('');
}

function pushEvent(entry) {
  demoEvents.unshift({ time: formatClock(), ...entry });
  renderEventList(logPreview, demoEvents, 3);
  renderEventList(dashboardLog, demoEvents, 6);
}

function showToast(title, message, variant = 'info') {
  if (!toastLayer) return;
  const toast = document.createElement('div');
  toast.className = `toast toast--${variant}`;
  toast.innerHTML = `<strong>${title}</strong><div>${message}</div>`;
  toastLayer.appendChild(toast);
  window.setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(16px)';
  }, 3200);
  window.setTimeout(() => toast.remove(), 3800);
}

function setGauge(metric, value, danger = false) {
  const card = document.querySelector(`[data-gauge-card="${metric}"]`) || document.querySelector(`[data-metric="${metric}"]`);
  if (!card) return;
  const gauge = card.querySelector('[data-gauge]');
  const valueNode = card.querySelector('[data-gauge-value]');
  if (gauge) {
    gauge.style.setProperty('--value', value);
  }
  if (valueNode) {
    valueNode.textContent = metric === 'humidity' ? `${Math.round(value)}` : `${Math.round(value)}`;
  }
  card.classList.toggle('danger', danger);
  card.classList.toggle('danger-pulse', danger);
}

function animateGauge(metric, target) {
  const start = Number(sensorState[metric]);
  const steps = 36;
  const delta = (target - start) / steps;
  let frame = 0;

  const tick = () => {
    frame += 1;
    const next = start + delta * frame;
    sensorState[metric] = next;
    setGauge(metric, next, metric === 'gas' && next >= 400);
    if (frame < steps) {
      window.requestAnimationFrame(tick);
    }
  };

  tick();
}

function updateSensors() {
  setGauge('temperature', sensorState.temperature);
  setGauge('humidity', sensorState.humidity);
  setGauge('gas', sensorState.gas);
  setGauge('noise', sensorState.noise);
}

function setStatus(mode) {
  if (!robotStatus || !patrolStatus || !waypointStatus) return;
  if (mode === 'start') {
    robotStatus.textContent = 'Patrolling';
    patrolStatus.textContent = 'Autonomous patrol running';
    waypointStatus.textContent = 'Waypoint 3';
    showToast('START command sent', 'Robot has resumed autonomous patrol.', 'success');
  }
  if (mode === 'stop') {
    robotStatus.textContent = 'Stopped';
    patrolStatus.textContent = 'Patrol paused by operator';
    showToast('STOP command sent', 'Robot motion has been paused.', 'info');
  }
  if (mode === 'alarm') {
    robotStatus.textContent = 'Alarm';
    patrolStatus.textContent = 'Emergency alert active';
    waypointStatus.textContent = 'Hold position';
    showToast('ALARM triggered', 'Operators have been notified with a red alert state.', 'danger');
    document.querySelectorAll('.dashboard-panel, .hero-frame').forEach((element) => element.classList.add('alarm-flash'));
    pushEvent({ type: 'Alarm Triggered', location: 'Operator Console', tag: 'danger' });
    window.setTimeout(() => document.querySelectorAll('.dashboard-panel, .hero-frame').forEach((element) => element.classList.remove('alarm-flash')), 3600);
  }
}

function onAssetError(event) {
  const image = event.currentTarget;
  image.style.display = 'none';
  const fallback = image.nextElementSibling;
  if (fallback) {
    fallback.style.display = 'block';
  }
}

function initAssetFallbacks() {
  assetMedia.forEach((image) => {
    if (image.complete && image.naturalWidth > 0) {
      image.style.opacity = '1';
      const fallback = image.nextElementSibling;
      if (fallback) fallback.style.display = 'none';
      return;
    }
    image.addEventListener('error', onAssetError);
    image.addEventListener('load', () => {
      image.style.opacity = '1';
      const fallback = image.nextElementSibling;
      if (fallback) fallback.style.display = 'none';
    });
  });
}

function initVideoFallback() {
  if (!video || !videoFallback) return;
  const showFallback = () => {
    videoFallback.style.display = 'block';
  };
  const hideFallback = () => {
    videoFallback.style.display = 'none';
  };
  video.addEventListener('error', showFallback);
  video.addEventListener('emptied', showFallback);
  video.addEventListener('loadeddata', hideFallback);
  videoPlay?.addEventListener('click', () => {
    if (video.readyState > 0) {
      video.play().catch(() => showFallback());
      hideFallback();
      return;
    }
    showToast('Video placeholder', 'Add assets/robot-demo.mp4 to enable playback.', 'info');
    showFallback();
  });
}

function initSmoothScroll() {
  document.querySelectorAll('[data-scroll]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetSelector = link.getAttribute('href');
      if (!targetSelector || !targetSelector.startsWith('#')) return;
      const target = document.querySelector(targetSelector);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      nav?.classList.remove('is-open');
      menuToggle?.setAttribute('aria-expanded', 'false');
    });
  });
}

function initRevealObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealItems.forEach((item) => observer.observe(item));
}

function initActiveNav() {
  const links = [...document.querySelectorAll('.nav a')];
  const sections = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { threshold: 0.45 });
  sections.forEach((section) => observer.observe(section));
}

function initMenuToggle() {
  menuToggle?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

function initControls() {
  commandButtons.forEach((button) => {
    button.addEventListener('click', () => setStatus(button.dataset.command));
  });

  simulateHazardBtn?.addEventListener('click', () => {
    sensorState.gas = 450;
    setGauge('gas', 450, true);
    showToast('Environmental hazard detected', 'Gas concentration crossed the warning threshold.', 'danger');
    pushEvent({ type: 'Environmental Hazard Detected', location: 'Sector A3', tag: 'danger' });
    const gasCard = document.querySelector('[data-metric="gas"]');
    gasCard?.classList.add('danger-pulse');
    window.setTimeout(() => gasCard?.classList.remove('danger-pulse'), 3200);
  });
}

function init() {
  renderEventList(logPreview, demoEvents, 3);
  renderEventList(dashboardLog, demoEvents, 6);
  updateSensors();
  initAssetFallbacks();
  initVideoFallback();
  initSmoothScroll();
  initRevealObserver();
  initActiveNav();
  initMenuToggle();
  initControls();

  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
  }, 200);
}

init();
