// ---------- animated hero stats (Better easing) ----------
function animateCount(el, target, duration = 2000) {
  // If target is 0, just set it to 0 immediately (no animation needed)
  if (target === 0) {
    el.textContent = "0";
    return;
  }

  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    // Cubic easing out
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString();
  }
  requestAnimationFrame(tick);
}

// Use data-target attributes from HTML (now set to 0)
document.querySelectorAll(".stat-num").forEach((el) => {
  const target = parseInt(el.getAttribute('data-target'), 10);
  animateCount(el, target);
});

// ---------- update feed ----------
const logEntries = [
  { tag: "patch", label: "PATCH", text: "Compatibility patch shipped for today's Roblox client update." },
  { tag: "new", label: "NEW", text: "Added built-in script hub search and favorites." },
  { tag: "fix", label: "FIX", text: "Fixed console freezing on long-running scripts." },
  { tag: "patch", label: "PATCH", text: "Bytecode signature updated to match latest Roblox build." },
  { tag: "new", label: "NEW", text: "Dark UI theme refresh and smaller memory footprint." },
  { tag: "fix", label: "FIX", text: "Resolved injection failing on some Windows 11 builds." },
];

function relativeTime(minutesAgo) {
  if (minutesAgo < 60) return `${minutesAgo}m ago`;
  const hours = Math.floor(minutesAgo / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function renderLog() {
  const body = document.getElementById("terminal-body");
  if (!body) return;
  body.innerHTML = "";
  let minutesAgo = 6;
  logEntries.forEach((entry, i) => {
    const line = document.createElement("div");
    line.className = "log-line";
    line.style.animationDelay = `${i * 0.08}s`;
    line.innerHTML =
      `<span class="log-time">${relativeTime(minutesAgo)}</span>` +
      `<span class="log-tag tag-${entry.tag}">${entry.label}</span>` +
      `<span class="log-text">${entry.text}</span>`;
    body.appendChild(line);
    minutesAgo += Math.floor(Math.random() * 180) + 40;
  });
}
renderLog();

// occasionally prepend a fresh "just now" style entry to feel alive
const liveExtras = [
  { tag: "patch", label: "PATCH", text: "Anti-detection routine refreshed." },
  { tag: "fix", label: "FIX", text: "Minor UI scaling fix on 4K displays." },
];
let liveIndex = 0;
setInterval(() => {
  const body = document.getElementById("terminal-body");
  if (!body) return;
  const entry = liveExtras[liveIndex % liveExtras.length];
  liveIndex++;
  const line = document.createElement("div");
  line.className = "log-line";
  line.innerHTML =
    `<span class="log-time">just now</span>` +
    `<span class="log-tag tag-${entry.tag}">${entry.label}</span>` +
    `<span class="log-text">${entry.text}</span>`;
  body.prepend(line);
}, 45000);

// ---------- download button (Proper Loading & Success Animation) ----------
const downloadBtn = document.getElementById("download-btn");
if (downloadBtn) {
  downloadBtn.addEventListener("click", (e) => {
    e.preventDefault();
    
    // Add loading state
    downloadBtn.classList.add('loading');
    
    // Simulate network request
    setTimeout(() => {
      downloadBtn.classList.remove('loading');
      downloadBtn.textContent = "Downloaded ✓";
      downloadBtn.style.background = "#28c840"; // Green success color
      downloadBtn.style.boxShadow = "0 4px 20px rgba(40, 200, 64, 0.3)";
      
      // Reset after 3 seconds
      setTimeout(() => {
        downloadBtn.textContent = "Download for Windows";
        downloadBtn.style.background = "";
        downloadBtn.style.boxShadow = "";
      }, 3000);
      
      // Alert (You can replace this with actual link logic)
      // alert("Hook this button up to your actual file host / CDN link.");
    }, 1800); // 1.8 second delay
  });
}

// ---------- cursor glow ----------
const cursorGlow = document.getElementById("cursor-glow");
if (cursorGlow) {
  window.addEventListener("mousemove", (e) => {
    cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });
}

// ---------- magnetic buttons (Smoother) ----------
document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
  });
});

// ---------- nav scroll shadow ----------
const nav = document.querySelector(".nav");
window.addEventListener("scroll", () => {
  if (window.scrollY > 10) {
    nav.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
  } else {
    nav.style.boxShadow = "";
  }
});

// ---------- hero mark tilt on mouse (More Subtle) ----------
const heroArt = document.querySelector(".hero-art");
const heroImg = document.getElementById("hero-img");
if (heroArt && heroImg) {
  heroArt.addEventListener("mousemove", (e) => {
    const rect = heroArt.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    heroImg.style.transform = `rotateY(${x * 15}deg) rotateX(${-y * 15}deg) scale(1.02)`;
  });
  heroArt.addEventListener("mouseleave", () => {
    heroImg.style.transform = "";
  });
}

// ---------- scroll reveal ----------
const revealTargets = document.querySelectorAll(
  ".feature-card, .faq-item, .download-card, .terminal, .section-head"
);
revealTargets.forEach((el) => el.classList.add("reveal"));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);
revealTargets.forEach((el) => revealObserver.observe(el));

// ---------- feature card cursor 3D tilt ----------
document.querySelectorAll(".feature-card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});