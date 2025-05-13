// js/config.js

/**
 * BASE URL de tu API.
 * - En desarrollo local apunta al puerto donde corre tu backend (ej: http://localhost:3000/api)
 * - En producción apunta al App Service de Azure (ej: https://mi-app.azurewebsites.net/api)
 */
window.API_BASE = (() => {
  // Detecta si estás en localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }
  // Cambia esto por la URL real de tu backend en Azure
  return 'https://TU_APP_SERVICE.azurewebsites.net/api';
})();
