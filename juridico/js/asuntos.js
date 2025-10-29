// Lógica para la página de lista de asuntos
class AsuntosManager {
    constructor() {
        this.asuntos = [];
        this.filtrosActivos = {};
        this.init();
    }

    init() {
        this.cargarAsuntos();
        this.inicializarEventos();
        this.iniciarRecordatoriosAutomaticos();
        this.cargarGestorDocumentos();
    }

    cargarAsuntos() {
        // Cargar desde localStorage o datos de ejemplo
        const asuntosGuardados = localStorage.getItem('asuntos');
        
        if (asuntosGuardados) {
            this.asuntos = JSON.parse(asuntosGuardados);
        } else {
            // Datos de ejemplo
            this.asuntos = [
                {
                    id: 1,
                    expediente: '2375/2025',
                    nombre: 'Ortega Ibarra Juan Carlos',
                    materia: 'Laboral',
                    estado: 'Activo',
                    prioridad: 'Alta',
                    abogado: 'Lic. Martínez',
                    demandado: 'Empresa Constructora S.A. de C.V.',
                    fechaCreacion: '2025-01-10',
                    descripcion: 'Despido injustificado - Reinstalación',
                    stats: {
                        documentos: 15,
                        audiencias: 3,
                        terminos: 2,
                        dias: 45
                    },
                    ultimaActividad: '2025-01-15'
                },
                {
                    id: 2,
                    expediente: '2012/2025',
                    nombre: 'Valdez Sánchez María Elena',
                    materia: 'Penal',
                    estado: 'Activo',
                    prioridad: 'Media',
                    abogado: 'Lic. González',
                    demandado: 'Comercializadora del Sureste S.A.',
                    fechaCreacion: '2025-01-12',
                    descripcion: 'Amparo indirecto - Suspensión definitiva',
                    stats: {
                        documentos: 8,
                        audiencias: 1,
                        terminos: 1,
                        dias: 43
                    },
                    ultimaActividad: '2025-01-18'
                },
                {
                    id: 3,
                    expediente: '1595/2025',
                    nombre: 'Sosa Uc Roberto',
                    materia: 'Mercantil',
                    estado: 'En espera',
                    prioridad: 'Baja',
                    abogado: 'Lic. Rodríguez',
                    demandado: 'Distribuidora Nacional S.A.',
                    fechaCreacion: '2025-01-08',
                    descripcion: 'Incumplimiento de contrato',
                    stats: {
                        documentos: 5,
                        audiencias: 0,
                        terminos: 0,
                        dias: 47
                    },
                    ultimaActividad: '2025-01-08'
                }
            ];
            this.guardarAsuntos();
        }

        this.mostrarAsuntos();
    }

    mostrarAsuntos() {
        const grid = document.getElementById('asuntos-grid');
        const noResultados = document.getElementById('no-resultados');

        // Aplicar filtros
        let asuntosFiltrados = this.aplicarFiltros(this.asuntos);

        if (asuntosFiltrados.length === 0) {
            grid.style.display = 'none';
            noResultados.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        noResultados.style.display = 'none';

        let html = '';
        asuntosFiltrados.forEach(asunto => {
            html += this.generarCardAsunto(asunto);
        });

        grid.innerHTML = html;
        this.configurarEventosAsuntos();
    }

    generarCardAsunto(asunto) {
        const fechaCreacion = this.formatDate(asunto.fechaCreacion);
        const ultimaActividad = this.formatDate(asunto.ultimaActividad);
        
        return `
            <div class="asunto-card ${asunto.prioridad.toLowerCase()}" data-id="${asunto.id}">
                <div class="asunto-header">
                    <h3>${asunto.expediente} - ${asunto.nombre}</h3>
                    <div class="asunto-badges">
                        <span class="badge badge-${asunto.materia.toLowerCase()}">${asunto.materia}</span>
                        <span class="badge badge-${asunto.prioridad.toLowerCase()}">${asunto.prioridad}</span>
                        <span class="badge badge-${asunto.estado.toLowerCase().replace(' ', '-')}">${asunto.estado}</span>
                    </div>
                </div>
                <div class="asunto-body">
                    <p><strong>Demandado:</strong> ${asunto.demandado}</p>
                    <p><strong>Abogado:</strong> ${asunto.abogado}</p>
                    <p><strong>Descripción:</strong> ${asunto.descripcion}</p>
                    <div class="asunto-stats">
                        <span><i class="fas fa-file"></i> ${asunto.stats.documentos} docs</span>
                        <span><i class="fas fa-gavel"></i> ${asunto.stats.audiencias} aud.</span>
                        <span><i class="fas fa-clock"></i> ${asunto.stats.terminos} términos</span>
                        <span><i class="fas fa-calendar"></i> ${asunto.stats.dias} días</span>
                    </div>
                    <div class="asunto-meta">
                        <small>Creado: ${fechaCreacion}</small>
                        <small>Última actividad: ${ultimaActividad}</small>
                    </div>
                </div>
                <div class="asunto-actions">
                    <a href="asunto-detalle.html?id=${asunto.id}" class="btn btn-primary btn-sm">
                        <i class="fas fa-eye"></i> Asunto detallado
                    </a>
                </div>
            </div>
        `;
    }

    aplicarFiltros(asuntos) {
        let filtrados = asuntos;

        // Filtrar por materia
        if (this.filtrosActivos.materia) {
            filtrados = filtrados.filter(asunto => asunto.materia === this.filtrosActivos.materia);
        }

        // Filtrar por estado
        if (this.filtrosActivos.estado) {
            filtrados = filtrados.filter(asunto => asunto.estado === this.filtrosActivos.estado);
        }

        // Filtrar por prioridad
        if (this.filtrosActivos.prioridad) {
            filtrados = filtrados.filter(asunto => asunto.prioridad === this.filtrosActivos.prioridad);
        }

        // Filtrar por abogado
        if (this.filtrosActivos.abogado) {
            filtrados = filtrados.filter(asunto => asunto.abogado === this.filtrosActivos.abogado);
        }

        // Filtrar por búsqueda de texto
        if (this.filtrosActivos.busqueda) {
            const termino = this.filtrosActivos.busqueda.toLowerCase();
            filtrados = filtrados.filter(asunto => 
                asunto.expediente.toLowerCase().includes(termino) ||
                asunto.nombre.toLowerCase().includes(termino) ||
                asunto.demandado.toLowerCase().includes(termino) ||
                asunto.descripcion.toLowerCase().includes(termino)
            );
        }

        return filtrados;
    }

    configurarEventosAsuntos() {
        // Botón nuevo asunto
        document.getElementById('nuevo-asunto').addEventListener('click', () => {
            this.crearNuevoAsunto();
        });

        // Botón crear primer asunto
        document.getElementById('btn-crear-primer-asunto').addEventListener('click', () => {
            this.crearNuevoAsunto();
        });

        // Filtros
        this.configurarFiltros();

        // Búsqueda global
        const buscador = document.getElementById('buscador-global');
        if (buscador) {
            buscador.addEventListener('input', (e) => {
                this.filtrosActivos.busqueda = e.target.value;
                this.mostrarAsuntos();
            });
        }

        // Búsqueda por voz
        const btnVoz = document.getElementById('btn-voz');
        if (btnVoz) {
            btnVoz.addEventListener('click', () => {
                this.iniciarBusquedaVoz();
            });
        }
    }

    configurarFiltros() {
        const filtros = ['filter-materia-asunto', 'filter-estado-asunto', 'filter-prioridad-asunto', 'filter-abogado-asunto'];
        
        filtros.forEach(filtroId => {
            const filtro = document.getElementById(filtroId);
            if (filtro) {
                filtro.addEventListener('change', (e) => {
                    const campo = filtroId.replace('filter-', '').replace('-asunto', '');
                    this.filtrosActivos[campo] = e.target.value || null;
                    this.mostrarAsuntos();
                });
            }
        });
    }

    crearNuevoAsunto() {
        // Redirigir a página de creación o mostrar modal
        const nuevoId = this.generarNuevoId();
        const url = `asunto-detalle.html?id=${nuevoId}&nuevo=true`;
        window.location.href = url;
    }

    generarNuevoId() {
        return Math.max(...this.asuntos.map(a => a.id), 0) + 1;
    }

    eliminarAsunto(asuntoId) {
        if (confirm('¿Estás seguro de que quieres eliminar este asunto? Esta acción no se puede deshacer.')) {
            this.asuntos = this.asuntos.filter(asunto => asunto.id !== asuntoId);
            this.guardarAsuntos();
            this.mostrarAsuntos();
        }
    }

    cargarGestorDocumentos() {
        const expedientesContent = document.getElementById('sidebar-expedientes-content');
        let html = '';

        this.asuntos.forEach(asunto => {
            html += `
                <div class="sidebar-document-item" data-id="${asunto.id}">
                    <i class="fas fa-file-pdf"></i>
                    <span>${asunto.expediente} - ${asunto.nombre}</span>
                </div>
            `;
        });

        expedientesContent.innerHTML = html;

        // Configurar eventos de los documentos del sidebar
        document.querySelectorAll('#sidebar-expedientes-content .sidebar-document-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.getAttribute('data-id'));
                window.location.href = `asunto-detalle.html?id=${id}`;
            });
        });
    }

    iniciarBusquedaVoz() {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Tu navegador no soporta búsqueda por voz');
            return;
        }

        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.start();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('buscador-global').value = transcript;
            this.filtrosActivos.busqueda = transcript;
            this.mostrarAsuntos();
        };

        recognition.onerror = (event) => {
            console.error('Error en reconocimiento de voz:', event.error);
        };
    }

    iniciarRecordatoriosAutomaticos() {
        const recordatorios = new RecordatoriosAutomaticos();
        setInterval(() => {
            this.actualizarRecordatorios(recordatorios);
        }, 60 * 60 * 1000);

        this.actualizarRecordatorios(recordatorios);
    }

    actualizarRecordatorios(recordatorios) {
        const recordatoriosCalculados = recordatorios.calcularRecordatorios(this.asuntos);
        this.mostrarPanelRecordatorios(recordatoriosCalculados);
    }

    mostrarPanelRecordatorios(recordatorios) {
        const panel = document.getElementById('panel-recordatorios');
        const lista = document.getElementById('lista-recordatorios');
        const contador = document.getElementById('contador-recordatorios');

        if (recordatorios.length === 0) {
            panel.classList.remove('mostrar');
            return;
        }

        contador.textContent = recordatorios.length;
        
        let html = '';
        recordatorios.forEach(recordatorio => {
            html += `
                <div class="recordatorio-item recordatorio-${recordatorio.tipo.toLowerCase()}">
                    <strong>${recordatorio.expediente}</strong><br>
                    ${recordatorio.mensaje}<br>
                    <small>Vence: ${this.formatDate(recordatorio.fecha)}</small>
                </div>
            `;
        });

        lista.innerHTML = html;
        panel.classList.add('mostrar');
    }

    guardarAsuntos() {
        localStorage.setItem('asuntos', JSON.stringify(this.asuntos));
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }
}

// Inicializar la aplicación
let asuntosManager;

function initAsuntos() {
    asuntosManager = new AsuntosManager();
    
    // Configurar cierre del panel de recordatorios
    const closePanel = document.getElementById('close-panel-recordatorios');
    if (closePanel) {
        closePanel.addEventListener('click', () => {
            document.getElementById('panel-recordatorios').classList.remove('mostrar');
        });
    }
}