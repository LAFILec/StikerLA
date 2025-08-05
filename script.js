const products = [
    { 
        id: 1, 
        name: "Producto Eternal I", 
        price: "$29.99", 
        description: "Un producto extraordinario que combina la elegancia ancestral con la tecnología moderna. Diseñado para aquellos que buscan la perfección en cada detalle.",
        image: null 
    },
    { 
        id: 2, 
        name: "Producto Eternal II", 
        price: "$39.99", 
        description: "Inspirado en los poderes cósmicos de los Eternals, este producto trasciende las expectativas ordinarias para ofrecerte una experiencia única e inolvidable.",
        image: null 
    },
    { 
        id: 3, 
        name: "Producto Eternal III", 
        price: "$49.99", 
        description: "Forjado con la sabiduría milenaria y la innovación del futuro. Cada elemento ha sido cuidadosamente seleccionado para crear algo verdaderamente excepcional.",
        image: null 
    },
    { 
        id: 4, 
        name: "Producto Eternal IV", 
        price: "$59.99", 
        description: "Una obra maestra que refleja la armonía entre el poder y la elegancia. Diseñado para quienes comprenden que la calidad no tiene límites ni compromisos.",
        image: null 
    },
    { 
        id: 5, 
        name: "Producto Eternal V", 
        price: "$69.99", 
        description: "Elevando los estándares hacia nuevas dimensiones de excelencia. Este producto encarna la esencia de lo eterno en cada una de sus características únicas.",
        image: null 
    },
    { 
        id: 6, 
        name: "Producto Eternal VI", 
        price: "$79.99", 
        description: "La culminación de siglos de perfeccionamiento y evolución. Un producto que trasciende el tiempo y establece nuevos paradigmas de calidad y distinción.",
        image: null 
    }
];

const PARTICLE_CONFIG = {
    count: window.innerWidth < 768 ? 30 : 50,
    minSize: 1,
    maxSize: 4,
    minDuration: 3,
    maxDuration: 6
};

const utils = {
    random: (min, max) => Math.random() * (max - min) + min,
    
    createElement: (tag, classes = [], attributes = {}) => {
        const element = document.createElement(tag);
        classes.forEach(cls => element.classList.add(cls));
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
        return element;
    },

    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    },

    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particles');
        this.particles = [];
        this.isVisible = true;
    }

    createParticle() {
        const particle = utils.createElement('div', ['particle']);
        
        const size = utils.random(PARTICLE_CONFIG.minSize, PARTICLE_CONFIG.maxSize);
        const duration = utils.random(PARTICLE_CONFIG.minDuration, PARTICLE_CONFIG.maxDuration);
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${utils.random(0, 100)}%;
            top: ${utils.random(0, 100)}%;
            animation-duration: ${duration}s;
            animation-delay: ${utils.random(0, 2)}s;
            box-shadow: 0 0 ${size * 2}px rgba(255, 215, 0, 0.8);
        `;
        
        return particle;
    }

    generateParticles() {
        if (!this.isVisible) return;
        
        for (let i = 0; i < PARTICLE_CONFIG.count; i++) {
            const particle = this.createParticle();
            this.container.appendChild(particle);
            this.particles.push(particle);
        }
    }

    toggleVisibility() {
        this.isVisible = !document.hidden;
        if (!this.isVisible) {
            this.particles.forEach(particle => {
                if (particle.parentNode) particle.remove();
            });
            this.particles = [];
        } else {
            this.generateParticles();
        }
    }

    init() {
        this.generateParticles();
        
        document.addEventListener('visibilitychange', () => this.toggleVisibility());
        
        setInterval(() => {
            if (!this.isVisible) return;
            
            const particlesToRemove = Math.floor(this.particles.length * 0.1);
            for (let i = 0; i < particlesToRemove; i++) {
                const randomIndex = Math.floor(Math.random() * this.particles.length);
                const particle = this.particles[randomIndex];
                if (particle?.parentNode) {
                    particle.remove();
                    this.particles.splice(randomIndex, 1);
                }
            }
            
            for (let i = 0; i < particlesToRemove; i++) {
                const particle = this.createParticle();
                this.container.appendChild(particle);
                this.particles.push(particle);
            }
        }, 10000);
    }
}

class ProductManager {
    constructor() {
        this.grid = document.getElementById('productsGrid');
        this.modal = document.getElementById('purchaseModal');
    }

    createProductCard(product, index) {
        const productCard = utils.createElement('div', ['product-card']);
        
        productCard.innerHTML = `
            <div class="product-image">
                ${product.image ? 
                    `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 15px;">` : 
                    'Sube tu imagen aquí'
                }
            </div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">${product.price}</p>
            <p class="product-description">${product.description}</p>
            <button class="buy-button" data-product-name="${product.name}" data-product-price="${product.price}">
                ⚡ Comprar Ahora
            </button>
        `;

        const button = productCard.querySelector('.buy-button');
        button.addEventListener('click', (e) => {
            this.createRippleEffect(e, button);
            this.openModal(product.name, product.price);
        });

        productCard.addEventListener('mouseenter', () => this.createHoverParticles(productCard));
        
        return productCard;
    }

    createHoverParticles(card) {
        if (window.innerWidth < 768) return;
        
        const rect = card.getBoundingClientRect();
        const particleCount = 3;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = utils.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: var(--gold);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                left: ${rect.left + Math.random() * rect.width}px;
                top: ${rect.top + Math.random() * rect.height}px;
                opacity: 1;
                transition: all 0.8s ease-out;
                box-shadow: 0 0 6px var(--gold);
            `;
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.style.transform = `translate(${(Math.random() - 0.5) * 60}px, ${-30 - Math.random() * 30}px) scale(0)`;
                particle.style.opacity = '0';
            }, 50);
            
            setTimeout(() => particle.remove(), 850);
        }
    }

    createRippleEffect(event, button) {
        const rect = button.getBoundingClientRect();
        const ripple = utils.createElement('div');
        
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    generateProducts() {
        products.forEach((product, index) => {
            const productCard = this.createProductCard(product, index);
            this.grid.appendChild(productCard);
            
            productCard.style.opacity = '0';
            productCard.style.transform = 'translateY(30px) scale(0.9)';
            productCard.style.transition = 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
            
            setTimeout(() => {
                productCard.style.opacity = '1';
                productCard.style.transform = 'translateY(0) scale(1)';
            }, index * 100);
        });
    }

    openModal(productName, productPrice) {
        document.getElementById('modalProductName').textContent = productName;
        document.getElementById('modalProductPrice').textContent = productPrice;
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        const modalContent = this.modal.querySelector('.modal-content');
        modalContent.style.transform = 'translateY(-30px) scale(0.95)';
        modalContent.style.opacity = '0';
        
        requestAnimationFrame(() => {
            modalContent.style.transform = 'translateY(0) scale(1)';
            modalContent.style.opacity = '1';
        });
    }

    closeModal() {
        const modalContent = this.modal.querySelector('.modal-content');
        
        modalContent.style.transform = 'translateY(-20px) scale(0.98)';
        modalContent.style.opacity = '0';
        
        setTimeout(() => {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 250);
    }
}

class NavigationManager {
    constructor() {
        this.header = document.getElementById('header');
        this.lastScrollY = 0;
        this.scrollThreshold = 100;
        this.isScrollingDown = false;
        this.headerHeight = this.header.offsetHeight;
        
        this.initScrollEffects();
        this.initNavigationEffects();
        this.initLogoEffects();
    }

    handleScroll() {
        const currentScrollY = window.pageYOffset;
        const scrollingDown = currentScrollY > this.lastScrollY;
        const pastThreshold = currentScrollY > this.scrollThreshold;

        this.header.classList.remove('header-visible', 'header-hidden', 'header-scrolled');

        if (pastThreshold) {
            this.header.classList.add('header-scrolled');
            
            if (scrollingDown && currentScrollY > this.headerHeight) {
                this.header.classList.add('header-hidden');
            } else {
                this.header.classList.add('header-visible');
            }
        } else {
            this.header.classList.add('header-visible');
        }

        this.lastScrollY = currentScrollY;
    }

    initScrollEffects() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    initNavigationEffects() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.createClickEffect(e, link));
            
            if (window.innerWidth > 768) {
                link.addEventListener('mouseenter', () => this.createNavHover(link));
            }
        });
    }

    initLogoEffects() {
        const logo = document.querySelector('.logo');
        const logoIcon = document.querySelector('.logo-icon');
        
        if (logo && logoIcon) {
            // Efecto de partículas musicales al hacer hover
            logo.addEventListener('mouseenter', () => this.createMusicalParticles(logo));
            
            // Efecto de click con ondas de sonido
            logo.addEventListener('click', (e) => {
                e.preventDefault();
                this.createSoundWaves(logo);
                
                // Pequeño delay antes de navegar
                setTimeout(() => {
                    if (logo.href) {
                        window.open(logo.href, '_self');
                    }
                }, 300);
            });

            // Animación periódica del icono musical
            setInterval(() => {
                if (!document.hidden && window.innerWidth > 768) {
                    this.pulseMusicalIcon(logoIcon);
                }
            }, 5000);
        }
    }

    createMusicalParticles(logo) {
        if (window.innerWidth < 768) return;
        
        const rect = logo.getBoundingClientRect();
        const particleCount = 8;
        const musicalNotes = ['♪', '♫', '♬', '♩', '♭', '♯'];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = utils.createElement('div');
            const note = musicalNotes[Math.floor(Math.random() * musicalNotes.length)];
            
            particle.textContent = note;
            particle.style.cssText = `
                position: fixed;
                font-size: ${utils.random(12, 18)}px;
                color: var(--gold);
                pointer-events: none;
                z-index: 1001;
                left: ${rect.left + Math.random() * rect.width}px;
                top: ${rect.top + rect.height / 2}px;
                opacity: 1;
                transition: all 1.2s cubic-bezier(0.25, 0.8, 0.25, 1);
                text-shadow: 0 0 8px rgba(255, 215, 0, 0.8);
            `;
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                const angle = (i / particleCount) * Math.PI * 2;
                const distance = utils.random(40, 80);
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance - 30;
                
                particle.style.transform = `translate(${x}px, ${y}px) rotate(${utils.random(-180, 180)}deg) scale(0)`;
                particle.style.opacity = '0';
            }, 100);
            
            setTimeout(() => particle.remove(), 1300);
        }
    }

    createSoundWaves(logo) {
        const rect = logo.getBoundingClientRect();
        const waveCount = 3;
        
        for (let i = 0; i < waveCount; i++) {
            const wave = utils.createElement('div');
            
            wave.style.cssText = `
                position: fixed;
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
                width: 4px;
                height: 4px;
                border: 2px solid var(--gold);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1001;
                opacity: 0.8;
                transform: translate(-50%, -50%) scale(0);
                animation: soundWave 1s ease-out forwards;
                animation-delay: ${i * 0.2}s;
            `;
            
            document.body.appendChild(wave);
            
            setTimeout(() => wave.remove(), 1200);
        }
    }

    pulseMusicalIcon(icon) {
        icon.style.animation = 'none';
        
        requestAnimationFrame(() => {
            icon.style.animation = 'musicalPulse 2s ease-in-out';
        });
    }

    createClickEffect(event, element) {
        element.style.transform = 'scale(0.98)';
        
        setTimeout(() => {
            element.style.transform = '';
        }, 150);
    }

    createNavHover(element) {
        const rect = element.getBoundingClientRect();
        const particle = utils.createElement('div');
        
        particle.style.cssText = `
            position: fixed;
            width: 2px;
            height: 2px;
            background: var(--gold);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1001;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.bottom}px;
            opacity: 1;
            transition: all 0.4s ease-out;
            box-shadow: 0 0 4px var(--gold);
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.style.transform = `translateY(20px) scale(0)`;
            particle.style.opacity = '0';
        }, 50);
        
        setTimeout(() => particle.remove(), 450);
    }
}

class TextEffects {
    static typeWriter(element, text, speed = 100) {
        element.textContent = '';
        let i = 0;
        
        const timer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);
    }

    static initTitleEffects() {
        const logo = document.querySelector('.main-logo');
        if (logo) {
            const originalText = logo.textContent;
            setTimeout(() => {
                TextEffects.typeWriter(logo, originalText, 80);
            }, 800);
        }
    }
}

function openModal(productName, productPrice) {
    if (window.productManager) {
        window.productManager.openModal(productName, productPrice);
    }
}

function closeModal() {
    if (window.productManager) {
        window.productManager.closeModal();
    }
}

function contactSeller() {
    const productName = document.getElementById('modalProductName').textContent;
    const productPrice = document.getElementById('modalProductPrice').textContent;
    const message = `Hola! Estoy interesado en el producto: ${productName} - ${productPrice}`;
    const whatsappUrl = `https://wa.me/593991389251?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

let particleSystem, productManager, navigationManager;

function initializeApp() {
    particleSystem = new ParticleSystem();
    productManager = new ProductManager();
    navigationManager = new NavigationManager();
    
    window.productManager = productManager;
    
    particleSystem.init();
    productManager.generateProducts();
    
    if (window.innerWidth > 768) {
        TextEffects.initTitleEffects();
    }
    
    // Inicializar efectos adicionales
    initializeSpecialEffects();
}

function initializeSpecialEffects() {
    // Efecto de partículas doradas al mover el mouse
    let mouseParticleTimeout;
    
    document.addEventListener('mousemove', (e) => {
        if (window.innerWidth < 768) return;
        
        clearTimeout(mouseParticleTimeout);
        mouseParticleTimeout = setTimeout(() => {
            createMouseParticle(e.clientX, e.clientY);
        }, 100);
    });
    
    // Efecto de clic en cualquier parte de la página
    document.addEventListener('click', (e) => {
        if (window.innerWidth > 768) {
            createClickBurst(e.clientX, e.clientY);
        }
    });
}

function createMouseParticle(x, y) {
    const particle = utils.createElement('div');
    
    particle.style.cssText = `
        position: fixed;
        width: 3px;
        height: 3px;
        background: var(--gold);
        border-radius: 50%;
        pointer-events: none;
        z-index: 999;
        left: ${x}px;
        top: ${y}px;
        opacity: 0.8;
        transition: all 0.8s ease-out;
        box-shadow: 0 0 6px var(--gold);
    `;
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
        particle.style.transform = `translate(${(Math.random() - 0.5) * 40}px, ${-20 - Math.random() * 20}px) scale(0)`;
        particle.style.opacity = '0';
    }, 50);
    
    setTimeout(() => particle.remove(), 850);
}

function createClickBurst(x, y) {
    const burstCount = 6;
    
    for (let i = 0; i < burstCount; i++) {
        const particle = utils.createElement('div');
        
        particle.style.cssText = `
            position: fixed;
            width: 2px;
            height: 2px;
            background: var(--gold);
            border-radius: 50%;
            pointer-events: none;
            z-index: 999;
            left: ${x}px;
            top: ${y}px;
            opacity: 1;
            transition: all 0.6s ease-out;
            box-shadow: 0 0 4px var(--gold);
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            const angle = (i / burstCount) * Math.PI * 2;
            const distance = utils.random(20, 40);
            const deltaX = Math.cos(angle) * distance;
            const deltaY = Math.sin(angle) * distance;
            
            particle.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0)`;
            particle.style.opacity = '0';
        }, 50);
        
        setTimeout(() => particle.remove(), 650);
    }
}

function handleResize() {
    PARTICLE_CONFIG.count = window.innerWidth < 768 ? 30 : 50;
    
    if (particleSystem) {
        particleSystem.particles.forEach(particle => {
            if (particle.parentNode) particle.remove();
        });
        particleSystem.particles = [];
        particleSystem.generateParticles();
    }
}

// Event Listeners principales
document.addEventListener('DOMContentLoaded', initializeApp);

window.addEventListener('resize', utils.debounce(handleResize, 250));

window.addEventListener('click', (event) => {
    const modal = document.getElementById('purchaseModal');
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const modal = document.getElementById('purchaseModal');
        if (modal.style.display === 'block') {
            closeModal();
        }
    }
});

window.addEventListener('beforeunload', () => {
    if (particleSystem) {
        particleSystem.particles.forEach(particle => {
            if (particle.parentNode) particle.remove();
        });
    }
});

// Estilos dinámicos adicionales
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    @keyframes soundWave {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.8;
        }
        50% {
            opacity: 0.4;
        }
        100% {
            transform: translate(-50%, -50%) scale(8);
            opacity: 0;
        }
    }
    
    .hover-particle {
        box-shadow: 0 0 10px var(--gold);
    }
    
    /* Mejoras para los hilos dorados */
    .thread {
        background: linear-gradient(to bottom, 
            var(--gold) 0%, 
            rgba(255, 215, 0, 0.8) 30%, 
            rgba(255, 215, 0, 0.4) 70%, 
            transparent 100%);
        filter: blur(0.5px);
    }
    
    .thread::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        width: 1px;
        height: 100%;
        background: linear-gradient(to bottom, 
            rgba(255, 255, 255, 0.8) 0%, 
            rgba(255, 255, 255, 0.4) 50%, 
            transparent 100%);
        transform: translateX(-50%);
    }
    
    /* Efecto de resplandor para el mandala */
    .eternal-mandala::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 50%;
        height: 50%;
        background: radial-gradient(circle, 
            rgba(255, 215, 0, 0.1) 0%, 
            rgba(255, 215, 0, 0.05) 50%, 
            transparent 100%);
        transform: translate(-50%, -50%);
        animation: mandalaPulse 8s ease-in-out infinite;
        border-radius: 50%;
    }
    
    @keyframes mandalaPulse {
        0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.3;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.6;
        }
    }
    
    /* Efectos adicionales para dispositivos móviles */
    @media (max-width: 768px) {
        .logo:active {
            transform: scale(0.95);
        }
        
        .logo-icon {
            animation-duration: 1.5s;
        }
        
        .wave {
            border-width: 1px;
        }
    }
    
    /* Animación de entrada para el logo */
    .logo {
        animation: logoEntrance 1s ease-out 0.5s both;
    }
    
    @keyframes logoEntrance {
        0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.8);
        }
        50% {
            opacity: 0.7;
            transform: translateY(-5px) scale(1.05);
        }
        100% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    /* Efecto de brillo periódico para elementos dorados */
    .product-name,
    .modal-product-name,
    .qr-title {
        animation: goldenShimmer 6s ease-in-out infinite;
    }
    
    @keyframes goldenShimmer {
        0%, 100% {
            text-shadow: 0 0 5px rgba(255, 215, 0, 0.3);
        }
        50% {
            text-shadow: 0 0 15px rgba(255, 215, 0, 0.8), 0 0 25px rgba(255, 215, 0, 0.4);
        }
    }
`;
document.head.appendChild(dynamicStyles);

// Función para mejorar la visibilidad de los hilos dorados
function enhancePowerThreads() {
    const threads = document.querySelectorAll('.thread');
    threads.forEach((thread, index) => {
        // Agregar variación en la animación
        thread.style.setProperty('--thread-delay', `${index * 0.3}s`);
        thread.style.setProperty('--thread-duration', `${4 + (index % 3)}s`);
        
        // Mejorar la opacidad y el brillo
        thread.style.opacity = '0.8';
        thread.style.filter = 'blur(0.5px) brightness(1.2)';
    });
}

// Inicializar mejoras adicionales cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(enhancePowerThreads, 1000);
});

// Debug: Función para mostrar información del sistema
if (window.location.search.includes('debug=true')) {
    console.log('🌟 Eternals Store Debug Mode');
    console.log('Particle count:', PARTICLE_CONFIG.count);
    console.log('Screen width:', window.innerWidth);
    console.log('User agent:', navigator.userAgent);
}