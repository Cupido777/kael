// stats-system.js - Sistema de estadísticas corregido para multipágina
class StatsSystem {
    constructor() {
        this.statsContainer = document.getElementById('stats');
    }

    init() {
        if (!this.statsContainer) {
            console.warn('❌ Contenedor de estadísticas no encontrado');
            return;
        }
        
        this.loadStats();
    }

    async loadStats() {
        try {
            // Tu lógica de estadísticas aquí
            this.statsContainer.innerHTML = `
                <div class="stats-content">
                    <h3>Estadísticas Bíblicas</h3>
                    <p>Sistema de interacción cargado correctamente.</p>
                </div>
            `;
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    }
}
