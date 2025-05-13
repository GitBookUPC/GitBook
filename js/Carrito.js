// js/Carrito.js

// 1. Recupera el token JWT
//function getToken() {
 // return localStorage.getItem('token');
//}

// 2. Pide al servidor los ítems del carrito y los renderiza
async function renderCarrito() {
  const token = getToken();
  if (!token) {
    alert('Debes iniciar sesión.');
    return window.location.href = 'Login.html';
  }

  const res = await fetch(`${API_BASE}/carrito`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  if (!res.ok) {
    console.error('Error al cargar carrito:', res.status, res.statusText);
    return;
  }

  const items = await res.json();
  const contenedor = document.getElementById('lista-carrito');
  const totalSpan    = document.getElementById('total');
  contenedor.innerHTML = '';

  if (items.length === 0) {
    contenedor.innerHTML = '<p>No hay libros en el carrito.</p>';
    totalSpan.textContent = '0.00';
    return;
  }

  let total = 0;
  items.forEach(item => {
    const libro   = item.libro;
    const cantidad = item.cantidad;
    total += libro.precio * cantidad;

    const card = document.createElement('div');
    card.className = 'tarjeta-noticia';
    card.innerHTML = `
      <img src="${libro.urlImagen}" alt="${libro.titulo}"
           style="width:100%; height:180px; object-fit:cover; border-radius:5px;">
      <h3>${libro.titulo}</h3>
      <p>Precio: S/ ${libro.precio.toFixed(2)} × ${cantidad}</p>
      <button onclick="eliminarDelCarrito(${item.itemCarritoID})"
        style="margin-top:10px; background-color:#c62828; color:white;
               padding:6px 12px; border:none; border-radius:5px;">
        Eliminar
      </button>
    `;
    contenedor.appendChild(card);
  });

  totalSpan.textContent = total.toFixed(2);
}

// 3. Elimina un ítem en el servidor y refresca
async function eliminarDelCarrito(itemCarritoID) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/carrito/${itemCarritoID}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  if (!res.ok) {
    alert('No se pudo eliminar el ítem.');
    return;
  }
  renderCarrito();
}

// 4. Crea un pedido y redirige al gateway
async function pagar() {
  const token = getToken();
  const res = await fetch(`${API_BASE}/pedidos`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  if (!res.ok) {
    alert('Error al procesar el pago.');
    return;
  }
  const { urlPago } = await res.json();
  // Si tu API devuelve la URL de la pasarela:
  window.location.href = urlPago;
}

// 5. Inicializa al cargar la página
document.addEventListener('DOMContentLoaded', renderCarrito);
