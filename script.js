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
// ============================
const shipVideo   = document.getElementById('shipAnim');
const heroSection = document.getElementById('home');
const heroText    = document.getElementById('heroText');

if (shipVideo && heroSection) {
    let rafPending = false;
    let videoReady = false;

    // Impostiamo una velocità quasi zero: il video è "in riproduzione" (nessun overlay del browser)
    // ma di fatto è fermo. Poi scrubbiamo manualmente il currentTime.
    const initVideo = () => {
        if (videoReady) return;
        shipVideo.playbackRate = 0.00001; // quasi fermo ma mai "paused"
        shipVideo.play().then(() => {
            videoReady = true;
            scrub();
        }).catch(() => {
            // Su alcuni browser l'autoplay può essere bloccato fino all'interazione dell'utente
        });
    };

    const doScrub = () => {
        rafPending = false;

        const rect      = heroSection.getBoundingClientRect();
        const heroH     = heroSection.offsetHeight;
        const vpH       = window.innerHeight;

        const scrollDistance = -rect.top;
        const maxScroll      = Math.max(1, heroH - vpH);
        const progress       = Math.max(0, Math.min(1, scrollDistance / maxScroll));

        if (videoReady && shipVideo.duration && !isNaN(shipVideo.duration)) {
            const targetTime = progress * shipVideo.duration;
            if (Math.abs(shipVideo.currentTime - targetTime) > 0.04) {
                shipVideo.currentTime = targetTime;
            }
        }

        if (heroText) {
            const t = Math.max(0, Math.min(1, (progress - 0.4) / 0.4));
            heroText.style.opacity   = t;
            heroText.style.transform = `translateY(${(1 - t) * 30}px)`;
        }
    };

    const scrub = () => {
        if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(doScrub);
        }
    };

    shipVideo.addEventListener('loadedmetadata', initVideo);
    shipVideo.addEventListener('canplay', initVideo);

    // Fallback: prova ad inizializzare dopo 500ms
    setTimeout(initVideo, 500);

    // Su mobile sblocca al primo tocco
    window.addEventListener('touchstart', initVideo, { once: true, passive: true });

    window.addEventListener('scroll', scrub, { passive: true });
    window.addEventListener('resize', scrub, { passive: true });

    scrub();
}
