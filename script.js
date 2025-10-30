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

    // ===== SISTEMAS BÁSICOS =====
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

// ===== SISTEMA DE AUDIO REPARADO =====
class AudioPlayerSystem {
    constructor() {
        this.audioPlayers = new Map();
        this.currentlyPlaying = null;
        this.init();
    }

    init() {
        console.log('🎵 Sistema de audio inicializado');
        this.initializeAllAudioPlayers();
    }

    initializeAllAudioPlayers() {
        const audioConfigs = [
            { card: 'project-tu-me-sostendras', audio: 'audio-tu-me-sostendras' },
            { card: 'project-renovados-en-tu-voluntad', audio: 'audio-renovados-en-tu-voluntad' },
            { card: 'project-en-ti-confio-senor', audio: 'audio-en-ti-confio-senor' },
            { card: 'project-el-diezmo-es-del-senor-version-bachata', audio: 'audio-el-diezmo-es-del-senor-version-bachata' },
            { card: 'project-jonas-y-el-gran-pez', audio: 'audio-jonas-y-el-gran-pez' },
            { card: 'project-el-hijo-de-manoa', audio: 'audio-el-hijo-de-manoa' }
        ];

        audioConfigs.forEach(config => {
            this.setupAudioPlayer(config.card, config.audio);
        });

        console.log(`✅ ${audioConfigs.length} reproductores de audio inicializados`);
    }

    setupAudioPlayer(cardId, audioId) {
        const card = document.getElementById(cardId);
        const audio = document.getElementById(audioId);
        
        if (!card || !audio) {
            console.warn(`❌ No se pudo encontrar: ${cardId} o ${audioId}`);
            return;
        }

        const player = {
            card,
            audio,
            playBtn: card.querySelector('.audio-play-btn'),
            progressBar: card.querySelector('.audio-progress'),
            audioTime: card.querySelector('.audio-time'),
            isPlaying: false
        };

        if (!player.playBtn) {
            console.warn(`❌ Botón de play no encontrado en: ${cardId}`);
            return;
        }

        this.audioPlayers.set(audioId, player);
        this.bindPlayerEvents(player, audioId);
    }

    bindPlayerEvents(player, audioId) {
        const { audio, playBtn, progressBar, audioTime } = player;

        const formatTime = (seconds) => {
            if (isNaN(seconds)) return '0:00';
            const min = Math.floor(seconds / 60);
            const sec = Math.floor(seconds % 60);
            return `${min}:${sec < 10 ? '0' : ''}${sec}`;
        };

        const updateProgress = () => {
            if (audio.duration && progressBar) {
                const percent = (audio.currentTime / audio.duration) * 100;
                progressBar.style.width = `${percent}%`;
            }
            if (audioTime) {
                audioTime.textContent = formatTime(audio.currentTime);
            }
        };

        const togglePlay = async (e) => {
            if (e) e.stopPropagation();

            if (player.isPlaying) {
                audio.pause();
                player.isPlaying = false;
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
                this.currentlyPlaying = null;
                return;
            }

            // Pausar cualquier audio reproduciéndose
            if (this.currentlyPlaying && this.currentlyPlaying !== audioId) {
                const previousPlayer = this.audioPlayers.get(this.currentlyPlaying);
                if (previousPlayer) {
                    previousPlayer.audio.pause();
                    previousPlayer.isPlaying = false;
                    previousPlayer.playBtn.innerHTML = '<i class="fas fa-play"></i>';
                }
            }

            try {
                await audio.play();
                player.isPlaying = true;
                this.currentlyPlaying = audioId;
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                
            } catch (error) {
                console.error('❌ Error reproduciendo audio:', error);
                playBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            }
        };

        playBtn.addEventListener('click', togglePlay);

        audio.addEventListener('timeupdate', updateProgress);
        
        audio.addEventListener('ended', () => {
            audio.currentTime = 0;
            player.isPlaying = false;
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            if (progressBar) progressBar.style.width = '0%';
            if (audioTime) audioTime.textContent = '0:00';
            this.currentlyPlaying = null;
        });

        audio.addEventListener('loadedmetadata', () => {
            if (audioTime) audioTime.textContent = '0:00';
        });
    }
}

// ===== CLASES RESTANTES (mantener tus originales) =====
class CompleteBibleRV1960 {
    constructor() {
        this.verses = this.getBibleDatabase();
    }

    getBibleDatabase() {
        return [
            { book: "Génesis", chapter: 1, verse: 1, text: "En el principio creó Dios los cielos y la tierra." },
            { book: "Salmos", chapter: 23, verse: 1, text: "El Señor es mi pastor; nada me faltará." },
            { book: "Juan", chapter: 3, verse: 16, text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna." }
        ];
    }

    getRandomVerse() {
        if (this.verses.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * this.verses.length);
        return this.verses[randomIndex];
    }
}

class PWAManager {
    constructor() {
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.init();
    }

    init() {
        if (!this.isMobile) return;
        this.setupInstallPrompt();
    }

    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
        });
    }
}

class FormHandler {
    constructor() {
        this.init();
    }

    init() {
        this.setupFormHandlers();
    }

    setupFormHandlers() {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactForm(contactForm);
            });
        }
    }

    async handleContactForm(form) {
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;

        // Simular envío (reemplazar con tu endpoint real)
        setTimeout(() => {
            this.showNotification('✅ Solicitud enviada correctamente', 'success');
            form.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }

    showNotification(message, type = 'info') {
        console.log(`${type}: ${message}`);
    }

    openContactModal() {
        const modal = document.getElementById('contact-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
}

class LoadingSystem {
    constructor() {
        this.progressBar = document.getElementById('loading-progress');
    }

    init() {
        if (!this.progressBar) return;
        setTimeout(() => this.completeLoading(), 1000);
    }

    completeLoading() {
        if (this.progressBar) {
            this.progressBar.classList.remove('loading');
        }
    }
}

class AnimationSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                }
            });
        });

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    }
}

// ===== INICIALIZACIÓN PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function() {
    if (window.odamSystem) return;
    window.odamSystem = new ODAMGlobalSystem();
    window.odamSystem.init();
});
