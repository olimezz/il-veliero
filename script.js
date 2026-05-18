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
// Adaptive-lerp + fastSeek for smooth scrubbing in both directions
// ============================
const shipVideo   = document.getElementById('shipAnim');
const heroSection = document.getElementById('home');
const heroText    = document.getElementById('heroText');

if (shipVideo && heroSection) {
    let duration        = 0;
    let rafId           = null;
    let targetProgress  = 0;
    let currentProgress = 0;

    // Traccia velocità di scroll per adattare il lerp dinamicamente
    let lastTarget      = 0;
    let scrollVelocity  = 0;

    // fastSeek() è più veloce di currentTime per seek rapidi (supportato su Firefox/Safari)
    const seekTo = (t) => {
        if (typeof shipVideo.fastSeek === 'function') {
            shipVideo.fastSeek(t);
        } else {
            shipVideo.currentTime = t;
        }
    };

    // ---- Calcola il progresso target dallo scroll corrente ----
    const getTargetProgress = () => {
        const rect      = heroSection.getBoundingClientRect();
        const heroH     = heroSection.offsetHeight;
        const vpH       = window.innerHeight;
        const scrolled  = -rect.top;
        const maxScroll = Math.max(1, heroH - vpH);
        return Math.max(0, Math.min(1, scrolled / maxScroll));
    };

    // ---- Loop RAF: lerp adattivo basato su velocità e direzione ----
    const animate = () => {
        const diff = targetProgress - currentProgress;

        // Snap finale: chiudi la differenza residua
        if (Math.abs(diff) < 0.0002) {
            currentProgress = targetProgress;
            if (duration) shipVideo.currentTime = currentProgress * duration;
            rafId = null;
            return;
        }

        // Velocità di scroll (quanto sta cambiando il target per frame)
        // Più è alta, più il lerp deve essere aggressivo per stare al passo
        const absVel = Math.abs(scrollVelocity);

        let lerp;
        if (diff > 0) {
            // Avanzare: lerp base + boost proporzionale alla velocità
            lerp = 0.12 + Math.min(absVel * 4, 0.25);
        } else {
            // Reverse: lerp più alto di base + boost ancora maggiore
            // In reverse il decoder è più lento → serve stare più vicino al target
            lerp = 0.22 + Math.min(absVel * 6, 0.40);
        }

        currentProgress += diff * Math.min(lerp, 0.85);

        if (duration) {
            const t = Math.max(0, Math.min(duration, currentProgress * duration));
            seekTo(t);
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
        const newTarget = getTargetProgress();
        // Velocità = variazione del target per chiamata (scroll event throttled ~60fps)
        // Smoothing esponenziale per evitare spike improvvisi
        const rawVel = Math.abs(newTarget - lastTarget);
        scrollVelocity = scrollVelocity * 0.6 + rawVel * 0.4;
        lastTarget     = newTarget;
        targetProgress = newTarget;
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
