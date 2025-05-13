// js/checkConnection.js
async function checkConnection() {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
    if (res.ok) {
      console.log('✅ Backend levantado');
      mostrarEstado('Conectado', true);
    } else {
      console.warn('❌ Backend respondió con', res.status);
      mostrarEstado('Error en API', false);
    }
  } catch (err) {
    console.error('❌ No se conecta a backend:', err);
    mostrarEstado('Sin conexión', false);
  }
}

function mostrarEstado(text, ok) {
  let badge = document.getElementById('status-backend');
  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'status-backend';
    badge.style = `
      position: fixed; bottom: 10px; right: 10px;
      padding: 6px 10px; border-radius: 4px;
      color: white; font-size: 0.9rem;
    `;
    document.body.appendChild(badge);
  }
  badge.textContent = text;
  badge.style.backgroundColor = ok ? '#2e7d32' : '#c62828';
}

document.addEventListener('DOMContentLoaded', checkConnection);
