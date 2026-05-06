# Power Automate – Demo CFO

Demo interactiva que simula la interfaz de Microsoft Power Automate mostrando un flujo de **Consolidación de Reportes Regionales** (Outlook → SharePoint → Excel Online → Condición → Notificación).

## 🚀 Características

- **Diseño fiel a Power Automate** (tipografía, colores, layout del designer).
- **Animación de ejecución** paso a paso con botón "Ejecutar demo".
- **Vista de negocio** en panel lateral mostrando los artefactos reales (email, archivos, planillas).
- **Panel de detalle por paso** con parámetros y salidas dinámicas.
- **Log de ejecución en vivo** estilo terminal con timestamps.
- 🌙 **Dark mode** con persistencia (botón 🌙 en topbar, recuerda preferencia).
- 📱 **Responsive** (oculta panel lateral en pantallas chicas, ajusta topbar en mobile).
- ⌨️ **Atajos de teclado** (Esc cierra el panel lateral).
- ✨ **Animaciones de entrada** suaves para las tarjetas.

## 📁 Estructura del proyecto

```
power-automate-demo/
├── index.html          # Estructura HTML
├── css/
│   └── styles.css      # Todos los estilos (light + dark)
├── js/
│   ├── app.js          # Lógica principal y wiring de eventos
│   ├── data.js         # Datos de los pasos del flujo
│   ├── theme.js        # Dark/Light mode
│   └── utils.js        # Helpers reutilizables
└── README.md
```

## 🌐 Cómo publicarlo en GitHub Pages

1. **Subir el repo a GitHub** (público o privado con plan Pro).
2. Ir a **Settings → Pages** en el repositorio.
3. En **Source**, elegir:
   - **Branch:** `main` (o la que uses)
   - **Folder:** `/ (root)`
4. Apretar **Save**.
5. Esperar 1–2 minutos. Tu demo va a estar disponible en:
   ```
   https://<tu-usuario>.github.io/<nombre-del-repo>/
   ```

> ✅ No se necesita ningún build step ni servidor: es HTML/CSS/JS puro.
> ✅ Los `<script type="module">` funcionan sin problemas en GitHub Pages (sirve por HTTPS).

## 🧪 Probar localmente (opcional)

Si en algún momento querés correrlo en tu máquina, **no podés abrir el `index.html` con doble click** porque los módulos ES6 requieren un servidor por el CORS del protocolo `file://`. Usá uno de estos:

| Opción | Comando |
|---|---|
| Python 3 | `python -m http.server 8000` |
| Node.js | `npx serve` |
| VS Code | Extensión "Live Server" → click derecho en `index.html` |

Luego abrir `http://localhost:8000`.

## 🎨 Decisiones de diseño

- **CSS variables con tema**: el dark mode no duplica reglas, solo redefine variables bajo `[data-theme="dark"]`.
- **Módulos ES6** (`import`/`export`): código separado por responsabilidad, sin globals.
- **Sin onclick inline**: todos los handlers se registran en `wireEvents()` con `addEventListener`, lo que separa estructura (HTML) de comportamiento (JS).
- **Datos centralizados** en `data.js`: agregar un paso al flujo se hace solo agregando un objeto al array.

## 📄 Licencia

Demo educativa. Los logos y nombres de Microsoft, Power Automate, SharePoint, Outlook y Excel pertenecen a Microsoft Corporation.
