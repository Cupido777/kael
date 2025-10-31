/**
 * ODAM - SCRIPT PRINCIPAL UNIFICADO
 * Optimizado para performance, PWA y experiencia de usuario
 * @version 3.0.0
 * @author ODAM - Osklin De Alba
 */

// === CONFIGURACIÓN GLOBAL ===
class ODAMConfig {
    static get CSRF_URL() { return '/api/csrf-token'; }
    static get CONTACT_API() { return '/api/contact'; }
    static get STATS_API() { return '/api/stats'; }
    static get MAX_FILE_SIZE() { return 10 * 1024 * 1024; } // 10MB
    static get ACCEPTED_AUDIO_TYPES() { return ['.mp3', '.wav', '.ogg', 'audio/mpeg', 'audio/wav', 'audio/ogg']; }
}

// === GESTIÓN DE ESTADO DE LA APLICACIÓN ===
class AppState {
    constructor() {
        this.currentPage = document.body.dataset.page || 'unknown';
        this.isPWA = window.matchMedia('(display-mode: standalone)').matches;
        this.isOnline = navigator.onLine;
        this.modalOpen = false;
        this.init();
    }

    init() {
        this.setupOnlineStatus();
        this.setupPWAStatus();
        this.setupPerformanceMonitoring();
    }

    setupOnlineStatus() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNotification('Conexión restaurada', 'success');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNotification('Estás trabajando sin conexión', 'warning');
        });
    }

    setupPWAStatus() {
        if (this.isPWA) {
            document.body.classList.add('pwa-mode');
            console.log('✅ Aplicación ejecutándose en modo PWA');
        }
    }

    setupPerformanceMonitoring() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log(`⚡ Tiempo de carga: ${Math.round(perfData.loadEventEnd - perfData.loadEventStart)}ms`);
                }
            });
        }
    }

    showNotification(message, type = 'info') {
        // Implementar sistema de notificaciones toast
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('ODAM', { body: message, icon: 'logo-192x192.png' });
        }
        
        // Fallback para navegadores sin notificaciones
        this.showToast(message, type);
    }

    showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'warning' ? 'exclamation-triangle' : 'info'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
}

// === SISTEMA DE NAVEGACIÓN UNIFICADO ===
class NavigationSystem {
    constructor() {
        this.navToggle = document.getElementById('site-nav-toggle');
        this.navMenu = document.getElementById('site-nav');
        this.init();
    }

    init() {
        if (this.navToggle && this.navMenu) {
            this.setupEventListeners();
            this.setupKeyboardNavigation();
        }
    }

    setupEventListeners() {
        this.navToggle.addEventListener('click', () => this.toggleNavigation());
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
        document.addEventListener('keydown', (e) => this.handleEscapeKey(e));
    }

    setupKeyboardNavigation() {
        const navLinks = this.navMenu.querySelectorAll('a');
        navLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    const next = navLinks[index + 1] || navLinks[0];
                    next.focus();
                } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const prev = navLinks[index - 1] || navLinks[navLinks.length - 1];
                    prev.focus();
                }
            });
        });
    }

    toggleNavigation() {
        const isExpanded = this.navToggle.getAttribute('aria-expanded') === 'true';
        this.navToggle.setAttribute('aria-expanded', !isExpanded);
        this.navMenu.classList.toggle('active');
        this.navToggle.classList.toggle('active');
    }

    handleOutsideClick(e) {
        if (!this.navMenu.contains(e.target) && !this.navToggle.contains(e.target)) {
            this.closeNavigation();
        }
    }

    handleEscapeKey(e) {
        if (e.key === 'Escape' && this.navMenu.classList.contains('active')) {
            this.closeNavigation();
            this.navToggle.focus();
        }
    }

    closeNavigation() {
        this.navToggle.setAttribute('aria-expanded', 'false');
        this.navMenu.classList.remove('active');
        this.navToggle.classList.remove('active');
    }
}

// === SISTEMA DE MODALES UNIFICADO ===
class ModalSystem {
    constructor() {
        this.modals = new Map();
        this.currentModal = null;
        this.init();
    }

    init() {
        this.registerModals();
        this.setupGlobalListeners();
    }

    registerModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            const id = modal.id;
            this.modals.set(id, modal);
            
            // Configurar botones de cierre
            modal.querySelectorAll('.modal-close, [data-close-modal]').forEach(closeBtn => {
                closeBtn.addEventListener('click', () => this.closeModal(id));
            });
        });
    }

    setupGlobalListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal(this.currentModal);
            }
        });

        // Cerrar modal al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (this.currentModal && e.target === this.modals.get(this.currentModal)) {
                this.closeModal(this.currentModal);
            }
        });
    }

    openModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            // Cerrar modal actual si existe
            if (this.currentModal) {
                this.closeModal(this.currentModal);
            }

            modal.setAttribute('aria-hidden', 'false');
            modal.style.display = 'flex';
            this.currentModal = modalId;
            document.body.style.overflow = 'hidden';

            // Enfocar primer elemento interactivo
            const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable) focusable.focus();

            // Disparar evento personalizado
            modal.dispatchEvent(new CustomEvent('modalOpened', { detail: { modalId } }));
        }
    }

    closeModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            modal.setAttribute('aria-hidden', 'true');
            modal.style.display = 'none';
            this.currentModal = null;
            document.body.style.overflow = '';

            // Disparar evento personalizado
            modal.dispatchEvent(new CustomEvent('modalClosed', { detail: { modalId } }));
        }
    }
}

// === SISTEMA DE FORMULARIOS OPTIMIZADO ===
class FormSystem {
    constructor() {
        this.forms = new Map();
        this.init();
    }

    init() {
        this.registerForms();
        this.setupGlobalFormHandlers();
    }

    registerForms() {
        document.querySelectorAll('form').forEach(form => {
            const formId = form.id || `form-${Math.random().toString(36).substr(2, 9)}`;
            this.forms.set(formId, form);
            
            this.setupFormValidation(form);
            this.setupCharacterCounters(form);
            this.setupFileValidation(form);
        });
    }

    setupFormValidation(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Validación en tiempo real
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
            
            // Validación especial para tipos específicos
            if (input.type === 'email') {
                input.addEventListener('input', () => this.validateEmail(input));
            }
            
            if (input.type === 'tel') {
                input.addEventListener('input', () => this.formatPhoneNumber(input));
            }
        });

        // Validación al enviar
        form.addEventListener('submit', (e) => this.handleFormSubmit(e, form));
    }

    setupCharacterCounters(form) {
        const textareas = form.querySelectorAll('textarea[maxlength]');
        
        textareas.forEach(textarea => {
            const maxLength = parseInt(textarea.getAttribute('maxlength'));
            const counter = textarea.parentElement.querySelector('.char-counter');
            
            if (counter) {
                textarea.addEventListener('input', () => {
                    const currentLength = textarea.value.length;
                    counter.textContent = `${currentLength}/${maxLength}`;
                    
                    if (currentLength > maxLength * 0.9) {
                        counter.style.color = 'var(--error-color)';
                    } else if (currentLength > maxLength * 0.75) {
                        counter.style.color = 'var(--warning-color)';
                    } else {
                        counter.style.color = 'var(--text-secondary)';
                    }
                });
                
                // Inicializar contador
                textarea.dispatchEvent(new Event('input'));
            }
        });
    }

    setupFileValidation(form) {
        const fileInputs = form.querySelectorAll('input[type="file"]');
        
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => this.validateFile(e.target));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Validaciones básicas
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = field.dataset.requiredMessage || 'Este campo es obligatorio';
        }

        if (field.type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Por favor ingresa un email válido';
        }

        if (field.type === 'tel' && value && !this.isValidPhone(value)) {
            isValid = false;
            errorMessage = 'Por favor ingresa un número de teléfono válido';
        }

        if (field.hasAttribute('minlength') && value.length < parseInt(field.getAttribute('minlength'))) {
            isValid = false;
            errorMessage = `Mínimo ${field.getAttribute('minlength')} caracteres`;
        }

        if (field.hasAttribute('maxlength') && value.length > parseInt(field.getAttribute('maxlength'))) {
            isValid = false;
            errorMessage = `Máximo ${field.getAttribute('maxlength')} caracteres`;
        }

        // Mostrar/ocultar error
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }

        return isValid;
    }

    async handleFormSubmit(e, form) {
        e.preventDefault();
        
        // Validar todos los campos
        const fields = form.querySelectorAll('input, select, textarea');
        let allValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                allValid = false;
            }
        });

        if (!allValid) {
            this.showFormError(form, 'Por favor corrige los errores en el formulario');
            return;
        }

        // Mostrar loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;

        try {
            await this.submitForm(form);
        } catch (error) {
            this.showFormError(form, 'Error al enviar el formulario. Por favor intenta nuevamente.');
            console.error('Form submission error:', error);
        } finally {
            // Restaurar botón
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async submitForm(form) {
        const formData = new FormData(form);
        
        // Agregar datos adicionales
        formData.append('timestamp', new Date().toISOString());
        formData.append('userAgent', navigator.userAgent);
        formData.append('pageUrl', window.location.href);

        const response = await fetch(form.action || ODAMConfig.CONTACT_API, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            this.showFormSuccess(form, result.message || '¡Formulario enviado exitosamente!');
            form.reset();
            
            // Cerrar modal si existe
            const modal = form.closest('.modal');
            if (modal) {
                modalSystem.closeModal(modal.id);
            }
        } else {
            throw new Error(result.message || 'Error en el servidor');
        }
    }

    // Métodos auxiliares de validación
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPhone(phone) {
        return /^[\d\s+\-()]{10,}$/.test(phone.replace(/\s/g, ''));
    }

    validateFile(fileInput) {
        const file = fileInput.files[0];
        if (!file) return true;

        // Validar tamaño
        if (file.size > ODAMConfig.MAX_FILE_SIZE) {
            this.showFieldError(fileInput, `El archivo es demasiado grande. Máximo: ${ODAMConfig.MAX_FILE_SIZE / 1024 / 1024}MB`);
            fileInput.value = '';
            return false;
        }

        // Validar tipo
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        const fileType = file.type;
        
        if (!ODAMConfig.ACCEPTED_AUDIO_TYPES.includes(fileExtension) && 
            !ODAMConfig.ACCEPTED_AUDIO_TYPES.includes(fileType)) {
            this.showFieldError(fileInput, 'Tipo de archivo no permitido. Formatos aceptados: MP3, WAV, OGG');
            fileInput.value = '';
            return false;
        }

        this.clearFieldError(fileInput);
        return true;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        field.classList.add('error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        
        field.parentNode.appendChild(errorElement);
        field.setAttribute('aria-invalid', 'true');
    }

    clearFieldError(field) {
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    showFormError(form, message) {
        this.showNotification(message, 'error', form);
    }

    showFormSuccess(form, message) {
        this.showNotification(message, 'success', form);
    }

    showNotification(message, type, context) {
        const notification = document.createElement('div');
        notification.className = `form-notification form-notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        const target = context || document.body;
        target.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// === SISTEMA PWA AVANZADO ===
class PWASystem {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = document.getElementById('install-pwa');
        this.shareButton = document.getElementById('share-pwa');
        this.init();
    }

    init() {
        this.setupInstallPrompt();
        this.setupShareFunctionality();
        this.setupPWAStatus();
        this.setupOfflineDetection();
    }

    setupInstallPrompt() {
        if (!this.installButton) return;

        // Ocultar inicialmente
        this.installButton.style.display = 'none';

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.installButton.style.display = 'block';

            this.installButton.addEventListener('click', async () => {
                if (!this.deferredPrompt) return;
                
                this.installButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Instalando...';
                this.installButton.disabled = true;

                try {
                    this.deferredPrompt.prompt();
                    const { outcome } = await this.deferredPrompt.userChoice;
                    
                    if (outcome === 'accepted') {
                        this.showInstallSuccess();
                        this.trackEvent('pwa_install', 'accepted');
                    } else {
                        this.showInstallInstructions();
                        this.trackEvent('pwa_install', 'dismissed');
                    }
                } catch (error) {
                    console.error('Error durante la instalación:', error);
                    this.showInstallInstructions();
                } finally {
                    this.deferredPrompt = null;
                    this.installButton.style.display = 'none';
                }
            });
        });

        // Ocultar botón si ya está instalado
        window.addEventListener('appinstalled', () => {
            this.installButton.style.display = 'none';
            this.deferredPrompt = null;
            this.showInstallSuccess();
            this.trackEvent('pwa_install', 'installed');
        });

        // Verificar si ya está en modo PWA
        if (this.isInStandaloneMode()) {
            this.installButton.style.display = 'none';
            this.showInstallSuccess();
        }
    }

    setupShareFunctionality() {
        if (!this.shareButton) return;

        this.shareButton.addEventListener('click', async () => {
            const shareData = {
                title: 'ODAM - Producción Musical Profesional',
                text: 'Descubre la app de ODAM para producción musical profesional. Mezcla, masterización y consultoría técnica.',
                url: window.location.href
            };

            try {
                if (navigator.share) {
                    await navigator.share(shareData);
                    this.trackEvent('pwa_share', 'success');
                } else {
                    // Fallback: copiar al portapapeles
                    await this.copyToClipboard(window.location.href);
                    this.showNotification('¡Enlace copiado! Comparte la app de ODAM', 'success');
                    this.trackEvent('pwa_share', 'copied');
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    await this.copyToClipboard(window.location.href);
                    this.showNotification('Enlace copiado al portapapeles', 'info');
                    this.trackEvent('pwa_share', 'fallback_copied');
                }
            }
        });
    }

    setupPWAStatus() {
        // Agregar clase al body si es PWA
        if (this.isInStandaloneMode()) {
            document.body.classList.add('pwa-standalone');
        }

        // Monitorear cambios en el modo de visualización
        window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('pwa-standalone');
                this.trackEvent('pwa_mode', 'standalone');
            } else {
                document.body.classList.remove('pwa-standalone');
                this.trackEvent('pwa_mode', 'browser');
            }
        });
    }

    setupOfflineDetection() {
        // Ya manejado en AppState, pero agregamos funcionalidades específicas PWA
        window.addEventListener('online', () => {
            this.showNotification('Conexión restaurada - Sincronizando datos...', 'success');
        });

        window.addEventListener('offline', () => {
            this.showNotification('Modo sin conexión activado', 'warning');
        });
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            // Fallback para navegadores más antiguos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    }

    showInstallSuccess() {
        const pwaSection = document.querySelector('.pwa-section');
        if (pwaSection) {
            pwaSection.innerHTML = `
                <div class="pwa-success card">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>¡App Instalada Exitosamente!</h3>
                    <p>La aplicación ODAM ha sido instalada en tu dispositivo. Encuéntrala en tu pantalla de inicio.</p>
                    <div class="success-features">
                        <div class="feature">
                            <i class="fas fa-bolt"></i>
                            <span>Acceso rápido</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-wifi-slash"></i>
                            <span>Funciona sin conexión</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-rocket"></i>
                            <span>Máximo rendimiento</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    showInstallInstructions() {
        this.showNotification(
            'Para instalar: Menú → "Agregar a pantalla de inicio"', 
            'info'
        );
    }

    showNotification(message, type) {
        // Reutilizar el sistema de notificaciones de AppState
        if (window.appState) {
            window.appState.showNotification(message, type);
        } else {
            // Fallback simple
            alert(message);
        }
    }

    isInStandaloneMode() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone ||
               document.referrer.includes('android-app://');
    }

    trackEvent(category, action, label = '') {
        // Integración con analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label
            });
        }
        
        // Log para desarrollo
        console.log(`📊 Event: ${category}.${action}`, label ? `(${label})` : '');
    }
}

// === SISTEMA DE PARTICULAS OPTIMIZADO ===
class ParticlesSystem {
    constructor() {
        this.container = document.getElementById('particles-js');
        this.init();
    }

    init() {
        if (!this.container || !window.particlesJS) return;

        // Configuración optimizada para performance
        const config = {
            particles: {
                number: {
                    value: 40,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: "#c8a25f"
                },
                shape: {
                    type: "circle",
                    stroke: {
                        width: 0,
                        color: "#000000"
                    }
                },
                opacity: {
                    value: 0.3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 0.1,
                        sync: false
                    }
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
                    speed: 1,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
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
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 0.5
                        }
                    },
                    push: {
                        particles_nb: 4
                    }
                }
            },
            retina_detect: true,
            // Optimizaciones de performance
            fps_limit: 60,
            pauseOnBlur: true
        };

        particlesJS('particles-js', config);

        // Pausar partículas cuando no son visibles
        this.setupVisibilityControl();
    }

    setupVisibilityControl() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.resumeParticles();
                } else {
                    this.pauseParticles();
                }
            });
        });

        observer.observe(this.container);
    }

    pauseParticles() {
        if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS.particles) {
            window.pJSDom[0].pJS.particles.move.enable = false;
            window.pJSDom[0].pJS.fn.particlesRefresh();
        }
    }

    resumeParticles() {
        if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS.particles) {
            window.pJSDom[0].pJS.particles.move.enable = true;
            window.pJSDom[0].pJS.fn.particlesRefresh();
        }
    }
}

// === INICIALIZACIÓN GLOBAL ===
class ODAMApp {
    constructor() {
        this.components = {};
        this.init();
    }

    init() {
        // Inicializar componentes en orden
        this.initializeComponents();
        this.setupGlobalEventListeners();
        this.setupPerformanceOptimizations();
        
        console.log('🚀 ODAM App inicializada correctamente');
    }

    initializeComponents() {
        // Orden de inicialización importante
        this.components.appState = new AppState();
        this.components.navigation = new NavigationSystem();
        this.components.modalSystem = new ModalSystem();
        this.components.formSystem = new FormSystem();
        this.components.pwaSystem = new PWASystem();
        this.components.particlesSystem = new ParticlesSystem();

        // Hacer disponibles globalmente
        window.appState = this.components.appState;
        window.modalSystem = this.components.modalSystem;
        window.pwaSystem = this.components.pwaSystem;
    }

    setupGlobalEventListeners() {
        // Botones de abrir modal
        document.addEventListener('click', (e) => {
            const openModalBtn = e.target.closest('[data-open-modal]');
            if (openModalBtn) {
                e.preventDefault();
                const modalId = openModalBtn.dataset.openModal;
                modalSystem.openModal(modalId);
            }
        });

        // Links suaves para anclas
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const target = document.querySelector(e.target.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });

        // Prevenir clics en links rotos
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href="#"]')) {
                e.preventDefault();
            }
        });
    }

    setupPerformanceOptimizations() {
        // Lazy loading para imágenes fuera del viewport
        this.setupLazyLoading();
        
        // Preconexión a recursos críticos
        this.setupResourceHints();
        
        // Monitoring de performance
        this.setupPerformanceMonitoring();
    }

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    setupResourceHints() {
        // Preconectar a dominios críticos
        const domains = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://cdnjs.cloudflare.com',
            'https://wa.me'
        ];

        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    setupPerformanceMonitoring() {
        // Monitorear Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('🎨 LCP:', lastEntry.startTime, lastEntry);
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // Monitorear Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                    console.log('📐 CLS actual:', clsValue);
                }
            }
        }).observe({ type: 'layout-shift', buffered: true });
    }
}

// === INICIALIZACIÓN CUANDO EL DOM ESTÉ LISTO ===
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar la aplicación principal
    window.odamApp = new ODAMApp();

    // Configuración adicional para páginas específicas
    const currentPage = document.body.dataset.page;
    
    switch (currentPage) {
        case 'contacto':
            setupContactPage();
            break;
        case 'servicios':
            setupServicesPage();
            break;
        case 'inspiracion':
            setupInspirationPage();
            break;
        case 'interaccion':
            setupInteractionPage();
            break;
    }

    function setupContactPage() {
        // Inicializaciones específicas para contacto
        console.log('📞 Página de contacto inicializada');
    }

    function setupServicesPage() {
        // Inicializaciones específicas para servicios
        console.log('🎵 Página de servicios inicializada');
    }

    function setupInspirationPage() {
        // Inicializaciones específicas para inspiración
        console.log('✨ Página de inspiración inicializada');
    }

    function setupInteractionPage() {
        // Inicializaciones específicas para interacción
        console.log('🔄 Página de interacción inicializada');
    }
});

// === COMPATIBILIDAD CON NAVEGADORES ANTIGUOS ===
// Polyfills para funcionalidades modernas
if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
        if (typeof start !== 'number') start = 0;
        return this.indexOf(search, start) !== -1;
    };
}

// Exportar para uso global (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ODAMApp, AppState, NavigationSystem, ModalSystem, FormSystem, PWASystem };
}
