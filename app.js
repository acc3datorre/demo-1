// ═══════════════════════════════════════════════════════════
// app.js · Lógica principal de la demo
// ═══════════════════════════════════════════════════════════

import { steps, stepInfo, demoSeq } from './data.js';
import { sleep, now, escapeAttr, $id } from './utils.js';
import { initTheme, toggleTheme } from './theme.js';

let selectedStep = null;
let isRunning = false;

// ─── STEP SELECTION ──────────────────────────────────
function selectStep(idx) {
  if (selectedStep !== null) {
    const prev = $id('step' + selectedStep);
    if (prev) prev.classList.remove('selected');
  }
  selectedStep = idx;
  const el = $id('step' + idx);
  if (el) el.classList.add('selected');
  openSidePanel(idx);
}

function openSidePanel(key) {
  const panel = $id('sidePanel');
  panel.classList.add('open');

  if (key === 'historial') {
    const info = stepInfo.historial;
    renderSidePanel(info.color, info.badge, info.type, info.name, info.bodyHTML);
    return;
  }

  // -1 lo usa openLogPanel para abrir el panel sin contenido de step
  if (key === -1) return;

  const s = steps[key];
  if (!s) return;

  const badgeLabel = { trigger: '⚡ Disparador', action: '▶ Acción', condition: '⬡ Condición' };
  const badgeClass = { trigger: 'badge-trigger', action: 'badge-action', condition: 'badge-condition' };

  let html = `
    <div class="sp-section">
      <div class="sp-section-title">Descripción</div>
      <p style="font-size:12px;color:var(--text-2);line-height:1.6;">${s.desc}</p>
    </div>
    <div class="sp-section">
      <div class="sp-section-title">Parámetros</div>
  `;
  s.fields.forEach(f => {
    html += `<div class="sp-field">
      <label>${f.label}</label>
      <input class="sp-input" value="${escapeAttr(f.val)}" readonly>
    </div>`;
  });
  html += `</div>`;

  if (s.outputs) {
    html += `<div class="sp-section">
      <div class="sp-section-title">Salidas dinámicas disponibles</div>`;
    s.outputs.forEach(o => {
      html += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
        <span style="font-size:11px;color:var(--text-2);min-width:90px;">${o.label}</span>
        <span class="param-val dynamic" style="font-size:11px;">${o.val}</span>
      </div>`;
    });
    html += `</div>`;
  }

  renderSidePanel(s.color, badgeClass[s.badge], badgeLabel[s.badge], s.name, html);
}

function renderSidePanel(color, badgeClass, badgeLabel, title, bodyHTML) {
  $id('spIcon').style.background = color;
  $id('spBadge').innerHTML = `<span class="sp-badge ${badgeClass}">${badgeLabel}</span>`;
  $id('spTitle').textContent = title;
  $id('spBody').innerHTML = bodyHTML;
}

function closeSidePanel() {
  $id('sidePanel').classList.remove('open');
  if (selectedStep !== null) {
    const el = $id('step' + selectedStep);
    if (el) el.classList.remove('selected');
    selectedStep = null;
  }
}

// ─── BUSINESS PREVIEW PANEL ──────────────────────────
function setBusinessStage(idx) {
  for (let i = 0; i <= 4; i++) {
    const el = $id('bp' + i);
    if (!el) continue;
    el.classList.remove('active', 'done');
    if (i < idx) el.classList.add('done');
    if (i === idx) el.classList.add('active');
  }
}
function resetBusinessPanel() { setBusinessStage(0); }
function completeBusinessPanel() {
  for (let i = 0; i <= 4; i++) {
    const el = $id('bp' + i);
    if (el) { el.classList.remove('active'); el.classList.add('done'); }
  }
}

// ─── DEMO RUN ────────────────────────────────────────
async function startDemo() {
  if (isRunning) return;
  isRunning = true;

  const btn = $id('btnRun');
  btn.classList.add('running');
  btn.disabled = true;
  btn.innerHTML = `<span class="spin">⟳</span> Ejecutando...`;

  // reset
  resetBusinessPanel();
  for (let i = 0; i <= 6; i++) {
    const el = $id('step' + i);
    if (el) el.classList.remove('running-step', 'done-step', 'error-step', 'selected');
    const si = $id('si' + i);
    if (si) { si.className = 'step-status-icon'; si.textContent = ''; }
    const ln = $id('line' + i);
    if (ln) ln.classList.remove('active', 'done');
  }

  // reset status
  const dot = $id('statusDot');
  dot.className = 'flow-status-dot running';
  $id('statusLabel').textContent = 'Ejecutando...';

  // open log panel
  openLogPanel();
  showToast('⚡ Ejecutando flujo...', 'Email de región NORTE detectado', 0);

  for (const frame of demoSeq) {
    await sleep(frame.delay);
    updateToast(frame.msg, frame.prog);
    if (frame.bp !== undefined) setBusinessStage(frame.bp);

    if (frame.done) {
      dot.className = 'flow-status-dot active';
      $id('statusLabel').textContent = 'Última ejecución: hace unos segundos · Exitosa';
      addLog('ok', '✅ Ejecución completada exitosamente (3.2s)');
      completeBusinessPanel();
      showToast('✅ Flujo completado', 'Todas las acciones ejecutadas', 100);
      await sleep(600);
      markStepDone(demoSeq[demoSeq.length - 2].step);
      break;
    }

    // prev done
    const prevIdx = demoSeq.indexOf(frame) - 1;
    if (prevIdx >= 0 && demoSeq[prevIdx].step !== undefined) {
      markStepDone(demoSeq[prevIdx].step);
      if (demoSeq[prevIdx].line !== undefined) markLineDone(demoSeq[prevIdx].line);
    }

    // current running
    markStepRunning(frame.step);
    if (frame.line !== undefined) markLineActive(frame.line);
    addLog('run', steps[frame.step]?.logMsg || frame.msg);
  }

  await sleep(1800);
  hideToast();
  isRunning = false;
  btn.classList.remove('running');
  btn.disabled = false;
  btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 16 16" fill="white"><path d="M4 2l10 6-10 6V2z"/></svg> Ejecutar demo`;
}

function markStepRunning(idx) {
  const el = $id('step' + idx);
  if (!el) return;
  el.classList.add('running-step');
  el.classList.remove('done-step');
  const si = $id('si' + idx);
  if (si) {
    si.className = 'step-status-icon status-running show';
    si.textContent = '⟳';
  }
}

function markStepDone(idx) {
  const el = $id('step' + idx);
  if (!el) return;
  el.classList.remove('running-step');
  el.classList.add('done-step');
  const si = $id('si' + idx);
  if (si) {
    si.className = 'step-status-icon status-done show';
    si.textContent = '✓';
  }
}

function markLineActive(idx) {
  const ln = $id('line' + idx);
  if (ln) { ln.classList.add('active'); ln.classList.remove('done'); }
}
function markLineDone(idx) {
  const ln = $id('line' + idx);
  if (ln) { ln.classList.remove('active'); ln.classList.add('done'); }
}

// ─── TOAST ───────────────────────────────────────────
function showToast(title, msg, prog) {
  const t = $id('runToast');
  $id('toastTitle').textContent = title;
  $id('toastMsg').textContent = msg;
  $id('toastBar').style.width = prog + '%';
  t.classList.add('show');
}
function updateToast(msg, prog) {
  $id('toastMsg').textContent = msg;
  $id('toastBar').style.width = prog + '%';
}
function hideToast() {
  $id('runToast').classList.remove('show');
}

// ─── LOG PANEL ───────────────────────────────────────
function openLogPanel() {
  openSidePanel(-1);

  const panel = $id('sidePanel');
  panel.classList.add('open');

  $id('spIcon').style.background = '#1e1e1e';
  $id('spBadge').innerHTML = `<span class="sp-badge" style="background:#1e1e1e;color:#4ec9b0;">⚡ En ejecución</span>`;
  $id('spTitle').textContent = 'Log de ejecución en vivo';
  $id('spBody').innerHTML = `
    <div class="sp-section">
      <div class="sp-section-title">Registro de acciones</div>
      <div class="run-log" id="runLog">
        <div class="log-line"><span class="log-ts">[${now()}]</span> <span class="log-run">Iniciando flujo...</span></div>
      </div>
    </div>
  `;
}

function addLog(type, msg) {
  const log = $id('runLog');
  if (!log) return;
  const line = document.createElement('div');
  line.className = 'log-line';
  line.innerHTML = `<span class="log-ts">[${now()}]</span> <span class="log-${type}">${msg}</span>`;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

// ─── EVENT WIRING ─────────────────────────────────────
// (Reemplaza todos los onclick="..." inline del HTML original)
function wireEvents() {
  // Step cards
  document.querySelectorAll('[data-step]').forEach(el => {
    const idx = Number(el.dataset.step);
    el.addEventListener('click', () => selectStep(idx));
  });

  // Botón Ejecutar demo
  $id('btnRun').addEventListener('click', startDemo);

  // Botón Historial
  $id('btnHistory').addEventListener('click', () => openSidePanel('historial'));

  // Cerrar panel
  $id('btnClosePanel').addEventListener('click', closeSidePanel);

  // Toggle theme
  $id('btnTheme').addEventListener('click', toggleTheme);

  // ESC cierra el panel
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidePanel();
  });
}

// ─── INIT ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  wireEvents();
  resetBusinessPanel();
});
