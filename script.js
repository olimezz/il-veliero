// ============================
// HEADER SCROLL
// ============================
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ============================
// SMOOTH SCROLL
// ============================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const mobileNav = document.getElementById('mobileNav');
        if (mobileNav) mobileNav.classList.remove('open');
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    });
});

// ============================
// MOBILE MENU
// ============================
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileNav = document.getElementById('mobileNav');

if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileNav.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
        if (!header.contains(e.target)) {
            mobileNav.classList.remove('open');
        }
    });
}

// ============================
// REVEAL ON SCROLL
// ============================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ============================
// STAT COUNTER ANIMATION
// ============================
const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const duration = 1800;
        const stepMs = 16;
        const increment = target / (duration / stepMs);
        let current = 0;

        const timer = setInterval(() => {
            current = Math.min(current + increment, target);
            el.textContent = Math.floor(current);
            if (current >= target) {
                el.textContent = target;
                clearInterval(timer);
            }
        }, stepMs);

        countObserver.unobserve(el);
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => countObserver.observe(el));



// ============================
// HERO VIDEO SCROLL SCRUB + TEXT REVEAL
// Lerp-based smooth scrubbing in both scroll directions
// ============================
const shipVideo   = document.getElementById('shipAnim');
const heroSection = document.getElementById('home');
const heroText    = document.getElementById('heroText');

if (shipVideo && heroSection) {
    let duration        = 0;
    let rafId           = null;
    let targetProgress  = 0;   // dove lo scroll VUOLE che siamo
    let currentProgress = 0;   // dove il video SI TROVA effettivamente

    // Fattore di lerp: 0.1 = fluido e morbido, 0.2 = più reattivo
    const LERP = 0.10;

    // ---- Calcola il progresso target dallo scroll corrente ----
    const getTargetProgress = () => {
        const rect     = heroSection.getBoundingClientRect();
        const heroH    = heroSection.offsetHeight;
        const vpH      = window.innerHeight;
        const scrolled = -rect.top;
        const maxScroll = Math.max(1, heroH - vpH);
        return Math.max(0, Math.min(1, scrolled / maxScroll));
    };

    // ---- Loop RAF: interpola e aggiorna il video ----
    const animate = () => {
        const diff = targetProgress - currentProgress;

        // Ferma il loop quando la differenza è trascurabile
        if (Math.abs(diff) < 0.0003) {
            currentProgress = targetProgress;
            rafId = null;
            return;
        }

        // Lerp: sposta currentProgress verso targetProgress
        currentProgress += diff * LERP;

        if (duration) {
            const t = currentProgress * duration;
            // Imposta currentTime solo se il delta è visibile (≥ 1 frame a 30fps)
            if (Math.abs(shipVideo.currentTime - t) > 0.016) {
                shipVideo.currentTime = t;
            }
        }

        // Reveal del testo hero
        if (heroText) {
            const fadeT = Math.max(0, Math.min(1, (currentProgress - 0.4) / 0.4));
            heroText.style.opacity   = fadeT;
            heroText.style.transform = `translateY(${(1 - fadeT) * 30}px)`;
        }

        rafId = requestAnimationFrame(animate);
    };

    // ---- Kick-off del loop ----
    const startLoop = () => {
        targetProgress = getTargetProgress();
        if (!rafId) rafId = requestAnimationFrame(animate);
    };

    // ---- Init: quando i metadati del video sono disponibili ----
    const init = () => {
        if (duration) return; // già inizializzato
        duration = shipVideo.duration;
        shipVideo.currentTime = 0;
        startLoop();
    };

    shipVideo.addEventListener('loadedmetadata', init);
    shipVideo.addEventListener('canplay',        init);

    // Fallback: video già in cache
    if (shipVideo.readyState >= 1 && shipVideo.duration) init();

    window.addEventListener('scroll', startLoop, { passive: true });
    window.addEventListener('resize', startLoop, { passive: true });

    // --- Mobile: sblocca il seeking al primo tocco ----
    window.addEventListener('touchstart', () => {
        shipVideo.play().then(() => {
            shipVideo.pause();
            startLoop();
        }).catch(() => {});
    }, { once: true, passive: true });
}
