/* ============================================================
   INDEX.JS — Sci-Fi Hero Page Scripts
   Meteor shower · Warp speed · Typed text · HUD clock
   Asteroid belt · Cursor parallax · Particle burst
   ============================================================ */

'use strict';

// ── Utility ──────────────────────────────────────────────────────────────────
const rand  = (min, max) => Math.random() * (max - min) + min;
const randI = (min, max) => Math.floor(rand(min, max));

// ── Canvas setup ─────────────────────────────────────────────────────────────
const mc  = document.getElementById('meteorCanvas');
const ctx = mc.getContext('2d');
let W, H;

function resize() {
  W = mc.width  = window.innerWidth;
  H = mc.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// ── Mouse tracking ────────────────────────────────────────────────────────────
let mx = W / 2, my = H / 2;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

// ════════════════════════════════════════════════════════════════════════════
// STAR FIELD (parallax layers)
// ════════════════════════════════════════════════════════════════════════════
const STAR_LAYERS = 3;
let starLayers = [];

function initStars() {
  starLayers = [];
  for (let l = 0; l < STAR_LAYERS; l++) {
    const count = [80, 50, 25][l];
    const layer = [];
    for (let i = 0; i < count; i++) {
      layer.push({
        x: rand(0, W), y: rand(0, H),
        r: rand(0.3, 0.8 + l * 0.5),
        speed: 0.01 + l * 0.015,
        phase: rand(0, Math.PI * 2),
        color: ['#ffffff','#c8e8ff','#a0d4ff'][l],
      });
    }
    starLayers.push(layer);
  }
}
initStars();
window.addEventListener('resize', initStars);

function drawStars(t) {
  const pxOff = (mx / W - 0.5) * 40;
  const pyOff = (my / H - 0.5) * 24;
  starLayers.forEach((layer, li) => {
    layer.forEach(s => {
      const ox = (li / STAR_LAYERS) * pxOff;
      const oy = (li / STAR_LAYERS) * pyOff;
      const pulse = 0.5 + Math.sin(t * 0.8 + s.phase) * 0.35;
      ctx.beginPath();
      ctx.arc(s.x + ox, s.y + oy, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = Math.max(0.15, pulse * (0.3 + li * 0.2));
      ctx.fill();
    });
  });
  ctx.globalAlpha = 1;
}

// ════════════════════════════════════════════════════════════════════════════
// METEOR SHOWER
// ════════════════════════════════════════════════════════════════════════════
const meteors = [];
const METEOR_COLORS = [
  ['rgba(0,212,255,', 'rgba(0,212,255,0)'],
  ['rgba(124,58,237,', 'rgba(124,58,237,0)'],
  ['rgba(255,107,239,', 'rgba(255,107,239,0)'],
  ['rgba(255,255,255,', 'rgba(255,255,255,0)'],
  ['rgba(0,255,234,', 'rgba(0,255,234,0)'],
];

function spawnMeteor(forced) {
  const colorSet = METEOR_COLORS[randI(0, METEOR_COLORS.length)];
  const angle    = rand(20, 55) * (Math.PI / 180);   // diagonal angle
  const speed    = rand(8, 22);
  const len      = rand(80, 260);
  const width    = rand(1, 3.5);
  const bright   = rand(0.6, 1.0);

  // Spawn from top or right edge
  let sx, sy;
  if (Math.random() < 0.6) {
    sx = rand(-100, W + 100);
    sy = rand(-80, -10);
  } else {
    sx = rand(W * 0.5, W + 100);
    sy = rand(-80, H * 0.4);
  }

  meteors.push({
    x: sx, y: sy,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    len, width, bright,
    color0: colorSet[0],
    color1: colorSet[1],
    life: 1,
    fade: rand(0.008, 0.022),
    // Tail particles
    sparks: [],
    sparkTimer: 0,
  });
}

// Spawn meteors on interval + burst on cursor move
let meteorTimer = 0;
let lastMX = mx, lastMY = my;

function spawnMeteorBurst(x, y) {
  for (let i = 0; i < 2; i++) {
    const colorSet = METEOR_COLORS[randI(0, METEOR_COLORS.length)];
    const angle = rand(15, 65) * (Math.PI / 180);
    const speed = rand(5, 14);
    meteors.push({
      x, y,
      vx: Math.cos(angle) * speed * (Math.random() < 0.5 ? 1 : -1),
      vy: Math.sin(angle) * speed,
      len: rand(40, 120),
      width: rand(0.8, 2),
      bright: rand(0.5, 0.9),
      color0: colorSet[0],
      color1: colorSet[1],
      life: 1,
      fade: rand(0.025, 0.05),
      sparks: [],
      sparkTimer: 0,
    });
  }
}

// Cursor movement triggers meteors
let cursorMeteorCooldown = 0;
document.addEventListener('mousemove', e => {
  if (cursorMeteorCooldown <= 0) {
    const dx = e.clientX - lastMX;
    const dy = e.clientY - lastMY;
    const speed = Math.sqrt(dx * dx + dy * dy);
    if (speed > 18) {
      spawnMeteorBurst(e.clientX, e.clientY);
      cursorMeteorCooldown = 8;
    }
    lastMX = e.clientX;
    lastMY = e.clientY;
  }
});

function drawMeteors(dt) {
  // Auto-spawn
  meteorTimer += dt;
  if (meteorTimer > 0.4) {
    spawnMeteor();
    if (Math.random() < 0.3) spawnMeteor(); // occasional double
    meteorTimer = 0;
  }
  cursorMeteorCooldown = Math.max(0, cursorMeteorCooldown - 1);

  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i];
    m.x += m.vx;
    m.y += m.vy;
    m.life -= m.fade;

    if (m.life <= 0 || m.x > W + 200 || m.y > H + 200) {
      meteors.splice(i, 1);
      continue;
    }

    // Tail gradient
    const tx = m.x - Math.cos(Math.atan2(m.vy, m.vx)) * m.len;
    const ty = m.y - Math.sin(Math.atan2(m.vy, m.vx)) * m.len;
    const grad = ctx.createLinearGradient(tx, ty, m.x, m.y);
    grad.addColorStop(0, m.color1);
    grad.addColorStop(0.6, m.color0 + (m.bright * m.life * 0.4) + ')');
    grad.addColorStop(1, m.color0 + (m.bright * m.life) + ')');

    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(m.x, m.y);
    ctx.strokeStyle = grad;
    ctx.lineWidth = m.width * m.life;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Bright head dot
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.width * 1.8 * m.life, 0, Math.PI * 2);
    ctx.fillStyle = m.color0 + (m.bright * m.life) + ')';
    ctx.shadowBlur = 12 * m.life;
    ctx.shadowColor = m.color0 + '0.8)';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Spawn tail sparks
    m.sparkTimer++;
    if (m.sparkTimer % 3 === 0 && m.life > 0.3) {
      m.sparks.push({
        x: m.x + rand(-4, 4),
        y: m.y + rand(-4, 4),
        vx: rand(-1.5, 1.5),
        vy: rand(-1.5, 1.5),
        life: rand(0.4, 0.9),
        r: rand(0.5, 1.5),
        color: m.color0,
      });
    }

    // Draw sparks
    for (let j = m.sparks.length - 1; j >= 0; j--) {
      const sp = m.sparks[j];
      sp.x += sp.vx; sp.y += sp.vy; sp.life -= 0.06;
      if (sp.life <= 0) { m.sparks.splice(j, 1); continue; }
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.r * sp.life, 0, Math.PI * 2);
      ctx.fillStyle = sp.color + (sp.life * 0.8) + ')';
      ctx.fill();
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ASTEROID BELT (slow drifting rocks)
// ════════════════════════════════════════════════════════════════════════════
const asteroids = [];
const AST_COUNT = 12;

function initAsteroids() {
  asteroids.length = 0;
  for (let i = 0; i < AST_COUNT; i++) {
    const r = rand(2, 7);
    asteroids.push({
      x: rand(0, W), y: rand(0, H),
      r,
      vx: rand(-0.3, 0.3),
      vy: rand(0.1, 0.5),
      rot: rand(0, Math.PI * 2),
      rotSpeed: rand(-0.01, 0.01),
      alpha: rand(0.15, 0.45),
      // Irregular shape offsets
      pts: Array.from({length: 7}, () => rand(0.6, 1.4)),
    });
  }
}
initAsteroids();
window.addEventListener('resize', initAsteroids);

function drawAsteroids() {
  asteroids.forEach(a => {
    a.x += a.vx; a.y += a.vy; a.rot += a.rotSpeed;
    if (a.y > H + 20) { a.y = -20; a.x = rand(0, W); }
    if (a.x < -20) a.x = W + 20;
    if (a.x > W + 20) a.x = -20;

    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.rot);
    ctx.globalAlpha = a.alpha;
    ctx.beginPath();
    const n = a.pts.length;
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2;
      const r = a.r * a.pts[i];
      i === 0 ? ctx.moveTo(Math.cos(angle)*r, Math.sin(angle)*r)
              : ctx.lineTo(Math.cos(angle)*r, Math.sin(angle)*r);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(0,212,255,0.6)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = 'rgba(8,18,40,0.7)';
    ctx.fill();
    ctx.restore();
  });
  ctx.globalAlpha = 1;
}

// ════════════════════════════════════════════════════════════════════════════
// WARP SPEED LINES (on page load burst)
// ════════════════════════════════════════════════════════════════════════════
const warpLines = [];
let warpActive = true;
let warpTimer  = 0;
const WARP_DURATION = 2.2; // seconds

function initWarp() {
  warpLines.length = 0;
  const cx = W / 2, cy = H / 2;
  for (let i = 0; i < 120; i++) {
    const angle = rand(0, Math.PI * 2);
    const dist  = rand(20, 80);
    warpLines.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      angle,
      speed: rand(18, 55),
      len: rand(10, 40),
      life: 1,
      color: METEOR_COLORS[randI(0, METEOR_COLORS.length)][0],
    });
  }
}
initWarp();

function drawWarp(dt) {
  if (!warpActive) return;
  warpTimer += dt;
  const progress = warpTimer / WARP_DURATION;
  if (progress >= 1) { warpActive = false; return; }

  const fade = progress < 0.5 ? progress * 2 : (1 - progress) * 2;

  warpLines.forEach(w => {
    const spd = w.speed * (1 + progress * 3);
    w.x += Math.cos(w.angle) * spd * dt;
    w.y += Math.sin(w.angle) * spd * dt;
    const len = w.len * (1 + progress * 4);

    const tx = w.x - Math.cos(w.angle) * len;
    const ty = w.y - Math.sin(w.angle) * len;
    const g = ctx.createLinearGradient(tx, ty, w.x, w.y);
    g.addColorStop(0, w.color + '0)');
    g.addColorStop(1, w.color + (fade * 0.9) + ')');

    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(w.x, w.y);
    ctx.strokeStyle = g;
    ctx.lineWidth = rand(0.5, 2);
    ctx.stroke();
  });
}

// ════════════════════════════════════════════════════════════════════════════
// NEBULA PULSE (cursor-reactive glow)
// ════════════════════════════════════════════════════════════════════════════
function drawNebula(t) {
  const pulse = 0.5 + Math.sin(t * 0.4) * 0.3;
  const g = ctx.createRadialGradient(mx, my, 0, mx, my, 300 + pulse * 80);
  g.addColorStop(0, `rgba(0,212,255,${0.04 + pulse * 0.03})`);
  g.addColorStop(0.5, `rgba(124,58,237,${0.02 + pulse * 0.02})`);
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN RENDER LOOP
// ════════════════════════════════════════════════════════════════════════════
let lastTime = 0;

function render(ts) {
  const t  = ts * 0.001;
  const dt = Math.min(t - lastTime, 0.05);
  lastTime = t;

  ctx.clearRect(0, 0, W, H);

  drawNebula(t);
  drawStars(t);
  drawAsteroids();
  drawWarp(dt);
  drawMeteors(dt);

  requestAnimationFrame(render);
}
requestAnimationFrame(render);

// ════════════════════════════════════════════════════════════════════════════
// TYPED TEXT EFFECT
// ════════════════════════════════════════════════════════════════════════════
const ROLES = [
  'Full-Stack Developer',
  'Collection Specialist',
  'Virtual Assistant',
  'React & Node.js Engineer',
  'Problem Solver',
];
let roleIdx = 0, charIdx = 0, deleting = false, typePause = 0;
const typedEl = document.getElementById('typedText');

function typeStep() {
  if (!typedEl) return;
  if (typePause > 0) { typePause--; setTimeout(typeStep, 80); return; }

  const role = ROLES[roleIdx];
  if (!deleting) {
    charIdx++;
    typedEl.textContent = role.slice(0, charIdx);
    if (charIdx === role.length) { deleting = true; typePause = 28; }
    setTimeout(typeStep, 75);
  } else {
    charIdx--;
    typedEl.textContent = role.slice(0, charIdx);
    if (charIdx === 0) {
      deleting = false;
      roleIdx = (roleIdx + 1) % ROLES.length;
      typePause = 8;
    }
    setTimeout(typeStep, 38);
  }
}
setTimeout(typeStep, 900);

// ════════════════════════════════════════════════════════════════════════════
// HUD CLOCK
// ════════════════════════════════════════════════════════════════════════════
const hudClock = document.getElementById('hudClock');
function updateClock() {
  if (!hudClock) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const s = String(now.getSeconds()).padStart(2,'0');
  hudClock.textContent = h + ':' + m + ':' + s;
}
updateClock();
setInterval(updateClock, 1000);

// ════════════════════════════════════════════════════════════════════════════
// STAT COUNTER (for index page)
// ════════════════════════════════════════════════════════════════════════════
document.querySelectorAll('.stat-num[data-count]').forEach(el => {
  const target = +el.dataset.count;
  let cur = 0;
  const step = target / 60;
  const tick = setInterval(() => {
    cur += step;
    if (cur >= target) { el.textContent = target; clearInterval(tick); }
    else el.textContent = Math.floor(cur);
  }, 22);
});

// ════════════════════════════════════════════════════════════════════════════
// SCROLL REVEAL (for preview strip)
// ════════════════════════════════════════════════════════════════════════════
const revEls = document.querySelectorAll('.reveal-up');
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const delay = parseFloat(getComputedStyle(e.target).getPropertyValue('--rd')) || 0;
    setTimeout(() => e.target.classList.add('visible'), delay * 1000);
    revObs.unobserve(e.target);
  });
}, { threshold: 0.1 });
revEls.forEach(el => revObs.observe(el));

// ════════════════════════════════════════════════════════════════════════════
// CLICK BURST — meteor explosion on click
// ════════════════════════════════════════════════════════════════════════════
document.addEventListener('click', e => {
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + rand(-0.3, 0.3);
    const speed = rand(6, 18);
    const colorSet = METEOR_COLORS[randI(0, METEOR_COLORS.length)];
    meteors.push({
      x: e.clientX, y: e.clientY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: rand(30, 90),
      width: rand(1, 2.5),
      bright: rand(0.7, 1.0),
      color0: colorSet[0],
      color1: colorSet[1],
      life: 1,
      fade: rand(0.02, 0.04),
      sparks: [],
      sparkTimer: 0,
    });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// HAMBURGER (shared with script.js but safe to re-bind)
// ════════════════════════════════════════════════════════════════════════════
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// BACK TO TOP
// ════════════════════════════════════════════════════════════════════════════
const backTop = document.getElementById('backToTop');
if (backTop) {
  window.addEventListener('scroll', () => {
    backTop.classList.toggle('visible', window.scrollY > 300);
  });
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
