/* ============================================================
   PORTFOLIO VA — script.js  (full rewrite)
   Sci-fi canvas BG · cursor glow · sparkle trail · confetti
   scroll reveals · skill bars · slider · hamburger · navbar
   ============================================================ */

// ===== PROFILE PHOTO FALLBACK =====
const profilePhoto = document.querySelector(".profile-photo");
const photoFallback = document.getElementById("photoFallback");
if (profilePhoto) {
  profilePhoto.addEventListener("error", () => {
    profilePhoto.style.display = "none";
    if (photoFallback) photoFallback.style.display = "flex";
  });
}

// ===== SCI-FI BACKGROUND CANVAS =====
const bgCanvas = document.getElementById("bgCanvas");
const bgCtx = bgCanvas.getContext("2d");
let W, H, mouseX = 0, mouseY = 0, targetMX = 0, targetMY = 0;

function resizeBg() {
  W = bgCanvas.width = window.innerWidth;
  H = bgCanvas.height = window.innerHeight;
}
resizeBg();
window.addEventListener("resize", resizeBg);

// Stars
const STAR_COUNT = () => Math.max(120, Math.round(W * H / 14000));
let stars = [];
function initStars() {
  stars = [];
  const n = STAR_COUNT();
  for (let i = 0; i < n; i++) {
    stars.push({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      depth: Math.random(),
      phase: Math.random() * Math.PI * 2,
      dx: (Math.random() - 0.5) * 0.04,
      dy: (Math.random() - 0.5) * 0.04,
    });
  }
}
initStars();
window.addEventListener("resize", initStars);

// Grid lines
const GRID = 80;

// Nebula blobs
const nebulas = [
  { x: 0.15, y: 0.2,  r: 0.28, c: "rgba(0,212,255,0.045)" },
  { x: 0.82, y: 0.15, r: 0.22, c: "rgba(124,58,237,0.05)" },
  { x: 0.5,  y: 0.7,  r: 0.32, c: "rgba(255,107,239,0.03)" },
  { x: 0.1,  y: 0.75, r: 0.2,  c: "rgba(0,212,255,0.03)" },
];

// Shooting stars
let shooters = [];
function spawnShooter() {
  shooters.push({
    x: Math.random() * W, y: Math.random() * H * 0.5,
    len: Math.random() * 120 + 60,
    speed: Math.random() * 6 + 4,
    angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
    life: 1, fade: Math.random() * 0.02 + 0.015,
  });
}
setInterval(spawnShooter, 2800);

function drawBg(ts) {
  bgCtx.clearRect(0, 0, W, H);

  // Deep space gradient
  const grad = bgCtx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.8);
  grad.addColorStop(0, "#040c20");
  grad.addColorStop(0.5, "#020812");
  grad.addColorStop(1, "#010408");
  bgCtx.fillStyle = grad;
  bgCtx.fillRect(0, 0, W, H);

  // Cursor-reactive nebula glow
  const cx = mouseX || W * 0.5, cy = mouseY || H * 0.5;
  const cg = bgCtx.createRadialGradient(cx, cy, 0, cx, cy, 380);
  cg.addColorStop(0, "rgba(0,212,255,0.06)");
  cg.addColorStop(1, "transparent");
  bgCtx.fillStyle = cg;
  bgCtx.fillRect(0, 0, W, H);

  // Nebulas
  nebulas.forEach(n => {
    const ng = bgCtx.createRadialGradient(n.x*W, n.y*H, 0, n.x*W, n.y*H, n.r*Math.max(W,H));
    ng.addColorStop(0, n.c);
    ng.addColorStop(1, "transparent");
    bgCtx.fillStyle = ng;
    bgCtx.fillRect(0, 0, W, H);
  });

  // Perspective grid
  bgCtx.save();
  bgCtx.globalAlpha = 0.06;
  bgCtx.strokeStyle = "#00d4ff";
  bgCtx.lineWidth = 0.5;
  const offX = (mouseX / W - 0.5) * 20;
  const offY = (mouseY / H - 0.5) * 12;
  for (let x = (offX % GRID) - GRID; x < W + GRID; x += GRID) {
    bgCtx.beginPath(); bgCtx.moveTo(x, 0); bgCtx.lineTo(x, H); bgCtx.stroke();
  }
  for (let y = (offY % GRID) - GRID; y < H + GRID; y += GRID) {
    bgCtx.beginPath(); bgCtx.moveTo(0, y); bgCtx.lineTo(W, y); bgCtx.stroke();
  }
  bgCtx.restore();

  // Stars
  const t = ts * 0.001;
  const pxOff = (mouseX / W - 0.5) * 30;
  const pyOff = (mouseY / H - 0.5) * 18;
  stars.forEach(s => {
    const ox = (s.depth - 0.5) * pxOff;
    const oy = (s.depth - 0.5) * pyOff;
    const pulse = 0.6 + Math.sin(t * 1.2 + s.phase) * 0.3;
    const alpha = Math.max(0.2, pulse * (0.35 + s.depth * 0.4));
    bgCtx.beginPath();
    bgCtx.arc(s.x + ox, s.y + oy, s.r + s.depth * 0.5, 0, Math.PI * 2);
    bgCtx.fillStyle = "rgba(255,255,255," + alpha + ")";
    bgCtx.fill();
    s.x += s.dx; s.y += s.dy;
    if (s.x < -10) s.x = W + 10;
    if (s.x > W + 10) s.x = -10;
    if (s.y < -10) s.y = H + 10;
    if (s.y > H + 10) s.y = -10;
  });

  // Shooting stars
  shooters = shooters.filter(s => s.life > 0);
  shooters.forEach(s => {
    const ex = s.x + Math.cos(s.angle) * s.len;
    const ey = s.y + Math.sin(s.angle) * s.len;
    const sg = bgCtx.createLinearGradient(s.x, s.y, ex, ey);
    sg.addColorStop(0, "rgba(0,212,255,0)");
    sg.addColorStop(1, "rgba(0,212,255," + s.life * 0.9 + ")");
    bgCtx.beginPath();
    bgCtx.moveTo(s.x, s.y); bgCtx.lineTo(ex, ey);
    bgCtx.strokeStyle = sg; bgCtx.lineWidth = 1.5;
    bgCtx.stroke();
    s.x += Math.cos(s.angle) * s.speed;
    s.y += Math.sin(s.angle) * s.speed;
    s.life -= s.fade;
  });

  requestAnimationFrame(drawBg);
}
requestAnimationFrame(drawBg);

// ===== CURSOR GLOW =====
const cursorGlow = document.getElementById("cursorGlow");
const cursorDot  = document.getElementById("cursorDot");
let glowX = W/2, glowY = H/2, dotX = W/2, dotY = H/2;
let rawX = W/2, rawY = H/2;

document.addEventListener("mousemove", e => {
  rawX = e.clientX; rawY = e.clientY;
  mouseX = e.clientX; mouseY = e.clientY;
  spawnSparkle(e.clientX, e.clientY);
});
document.addEventListener("mousedown", () => cursorDot.classList.add("clicking"));
document.addEventListener("mouseup",   () => cursorDot.classList.remove("clicking"));

function animateCursor() {
  glowX += (rawX - glowX) * 0.1;
  glowY += (rawY - glowY) * 0.1;
  dotX  += (rawX - dotX)  * 0.22;
  dotY  += (rawY - dotY)  * 0.22;
  cursorGlow.style.left = glowX + "px";
  cursorGlow.style.top  = glowY + "px";
  cursorDot.style.left  = dotX  + "px";
  cursorDot.style.top   = dotY  + "px";
  requestAnimationFrame(animateCursor);
}
animateCursor();

// ===== SPARKLE TRAIL =====
const sparkleCanvas = document.createElement("canvas");
sparkleCanvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9998";
document.body.appendChild(sparkleCanvas);
const sCtx = sparkleCanvas.getContext("2d");
sparkleCanvas.width  = window.innerWidth;
sparkleCanvas.height = window.innerHeight;
window.addEventListener("resize", () => {
  sparkleCanvas.width  = window.innerWidth;
  sparkleCanvas.height = window.innerHeight;
});

const SPARKLE_COLORS = ["#00d4ff","#7c3aed","#ff6bef","#fbbf24","#34d399","#60a5fa"];
let sparkles = [];

function spawnSparkle(x, y) {
  for (let i = 0; i < 3; i++) {
    sparkles.push({
      x: x + (Math.random()-0.5)*16, y: y + (Math.random()-0.5)*16,
      r: Math.random()*4+1.5,
      color: SPARKLE_COLORS[Math.floor(Math.random()*SPARKLE_COLORS.length)],
      life: 1, vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2-1,
    });
  }
}

function drawSparkles() {
  sCtx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);
  sparkles = sparkles.filter(s => s.life > 0);
  sparkles.forEach(s => {
    s.x += s.vx; s.y += s.vy; s.life -= 0.032; s.r *= 0.97;
    sCtx.save();
    sCtx.globalAlpha = s.life;
    sCtx.fillStyle = s.color;
    sCtx.shadowBlur = 8; sCtx.shadowColor = s.color;
    sCtx.beginPath();
    for (let p = 0; p < 5; p++) {
      const a = (p*4*Math.PI)/5 - Math.PI/2;
      const px = s.x + s.r*Math.cos(a), py = s.y + s.r*Math.sin(a);
      p===0 ? sCtx.moveTo(px,py) : sCtx.lineTo(px,py);
    }
    sCtx.closePath(); sCtx.fill();
    sCtx.restore();
  });
  requestAnimationFrame(drawSparkles);
}
drawSparkles();

// ===== CONFETTI =====
const confettiCanvas = document.getElementById("confettiCanvas");
const cCtx = confettiCanvas.getContext("2d");
confettiCanvas.width  = window.innerWidth;
confettiCanvas.height = window.innerHeight;
window.addEventListener("resize", () => {
  confettiCanvas.width  = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
});
let confetti = [], confettiActive = false;
function launchConfetti() {
  confetti = [];
  confettiActive = true;
  const colors = ["#00d4ff","#7c3aed","#ff6bef","#fbbf24","#34d399","#60a5fa","#fff"];
  for (let i = 0; i < 130; i++) {
    confetti.push({
      x: Math.random()*confettiCanvas.width, y: -10-Math.random()*200,
      w: Math.random()*10+4, h: Math.random()*6+3,
      color: colors[Math.floor(Math.random()*colors.length)],
      vy: Math.random()*4+2, vx: (Math.random()-0.5)*3,
      rot: Math.random()*360, rs: (Math.random()-0.5)*8, alpha: 1,
    });
  }
  animateConfetti();
}
function animateConfetti() {
  cCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
  let alive = false;
  confetti.forEach(p => {
    p.y+=p.vy; p.x+=p.vx; p.rot+=p.rs;
    if (p.y > confettiCanvas.height*0.8) p.alpha -= 0.02;
    if (p.alpha>0 && p.y<confettiCanvas.height) alive=true;
    cCtx.save();
    cCtx.globalAlpha = Math.max(0,p.alpha);
    cCtx.translate(p.x,p.y); cCtx.rotate(p.rot*Math.PI/180);
    cCtx.fillStyle = p.color;
    cCtx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
    cCtx.restore();
  });
  if (alive) requestAnimationFrame(animateConfetti);
  else { confettiActive=false; cCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height); }
}

// ===== NAVBAR SCROLL =====
const navbar  = document.getElementById("navbar");
const backTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 50);
  backTop.classList.toggle("visible", window.scrollY > 400);
  highlightNav();
});

// ===== HAMBURGER =====
const hamburger = document.getElementById("hamburger");
const navLinks  = document.getElementById("navLinks");
hamburger.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  hamburger.classList.toggle("active", open);
  document.body.style.overflow = open ? "hidden" : "";
});
navLinks.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    hamburger.classList.remove("active");
    document.body.style.overflow = "";
  });
});

// ===== ACTIVE NAV =====
const sections = document.querySelectorAll("section[id]");
function highlightNav() {
  const y = window.scrollY + 130;
  sections.forEach(sec => {
    const link = document.querySelector(".nav-links a[href='#" + sec.id + "']");
    if (!link) return;
    const active = y >= sec.offsetTop && y < sec.offsetTop + sec.offsetHeight;
    link.style.color = active ? "var(--cyan)" : "";
  });
}

// ===== SCROLL REVEAL =====
const revealEls = document.querySelectorAll(".reveal-up,.reveal-left,.reveal-right,.card-reveal");
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const delay = entry.target.classList.contains("card-reveal")
      ? Array.from(entry.target.parentElement.children).indexOf(entry.target) * 90
      : (parseFloat(getComputedStyle(entry.target).getPropertyValue("--rd")) || 0) * 1000;
    setTimeout(() => entry.target.classList.add("visible"), delay);
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.08 });
revealEls.forEach(el => revealObs.observe(el));

// ===== SKILL BARS =====
const skillFills = document.querySelectorAll(".skill-fill");
const skillObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    skillFills.forEach((fill, i) => {
      setTimeout(() => { fill.style.width = fill.dataset.width + "%"; }, i * 130);
    });
    skillObs.unobserve(entry.target);
  });
}, { threshold: 0.3 });
const skillsSec = document.getElementById("skills");
if (skillsSec) skillObs.observe(skillsSec);

// ===== SERVICE CARD 3D TILT =====
document.querySelectorAll(".service-card").forEach(card => {
  card.addEventListener("pointermove", e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top)  / r.height;
    card.style.transform = "perspective(800px) rotateX(" + ((py-0.5)*-10) + "deg) rotateY(" + ((px-0.5)*12) + "deg) translateY(-8px) scale(1.02)";
    card.style.setProperty("--mx", (px*100) + "%");
    card.style.setProperty("--my", (py*100) + "%");
  });
  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

// ===== TESTIMONIAL SLIDER =====
const cards = document.querySelectorAll(".testimonial-card");
const dots  = document.querySelectorAll(".dot");
let cur = 0, timer;
if (cards.length > 0) {
  function goTo(i) {
    cards[cur].classList.remove("active");
    if (dots[cur]) dots[cur].classList.remove("active");
    cur = i;
    cards[cur].classList.add("active");
    if (dots[cur]) dots[cur].classList.add("active");
  }
  function next() { goTo((cur+1) % cards.length); }
  function startTimer() { timer = setInterval(next, 4200); }
  function stopTimer()  { clearInterval(timer); }
  dots.forEach(d => d.addEventListener("click", () => { stopTimer(); goTo(+d.dataset.index); startTimer(); }));
  startTimer();
}

// ===== CONTACT FORM =====
const contactForm = document.getElementById("contactForm");
const formNote    = document.getElementById("formNote");
if (contactForm) contactForm.addEventListener("submit", e => {
  e.preventDefault();
  const btn = contactForm.querySelector("button[type=submit]");
  btn.disabled = true;
  btn.innerHTML = "<i class='fas fa-spinner fa-spin'></i> Sending...";
  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = "<i class='fas fa-paper-plane'></i> Send Message 💌";
    formNote.textContent = "🎉 Message sent! I'll get back to you within 24 hours.";
    formNote.style.color = "#10b981";
    contactForm.reset();
    launchConfetti();
    setTimeout(() => { formNote.textContent = ""; }, 6000);
  }, 1500);
});

// ===== BACK TO TOP =====
if (backTop) backTop.addEventListener("click", () => window.scrollTo({ top:0, behavior:"smooth" }));

// ===== SMOOTH SCROLL =====
document.querySelectorAll("a[href^='#']").forEach(a => {
  a.addEventListener("click", function(e) {
    const t = document.querySelector(this.getAttribute("href"));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior:"smooth", block:"start" }); }
  });
});

// ===== LOGO HEART BURST =====
const navLogo = document.querySelector(".nav-logo");
if (navLogo) navLogo.addEventListener("click", () => {
  ["💜","💖","✨","🌸","⭐","🚀"].forEach((h, i) => {
    const el = document.createElement("span");
    el.textContent = h;
    const dx = (Math.random()-0.5)*220, dy = (Math.random()-0.5)*220;
    el.style.cssText = "position:fixed;left:50%;top:50%;font-size:" + (Math.random()*18+14) + "px;pointer-events:none;z-index:99999;--dx:" + dx + "px;--dy:" + dy + "px;animation:heartBurst 1s ease forwards";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  });
}); // end navLogo click
const hbStyle = document.createElement("style");
hbStyle.textContent = "@keyframes heartBurst{0%{transform:translate(-50%,-50%) scale(0);opacity:1}60%{opacity:1}100%{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(1.2);opacity:0}}";
document.head.appendChild(hbStyle);

// ===== NUMBER COUNTER ANIMATION =====
const statNums = document.querySelectorAll(".stat-num[data-count]");
const statObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const el = entry.target;
    const target = +el.dataset.count;
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, 20);
    statObs.unobserve(el);
  });
}, { threshold: 0.5 });
statNums.forEach(n => statObs.observe(n));

// ===== SECTION HEADER ANIMATION =====
const sectionHeaders = document.querySelectorAll(".section-header");
const headerObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      headerObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
sectionHeaders.forEach(h => headerObs.observe(h));

// ===== TOOL BADGE STAGGER =====
const toolBadges = document.querySelectorAll(".tool-badge.card-reveal");
toolBadges.forEach((badge, i) => {
  badge.style.transitionDelay = (i * 60) + "ms";
});

// ===== FORM FIELD FOCUS ANIMATION =====
document.querySelectorAll(".form-group input, .form-group select, .form-group textarea").forEach(field => {
  field.addEventListener("focus", () => {
    const lbl = field.parentElement.querySelector("label");
    if (lbl) lbl.style.color = "var(--cyan)";
  });
  field.addEventListener("blur", () => {
    const lbl = field.parentElement.querySelector("label");
    if (lbl) lbl.style.color = "";
  });
});

// ===== FOOTER REVEAL =====
const footerEls = document.querySelectorAll(".footer-brand, .footer-links, .footer-social, .footer-bottom");
const footerObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      footerObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
footerEls.forEach(el => footerObs.observe(el));

// ===== SKILLS TAB SWITCHER =====
// ===== SKILLS TAB SWITCHER =====
const skillsTabs   = document.querySelectorAll(".skills-tab");
const skillsPanels = document.querySelectorAll(".skills-panel");

function activateSkillsPanel(panel) {
  if (!panel) return;

  // 1. Reset all animated elements to hidden state first
  panel.querySelectorAll(".reveal-up,.reveal-left,.reveal-right,.card-reveal")
    .forEach(el => el.classList.remove("visible"));
  panel.querySelectorAll(".skill-fill")
    .forEach(fill => { fill.style.transition = "none"; fill.style.width = "0"; });

  // 2. Show panel (triggers fadeUp on the panel itself)
  panel.classList.add("active");

  // 3. After one frame, re-enable transitions and animate everything in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {

      // Reveal-up / reveal-left / reveal-right — staggered
      panel.querySelectorAll(".reveal-up,.reveal-left,.reveal-right")
        .forEach((el, i) => {
          setTimeout(() => el.classList.add("visible"), i * 80 + 50);
        });

      // card-reveal — staggered with their --rd delay respected
      panel.querySelectorAll(".card-reveal")
        .forEach((el, i) => {
          const rd = parseFloat(el.style.getPropertyValue("--rd")) || 0;
          setTimeout(() => el.classList.add("visible"), rd + i * 70 + 100);
        });

      // Skill bars — staggered fill animation
      panel.querySelectorAll(".skill-fill")
        .forEach((fill, i) => {
          setTimeout(() => {
            fill.style.transition = "width 1.4s cubic-bezier(0.34,1.2,0.64,1)";
            fill.style.width = (fill.dataset.width || "0") + "%";
          }, i * 120 + 150);
        });

    });
  });
}

skillsTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;

    // Deactivate all tabs and panels
    skillsTabs.forEach(t => t.classList.remove("active"));
    skillsPanels.forEach(p => {
      p.classList.remove("active");
      // Reset children so they can re-animate next time
      p.querySelectorAll(".reveal-up,.reveal-left,.reveal-right,.card-reveal")
        .forEach(el => el.classList.remove("visible"));
    });

    // Activate clicked tab
    tab.classList.add("active");

    // Activate and animate the target panel
    const panel = document.getElementById("tab-" + target);
    activateSkillsPanel(panel);
  });
});

// On page load: animate the default active panel (VA tab)
(function() {
  const activePanel = document.querySelector(".skills-panel.active");
  if (activePanel) activateSkillsPanel(activePanel);
})();

// ===== DEV CARD 3D TILT =====
document.querySelectorAll(".dev-card").forEach(card => {
  card.addEventListener("pointermove", e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top)  / r.height;
    card.style.transform = "perspective(800px) rotateX(" + ((py-0.5)*-8) + "deg) rotateY(" + ((px-0.5)*10) + "deg) translateY(-8px) scale(1.02)";
  });
  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

// ===== DEV SERVICE CARD TILT =====
document.querySelectorAll(".dev-service-card").forEach(card => {
  card.addEventListener("pointermove", e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top)  / r.height;
    card.style.transform = "perspective(600px) rotateX(" + ((py-0.5)*-6) + "deg) rotateY(" + ((px-0.5)*8) + "deg) translateY(-6px) scale(1.03)";
  });
  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});
