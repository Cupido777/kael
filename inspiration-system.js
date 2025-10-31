/**
 * SISTEMA DE INSPIRACIÓN - VERSÍCULOS BÍBLICOS
 * Sistema optimizado para rotación automática de versículos bíblicos
 * @version 2.0.0
 * @author ODAM Productions
 */

class InspirationVerseSystem {
    constructor(options = {}) {
        // Configuración por defecto
        this.config = {
            rotationInterval: 120000, // 2 minutos
            fadeDuration: 500, // ms
            retryDelay: 1000, // 1 segundo
            maxRetries: 3,
            ...options
        };

        // Estado del sistema
        this.bible = null;
        this.currentInterval = null;
        this.retryCount = 0;
        this.isInitialized = false;
        this.currentVerse = null;
        
        // Métricas y analytics
        this.metrics = {
            versesDisplayed: 0,
            errors: 0,
            lastDisplay: null,
            startTime: Date.now()
        };

        // Generar ID de usuario único
        this.userId = this.generateUserId();
        
        this.initializeSystem();
    }

    /**
     * Genera un ID de usuario único y persistente
     */
    generateUserId() {
        // Intentar recuperar ID existente de localStorage
        const storedId = localStorage.getItem('odam_user_id');
        if (storedId) {
            return storedId;
        }

        // Generar nuevo ID
        const newId = `user_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
        
        // Almacenar para futuras visitas
        try {
            localStorage.setItem('odam_user_id', newId);
        } catch (error) {
            console.warn('No se pudo almacenar el ID de usuario:', error);
        }

        return newId;
    }

    /**
     * Inicializa el sistema de versículos
     */
    async initializeSystem() {
        console.log('🎯 Inicializando Sistema de Versículos para usuario:', this.userId);
        
        try {
            await this.loadBibleDatabase();
            this.startVerseRotation();
            this.isInitialized = true;
            
            console.log('✅ Sistema de versículos inicializado correctamente');
            this.trackEvent('system_initialized');
        } catch (error) {
            console.error('❌ Error inicializando sistema:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Carga la base de datos bíblica con reintentos
     */
    async loadBibleDatabase() {
        return new Promise((resolve, reject) => {
            const checkDatabase = () => {
                if (typeof BibleRV1960Database !== 'undefined') {
                    this.bible = new BibleRV1960Database();
                    resolve(this.bible);
                } else if (this.retryCount < this.config.maxRetries) {
                    this.retryCount++;
                    console.log(`🔄 Reintento ${this.retryCount}/${this.config.maxRetries} para cargar base de datos...`);
                    setTimeout(checkDatabase, this.config.retryDelay);
                } else {
                    reject(new Error('No se pudo cargar la base de datos bíblica'));
                }
            };

            checkDatabase();
        });
    }

    /**
     * Inicia la rotación automática de versículos
     */
    startVerseRotation() {
        console.log('🔄 Iniciando rotación de versículos para:', this.userId);
        console.log('📱 Tipo de dispositivo:', this.getDeviceType());

        // Mostrar versículo inmediatamente
        this.displayRandomVerse();

        // Configurar intervalo para rotación automática
        this.currentInterval = setInterval(() => {
            console.log('🕒 Rotación automática ejecutada:', new Date().toLocaleTimeString());
            this.displayRandomVerse();
            this.trackEvent('auto_rotation');
        }, this.config.rotationInterval);

        this.trackEvent('rotation_started');
    }

    /**
     * Detecta el tipo de dispositivo
     */
    getDeviceType() {
        const userAgent = navigator.userAgent;
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            return 'mobile';
        } else if (/Tablet|iPad/i.test(userAgent)) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }

    /**
     * Muestra un versículo aleatorio
     */
    async displayRandomVerse() {
        if (!this.bible) {
            this.showError('Sistema bíblico no disponible en este momento.');
            return;
        }

        try {
            const verse = this.bible.getRandomVerse();
            
            if (verse && verse.text && verse.book) {
                await this.updateVerseDisplay(verse);
                this.currentVerse = verse;
                this.metrics.versesDisplayed++;
                this.metrics.lastDisplay = new Date().toISOString();
                
                console.log(`📖 Versículo mostrado para ${this.userId}: ${verse.book} ${verse.chapter}:${verse.verse}`);
                this.trackEvent('verse_displayed', {
                    book: verse.book,
                    chapter: verse.chapter,
                    verse: verse.verse
                });
            } else {
                throw new Error('Versículo inválido o incompleto');
            }
        } catch (error) {
            console.error('❌ Error en displayRandomVerse:', error);
            this.metrics.errors++;
            this.showError('Error al cargar la inspiración diaria.');
            this.trackEvent('verse_error', { error: error.message });
        }
    }

    /**
     * Actualiza la visualización del versículo con animación
     */
    async updateVerseDisplay(verse) {
        const verseElement = document.getElementById('bible-verse');
        
        if (!verseElement) {
            console.error('❌ No se encontró el elemento bible-verse en el DOM');
            throw new Error('Elemento de visualización no encontrado');
        }

        return new Promise((resolve) => {
            // Efecto fade out
            verseElement.style.transition = `opacity ${this.config.fadeDuration}ms ease`;
            verseElement.style.opacity = '0';

            setTimeout(() => {
                // Actualizar contenido de manera segura
                verseElement.innerHTML = this.createVerseHTML(verse);
                
                // Efecto fade in
                setTimeout(() => {
                    verseElement.style.opacity = '1';
                    resolve();
                }, 50);
            }, this.config.fadeDuration);
        });
    }

    /**
     * Crea el HTML seguro para el versículo
     */
    createVerseHTML(verse) {
        // Sanitizar contenido para prevenir XSS
        const sanitize = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };

        return `
            <div class="verse-content">
                <div class="verse-text">"${sanitize(verse.text)}"</div>
                <div class="verse-reference">— ${sanitize(verse.book)} ${verse.chapter}:${verse.verse}</div>
            </div>
        `;
    }

    /**
     * Muestra mensajes de error al usuario
     */
    showError(message) {
        const verseElement = document.getElementById('bible-verse');
        
        if (verseElement) {
            const errorHTML = `
                <div class="verse-content">
                    <div class="verse-text">${message}</div>
                    <div class="verse-reference">— Recarga la página para intentar nuevamente</div>
                </div>
            `;
            
            verseElement.innerHTML = errorHTML;
            verseElement.style.opacity = '1';
        }
        
        // También mostrar en consola para debugging
        console.warn('⚠️ Mensaje de error mostrado al usuario:', message);
    }

    /**
     * Maneja errores de inicialización
     */
    handleInitializationError(error) {
        this.metrics.errors++;
        this.showError('El sistema de inspiración no está disponible temporalmente.');
        
        // Intentar recuperación automática después de 30 segundos
        setTimeout(() => {
            if (!this.isInitialized) {
                console.log('🔄 Intentando recuperación automática del sistema...');
                this.initializeSystem();
            }
        }, 30000);
    }

    /**
     * Detiene la rotación automática
     */
    stopRotation() {
        if (this.currentInterval) {
            clearInterval(this.currentInterval);
            this.currentInterval = null;
            console.log('⏹️ Rotación de versículos detenida para:', this.userId);
            this.trackEvent('rotation_stopped');
        }
    }

    /**
     * Reinicia la rotación automática
     */
    restartRotation() {
        this.stopRotation();
        this.startVerseRotation();
        console.log('🔄 Rotación de versículos reiniciada para:', this.userId);
        this.trackEvent('rotation_restarted');
    }

    /**
     * Fuerza la actualización manual del versículo
     */
    forceRefresh() {
        console.log('🔄 Actualización manual solicitada por usuario');
        this.displayRandomVerse();
        this.trackEvent('manual_refresh');
    }

    /**
     * Registra eventos para analytics
     */
    trackEvent(eventName, data = {}) {
        // Enviar a Google Analytics si está disponible
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'inspiration_system',
                event_label: this.userId,
                ...data
            });
        }

        // También registrar localmente
        const event = {
            timestamp: new Date().toISOString(),
            userId: this.userId,
            event: eventName,
            data: data,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        console.log('📊 Evento registrado:', event);
    }

    /**
     * Obtiene el ID del usuario actual
     */
    getCurrentUserId() {
        return this.userId;
    }

    /**
     * Obtiene el versículo actualmente mostrado
     */
    getCurrentVerse() {
        return this.currentVerse;
    }

    /**
     * Obtiene el estado completo del sistema
     */
    getSystemStatus() {
        return {
            userId: this.userId,
            bibleLoaded: !!this.bible,
            rotationActive: !!this.currentInterval,
            isInitialized: this.isInitialized,
            totalVerses: this.bible ? this.bible.getTotalVersesCount() : 0,
            deviceType: this.getDeviceType(),
            metrics: { ...this.metrics },
            config: { ...this.config },
            currentVerse: this.currentVerse,
            uptime: Date.now() - this.metrics.startTime
        };
    }

    /**
     * Actualiza la configuración del sistema
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Reiniciar rotación si el intervalo cambió
        if (newConfig.rotationInterval && this.currentInterval) {
            this.restartRotation();
        }
        
        console.log('⚙️ Configuración actualizada:', this.config);
        this.trackEvent('config_updated', { config: newConfig });
    }

    /**
     * Limpia recursos y prepara para destrucción
     */
    destroy() {
        this.stopRotation();
        this.bible = null;
        this.isInitialized = false;
        console.log('🧹 Sistema de versículos destruido');
        this.trackEvent('system_destroyed');
    }
}

/**
 * Inicialización automática cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que los recursos críticos estén cargados
    setTimeout(() => {
        try {
            // Inicializar sistema principal
            window.verseSystem = new InspirationVerseSystem();
            
            // Interface de debugging para desarrollo
            if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
                window.debugVerseSystem = {
                    showNewVerse: () => window.verseSystem.displayRandomVerse(),
                    stopRotation: () => window.verseSystem.stopRotation(),
                    restartRotation: () => window.verseSystem.restartRotation(),
                    forceRefresh: () => window.verseSystem.forceRefresh(),
                    getStatus: () => window.verseSystem.getSystemStatus(),
                    updateConfig: (config) => window.verseSystem.updateConfig(config),
                    destroy: () => window.verseSystem.destroy()
                };
                
                console.log('🐛 Debug mode activado - Usa debugVerseSystem para testing');
            }
            
            console.log('✅ Sistema de versículos inicializado correctamente');
        } catch (error) {
            console.error('💥 Error crítico inicializando sistema de versículos:', error);
            
            // Fallback básico
            const verseElement = document.getElementById('bible-verse');
            if (verseElement) {
                verseElement.innerHTML = `
                    <div class="verse-content">
                        <div class="verse-text">"Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna."</div>
                        <div class="verse-reference">— Juan 3:16</div>
                    </div>
                `;
            }
        }
    }, 1000);
});

// Exportar para uso modular
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InspirationVerseSystem;
} else {
    window.InspirationVerseSystem = InspirationVerseSystem;
}

/**
 * Polyfill para entornos antiguos
 */
if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
        if (typeof start !== 'number') {
            start = 0;
        }
        if (start + search.length > this.length) {
            return false;
        }
        return this.indexOf(search, start) !== -1;
    };
}
