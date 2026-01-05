/**
 * Portfolio Optimization v2.0
 * Optimizado para máximo rendimiento en dispositivos móviles y desktop
 */

(function() {
    'use strict';
    
    // ============================================
    // CONFIGURACIÓN CENTRALIZADA
    // ============================================
    const CONFIG = {
        particles: {
            count: 35, // Reducido de 50 a 35 para mejor rendimiento
            minSize: 1,
            maxSize: 4,
            minDuration: 8,
            maxDuration: 13,
            maxDelay: 5
        },
        orbit: {
            speed: 0.005,
            bobbingIntensity: 10,
            bobbingSpeed: 2,
            iconPadding: 30
        },
        resize: {
            debounceDelay: 150
        }
    };

    // ============================================
    // MÓDULO DE PARTÍCULAS
    // ============================================
    const ParticleSystem = {
        init() {
            const container = document.getElementById('particle-container');
            if (!container) return;

            const fragment = document.createDocumentFragment();

            for (let i = 0; i < CONFIG.particles.count; i++) {
                const particle = this.createParticle();
                fragment.appendChild(particle);
            }

            // Una sola manipulación del DOM
            container.appendChild(fragment);
        },

        createParticle() {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * (CONFIG.particles.maxSize - CONFIG.particles.minSize) + CONFIG.particles.minSize;
            const duration = Math.random() * (CONFIG.particles.maxDuration - CONFIG.particles.minDuration) + CONFIG.particles.minDuration;
            const delay = Math.random() * CONFIG.particles.maxDelay;
            const left = Math.random() * 100;

            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${left}%;
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
            `;

            return particle;
        }
    };

    // ============================================
    // MÓDULO DE ÓRBITA
    // ============================================
    const OrbitSystem = {
        container: null,
        icons: null,
        iconCount: 0,
        angle: 0,
        radiusX: 0,
        radiusY: 0,
        animationId: null,

        init() {
            this.container = document.getElementById('orbit-container');
            this.icons = document.querySelectorAll('.tech-icon');
            
            if (!this.container || this.icons.length === 0) return;

            this.iconCount = this.icons.length;
            this.calculateDimensions();
            this.setupResizeHandler();
            this.startAnimation();
        },

        calculateDimensions() {
            const rect = this.container.getBoundingClientRect();
            this.radiusX = rect.width / 2 - CONFIG.orbit.iconPadding;
            this.radiusY = rect.height / 2 - CONFIG.orbit.iconPadding;
        },

        setupResizeHandler() {
            let resizeTimeout;
            const debouncedResize = () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.calculateDimensions();
                }, CONFIG.resize.debounceDelay);
            };

            window.addEventListener('resize', debouncedResize, { passive: true });
        },

        animate() {
            this.angle += CONFIG.orbit.speed;
            const angleStep = (2 * Math.PI) / this.iconCount;

            this.icons.forEach((icon, index) => {
                const iconAngle = this.angle + (index * angleStep);
                const x = this.radiusX * Math.cos(iconAngle);
                const y = this.radiusY * Math.sin(iconAngle);
                const bobbing = Math.sin(this.angle * CONFIG.orbit.bobbingSpeed + index) * CONFIG.orbit.bobbingIntensity;

                // translate3d activa aceleración por hardware (GPU)
                icon.style.transform = `translate3d(${x}px, ${y + bobbing}px, 0)`;
            });

            this.animationId = requestAnimationFrame(() => this.animate());
        },

        startAnimation() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
            this.animate();
        }
    };

   // ============================================
// MÓDULO DE NAVEGACIÓN CON TRANSICIONES SUAVES
// ============================================
const NavigationSystem = {
    navContainer: null,
    contentSections: null,
    activeSection: null,
    activeButton: null,
    isTransitioning: false,

    init() {
        const navButtons = document.querySelectorAll('.nav-btn');
        if (navButtons.length === 0) return;

        this.navContainer = navButtons[0].closest('nav') || navButtons[0].parentElement;
        this.contentSections = document.querySelectorAll('.content-section');
        
        // Encontrar la sección activa inicial
        this.activeSection = document.querySelector('.content-section:not(.hidden)');
        this.activeButton = document.querySelector('.nav-btn.active');

        // Inicializar la primera sección como activa
        if (this.activeSection) {
            this.activeSection.classList.add('active');
            this.activeSection.classList.remove('hidden');
        }

        this.setupEventDelegation();
        this.initializeButtonStates(navButtons);
    },

    setupEventDelegation() {
        this.navContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.nav-btn');
            
            if (!button || button === this.activeButton || this.isTransitioning) return;

            this.handleNavigation(button);
        });
    },

    initializeButtonStates(buttons) {
        buttons.forEach(btn => {
            if (!btn.classList.contains('active')) {
                btn.classList.add('nav-btn-inactive');
            }
        });
    },

    handleNavigation(clickedButton) {
        // Prevenir múltiples clics durante la transición
        this.isTransitioning = true;

        // Actualizar botones
        if (this.activeButton) {
            this.activeButton.classList.remove('active');
            this.activeButton.classList.add('nav-btn-inactive');
        }

        clickedButton.classList.remove('nav-btn-inactive');
        clickedButton.classList.add('active');
        this.activeButton = clickedButton;

        // Cambiar contenido con animación
        const targetId = clickedButton.dataset.target;
        this.switchContentWithAnimation(targetId);
    },

    switchContentWithAnimation(targetId) {
        const newSection = document.getElementById(targetId);
        
        if (!newSection || newSection === this.activeSection) {
            this.isTransitioning = false;
            return;
        }

        // Paso 1: Hacer fade-out de la sección actual
        if (this.activeSection) {
            this.activeSection.classList.add('fade-out');
        }

        // Paso 2: Después de 250ms, ocultar la sección anterior y mostrar la nueva
        setTimeout(() => {
            // Ocultar sección anterior
            if (this.activeSection) {
                this.activeSection.classList.remove('active', 'fade-out');
                this.activeSection.classList.add('hidden');
            }

            // Mostrar nueva sección
            newSection.classList.remove('hidden');
            
            // Trigger de reflow para que la animación funcione
            newSection.offsetHeight;
            
            // Activar animación de entrada
            newSection.classList.add('active');
            
            this.activeSection = newSection;

            // Scroll suave hacia la nueva sección (solo si está fuera de vista)
            const rect = newSection.getBoundingClientRect();
            if (rect.top < 0 || rect.bottom > window.innerHeight) {
                newSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }

            // Permitir nuevas transiciones después de completar
            setTimeout(() => {
                this.isTransitioning = false;
            }, 400);

        }, 250); // Tiempo del fade-out optimizado
    }
};

    // ============================================
    // INICIALIZACIÓN PRINCIPAL
    // ============================================
    function initializePortfolio() {
        ParticleSystem.init();
        OrbitSystem.init();
        NavigationSystem.init();
    }

    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePortfolio);
    } else {
        initializePortfolio();
    }

})();
