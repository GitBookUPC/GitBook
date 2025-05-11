
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function renderCarrito() {
  const contenedor = document.getElementById('lista-carrito');
  const totalSpan = document.getElementById('total');
  let total = 0;

  contenedor.innerHTML = '';

  if (carrito.length === 0) {
    contenedor.innerHTML = '<p>No hay libros en el carrito.</p>';
    totalSpan.textContent = "0.00";
    return;
  }

  carrito.forEach((libro, index) => {
    total += libro.precio;

    const card = document.createElement('div');
    card.classList.add('tarjeta-noticia');
    card.innerHTML = `
      <img src="${libro.imagen}" alt="${libro.titulo}" style="width:100%; height:180px; object-fit:cover; border-radius:5px;">
      <h3>${libro.titulo}</h3>
      <p>Precio: S/ ${libro.precio.toFixed(2)}</p>
      <button onclick="eliminarDelCarrito(${index})" style="margin-top: 10px; background-color: #c62828; color: white; padding: 6px 12px; border: none; border-radius: 5px;">Eliminar</button>
    `;
    contenedor.appendChild(card);
  });

  totalSpan.textContent = total.toFixed(2);
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  renderCarrito();
}

function pagar() {
  alert("Gracias por tu compra 📚");
  localStorage.removeItem('carrito');
  renderCarrito();
}

document.addEventListener('DOMContentLoaded', renderCarrito);