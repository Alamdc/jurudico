function initTerminos() {
    // Cargar datos de términos
    loadTerminos();
    
    // Configurar búsqueda
    setupSearchTerminos();
    
    // Configurar filtros
    setupFiltersTerminos();
    
    // El botón para nuevo término ahora está manejado en el HTML
}

function loadTerminos() {
    const tbody = document.getElementById('terminos-body');
    
    // Datos de ejemplo
    const terminos = [
        {
            id: 1,
            fechaIngreso: '2025-01-10',
            fechaVencimiento: '2025-01-25',
            expediente: '2375/2025',
            actor: 'Ortega Ibarra Juan Carlos',
            asunto: 'Despido injustificado',
            prestacion: 'Reinstalación',
            tribunal: 'Primer Tribunal Colegiado en Materia Laboral',
            abogado: 'Lic. Martínez',
            estado: 'Ciudad de México',
            prioridad: 'Alta',
            estatus: 'Proyectista'
        },
        {
            id: 2,
            fechaIngreso: '2025-01-12',
            fechaVencimiento: '2025-01-27',
            expediente: '2012/2025',
            actor: 'Valdez Sánchez María Elena',
            asunto: 'Amparo indirecto',
            prestacion: 'Suspensión definitiva',
            tribunal: 'Tercer Tribunal de Enjuiciamiento',
            abogado: 'Lic. González',
            estado: 'Jalisco',
            prioridad: 'Media',
            estatus: 'Liberado'
        }
    ];
    
    let html = '';
    terminos.forEach(termino => {
        const fechaIngresoClass = isToday(termino.fechaIngreso) ? 'current-date' : '';
        const fechaVencimientoClass = isToday(termino.fechaVencimiento) ? 'current-date' : '';
        
        html += `
            <tr>
                <td class="${fechaIngresoClass}">${formatDate(termino.fechaIngreso)}</td>
                <td class="${fechaVencimientoClass}">${formatDate(termino.fechaVencimiento)}</td>
                <td>${termino.expediente}</td>
                <td>${termino.actor}</td>
                <td>${termino.asunto}</td>
                <td>${termino.prestacion}</td>
                <td>${termino.abogado}</td>
                <td>
                    ${termino.estatus === 'Presentado' ? 
                        `<div class="acuse-container">
                            <div class="acuse-text">ACUSE-${termino.expediente.replace('/', '-')}.pdf</div>
                            <div class="acuse-actions">
                                <button class="btn btn-primary btn-sm">
                                    <i class="fas fa-download"></i>
                                </button>
                            </div>
                        </div>` : 
                        '<button class="btn btn-warning btn-sm">Subir acuse</button>'}
                </td>
                <td class="actions">
                    <button class="btn btn-primary btn-sm edit-termino" data-id="${termino.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    
                    ${termino.estatus !== 'Presentado' ? 
                        `<button class="btn btn-presentado btn-sm mark-presentado" data-id="${termino.id}">
                            <i class="fas fa-check"></i> Presentar
                        </button>` : 
                        ''}
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    // Configurar botones de acción
    setupActionButtons();
}

function setupActionButtons() {
    // Botones de edición
    document.querySelectorAll('.edit-termino').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            alert('Editar término ID: ' + id);
        });
    });
    
    // Botones de marcar como presentado
    document.querySelectorAll('.mark-presentado').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (confirm('¿Marcar este término como presentado?')) {
                alert('Término ' + id + ' marcado como presentado');
                // Recargar la tabla
                loadTerminos();
            }
        });
    });
}

function setupSearchTerminos() {
    const searchInput = document.getElementById('search-terminos');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#terminos-body tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

function setupFiltersTerminos() {
    // Configurar filtros de términos
    const filters = ['filter-tribunal-termino', 'filter-estado-termino', 'filter-estatus-termino', 'filter-prioridad-termino'];
    
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', applyFiltersTerminos);
        }
    });
}

function applyFiltersTerminos() {
    // Lógica para aplicar filtros
    console.log('Aplicando filtros...');
}

function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function isToday(dateString) {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
}