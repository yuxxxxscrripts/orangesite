function animateCount(el, target, duration = 2000) {
  if (target === 0) {
    el.textContent = "0";
    return;
  }

  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString();
  }
  requestAnimationFrame(tick);
}

async function updateLiveUsers() {
  try {
    const response = await fetch('https://orangesite.vercel.app/api/users');
    const data = await response.json();

    if (data && data.count !== undefined) {
      const el = document.getElementById('liveUsers');
      if (el) {
        animateCount(el, data.count, 1000);
      }
    }
  } catch (error) {
    console.log('Counter unavailable');
  }
}

setInterval(updateLiveUsers, 15000);
updateLiveUsers();

const downloadBtn = document.getElementById("download-btn");
if (downloadBtn) {
  downloadBtn.addEventListener("click", (e) => {
    e.preventDefault();

    downloadBtn.classList.add('loading');

    setTimeout(() => {
      downloadBtn.classList.remove('loading');
      downloadBtn.textContent = "Downloaded ✓";
      downloadBtn.style.background = "#28c840";
      downloadBtn.style.boxShadow = "0 4px 20px rgba(40, 200, 64, 0.3)";

      setTimeout(() => {
        downloadBtn.textContent = "Download for Windows";
        downloadBtn.style.background = "";
        downloadBtn.style.boxShadow = "";
      }, 3000);
    }, 1800);
  });
}

const cursorGlow = document.getElementById("cursor-glow");
if (cursorGlow) {
  window.addEventListener("mousemove", (e) => {
    cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });
}

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

const nav = document.querySelector(".nav");
window.addEventListener("scroll", () => {
  if (window.scrollY > 10) {
    nav.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
  } else {
    nav.style.boxShadow = "";
  }
});

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

const revealTargets = document.querySelectorAll(
  ".feature-card, .faq-item, .download-card, .section-head"
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

document.querySelectorAll(".faq-item").forEach((item) => {
  const summary = item.querySelector(".faq-summary");
  const content = item.querySelector(".faq-content");
  const inner = item.querySelector(".faq-content-inner");

  if (item.classList.contains("open")) {
    content.style.height = inner.offsetHeight + "px";
  }

  summary.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");

    if (isOpen) {
      content.style.height = inner.offsetHeight + "px";
      requestAnimationFrame(() => {
        content.style.height = "0px";
      });
      item.classList.remove("open");
    } else {
      content.style.height = inner.offsetHeight + "px";
      item.classList.add("open");
    }
  });

  content.addEventListener("transitionend", () => {
    if (item.classList.contains("open")) {
      content.style.height = "auto";
    }
  });
});

window.addEventListener("resize", () => {
  document.querySelectorAll(".faq-item.open").forEach((item) => {
    const content = item.querySelector(".faq-content");
    const inner = item.querySelector(".faq-content-inner");
    content.style.height = inner.offsetHeight + "px";
  });
});

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
