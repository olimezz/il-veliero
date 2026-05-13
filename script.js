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

    const doScrub = () => {
        rafPending = false;

        const heroH     = heroSection.offsetHeight;  // 200vh
        const vpH       = window.innerHeight;         // 100vh
        const maxScroll = Math.max(1, heroH - vpH);  // range: 100vh
        const progress  = Math.max(0, Math.min(1, window.scrollY / maxScroll));

        // --- scrub video ---
        if (shipVideo.duration) {
            shipVideo.currentTime = progress * shipVideo.duration;
        }

        // --- text reveal: compare nella seconda metà dell'animazione ---
        if (heroText) {
            // 0 fino a progress 0.5, poi sale a 1 entro progress 1.0
            const t = Math.max(0, Math.min(1, (progress - 0.5) / 0.5));
            heroText.style.opacity   = t;
            heroText.style.transform = `translateY(${(1 - t) * 40}px)`;
        }
    };

    const scrub = () => {
        if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(doScrub);
        }
    };

    shipVideo.addEventListener('loadedmetadata', () => {
        shipVideo.pause();
        scrub();
    });

    window.addEventListener('scroll', scrub, { passive: true });
    scrub(); // stato iniziale: progress = 0, testo invisibile
}
