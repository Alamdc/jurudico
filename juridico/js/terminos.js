(function() {
    // Variable global para exportar, expuesta desde el IIFE
    let _terminosParaExportar = [];

    /* =============================================
       UTILIDADES DE ALMACENAMIENTO (localStorage)
    ============================================= */
    function getTerminos() {
        try {
            return JSON.parse(localStorage.getItem('terminos')) || [];
        } catch (e) {
            console.error("Error al leer terminos de localStorage", e);
            return [];
        }
    }

    function setTerminos(listaTerminos) {
        localStorage.setItem('terminos', JSON.stringify(listaTerminos));
    }

    function generarNuevoIdTermino() {
        const lista = getTerminos();
        const maxId = lista.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
        return maxId + 1;
    }

    /**
     * Carga los datos de ejemplo EN CASO de que localStorage esté vacío
     */
    function seedTerminos() {
        const terminosEjemplo = [
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
        setTerminos(terminosEjemplo);
        return terminosEjemplo;
    }

    /* =============================================
       LÓGICA DE RENDERIZADO Y EVENTOS
    ============================================= */
    function loadTerminos() {
        const tbody = document.getElementById('terminos-body');
        if (!tbody) return;

        // --- INICIO DE LÓGICA DE FILTRADO Y BÚSQUEDA ---

        // 1. Obtener los valores actuales de TODOS los filtros
        const filterValues = {
            tribunal: document.getElementById('filter-tribunal-termino')?.value || 'todos',
            estado: document.getElementById('filter-estado-termino')?.value || 'todos',
            estatus: document.getElementById('filter-estatus-termino')?.value || 'todos',
            prioridad: document.getElementById('filter-prioridad-termino')?.value || 'todos'
        };
        
        // 2. Obtener el valor actual del buscador
        const searchTerm = (document.getElementById('search-terminos')?.value || '').toLowerCase();

        // 3. Obtener la lista COMPLETA de localStorage
        let allTerminos = getTerminos();
        if (allTerminos.length === 0) {
            allTerminos = seedTerminos(); // Cargar ejemplos si está vacío
        }

        // 4. Aplicar los FILTROS
        let terminosFiltrados = allTerminos.filter(termino => {
            // Si el filtro es 'todos' O si el término coincide, pasa
            const matchesTribunal = (filterValues.tribunal === 'todos') || (termino.tribunal === filterValues.tribunal);
            const matchesEstado = (filterValues.estado === 'todos') || (termino.estado === filterValues.estado);
            const matchesEstatus = (filterValues.estatus === 'todos') || (termino.estatus === filterValues.estatus);
            const matchesPrioridad = (filterValues.prioridad === 'todos') || (termino.prioridad === filterValues.prioridad);
            
            return matchesTribunal && matchesEstado && matchesEstatus && matchesPrioridad;
        });
        
        // 5. Aplicar la BÚSQUEDA (sobre la lista YA filtrada)
        if (searchTerm) {
            terminosFiltrados = terminosFiltrados.filter(termino => {
                // Creamos un string gigante con todo el texto buscable del término
                const searchableText = [
                    termino.expediente,
                    termino.actor,
                    termino.asunto,
                    termino.prestacion,
                    termino.abogado
                ].join(' ').toLowerCase();
                
                return searchableText.includes(searchTerm);
            });
        }

        // --- FIN DE LÓGICA ---

        // 6. Actualizar la variable de exportación (¡solo exportará lo que ve!)
        _terminosParaExportar = terminosFiltrados; 
        
        // 7. Ordenar (solo la lista filtrada)
        terminosFiltrados.sort((a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento));

        // 8. Construir el HTML
        let html = '';
        if (terminosFiltrados.length === 0) {
            html = '<tr><td colspan="9" style="text-align: center; padding: 20px;">No se encontraron términos que coincidan con los filtros.</td></tr>';
        } else {
            terminosFiltrados.forEach(termino => {
                const fechaIngresoClass = isToday(termino.fechaIngreso) ? 'current-date' : '';
                const fechaVencimientoClass = isToday(termino.fechaVencimiento) ? 'current-date' : '';

                html += `
                    <tr data-id="${termino.id}">
                        <td class="${fechaIngresoClass}">${formatDate(termino.fechaIngreso)}</td>
                        <td class="${fechaVencimientoClass}">${formatDate(termino.fechaVencimiento)}</td>
                        <td>${escapeHtml(termino.expediente)}</td>
                        <td>${escapeHtml(termino.actor)}</td>
                        <td>${escapeHtml(termino.asunto)}</td>
                        <td>${escapeHtml(termino.prestacion)}</td>
                        <td>${escapeHtml(termino.abogado)}</td>
                        <td>${termino.estatus === 'Presentado' ? 
                            `<div class="acuse-container">
                                <div class="acuse-text">ACUSE-${escapeHtml(termino.expediente).replace('/', '-')}.pdf</div>
                                <div class="acuse-actions">
                                    <button class="btn btn-primary btn-sm"><i class="fas fa-download"></i></button>
                                </div>
                            </div>` 
                            : `<button class="btn btn-warning btn-sm btn-subir-acuse" data-id="${termino.id}">Subir acuse</button>`}
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
        }

        // 9. Renderizar
        tbody.innerHTML = html;
        // ¡Ya NO llamamos a setupActionButtons() aquí! Se movió a initTerminos.
    }
    function setupActionButtons() {
        // Usar delegación de eventos para eficiencia
        const tbody = document.getElementById('terminos-body');
        if (!tbody) return;

        tbody.addEventListener('click', function(e) {
            const button = e.target.closest('button');
            if (!button) return;

            const id = button.dataset.id;
            
            if (button.classList.contains('edit-termino')) {
                console.log('Editar término:', id);
                abrirModalNuevoTermino(id); // Reutilizar modal para editar
            }
            
            if (button.classList.contains('mark-presentado')) {
                marcarComoPresentado(id);
            }
            
            if (button.classList.contains('btn-subir-acuse')) {
                alert('Funcionalidad "Subir Acuse" por implementar.');
            }
        });
    }

    function marcarComoPresentado(id) {
        if (!id) return;
        const idNum = parseInt(id, 10);
        
        if (confirm('¿Marcar este término como presentado?')) {
            let terminos = getTerminos();
            const index = terminos.findIndex(t => t.id === idNum);
            
            if (index !== -1) {
                terminos[index].estatus = 'Presentado';
                setTerminos(terminos); // Guardar el cambio
                loadTerminos(); // Recargar la tabla para reflejar el cambio
            } else {
                alert('Error: No se encontró el término.');
            }
        }
    }

    /* =============================================
       LÓGICA DEL MODAL
    ============================================= */

    function abrirModalNuevoTermino(id = null) {
        const modal = document.getElementById('modal-nuevo-termino');
        const form = document.getElementById('form-nuevo-termino');
        if (!modal || !form) return;

        form.reset();
        
        // Lógica para modo "Editar"
        if (id) {
            modal.querySelector('h3').textContent = 'Editar Término';
            const termino = getTerminos().find(t => t.id === parseInt(id, 10));
            if (termino) {
                document.getElementById('nt-expediente').value = termino.expediente || '';
                document.getElementById('nt-actor').value = termino.actor || '';
                document.getElementById('nt-asunto').value = termino.asunto || '';
                document.getElementById('nt-prestacion').value = termino.prestacion || '';
                document.getElementById('nt-abogado').value = termino.abogado || 'Sin asignar';
                document.getElementById('nt-fechaIngreso').value = termino.fechaIngreso || '';
                document.getElementById('nt-fechaVencimiento').value = termino.fechaVencimiento || '';
                document.getElementById('nt-prioridad').value = termino.prioridad || 'Media';
                document.getElementById('nt-estatus').value = termino.estatus || 'Proyectista';
            }
            form.dataset.editingId = id; // Guardar ID para el submit
        } else {
            modal.querySelector('h3').textContent = 'Agregar Nuevo Término';
            document.getElementById('nt-fechaIngreso').value = new Date().toISOString().slice(0,10);
            delete form.dataset.editingId; // Asegurar que no esté en modo edición
        }

        modal.style.display = 'flex';

        const cerrar = () => (modal.style.display = 'none');
        document.getElementById('cerrar-modal-termino').onclick = cerrar;
        document.getElementById('cancelar-termino').onclick = cerrar;

        form.onsubmit = (e) => {
            e.preventDefault();
            guardarNuevoTermino();
        };
    }

    function guardarNuevoTermino() {
        const form = document.getElementById('form-nuevo-termino');
        const editingId = form.dataset.editingId ? parseInt(form.dataset.editingId, 10) : null;

        const fechaIngreso = document.getElementById('nt-fechaIngreso').value;
        const fechaVencimiento = document.getElementById('nt-fechaVencimiento').value;

        if (!fechaIngreso || !fechaVencimiento) {
            alert('Las fechas de Ingreso y Vencimiento son obligatorias.');
            return;
        }

        const terminoDatos = {
            id: editingId || generarNuevoIdTermino(),
            expediente: document.getElementById('nt-expediente').value.trim(),
            actor: document.getElementById('nt-actor').value.trim(),
            asunto: document.getElementById('nt-asunto').value.trim(),
            prestacion: document.getElementById('nt-prestacion').value.trim(),
            abogado: document.getElementById('nt-abogado').value,
            fechaIngreso: fechaIngreso,
            fechaVencimiento: fechaVencimiento,
            prioridad: document.getElementById('nt-prioridad').value,
            estatus: document.getElementById('nt-estatus').value,
            // Mantener datos que no están en el form si se está editando
            ...(editingId && getTerminos().find(t => t.id === editingId)) 
        };

        if (!terminoDatos.expediente || !terminoDatos.actor || !terminoDatos.asunto) {
            alert('Por favor completa: Expediente, Actor y Asunto.');
            return;
        }

        let terminos = getTerminos();
        if (editingId) {
            // Modo Editar: Reemplazar el existente
            const index = terminos.findIndex(t => t.id === editingId);
            if (index !== -1) {
                terminos[index] = { ...terminos[index], ...terminoDatos };
            }
        } else {
            // Modo Nuevo: Agregar al inicio
            terminos.unshift(terminoDatos);
        }

        setTerminos(terminos);
        loadTerminos();
        document.getElementById('modal-nuevo-termino').style.display = 'none';
    }


    /* =============================================
       BUSCADOR, FILTROS Y EXPORTACIÓN
    ============================================= */

    function exportarTerminosExcel() {
        if (!_terminosParaExportar || _terminosParaExportar.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }
        // Asumiendo que XLSX está cargado globalmente
        const ws = XLSX.utils.json_to_sheet(_terminosParaExportar);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Términos');
        XLSX.writeFile(wb, 'terminos.xlsx');
    }

    function setupSearchTerminos() {
        const searchInput = document.getElementById('search-terminos');
        if (!searchInput) return;
        
        /*searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#terminos-body tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });*/
        searchInput.addEventListener('input', loadTerminos);
    }

    function setupFiltersTerminos() {
        const filters = ['filter-tribunal-termino', 'filter-estado-termino', 'filter-estatus-termino', 'filter-prioridad-termino'];
        filters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', applyFiltersTerminos);
            }
        });
    }

    function applyFiltersTerminos() {
       loadTerminos();
    }

    /* =============================================
       FUNCIONES DE UTILIDAD (Helpers)
    ============================================= */
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        // Añadir timeZone para evitar problemas de un día de desfase
        const date = new Date(dateString + 'T00:00:00'); 
        return date.toLocaleDateString('es-ES', options);
    }

    function isToday(dateString) {
        if (!dateString) return false;
        const today = new Date().toISOString().split('T')[0];
        return dateString === today;
    }
    
    function escapeHtml(s) {
        return (s ?? '').toString()
          .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
    }

    /* =============================================
       INICIALIZACIÓN
    ============================================= */
    function initTerminos() {
        // 1. Conectar los botones de la tabla (Editar, Presentar, etc.)
    //    Lo hacemos UNA SOLA VEZ, usando delegación.
    setupActionButtons(); 
    
    // 2. Conectar el resto de la UI
    setupSearchTerminos();
    setupFiltersTerminos();

    const btnExportar = document.getElementById('exportar-excel');
    if (btnExportar) {
        btnExportar.addEventListener('click', exportarTerminosExcel);
    }

    const btnNuevoTermino = document.getElementById('add-termino');
    if (btnNuevoTermino) {
        btnNuevoTermino.addEventListener('click', () => abrirModalNuevoTermino(null));
    }
    
    // 3. Cargar la lista inicial de términos (aplicando filtros/búsqueda si hay)
    loadTerminos();
    }

    // Iniciar todo cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', initTerminos);

})();