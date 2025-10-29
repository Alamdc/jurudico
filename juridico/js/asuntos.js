/* ====== EXTENSIÓN MODAL NUEVO ASUNTO (respetando body-cards existentes) ====== */
(function () {
  /* ---------- Utilidades de almacenamiento ---------- */
  function getAsuntos() {
    try { return JSON.parse(localStorage.getItem('asuntos')) || []; } catch { return []; }
  }
  function setAsuntos(list) {
    localStorage.setItem('asuntos', JSON.stringify(list));
  }
  function generarNuevoId() {
    const lista = getAsuntos();
    const max = lista.reduce((m, a) => Math.max(m, Number(a.id) || 0), 0);
    return max + 1;
  }

  /* ---------- Render: agrega UNA tarjeta sin tocar las existentes ---------- */
  function addCardToGrid(asunto) {
    const grid = document.getElementById('asuntos-grid') || document.querySelector('.asuntos-grid');
    if (!grid) return;

    // Ajusta clases a tus estilos reales (card, body-card, etc.)
    const cardHtml = `
      <div class="card asunto-card" data-id="${asunto.id}">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h5 class="mb-1">${escapeHtml(asunto.expediente)} · ${escapeHtml(asunto.materia)}</h5>
              <p class="mb-1"><strong>Actor/Cliente:</strong> ${escapeHtml(asunto.nombre)}</p>
              <p class="mb-1"><strong>Demandado:</strong> ${escapeHtml(asunto.demandado || 'N/D')}</p>
              <p class="mb-1"><strong>Abogado:</strong> ${escapeHtml(asunto.abogado || 'Sin asignar')}</p>
              <span class="badge">${escapeHtml(asunto.prioridad || 'Media')}</span>
              <span class="badge">${escapeHtml(asunto.estado || 'Activo')}</span>
            </div>
            <div class="text-end">
              <button class="btn btn-outline-primary btn-ver-detalle" data-id="${asunto.id}">
                Ver detalle
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    grid.insertAdjacentHTML('afterbegin', cardHtml);
  }

  function escapeHtml(s) {
    return (s ?? '').toString()
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }

  /* ---------- Modal: abrir / guardar ---------- */
  function abrirModalNuevoAsunto() {
    const modal = document.getElementById('modal-nuevo-asunto');
    const form = document.getElementById('form-nuevo-asunto');
    if (!modal || !form) { console.warn('[Nuevo Asunto] Falta el HTML del modal.'); return; }

    form.reset();
    const prio = document.getElementById('na-prioridad');
    if (prio) prio.value = 'Media';

    modal.style.display = 'flex';

    const cerrar = () => (modal.style.display = 'none');

    const btnCerrar = document.getElementById('cerrar-modal-nuevo-asunto');
    const btnCancelar = document.getElementById('cancelar-nuevo-asunto');
    if (btnCerrar) btnCerrar.onclick = cerrar;
    if (btnCancelar) btnCancelar.onclick = cerrar;

    const outsideClick = (e) => {
      if (e.target === modal) {
        cerrar();
        modal.removeEventListener('click', outsideClick);
      }
    };
    modal.addEventListener('click', outsideClick);

    form.onsubmit = (e) => {
      e.preventDefault();
      guardarNuevoAsunto();
    };
  }

  function guardarNuevoAsunto() {
    const expediente = (document.getElementById('na-expediente')?.value || '').trim();
    const materia   = (document.getElementById('na-materia')?.value || '').trim();
    const nombre    = (document.getElementById('na-nombre')?.value || '').trim();
    const demandado = (document.getElementById('na-demandado')?.value || '').trim();
    const abogado   = (document.getElementById('na-abogado')?.value || '').trim();
    const prioridad = (document.getElementById('na-prioridad')?.value || 'Media').trim();
    const descripcion = (document.getElementById('na-descripcion')?.value || '').trim();

    if (!expediente || !materia || !nombre) {
      alert('Por favor completa: Expediente, Materia y Actor/Cliente.');
      return;
    }

    const id = generarNuevoId();
    const hoyISO = new Date().toISOString().slice(0,10);
    const nuevoAsunto = {
      id,
      expediente,
      nombre,
      materia,
      estado: 'Activo',
      prioridad,
      abogado: abogado || 'Sin asignar',
      demandado: demandado || 'N/D',
      fechaCreacion: hoyISO,
      descripcion: descripcion || '',
      stats: { documentos: 0, audiencias: 0, terminos: 0, dias: 0 },
      ultimaActividad: hoyISO
    };

    // Persistir
    const lista = getAsuntos();
    lista.unshift(nuevoAsunto);
    setAsuntos(lista);

    // Pintar SOLO la nueva card, sin tocar tus ejemplos
    addCardToGrid(nuevoAsunto);

    // Cerrar modal
    const modal = document.getElementById('modal-nuevo-asunto');
    if (modal) modal.style.display = 'none';
  }

  /* ---------- Botones: abrir modal (no redirigir) ---------- */
  function wireButtons() {
    const btnNuevo = document.getElementById('nuevo-asunto');
    if (btnNuevo) {
      btnNuevo.addEventListener('click', function (e) {
        e.preventDefault();
        abrirModalNuevoAsunto();
      });
    }
    const btnPrimero = document.getElementById('btn-crear-primer-asunto');
    if (btnPrimero) {
      btnPrimero.addEventListener('click', function (e) {
        e.preventDefault();
        abrirModalNuevoAsunto();
      });
    }

    // Por si existía una función global que redirigía
    if (typeof window.crearNuevoAsunto === 'function') {
      window.crearNuevoAsunto = function () { abrirModalNuevoAsunto(); };
    }
  }

  /* ---------- Delegación: botón "Ver detalle" en TODAS las cards (demo + nuevas) ---------- */
  function wireDelegationVerDetalle() {
    const grid = document.getElementById('asuntos-grid') || document.querySelector('.asuntos-grid') || document;
    grid.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn-ver-detalle,[data-action="ver-detalle"]');
      if (!btn) return;
      e.preventDefault();
      const id = btn.dataset.id || btn.getAttribute('data-id') || btn.getAttribute('data-detalle-id');
      if (!id) return;
      window.location.href = `asunto-detalle.html?id=${encodeURIComponent(id)}&nuevo=false`;
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    wireButtons();
    wireDelegationVerDetalle();
  });

  // Exponer por si lo necesitas
  window._nuevoAsuntoModal = {
    abrir: abrirModalNuevoAsunto,
    guardar: guardarNuevoAsunto,
    addCardToGrid
  };
})();
