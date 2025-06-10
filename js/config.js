// js/config.js

// Función global para obtener el token JWT guardado
window.getToken = () => localStorage.getItem('token');

// Base URL de la API, cambia según entorno
window.API_BASE = (() => {
  const host = window.location.hostname;
  // Desarrollo local
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }
  // Producción (tu App Service)
  return 'https://gitbook-backend-dxazafeuhvgzacbc.brazilsouth-01.azurewebsites.net/api';
})();

// Logs para verificar que carga correctamente
console.log('🔌 Backend levantado');
console.log('🌐 API_BASE →', window.API_BASE);
