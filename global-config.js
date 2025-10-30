// global-config.js - Configuración global para todas las páginas
window.ODAM_CONFIG = {
    // Configuración global
    siteName: 'ODAM Producción Musical',
    author: 'Osklin De Alba',
    year: '2022',
    
    // URLs importantes
    whatsapp: 'https://wa.me/573142905621?text=Hola%20ODAM%2C%20quiero%20informaci%C3%B3n%20sobre%20tus%20servicios.',
    email: 'odeam@osklindealba.com',
    
    // Redes sociales
    social: {
        facebook: 'https://www.facebook.com/share/17AK7d5HDr/',
        tiktok: 'https://www.tiktok.com/@osklin27',
        threads: 'https://www.threads.net/@osklin27',
        instagram: 'https://www.instagram.com/osklin27'
    },
    
    // Configuración PWA
    pwa: {
        enabled: true,
        appName: 'ODAM App'
    }
};

// Función para cargar recursos consistentemente
window.loadODAMResource = function(resource) {
    return new Promise((resolve, reject) => {
        if (resource.endsWith('.css')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = resource;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        } else {
            const script = document.createElement('script');
            script.src = resource;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        }
    });
};
