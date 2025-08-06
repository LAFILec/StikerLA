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

const PARTICLE_CONFIG = {
    count: window.innerWidth < 768 ? 25 : 40,
    minSize: 1,
    maxSize: 4,
    minDuration: 3,
    maxDuration: 6
};

const AppState = {
    currentProduct: null,
    currentQuantity: 1,
    isModalOpen: false,
    isContactModalOpen: false,
    particleSystem: null,
    productManager: null,
    navigationManager: null
};

const Utils = {
    random: (min, max) => Math.random() * (max - min) + min,
    
    createElement: (tag, classes = [], attributes = {}) => {
        const element = document.createElement(tag);
        classes.forEach(cls => element.classList.add(cls));
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
        return element;
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

    formatPrice: (price) => {
        return price ? `$${price.toFixed(2)}` : 'Precio a consultar';
    },

    calculateTotal: (price, quantity) => {
        if (!price) return 'A consultar';
        return `$${(price * quantity).toFixed(2)}`;
    }
};

class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particles');
        this.particles = new Set();
        this.isVisible = true;
        this.animationFrame = null;
        this.updateInterval = null;
        this.maxParticles = PARTICLE_CONFIG.count;
    }

    createParticle() {
        const particle = Utils.createElement('div', ['particle']);
        
        const size = Utils.random(PARTICLE_CONFIG.minSize, PARTICLE_CONFIG.maxSize);
        const duration = Utils.random(PARTICLE_CONFIG.minDuration, PARTICLE_CONFIG.maxDuration);
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Utils.random(0, 100)}%;
            top: ${Utils.random(0, 100)}%;
            animation-duration: ${duration}s;
            animation-delay: ${Utils.random(0, 2)}s;
            box-shadow: 0 0 ${size * 2}px rgba(255, 215, 0, 0.8);
            will-change: transform, opacity;
        `;
        
        return particle;
    }

    generateParticles() {
        if (!this.isVisible) return;
        
        const fragment = document.createDocumentFragment();
        const particlesToCreate = Math.min(this.maxParticles - this.particles.size, 5);
        
        for (let i = 0; i < particlesToCreate; i++) {
            const particle = this.createParticle();
            fragment.appendChild(particle);
            this.particles.add(particle);
        }
        
        if (fragment.children.length > 0) {
            this.container.appendChild(fragment);
        }
    }

    cleanupParticles() {
        const particlesToRemove = [];
        this.particles.forEach(particle => {
            if (!particle.parentNode) {
                particlesToRemove.push(particle);
            }
        });
        
        particlesToRemove.forEach(particle => {
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
        } else {
            this.generateParticles();
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
        
        this.updateInterval = setInterval(() => {
            if (this.isVisible) {
                this.cleanupParticles();
                const particlesToRenew = Math.min(3, this.particles.size);
                let renewed = 0;
                this.particles.forEach(particle => {
                    if (renewed >= particlesToRenew) return;
                    if (Math.random() < 0.1 && particle.parentNode) {
                        particle.remove();
                        this.particles.delete(particle);
                        renewed++;
                    }
                });
            }
        }, 8000);
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
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
        this.ripplePool = [];
        this.maxRipples = 10;
    }

    createProductCard(product, index) {
        const productCard = Utils.createElement('div', ['product-card']);
        
        const priceDisplay = product.price ? Utils.formatPrice(product.price) : 'Precio a consultar';
        
        productCard.innerHTML = `
            <div class="product-image">
                ${product.image ? 
                    `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 15px;" loading="lazy">` : 
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
                    data-product-type="${product.type}">
                ⚡ ${product.type === 'custom' ? 'Contactar' : 'Comprar Ahora'}
            </button>
        `;

        const button = productCard.querySelector('.buy-button');
        button.addEventListener('click', (e) => {
            this.createRippleEffect(e, button);
            this.handleProductAction(product);
        });

        productCard.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                this.createHoverParticles(productCard);
            }
        });
        
        return productCard;
    }

    handleProductAction(product) {
        if (product.type === 'custom') {
            this.openContactModal();
        } else {
            this.openPurchaseModal(product);
        }
    }

    createHoverParticles(card) {
        if (window.innerWidth < 768) return;
        
        const rect = card.getBoundingClientRect();
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < 3; i++) {
            const particle = Utils.createElement('div');
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
                will-change: transform, opacity;
            `;
            
            fragment.appendChild(particle);
            
            requestAnimationFrame(() => {
                particle.style.transform = `translate(${(Math.random() - 0.5) * 60}px, ${-30 - Math.random() * 30}px) scale(0)`;
                particle.style.opacity = '0';
            });
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 850);
        }
        
        document.body.appendChild(fragment);
    }

    createRippleEffect(event, button) {
        let ripple = this.ripplePool.pop();
        
        if (!ripple) {
            ripple = Utils.createElement('div');
        }
        
        const rect = button.getBoundingClientRect();
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
            will-change: transform, opacity;
        `;
        
        button.style.position = 'relative';
        button.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
            if (this.ripplePool.length < this.maxRipples) {
                this.ripplePool.push(ripple);
            }
        }, 600);
    }

    generateProducts() {
        const fragment = document.createDocumentFragment();
        
        products.forEach((product, index) => {
            const productCard = this.createProductCard(product, index);
            fragment.appendChild(productCard);

            setTimeout(() => {
                productCard.style.opacity = '0';
                productCard.style.transform = 'translateY(30px) scale(0.9)';
                productCard.style.transition = 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
                
                requestAnimationFrame(() => {
                    productCard.style.opacity = '1';
                    productCard.style.transform = 'translateY(0) scale(1)';
                });
            }, index * 100);
        });
        
        this.grid.appendChild(fragment);
    }

    openPurchaseModal(product) {
        AppState.currentProduct = product;
        AppState.currentQuantity = 1;
        AppState.isModalOpen = true;
        
        document.getElementById('modalProductName').textContent = product.name;
        document.getElementById('modalProductPrice').textContent = Utils.formatPrice(product.price);
        document.getElementById('quantityInput').value = 1;
        this.updateTotalPrice();
        
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

    openContactModal() {
        AppState.isContactModalOpen = true;
        
        this.contactModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        const modalContent = this.contactModal.querySelector('.modal-content');
        modalContent.style.transform = 'translateY(-30px) scale(0.95)';
        modalContent.style.opacity = '0';
        
        requestAnimationFrame(() => {
            modalContent.style.transform = 'translateY(0) scale(1)';
            modalContent.style.opacity = '1';
        });
    }

    closePurchaseModal() {
        if (!AppState.isModalOpen) return;
        
        const modalContent = this.modal.querySelector('.modal-content');
        
        modalContent.style.transform = 'translateY(-20px) scale(0.98)';
        modalContent.style.opacity = '0';
        
        setTimeout(() => {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            AppState.isModalOpen = false;
            AppState.currentProduct = null;
        }, 250);
    }

    closeContactModal() {
        if (!AppState.isContactModalOpen) return;
        
        const modalContent = this.contactModal.querySelector('.modal-content');
        
        modalContent.style.transform = 'translateY(-20px) scale(0.98)';
        modalContent.style.opacity = '0';
        
        setTimeout(() => {
            this.contactModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            AppState.isContactModalOpen = false;
        }, 250);
    }

    updateTotalPrice() {
        if (!AppState.currentProduct || !AppState.currentProduct.price) return;
        
        const total = Utils.calculateTotal(AppState.currentProduct.price, AppState.currentQuantity);
        const totalElement = document.getElementById('totalPrice');
        
        if (totalElement) {
            totalElement.textContent = `Total: ${total}`;
        }
    }

    changeQuantity(delta) {
        if (!AppState.currentProduct) return;
        
        const newQuantity = Math.max(1, Math.min(999, AppState.currentQuantity + delta));
        
        if (newQuantity !== AppState.currentQuantity) {
            AppState.currentQuantity = newQuantity;
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
        this.scrollThreshold = 100;
        this.headerHeight = this.header.offsetHeight;
        this.ticking = false;
        
        this.initScrollEffects();
        this.initNavigationEffects();
        this.initLogoEffects();
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
            logo.addEventListener('mouseenter', () => this.createMusicalParticles(logo));
            
            logo.addEventListener('click', (e) => {
                e.preventDefault();
                this.createSoundWaves(logo);
                
                setTimeout(() => {
                    if (logo.href) {
                        window.open(logo.href, '_self');
                    }
                }, 300);
            });

            const pulseInterval = setInterval(() => {
                if (!document.hidden && window.innerWidth > 768) {
                    this.pulseMusicalIcon(logoIcon);
                }
            }, 5000);
            
            window.addEventListener('beforeunload', () => {
                clearInterval(pulseInterval);
            });
        }
    }

    initMobileMenu() {
        if (this.hamburger && this.navMenu) {
            this.hamburger.addEventListener('click', () => {
                this.navMenu.classList.toggle('show');
            });

            document.addEventListener('click', (e) => {
                if (!this.hamburger.contains(e.target) && !this.navMenu.contains(e.target)) {
                    this.navMenu.classList.remove('show');
                }
            });
        }
    }

    createMusicalParticles(logo) {
        if (window.innerWidth < 768) return;
        
        const rect = logo.getBoundingClientRect();
        const musicalNotes = ['♪', '♫', '♬', '♩', '♭', '♯'];
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < 8; i++) {
            const particle = Utils.createElement('div');
            const note = musicalNotes[Math.floor(Math.random() * musicalNotes.length)];
            
            particle.textContent = note;
            particle.style.cssText = `
                position: fixed;
                font-size: ${Utils.random(12, 18)}px;
                color: var(--gold);
                pointer-events: none;
                z-index: 1001;
                left: ${rect.left + Math.random() * rect.width}px;
                top: ${rect.top + rect.height / 2}px;
                opacity: 1;
                transition: all 1.2s cubic-bezier(0.25, 0.8, 0.25, 1);
                text-shadow: 0 0 8px rgba(255, 215, 0, 0.8);
                will-change: transform, opacity;
            `;
            
            fragment.appendChild(particle);
            
            setTimeout(() => {
                const angle = (i / 8) * Math.PI * 2;
                const distance = Utils.random(40, 80);
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance - 30;
                
                particle.style.transform = `translate(${x}px, ${y}px) rotate(${Utils.random(-180, 180)}deg) scale(0)`;
                particle.style.opacity = '0';
            }, 100);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 1300);
        }
        
        document.body.appendChild(fragment);
    }

    createSoundWaves(logo) {
        const rect = logo.getBoundingClientRect();
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < 3; i++) {
            const wave = Utils.createElement('div');
            
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
                will-change: transform, opacity;
            `;
            
            fragment.appendChild(wave);
            
            setTimeout(() => {
                if (wave.parentNode) {
                    wave.remove();
                }
            }, 1200);
        }
        
        document.body.appendChild(fragment);
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
        const particle = Utils.createElement('div');
        
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
            will-change: transform, opacity;
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.style.transform = `translateY(20px) scale(0)`;
            particle.style.opacity = '0';
        }, 50);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, 450);
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
        
        return timer;
    }

    static initTitleEffects() {
        const logo = document.querySelector('.main-logo');
        if (logo && window.innerWidth > 768) {
            const originalText = logo.textContent;
            setTimeout(() => {
                TextEffects.typeWriter(logo, originalText, 80);
            }, 800);
        }
    }
}

window.openModal = function(productName, productPrice) {
    const product = products.find(p => p.name === productName);
    if (product && AppState.productManager) {
        AppState.productManager.openPurchaseModal(product);
    }
};

window.closeModal = function() {
    if (AppState.productManager) {
        AppState.productManager.closePurchaseModal();
    }
};

window.closeContactModal = function() {
    if (AppState.productManager) {
        AppState.productManager.closeContactModal();
    }
};

window.changeQuantity = function(delta) {
    if (AppState.productManager) {
        AppState.productManager.changeQuantity(delta);
    }
};

window.contactWhatsApp = function() {
    const message = "Hola! Estoy interesado en crear stickers personalizables. Me gustaría conocer más detalles sobre precios y opciones de diseño.";
    const whatsappUrl = `https://wa.me/593991389251?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
};

window.contactEmail = function() {
    const subject = "Consulta sobre Stickers Personalizables";
    const body = "Hola,\n\nEstoy interesado en crear stickers personalizables. Me gustaría conocer más detalles sobre:\n\n- Precios según formato\n- Opciones de diseño\n- Tiempos de entrega\n- Proceso de personalización\n\nQuedo atento a su respuesta.\n\nSaludos.";
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
};

function initializeSpecialEffects() {
    let mouseParticleTimeout;
    const mouseParticlePool = [];
    const maxPoolSize = 20;
    
    const createMouseParticle = Utils.throttle((x, y) => {
        if (window.innerWidth < 768) return;
        
        let particle = mouseParticlePool.pop();
        
        if (!particle) {
            particle = Utils.createElement('div');
        }
        
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
            will-change: transform, opacity;
        `;
        
        document.body.appendChild(particle);
        
        requestAnimationFrame(() => {
            particle.style.transform = `translate(${(Math.random() - 0.5) * 40}px, ${-20 - Math.random() * 20}px) scale(0)`;
            particle.style.opacity = '0';
        });
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
            if (mouseParticlePool.length < maxPoolSize) {
                mouseParticlePool.push(particle);
            }
        }, 850);
    }, 150);
    
    document.addEventListener('mousemove', (e) => {
        createMouseParticle(e.clientX, e.clientY);
    });
    
    document.addEventListener('click', (e) => {
        if (window.innerWidth > 768) {
            createClickBurst(e.clientX, e.clientY);
        }
    });
}

function createClickBurst(x, y) {
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < 6; i++) {
        const particle = Utils.createElement('div');
        
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
            will-change: transform, opacity;
        `;
        
        fragment.appendChild(particle);
        
        setTimeout(() => {
            const angle = (i / 6) * Math.PI * 2;
            const distance = Utils.random(20, 40);
            const deltaX = Math.cos(angle) * distance;
            const deltaY = Math.sin(angle) * distance;
            
            particle.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0)`;
            particle.style.opacity = '0';
        }, 50);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, 650);
    }
    
    document.body.appendChild(fragment);
}

function initializeApp() {
    try {
        AppState.particleSystem = new ParticleSystem();
        AppState.productManager = new ProductManager();
        AppState.navigationManager = new NavigationManager();
        
        AppState.particleSystem.init();
        AppState.productManager.generateProducts();
        
        if (window.innerWidth > 768) {
            TextEffects.initTitleEffects();
        }
        
        initializeSpecialEffects();
        
        console.log('🌟 Eternals Store initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

const handleResize = Utils.debounce(() => {
    const newParticleCount = window.innerWidth < 768 ? 25 : 40;
    
    if (PARTICLE_CONFIG.count !== newParticleCount) {
        PARTICLE_CONFIG.count = newParticleCount;
        
        if (AppState.particleSystem) {
            AppState.particleSystem.maxParticles = newParticleCount;
        }
    }
}, 250);

document.addEventListener('DOMContentLoaded', initializeApp);
window.addEventListener('resize', handleResize);

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (AppState.isModalOpen) {
            closeModal();
        } else if (AppState.isContactModalOpen) {
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
    if (AppState.particleSystem) {
        AppState.particleSystem.destroy();
    }
});

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

if (window.location.search.includes('debug=true')) {
    console.log('🌟 Eternals Store Debug Mode');
    console.log('Particle count:', PARTICLE_CONFIG.count);
    console.log('Screen width:', window.innerWidth);
    console.log('Products loaded:', products.length);
    console.log('App state:', AppState);
}