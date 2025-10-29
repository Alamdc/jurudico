function initAudiencias() {
    // Cargar datos de audiencias
    loadAudiencias();
    
    // Configurar búsqueda
    setupSearch();
    
    // Configurar filtros
    setupFilters();
    
    // El botón para nueva audiencia ahora está manejado en el HTML
}

function loadAudiencias() {
    const tbody = document.getElementById('audiencias-body');
    
    // Datos de ejemplo
    const audiencias = [
        {
            id: 1,
            fecha: '2025-01-15',
            hora: '10:00',
            tribunal: 'Primer Tribunal Colegiado en Materia Laboral',
            expediente: '2375/2025',
            actor: 'Ortega Ibarra Juan Carlos',
            tipo: 'Inicial',
            materia: 'Laboral',
            demandado: 'Empresa Constructora S.A. de C.V.',
            prioridad: 'Alta'
        },
        {
            id: 2,
            fecha: '2025-01-22',
            hora: '14:00',
            tribunal: 'Segundo Tribunal Colegiado',
            expediente: '1595/2025',
            actor: 'Sosa Uc Roberto',
            tipo: 'Intermedia',
            materia: 'Penal',
            demandado: 'Comercializadora del Sureste S.A.',
            prioridad: 'Media'
        }
    ];
    
    let html = '';
    audiencias.forEach(audiencia => {
        html += `
            <tr>
                <td>
                    <button class="toggle-expand" data-id="${audiencia.id}">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </td>
                <td>${formatDate(audiencia.fecha)}</td>
                <td>${audiencia.hora}</td>
                <td>${audiencia.tribunal}</td>
                <td>${audiencia.expediente}</td>
                <td>${audiencia.actor}</td>
                <td class="actions">
                    <button class="btn btn-primary btn-sm edit-audiencia" data-id="${audiencia.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <input type="checkbox" class="delete-audiencia" data-id="${audiencia.id}">
                </td>
            </tr>
            <tr class="expandable-row" id="expand-audiencia-${audiencia.id}">
                <td colspan="7">
                    <div class="expandable-content">
                        <table>
                            <tr>
                                <th>Tipo de Audiencia</th>
                                <td>${audiencia.tipo}</td>
                                <th>Materia</th>
                                <td><span class="badge badge-${audiencia.materia.toLowerCase()}">${audiencia.materia}</span></td>
                            </tr>
                            <tr>
                                <th>Demandado</th>
                                <td>${audiencia.demandado}</td>
                                <th>Prioridad</th>
                                <td><span class="badge badge-${audiencia.prioridad.toLowerCase()}">${audiencia.prioridad}</span></td>
                            </tr>
                        </table>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    // Configurar botones de expansión
    setupExpandableRows();
    
    // Configurar botones de edición
    setupEditButtons();
}

function setupExpandableRows() {
    document.querySelectorAll('.toggle-expand').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const expandableRow = document.getElementById(`expand-audiencia-${id}`);
            const icon = this.querySelector('i');
            
            if (expandableRow.classList.contains('active')) {
                expandableRow.classList.remove('active');
                icon.className = 'fas fa-chevron-down';
            } else {
                expandableRow.classList.add('active');
                icon.className = 'fas fa-chevron-up';
            }
        });
    });
}

function setupEditButtons() {
    document.querySelectorAll('.edit-audiencia').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            // Aquí podrías cargar los datos de la audiencia y abrir el modal en modo edición
            alert('Editar audiencia ID: ' + id);
        });
    });
}

function setupSearch() {
    const searchInput = document.getElementById('search-audiencias');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#audiencias-body tr');
        
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

function setupFilters() {
    // Configurar filtros de audiencias
    const filters = ['filter-tipo', 'filter-gerencia', 'filter-materia', 'filter-prioridad'];
    
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', applyFilters);
        }
    });
}

function applyFilters() {
    // Lógica para aplicar filtros
    console.log('Aplicando filtros...');
}

function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}