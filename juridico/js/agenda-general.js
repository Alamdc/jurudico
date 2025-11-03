// Lógica para la página de Agenda General
class AgendaGeneralManager {
    constructor() {
        this.eventos = [];
        this.filtrosActivos = {};
        this.vistaActual = 'todos';
        this.semanaActual = new Date();
        this.init();
    }

    init() {
        this.cargarEventos();
        this.inicializarEventos();
        this.mostrarVistaSemana();
        this.actualizarEstadisticas();
    }

    cargarEventos() {
        // (Se mantiene igual, datos de ejemplo)
        this.eventos = [ /* ... eventos ... */ ];
        this.mostrarEventos();
    }

    inicializarEventos() {
        // (Sin cambios)
        document.querySelectorAll('.view-controls .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.cambiarVista(e.target.getAttribute('data-view'));
            });
        });

        this.configurarFiltros();

        document.getElementById('search-agenda').addEventListener('input', (e) => {
            this.filtrosActivos.busqueda = e.target.value;
            this.mostrarEventos();
        });

        this.configurarModal();
    }

    configurarFiltros() {
        // 🔹 Se agrega el filtro de mes
        const filtros = ['filter-fecha', 'filter-mes', 'filter-prioridad', 'filter-materia', 'filter-estado'];

        filtros.forEach(filtroId => {
            const filtro = document.getElementById(filtroId);
            if (filtro) {
                filtro.addEventListener('change', (e) => {
                    const campo = filtroId.replace('filter-', '');
                    this.filtrosActivos[campo] = e.target.value || null;
                    this.mostrarEventos();
                });
            }
        });
    }

    aplicarFiltros(eventos) {
        let filtrados = eventos;

        if (this.vistaActual !== 'todos') {
            filtrados = filtrados.filter(e => e.tipo === this.vistaActual);
        }

        if (this.filtrosActivos.fecha) {
            filtrados = this.filtrarPorFecha(filtrados, this.filtrosActivos.fecha);
        }

        // 🔹 Nuevo filtro por mes
        if (this.filtrosActivos.mes !== null && this.filtrosActivos.mes !== '') {
            const mesSeleccionado = parseInt(this.filtrosActivos.mes);
            filtrados = filtrados.filter(e => {
                const fecha = new Date(e.fecha);
                return fecha.getMonth() === mesSeleccionado;
            });
        }

        if (this.filtrosActivos.prioridad) {
            filtrados = filtrados.filter(e => e.prioridad === this.filtrosActivos.prioridad);
        }

        if (this.filtrosActivos.materia) {
            filtrados = filtrados.filter(e => e.materia === this.filtrosActivos.materia);
        }

        if (this.filtrosActivos.estado) {
            filtrados = filtrados.filter(e => e.estado === this.filtrosActivos.estado);
        }

        if (this.filtrosActivos.busqueda) {
            const termino = this.filtrosActivos.busqueda.toLowerCase();
            filtrados = filtrados.filter(e =>
                e.titulo.toLowerCase().includes(termino) ||
                e.expediente.toLowerCase().includes(termino) ||
                e.tribunal.toLowerCase().includes(termino) ||
                e.materia.toLowerCase().includes(termino)
            );
        }

        return filtrados;
    }

    // ... resto del código sin cambios ...
}

let agendaGeneral;
function initAgendaGeneral() {
    agendaGeneral = new AgendaGeneralManager();
}
