// ═══════════════════════════════════════════════════════════
// utils.js · Funciones auxiliares
// ═══════════════════════════════════════════════════════════

/** Promesa-sleep para animaciones secuenciales */
export const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/** Hora local formateada para los logs */
export function now() {
  return new Date().toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/** Escape simple de comillas en valores que se inyectan en atributos value */
export function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;');
}

/** Atajo querySelector */
export const $ = (sel) => document.querySelector(sel);
export const $id = (id) => document.getElementById(id);
