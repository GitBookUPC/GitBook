// js/config.js
window.API_BASE = (() => {
  const host = window.location.hostname;

  // Desarrollo local
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }

  // Producción (tu App Service)
  return 'https://gitbook-backend-dxazafeuhvgzacbc.brazilsouth-01.azurewebsites.net/api';
})();
console.log('API_BASE →', API_BASE);
