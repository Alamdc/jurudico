// Lógica para la página de detalle del asunto - Versión Optimizada
class AsuntoDetalleManager {
    constructor() {
        this.asunto = null;
        this.asuntoId = null;
        this.init();
    }

    init() {
        this.obtenerIdAsunto();
        this.cargarAsunto();
        this.inicializarEventos();
    }

    obtenerIdAsunto() {
        const urlParams = new URLSearchParams(window.location.search);
        this.asuntoId = parseInt(urlParams.get('id'));
        
        if (!this.asuntoId) {
            this.mostrarError('No se especificó un ID de asunto válido');
            return;
        }
    }

    cargarAsunto() {
        const asuntosGuardados = JSON.parse(localStorage.getItem('asuntos') || '[]');
        this.asunto = asuntosGuardados.find(a => a.id === this.asuntoId);

        if (!this.asunto) {
            this.mostrarError('No se encontró el asunto solicitado');
            return;
        }

        this.mostrarVista360();
        this.actualizarTitulo();
        this.cargarDatosAdicionales();
    }

    mostrarVista360() {
        const container = document.getElementById('vista-360-container');
        
        if (!this.asunto) {
            container.innerHTML = this.generarHTMLerror();
            return;
        }

        container.innerHTML = this.generarVista360HTML();
        this.configurarEventosVista360();
    }

    generarVista360HTML() {
        return `
            <div class="vista-360">
                <!-- Header del caso -->
                <div class="caso-header">
                    <div class="caso-info">
                        <h2>Expediente: ${this.asunto.expediente}</h2>
                        <div class="caso-estado">
                            <span class="badge badge-${this.asunto.materia.toLowerCase()}">${this.asunto.materia}</span>
                            <span class="badge badge-${this.asunto.prioridad.toLowerCase()}">${this.asunto.prioridad} Prioridad</span>
                            <span class="badge badge-activo">${this.asunto.estado}</span>
                        </div>
                    </div>
                    <div class="caso-meta">
                        <p><strong>Abogado:</strong> ${this.asunto.abogado}</p>
                        <p><strong>Demandado:</strong> ${this.asunto.demandado}</p>
                        <p><strong>Fecha creación:</strong> ${this.formatDate(this.asunto.fechaCreacion)}</p>
                        <p><strong>Cliente:</strong> ${this.asunto.nombre}</p>
                    </div>
                </div>
                
                <!-- Estadísticas -->
                <div class="caso-stats">
                    <div class="stat-card">
                        <i class="fas fa-clock"></i>
                        <div class="stat-number">${this.asunto.stats.terminos}</div>
                        <div class="stat-label">Términos Pendientes</div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-gavel"></i>
                        <div class="stat-number">${this.asunto.stats.audiencias}</div>
                        <div class="stat-label">Audiencias Programadas</div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-file"></i>
                        <div class="stat-number">${this.asunto.stats.documentos}</div>
                        <div class="stat-label">Documentos</div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-calendar"></i>
                        <div class="stat-number">${this.asunto.stats.dias}</div>
                        <div class="stat-label">Días Transcurridos</div>
                    </div>
                </div>
                
                <!-- Línea de tiempo -->
                <div class="timeline-caso">
                    <div class="timeline-header">
                        <h3>Línea de Tiempo del Caso</h3>
                        <button class="btn btn-sm btn-primary" id="btn-agregar-evento">
                            <i class="fas fa-plus"></i> Agregar Evento
                        </button>
                    </div>
                    <div class="timeline">
                        ${this.asunto.timeline && this.asunto.timeline.length > 0 ? 
                            this.asunto.timeline.map(item => this.generarTimelineItem(item)).join('') :
                            '<div class="timeline-empty">No hay eventos registrados</div>'
                        }
                    </div>
                </div>

                <!-- Documentos por fase -->
                <div class="documentos-section">
                    <div class="documentos-header">
                        <h3>Documentos del asunto</h3>
                        <button class="btn btn-sm btn-primary" id="btn-subir-documento">
                            <i class="fas fa-upload"></i> Subir Documento
                        </button>
                    </div>
                    <div class="documentos-fases">
                        ${this.generarDocumentosFases()}
                    </div>
                </div>
            </div>
        `;
    }

    // ... (el resto del código se mantiene igual)
    generarTimelineItem(item) {
        return `
            <div class="timeline-item ${item.estado}">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <div class="timeline-date">${this.formatDate(item.fecha)}</div>
                    <div class="timeline-title">${item.titulo}</div>
                    <div class="timeline-desc">${item.descripcion}</div>
                    ${item.documentos && item.documentos.length > 0 ? `
                        <div class="timeline-docs">
                            ${item.documentos.map(doc => `
                                <span class="doc-badge"><i class="fas fa-file-pdf"></i> ${doc}</span>
                            `).join('')}
                        </div>
                    ` : ''}
                    ${item.alerta ? `
                        <div class="timeline-alerta">⚠️ ${item.alerta}</div>
                    ` : ''}
                    <div class="timeline-actions">
                        <button class="btn btn-sm btn-warning editar-evento" data-id="${item.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger eliminar-evento" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    generarDocumentosFases() {
        if (!this.asunto.documentos) {
            return '<div class="fase-empty">No hay documentos registrados</div>';
        }

        return Object.entries(this.asunto.documentos).map(([fase, documentos]) => `
            <div class="fase">
                <h4>${this.capitalize(fase)}</h4>
                <div class="documentos-list">
                    ${documentos.length > 0 ? 
                        documentos.map(doc => this.generarDocumentoItem(doc)).join('') :
                        '<div class="documento-empty">No hay documentos</div>'
                    }
                </div>
            </div>
        `).join('');
    }

    generarDocumentoItem(doc) {
        return `
            <div class="documento-item">
                <i class="fas fa-file-${doc.tipo || 'pdf'}"></i>
                <span class="documento-nombre">${doc.nombre}</span>
                <div class="documento-actions">
                    <button class="btn btn-sm btn-primary">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-sm btn-warning">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    configurarEventosVista360() {
        document.getElementById('btn-editar-asunto')?.addEventListener('click', () => {
            this.editarAsunto();
        });

        document.getElementById('btn-agregar-evento')?.addEventListener('click', () => {
            this.agregarEvento();
        });

        document.getElementById('btn-subir-documento')?.addEventListener('click', () => {
            this.subirDocumento();
        });
    }

    editarAsunto() {
        alert('Funcionalidad de edición de asunto - Por implementar');
    }

    agregarEvento() {
        alert('Funcionalidad de agregar evento - Por implementar');
    }

    subirDocumento() {
        alert('Funcionalidad de subir documento - Por implementar');
    }

    inicializarEventos() {
        const closePanel = document.getElementById('close-panel-recordatorios');
        if (closePanel) {
            closePanel.addEventListener('click', () => {
                document.getElementById('panel-recordatorios').classList.remove('mostrar');
            });
        }
    }

    actualizarTitulo() {
        if (this.asunto) {
            document.getElementById('titulo-asunto').textContent = 
                `Detalles de asunto - ${this.asunto.expediente} - ${this.asunto.nombre}`;
            document.title = `Detalles de asunto - ${this.asunto.expediente} - Agenda Legal`;
        }
    }

    cargarDatosAdicionales() {
        this.cargarDocumentosRelacionados();
        this.cargarActividadReciente();
    }

    cargarDocumentosRelacionados() {
        const container = document.getElementById('documentos-relacionados');
        if (!container) return;

        const documentos = [
            { nombre: 'Contrato principal.pdf', tipo: 'pdf', fecha: '2025-01-10' },
            { nombre: 'Anexo técnico.docx', tipo: 'word', fecha: '2025-01-12' },
            { nombre: 'Evidencia fotográfica.zip', tipo: 'archive', fecha: '2025-01-15' }
        ];

        let html = '';
        documentos.forEach(doc => {
            html += `
                <div class="documento-relacionado">
                    <i class="fas fa-file-${doc.tipo}"></i>
                    <div class="documento-info">
                        <div class="documento-nombre">${doc.nombre}</div>
                        <div class="documento-fecha">${this.formatDate(doc.fecha)}</div>
                    </div>
                    <button class="btn btn-sm btn-primary">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    cargarActividadReciente() {
        const container = document.getElementById('actividad-reciente-list');
        if (!container) return;

        const actividad = [
            { accion: 'Documento agregado', usuario: 'Lic. Martínez', fecha: '2025-01-20 14:30' },
            { accion: 'Evento programado', usuario: 'Sistema', fecha: '2025-01-18 16:45' }
        ];

        let html = '';
        actividad.forEach(item => {
            html += `
                <div class="actividad-item">
                    <div class="actividad-icon">
                        <i class="fas fa-circle"></i>
                    </div>
                    <div class="actividad-content">
                        <div class="actividad-text">${item.accion}</div>
                        <div class="actividad-meta">
                            <span>por ${item.usuario}</span>
                            <span>•</span>
                            <span>${item.fecha}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    guardarAsunto() {
        const asuntos = JSON.parse(localStorage.getItem('asuntos') || '[]');
        const index = asuntos.findIndex(a => a.id === this.asunto.id);
        
        if (index !== -1) {
            asuntos[index] = this.asunto;
        } else {
            asuntos.push(this.asunto);
        }
        
        localStorage.setItem('asuntos', JSON.stringify(asuntos));
    }

    mostrarError(mensaje) {
        const container = document.getElementById('vista-360-container');
        container.innerHTML = this.generarHTMLerror(mensaje);
    }

    generarHTMLerror(mensaje = 'Error al cargar el asunto') {
        return `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <h3>${mensaje}</h3>
                <p>No se pudo cargar la información del asunto solicitado.</p>
                <a href="asuntos.html" class="btn btn-primary">
                    <i class="fas fa-arrow-left"></i> Volver a Asuntos
                </a>
            </div>
        `;
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Inicializar la aplicación
let asuntoDetalle;

function initAsuntoDetalle() {
    asuntoDetalle = new AsuntoDetalleManager();
}