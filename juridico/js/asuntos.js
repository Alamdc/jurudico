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
              <span class="badge semaforo-badge" data-id="${asunto.id}" style="color:#fff;">
                ${textoSemaforo(asunto)}
              </span>
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

  /* ---------- Semáforo de términos y audiencias ---------- */
  function calcularSemaforo(asunto) {
    const hoy = new Date();
    const proximos = [...(asunto.stats.terminos || []), ...(asunto.stats.audiencias || [])];
    if (!proximos.length) return { color: '#28a745', texto: 'OK', count: 0 }; // verde

    let color = '#28a745', texto = 'OK', count = 0;
    for (let e of proximos) {
        const fecha = new Date(e.fecha);
        const diffDias = Math.ceil((fecha - hoy)/(1000*60*60*24));
        if(diffDias >= 0 && diffDias <= 1) { color = '#dc3545'; texto = 'Hoy'; count++; break; } // rojo
        if(diffDias > 1 && diffDias <= 3 && color !== '#dc3545') { color = '#ffc107'; texto = 'Próximo'; count++; } // amarillo
    }
    return { color, texto, count };
  }

  function textoSemaforo(asunto) {
    const s = calcularSemaforo(asunto);
    return s.count > 0 ? `${s.texto} (${s.count})` : s.texto;
  }

  function actualizarSemaforos() {
    const asuntos = getAsuntos();
    document.querySelectorAll('.semaforo-badge').forEach(el => {
        const id = parseInt(el.dataset.id);
        const asunto = asuntos.find(a => a.id === id);
        if(asunto){
            const s = calcularSemaforo(asunto);
            el.style.backgroundColor = s.color;
            el.textContent = s.count > 0 ? `${s.texto} (${s.count})` : s.texto;
        }
    });
  }

  /* ---------- Modal: abrir / guardar ---------- */
  function abrirModalNuevoAsunto() {
    const modal = document.getElementById('modal-nuevo-asunto');
    const form = document.getElementById('form-nuevo-asunto');
    if (!modal || !form) return;

    form.reset();
    const prio = document.getElementById('na-prioridad');
    if (prio) prio.value = 'Media';
    modal.style.display = 'flex';

    const cerrar = () => (modal.style.display = 'none');
    document.getElementById('cerrar-modal-nuevo-asunto').onclick = cerrar;
    document.getElementById('cancelar-nuevo-asunto').onclick = cerrar;

    const outsideClick = (e) => { if(e.target === modal) { cerrar(); modal.removeEventListener('click', outsideClick); } };
    modal.addEventListener('click', outsideClick);

    form.onsubmit = (e) => { e.preventDefault(); guardarNuevoAsunto(); };
  }

  function guardarNuevoAsunto() {
    const expediente = (document.getElementById('na-expediente')?.value || '').trim();
    const materia   = (document.getElementById('na-materia')?.value || '').trim();
    const nombre    = (document.getElementById('na-nombre')?.value || '').trim();
    const demandado = (document.getElementById('na-demandado')?.value || '').trim();
    const abogado   = (document.getElementById('na-abogado')?.value || '').trim();
    const prioridad = (document.getElementById('na-prioridad')?.value || 'Media').trim();
    const descripcion = (document.getElementById('na-descripcion')?.value || '').trim();

    if (!expediente || !materia || !nombre) { alert('Completa: Expediente, Materia y Actor/Cliente.'); return; }

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
      stats: { documentos: 0, audiencias: [], terminos: [], dias: 0 },
      ultimaActividad: hoyISO
    };

    const lista = getAsuntos();
    lista.unshift(nuevoAsunto);
    setAsuntos(lista);

    addCardToGrid(nuevoAsunto);
    document.getElementById('modal-nuevo-asunto').style.display = 'none';
    generarGraficaGerencias();
    actualizarSemaforos();
  }

  /* ---------- Botones ---------- */
  function wireButtons() {
    document.getElementById('nuevo-asunto')?.addEventListener('click', abrirModalNuevoAsunto);
    document.getElementById('btn-crear-primer-asunto')?.addEventListener('click', abrirModalNuevoAsunto);
    window.crearNuevoAsunto = abrirModalNuevoAsunto;
  }

  function wireDelegationVerDetalle() {
    const grid = document.getElementById('asuntos-grid') || document;
    grid.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn-ver-detalle,[data-action="ver-detalle"]');
      if (!btn) return;
      e.preventDefault();
      const id = btn.dataset.id || btn.getAttribute('data-id');
      if (!id) return;
      window.location.href = `asunto-detalle.html?id=${encodeURIComponent(id)}&nuevo=false`;
    });
  }

  /* ---------- Gráfica ---------- */
  function generarGraficaGerencias() {
    const ctx = document.getElementById('grafica-gerencias');
    if (!ctx) return;

    const lista = getAsuntos();
    if (!lista.length) return;

    const conteo = {};
    lista.forEach(a => {
      const g = a.abogado && a.abogado !== 'Sin asignar' ? a.abogado : 'No asignado';
      conteo[g] = (conteo[g] || 0) + 1;
    });

    const etiquetas = Object.keys(conteo);
    const valores = Object.values(conteo);

    if (window._graficaGerencias) window._graficaGerencias.destroy();

    window._graficaGerencias = new Chart(ctx, {
      type: 'pie',
      data: { labels: etiquetas, datasets: [{ data: valores, backgroundColor: ['#36A2EB','#FF6384','#FFCE56','#4BC0C0','#9966FF','#FF9F40'], borderWidth: 1 }] },
      options: { plugins: { legend: { position: 'bottom', labels: { color: '#333', font: { size: 14 } } } } }
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    wireButtons();
    wireDelegationVerDetalle();
    generarGraficaGerencias();
    actualizarSemaforos();

    // Actualizar semáforos automáticamente cada minuto
    setInterval(actualizarSemaforos, 60000);
  });

  window._nuevoAsuntoModal = { abrir: abrirModalNuevoAsunto };
  window.initAsuntos = function() {
    wireButtons();
    wireDelegationVerDetalle();
    generarGraficaGerencias();
    actualizarSemaforos();
  };
})();
