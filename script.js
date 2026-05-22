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
// HERO VIDEO — Desktop scroll-scrub / Mobile autoplay loop
// ============================
const shipVideo   = document.getElementById('shipAnim');
const heroSection = document.getElementById('home');
const heroText    = document.getElementById('heroText');

if (shipVideo && heroSection) {

    // ---- Rileva mobile solo da larghezza schermo ----
    // NON usare (pointer: coarse) perché cattura anche desktop touchscreen
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (isMobile) {
        // ====================================================
        // MODALITÀ MOBILE: autoplay loop, nessun seeking
        // Il video gira come sfondo animato senza jank
        // ====================================================
        shipVideo.muted       = true;
        shipVideo.playsInline = true;
        shipVideo.loop        = true;
        shipVideo.autoplay    = true;
        shipVideo.setAttribute('muted', '');
        shipVideo.setAttribute('playsinline', '');
        shipVideo.setAttribute('loop', '');
        shipVideo.setAttribute('autoplay', '');
        shipVideo.removeAttribute('preload');
        shipVideo.style.willChange = 'auto';

        // Mostra subito il testo hero
        if (heroText) {
            heroText.style.transition = 'opacity 1.2s ease, transform 1.2s ease';
            setTimeout(() => {
                heroText.style.opacity   = '1';
                heroText.style.transform = 'translateY(0)';
            }, 300);
        }

        // Avvia la riproduzione
        const tryPlay = () => {
            shipVideo.play().catch(() => {
                // Fallback: aspetta prima interazione utente
                const unlock = () => {
                    shipVideo.play().catch(() => {});
                    document.removeEventListener('touchstart', unlock);
                    document.removeEventListener('click', unlock);
                };
                document.addEventListener('touchstart', unlock, { passive: true });
                document.addEventListener('click', unlock, { passive: true });
            });
        };

        if (shipVideo.readyState >= 2) {
            tryPlay();
        } else {
            shipVideo.addEventListener('canplay', tryPlay, { once: true });
            // Forza il caricamento nel caso load non sia partito
            shipVideo.load();
        }

    } else {
        // ====================================================
        // MODALITÀ DESKTOP: scroll-scrub adattivo con lerp
        // (comportamento originale invariato)
        // ====================================================
        let duration        = 0;
        let rafId           = null;
        let targetProgress  = 0;
        let currentProgress = 0;
        let lastTarget      = 0;
        let scrollVelocity  = 0;

        const seekTo = (t) => {
            if (typeof shipVideo.fastSeek === 'function') {
                shipVideo.fastSeek(t);
            } else {
                shipVideo.currentTime = t;
            }
        };

        const getTargetProgress = () => {
            const rect      = heroSection.getBoundingClientRect();
            const heroH     = heroSection.offsetHeight;
            const vpH       = window.innerHeight;
            const scrolled  = -rect.top;
            const maxScroll = Math.max(1, heroH - vpH);
            return Math.max(0, Math.min(1, scrolled / maxScroll));
        };

        const animate = () => {
            const diff = targetProgress - currentProgress;

            if (Math.abs(diff) < 0.0002) {
                currentProgress = targetProgress;
                if (duration) shipVideo.currentTime = currentProgress * duration;
                rafId = null;
                return;
            }

            const absVel = Math.abs(scrollVelocity);
            let lerp;
            if (diff > 0) {
                lerp = 0.12 + Math.min(absVel * 4, 0.25);
            } else {
                lerp = 0.22 + Math.min(absVel * 6, 0.40);
            }

            currentProgress += diff * Math.min(lerp, 0.85);

            if (duration) {
                const t = Math.max(0, Math.min(duration, currentProgress * duration));
                seekTo(t);
            }

            if (heroText) {
                const fadeT = Math.max(0, Math.min(1, (currentProgress - 0.4) / 0.4));
                heroText.style.opacity   = fadeT;
                heroText.style.transform = `translateY(${(1 - fadeT) * 30}px)`;
            }

            rafId = requestAnimationFrame(animate);
        };

        const startLoop = () => {
            const newTarget = getTargetProgress();
            const rawVel = Math.abs(newTarget - lastTarget);
            scrollVelocity = scrollVelocity * 0.6 + rawVel * 0.4;
            lastTarget     = newTarget;
            targetProgress = newTarget;
            if (!rafId) rafId = requestAnimationFrame(animate);
        };

        const init = () => {
            if (duration) return;
            duration = shipVideo.duration;
            shipVideo.currentTime = 0;
            startLoop();
        };

        shipVideo.addEventListener('loadedmetadata', init);
        shipVideo.addEventListener('canplay',        init);
        if (shipVideo.readyState >= 1 && shipVideo.duration) init();

        window.addEventListener('scroll', startLoop, { passive: true });
        window.addEventListener('resize', startLoop, { passive: true });

        // Sblocca seeking su browser che richiedono interazione utente
        window.addEventListener('touchstart', () => {
            shipVideo.play().then(() => {
                shipVideo.pause();
                startLoop();
            }).catch(() => {});
        }, { once: true, passive: true });
    }
}

// ============================
// COOKIE CONSENT
// ============================
(function () {
    const STORAGE_KEY = 'ilveliero_cookie_prefs';

    const banner  = document.getElementById('cookieBanner');
    const modal   = document.getElementById('cookieModal');
    const togAnalytics = document.getElementById('cookieAnalytics');
    const togMarketing = document.getElementById('cookieMarketing');

    function getPrefs() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
    }

    function savePrefs(prefs) {
        prefs.savedAt = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    }

    function applyPrefs(_prefs) {
        // Punto di estensione: caricare script analitici/marketing quando accettati
        // if (_prefs.analytics) { /* load GA */ }
        // if (_prefs.marketing) { /* load pixel */ }
    }

    function showBanner() {
        // Piccolo ritardo per non bloccare il primo render
        setTimeout(() => banner && banner.classList.add('visible'), 900);
    }

    function hideBanner() {
        banner && banner.classList.remove('visible');
    }

    function openModal() {
        const prefs = getPrefs();
        if (togAnalytics) togAnalytics.checked = prefs ? !!prefs.analytics : false;
        if (togMarketing) togMarketing.checked = prefs ? !!prefs.marketing : false;
        if (modal) modal.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (modal) modal.classList.remove('visible');
        document.body.style.overflow = '';
    }

    function acceptAll() {
        const prefs = { necessary: true, analytics: true, marketing: true };
        savePrefs(prefs);
        applyPrefs(prefs);
        hideBanner();
        closeModal();
    }

    function rejectOptional() {
        const prefs = { necessary: true, analytics: false, marketing: false };
        savePrefs(prefs);
        applyPrefs(prefs);
        hideBanner();
        closeModal();
    }

    function saveCustom() {
        const prefs = {
            necessary: true,
            analytics: togAnalytics ? togAnalytics.checked : false,
            marketing: togMarketing ? togMarketing.checked : false,
        };
        savePrefs(prefs);
        applyPrefs(prefs);
        hideBanner();
        closeModal();
    }
    // Init
    const existing = getPrefs();
    if (!existing) {
        showBanner();
    } else {
        applyPrefs(existing);
    }

    // Banner
    document.getElementById('cookieBtnAccept')?.addEventListener('click', acceptAll);
    document.getElementById('cookieBtnReject')?.addEventListener('click', rejectOptional);
    document.getElementById('cookieBtnManage')?.addEventListener('click', openModal);

    // Modal
    document.getElementById('cookieModalClose')?.addEventListener('click', closeModal);
    document.getElementById('cookieModalReject')?.addEventListener('click', rejectOptional);
    document.getElementById('cookieModalSave')?.addEventListener('click', saveCustom);

    // Chiudi cliccando fuori dal modale
    modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // Bottone nel footer
    document.getElementById('cookieSettingsBtn')?.addEventListener('click', openModal);
}());
