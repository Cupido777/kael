class InspirationVerseSystem {
    constructor() {
        this.bible = null;
        this.currentInterval = null;
        this.userId = this.generateUserId();
        this.lastVerseIndex = -1;
        this.initializeSystem();
    }

    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    initializeSystem() {
        console.log('🎯 Inicializando Sistema de Versículos para usuario:', this.userId);
        
        if (typeof BibleRV1960Database !== 'undefined') {
            this.bible = new BibleRV1960Database();
            this.startVerseRotation();
        } else {
            const checkInterval = setInterval(() => {
                if (typeof BibleRV1960Database !== 'undefined') {
                    clearInterval(checkInterval);
                    this.bible = new BibleRV1960Database();
                    this.startVerseRotation();
                }
            }, 1000);
        }
    }

    startVerseRotation() {
        console.log('🔄 Iniciando rotación de versículos para:', this.userId);
        console.log('📱 Dispositivo:', this.isMobile() ? 'Móvil' : 'Computador');
        
        // Mostrar versículo inmediatamente
        this.displayRandomVerse();
        
        // Configurar intervalo cada 2 minutos (120,000 ms)
        this.currentInterval = setInterval(() => {
            console.log('🕒 Rotación automática ejecutada en:', new Date().toLocaleTimeString());
            this.displayRandomVerse();
        }, 120000);
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    displayRandomVerse() {
        if (!this.bible) {
            this.showError('Sistema bíblico no disponible en este momento.');
            return;
        }

        try {
            // CORRECCIÓN: Usar getRandomVerse() en lugar de getVerse()
            const verse = this.bible.getRandomVerse();
            
            if (verse && verse.text) {
                this.updateVerseDisplay(verse);
                console.log(`📖 Versículo mostrado para ${this.userId}: ${verse.book} ${verse.chapter}:${verse.verse}`);
            } else {
                this.showError('No se pudo cargar el versículo en este momento.');
            }
        } catch (error) {
            console.error('❌ Error en displayRandomVerse:', error);
            this.showError('Error al cargar la inspiración diaria.');
        }
    }

    updateVerseDisplay(verse) {
        const verseElement = document.getElementById('bible-verse');
        if (!verseElement) {
            console.error('❌ No se encontró el elemento bible-verse en el DOM');
            return;
        }

        // Actualizar contenido con animación suave
        verseElement.innerHTML = `
            <div class="verse-text">"${verse.text}"</div>
            <div class="verse-reference">— ${verse.book} ${verse.chapter}:${verse.verse}</div>
        `;

        // Añadir efecto de fade-in
        verseElement.style.opacity = '0';
        setTimeout(() => {
            verseElement.style.transition = 'opacity 0.5s ease';
            verseElement.style.opacity = '1';
        }, 100);
    }

    showError(message) {
        const verseElement = document.getElementById('bible-verse');
        if (verseElement) {
            verseElement.innerHTML = `
                <div class="verse-text">${message}</div>
                <div class="verse-reference">— Intenta recargar la página</div>
            `;
        }
        console.error('❌ Error del sistema de versículos:', message);
    }

    stopRotation() {
        if (this.currentInterval) {
            clearInterval(this.currentInterval);
            this.currentInterval = null;
            console.log('⏹️ Rotación de versículos detenida para:', this.userId);
        }
    }

    restartRotation() {
        this.stopRotation();
        this.startVerseRotation();
        console.log('🔄 Rotación de versículos reiniciada para:', this.userId);
    }

    getCurrentUserId() {
        return this.userId;
    }

    getSystemStatus() {
        return {
            userId: this.userId,
            bibleLoaded: !!this.bible,
            rotationActive: !!this.currentInterval,
            // CORRECCIÓN: Usar getTotalVersesCount() en lugar de getTotalVerses()
            totalVerses: this.bible ? this.bible.getTotalVersesCount() : 0,
            isMobile: this.isMobile()
        };
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Pequeño delay para asegurar que todo esté cargado
    setTimeout(() => {
        window.verseSystem = new InspirationVerseSystem();
        
        // Exponer controles manuales para debugging
        window.debugVerseSystem = {
            showNewVerse: () => window.verseSystem.displayRandomVerse(),
            stopRotation: () => window.verseSystem.stopRotation(),
            restartRotation: () => window.verseSystem.restartRotation(),
            getStatus: () => window.verseSystem.getSystemStatus()
        };
        
        console.log('✅ Sistema de versículos inicializado correctamente');
    }, 1000);
});

// Control manual disponible globalmente
window.InspirationVerseSystem = InspirationVerseSystem;
