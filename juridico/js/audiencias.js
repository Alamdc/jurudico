function initAudiencias() {
    // Cargar datos de audiencias
    loadAudiencias();
    
    // Configurar búsqueda
    setupSearch();
    
    // Configurar filtros
    setupFilters();
    
    // El botón para nueva audiencia ahora está manejado en el HTML
}
// Estado global simple
let AUDIENCIAS = [];
function loadAudiencias() {
  const tbody = document.getElementById('audiencias-body');

  // Datos de ejemplo (solo si está vacío; así no perdemos cambios al refrescar tabla)
  if (AUDIENCIAS.length === 0) {
    AUDIENCIAS = [
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
        actaNombre: ''
      }
    ];
  }

  let html = '';
  AUDIENCIAS.forEach(audiencia => {
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
        <td>${audiencia.abogadoResponsable}</td>
        <td>${audiencia.abogadoComparece}</td>
        

        <td>
          <div class="acuse-container">
            <button class="btn btn-info btn-sm btn-subir-acta" title="Subir acta" data-id="${audiencia.id}">
              <i class="fas fa-file-upload"></i>
            </button>
            <input type="file" class="input-acta" data-id="${audiencia.id}" accept=".pdf,.doc,.docx" style="display:none;">
            <span class="acusa-nombre" id="acta-nombre-${audiencia.id}" style="font-size:.85rem; color:#555;">
              ${audiencia.actaNombre ? audiencia.actaNombre : 'Sin archivo'}
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
          <input type="checkbox" class="delete-audiencia" data-id="${audiencia.id}" title="Marcar para eliminar">
        </td>
      </tr>
      <tr class="expandable-row" id="expand-audiencia-${audiencia.id}">
        <td colspan="8">
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

  setupExpandableRows();
  setupActionButtons();
  setupActaUpload();
}
function saveAudiencia() {
  const id = document.getElementById('audiencia-id').value;
  const fecha = document.getElementById('audiencia-fecha').value;
  const hora = document.getElementById('audiencia-hora').value;
  const tipo = document.getElementById('audiencia-tipo').value;
  const materia = document.getElementById('audiencia-materia').value;
  const tribunal = document.getElementById('audiencia-tribunal').value;
  const expediente = document.getElementById('audiencia-expediente').value;
  const actor = document.getElementById('audiencia-actor').value;
  const demandado = document.getElementById('audiencia-demandado').value;
  const observaciones = document.getElementById('audiencia-observaciones').value;
  const prioridad = document.getElementById('audiencia-prioridad').value;
  const abogadoResponsable = document.getElementById('audiencia-abogado-responsable').value;
  const abogadoComparece = document.getElementById('audiencia-abogado-comparece').value;

  if (!fecha || !hora || !tipo || !materia || !tribunal || !expediente || !actor || !demandado || !prioridad  || !abogadoResponsable || !abogadoComparece) {
    alert('Por favor, complete todos los campos obligatorios');
    return;
  }
  

  if (id) {
    // Modo edición
    const idx = AUDIENCIAS.findIndex(a => a.id === parseInt(id, 10));
    if (idx !== -1) {
      AUDIENCIAS[idx] = {
        ...AUDIENCIAS[idx],
        fecha, hora, tipo, materia, tribunal, expediente, actor, demandado, prioridad,
        observaciones, abogadoResponsable, abogadoComparece
      };
      alert('Audiencia actualizada correctamente.');
    } else {
      alert('No se pudo actualizar: audiencia no encontrada.');
    }
  } else {
    // Modo alta
    const newId = AUDIENCIAS.length ? Math.max(...AUDIENCIAS.map(a => a.id)) + 1 : 1;
    AUDIENCIAS.push({
      id: newId, fecha, hora, tipo, materia, tribunal, expediente, actor, demandado, prioridad,
      observaciones, abogadoResponsable, abogadoComparece,
      actaNombre: ''
    });
    alert('Audiencia creada correctamente.');
  }

  // Cerrar modal y refrescar tabla
  document.getElementById('modal-audiencia').style.display = 'none';
  loadAudiencias();
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
function setupActionButtons() {
  // Editar -> abre el modal con datos precargados
  document.querySelectorAll('.edit-audiencia').forEach(button => {
    button.addEventListener('click', function() {
      const id = parseInt(this.getAttribute('data-id'), 10);
      const audiencia = AUDIENCIAS.find(a => a.id === id);
      if (!audiencia) {
        alert('No se encontró la audiencia a editar.');
        return;
      }
      openAudienciaModal(audiencia); // ya tienes esta función y soporta modo edición
    });
  });

  // Comentarios (ya lo tenías)
  document.querySelectorAll('.comment-audiencia').forEach(button => {
    button.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      openComentariosModal(id);
    });
  });
}


function setupActaUpload() {
  // Click en botón = dispara input file
  document.querySelectorAll('.btn-subir-acta').forEach(btn => {
    btn.addEventListener('click', function () {
      const id = this.getAttribute('data-id');
      const input = document.querySelector(`.input-acta[data-id="${id}"]`);
      if (input) input.click();
    });
  });

  // Al seleccionar archivo, mostramos el nombre y persistimos en AUDIENCIAS
  document.querySelectorAll('.input-acta').forEach(input => {
    input.addEventListener('change', function () {
      const id = parseInt(this.getAttribute('data-id'), 10);
      const spanNombre = document.getElementById(`acta-nombre-${id}`);

      if (this.files && this.files.length > 0) {
        const fileName = this.files[0].name;
        if (spanNombre) spanNombre.textContent = fileName;

        const idx = AUDIENCIAS.findIndex(a => a.id === id);
        if (idx !== -1) {
          AUDIENCIAS[idx].actaNombre = fileName;
          // Opcional: persistir en localStorage para que no se pierda al recargar
          // localStorage.setItem('AUDIENCIAS_DATA', JSON.stringify(AUDIENCIAS));
        }

        // Aquí podrías subir el archivo via fetch/FormData a tu API
        // const formData = new FormData();
        // formData.append('acta', this.files[0]);
        // fetch('/api/audiencias/' + id + '/acta', { method: 'POST', body: formData })
      } else {
        if (spanNombre) spanNombre.textContent = 'Sin archivo';
      }
    });
  });
}


function setupSearch() {
  const searchInput = document.getElementById('search-audiencias');

  searchInput.addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    const tbody = document.getElementById('audiencias-body');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Recorremos en pares: [mainRow, expandableRow]
    for (let i = 0; i < rows.length; i += 2) {
      const mainRow = rows[i];
      const expRow  = rows[i + 1]; // puede existir o no (en tu caso sí existe)

      const text = (mainRow.textContent + (expRow ? expRow.textContent : '')).toLowerCase();
      const show = text.includes(searchTerm);

      mainRow.style.display = show ? '' : 'none';
      if (expRow) expRow.style.display = show ? '' : 'none';
    }
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

  // Cerrar al hacer clic fuera
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
}

function openComentariosModal(audienciaId) {
  const modal = document.getElementById('modal-comentarios');
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
  comentarios.push({
    text: texto,
    ts: Date.now()
  });
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
        <div class="comment-text">${safeText}</div>
      </li>
    `;
  }).join('');

  // wire up delete buttons
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

/* Persistencia simple en localStorage */
function lsKey(audienciaId) {
  return `audiencia_comentarios_${audienciaId}`;
}

function getComentarios(audienciaId) {
  try {
    const raw = localStorage.getItem(lsKey(audienciaId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setComentarios(audienciaId, comentarios) {
  localStorage.setItem(lsKey(audienciaId), JSON.stringify(comentarios));
}

/* Utilidades */
function formatDateTime(ts) {
  const d = new Date(ts);
  // dd/mm/yyyy hh:mm
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

function exportAudienciasToExcel() {
  if (!AUDIENCIAS || AUDIENCIAS.length === 0) {
    alert('No hay audiencias para exportar.');
    return;
  }

  // Estructuramos los datos para Excel
  const data = AUDIENCIAS.map(a => ({
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

  // Creamos la hoja de cálculo
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Audiencias');

  // Generamos y descargamos el archivo
  XLSX.writeFile(wb, 'audiencias.xlsx');
}

