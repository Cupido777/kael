// script.js - ODAM PRODUCCIÓN MUSICAL - SISTEMA COMPLETO CON BIBLIA RV1960
// CORRECCIONES: Audio funcionando + Biblia completa + Sistema de estadísticas + Menú móvil REPARADO + SIN CONTADOR VISUAL

// ===== DETECCIÓN DE DISPOSITIVO =====
const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768;
};

class CompleteBibleRV1960 {
    constructor() {
        // ✅ USA LA NUEVA BASE DE DATOS DE 1,000+ VERSÍCULOS
        if (typeof BibleRV1960Database !== 'undefined') {
            this.verses = new BibleRV1960Database().verses;
            console.log(`📖 Biblia RV1960 EXPANDIDA cargada: ${this.verses.length} versículos disponibles`);
        } else {
            // Fallback a la base original si no existe la nueva
            this.verses = this.getBibleDatabase();
            console.log(`📖 Biblia RV1960 básica cargada: ${this.verses.length} versículos disponibles`);
        }
        this.usedIndices = new Set();
        this.sessionVerses = new Set();
    }

    getBibleDatabase() {
        // Mantener como fallback (tus ~100 versículos originales)
        return [
            { book: "Génesis", chapter: 1, verse: 1, text: "En el principio creó Dios los cielos y la tierra." },
            { book: "Génesis", chapter: 1, verse: 27, text: "Y creó Dios al hombre a su imagen..." },
            // ... tus versículos originales
        ];
    }

    getRandomVerse() {
        if (this.verses.length === 0) return null;

        // Si hemos usado muchos versículos, limpiar algunos del historial de sesión
        if (this.sessionVerses.size > 50) {
            const array = Array.from(this.sessionVerses);
            this.sessionVerses = new Set(array.slice(-30));
        }

        let randomIndex;
        let attempts = 0;
        const maxAttempts = 50;

        // Buscar un versículo no usado recientemente
        do {
            randomIndex = Math.floor(Math.random() * this.verses.length);
            attempts++;
        } while (this.sessionVerses.has(randomIndex) && attempts < maxAttempts);

        this.sessionVerses.add(randomIndex);
        return this.verses[randomIndex];
    }

    getTotalVersesCount() {
        return this.verses.length;
    }

    getVersesReadInSession() {
        return this.sessionVerses.size;
    }
}

// ===== SISTEMA DE TOKENS CSRF MEJORADO =====
class CSRFTokenManager {
    constructor() {
        this.token = null;
        this.tokenExpiry = null;
        this.init();
    }

    async init() {
        await this.generateCSRFToken();
        this.setupTokenRefresh();
    }

    async generateCSRFToken() {
        try {
            const randomBytes = new Uint8Array(32);
            crypto.getRandomValues(randomBytes);
            this.token = Array.from(randomBytes, byte => 
                byte.toString(16).padStart(2, '0')
            ).join('');
            
            this.tokenExpiry = Date.now() + (60 * 60 * 1000);
            
            sessionStorage.setItem('odam-csrf-token', this.token);
            sessionStorage.setItem('odam-csrf-expiry', this.tokenExpiry.toString());
            
            console.log('✅ Token CSRF generado correctamente');
            return this.token;
            
        } catch (error) {
            console.error('❌ Error generando token CSRF:', error);
            this.token = Math.random().toString(36).substring(2) + Date.now().toString(36);
            return this.token;
        }
    }

    validateToken(token) {
        if (!this.token || !this.tokenExpiry) {
            console.warn('⚠️ Token CSRF no inicializado');
            return false;
        }

        if (Date.now() > this.tokenExpiry) {
            console.warn('⚠️ Token CSRF expirado');
            this.generateCSRFToken();
            return false;
        }

        const isValid = token === this.token;
        if (!isValid) {
            console.warn('⚠️ Token CSRF inválido');
        }
        
        return isValid;
    }

    setupTokenRefresh() {
        setInterval(() => {
            this.generateCSRFToken();
        }, 45 * 60 * 1000);
    }

    getToken() {
        if (!this.token || Date.now() > this.tokenExpiry) {
            this.generateCSRFToken();
        }
        return this.token;
    }

    static getStoredToken() {
        try {
            const token = sessionStorage.getItem('odam-csrf-token');
            const expiry = sessionStorage.getItem('odam-csrf-expiry');
            
            if (token && expiry && Date.now() < parseInt(expiry)) {
                return token;
            }
        } catch (error) {
            console.error('Error obteniendo token almacenado:', error);
        }
        return null;
    }
}

// Instancia global del administrador de tokens CSRF
window.csrfTokenManager = new CSRFTokenManager();

class AudioPlayerSystem {
    constructor() {
        this.audioPlayers = new Map();
        this.currentlyPlaying = null;
        this.waveSystems = new Map();
        this.audioContexts = new Map();
        this.userInteracted = false;
        this.init();
    }

    init() {
        console.log('🎵 Sistema de audio inicializado - VERSIÓN REPARADA');
        this.initializeAllAudioPlayers();
        this.setupGlobalEventListeners();
        this.setupUserInteraction();
    }

    setupUserInteraction() {
        const enableAudio = () => {
            this.userInteracted = true;
            console.log('✅ Interacción de usuario detectada - Audio habilitado');
            
            this.audioContexts.forEach((audioContext, audioId) => {
                if (audioContext.state === 'suspended') {
                    audioContext.resume().then(() => {
                        console.log(`✅ AudioContext reanudado para: ${audioId}`);
                    }).catch(console.error);
                }
            });

            document.removeEventListener('click', enableAudio);
            document.removeEventListener('touchstart', enableAudio);
            document.removeEventListener('keydown', enableAudio);
        };

        document.addEventListener('click', enableAudio, { once: true });
        document.addEventListener('touchstart', enableAudio, { once: true });
        document.addEventListener('keydown', enableAudio, { once: true });
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
            waveform: card.querySelector('.audio-waveform'),
            waveBars: card.querySelectorAll('.wave-bar'),
            audioPlayer: card.querySelector('.audio-player-mini'),
            isPlaying: false,
            audioContext: null
        };

        if (!player.playBtn || !player.progressBar || !player.audioTime || !player.waveform || !player.waveBars || !player.audioPlayer) {
            console.warn(`❌ Elementos del reproductor no encontrados en: ${cardId}`);
            return;
        }

        const waveSystem = new InteractiveWaveSystem();
        this.waveSystems.set(audioId, waveSystem);

        this.audioPlayers.set(audioId, player);
        this.bindPlayerEvents(player, audioId);
    }

    bindPlayerEvents(player, audioId) {
        const { audio, playBtn, progressBar, audioTime, waveBars, audioPlayer } = player;
        const waveSystem = this.waveSystems.get(audioId);

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

        const initAudioAnalyser = () => {
            if (!waveSystem.initialized) {
                try {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    if (!AudioContext) {
                        console.warn('AudioContext no soportado');
                        return;
                    }
                    
                    const audioContext = new AudioContext();
                    this.audioContexts.set(audioId, audioContext);
                    
                    if (this.userInteracted && audioContext.state === 'suspended') {
                        audioContext.resume();
                    }
                    
                    waveSystem.initAnalyser(audio, audioContext);
                } catch (error) {
                    console.error('❌ Error inicializando analizador:', error);
                }
            }
        };

        const togglePlay = async (e) => {
            if (e) e.stopPropagation();

            if (player.isPlaying) {
                audio.pause();
                player.isPlaying = false;
                audioPlayer.classList.remove('playing');
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
                waveSystem.stopWaveform();
                this.currentlyPlaying = null;
                return;
            }

            if (this.currentlyPlaying && this.currentlyPlaying !== audioId) {
                const previousPlayer = this.audioPlayers.get(this.currentlyPlaying);
                const previousWaveSystem = this.waveSystems.get(this.currentlyPlaying);
                
                if (previousPlayer && previousWaveSystem) {
                    previousPlayer.audio.pause();
                    previousPlayer.isPlaying = false;
                    previousPlayer.audioPlayer.classList.remove('playing');
                    previousPlayer.playBtn.innerHTML = '<i class="fas fa-play"></i>';
                    previousWaveSystem.stopWaveform();
                }
            }

            try {
                const audioContext = this.audioContexts.get(audioId);
                if (audioContext && audioContext.state === 'suspended') {
                    await audioContext.resume();
                }

                await audio.play();
                
                player.isPlaying = true;
                this.currentlyPlaying = audioId;
                audioPlayer.classList.add('playing');
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                
                setTimeout(() => {
                    initAudioAnalyser();
                    if (waveSystem.initialized) {
                        waveSystem.updateWaveform(waveBars);
                    }
                }, 100);
                
                document.dispatchEvent(new CustomEvent('audioPlay'));
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'audio_play', {
                        event_category: 'media',
                        event_label: audioId,
                        value: 1
                    });
                }
                
            } catch (error) {
                console.error('❌ Error reproduciendo audio:', error);
                
                if (error.name === 'NotAllowedError') {
                    playBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
                    playBtn.style.color = '#ffa500';
                    playBtn.title = 'Haz clic aquí primero para activar el audio';
                    
                    console.log('🔊 Política de autoplay bloqueada - Esperando interacción del usuario');
                    
                    const retryPlay = () => {
                        playBtn.innerHTML = '<i class="fas fa-play"></i>';
                        playBtn.style.color = '';
                        playBtn.title = 'Reproducir';
                        document.removeEventListener('click', retryPlay);
                        togglePlay();
                    };
                    
                    document.addEventListener('click', retryPlay, { once: true });
                } else {
                    playBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
                    playBtn.style.color = '#ff6b6b';
                    playBtn.title = 'Error al reproducir';
                    audioPlayer.classList.add('error');
                }
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'audio_error', {
                        event_category: 'media',
                        event_label: error.message
                    });
                }
            }
        };

        playBtn.addEventListener('click', togglePlay);

        audio.addEventListener('timeupdate', updateProgress);
        
        audio.addEventListener('ended', () => {
            audio.currentTime = 0;
            player.isPlaying = false;
            audioPlayer.classList.remove('playing');
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            if (progressBar) progressBar.style.width = '0%';
            if (audioTime) audioTime.textContent = '0:00';
            waveSystem.stopWaveform();
            this.currentlyPlaying = null;
        });

        audio.addEventListener('loadedmetadata', () => {
            if (audioTime) audioTime.textContent = '0:00';
        });

        audio.addEventListener('canplay', initAudioAnalyser);

        audio.addEventListener('error', (e) => {
            console.error(`Error en audio ${audioId}:`, e);
            playBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            playBtn.style.color = '#ff6b6b';
            audioPlayer.classList.add('error');
        });
    }

    setupGlobalEventListeners() {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.audio-player-mini') && !e.target.closest('.audio-play-btn')) {
                this.pauseAll();
            }
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAll();
            }
        });
    }

    pauseAll() {
        this.audioPlayers.forEach((player, audioId) => {
            if (player.isPlaying) {
                player.audio.pause();
                player.isPlaying = false;
                player.audioPlayer.classList.remove('playing');
                player.playBtn.innerHTML = '<i class="fas fa-play"></i>';
                
                const waveSystem = this.waveSystems.get(audioId);
                if (waveSystem) {
                    waveSystem.stopWaveform();
                }
            }
        });
        this.currentlyPlaying = null;
    }

    destroy() {
        this.pauseAll();
        this.waveSystems.forEach(waveSystem => {
            waveSystem.destroy();
        });
        this.waveSystems.clear();
        this.audioPlayers.clear();
        
        this.audioContexts.forEach(audioContext => {
            audioContext.close().catch(console.error);
        });
        this.audioContexts.clear();
    }
}

// ===== SISTEMA DE ONDAS INTERACTIVAS MEJORADO Y REPARADO =====
class InteractiveWaveSystem {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.animationFrame = null;
        this.initialized = false;
        this.isPlaying = false;
    }

    initAnalyser(audioElement, audioContext = null) {
        if (this.initialized) return;
        
        try {
            if (!audioContext) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) {
                    console.warn('AudioContext no soportado en este navegador');
                    return;
                }
                this.audioContext = new AudioContext();
            } else {
                this.audioContext = audioContext;
            }
            
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    console.log('✅ AudioContext reanudado para waveform');
                }).catch(console.error);
            }
            
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;
            
            const source = this.audioContext.createMediaElementSource(audioElement);
            source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            this.initialized = true;
            console.log('✅ Analizador de audio inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando el analizador de audio:', error);
            this.initialized = false;
        }
    }

    updateWaveform(waveBars) {
        if (!this.analyser || !this.initialized || !waveBars) return;

        try {
            this.analyser.getByteFrequencyData(this.dataArray);
            
            const bandSize = Math.floor(this.dataArray.length / waveBars.length);
            
            waveBars.forEach((bar, index) => {
                const start = index * bandSize;
                let sum = 0;
                
                for (let i = 0; i < bandSize; i++) {
                    sum += this.dataArray[start + i];
                }
                
                const average = sum / bandSize;
                const height = Math.max(10, (average / 256) * 100);
                
                bar.style.height = `${height}%`;
                bar.style.opacity = Math.max(0.4, Math.min(1, average / 150));
                
                const intensity = average / 256;
                if (intensity > 0.8) {
                    bar.style.background = 'linear-gradient(180deg, #ffd700, #ff6b00)';
                } else if (intensity > 0.6) {
                    bar.style.background = 'linear-gradient(180deg, var(--vibrant-gold), #ffa500)';
                } else {
                    bar.style.background = 'linear-gradient(180deg, var(--rich-gold), var(--vibrant-gold))';
                }
            });

            this.animationFrame = requestAnimationFrame(() => this.updateWaveform(waveBars));
        } catch (error) {
            console.error('Error actualizando waveform:', error);
            this.stopWaveform();
        }
    }

    stopWaveform() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    destroy() {
        this.stopWaveform();
        if (this.audioContext) {
            this.audioContext.close().catch(console.error);
        }
        this.initialized = false;
    }
}

// ===== SISTEMA PWA (SOLO PARA MÓVILES) - CORREGIDO =====
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isMobile = isMobileDevice();
        this.init();
    }

    init() {
        if (!this.isMobile) {
            console.log('📱 PWA: Deshabilitado en desktop');
            this.hidePWAElements();
            return;
        }

        this.setupInstallPrompt();
        this.setupBeforeInstallPrompt();
        this.checkStandaloneMode();
        this.setupAppBadge();
    }

    hidePWAElements() {
        const pwaButton = document.getElementById('pwa-install-button');
        const pwaBadges = document.querySelectorAll('.pwa-badge');
        
        if (pwaButton) pwaButton.style.display = 'none';
        pwaBadges.forEach(badge => badge.style.display = 'none');
    }

    setupBeforeInstallPrompt() {
        if (!this.isMobile) return;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPromotion();
            console.log('✅ PWA - BeforeInstallPrompt event captured');
        });
    }

    setupInstallPrompt() {
        if (!this.isMobile) return;

        let installButton = document.getElementById('pwa-install-button');
        if (!installButton) {
            installButton = document.createElement('button');
            installButton.id = 'pwa-install-button';
            installButton.innerHTML = '📱 Instalar App';
            installButton.className = 'mobile-only';
            installButton.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #c8a25f, #d4af37);
                color: black;
                border: none;
                padding: 12px 20px;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(200, 162, 95, 0.4);
                z-index: 1000;
                display: none;
                animation: bounce 2s infinite;
            `;

            installButton.addEventListener('click', () => {
                this.promptInstallation();
            });

            document.body.appendChild(installButton);
        }
    }

    setupAppBadge() {
        if (!this.isMobile) return;

        const appBadge = document.querySelector('.pwa-badge');
        if (appBadge) {
            appBadge.style.cursor = 'pointer';
            appBadge.className = 'pwa-badge mobile-only';
            appBadge.setAttribute('title', 'Haz clic para instalar la app');
            appBadge.addEventListener('click', () => {
                this.promptInstallation();
            });
            
            appBadge.addEventListener('mouseenter', () => {
                appBadge.style.transform = 'scale(1.05)';
                appBadge.style.transition = 'transform 0.2s ease';
            });
            
            appBadge.addEventListener('mouseleave', () => {
                appBadge.style.transform = 'scale(1)';
            });
        }
    }

    showInstallPromotion() {
        if (!this.isMobile) return;

        const installButton = document.getElementById('pwa-install-button');
        if (installButton && this.deferredPrompt) {
            installButton.style.display = 'block';
            
            setTimeout(() => {
                installButton.style.display = 'none';
            }, 10000);
        }

        const appBadge = document.querySelector('.pwa-badge');
        if (appBadge && this.deferredPrompt) {
            appBadge.style.display = 'inline-block';
        }
    }

    async promptInstallation() {
        if (!this.isMobile || !this.deferredPrompt) {
            this.showNotification('⚠️ La instalación solo está disponible en dispositivos móviles.', 'warning');
            return;
        }

        try {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log(`✅ PWA - User response to install prompt: ${outcome}`);
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'pwa_install_prompt', {
                    event_category: 'pwa',
                    event_label: outcome
                });
            }

            if (outcome === 'accepted') {
                this.showNotification('✅ App instalada correctamente', 'success');
            }

            this.deferredPrompt = null;
            
            const installButton = document.getElementById('pwa-install-button');
            if (installButton) {
                installButton.style.display = 'none';
            }

        } catch (error) {
            console.error('Error durante la instalación PWA:', error);
            this.showNotification('❌ Error durante la instalación', 'error');
        }
    }

    checkStandaloneMode() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('✅ PWA - Running in standalone mode');
            document.body.classList.add('pwa-standalone');
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'pwa_launch', {
                    event_category: 'pwa',
                    event_label: 'standalone'
                });
            }
        }
    }

    showNotification(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

// ===== SISTEMA DE FORMULARIO CON BACKEND Y CSRF =====
class FormHandler {
    constructor() {
        this.init();
    }

    async init() {
        this.setupFormHandlers();
        this.setupCSRFProtection();
    }

    setupCSRFProtection() {
        document.addEventListener('DOMContentLoaded', () => {
            this.injectCSRFTokens();
        });
    }

    injectCSRFTokens() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const existingToken = form.querySelector('input[name="csrf_token"]');
            if (!existingToken) {
                const tokenInput = document.createElement('input');
                tokenInput.type = 'hidden';
                tokenInput.name = "csrf_token";
                tokenInput.value = window.csrfTokenManager.getToken();
                form.appendChild(tokenInput);
            }
        });
    }

    setupFormHandlers() {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactForm(contactForm);
            });
        }

        const feedbackForm = document.getElementById('feedback-form');
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFeedbackForm(feedbackForm);
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('.open-contact-modal') || 
                e.target.closest('.open-contact-modal')) {
                e.preventDefault();
                this.openContactModal();
            }
        });

        this.setupCharacterCounters();
    }

    setupCharacterCounters() {
        const textareas = document.querySelectorAll('textarea[maxlength]');
        textareas.forEach(textarea => {
            const maxLength = parseInt(textarea.getAttribute('maxlength'));
            const counter = document.createElement('div');
            counter.className = 'char-counter';
            counter.style.cssText = `
                text-align: right;
                font-size: 0.8rem;
                color: #b0b0b0;
                margin-top: 5px;
            `;
            counter.textContent = `0/${maxLength}`;
            
            textarea.parentNode.appendChild(counter);
            
            textarea.addEventListener('input', (e) => {
                const length = e.target.value.length;
                counter.textContent = `${length}/${maxLength}`;
                
                if (length > maxLength * 0.9) {
                    counter.style.color = '#ff6b6b';
                } else if (length > maxLength * 0.75) {
                    counter.style.color = '#ffa500';
                } else {
                    counter.style.color = '#b0b0b0';
                }
            });
        });
    }

    async handleContactForm(form) {
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        const csrfToken = formData.get('csrf_token');
        if (!window.csrfTokenManager.validateToken(csrfToken)) {
            this.showNotification('❌ Error de seguridad. Por favor, recarga la página.', 'error');
            return;
        }

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/form-handler.php', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-Token': csrfToken
                }
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('✅ Solicitud enviada correctamente. Te contactaremos pronto.', 'success');
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submission', {
                        event_category: 'contact',
                        event_label: formData.get('service-type'),
                        value: 1
                    });
                }

                document.dispatchEvent(new CustomEvent('formSubmission', {
                    detail: {
                        serviceType: formData.get('service-type')
                    }
                }));

                this.closeModal();
                form.reset();

                window.csrfTokenManager.generateCSRFToken();

            } else {
                this.showNotification('❌ Error: ' + data.message, 'error');
                console.error('Error del servidor:', data);
            }

        } catch (error) {
            console.error('Error enviando formulario:', error);
            this.showNotification('❌ Error de conexión. Usando método alternativo...', 'warning');
            this.fallbackToMailto(form);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleFeedbackForm(form) {
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        const csrfToken = formData.get('csrf_token');
        if (!window.csrfTokenManager.validateToken(csrfToken)) {
            this.showNotification('❌ Error de seguridad. Por favor, recarga la página.', 'error');
            return;
        }

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/form-handler.php', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-Token': csrfToken
                }
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('✅ ¡Gracias por tus comentarios!', 'success');
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'feedback_submission', {
                        event_category: 'feedback',
                        event_label: 'user_feedback'
                    });
                }

                form.reset();
                this.closeFeedbackModal();

                window.csrfTokenManager.generateCSRFToken();

            } else {
                this.showNotification('❌ Error: ' + data.message, 'error');
            }

        } catch (error) {
            console.error('Error enviando feedback:', error);
            this.showNotification('❌ Error enviando comentarios', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    fallbackToMailto(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        const subject = `Nueva solicitud de servicio: ${data['service-type']}`;
        const body = `
Solicitud de Cotización - ODAM Producción Musical

INFORMACIÓN DEL CLIENTE:
Nombre: ${data.name}
Email: ${data.email}
Teléfono/WhatsApp: ${data.phone}

DETALLES DEL SERVICIO:
Servicio solicitado: ${data['service-type']}
Tipo de proyecto: ${data['project-type'] || 'No especificado'}
Presupuesto estimado: ${data.budget || 'No especificado'}
Fecha límite: ${data.deadline || 'No especificada'}

DESCRIPCIÓN DEL PROYECTO:
${data.message}

---
Este mensaje fue enviado desde el formulario de contacto de ODAM Producción Musical.
        `.trim();

        const mailtoLink = `mailto:odeam@osklindealba.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    }

    openContactModal() {
        const modal = document.getElementById('contact-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            this.injectCSRFTokens();
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'modal_open', {
                    event_category: 'ui',
                    event_label: 'contact_modal'
                });
            }
        }
    }

    closeModal() {
        const modal = document.getElementById('contact-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    closeFeedbackModal() {
        const modal = document.getElementById('feedback-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `notification-toast notification-${type}`;
        toast.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : type === 'warning' ? '#FF9800' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);

        toast.querySelector('.notification-close').addEventListener('click', () => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        });
    }
}

// ===== SISTEMA DE ANIMACIONES =====
class AnimationSystem {
    constructor() {
        this.observer = null;
        this.animatedElements = new Set();
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    entry.target.classList.add('show');
                    this.animatedElements.add(entry.target);
                    
                    if (typeof gtag !== 'undefined' && entry.target.id) {
                        gtag('event', 'element_visible', {
                            event_category: 'engagement',
                            event_label: entry.target.id
                        });
                    }
                    
                    setTimeout(() => {
                        this.observer.unobserve(entry.target);
                    }, 1000);
                }
            });
        }, options);

        document.querySelectorAll('.fade-in').forEach(el => {
            this.observer.observe(el);
        });
    }

    setupScrollAnimations() {
        let ticking = false;
        
        const updateElements = () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('[data-parallax]');
            
            parallaxElements.forEach(el => {
                const speed = parseFloat(el.getAttribute('data-parallax')) || 0.5;
                const yPos = -(scrolled * speed);
                el.style.transform = `translateY(${yPos}px)`;
            });
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateElements);
                ticking = true;
            }
        });
    }
}

// ===== SISTEMA DE VERSÍCULOS BÍBLICOS DINÁMICOS - SIN CONTADOR VISUAL =====
function initBibleVerses() {
    const bibleVerseElement = document.getElementById('bible-verse');
    if (!bibleVerseElement) return;

    const bible = new CompleteBibleRV1960();
    let rotationInterval = null;
    let lastUserActivity = Date.now();

    function displayRandomVerse() {
        const verse = bible.getRandomVerse();
        
        if (bibleVerseElement && verse) {
            bibleVerseElement.style.opacity = '0';
            
            setTimeout(() => {
                // ✅ CORRECCIÓN: Eliminado el contador visual, solo muestra texto y referencia
                bibleVerseElement.innerHTML = `
                    <div class="verse-content">
                        <div class="verse-text">"${verse.text}"</div>
                        <div class="verse-reference">${verse.book} ${verse.chapter}:${verse.verse}</div>
                    </div>
                `;
                bibleVerseElement.style.opacity = '1';
            }, 300);

            // ✅ El conteo se mantiene internamente pero no se muestra visualmente
            console.log(`📖 Versículo mostrado: ${verse.book} ${verse.chapter}:${verse.verse} | Total vistos en sesión: ${bible.getVersesReadInSession()}`);

            if (typeof gtag !== 'undefined') {
                gtag('event', 'bible_verse_view', {
                    event_category: 'content',
                    event_label: `${verse.book} ${verse.chapter}:${verse.verse}`
                });
            }
        }
    }

    function startVerseRotation() {
        if (rotationInterval) clearInterval(rotationInterval);
        
        rotationInterval = setInterval(() => {
            const inactiveTime = Date.now() - lastUserActivity;
            
            if (inactiveTime > 30000) {
                displayRandomVerse();
                console.log('🔄 Versículo rotado automáticamente (usuario inactivo)');
            }
        }, 2 * 60 * 1000);
    }

    function trackUserActivity() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            document.addEventListener(event, () => {
                lastUserActivity = Date.now();
            }, { passive: true });
        });
    }

    // Inicialización
    setTimeout(() => {
        displayRandomVerse();
        startVerseRotation();
        trackUserActivity();
        
        bibleVerseElement.addEventListener('click', () => {
            displayRandomVerse();
            lastUserActivity = Date.now();
        });
        
        bibleVerseElement.addEventListener('touchstart', () => {
            displayRandomVerse();
            lastUserActivity = Date.now();
        });
    }, 1000);

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            displayRandomVerse();
        }
    });

    window.addEventListener('load', () => {
        setTimeout(displayRandomVerse, 1000);
    });
}

// ===== OPTIMIZACIÓN DE EVENT LISTENERS =====
function optimizeEventListeners() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.service-accordion-header')) {
            const header = e.target.closest('.service-accordion-header');
            const item = header.parentElement;
            const isActive = item.classList.contains('active');
            
            document.querySelectorAll('.service-accordion-item').forEach(accItem => {
                accItem.classList.remove('active');
            });
            
            if (!isActive) {
                item.classList.add('active');
                
                if (typeof gtag !== 'undefined') {
                    const serviceName = item.querySelector('h3').textContent;
                    gtag('event', 'service_expand', {
                        event_category: 'engagement',
                        event_label: serviceName
                    });
                }
            }
        }
        
        if (e.target.classList.contains('modal-close') || 
            e.target.closest('.modal-close') ||
            e.target.id === 'contact-modal') {
            const modal = document.getElementById('contact-modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
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
            
            const feedbackModal = document.getElementById('feedback-modal');
            if (feedbackModal && feedbackModal.classList.contains('active')) {
                feedbackModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        }
    });
}

// ===== MENÚ MÓVIL - COMPLETAMENTE REPARADO =====
function initMobileMenu() {
    const toggle = document.getElementById('site-nav-toggle');
    const nav = document.getElementById('site-nav');
    
    if (!toggle || !nav) {
        console.warn('❌ Elementos del menú móvil no encontrados');
        return;
    }

    console.log('✅ Inicializando menú móvil...');

    // Crear estructura de hamburguesa si no existe
    if (!toggle.querySelector('.hamburger-line')) {
        toggle.innerHTML = `
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        `;
    }

    toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        const expanded = this.getAttribute('aria-expanded') === 'true';
        
        console.log(`🔄 Menú móvil: ${expanded ? 'cerrando' : 'abriendo'}`);
        
        this.setAttribute('aria-expanded', String(!expanded));
        nav.classList.toggle('open');
        document.body.style.overflow = expanded ? 'auto' : 'hidden';
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'mobile_menu_toggle', {
                event_category: 'ui',
                event_label: expanded ? 'close' : 'open'
            });
        }
    });

    // Cerrar menú al hacer clic en enlaces
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            console.log('🔒 Cerrando menú móvil (clic en enlace)');
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
            console.log('🔒 Cerrando menú móvil (clic fuera)');
            nav.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = 'auto';
        }
    });

    // Cerrar menú al redimensionar a desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && nav.classList.contains('open')) {
            console.log('🔒 Cerrando menú móvil (redimensionando a desktop)');
            nav.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = 'auto';
        }
    });

    console.log('✅ Menú móvil inicializado correctamente');
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                const offset = 80;
                
                window.scrollTo({
                    top: targetPosition - offset,
                    behavior: 'smooth'
                });

                if (typeof gtag !== 'undefined') {
                    gtag('event', 'smooth_scroll', {
                        event_category: 'navigation',
                        event_label: href
                    });
                }

                history.pushState(null, null, href);
            }
        });
    });
}

// ===== HEADER SCROLL EFFECT =====
function initHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    let lastScroll = 0;
    let ticking = false;

    function updateHeader() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        if (currentScroll > lastScroll && currentScroll > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
        ticking = false;
    }
    
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
}

// ===== LOADING SYSTEM =====
class LoadingSystem {
    constructor() {
        this.progress = 0;
        this.progressBar = document.getElementById('loading-progress');
        this.progressFill = document.querySelector('.progress-fill');
    }

    init() {
        if (!this.progressBar || !this.progressFill) {
            console.warn('Elementos de loading no encontrados');
            return;
        }
        this.startLoading();
        this.trackResources();
    }

    startLoading() {
        if (this.progressBar) {
            this.progressBar.classList.add('loading');
            this.updateProgress(10);
        }
    }

    trackResources() {
        const images = document.querySelectorAll('img');
        let loadedCount = 0;
        const totalCount = images.length;

        images.forEach(img => {
            if (img.complete) {
                loadedCount++;
            } else {
                img.addEventListener('load', () => {
                    loadedCount++;
                    this.updateProgress(10 + (loadedCount / totalCount) * 80);
                });
                img.addEventListener('error', () => {
                    loadedCount++;
                    this.updateProgress(10 + (loadedCount / totalCount) * 80);
                });
            }
        });

        setTimeout(() => {
            if (this.progress < 90) {
                this.updateProgress(90);
            }
        }, 1000);
    }

    updateProgress(percent) {
        this.progress = percent;
        if (this.progressFill) {
            this.progressFill.style.width = `${percent}%`;
        }

        if (percent >= 90) {
            setTimeout(() => this.completeLoading(), 300);
        }
    }

    completeLoading() {
        this.updateProgress(100);
        setTimeout(() => {
            if (this.progressBar) {
                this.progressBar.classList.remove('loading');
            }
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_loaded', {
                    event_category: 'performance',
                    event_label: 'full_load',
                    value: Math.round(performance.now())
                });
            }
        }, 500);
    }
}

// ===== ELIMINAR BOTÓN BLANCO =====
function fixWhiteButton() {
    const whiteButton = document.querySelector('.nav-toggle');
    if (whiteButton && window.innerWidth > 768) {
        whiteButton.style.display = 'none';
    }
}

// ===== INICIALIZACIÓN PRINCIPAL MEJORADA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎵 ODAM - Inicializando sitio con BIBLIA RV1960...');

    try {
        if (window.odamInitialized) {
            console.log('⚠️ ODAM ya está inicializado');
            return;
        }
        window.odamInitialized = true;

        // Sistema de carga
        const loadingSystem = new LoadingSystem();
        loadingSystem.init();

        // Sistema de animaciones
        const animationSystem = new AnimationSystem();

        // Sistema de audio - CRÍTICO REPARADO
        window.audioSystem = new AudioPlayerSystem();

        // PWA Manager - SOLO MÓVILES
        window.pwaManager = new PWAManager();

        // Form Handler
        window.formHandler = new FormHandler();

        // Optimizar event listeners
        optimizeEventListeners();

        // Inicializar componentes
        initMobileMenu(); // ✅ MENÚ MÓVIL REPARADO
        initSmoothScroll();
        initHeaderScroll();
        initBibleVerses(); // ✅ SISTEMA DE BIBLIA COMPLETO - SIN CONTADOR VISUAL
        fixWhiteButton();

        // CORRECCIÓN: CSS para elementos móviles
        const style = document.createElement('style');
        style.textContent = `
            .mobile-only { display: none; }
            @media (max-width: 768px) {
                .mobile-only { display: block; }
            }
        `;
        document.head.appendChild(style);

        // Prefers reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.querySelectorAll('.fade-in').forEach(el => {
                el.style.transition = 'none';
                el.classList.add('show');
            });
        }

        console.log('🎵 ODAM - Sitio completamente inicializado con BIBLIA RV1960');
    } catch (error) {
        console.error('Error durante la inicialización:', error);
    }
});

// ===== PARTÍCULAS INTERACTIVAS =====
class InteractiveParticles {
    constructor() {
        this.particlesInstance = null;
        this.isMobile = window.innerWidth < 768;
    }

    init() {
        if (this.isMobile || typeof particlesJS === 'undefined') return;

        const particlesContainer = document.getElementById('particles-js');
        if (!particlesContainer) return;

        this.particlesInstance = particlesJS('particles-js', {
            particles: {
                number: { 
                    value: 40,
                    density: { 
                        enable: true, 
                        value_area: 800 
                    } 
                },
                color: { value: "#c8a25f" },
                shape: { type: "circle" },
                opacity: { 
                    value: 0.3,
                    random: true 
                },
                size: { 
                    value: 3,
                    random: true 
                },
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
                    out_mode: "out",
                    bounce: false
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { 
                        enable: true, 
                        mode: "grab" 
                    },
                    onclick: { 
                        enable: true, 
                        mode: "push" 
                    }
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 0.3
                        }
                    },
                    push: {
                        particles_nb: 4
                    }
                }
            },
            retina_detect: true
        });
    }
}

// ===== MANEJO DE ERRORES GLOBAL =====
window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'javascript_error', {
            event_category: 'error',
            event_label: e.message,
            non_interaction: true
        });
    }
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Promise rechazada:', e.reason);
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'promise_rejection', {
            event_category: 'error',
            event_label: e.reason?.message || 'Unknown',
            non_interaction: true
        });
    }
});

// ===== OFFLINE DETECTION =====
window.addEventListener('online', () => {
    console.log('✅ Conexión restaurada');
    document.body.classList.remove('offline');
});

window.addEventListener('offline', () => {
    console.log('❌ Sin conexión');
    document.body.classList.add('offline');
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'offline_mode', {
            event_category: 'connection',
            event_label: 'offline'
        });
    }
});

// Inicializar partículas después de la carga
window.addEventListener('load', () => {
    const particlesSystem = new InteractiveParticles();
    particlesSystem.init();
});

// ===== EXPORTACIÓN PARA USO EXTERNO =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AudioPlayerSystem,
        PWAManager,
        FormHandler,
        AnimationSystem,
        LoadingSystem,
        CompleteBibleRV1960
    };
}

// ===== MENÚ QUE SE CONTRAE AL SCROLL =====
let lastScrollTop = 0;
const header = document.querySelector('header');
const scrollThreshold = 100;

window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
        // Scroll hacia abajo - ocultar menú
        header.style.transform = 'translateY(-100%)';
        header.style.transition = 'transform 0.3s ease';
    } else {
        // Scroll hacia arriba - mostrar menú
        header.style.transform = 'translateY(0)';
        header.style.transition = 'transform 0.3s ease';
    }
    
    lastScrollTop = scrollTop;
});

// Mostrar menú al hacer hover (opcional)
header.addEventListener('mouseenter', function() {
    header.style.transform = 'translateY(0)';
});

header.addEventListener('mouseleave', function() {
    if (window.pageYOffset > scrollThreshold) {
        header.style.transform = 'translateY(-100%)';
    }
});
