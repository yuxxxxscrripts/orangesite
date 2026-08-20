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

// ---------- LIVE USER COUNTER (FIXED - No Blinking) ----------
let currentCount = 0;
let isUpdating = false;
let lastSuccessfulUpdate = 0;
const UPDATE_INTERVAL = 15000; // 15 seconds
const TIMEOUT_MS = 5000; // 5 second timeout

async function updateLiveUsers() {
    // Prevent multiple simultaneous updates
    if (isUpdating) return;
    isUpdating = true;
    
    try {
        // Create an AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
        
        // Your Vercel API URL - CHANGE THIS!
        const response = await fetch('https://orangesite.vercel.app/api/users', {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.count !== undefined && data.count !== null) {
            const newCount = parseInt(data.count);
            
            // Only update if the count actually changed
            if (newCount !== currentCount) {
                currentCount = newCount;
                lastSuccessfulUpdate = Date.now();
                
                const el = document.getElementById('liveUsers');
                if (el) {
                    // Only animate if we have a valid count
                    if (newCount >= 0) {
                        animateCount(el, newCount, 800);
                    }
                }
            }
        }
    } catch (error) {
        // Only log if it's not an abort error
        if (error.name !== 'AbortError') {
            console.log('Counter temporarily unavailable');
        }
        
        // Check if we have a stale count and it's been too long
        if (Date.now() - lastSuccessfulUpdate > UPDATE_INTERVAL * 3) {
            // If we haven't had a successful update in a while, show 0 as fallback
            const el = document.getElementById('liveUsers');
            if (el && currentCount > 0) {
                // Don't reset to 0, keep showing the last known count
                // This prevents blinking
            }
        }
    } finally {
        isUpdating = false;
    }
}

// Initial load with a small delay to let page render
setTimeout(() => {
    updateLiveUsers();
}, 500);

// Update every 15 seconds
setInterval(updateLiveUsers, UPDATE_INTERVAL);

// Also update when tab becomes visible again (user returns to page)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Immediately update when user comes back to tab
        updateLiveUsers();
    }
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
    // Add loading state
    downloadBtn.classList.add('loading');
    
    // Remove loading after a moment (download will proceed via href)
    setTimeout(() => {
      downloadBtn.classList.remove('loading');
    }, 1200);
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

// ---------- FIXED FAQ: toggle + smooth animation ----------
document.querySelectorAll('.faq-summary').forEach((btn) => {
  btn.addEventListener('click', function(e) {
    const item = this.closest('.faq-item');
    if (!item) return;
    const content = item.querySelector('.faq-content');
    const isOpen = item.classList.contains('open');

    // close all others
    document.querySelectorAll('.faq-item').forEach((other) => {
      if (other !== item) {
        other.classList.remove('open');
        const otherContent = other.querySelector('.faq-content');
        if (otherContent) otherContent.style.height = '0px';
      }
    });

    if (isOpen) {
      // close this one
      item.classList.remove('open');
      if (content) content.style.height = '0px';
    } else {
      // open this one
      item.classList.add('open');
      if (content) {
        const inner = content.querySelector('.faq-content-inner');
        if (inner) {
          content.style.height = inner.scrollHeight + 'px';
        }
      }
    }
  });
});

// init open state for .faq-item.open
document.querySelectorAll('.faq-item.open').forEach((item) => {
  const content = item.querySelector('.faq-content');
  if (content) {
    const inner = content.querySelector('.faq-content-inner');
    if (inner) {
      requestAnimationFrame(() => {
        content.style.height = inner.scrollHeight + 'px';
      });
    }
  }
});
