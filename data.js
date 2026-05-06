// ═══════════════════════════════════════════════════════════
// data.js · Definición de pasos del flujo y datos auxiliares
// ═══════════════════════════════════════════════════════════

export const steps = [
  {
    id: 0,
    type: 'Disparador',
    badge: 'trigger',
    name: 'Cuando llega un correo con cierre mensual (V3)',
    connector: 'Microsoft Outlook',
    color: '#0078d4',
    desc: 'Monitorea la bandeja de entrada del CFO Office. Se activa cuando una región envía un email con asunto de cierre mensual y al menos un adjunto Excel. Este es el disparador que inicia todo el flujo sin intervención manual.',
    fields: [
      { label: 'Cuenta de correo', val: 'cfo-office@empresa.com' },
      { label: 'Asunto contiene', val: '"Cierre mensual"', dynamic: true },
      { label: 'Tiene archivo adjunto', val: 'Sí', dynamic: true },
      { label: 'Importancia', val: 'Cualquiera' },
      { label: 'Carpeta', val: 'Bandeja de entrada' },
    ],
    outputs: [
      { label: 'De (remitente)', val: "triggerOutputs()?['from']" },
      { label: 'Asunto', val: "triggerOutputs()?['subject']" },
      { label: 'Adjuntos', val: "triggerBody()?['hasAttachments']" },
    ],
    logMsg: '📧 Email recibido de region-norte@empresa.com – "Cierre mensual Abril 2026"'
  },
  {
    id: 1,
    type: 'Acción · SharePoint',
    badge: 'action',
    name: 'Guardar adjunto Excel en SharePoint',
    connector: 'SharePoint',
    color: '#038387',
    desc: 'Guarda el Excel adjunto en una biblioteca de SharePoint del CFO Office. La ruta se arma automáticamente por mes, dejando trazabilidad de qué región envió cada archivo y cuándo.',
    fields: [
      { label: 'Dirección del sitio', val: 'https://empresa.sharepoint.com/sites/CFO-Office' },
      { label: 'Ruta de carpeta', val: "/CFO Office/Cierres/@{formatDateTime(utcNow(),'MMMM-yyyy')}", dynamic: true },
      { label: 'Nombre del archivo', val: "@{variables('region')}_Cierre.xlsx", dynamic: true },
      { label: 'Contenido del archivo', val: 'Contenido del adjunto (base64)', dynamic: true },
    ],
    outputs: [
      { label: 'ID de archivo', val: "outputs('Crear_archivo')?['body/Id']" },
      { label: 'Ruta completa', val: "outputs('Crear_archivo')?['body/Path']" },
    ],
    logMsg: '📁 Archivo guardado → /CFO Office/Cierres/Abril-2026/NORTE_Cierre.xlsx'
  },
  {
    id: 2,
    type: 'Acción · Excel Online (Business)',
    badge: 'action',
    name: 'Validar plantilla y listar KPIs estándar',
    connector: 'Excel Online',
    color: '#217346',
    desc: 'Abre el Excel guardado, valida que exista la tabla estándar KPIs_Regionales y lista sus filas para extraer los campos definidos. Esta validación hace que la automatización sea robusta ante archivos mal formateados.',
    fields: [
      { label: 'Ubicación', val: 'SharePoint' },
      { label: 'Biblioteca de documentos', val: 'CFO Office' },
      { label: 'Archivo', val: 'ID del archivo guardado', dynamic: true },
      { label: 'Tabla', val: 'KPIs_Regionales' },
      { label: 'Acción', val: 'Listar filas presentes en una tabla' },
    ],
    outputs: [
      { label: 'Ventas', val: "body('Obtener_fila')?['Ventas']" },
      { label: 'EBITDA', val: "body('Obtener_fila')?['EBITDA']" },
      { label: 'Headcount', val: "body('Obtener_fila')?['Headcount']" },
    ],
    logMsg: '📊 Plantilla validada y KPIs leídos → Ventas: $4.2M | EBITDA: $890K | HC: 342'
  },
  {
    id: 3,
    type: 'Acción · Excel Online (Business)',
    badge: 'action',
    name: 'Actualizar fila – Planilla maestra de consolidación',
    connector: 'Excel Online',
    color: '#217346',
    desc: 'Vuelca las cifras extraídas en la fila correspondiente a la región dentro de la planilla maestra. Así el CFO tiene un único consolidado actualizado sin copiar y pegar datos manualmente.',
    fields: [
      { label: 'Archivo', val: 'Consolidado_CFO_Master.xlsx' },
      { label: 'Tabla', val: 'Consolidado' },
      { label: 'Clave (Región)', val: "@{variables('regionRemitente')}", dynamic: true },
      { label: 'Ventas', val: "@{body('Obtener_fila')?['Ventas']}", dynamic: true },
      { label: 'EBITDA', val: "@{body('Obtener_fila')?['EBITDA']}", dynamic: true },
      { label: 'Headcount', val: "@{body('Obtener_fila')?['Headcount']}", dynamic: true },
      { label: 'Fecha ingreso', val: '@{utcNow()}', dynamic: true },
    ],
    outputs: [
      { label: 'Filas actualizadas', val: '1' },
    ],
    logMsg: '✏️  Planilla maestra actualizada → Región NORTE (fila 3/7 completada)'
  },
  {
    id: 4,
    type: 'Control · Condición',
    badge: 'condition',
    name: '¿Cierre regional completo?',
    connector: 'Control',
    color: '#ca5010',
    desc: 'Evalúa el estado de recepción del cierre. Si las 7 regiones ya enviaron información válida, notifica al CFO. Si todavía faltan regiones, deja actualizado el estado para que el flujo programado de recordatorios actúe el 5.º día hábil.',
    fields: [
      { label: 'Variable izquierda', val: "@{variables('regionesCompletadas')}", dynamic: true },
      { label: 'Operador', val: 'es igual a' },
      { label: 'Valor derecho', val: '7' },
    ],
    logMsg: '🔀 Condición evaluada: regionesCompletadas = 3 → Rama NO (faltan 4 regiones)'
  },
  {
    id: 5,
    type: 'Acción · Outlook',
    badge: 'action',
    name: 'Enviar correo – Notificación al CFO',
    connector: 'Microsoft Outlook',
    color: '#0078d4',
    desc: 'Envía un email al CFO cuando el cierre está completo, incluyendo link directo al consolidado en SharePoint y una síntesis de regiones procesadas.',
    fields: [
      { label: 'Para', val: 'cfo@empresa.com' },
      { label: 'Asunto', val: "✅ Cierre completo – @{formatDateTime(utcNow(),'MMMM yyyy')}", dynamic: true },
      { label: 'Cuerpo', val: 'Las 7 regiones enviaron su cierre. Ver planilla: [link]', dynamic: true },
      { label: 'Importancia', val: 'Alta' },
    ],
    logMsg: '✅ Email enviado al CFO → "Cierre Abril 2026 completado – todas las regiones"'
  },
  {
    id: 6,
    type: 'Acción · Outlook',
    badge: 'action',
    name: 'Enviar recordatorio – Regiones faltantes',
    connector: 'Microsoft Outlook',
    color: '#0078d4',
    desc: 'Representa un segundo flujo programado: el 5.º día hábil revisa la planilla maestra, identifica regiones faltantes y envía recordatorios automáticos.',
    fields: [
      { label: 'Para', val: "@{variables('regionesFaltantes')}", dynamic: true },
      { label: 'Asunto', val: '⏰ Recordatorio: Cierre mensual pendiente', dynamic: true },
      { label: 'Cuerpo', val: 'El cierre mensual vence hoy (5.º día hábil). Por favor envíe el reporte.', dynamic: true },
      { label: 'Importancia', val: 'Alta' },
    ],
    logMsg: '⏰ Recordatorios enviados a: CENTRO, SUR, PATAGONIA, CUYO (4 regiones pendientes)'
  },
];

export const stepInfo = {
  historial: {
    type: 'Historial de ejecución',
    badge: 'action',
    name: 'Ejecuciones recientes',
    color: '#0078d4',
    bodyHTML: `
      <div class="sp-section">
        <div class="sp-section-title">Últimas 7 días</div>
        <div class="run-history" id="historyList">
          <div class="history-row"><div class="history-dot hdot-ok"></div><div class="history-name">Región NORTE</div><div class="history-ts">Hoy 09:14</div><div class="history-dur">3.2s</div></div>
          <div class="history-row"><div class="history-dot hdot-ok"></div><div class="history-name">Región CENTRO</div><div class="history-ts">Hoy 08:52</div><div class="history-dur">2.8s</div></div>
          <div class="history-row"><div class="history-dot hdot-err"></div><div class="history-name">Región SUR</div><div class="history-ts">Ayer 17:30</div><div class="history-dur">1.1s</div></div>
          <div class="history-row"><div class="history-dot hdot-ok"></div><div class="history-name">Región CUYO</div><div class="history-ts">Ayer 16:00</div><div class="history-dur">4.0s</div></div>
        </div>
      </div>
      <div class="sp-section">
        <div class="sp-section-title">Estadísticas del mes</div>
        <div style="display:flex;gap:12px;">
          <div style="flex:1;background:#f0fff4;border:1px solid #c6f6d5;border-radius:6px;padding:10px;text-align:center;">
            <div style="font-size:22px;font-weight:700;color:#276749;">3</div>
            <div style="font-size:11px;color:#48bb78;">Completadas</div>
          </div>
          <div style="flex:1;background:#fff5f0;border:1px solid #fcd9c5;border-radius:6px;padding:10px;text-align:center;">
            <div style="font-size:22px;font-weight:700;color:#9c2a00;">4</div>
            <div style="font-size:11px;color:#e07040;">Pendientes</div>
          </div>
          <div style="flex:1;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:10px;text-align:center;">
            <div style="font-size:22px;font-weight:700;color:#1d4ed8;">3.1s</div>
            <div style="font-size:11px;color:#60a5fa;">Duración media</div>
          </div>
        </div>
      </div>
    `
  }
};

// Secuencia de la demo (ejecución animada)
export const demoSeq = [
  { step: 0, line: 0, bp: 0, msg: 'Email recibido con adjunto Excel...', prog: 8, delay: 600 },
  { step: 1, line: 1, bp: 1, msg: 'Guardando archivo en SharePoint /Cierres/Abril-2026...', prog: 25, delay: 900 },
  { step: 2, line: 2, bp: 2, msg: 'Validando plantilla y leyendo KPIs del Excel...', prog: 45, delay: 900 },
  { step: 3, line: 3, bp: 3, msg: 'Actualizando planilla maestra de consolidación...', prog: 65, delay: 900 },
  { step: 4, msg: 'Evaluando condición: ¿7/7 regiones?', prog: 78, delay: 700 },
  { step: 6, bp: 4, msg: 'Actualizando lista de pendientes para recordatorio programado...', prog: 90, delay: 900 },
  { done: true, msg: '✅ Flujo completado en 3.2s', prog: 100, delay: 600 },
];
