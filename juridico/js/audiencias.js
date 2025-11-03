(function() {
    
    /* =============================================
       UTILIDADES DE ALMACENAMIENTO (localStorage)
    ============================================= */
    const LS_KEY = 'audiencias_data';

    function getAudiencias() {
        try {
            const raw = localStorage.getItem(LS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error("Error al leer audiencias de localStorage", e);
            return [];
        }
    }

    function setAudiencias(listaAudiencias) {
        localStorage.setItem(LS_KEY, JSON.stringify(listaAudiencias));
    }

    function seedAudiencias() {
        const audienciasEjemplo = [
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
                prioridad: 'Alta',
                abogadoResponsable: 'Lic. Juan Pérez',
                abogadoComparece: 'Lic. María Torres',
                observaciones: 'Llevar escrito de pruebas.',
                actaNombre: ''
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
                prioridad: 'Media',
                abogadoResponsable: 'Lic. Ana López',
                abogadoComparece: 'Lic. Ana López',
                observaciones: '',
                actaNombre: 'Acta_Intermedia_1595.pdf'
            }
        ];
        setAudiencias(audienciasEjemplo);
        return audienciasEjemplo;
    }

    /* =============================================
       FUNCIÓN PRINCIPAL DE RENDERIZADO
    ============================================= */
    function loadAudiencias() {
        const tbody = document.getElementById('audiencias-body');
        if (!tbody) return;

        // 1. Obtener valores de Filtros y Búsqueda
        const filterValues = {
            tipo: (document.getElementById('filter-tipo')?.value || '').toLowerCase(),
            gerencia: (document.getElementById('filter-gerencia')?.value || '').toLowerCase(), // Nota: No tienes este dato en tu objeto 'audiencia'
            materia: (document.getElementById('filter-materia')?.value || '').toLowerCase(),
            prioridad: (document.getElementById('filter-prioridad')?.value || '').toLowerCase()
        };
        const searchTerm = (document.getElementById('search-audiencias')?.value || '').toLowerCase();

        // 2. Obtener datos de localStorage
        let allAudiencias = getAudiencias();
        if (allAudiencias.length === 0) {
            allAudiencias = seedAudiencias();
        }

        // 3. Aplicar Filtros
        let audienciasFiltradas = allAudiencias.filter(audiencia => {
            // Tu HTML usa value="" para "todos", así que (filtro === '' || ...) es la lógica correcta
            const matchesTipo = (filterValues.tipo === '') || (audiencia.tipo.toLowerCase() === filterValues.tipo);
            const matchesMateria = (filterValues.materia === '') || (audiencia.materia.toLowerCase() === filterValues.materia);
            const matchesPrioridad = (filterValues.prioridad === '') || (audiencia.prioridad.toLowerCase() === filterValues.prioridad);
            // const matchesGerencia = (filterValues.gerencia === '') || (audiencia.gerencia.toLowerCase() === filterValues.gerencia); // Descomentar cuando agregues 'gerencia' al objeto
            
            return matchesTipo && matchesMateria && matchesPrioridad; // && matchesGerencia;
        });

        // 4. Aplicar Búsqueda (sobre la lista ya filtrada)
        if (searchTerm) {
            audienciasFiltradas = audienciasFiltradas.filter(audiencia => {
                const searchableText = [
                    audiencia.fecha,
                    audiencia.hora,
                    audiencia.tribunal,
                    audiencia.expediente,
                    audiencia.actor,
                    audiencia.tipo,
                    audiencia.materia,
                    audiencia.demandado,
                    audiencia.abogadoResponsable,
                    audiencia.abogadoComparece
                ].join(' ').toLowerCase();
                return searchableText.includes(searchTerm);
            });
        }
        
        // 5. Ordenar (por fecha)
        audienciasFiltradas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        // 6. Construir y Renderizar HTML
        let html = '';
        if (audienciasFiltradas.length === 0) {
            html = '<tr><td colspan="10" style="text-align: center; padding: 20px;">No se encontraron audiencias que coincidan.</td></tr>';
        } else {
            audienciasFiltradas.forEach(audiencia => {
                html += `
                  <tr class="main-row" data-id="${audiencia.id}">
                    <td>
                      <button class="toggle-expand" title="Ver detalles">
                        <i class="fas fa-chevron-down"></i>
                      </button>
                    </td>
                    <td>${formatDate(audiencia.fecha)}</td>
                    <td>${audiencia.hora}</td>
                    <td>${escapeHTML(audiencia.tribunal)}</td>
                    <td>${escapeHTML(audiencia.expediente)}</td>
                    <td>${escapeHTML(audiencia.actor)}</td>
                    <td>${escapeHTML(audiencia.abogadoResponsable)}</td>
                    <td>${escapeHTML(audiencia.abogadoComparece)}</td>
                    <td>
                      <div class="acuse-container">
                        <button class="btn btn-info btn-sm btn-subir-acta" title="Subir acta" data-id="${audiencia.id}">
                          <i class="fas fa-file-upload"></i>
                        </button>
                        <input type="file" class="input-acta" data-id="${audiencia.id}" accept=".pdf,.doc,.docx" style="display:none;">
                        <span class="acusa-nombre" id="acta-nombre-${audiencia.id}">
                          ${audiencia.actaNombre ? escapeHTML(audiencia.actaNombre) : 'Sin archivo'}
                        </span>
                      </div>
                    </td>
                    <td class="actions">
                      <button class="btn btn-primary btn-sm edit-audiencia" data-id="${audiencia.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-presentado btn-sm comment-audiencia" data-id="${audiencia.id}" title="Agregar comentario">
                        <i class="fas fa-comment-dots"></i>
                      </button>
                    </td>
                  </tr>
                  <tr class="expandable-row" id="expand-audiencia-${audiencia.id}">
                    <td colspan="10">
                      <div class="expandable-content">
                        <table>
                          <tr>
                            <th>Tipo de Audiencia</th>
                            <td>${escapeHTML(audiencia.tipo)}</td>
                            <th>Materia</th>
                            <td><span class="badge badge-${escapeHTML(audiencia.materia.toLowerCase())}">${escapeHTML(audiencia.materia)}</span></td>
                          </tr>
                          <tr>
                            <th>Demandado</th>
                            <td>${escapeHTML(audiencia.demandado)}</td>
                            <th>Prioridad</th>
                            <td><span class="badge badge-${escapeHTML(audiencia.prioridad.toLowerCase())}">${escapeHTML(audiencia.prioridad)}</span></td>
                          </tr>
                          <tr>
                            <th>Observaciones</th>
                            <td colspan="3">${escapeHTML(audiencia.observaciones) || 'Sin observaciones.'}</td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>
                `;
            });
        }
        tbody.innerHTML = html;
    }

    /* =============================================
       LÓGICA DEL MODAL (Nuevo/Editar)
    ============================================= */
    function openAudienciaModal(audiencia = null) {
        const modal = document.getElementById('modal-audiencia');
        const form = document.getElementById('form-audiencia');
        if (!modal || !form) return;

        form.reset();
        
        if (audiencia) {
            // Modo Editar
            document.getElementById('modal-audiencia-titulo').textContent = 'Editar Audiencia';
            document.getElementById('audiencia-id').value = audiencia.id;
            document.getElementById('audiencia-fecha').value = audiencia.fecha || '';
            document.getElementById('audiencia-hora').value = audiencia.hora || '';
            document.getElementById('audiencia-prioridad').value = audiencia.prioridad || 'Media';
            document.getElementById('audiencia-tipo').value = audiencia.tipo || '';
            document.getElementById('audiencia-materia').value = audiencia.materia || '';
            document.getElementById('audiencia-tribunal').value = audiencia.tribunal || '';
            document.getElementById('audiencia-expediente').value = audiencia.expediente || '';
            document.getElementById('audiencia-actor').value = audiencia.actor || '';
            document.getElementById('audiencia-demandado').value = audiencia.demandado || '';
            document.getElementById('audiencia-abogado-responsable').value = audiencia.abogadoResponsable || '';
            document.getElementById('audiencia-abogado-comparece').value = audiencia.abogadoComparece || '';
            document.getElementById('audiencia-observaciones').value = audiencia.observaciones || '';
        } else {
            // Modo Nuevo
            document.getElementById('modal-audiencia-titulo').textContent = 'Nueva Audiencia';
            document.getElementById('audiencia-id').value = ''; // Importante: limpiar el ID
            document.getElementById('audiencia-fecha').value = new Date().toISOString().slice(0,10);
        }

        modal.style.display = 'flex';
    }

    function saveAudiencia() {
        const id = document.getElementById('audiencia-id').value;
        const audienciaData = {
            fecha: document.getElementById('audiencia-fecha').value,
            hora: document.getElementById('audiencia-hora').value,
            tipo: document.getElementById('audiencia-tipo').value.trim(),
            materia: document.getElementById('audiencia-materia').value.trim(),
            tribunal: document.getElementById('audiencia-tribunal').value.trim(),
            expediente: document.getElementById('audiencia-expediente').value.trim(),
            actor: document.getElementById('audiencia-actor').value.trim(),
            demandado: document.getElementById('audiencia-demandado').value.trim(),
            observaciones: document.getElementById('audiencia-observaciones').value.trim(),
            prioridad: document.getElementById('audiencia-prioridad').value,
            abogadoResponsable: document.getElementById('audiencia-abogado-responsable').value.trim(),
            abogadoComparece: document.getElementById('audiencia-abogado-comparece').value.trim()
        };

        if (!audienciaData.fecha || !audienciaData.hora || !audienciaData.tipo || !audienciaData.materia || !audienciaData.tribunal || !audienciaData.expediente || !audienciaData.actor || !audienciaData.demandado || !audienciaData.prioridad || !audienciaData.abogadoResponsable || !audienciaData.abogadoComparece) {
            alert('Por favor, complete todos los campos obligatorios');
            return;
        }
        
        let audiencias = getAudiencias();

        if (id) {
            // Modo edición
            const idNum = parseInt(id, 10);
            const index = audiencias.findIndex(a => a.id === idNum);
            if (index !== -1) {
                audiencias[index] = {
                    ...audiencias[index], // Conserva 'id' y 'actaNombre'
                    ...audienciaData
                };
                alert('Audiencia actualizada correctamente.');
            } else {
                alert('No se pudo actualizar: audiencia no encontrada.');
            }
        } else {
            // Modo alta
            const newId = audiencias.length ? Math.max(...audiencias.map(a => a.id)) + 1 : 1;
            audiencias.unshift({
                id: newId,
                ...audienciaData,
                actaNombre: '' // Valor inicial
            });
            alert('Audiencia creada correctamente.');
        }

        setAudiencias(audiencias); // Guardar en localStorage
        document.getElementById('modal-audiencia').style.display = 'none';
        loadAudiencias(); // Recargar la tabla
    }
    
    /* =============================================
       CONFIGURACIÓN DE EVENTOS (Delegación)
    ============================================= */
    function setupPageEvents() {
        // ---- Eventos de la Tabla (Delegación) ----
        const tbody = document.getElementById('audiencias-body');
        if (tbody) {
            tbody.addEventListener('click', function(e) {
                const button = e.target.closest('button');
                const input = e.target.closest('input[type="file"]');
                
                if (button) {
                    const id = button.dataset.id;
                    const idNum = parseInt(id, 10);
                    
                    if (button.classList.contains('toggle-expand')) {
                        toggleRowExpand(id);
                    }
                    else if (button.classList.contains('edit-audiencia')) {
                        const audiencia = getAudiencias().find(a => a.id === idNum);
                        if (audiencia) openAudienciaModal(audiencia);
                    }
                    else if (button.classList.contains('comment-audiencia')) {
                        openComentariosModal(id);
                    }
                    else if (button.classList.contains('btn-subir-acta')) {
                        // Disparar el input file oculto
                        document.querySelector(`.input-acta[data-id="${id}"]`)?.click();
                    }
                }
                
                if (input && input.classList.contains('input-acta')) {
                    // El listener 'change' se agrega aquí para el input que se acaba de clickear
                    input.addEventListener('change', handleActaUpload, { once: true });
                }
            });
        }
        
        // ---- Filtros y Búsqueda ----
        document.getElementById('search-audiencias')?.addEventListener('input', loadAudiencias);
        const filterIds = ['filter-tipo', 'filter-gerencia', 'filter-materia', 'filter-prioridad'];
        filterIds.forEach(id => {
            document.getElementById(id)?.addEventListener('change', loadAudiencias);
        });

        // ---- Botones del Toolbar ----
        document.getElementById('add-audiencia')?.addEventListener('click', () => {
            openAudienciaModal(null); // Modo "Nuevo"
        });
        document.getElementById('export-excel')?.addEventListener('click', exportAudienciasToExcel);

        // ---- Modal de Audiencia (Cerrar y Guardar) ----
        document.getElementById('cerrar-modal-audiencia')?.addEventListener('click', () => {
            document.getElementById('modal-audiencia').style.display = 'none';
        });
        document.getElementById('cancelar-audiencia')?.addEventListener('click', () => {
            document.getElementById('modal-audiencia').style.display = 'none';
        });
        document.getElementById('form-audiencia')?.addEventListener('submit', (e) => {
            e.preventDefault();
            saveAudiencia();
        });
        
        // ---- Modal de Comentarios (Inicializar) ----
        initModalComentarios();
    }
    
    function toggleRowExpand(id) {
        const expandableRow = document.getElementById(`expand-audiencia-${id}`);
        const icon = document.querySelector(`.main-row[data-id="${id}"] .toggle-expand i`);
        if (!expandableRow || !icon) return;
        
        if (expandableRow.classList.contains('active')) {
            expandableRow.classList.remove('active');
            icon.className = 'fas fa-chevron-down';
        } else {
            expandableRow.classList.add('active');
            icon.className = 'fas fa-chevron-up';
        }
    }

    function handleActaUpload(e) {
        const input = e.target;
        const id = parseInt(input.dataset.id, 10);
        const spanNombre = document.getElementById(`acta-nombre-${id}`);
        let audiencias = getAudiencias();
        const index = audiencias.findIndex(a => a.id === id);

        if (index === -1 || !spanNombre) return;

        if (input.files && input.files.length > 0) {
            const fileName = input.files[0].name;
            spanNombre.textContent = escapeHTML(fileName);
            audiencias[index].actaNombre = fileName;
            
            // Aquí subirías el archivo a tu backend
            // const formData = new FormData();
            // formData.append('acta', input.files[0]);
            // fetch('/api/audiencias/' + id + '/acta', { method: 'POST', body: formData })...
            
        } else {
            spanNombre.textContent = 'Sin archivo';
            audiencias[index].actaNombre = '';
        }
        
        setAudiencias(audiencias); // Guardar el nombre del archivo en localStorage
    }

    /* =============================================
       SECCIÓN DE COMENTARIOS (Tu código, sin cambios)
    ============================================= */
    function initModalComentarios() {
      const modal = document.getElementById('modal-comentarios');
      const btnClose = document.getElementById('close-modal-comentarios');
      const btnSave = document.getElementById('save-comentario');

      if (btnClose) {
        btnClose.addEventListener('click', () => modal.style.display = 'none');
      }
      if (btnSave) {
        btnSave.addEventListener('click', saveComentario);
      }
      window.addEventListener('click', function(event) {
        if (event.target === modal) modal.style.display = 'none';
      });
    }

    function openComentariosModal(audienciaId) {
      const modal = document.getElementById('modal-comentarios');
      if (!modal) {
          alert('Error: No se encontró el HTML del modal de comentarios.');
          return;
      }
      const inputId = document.getElementById('comentarios-audiencia-id');
      const textarea = document.getElementById('nuevo-comentario');
      inputId.value = audienciaId;
      textarea.value = '';
      renderComentariosList(audienciaId);
      modal.style.display = 'flex';
    }

    function saveComentario() {
      const audienciaId = document.getElementById('comentarios-audiencia-id').value;
      const textarea = document.getElementById('nuevo-comentario');
      const texto = (textarea.value || '').trim();
      if (!texto) {
        alert('Escribe un comentario.');
        return;
      }
      const comentarios = getComentarios(audienciaId);
      comentarios.push({ text: texto, ts: Date.now() });
      setComentarios(audienciaId, comentarios);
      textarea.value = '';
      renderComentariosList(audienciaId);
    }

    function renderComentariosList(audienciaId) {
      const ul = document.getElementById('lista-comentarios');
      const comentarios = getComentarios(audienciaId);
      if (!ul) return;
      if (comentarios.length === 0) {
        ul.innerHTML = `<li style="color:#666;">Sin comentarios aún.</li>`;
        return;
      }
      ul.innerHTML = comentarios.map((c, idx) => {
        const fecha = formatDateTime(c.ts);
        const safeText = escapeHTML(c.text);
        return `
          <li class="comment-item">
            <div class="comment-meta">
              <span>${fecha}</span>
              <button class="btn btn-danger btn-sm" data-idx="${idx}" data-id="${audienciaId}" title="Eliminar">
                <i class="fas fa-trash"></i>
              </button>
            </div>
            <div class="comment-text">${safeText.replace(/\n/g, '<br>')}</div>
          </li>
        `;
      }).join('');

      ul.querySelectorAll('button.btn-danger').forEach(btn => {
        btn.addEventListener('click', function() {
          const idx = parseInt(this.getAttribute('data-idx'), 10);
          const id = this.getAttribute('data-id');
          deleteComentario(id, idx);
        });
      });
    }

    function deleteComentario(audienciaId, index) {
      const comentarios = getComentarios(audienciaId);
      comentarios.splice(index, 1);
      setComentarios(audienciaId, comentarios);
      renderComentariosList(audienciaId);
    }

    function lsKey(audienciaId) { return `audiencia_comentarios_${audienciaId}`; }
    function getComentarios(audienciaId) { try { const raw = localStorage.getItem(lsKey(audienciaId)); return raw ? JSON.parse(raw) : []; } catch { return []; } }
    function setComentarios(audienciaId, comentarios) { localStorage.setItem(lsKey(audienciaId), JSON.stringify(comentarios)); }

    /* =============================================
       EXPORTACIÓN A EXCEL (Tu código, adaptado)
    ============================================= */
    function exportAudienciasToExcel() {
        const audiencias = getAudiencias(); // Usar la fuente de datos principal
        if (!audiencias || audiencias.length === 0) {
            alert('No hay audiencias para exportar.');
            return;
        }
        const data = audiencias.map(a => ({
            'ID': a.id,
            'Fecha': formatDate(a.fecha),
            'Hora': a.hora,
            'Tribunal': a.tribunal,
            'Expediente': a.expediente,
            'Actor': a.actor,
            'Demandado': a.demandado,
            'Tipo': a.tipo,
            'Materia': a.materia,
            'Prioridad': a.prioridad,
            'Abogado Responsable': a.abogadoResponsable || '',
            'Abogado que Comparece': a.abogadoComparece || '',
            'Observaciones': a.observaciones || '',
            'Acta': a.actaNombre || ''
        }));
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Audiencias');
        XLSX.writeFile(wb, 'audiencias.xlsx');
    }

    /* =============================================
       FUNCIONES DE UTILIDAD (Helpers)
    ============================================= */
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const date = new Date(dateString + 'T00:00:00'); // Evitar desfase de zona horaria
        return date.toLocaleDateString('es-ES', options);
    }
    
    function formatDateTime(ts) {
        const d = new Date(ts);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    }

    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return str.toString().replace(/[&<>"']/g, m => ({
            '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
        }[m]));
    }

    /* =============================================
       INICIALIZACIÓN
    ============================================= */
    function initAudiencias() {
        // Conecta TODOS los eventos de la página una sola vez
        setupPageEvents();
        
        // Carga la tabla por primera vez
        loadAudiencias();
    }
    
    // Iniciar todo
    document.addEventListener('DOMContentLoaded', initAudiencias);

})();