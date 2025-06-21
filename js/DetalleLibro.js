// js/DetalleLibro.js - Versión mejorada con modal y toast UX

// Variables globales
let isLoading = false;
let currentBook = null;

// 1) Leer parámetros de la URL
function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

// 2) Mostrar/ocultar overlay de carga
function toggleLoading(show) {
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.toggle('active', !!show);
  isLoading = !!show;
}

// 3) Toast de notificaciones
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success'
    ? 'fa-check-circle'
    : type === 'error'
      ? 'fa-exclamation-circle'
      : 'fa-info-circle';
  toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${message}</span>
    <button class="toast-close">&times;</button>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);
  // Auto-hide
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => container.removeChild(toast), 300);
  }, 4000);
  toast.querySelector('.toast-close').onclick = () => {
    toast.classList.remove('show');
    setTimeout(() => container.removeChild(toast), 300);
  };
}

// 4) Inicialización al cargar DOM
document.addEventListener('DOMContentLoaded', async () => {
  configureGeneralEvents();
  toggleLoading(true);
  try {
    await loadBookDetail();
    await loadComments();
    configureCommentForm();
  } finally {
    toggleLoading(false);
  }
});

// 5) Eventos generales: volver, modal imagen, contador
function configureGeneralEvents() {
  document.getElementById('btn-volver').onclick = () => window.history.back();
  setupImageModal();
  // Contador de chars en textarea
  const textarea = document.getElementById('comment-text');
  const charCount = document.getElementById('char-count');
  textarea.addEventListener('input', () => {
    const count = textarea.value.length;
    charCount.textContent = count;
    charCount.style.color = count > 450 ? '#e74c3c' : '';
  });
  // Favorito
  document.querySelector('.btn-favorito').onclick = () => {
    const icon = document.querySelector('.btn-favorito i');
    icon.classList.toggle('far');
    icon.classList.toggle('fas');
    const isFav = icon.classList.contains('fas');
    showToast(isFav ? '❤️ Agregado a favoritos' : '💔 Removido de favoritos', 'info');
  };
  // Compartir
  document.querySelector('.btn-compartir').onclick = () => {
    if (navigator.share && currentBook) {
      navigator.share({
        title: currentBook.Titulo,
        text: `Echa un vistazo a este libro: ${currentBook.Titulo}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('📋 Enlace copiado al portapapeles', 'success');
    }
  };
}

// 6) Modal de zoom de imagen
function setupImageModal() {
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-image');
  const closeBtn = modal.querySelector('.close');

  document.addEventListener('click', e => {
    if (e.target.classList.contains('btn-zoom')) {
      const img = document.getElementById('img-portada');
      modalImg.src = img.src;
      modal.style.display = 'block';
    }
  });
  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };
}

// 7) Cargar detalle de libro y llenar DOM
async function loadBookDetail() {
  const libroID = getQueryParam('libroID');
  if (!libroID) {
    showToast('❌ No se especificó ningún libro', 'error');
    setTimeout(() => window.location.href = 'Categorias.html', 2000);
    return;
  }
  try {
    const headers = {};
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch(`${API_BASE}/libros/${libroID}`, { headers });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const b = await res.json();
    currentBook = b;
    fillBookDetail(b);
    configureAddToCart(libroID);
  } catch (err) {
    console.error(err);
    showToast('❌ No se pudo cargar el detalle', 'error');
    setTimeout(() => window.location.href = 'Categorias.html', 2000);
  }
}

// 8) Escribir datos en el DOM
function fillBookDetail(libro) {
  document.getElementById('img-portada').onload = function() {
    this.classList.add('loaded');
  };
  document.getElementById('img-portada').src = libro.UrlImagen;
  const fields = [
    ['titulo-libro', libro.Titulo],
    ['breadcrumb-categoria', libro.Categoria.NombreCategoria],
    ['autores-libro', 'Autor(es): ' + libro.Autores.map(a=>a.NombreAutor).join(', ')],
    ['descripcion-libro', libro.Descripcion],
    ['precio-libro', libro.Precio.toFixed(2)]
  ];
  fields.forEach(([id, text], i) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      el.textContent = text;
      el.classList.add('fade-in');
    }, i * 150);
  });
}

// 9) Botón Añadir al carrito + modal opciones
function configureAddToCart(libroID) {
  const btn = document.getElementById('btn-agregar');
  const toastModal = document.getElementById('cart-toast');
  const goCart = document.getElementById('btn-go-cart');
  const contShop = document.getElementById('btn-continue');

  btn.onclick = async () => {
    if (btn.disabled) return;
    btn.disabled = true;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/carrito`, {
        method: 'POST',
        headers: {
          'Content-Type':'application/json',
          ...(token && { 'Authorization':'Bearer '+token })
        },
        body: JSON.stringify({ LibroID: +libroID, Cantidad: 1 })
      });
      if (!res.ok) throw new Error();
      // Mostrar modal con opciones
      toastModal.classList.remove('hidden');
    } catch {
      showToast('❌ Error al añadir al carrito', 'error');
    } finally {
      btn.disabled = false;
    }
  };

  goCart.onclick = () => window.location.href = 'Carrito.html';
  contShop.onclick = () => toastModal.classList.add('hidden');
}

// 10) Cargar comentarios
async function loadComments() {
  const libroID = getQueryParam('libroID');
  const listEl = document.getElementById('comments-list');
  listEl.innerHTML = '<div class="loading-comments"><i class="fas fa-spinner fa-spin"></i> Cargando comentarios...</div>';

  try {
    const headers = {};
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch(`${API_BASE}/comments/${libroID}`, { headers });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const comments = await res.json();
    document.getElementById('total-comments').textContent =
      `${comments.length} comentario${comments.length !== 1 ? 's' : ''}`;

    if (!comments.length) {
      listEl.innerHTML = `
        <div class="no-comments">
          <i class="fas fa-comments fa-3x"></i>
          <h3>Aún no hay comentarios</h3>
          <p>¡Sé el primero en compartir tu opinión!</p>
        </div>`;
    } else {
      renderComments(comments);
      setupCommentFilters(comments);
    }
  } catch (err) {
    console.error(err);
    listEl.innerHTML = `
      <div class="error-comments">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Error al cargar comentarios. <button onclick="loadComments()">Reintentar</button></p>
      </div>`;
  }
}

// 11) Renderizar comentarios
function renderComments(comments) {
  const listEl = document.getElementById('comments-list');
  listEl.innerHTML = '';
  comments.forEach((c,i) => {
    const item = document.createElement('div');
    item.className = 'comment-item';
    item.style.animationDelay = `${i * 0.1}s`;
    const stars = '★'.repeat(c.rating) + '☆'.repeat(5-c.rating);
    const timeAgo = timeSince(new Date(c.fecha));
    item.innerHTML = `
      <div class="comment-header">
        <div class="user-info">
          <i class="fas fa-user user-avatar"></i>
          <div>
            <span class="username">${c.usuario}</span>
            <span class="comment-date">${timeAgo}</span>
          </div>
        </div>
        <div class="comment-rating">
          <span class="stars">${stars}</span>
          <span>${c.rating}/5</span>
        </div>
      </div>
      <p class="comment-text">${c.text}</p>
      <div class="comment-actions">
        <button class="btn-reaction btn-like"><i class="fas fa-thumbs-up"></i> ${c.helpfulVotes||0}</button>
        <button class="btn-reaction btn-dislike"><i class="fas fa-thumbs-down"></i></button>
        <button class="btn-reaction btn-reply"><i class="fas fa-reply"></i> Responder</button>
      </div>`;
    listEl.appendChild(item);
    // Reacciones
    item.querySelector('.btn-like').onclick = () => react(c.mongoId, 'like', item);
    item.querySelector('.btn-dislike').onclick = () => react(c.mongoId, 'dislike', item);
  });
}

// 12) Tiempo transcurrido
function timeSince(date) {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff/60000), h=Math.floor(m/60), d=Math.floor(h/24);
  if (m<1) return 'Ahora mismo';
  if (m<60) return `Hace ${m}m`;
  if (h<24) return `Hace ${h}h`;
  if (d<7) return `Hace ${d}d`;
  return date.toLocaleDateString();
}

// 13) Filtros de comentarios
function setupCommentFilters(comments) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      let sorted = [...comments];
      if (btn.dataset.filter==='recent') {
        sorted.sort((a,b)=>new Date(b.fecha)-new Date(a.fecha));
      } else if (btn.dataset.filter==='helpful') {
        sorted.sort((a,b)=>(b.helpfulVotes||0)-(a.helpfulVotes||0));
      }
      renderComments(sorted);
    };
  });
}

// 14) Envío de comentario
function configureCommentForm() {
  document.getElementById('form-comment').onsubmit = async e => {
    e.preventDefault();
    await postComment();
  };
}

async function postComment() {
  const libroID = getQueryParam('libroID');
  const text = document.getElementById('comment-text').value.trim();
  const rating = +document.getElementById('comment-rating').value;
  const btn = document.getElementById('submit-comment');
  if (!text) return showToast('❌ Escribe un comentario', 'error');
  btn.disabled = true;
  try {
    const headers = {'Content-Type':'application/json'};
    const token = localStorage.getItem('token');
    if (token) headers['Authorization']='Bearer '+token;
    const res = await fetch(`${API_BASE}/comments`, {
      method:'POST', headers,
      body: JSON.stringify({ bookId: libroID, rating, text })
    });
    if (!res.ok) throw new Error();
    document.getElementById('form-comment').reset();
    document.getElementById('char-count').textContent='0';
    showToast('✅ Comentario publicado', 'success');
    await loadComments();
  } catch (err) {
    console.error(err);
    showToast('❌ No se pudo enviar', 'error');
  } finally {
    btn.disabled = false;
  }
}

// 15) Reaccionar a comentario
async function react(commentId, tipo, el) {
  const btn = el.querySelector(`.btn-${tipo}`);
  btn.style.transform = 'scale(1.2)';
  setTimeout(()=>btn.style.transform='scale(1)',200);
  try {
    const headers = {'Content-Type':'application/json'};
    const token = localStorage.getItem('token');
    if (token) headers['Authorization']='Bearer '+token;
    const res = await fetch(`${API_BASE}/reactions`, {
      method:'POST', headers,
      body: JSON.stringify({
        targetType:'comment',
        targetId:commentId,
        reaction:tipo
      })
    });
    if (!res.ok) throw new Error();
    if (tipo==='like') {
      const span = btn.querySelector('span');
      span.textContent = +span.textContent + 1;
    }
    showToast(tipo==='like'?'👍 Útil':'👎 No útil','info');
  } catch {
    showToast('❌ Error al reaccionar','error');
  }
}