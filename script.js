// script.js - ODAM PRODUCCIÓN MUSICAL - SISTEMA DE ONDAS REPARADO
// CORRECCIÓN: Ondas se mueven en tiempo real con la música

// ===== SISTEMA DE AUDIO CON ONDAS EN TIEMPO REAL =====
class AudioPlayerSystem {
    constructor() {
        this.audioElements = new Map();
        this.currentPlaying = null;
        this.isInitialized = false;
        this.animationFrames = new Map();
        this.audioContexts = new Map();
        this.analysers = new Map();
        this.dataArrays = new Map();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🎵 Inicializando sistema de audio con ondas en tiempo real...');
        
        // Inicializar Web Audio API
        this.initWebAudioAPI();
        
        // Encontrar todos los elementos de audio
        document.querySelectorAll('audio').forEach(audio => {
            const audioId = audio.id;
            this.audioElements.set(audioId, audio);
            this.setupAudioEvents(audioId, audio);
        });

        // Configurar botones de reproducción
        this.setupPlayButtons();
        
        this.isInitialized = true;
        console.log('✅ Sistema de audio con ondas inicializado correctamente');
    }

    initWebAudioAPI() {
        // Crear contexto de audio principal
        try {
            this.mainAudioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('🔊 Web Audio API inicializada');
        } catch (error) {
            console.error('❌ Web Audio API no soportada:', error);
            return false;
        }
        return true;
    }

    setupAudioAnalyser(audioId, audioElement) {
        if (!this.mainAudioContext) return;

        try {
            // Crear contexto de audio para este elemento
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaElementSource(audioElement);
            const analyser = audioContext.createAnalyser();
            
            // Configurar analizador
            analyser.fftSize = 64;
            analyser.smoothingTimeConstant = 0.8;
            
            // Conectar nodos
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            
            // Crear array para datos de frecuencia
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            // Guardar referencias
            this.audioContexts.set(audioId, audioContext);
            this.analysers.set(audioId, analyser);
            this.dataArrays.set(audioId, dataArray);
            
        } catch (error) {
            console.warn('⚠️ No se pudo crear analizador para:', audioId, error);
        }
    }

    setupAudioEvents(audioId, audio) {
        // Configurar analizador cuando el audio esté listo
        audio.addEventListener('loadedmetadata', () => {
            this.setupAudioAnalyser(audioId, audio);
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
        // Reanudar contexto de audio si está suspendido
        const audioContext = this.audioContexts.get(audioId);
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }

        audio.play().then(() => {
            this.currentPlaying = audio;
            this.setPlayingState(audioId, true);
            this.startWaveAnimation(audioId);
        }).catch(error => {
            console.error('Error al reproducir audio:', error);
            // Fallback sin Web Audio API
            audio.play().catch(e => {
                console.error('Error persistente al reproducir:', e);
            });
        });
    }

    pauseAudio(audioId, audio) {
        audio.pause();
        this.setPlayingState(audioId, false);
        this.stopWaveAnimation(audioId);
        
        if (this.currentPlaying === audio) {
            this.currentPlaying = null;
        }
    }

    startWaveAnimation(audioId) {
        // Detener animación anterior si existe
        this.stopWaveAnimation(audioId);
        
        const analyser = this.analysers.get(audioId);
        const dataArray = this.dataArrays.get(audioId);
        const card = document.getElementById(audioId)?.closest('.project-card');
        
        if (!analyser || !dataArray || !card) {
            // Fallback: animación simulada si no hay analizador
            this.startSimulatedWaveAnimation(audioId);
            return;
        }

        const waveform = card.querySelector('.audio-waveform');
        const waveBars = waveform?.querySelectorAll('.wave-bar');
        
        if (!waveBars || waveBars.length === 0) return;

        const animate = () => {
            analyser.getByteFrequencyData(dataArray);
            
            // Dividir los datos de frecuencia entre las barras
            const bandSize = Math.floor(dataArray.length / waveBars.length);
            
            waveBars.forEach((bar, index) => {
                const start = index * bandSize;
                const end = start + bandSize;
                let sum = 0;
                
                for (let j = start; j < end; j++) {
                    sum += dataArray[j];
                }
                
                const average = sum / bandSize;
                // Convertir valor de frecuencia (0-255) a altura (20% - 100%)
                const height = 20 + (average / 255) * 80;
                bar.style.height = height + '%';
                bar.style.opacity = 0.6 + (average / 255) * 0.4;
            });

            const animationId = requestAnimationFrame(animate);
            this.animationFrames.set(audioId, animationId);
        };

        animate();
    }

    startSimulatedWaveAnimation(audioId) {
        // Animación de fallback cuando Web Audio API no está disponible
        const card = document.getElementById(audioId)?.closest('.project-card');
        const waveform = card?.querySelector('.audio-waveform');
        const waveBars = waveform?.querySelectorAll('.wave-bar');
        
        if (!waveBars) return;

        let startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            
            waveBars.forEach((bar, index) => {
                // Simular movimiento de ondas con función seno
                const timeOffset = index * 100;
                const wave = Math.sin((elapsed + timeOffset) / 200);
                const height = 30 + Math.abs(wave) * 70; // 30% a 100%
                bar.style.height = height + '%';
                bar.style.opacity = 0.7 + Math.abs(wave) * 0.3;
            });

            const animationId = requestAnimationFrame(animate);
            this.animationFrames.set(audioId, animationId);
        };

        animate();
    }

    stopWaveAnimation(audioId) {
        const animationId = this.animationFrames.get(audioId);
        if (animationId) {
            cancelAnimationFrame(animationId);
            this.animationFrames.delete(audioId);
        }

        // Resetear barras a estado inicial
        const card = document.getElementById(audioId)?.closest('.project-card');
        const waveBars = card?.querySelectorAll('.wave-bar');
        
        if (waveBars) {
            waveBars.forEach(bar => {
                bar.style.height = '20%';
                bar.style.opacity = '0.6';
            });
        }
    }

    setPlayingState(audioId, isPlaying) {
        const card = document.getElementById(audioId)?.closest('.project-card');
        if (!card) return;

        const btn = card.querySelector('.audio-play-btn');
        const player = card.querySelector('.audio-player-mini');

        if (btn) {
            btn.innerHTML = isPlaying ? 
                '<i class="fas fa-pause" aria-hidden="true"></i>' : 
                '<i class="fas fa-play" aria-hidden="true"></i>';
        }

        if (player) {
            player.classList.toggle('playing', isPlaying);
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
            const currentTime = this.formatTime(audio.currentTime);
            const duration = this.formatTime(audio.duration);
            timeDisplay.textContent = `${currentTime} / ${duration}`;
        }
    }

    updateDuration(audioId) {
        const audio = this.audioElements.get(audioId);
        const card = document.getElementById(audioId)?.closest('.project-card');
        if (!audio || !card) return;

        const timeDisplay = card.querySelector('.audio-time');
        if (timeDisplay && audio.duration) {
            const duration = this.formatTime(audio.duration);
            timeDisplay.textContent = `0:00 / ${duration}`;
        }
    }

    resetPlayer(audioId) {
        const audio = this.audioElements.get(audioId);
        if (audio) {
            audio.currentTime = 0;
            this.setPlayingState(audioId, false);
            this.stopWaveAnimation(audioId);
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

    preloadAudios() {
        this.audioElements.forEach((audio, audioId) => {
            audio.load();
        });
    }
}

// ===== SISTEMA GLOBAL ODAM (MANTENIDO) =====
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
            this.initMobileMenu();
            this.initSmoothScroll();
            this.initHeaderScroll();
            this.initAnimations();

            // Inicializar sistema de audio SOLO en página de proyectos
            if (this.currentPage === 'proyectos') {
                window.audioSystem = new AudioPlayerSystem();
                window.audioSystem.init();
                
                setTimeout(() => {
                    window.audioSystem.preloadAudios();
                }, 1000);
            }

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

        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = 'auto';
            });
        });

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
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                header.style.transition = 'all 0.3s ease';
            }, 10);
        });
    }

    initAnimations() {
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
        console.log('📊 Sistema de estadísticas listo');
    }
}

// ===== INICIALIZACIÓN PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function() {
    if (window.odamSystem) return;
    
    window.odamSystem = new ODAMGlobalSystem();
    window.odamSystem.init();
});

// ===== COMPATIBILIDAD =====
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

// ===== PARTÍCULAS =====
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
