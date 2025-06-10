// js/DetalleLibro.js

// 1) Leer query string
function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

// 2) Volver atrás
document.getElementById('btn-volver').onclick = () => {
  window.history.back();
};

document.addEventListener('DOMContentLoaded', async () => {
  await cargarDetalle();
  await cargarComentarios();
  configurarEnvioComentario();
});

// 3) Cargar detalle del libro
async function cargarDetalle() {
  const libroID = getQueryParam('libroID');
  if (!libroID) {
    alert('No se especificó ningún libro.');
    return window.location.href = 'Categorias.html';
  }

  try {
    const headers = {};
    const token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch(`${API_BASE}/libros/${libroID}`, { headers });
    if (!res.ok) throw new Error(`Status ${res.status}`);

    const b = await res.json();
    document.getElementById('img-portada').src             = b.UrlImagen;
    document.getElementById('titulo-libro').textContent    = b.Titulo;
    document.getElementById('categoria-libro').textContent = b.NombreCategoria;
    document.getElementById('autores-libro').textContent   = 'Autor(es): ' + b.Autores;
    document.getElementById('descripcion-libro').textContent = b.Descripcion;
    document.getElementById('precio-libro').textContent    = b.Precio.toFixed(2);

    // Botón "Agregar al carrito"
    document.getElementById('btn-agregar').onclick = async () => {
      const token = getToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;

      const resp = await fetch(`${API_BASE}/carrito`, {
        method: 'POST',
        headers,
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

// 4) Cargar y renderizar comentarios
async function cargarComentarios() {
  const libroID = getQueryParam('libroID');
  const listEl  = document.getElementById('comments-list');
  listEl.innerHTML = '<p>Cargando comentarios…</p>';

  try {
    const token = getToken();
    const headers = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch(`${API_BASE}/comments/${libroID}`, { headers });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const comments = await res.json();

    if (!Array.isArray(comments) || comments.length === 0) {
      listEl.innerHTML = '<p>No hay comentarios aún.</p>';
      return;
    }

    listEl.innerHTML = '';
    comments.forEach(c => {
      const item = document.createElement('div');
      item.className = 'comment-item';
      item.dataset.id = c.mongoId;

      item.innerHTML = `
        <div class="comment-content">
          <p class="comment-meta">
            <strong>${c.usuario}</strong> — 
            ${new Date(c.fecha).toLocaleString()}
          </p>
          <p>⭐️ ${c.rating} / 5</p>
          <p>${c.text}</p>
        </div>
        <div class="comment-actions">
          <button class="btn-like">👍 <span>${c.helpfulVotes || 0}</span></button>
          <button class="btn-dislike">👎</button>
        </div>
      `;
      listEl.appendChild(item);

      // Asociar eventos de reacción
      const likeBtn    = item.querySelector('.btn-like');
      const dislikeBtn = item.querySelector('.btn-dislike');
      likeBtn.onclick    = () => reaccionar(c.mongoId, 'like',    item);
      dislikeBtn.onclick = () => reaccionar(c.mongoId, 'dislike', item);
    });
  } catch (err) {
    console.error('Error al cargar comentarios:', err);
    listEl.innerHTML = '<p style="color:red;">Error al cargar comentarios.</p>';
  }
}

// 5) Configurar envío de comentario
function configurarEnvioComentario() {
  document.getElementById('form-comment')
    .addEventListener('submit', e => {
      e.preventDefault();
      enviarComentario();
    });
}

// 6) Enviar nuevo comentario
async function enviarComentario() {
  const libroID = getQueryParam('libroID');
  const text    = document.getElementById('comment-text').value.trim();
  const rating  = Number(document.getElementById('comment-rating').value);

  if (!text) {
    alert('Escribe un comentario.');
    return;
  }

  try {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch(`${API_BASE}/comments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ bookId: libroID, rating, text })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `Status ${res.status}`);
    }
    document.getElementById('form-comment').reset();
    cargarComentarios();
  } catch (err) {
    console.error('No se pudo enviar comentario:', err);
    alert('No se pudo enviar comentario:\n' + err.message);
  }
}

// 7) Reaccionar a un comentario
async function reaccionar(commentId, tipo, itemEl) {
  try {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch(`${API_BASE}/reactions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        targetType: 'comment',
        targetId:   commentId,
        reaction:   tipo
      })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);

    if (tipo === 'like') {
      const span = itemEl.querySelector('.btn-like span');
      span.textContent = String(Number(span.textContent) + 1);
    }
  } catch (err) {
    console.error('Error al reaccionar:', err);
    alert('No se pudo enviar tu reacción.');
  }
}
