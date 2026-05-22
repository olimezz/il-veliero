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
// HERO VIDEO — One-time Autoplay
// ============================
const shipVideo   = document.getElementById('shipAnim');
const heroSection = document.getElementById('home');
const heroText    = document.getElementById('heroText');

if (shipVideo && heroSection) {
    // ====================================================
    // MODALITÀ UNICA: autoplay una volta sola, poi si ferma
    // Nessuno scroll-scrub, nessun loop
    // ====================================================
    shipVideo.muted       = true;
    shipVideo.playsInline = true;
    shipVideo.loop        = false; // Non va in loop, si ferma alla fine
    shipVideo.autoplay    = true;
    
    // Attributi per forzare i browser (soprattutto mobile) ad accettare l'autoplay muto
    shipVideo.setAttribute('muted', '');
    shipVideo.setAttribute('playsinline', '');
    shipVideo.setAttribute('autoplay', '');
    shipVideo.removeAttribute('loop');
    shipVideo.removeAttribute('preload');

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
            // Fallback: se bloccato dal browser aspetta interazione utente (click/scroll/touch)
            const unlock = () => {
                shipVideo.play().catch(() => {});
                document.removeEventListener('touchstart', unlock);
                document.removeEventListener('click', unlock);
                document.removeEventListener('scroll', unlock);
            };
            document.addEventListener('touchstart', unlock, { passive: true });
            document.addEventListener('click', unlock, { passive: true });
            document.addEventListener('scroll', unlock, { passive: true });
        });
    };

    if (shipVideo.readyState >= 2) {
        tryPlay();
    } else {
        shipVideo.addEventListener('canplay', tryPlay, { once: true });
        // Forza il caricamento
        shipVideo.load();
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
