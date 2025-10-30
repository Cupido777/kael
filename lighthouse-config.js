// =============================================
// ODAM Producción Musical - Lighthouse Configuration REPARADO
// Performance, SEO, Accessibility & Best Practices
// Version: 1.0.1 - CORREGIDO
// =============================================

class LighthouseConfig {
    constructor() {
        this.config = {
            extends: 'lighthouse:default',
            settings: {
                emulatedFormFactor: 'desktop',
                throttling: this.getThrottlingConfig(),
                audits: this.getAuditsConfig(),
                categories: this.getCategoriesConfig(),
                onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
                skipAudits: ['redirects-http'],
            },
            passes: [{
                passName: 'defaultPass',
                gatherers: this.getGatherers(),
                recordTrace: true,
                useThrottling: true,
                pauseAfterLoadMs: 5000,
                networkQuietThresholdMs: 3000,
                cpuQuietThresholdMs: 3000,
            }],
            audits: this.getCustomAudits(),
            groups: this.getGroupsConfig(),
        };
        
        this.metrics = {
            performance: {},
            accessibility: {},
            seo: {},
            bestPractices: {}
        };
        
        this.init();
    }

    init() {
        console.log('⚡ Lighthouse Config: Inicializando métricas de performance v1.0.1');
        this.setupPerformanceMonitoring();
        this.setupCoreWebVitals();
        this.setupCDNOptimizations();
    }

    // ===== CONFIGURACIÓN DE THROTTLING =====
    getThrottlingConfig() {
        return {
            rttMs: 40,
            throughputKbps: 10 * 1024,
            cpuSlowdownMultiplier: 1,
            requestLatencyMs: 0,
            downloadThroughputKbps: 0,
            uploadThroughputKbps: 0,
        };
    }

    // ===== CONFIGURACIÓN DE AUDITORÍAS =====
    getAuditsConfig() {
        return [
            'first-contentful-paint',
            'largest-contentful-paint', 
            'first-meaningful-paint',
            'speed-index',
            'total-blocking-time',
            'cumulative-layout-shift',
            'interactive',
            'max-potential-fid',
            'server-response-time',
            'render-blocking-resources',
            'uses-responsive-images',
            'offscreen-images',
            'unminified-css',
            'unminified-javascript',
            'unused-css-rules',
            'unused-javascript',
            'modern-image-formats',
            'uses-optimized-images',
            'uses-text-compression',
            'uses-long-cache-ttl',
            'dom-size',
            'efficient-animated-content',
            'duplicated-javascript',
            'legacy-javascript',
            'preload-lcp-image',
            'third-party-summary',
            'third-party-facades'
        ];
    }

    // ===== CONFIGURACIÓN DE CATEGORÍAS =====
    getCategoriesConfig() {
        return {
            performance: {
                title: 'Performance',
                description: 'Métricas de rendimiento y velocidad de carga',
                auditRefs: [
                    { id: 'first-contentful-paint', weight: 10, group: 'metrics' },
                    { id: 'largest-contentful-paint', weight: 25, group: 'metrics' },
                    { id: 'speed-index', weight: 10, group: 'metrics' },
                    { id: 'cumulative-layout-shift', weight: 25, group: 'metrics' },
                    { id: 'total-blocking-time', weight: 30, group: 'metrics' },
                    { id: 'interactive', weight: 10, group: 'metrics' }
                ]
            },
            accessibility: {
                title: 'Accessibility',
                description: 'Accesibilidad y compatibilidad con diferentes usuarios',
                auditRefs: [
                    { id: 'aria-allowed-attr', weight: 5 },
                    { id: 'aria-required-attr', weight: 5 },
                    { id: 'color-contrast', weight: 10 },
                    { id: 'document-title', weight: 5 },
                    { id: 'html-has-lang', weight: 5 },
                    { id: 'image-alt', weight: 10 },
                    { id: 'label', weight: 10 },
                    { id: 'link-name', weight: 10 },
                    { id: 'meta-viewport', weight: 5 }
                ]
            },
            'best-practices': {
                title: 'Best Practices',
                description: 'Prácticas recomendadas para desarrollo web moderno',
                auditRefs: [
                    { id: 'uses-http2', weight: 5 },
                    { id: 'uses-passive-event-listeners', weight: 1 },
                    { id: 'meta-description', weight: 1 },
                    { id: 'http-status-code', weight: 1 },
                    { id: 'font-size', weight: 1 }
                ]
            },
            seo: {
                title: 'SEO',
                description: 'Optimización para motores de búsqueda',
                auditRefs: [
                    { id: 'viewport', weight: 5 },
                    { id: 'document-title', weight: 5 },
                    { id: 'meta-description', weight: 5 },
                    { id: 'http-status-code', weight: 5 },
                    { id: 'image-alt', weight: 5 },
                    { id: 'canonical', weight: 5 },
                    { id: 'structured-data', weight: 10 }
                ]
            }
        };
    }

    // ===== GATHERERS PERSONALIZADOS =====
    getGatherers() {
        return [
            'css-usage',
            'js-usage', 
            'viewport-dimensions',
            'console-messages',
            'anchor-elements',
            'image-elements',
            'link-elements',
            'meta-elements',
            'script-elements',
            'main-document-content'
        ];
    }

    // ===== AUDITORÍAS PERSONALIZADAS PARA ODAM =====
    getCustomAudits() {
        return [
            {
                id: 'odam-audio-performance',
                title: 'Los archivos de audio están optimizados para web',
                description: 'Los archivos de audio MP3 deben estar comprimidos y usar preload adecuado',
                failureTitle: 'Los archivos de audio no están optimizados',
                failureDescription: 'Optimiza los archivos de audio para mejor performance de carga',
                requiredArtifacts: ['AudioElements'],
                score: {
                    rawValue: 1,
                    score: 1
                }
            },
            {
                id: 'odam-service-worker',
                title: 'Service Worker está configurado correctamente',
                description: 'El Service Worker debe estar registrado y cacheando recursos críticos',
                failureTitle: 'Service Worker no configurado',
                failureDescription: 'Implementa Service Worker para caching offline',
                requiredArtifacts: ['ServiceWorker'],
                score: {
                    rawValue: 1,
                    score: 1
                }
            }
        ];
    }

    // ===== CONFIGURACIÓN DE GRUPOS =====
    getGroupsConfig() {
        return {
            'metrics': {
                title: 'Métricas de Performance'
            },
            'load-opportunities': {
                title: 'Oportunidades de Mejora'
            },
            'a11y-color-contrast': {
                title: 'Contraste de Color'
            },
            'a11y-names-labels': {
                title: 'Nombres y Etiquetas'
            },
            'seo-content': {
                title: 'Contenido SEO'
            }
        };
    }

    // ===== MONITOREO DE PERFORMANCE EN TIEMPO REAL =====
    setupPerformanceMonitoring() {
        if ('performance' in window) {
            // Monitorear Core Web Vitals
            this.monitorLCP();
            this.monitorCLS();
            this.monitorFCP();
            
            // Monitorear métricas personalizadas ODAM
            this.monitorAudioPerformance();
            this.monitorServiceWorker();
        } else {
            console.warn('⚡ Performance API no soportada');
        }
    }

    // ===== CORE WEB VITALS CORREGIDOS =====
    monitorLCP() {
        try {
            if ('PerformanceObserver' in window && 'LargestContentfulPaint' in window) {
                const observer = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    
                    if (lastEntry) {
                        this.metrics.performance.lcp = lastEntry.renderTime || lastEntry.loadTime;
                        console.log('⚡ LCP:', this.metrics.performance.lcp);
                        this.sendToAnalytics('lcp', this.metrics.performance.lcp);
                    }
                });
                
                observer.observe({entryTypes: ['largest-contentful-paint']});
            }
        } catch (error) {
            console.warn('❌ No se pudo monitorear LCP:', error);
        }
    }

    monitorCLS() {
        try {
            if ('PerformanceObserver' in window) {
                let clsValue = 0;
                let sessionValue = 0;
                
                const observer = new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        if (!entry.hadRecentInput) {
                            sessionValue += entry.value;
                        }
                    }
                    
                    this.metrics.performance.cls = sessionValue;
                    console.log('⚡ CLS:', this.metrics.performance.cls);
                    this.sendToAnalytics('cls', this.metrics.performance.cls);
                });
                
                observer.observe({entryTypes: ['layout-shift']});
            }
        } catch (error) {
            console.warn('❌ No se pudo monitorear CLS:', error);
        }
    }

    monitorFCP() {
        try {
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const firstPaint = entries[0];
                    
                    if (firstPaint) {
                        this.metrics.performance.fcp = firstPaint.startTime;
                        console.log('⚡ FCP:', this.metrics.performance.fcp);
                        this.sendToAnalytics('fcp', this.metrics.performance.fcp);
                    }
                });
                
                observer.observe({entryTypes: ['paint']});
            }
        } catch (error) {
            console.warn('❌ No se pudo monitorear FCP:', error);
        }
    }

    // ===== MÉTRICAS PERSONALIZADAS ODAM =====
    monitorAudioPerformance() {
        try {
            const audioElements = document.querySelectorAll('audio');
            let totalLoadTime = 0;
            let loadedCount = 0;
            
            audioElements.forEach(audio => {
                const startTime = performance.now();
                
                audio.addEventListener('loadeddata', () => {
                    const loadTime = performance.now() - startTime;
                    totalLoadTime += loadTime;
                    loadedCount++;
                    
                    const avgLoadTime = totalLoadTime / loadedCount;
                    this.metrics.performance.audioLoadTime = avgLoadTime;
                    
                    console.log('🎵 Audio Load Time:', avgLoadTime);
                    this.sendToAnalytics('audio_load_time', avgLoadTime);
                });
            });
        } catch (error) {
            console.warn('❌ No se pudo monitorear audio performance:', error);
        }
    }

    monitorServiceWorker() {
        try {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(registration => {
                    this.metrics.performance.serviceWorker = true;
                    console.log('🔧 Service Worker: Activo');
                    this.sendToAnalytics('service_worker', 1);
                }).catch(() => {
                    this.metrics.performance.serviceWorker = false;
                    this.sendToAnalytics('service_worker', 0);
                });
            }
        } catch (error) {
            console.warn('❌ No se pudo monitorear Service Worker:', error);
        }
    }

    // ===== SETUP CORE WEB VITALS CORREGIDO =====
    setupCoreWebVitals() {
        // CORRECCIÓN: Cargar web-vitals de forma segura
        this.loadWebVitals().then(() => {
            this.initializeWebVitals();
        }).catch(error => {
            console.warn('⚠️ No se pudo cargar web-vitals, usando métricas nativas');
            this.initializeNativeMetrics();
        });
    }

    async loadWebVitals() {
        return new Promise((resolve, reject) => {
            // Verificar si ya está cargado
            if (typeof webVitals !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://unpkg.com/web-vitals@3.0.0/dist/web-vitals.attribution.iife.js';
            script.crossOrigin = 'anonymous';
            script.onload = () => {
                console.log('✅ Web Vitals cargado correctamente');
                resolve();
            };
            script.onerror = () => {
                console.warn('❌ No se pudo cargar web-vitals');
                reject(new Error('Failed to load web-vitals'));
            };
            
            document.head.appendChild(script);
        });
    }

    initializeWebVitals() {
        try {
            if (typeof webVitals !== 'undefined') {
                webVitals.getCLS(this.sendToAnalytics.bind(this, 'cls'));
                webVitals.getFID(this.sendToAnalytics.bind(this, 'fid'));
                webVitals.getLCP(this.sendToAnalytics.bind(this, 'lcp'));
                webVitals.getFCP(this.sendToAnalytics.bind(this, 'fcp'));
                webVitals.getTTFB(this.sendToAnalytics.bind(this, 'ttfb'));
                console.log('✅ Web Vitals inicializado');
            }
        } catch (error) {
            console.warn('❌ Error inicializando Web Vitals:', error);
            this.initializeNativeMetrics();
        }
    }

    initializeNativeMetrics() {
        console.log('🔧 Usando métricas nativas de Performance API');
        // Las métricas nativas ya están siendo monitoreadas por los métodos anteriores
    }

    // ===== OPTIMIZACIONES CDN =====
    setupCDNOptimizations() {
        // Preconectar a CDNs críticas
        this.preconnectCDN('https://fonts.googleapis.com');
        this.preconnectCDN('https://fonts.gstatic.com');
        this.preconnectCDN('https://cdnjs.cloudflare.com');
        
        // Precargar recursos críticos
        this.preloadCriticalResources();
    }

    preconnectCDN(url) {
        try {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = url;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        } catch (error) {
            console.warn('❌ Error preconectando a CDN:', url, error);
        }
    }

    preloadCriticalResources() {
        const criticalResources = [
            '/styles.css',
            '/script.js',
            '/logo.jpg'
        ];
        
        criticalResources.forEach(resource => {
            try {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = resource;
                
                if (resource.endsWith('.css')) {
                    link.as = 'style';
                } else if (resource.endsWith('.js')) {
                    link.as = 'script';
                } else if (resource.endsWith('.jpg') || resource.endsWith('.png')) {
                    link.as = 'image';
                }
                
                document.head.appendChild(link);
            } catch (error) {
                console.warn('❌ Error precargando recurso:', resource, error);
            }
        });
    }

    // ===== ANALYTICS INTEGRATION =====
    sendToAnalytics(metricName, value) {
        try {
            // Enviar a Google Analytics 4
            if (typeof gtag !== 'undefined') {
                gtag('event', 'core_web_vital', {
                    event_category: 'Web Vitals',
                    event_label: metricName,
                    value: Math.round(value),
                    non_interaction: true
                });
            }
            
            // Enviar a sistema de estadísticas interno
            if (window.statsSystem && typeof window.statsSystem.trackEvent === 'function') {
                window.statsSystem.trackEvent('performance_metric', 'lighthouse', metricName, value);
            }
            
            // Guardar en localStorage para reportes
            this.saveMetric(metricName, value);
        } catch (error) {
            console.warn('❌ Error enviando analytics:', error);
        }
    }

    saveMetric(metricName, value) {
        try {
            const metrics = JSON.parse(localStorage.getItem('odam-lighthouse-metrics') || '{}');
            metrics[metricName] = {
                value: value,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('odam-lighthouse-metrics', JSON.stringify(metrics));
        } catch (error) {
            console.warn('❌ Error guardando métrica:', error);
        }
    }

    // ===== REPORTES Y EXPORTACIÓN =====
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            metrics: this.metrics,
            performanceScore: this.calculatePerformanceScore(),
            accessibilityScore: this.calculateAccessibilityScore(),
            seoScore: this.calculateSEOScore(),
            bestPracticesScore: this.calculateBestPracticesScore(),
            recommendations: this.generateRecommendations()
        };
        
        return report;
    }

    calculatePerformanceScore() {
        const weights = {
            lcp: 0.25,
            fid: 0.25,
            cls: 0.25,
            fcp: 0.15,
            audioLoadTime: 0.10
        };
        
        let score = 0;
        let totalWeight = 0;
        
        Object.keys(weights).forEach(metric => {
            if (this.metrics.performance[metric] !== undefined) {
                score += this.normalizeMetric(metric, this.metrics.performance[metric]) * weights[metric];
                totalWeight += weights[metric];
            }
        });
        
        // Ajustar por pesos faltantes
        if (totalWeight > 0) {
            score = score / totalWeight;
        }
        
        return Math.round(score * 100);
    }

    calculateAccessibilityScore() {
        let score = 100;
        
        // Verificar características críticas
        if (!document.documentElement.hasAttribute('lang')) score -= 10;
        if (document.querySelector('img:not([alt])')) score -= 15;
        if (!document.querySelector('meta[name="viewport"]')) score -= 10;
        if (document.querySelector('button:not([aria-label])')) score -= 10;
        
        return Math.max(0, score);
    }

    calculateSEOScore() {
        let score = 100;
        
        // Verificar elementos SEO críticos
        if (!document.querySelector('title')) score -= 20;
        if (!document.querySelector('meta[name="description"]')) score -= 15;
        if (!document.querySelector('meta[property="og:title"]')) score -= 10;
        if (!document.querySelector('link[rel="canonical"]')) score -= 10;
        if (!document.querySelector('script[type="application/ld+json"]')) score -= 15;
        
        return Math.max(0, score);
    }

    calculateBestPracticesScore() {
        let score = 100;
        
        // Verificar mejores prácticas
        if (document.querySelector('script[src*="http:"]')) score -= 10;
        if (!document.querySelector('link[rel="manifest"]')) score -= 10;
        
        return Math.max(0, score);
    }

    normalizeMetric(metric, value) {
        const thresholds = {
            lcp: { good: 2500, poor: 4000 },
            fid: { good: 100, poor: 300 },
            cls: { good: 0.1, poor: 0.25 },
            fcp: { good: 1000, poor: 3000 },
            audioLoadTime: { good: 1000, poor: 5000 }
        };
        
        const threshold = thresholds[metric];
        if (!threshold) return 1;
        
        if (value <= threshold.good) return 1;
        if (value >= threshold.poor) return 0;
        
        // Interpolación lineal entre good y poor
        return 1 - ((value - threshold.good) / (threshold.poor - threshold.good));
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Recomendaciones basadas en métricas
        if (this.metrics.performance.lcp > 2500) {
            recommendations.push({
                category: 'performance',
                priority: 'high',
                title: 'Optimizar Largest Contentful Paint',
                description: 'El LCP está por encima del umbral recomendado.',
                action: 'Usa imágenes WebP e implementa lazy loading.'
            });
        }
        
        if (this.metrics.performance.cls > 0.1) {
            recommendations.push({
                category: 'performance',
                priority: 'high',
                title: 'Reducir Cumulative Layout Shift',
                description: 'El CLS está afectando la experiencia de usuario.',
                action: 'Define dimensiones explícitas para imágenes.'
            });
        }
        
        if (!this.metrics.performance.serviceWorker) {
            recommendations.push({
                category: 'pwa',
                priority: 'medium',
                title: 'Implementar Service Worker',
                description: 'El Service Worker no está activo.',
                action: 'Registra el Service Worker correctamente.'
            });
        }
        
        return recommendations;
    }

    // ===== EXPORTACIÓN PARA USO EXTERNO =====
    exportConfig() {
        return {
            lighthouseConfig: this.config,
            currentMetrics: this.metrics,
            report: this.generateReport(),
            version: '1.0.1'
        };
    }

    // ===== MÉTODOS ESTÁTICOS PARA USO RÁPIDO =====
    static runQuickAudit() {
        const instance = new LighthouseConfig();
        return instance.generateReport();
    }

    static getPerformanceScore() {
        const instance = new LighthouseConfig();
        return instance.calculatePerformanceScore();
    }

    static getRecommendations() {
        const instance = new LighthouseConfig();
        return instance.generateRecommendations();
    }
}

// ===== INICIALIZACIÓN AUTOMÁTICA CORREGIDA =====
document.addEventListener('DOMContentLoaded', function() {
    try {
        window.LighthouseConfig = LighthouseConfig;
        window.lighthouseAudit = new LighthouseConfig();
        
        console.log('⚡ Lighthouse Config: Inicializado correctamente v1.0.1');
    } catch (error) {
        console.error('❌ Error inicializando Lighthouse Config:', error);
    }
});

// ===== POLYFILLS MEJORADOS PARA NAVEGADORES MÓVILES =====
if (!window.PerformanceObserver) {
    console.warn('⚠️ PerformanceObserver no soportado - métricas limitadas');
    // Polyfill básico para evitar errores
    window.PerformanceObserver = class {
        observe() { return null; }
        disconnect() { return null; }
    };
}

// ===== EXPORTACIÓN PARA MÓDULOS =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LighthouseConfig;
}
