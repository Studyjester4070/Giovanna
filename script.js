// ===== WhatsApp Phone Formatting =====
function formatWhatsApp(input) {
    // Remove all non-digit characters
    let value = input.value.replace(/\D/g, '');

    // Limit to 11 digits (Brazilian phone with DDD)
    if (value.length > 11) {
        value = value.substring(0, 11);
    }

    // Format as (XX) XXXXX-XXXX
    let formatted = '';
    if (value.length > 0) {
        formatted = '(' + value.substring(0, 2);
    }
    if (value.length >= 2) {
        formatted = '(' + value.substring(0, 2) + ')';
    }
    if (value.length > 2) {
        formatted = '(' + value.substring(0, 2) + ') ' + value.substring(2, 7);
    }
    if (value.length > 7) {
        formatted = '(' + value.substring(0, 2) + ') ' + value.substring(2, 7) + '-' + value.substring(7, 11);
    }

    input.value = formatted;
}

// Initialize WhatsApp formatting when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    var whatsappInput = document.getElementById('whatsapp');
    if (whatsappInput) {
        // Format on input
        whatsappInput.addEventListener('input', function () {
            formatWhatsApp(this);
        });

        // Block non-numeric keys (except navigation keys)
        whatsappInput.addEventListener('keypress', function (e) {
            var char = String.fromCharCode(e.which || e.keyCode);
            if (!/[0-9]/.test(char)) {
                e.preventDefault();
                return false;
            }
        });

        // Handle paste - remove non-numeric characters
        whatsappInput.addEventListener('paste', function (e) {
            e.preventDefault();
            var pastedText = (e.clipboardData || window.clipboardData).getData('text');
            var numericOnly = pastedText.replace(/\D/g, '').substring(0, 11);
            this.value = numericOnly;
            formatWhatsApp(this);
        });
    }
});


// ===== Counter Animation for Stats =====
function animateCounter(counter) {
    const target = parseInt(counter.getAttribute('data-count') || '0', 10);
    const duration = 2000;
    const start = performance.now();

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(target * ease);

        counter.textContent = current.toLocaleString('pt-BR');

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            counter.textContent = target.toLocaleString('pt-BR');
        }
    }

    requestAnimationFrame(update);
}

// Observer for stats animation
var statsObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            animateCounter(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '50px' });

// Initialize stats observer when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    var statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(function (el) {
        statsObserver.observe(el);
    });
});


// ===== Smooth Scroll for Navigation =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Intersection Observer for Scroll Animations (General) =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.step-card, .plan-card, .service-card, .stat-item').forEach(el => {
    el.classList.add('animate-on-scroll');
    animateOnScroll.observe(el);
});

// ===== Chart Bar Animation on Scroll =====
const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.bar-fill').forEach(bar => {
                bar.style.animationPlayState = 'running';
            });
        }
    });
}, { threshold: 0.3 });

const chartContainer = document.querySelector('.chart-container');
if (chartContainer) {
    document.querySelectorAll('.bar-fill').forEach(bar => {
        bar.style.animationPlayState = 'paused';
    });
    chartObserver.observe(chartContainer);
}

// WhatsApp formatting is handled at the top of the file

// Supabase and Form Submission are now handled inline in index.html
// This prevents issues with file:// protocol and ensures script loading order

// ===== Interactive Effects =====
const hero = document.querySelector('.hero');
const heroGlow = document.querySelector('.hero-glow');

if (hero && heroGlow) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (scrolled < window.innerHeight) {
            heroGlow.style.transform = `translate(-50 %, calc(-50 % + ${scrolled * 0.3}px))`;
        }
    });

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        heroGlow.style.left = `${e.clientX - rect.left} px`;
        heroGlow.style.top = `${e.clientY - rect.top} px`;
    });
}

document.querySelectorAll('.plan-card').forEach(card => {
    card.addEventListener('mouseenter', function () { this.style.zIndex = '10'; });
    card.addEventListener('mouseleave', function () { this.style.zIndex = '1'; });

    // Stagger mini bars
    card.querySelectorAll('.mini-bar').forEach((bar, i) => {
        bar.style.transitionDelay = `${i * 0.1} s`;
    });
});

// ===== Loading Complete =====
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '1';

    // Trigger initial animations
    setTimeout(() => {
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('visible');
            }
        });
    }, 100);
});

// Easter Egg
console.log('%c🏠 Referência Capital', 'font-size: 24px; font-weight: bold; color: #D4AF37; text-shadow: 2px 2px 0 #0A0A0A;');
console.log('%cConstruindo patrimônios, transformando futuros.', 'font-size: 14px; color: #888;');
