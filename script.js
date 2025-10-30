// script.js - ODAM PRODUCCIÓN MUSICAL - SISTEMA MULTIPÁGINA REPARADO
// CORRECCIONES: Todos los sistemas funcionando en multipágina + Responsividad

// ===== INICIALIZACIÓN GLOBAL MEJORADA =====
class ODAMGlobalSystem {
    constructor() {
        this.initialized = false;
        this.currentPage = this.getCurrentPage();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('servicios')) return 'servicios';
        if (path.includes('proyectos')) return 'proyectos';
        if (path.includes('inspiracion')) return 'inspiracion';
        if (path.includes('interaccion')) return 'interaccion';
        if (path.includes('contacto')) return 'contacto';
        return 'index';
    }

    async init() {
        if (this.initialized) return;
        
        console.log(`🎵 ODAM - Inicializando página: ${this.currentPage}`);
        
        try {
            // Sistema de carga
            this.loadingSystem = new LoadingSystem();
            this.loadingSystem.init();

            // Sistema de animaciones
            this.animationSystem = new AnimationSystem();

            // Sistema de audio (solo en proyectos)
            if (this.currentPage === 'proyectos') {
                window.audioSystem = new AudioPlayerSystem();
            }

            // PWA Manager
            window.pwaManager = new PWAManager();

            // Form Handler
            window.formHandler = new FormHandler();

            // Optimizar event listeners
            this.optimizeEventListeners();

            // Inicializar componentes según la página
            this.initPageSpecificSystems();

            this.initialized = true;
            console.log('✅ ODAM - Sistema completamente inicializado');

        } catch (error) {
            console.error('❌ Error durante la inicialización:', error);
        }
    }

    initPageSpecificSystems() {
        // Sistemas que siempre se inicializan
        this.initMobileMenu();
        this.initSmoothScroll();
        this.initHeaderScroll();
        this.fixWhiteButton();

        // Sistemas específicos por página
        switch (this.currentPage) {
            case 'inspiracion':
                this.initBibleVerses();
                break;
            case 'interaccion':
                this.initStatsSystem();
                break;
            case 'proyectos':
                // Audio ya inicializado
                break;
        }
    }

    optimizeEventListeners() {
        document.addEventListener('click', function(e) {
            // Acordeones de servicios
            if (e.target.closest('.service-accordion-header')) {
                const header = e.target.closest('.service-accordion-header');
                const item = header.parentElement;
                const isActive = item.classList.contains('active');
                
                document.querySelectorAll('.service-accordion-item').forEach(accItem => {
                    accItem.classList.remove('active');
                });
                
                if (!isActive) {
                    item.classList.add('active');
                }
            }
            
            // Cerrar modal
            if (e.target.classList.contains('modal-close') || 
                e.target.closest('.modal-close') ||
                (e.target.id === 'contact-modal' && e.target.classList.contains('active'))) {
                const modal = document.getElementById('contact-modal');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            }

            // Abrir modal de contacto
            if (e.target.classList.contains('open-contact-modal') || 
                e.target.closest('.open-contact-modal')) {
                e.preventDefault();
                if (window.formHandler) {
                    window.formHandler.openContactModal();
                }
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modal = document.getElementById('contact-modal');
                if (modal && modal.classList.contains('active')) {
                    modal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            }
        });
    }

    // ===== SISTEMAS BÁSICOS (mantener tus funciones originales pero corregidas) =====
    initMobileMenu() {
        const toggle = document.getElementById('site-nav-toggle');
        const nav = document.getElementById('site-nav');
        
        if (!toggle || !nav) {
            console.warn('❌ Elementos del menú móvil no encontrados');
            return;
        }

        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const expanded = this.getAttribute('aria-expanded') === 'true';
            
            this.setAttribute('aria-expanded', String(!expanded));
            nav.classList.toggle('open');
            document.body.style.overflow = expanded ? 'auto' : 'hidden';
        });

        // Cerrar menú al hacer clic en enlaces
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = 'auto';
            });
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (nav.classList.contains('open') && 
                !nav.contains(e.target) && 
                !toggle.contains(e.target)) {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = 'auto';
            }
        });

        // Cerrar menú al redimensionar a desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && nav.classList.contains('open')) {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = 'auto';
            }
        });
    }

    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    initHeaderScroll() {
        const header = document.querySelector('header');
        if (!header) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    fixWhiteButton() {
        const whiteButton = document.querySelector('.nav-toggle');
        if (whiteButton && window.innerWidth > 768) {
            whiteButton.style.display = 'none';
        }
    }

    initBibleVerses() {
        const bibleVerseElement = document.getElementById('bible-verse');
        if (!bibleVerseElement) return;

        const bible = new CompleteBibleRV1960();
        
        function displayRandomVerse() {
            const verse = bible.getRandomVerse();
            if (verse) {
                bibleVerseElement.innerHTML = `
                    <div class="verse-content">
                        <div class="verse-text">"${verse.text}"</div>
                        <div class="verse-reference">${verse.book} ${verse.chapter}:${verse.verse}</div>
                    </div>
                `;
            }
        }

        // Mostrar versículo inicial
        displayRandomVerse();

        // Botón para nuevo versículo
        const newVerseBtn = document.getElementById('new-verse-btn');
        if (newVerseBtn) {
            newVerseBtn.addEventListener('click', displayRandomVerse);
        }
    }

    initStatsSystem() {
        if (typeof StatsSystem !== 'undefined') {
            window.statsSystem = new StatsSystem();
            window.statsSystem.init();
        }
    }
}

// ===== INICIALIZACIÓN PRINCIPAL REPARADA =====
document.addEventListener('DOMContentLoaded', function() {
    // Evitar doble inicialización
    if (window.odamSystem) return;
    
    window.odamSystem = new ODAMGlobalSystem();
    window.odamSystem.init();
});

// ===== MANTENER TUS CLASES ORIGINALES PERO CORREGIDAS =====
// (Tus clases AudioPlayerSystem, PWAManager, FormHandler, etc. permanecen igual)
// ... [todo el resto de tu código original de AudioPlayerSystem, PWAManager, etc.] ...

// ===== SISTEMA DE VERSÍCULOS BÍBLICOS - CORREGIDO =====
class CompleteBibleRV1960 {
    constructor() {
        this.verses = this.getBibleDatabase();
        this.usedIndices = new Set();
    }

    getBibleDatabase() {
        // Base de datos básica - se expandirá con bible-rv1960.js
        return [
            { book: "Génesis", chapter: 1, verse: 1, text: "En el principio creó Dios los cielos y la tierra." },
            { book: "Salmos", chapter: 23, verse: 1, text: "El Señor es mi pastor; nada me faltará." },
            { book: "Juan", chapter: 3, verse: 16, text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna." },
            // ... agregar más versículos básicos
        ];
    }

    getRandomVerse() {
        if (this.verses.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * this.verses.length);
        return this.verses[randomIndex];
    }
}

// ===== CARGAR SISTEMAS EXTERNOS =====
window.addEventListener('load', function() {
    // Inicializar partículas
    if (typeof particlesJS !== 'undefined' && document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            particles: {
                number: { value: 40, density: { enable: true, value_area: 800 } },
                color: { value: "#c8a25f" },
                shape: { type: "circle" },
                opacity: { value: 0.3, random: true },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#c8a25f",
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out"
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "grab" },
                    onclick: { enable: true, mode: "push" }
                }
            },
            retina_detect: true
        });
    }
});
