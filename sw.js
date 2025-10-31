/**
 * ODAM - Service Worker Optimizado
 * Cache estratégico para producción musical
 * @version 3.0.0
 */

const CACHE_NAME = 'odam-music-v3.0.0';
const API_CACHE_NAME = 'odam-api-v1.0.0';

// Recursos críticos para cache inmediato
const CRITICAL_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/global-config.js',
    '/logo.jpg',
    '/logo-192x192.png',
    '/logo-512x512.png',
    '/manifest.json'
];

// Estrategias de cache
const CACHE_STRATEGIES = {
    CRITICAL: 'network-first',
    ASSETS: 'stale-while-revalidate',
    IMAGES: 'cache-first',
    API: 'network-first'
};

// Instalación - Cache de recursos críticos
self.addEventListener('install', (event) => {
    console.log('🚀 Service Worker instalando...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Cacheando recursos críticos');
                return cache.addAll(CRITICAL_ASSETS);
            })
            .then(() => {
                console.log('✅ Recursos críticos cacheados');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Error en instalación SW:', error);
            })
    );
});

// Activación - Limpieza de caches antiguos
self.addEventListener('activate', (event) => {
    console.log('🔥 Service Worker activado');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
                        console.log('🗑️ Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker listo para controlar clientes');
            return self.clients.claim();
        })
    );
});

// Estrategia: Network First con fallback a cache
const networkFirst = async (request) => {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        throw new Error('Network response not ok');
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
};

// Estrategia: Cache First con actualización en background
const cacheFirst = async (request) => {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // Actualizar cache en background
        fetch(request).then((networkResponse) => {
            if (networkResponse.ok) {
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, networkResponse);
                });
            }
        });
        return cachedResponse;
    }
    
    return fetch(request);
};

// Estrategia: Stale While Revalidate
const staleWhileRevalidate = async (request) => {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => {
        // Silenciar errores de fetch
    });

    return cachedResponse || fetchPromise;
};

// Interceptar fetch requests
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Determinar estrategia basada en el tipo de recurso
    let strategy = CACHE_STRATEGIES.ASSETS;

    if (CRITICAL_ASSETS.includes(url.pathname)) {
        strategy = CACHE_STRATEGIES.CRITICAL;
    } else if (request.destination === 'image') {
        strategy = CACHE_STRATEGIES.IMAGES;
    } else if (url.pathname.startsWith('/api/')) {
        strategy = CACHE_STRATEGIES.API;
    } else if (request.destination === 'style' || request.destination === 'script') {
        strategy = CACHE_STRATEGIES.ASSETS;
    }

    // Aplicar estrategia
    switch (strategy) {
        case 'network-first':
            event.respondWith(networkFirst(request));
            break;
        case 'cache-first':
            event.respondWith(cacheFirst(request));
            break;
        case 'stale-while-revalidate':
            event.respondWith(staleWhileRevalidate(request));
            break;
        default:
            event.respondWith(fetch(request));
    }
});

// Manejo de mensajes desde la app
self.addEventListener('message', (event) => {
    const { type, payload } = event.data;

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_CACHE_STATUS':
            event.ports[0].postMessage({
                type: 'CACHE_STATUS',
                payload: {
                    version: CACHE_NAME,
                    criticalAssets: CRITICAL_ASSETS.length
                }
            });
            break;
            
        case 'CLEAR_CACHE':
            caches.delete(CACHE_NAME).then(() => {
                event.ports[0].postMessage({
                    type: 'CACHE_CLEARED'
                });
            });
            break;
    }
});

// Manejo de sync en background
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    console.log('🔄 Realizando sincronización en background');
    // Aquí puedes agregar lógica para sincronizar datos
}

// Manejo de push notifications
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: 'logo-192x192.png',
        badge: 'logo-192x192.png',
        image: data.image,
        data: data.url,
        actions: [
            {
                action: 'open',
                title: 'Abrir'
            },
            {
                action: 'close',
                title: 'Cerrar'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow(event.notification.data)
        );
    }
});
