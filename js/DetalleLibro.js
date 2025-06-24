// js/DetalleLibro.js

let isLoading = false;
let currentBook = null;

// 1) Leer parámetros
function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

// 2) Loading overlay
function toggleLoading(show) {
  document.getElementById('loading-overlay')
    .classList.toggle('active', !!show);
  isLoading = !!show;
}

// 3) Toast
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type==='success' ? 'fa-check-circle'
             : type==='error'   ? 'fa-exclamation-circle'
             : 'fa-info-circle';
  toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${message}</span>
    <button class="toast-close">&times;</button>
  `;
  container.appendChild(toast);
  setTimeout(()=> toast.classList.add('show'), 50);
  setTimeout(()=>{
    toast.classList.remove('show');
    setTimeout(()=> container.removeChild(toast), 300);
  }, 4000);
  toast.querySelector('.toast-close').onclick = () => {
    toast.classList.remove('show');
    setTimeout(()=> container.removeChild(toast), 300);
  };
}

// 4) Init
document.addEventListener('DOMContentLoaded', async()=>{
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

// 5) Botones generales
function configureGeneralEvents() {
  document.getElementById('btn-volver').onclick = ()=> window.history.back();
  setupImageModal();

  // contador de chars
  const textarea = document.getElementById('comment-text');
  const charCount = document.getElementById('char-count');
  textarea.oninput = ()=> {
    const c = textarea.value.length;
    charCount.textContent = c;
    charCount.style.color = c>450 ? '#e74c3c' : '';
  };

  // favoritos / compartir (sin cambio)
  document.querySelector('.btn-favorito').onclick = ()=>{
    const icon = document.querySelector('.btn-favorito i');
    icon.classList.toggle('far');
    icon.classList.toggle('fas');
    showToast(icon.classList.contains('fas')
      ? '❤️ Agregado a favoritos'
      : '💔 Removido de favoritos'
    ,'info');
  };
  document.querySelector('.btn-compartir').onclick = ()=>{
    if(navigator.share && currentBook){
      navigator.share({
        title: currentBook.Titulo,
        text: `Echa un vistazo a este libro: ${currentBook.Titulo}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('📋 Enlace copiado al portapapeles','success');
    }
  };
}

// 6) Modal imagen
function setupImageModal(){
  const modal = document.getElementById('image-modal');
  const imgModal = document.getElementById('modal-image');
  document.addEventListener('click', e=>{
    if(e.target.classList.contains('btn-zoom')){
      imgModal.src = document.getElementById('img-portada').src;
      modal.style.display='block';
    }
  });
  modal.querySelector('.close').onclick = ()=> modal.style.display='none';
  window.onclick = e=>{ if(e.target===modal) modal.style.display='none'; };
}

// 7) Detalle de libro
async function loadBookDetail(){
  const libroID = getQueryParam('libroID');
  if(!libroID){
    showToast('❌ No se especificó libro','error');
    return setTimeout(()=>window.location.href='Categorias.html',2000);
  }
  try {
    const headers = {};
    const token = localStorage.getItem('token');
    if(token) headers['Authorization']='Bearer '+token;
    const res = await fetch(`${API_BASE}/libros/${libroID}`, {headers});
    if(!res.ok) throw new Error();
    const b = await res.json();
    currentBook = b;
    fillBookDetail(b);
    configureAddToCart(libroID);
  } catch {
    showToast('❌ No se pudo cargar detalle','error');
    setTimeout(()=>window.location.href='Categorias.html',2000);
  }
}

function fillBookDetail(libro){
  document.getElementById('img-portada').onload = function(){
    this.classList.add('loaded');
  };
  document.getElementById('img-portada').src = libro.UrlImagen;
  [
    ['titulo-libro', libro.Titulo],
    ['breadcrumb-categoria', libro.Categoria.NombreCategoria],
    ['autores-libro', 'Autor(es): '+ libro.Autores.map(a=>a.NombreAutor).join(', ')],
    ['descripcion-libro', libro.Descripcion],
    ['precio-libro', libro.Precio.toFixed(2)]
  ].forEach(([id,txt],i)=>{
    setTimeout(()=>{
      const el=document.getElementById(id);
      el.textContent=txt;
      el.classList.add('fade-in');
    }, i*150);
  });
}

// 8) Añadir al carrito (igual que antes)
function configureAddToCart(libroID){ /* ... tal cual ... */ }

// 9) Cargar comentarios
async function loadComments(){
  const libroID = getQueryParam('libroID');
  const listEl = document.getElementById('comments-list');
  listEl.innerHTML = '<div class="loading-comments"><i class="fas fa-spinner fa-spin"></i> Cargando comentarios...</div>';

  try {
    const headers = {};
    const token = localStorage.getItem('token');
    if(token) headers['Authorization']='Bearer '+token;

    const res = await fetch(`${API_BASE}/comments/${libroID}`, {headers});
    if(!res.ok) throw new Error();
    const comments = await res.json();
    document.getElementById('total-comments').textContent =
      `${comments.length} comentario${comments.length!==1?'s':''}`;

    if(!comments.length){
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
  } catch {
    listEl.innerHTML = `
      <div class="error-comments">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Inicie sesión para ver los comentarios <button onclick="loadComments()">Reintentar</button></p>
      </div>`;
  }
}

// 10) Render & replies
function renderComments(comments){
  const listEl = document.getElementById('comments-list');
  listEl.innerHTML = '';
  comments.forEach(c=>{
    listEl.appendChild(renderCommentItem(c));
  });
}

function renderCommentItem(c){
  // contenedor principal
  const item = document.createElement('div');
  item.className = 'comment-item';
  // header
  const header = document.createElement('div');
  header.className = 'comment-header';
  header.innerHTML = `
    <div class="user-info">
      <i class="fas fa-user user-avatar"></i>
      <div>
        <span class="username">${c.usuario}</span>
        <span class="comment-date">${timeSince(new Date(c.createdAt))}</span>
      </div>
    </div>
    <div class="comment-rating">
      <span class="stars">${'★'.repeat(c.rating)+'☆'.repeat(5-c.rating)}</span>
      <span>${c.rating}/5</span>
    </div>`;
  item.appendChild(header);

  // texto
  const p = document.createElement('p');
  p.className = 'comment-text';
  p.textContent = c.text;
  item.appendChild(p);

  // acciones
  const actions = document.createElement('div');
  actions.className = 'comment-actions';
  actions.innerHTML = `
    <button class="btn-reaction btn-like"><i class="fas fa-thumbs-up"></i> ${c.likesCount}</button>
    <button class="btn-reaction btn-dislike"><i class="fas fa-thumbs-down"></i> ${c.dislikesCount}</button>
    <button class="btn-reaction btn-reply"><i class="fas fa-reply"></i> Responder</button>
  `;
  item.appendChild(actions);

  // listeners de reacción
  actions.querySelector('.btn-like').onclick    = ()=> react(c.id,'like', item);
  actions.querySelector('.btn-dislike').onclick = ()=> react(c.id,'dislike', item);

  // formulario de reply (oculto)
  const replyForm = document.createElement('form');
  replyForm.className = 'reply-form hidden';
  replyForm.innerHTML = `
    <textarea placeholder="Tu respuesta..." required maxlength="500"></textarea>
    <div>
      <button type="submit">Enviar</button>
      <button type="button" class="btn-cancel">Cancelar</button>
    </div>
  `;
  item.appendChild(replyForm);

  // toggle del form
  actions.querySelector('.btn-reply').onclick = ()=>{
    replyForm.classList.toggle('hidden');
  };
  replyForm.querySelector('.btn-cancel').onclick = e=>{
    e.preventDefault();
    replyForm.classList.add('hidden');
  };
  replyForm.onsubmit = async e=>{
    e.preventDefault();
    const txt = replyForm.querySelector('textarea').value.trim();
    if(!txt) return showToast('❌ Escribe tu respuesta','error');
    try {
      const libroID = getQueryParam('libroID');
      const token = localStorage.getItem('token');
      const headers = {'Content-Type':'application/json'};
      if(token) headers['Authorization']='Bearer '+token;
      const res = await fetch(`${API_BASE}/comments`, {
        method:'POST', headers,
        body: JSON.stringify({
          bookId: libroID,
          rating: 0,
          text: txt,
          parentCommentId: c.id
        })
      });
      if(!res.ok) throw new Error();
      showToast('✅ Respuesta publicada','success');
      await loadComments();
    } catch {
      showToast('❌ No se pudo enviar','error');
    }
  };

  // contenedor para las replies
  if(c.replies && c.replies.length){
    const rc = document.createElement('div');
    rc.className = 'replies-container';
    c.replies.forEach(r=> rc.appendChild(renderCommentItem(r)));
    item.appendChild(rc);
  }

  return item;
}

// 11) timeSince
function timeSince(date){
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff/60000),
        h = Math.floor(m/60),
        d = Math.floor(h/24);
  if(m<1) return 'Ahora mismo';
  if(m<60) return `Hace ${m}m`;
  if(h<24) return `Hace ${h}h`;
  if(d<7) return `Hace ${d}d`;
  return date.toLocaleDateString();
}

// 12) filtros
function setupCommentFilters(comments){
  document.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.onclick=()=>{
      document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      let sorted = [...comments];
      if(btn.dataset.filter==='recent'){
        sorted.sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
      } else if(btn.dataset.filter==='helpful'){
        sorted.sort((a,b)=> (b.likesCount||0)-(a.likesCount||0));
      }
      renderComments(sorted);
    };
  });
}

// 13) envío nuevo comentario
function configureCommentForm(){
  document.getElementById('form-comment').onsubmit = async e=>{
    e.preventDefault();
    const libroID = getQueryParam('libroID');
    const text = document.getElementById('comment-text').value.trim();
    const rating = +document.getElementById('comment-rating').value;
    if(!text) return showToast('❌ Escribe un comentario','error');
    const btn = document.getElementById('submit-comment');
    btn.disabled = true;
    try {
      const headers = {'Content-Type':'application/json'};
      const token = localStorage.getItem('token');
      if(token) headers['Authorization']='Bearer '+token;
      const res = await fetch(`${API_BASE}/comments`, {
        method:'POST', headers,
        body: JSON.stringify({ bookId: libroID, rating, text })
      });
      if(!res.ok) throw new Error();
      showToast('✅ Comentario publicado','success');
      document.getElementById('form-comment').reset();
      document.getElementById('char-count').textContent='0';
      await loadComments();
    } catch {
      showToast('❌ No se pudo enviar','error');
    } finally {
      btn.disabled = false;
    }
  };
}

// 14) react
async function react(commentId, tipo, itemEl){
  const btn = itemEl.querySelector(`.btn-${tipo}`);
  btn.style.transform='scale(1.2)';
  setTimeout(()=>btn.style.transform='scale(1)',200);
  try {
    const headers = {'Content-Type':'application/json'};
    const token = localStorage.getItem('token');
    if(token) headers['Authorization']='Bearer '+token;
    const res = await fetch(`${API_BASE}/comments/${commentId}/${tipo}`, {
      method:'POST', headers
    });
    if(!res.ok) throw new Error();
    await loadComments();
  } catch {
    showToast('❌ Error al reaccionar','error');
  }
}
