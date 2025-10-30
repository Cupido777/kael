// script.js - ODAM PRODUCCIÓN MUSICAL - SISTEMA COMPLETO REPARADO
// CORRECCIÓN CRÍTICA: Sistema de audio completamente funcional

// ===== SISTEMA DE AUDIO COMPLETO Y FUNCIONAL =====
class AudioPlayerSystem {
    constructor() {
        this.audioElements = new Map();
        this.currentPlaying = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🎵 Inicializando sistema de audio...');
        
        // Encontrar todos los elementos de audio en la página
        document.querySelectorAll('audio').forEach(audio => {
            const audioId = audio.id;
            this.audioElements.set(audioId, audio);
            
            // Configurar eventos para cada audio
            this.setupAudioEvents(audioId, audio);
        });

        // Configurar botones de reproducción
        this.setupPlayButtons();
        
        this.isInitialized = true;
        console.log('✅ Sistema de audio inicializado correctamente');
    }

    setupAudioEvents(audioId, audio) {
        audio.addEventListener('loadedmetadata', () => {
            this.updateDuration(audioId);
        });

        audio.addEventListener('timeupdate', () => {
            this.updateProgress(audioId);
        });

        audio.addEventListener('ended', () => {
            this.resetPlayer(audioId);
        });

        audio.addEventListener('error', (e) => {
            console.error(`❌ Error cargando audio ${audioId}:`, e);
            this.showErrorState(audioId);
        });
    }

    setupPlayButtons() {
        document.querySelectorAll('.audio-play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.project-card');
                if (card) {
                    const audioElement = card.querySelector('audio');
                    if (audioElement) {
                        const audioId = audioElement.id;
                        this.togglePlay(audioId);
                    }
                }
            });
        });
    }

    togglePlay(audioId) {
        const audio = this.audioElements.get(audioId);
        if (!audio) {
            console.error(`Audio no encontrado: ${audioId}`);
            return;
        }

        // Pausar audio actualmente reproduciéndose
        if (this.currentPlaying && this.currentPlaying !== audio) {
            this.currentPlaying.pause();
            this.resetPlayer(this.currentPlaying.id);
        }

        if (audio.paused) {
            this.playAudio(audioId, audio);
        } else {
            this.pauseAudio(audioId, audio);
        }
    }

    playAudio(audioId, audio) {
        audio.play().then(() => {
            this.currentPlaying = audio;
            this.setPlayingState(audioId, true);
        }).catch(error => {
            console.error('Error al reproducir audio:', error);
            // Fallback: intentar cargar y reproducir nuevamente
            audio.load();
            setTimeout(() => {
                audio.play().catch(e => {
                    console.error('Error persistente al reproducir:', e);
                });
            }, 100);
        });
    }

    pauseAudio(audioId, audio) {
        audio.pause();
        this.setPlayingState(audioId, false);
        if (this.currentPlaying === audio) {
            this.currentPlaying = null;
        }
    }

    setPlayingState(audioId, isPlaying) {
        const card = document.getElementById(audioId)?.closest('.project-card');
        if (!card) return;

        const btn = card.querySelector('.audio-play-btn');
        const waveform = card.querySelector('.audio-waveform');
        const player = card.querySelector('.audio-player-mini');

        if (btn) {
            btn.innerHTML = isPlaying ? 
                '<i class="fas fa-pause" aria-hidden="true"></i>' : 
                '<i class="fas fa-play" aria-hidden="true"></i>';
        }

        if (player) {
            player.classList.toggle('playing', isPlaying);
        }

        if (waveform) {
            waveform.classList.toggle('playing', isPlaying);
        }
    }

    updateProgress(audioId) {
        const audio = this.audioElements.get(audioId);
        const card = document.getElementById(audioId)?.closest('.project-card');
        if (!audio || !card) return;

        const progressBar = card.querySelector('.audio-progress');
        const timeDisplay = card.querySelector('.audio-time');

        if (audio.duration && progressBar) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = percent + '%';
        }

        if (timeDisplay) {
            timeDisplay.textContent = this.formatTime(audio.currentTime);
        }
    }

    updateDuration(audioId) {
        const audio = this.audioElements.get(audioId);
        const card = document.getElementById(audioId)?.closest('.project-card');
        if (!audio || !card) return;

        const timeDisplay = card.querySelector('.audio-time');
        if (timeDisplay && audio.duration) {
            timeDisplay.textContent = this.formatTime(audio.currentTime) + ' / ' + this.formatTime(audio.duration);
        }
    }

    resetPlayer(audioId) {
        const audio = this.audioElements.get(audioId);
        if (audio) {
            audio.currentTime = 0;
            this.setPlayingState(audioId, false);
            this.updateProgress(audioId);
        }
    }

    showErrorState(audioId) {
        const card = document.getElementById(audioId)?.closest('.project-card');
        if (card) {
            const timeDisplay = card.querySelector('.audio-time');
            if (timeDisplay) {
                timeDisplay.textContent = 'Error';
                timeDisplay.style.color = '#ff6b6b';
            }
        }
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return min + ':' + (sec < 10 ? '0' + sec : sec);
    }

    // Método para precargar audios
    preloadAudios() {
        this.audioElements.forEach((audio, audioId) => {
            audio.load();
        });
    }
}

// ===== SISTEMA GLOBAL ODAM =====
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
            // Inicializar sistemas básicos
            this.initMobileMenu();
            this.initSmoothScroll();
            this.initHeaderScroll();
            this.initAnimations();

            // Inicializar sistema de audio SOLO en página de proyectos
            if (this.currentPage === 'proyectos') {
                window.audioSystem = new AudioPlayerSystem();
                window.audioSystem.init();
                
                // Precargar audios después de un breve delay
                setTimeout(() => {
                    window.audioSystem.preloadAudios();
                }, 1000);
            }

            // Inicializar sistemas específicos de página
            this.initPageSpecificSystems();

            this.initialized = true;
            console.log('✅ ODAM - Sistema completamente inicializado');

        } catch (error) {
            console.error('❌ Error durante la inicialización:', error);
        }
    }

    initMobileMenu() {
        const toggle = document.getElementById('site-nav-toggle');
        const nav = document.getElementById('site-nav');
        
        if (!toggle || !nav) return;

        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', String(!expanded));
            nav.classList.toggle('open');
            document.body.style.overflow = expanded ? 'auto' : 'hidden';
        });

        // Cerrar menú al hacer clic en enlaces
        nav.querySelectorAll('a').forEach(link => {
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

        let scrollTimeout;
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
            
            // Optimización de performance
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                header.style.transition = 'all 0.3s ease';
            }, 10);
        });
    }

    initAnimations() {
        // Sistema de animaciones fade-in
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    }

    initPageSpecificSystems() {
        switch (this.currentPage) {
            case 'inspiracion':
                this.initBibleVerses();
                break;
            case 'interaccion':
                this.initStatsSystem();
                break;
        }
    }

    initBibleVerses() {
        const bibleVerseElement = document.getElementById('bible-verse');
        if (!bibleVerseElement) return;

        // Sistema básico de versículos
        const verses = [
            { text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.", reference: "Juan 3:16" },
            { text: "El Señor es mi pastor; nada me faltará.", reference: "Salmos 23:1" },
            { text: "Echad toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros.", reference: "1 Pedro 5:7" }
        ];

        function displayRandomVerse() {
            const randomVerse = verses[Math.floor(Math.random() * verses.length)];
            bibleVerseElement.innerHTML = `
                <div class="verse-content">
                    <div class="verse-text">"${randomVerse.text}"</div>
                    <div class="verse-reference">${randomVerse.reference}</div>
                </div>
            `;
        }

        displayRandomVerse();

        const newVerseBtn = document.getElementById('new-verse-btn');
        if (newVerseBtn) {
            newVerseBtn.addEventListener('click', displayRandomVerse);
        }
    }

    initStatsSystem() {
        // Placeholder para sistema de estadísticas
        console.log('📊 Sistema de estadísticas listo');
    }
}

// ===== INICIALIZACIÓN PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function() {
    // Evitar doble inicialización
    if (window.odamSystem) return;
    
    window.odamSystem = new ODAMGlobalSystem();
    window.odamSystem.init();
});

// ===== COMPATIBILIDAD Y POLYFILLS =====
// Asegurar compatibilidad con navegadores antiguos
if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
        var el = this;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}

// ===== INICIALIZACIÓN DE PARTÍCULAS =====
window.addEventListener('load', function() {
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
