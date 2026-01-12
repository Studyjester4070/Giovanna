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

// ===== WhatsApp Input Mask =====
const whatsappInput = document.getElementById('whatsapp');
if (whatsappInput) {
    whatsappInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 0) {
            if (value.length <= 2) value = `(${value}`;
            else if (value.length <= 7) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
            else value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        }
        e.target.value = value;
    });
}

// ===== Supabase Integration =====
const SUPABASE_URL = 'https://zinrqzsxvpqfoogohrwg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppbnJxenN4dnBxZm9vZ29ocndnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMDk1MDIsImV4cCI6MjA3NTg4NTUwMn0.0VDP-0ys8Y_VUhLXNCJCcSV1xAXV4c6pBvUq4mjPsRU';

// Initialize Supabase Safely
let supabase = null;
try {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        console.warn('Supabase client library not found.');
    }
} catch (e) {
    console.error('Error initializing Supabase:', e);
}

// ===== Form Submission =====
const leadForm = document.getElementById('leadForm');
if (leadForm) {
    leadForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const whatsapp = document.getElementById('whatsapp').value;
        const investment = document.getElementById('investment').value;
        const terms = document.getElementById('terms').checked; // Still check for validity

        if (!name || !whatsapp || !investment || !terms) {
            showNotification('Por favor, preencha todos os campos.', 'error');
            return;
        }

        const submitButton = this.querySelector('.submit-button');
        const originalText = submitButton.innerHTML;

        submitButton.innerHTML = `
            <svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.3"/>
                <path d="M12 2C6.48 2 2 6.48 2 12"/>
            </svg>
            <span>Enviando...</span>
        `;
        submitButton.disabled = true;

        try {
            if (!supabase) throw new Error('Supabase unavailable');

            const { data, error } = await supabase
                .schema('tefilho')
                .from('leads')
                .insert([{ name, whatsapp, investment }]); // Removed terms_accepted

            if (error) throw error;

            showNotification('Cadastro realizado com sucesso! Entraremos em contato.', 'success');
            leadForm.reset();

        } catch (error) {
            console.error('Error submitting form:', error);
            showNotification('Erro ao enviar. Tente novamente.', 'error');
        } finally {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });
}

// ===== Notification System =====
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) existingNotification.remove();

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;

    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification { position: fixed; top: 30px; right: 30px; padding: 18px 24px; border-radius: 12px; display: flex; align-items: center; gap: 16px; z-index: 1000; animation: slideIn 0.4s ease; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); }
            .notification.success { background: linear-gradient(135deg, #D4AF37, #B8860B); color: #0A0A0A; }
            .notification.error { background: linear-gradient(135deg, #dc3545, #c82333); color: white; }
            .notification button { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: inherit; opacity: 0.7; transition: opacity 0.2s; }
            .notification button:hover { opacity: 1; }
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// ===== Interactive Effects =====
const hero = document.querySelector('.hero');
const heroGlow = document.querySelector('.hero-glow');

if (hero && heroGlow) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (scrolled < window.innerHeight) {
            heroGlow.style.transform = `translate(-50%, calc(-50% + ${scrolled * 0.3}px))`;
        }
    });

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        heroGlow.style.left = `${e.clientX - rect.left}px`;
        heroGlow.style.top = `${e.clientY - rect.top}px`;
    });
}

document.querySelectorAll('.plan-card').forEach(card => {
    card.addEventListener('mouseenter', function () { this.style.zIndex = '10'; });
    card.addEventListener('mouseleave', function () { this.style.zIndex = '1'; });

    // Stagger mini bars
    card.querySelectorAll('.mini-bar').forEach((bar, i) => {
        bar.style.transitionDelay = `${i * 0.1}s`;
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
