// js/DetalleLibro.js

// Leer query string
function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

// Volver a la página de categorías
document.getElementById('btn-volver').onclick = () => {
  window.history.back();
};

async function cargarDetalle() {
  const libroID = getQueryParam('libroID');
  if (!libroID) {
    alert('No se especificó ningún libro.');
    return window.location.href = 'Categorias.html';
  }

  try {
    const res = await fetch(`${API_BASE}/libros/${libroID}`, {
      headers: localStorage.getItem('token')
        ? { 'Authorization': 'Bearer ' + getToken() }
        : {}
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);

    const b = await res.json();

    // Rellenar campos
    document.getElementById('img-portada').src = b.UrlImagen;
    document.getElementById('titulo-libro').textContent = b.Titulo;
    document.getElementById('categoria-libro').textContent = b.NombreCategoria;
    document.getElementById('autores-libro').textContent = 'Autor(es): ' + b.Autores;
    document.getElementById('descripcion-libro').textContent = b.Descripcion;
    document.getElementById('precio-libro').textContent = b.Precio.toFixed(2);

    // Botón agregar
    document.getElementById('btn-agregar').onclick = async () => {
      const resp = await fetch(`${API_BASE}/carrito`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && { 'Authorization': 'Bearer ' + getToken() })
        },
        body: JSON.stringify({ libroID: Number(libroID), cantidad: 1 })
      });
      if (resp.ok) {
        alert('✅ Libro añadido al carrito');
        window.history.back();
      } else {
        alert('❌ No se pudo añadir al carrito');
      }
    };

  } catch (err) {
    console.error('Error al cargar detalle:', err);
    alert('No se pudo cargar el detalle del libro.');
    window.location.href = 'Categorias.html';
  }
}

document.addEventListener('DOMContentLoaded', cargarDetalle);
