const products = [
    { 
        id: 1, 
        name: "Mini Stickers", 
        price: 0.25, 
        description: "Pequeños pero con actitud. Perfectos para detalles sutiles y colecciones infinitas",
        image: "Stiker1.jpg",
        type: "regular"
    },
    { 
        id: 2, 
        name: "Stickers Medianos", 
        price: 0.50, 
        description: "El equilibrio ideal entre estilo y presencia. Tu toque personal donde más se nota",
        image: "Stiker2.jpg",
        type: "regular"
    },
    { 
        id: 3, 
        name: "Stickers grandes", 
        price: 1.00, 
        description: "Imposibles de ignorar. Diseños que capturan miradas y hablan fuerte",
        image: "Stiker3.jpg",
        type: "regular"
    },
    { 
        id: 4, 
        name: "Stickers Personalizables", 
        price: null, 
        description: "Tú eliges nosotros lo volvemos arte. Crea desde cero algo que sea solo tuyo",
        image: "misterio.jpg",
        type: "custom"
    },
    { 
        id: 5, 
        name: "Sticker LA FIL", 
        price: 1.50, 
        description: "Edición exclusiva con alma de colección. Lleva contigo el símbolo que representa elegancia y rebeldía creativa",
        image: "LF.png",
        type: "regular"
    },
    { 
        id: 6, 
        name: "Stickers Misteriosos", 
        price: 3.00, 
        description: "No sabes cuál te tocará. Cada sobre trae sorpresas únicas y coleccionables",
        image: "Stiker4.jpg",
        type: "regular"
    }
];

const CONFIG = {
    particles: {
        count: window.innerWidth < 768 ? 12 : 20,
        minSize: 1,
        maxSize: 3,
        minDuration: 4,
        maxDuration: 7
    }
};

const state = {
    currentProduct: null,
    currentQuantity: 1,
    isModalOpen: false,
    isContactModalOpen: false,
    particles: null,
    products: null,
    navigation: null
};

const utils = {
    random: (min, max) => Math.random() * (max - min) + min,
    
    createElement: (tag, classes = [], attrs = {}) => {
        const el = document.createElement(tag);
        classes.forEach(cls => el.classList.add(cls));
        Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
        return el;
    },

    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    debounce: (func, wait) => {
        let timeout;
        return function(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    formatPrice: (price) => price ? `$${price.toFixed(2)}` : 'Precio a consultar',

    calculateTotal: (price, quantity) => {
        if (!price) return 'A consultar';
        return `$${(price * quantity).toFixed(2)}`;
    }
};

class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particles');
        this.particles = new Set();
        this.isVisible = !document.hidden;
        this.animationFrame = null;
        this.maxParticles = CONFIG.particles.count;
    }

    createParticle() {
        const particle = utils.createElement('div', ['particle']);
        
        const size = utils.random(CONFIG.particles.minSize, CONFIG.particles.maxSize);
        const duration = utils.random(CONFIG.particles.minDuration, CONFIG.particles.maxDuration);
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${utils.random(0, 100)}%;
            top: ${utils.random(0, 100)}%;
            animation-duration: ${duration}s;
            animation-delay: ${utils.random(0, 2)}s;
            box-shadow: 0 0 ${size * 2}px rgba(255, 215, 0, 0.7);
            will-change: transform, opacity;
        `;
        
        return particle;
    }

    generateParticles() {
        if (!this.isVisible) return;
        
        const fragment = document.createDocumentFragment();
        const toCreate = Math.min(this.maxParticles - this.particles.size, 2);
        
        for (let i = 0; i < toCreate; i++) {
            const particle = this.createParticle();
            fragment.appendChild(particle);
            this.particles.add(particle);
        }
        
        if (fragment.children.length > 0) {
            this.container.appendChild(fragment);
        }
    }

    cleanupParticles() {
        const toRemove = [];
        this.particles.forEach(particle => {
            if (!particle.parentNode) {
                toRemove.push(particle);
            }
        });
        
        toRemove.forEach(particle => {
            this.particles.delete(particle);
        });
    }

    toggleVisibility() {
        this.isVisible = !document.hidden;
        if (!this.isVisible) {
            this.particles.forEach(particle => {
                if (particle.parentNode) particle.remove();
            });
            this.particles.clear();
        }
    }

    init() {
        this.generateParticles();
        
        document.addEventListener('visibilitychange', () => this.toggleVisibility());
        
        const updateParticles = () => {
            if (this.isVisible && this.particles.size < this.maxParticles) {
                this.generateParticles();
            }
            this.cleanupParticles();
            this.animationFrame = requestAnimationFrame(updateParticles);
        };
        
        this.animationFrame = requestAnimationFrame(updateParticles);
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.particles.forEach(particle => {
            if (particle.parentNode) particle.remove();
        });
        this.particles.clear();
    }
}

class ProductManager {
    constructor() {
        this.grid = document.getElementById('productsGrid');
        this.modal = document.getElementById('purchaseModal');
        this.contactModal = document.getElementById('contactModal');
    }

    createProductCard(product) {
        const card = utils.createElement('div', ['product-card']);
        card.setAttribute('role', 'gridcell');
        
        const priceDisplay = product.price ? utils.formatPrice(product.price) : 'Precio a consultar';
        
        card.innerHTML = `
            <div class="product-image">
                ${product.image ? 
                    `<img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.parentElement.innerHTML='Imagen no disponible'">` : 
                    'Sube tu imagen aquí'
                }
            </div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">${priceDisplay}</p>
            <p class="product-description">${product.description}</p>
            <button class="buy-button" 
                    data-product-id="${product.id}" 
                    data-product-name="${product.name}" 
                    data-product-price="${product.price || 0}"
                    data-product-type="${product.type}"
                    aria-label="${product.type === 'custom' ? 'Contactar para' : 'Comprar'} ${product.name}">
                ${product.type === 'custom' ? 'Contactar' : 'Comprar Ahora'}
            </button>
        `;

        const button = card.querySelector('.buy-button');
        button.addEventListener('click', () => {
            this.handleProductAction(product);
        });
        
        return card;
    }

    handleProductAction(product) {
        if (product.type === 'custom') {
            this.openContactModal();
        } else {
            this.openPurchaseModal(product);
        }
    }

    generateProducts() {
        const fragment = document.createDocumentFragment();
        
        products.forEach((product, index) => {
            const card = this.createProductCard(product);
            fragment.appendChild(card);

            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px) scale(0.95)';
                card.style.transition = 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
                
                requestAnimationFrame(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0) scale(1)';
                });
            }, index * 80);
        });
        
        this.grid.appendChild(fragment);
    }

    openPurchaseModal(product) {
        state.currentProduct = product;
        state.currentQuantity = 1;
        state.isModalOpen = true;
        
        document.getElementById('modalProductName').textContent = product.name;
        document.getElementById('modalProductPrice').textContent = utils.formatPrice(product.price);
        document.getElementById('quantityInput').value = 1;
        this.updateTotalPrice();
        
        this.modal.style.display = 'block';
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        const content = this.modal.querySelector('.modal-content');
        content.style.transform = 'translateY(-20px) scale(0.95)';
        content.style.opacity = '0';
        
        requestAnimationFrame(() => {
            content.style.transform = 'translateY(0) scale(1)';
            content.style.opacity = '1';
        });
    }

    openContactModal() {
        state.isContactModalOpen = true;
        
        this.contactModal.style.display = 'block';
        this.contactModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        const content = this.contactModal.querySelector('.modal-content');
        content.style.transform = 'translateY(-20px) scale(0.95)';
        content.style.opacity = '0';
        
        requestAnimationFrame(() => {
            content.style.transform = 'translateY(0) scale(1)';
            content.style.opacity = '1';
        });
    }

    closePurchaseModal() {
        if (!state.isModalOpen) return;
        
        const content = this.modal.querySelector('.modal-content');
        
        content.style.transform = 'translateY(-15px) scale(0.98)';
        content.style.opacity = '0';
        
        setTimeout(() => {
            this.modal.style.display = 'none';
            this.modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = 'auto';
            state.isModalOpen = false;
            state.currentProduct = null;
        }, 200);
    }

    closeContactModal() {
        if (!state.isContactModalOpen) return;
        
        const content = this.contactModal.querySelector('.modal-content');
        
        content.style.transform = 'translateY(-15px) scale(0.98)';
        content.style.opacity = '0';
        
        setTimeout(() => {
            this.contactModal.style.display = 'none';
            this.contactModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = 'auto';
            state.isContactModalOpen = false;
        }, 200);
    }

    updateTotalPrice() {
        if (!state.currentProduct || !state.currentProduct.price) return;
        
        const total = utils.calculateTotal(state.currentProduct.price, state.currentQuantity);
        const totalElement = document.getElementById('totalPrice');
        
        if (totalElement) {
            totalElement.textContent = `Total: ${total}`;
        }
    }

    changeQuantity(delta) {
        if (!state.currentProduct) return;
        
        const newQuantity = Math.max(1, Math.min(999, state.currentQuantity + delta));
        
        if (newQuantity !== state.currentQuantity) {
            state.currentQuantity = newQuantity;
            document.getElementById('quantityInput').value = newQuantity;
            this.updateTotalPrice();
            
            const input = document.getElementById('quantityInput');
            input.style.transform = 'scale(1.1)';
            setTimeout(() => {
                input.style.transform = 'scale(1)';
            }, 150);
        }
    }
}

class NavigationManager {
    constructor() {
        this.header = document.getElementById('header');
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('nav-menu');
        this.lastScrollY = 0;
        this.scrollThreshold = 80;
        this.headerHeight = this.header.offsetHeight;
        this.ticking = false;
        
        this.initScrollEffects();
        this.initMobileMenu();
    }

    handleScroll = () => {
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
        this.ticking = false;
    }

    initScrollEffects() {
        const scrollHandler = () => {
            if (!this.ticking) {
                requestAnimationFrame(this.handleScroll);
                this.ticking = true;
            }
        };
        
        window.addEventListener('scroll', scrollHandler, { passive: true });
    }

    initMobileMenu() {
        if (this.hamburger && this.navMenu) {
            this.hamburger.addEventListener('click', () => {
                const isExpanded = this.hamburger.getAttribute('aria-expanded') === 'true';
                this.hamburger.setAttribute('aria-expanded', !isExpanded);
                this.navMenu.classList.toggle('show');
            });

            document.addEventListener('click', (e) => {
                if (!this.hamburger.contains(e.target) && !this.navMenu.contains(e.target)) {
                    this.navMenu.classList.remove('show');
                    this.hamburger.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }
}

window.openModal = function(productName, productPrice) {
    const product = products.find(p => p.name === productName);
    if (product && state.products) {
        state.products.openPurchaseModal(product);
    }
};

window.closeModal = function() {
    if (state.products) {
        state.products.closePurchaseModal();
    }
};

window.closeContactModal = function() {
    if (state.products) {
        state.products.closeContactModal();
    }
};

window.changeQuantity = function(delta) {
    if (state.products) {
        state.products.changeQuantity(delta);
    }
};

window.contactWhatsApp = function() {
    const message = "Hola! Estoy interesado en crear stickers personalizables. Me gustaría conocer más detalles sobre precios y opciones de diseño.";
    const url = `https://wa.me/593998770378?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
};

window.contactWhatsAppPurchase = function() {
    if (!state.currentProduct) return;
    
    const message = `Hola! Quiero comprar ${state.currentQuantity} ${state.currentProduct.name} por ${utils.calculateTotal(state.currentProduct.price, state.currentQuantity)}. ¿Cómo procedo con el pago?`;
    const url = `https://wa.me/593998770378?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
};

window.contactEmail = function() {
    const subject = "Consulta sobre Stickers Personalizables";
    const body = "Hola,\n\nEstoy interesado en crear stickers personalizables. Me gustaría conocer más detalles sobre:\n\n- Precios según formato\n- Opciones de diseño\n- Tiempos de entrega\n- Proceso de personalización\n\nQuedo atento a su respuesta.\n\nSaludos.";
    const url = `mailto:lafilec01@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
};

function initializeApp() {
    try {
        state.particles = new ParticleSystem();
        state.products = new ProductManager();
        state.navigation = new NavigationManager();
        
        state.particles.init();
        state.products.generateProducts();
        
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

const handleResize = utils.debounce(() => {
    const newCount = window.innerWidth < 768 ? 12 : 20;
    
    if (CONFIG.particles.count !== newCount) {
        CONFIG.particles.count = newCount;
        
        if (state.particles) {
            state.particles.maxParticles = newCount;
        }
    }
}, 250);

document.addEventListener('DOMContentLoaded', initializeApp);
window.addEventListener('resize', handleResize);

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (state.isModalOpen) {
            closeModal();
        } else if (state.isContactModalOpen) {
            closeContactModal();
        }
    }
});

window.addEventListener('click', (event) => {
    if (event.target === document.getElementById('purchaseModal')) {
        closeModal();
    } else if (event.target === document.getElementById('contactModal')) {
        closeContactModal();
    }
});

window.addEventListener('beforeunload', () => {
    if (state.particles) {
        state.particles.destroy();
    }
});

window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
});
