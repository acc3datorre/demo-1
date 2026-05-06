// ═══════════════════════════════════════════════════════════
// theme.js · Dark / Light mode con persistencia en localStorage
// ═══════════════════════════════════════════════════════════

const THEME_KEY = 'pa-demo-theme';

/** Aplica el tema al <html> */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('btnTheme');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/** Inicializa el tema al cargar (lee preferencia guardada o del SO) */
export function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }

  const prefersDark = window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const theme = saved || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);
}

/** Toggle handler (se asigna al botón) */
export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
}
