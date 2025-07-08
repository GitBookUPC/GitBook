// public/js/Comunidad.js

const API       = API_BASE;
const token     = () => localStorage.getItem('token');
const formPost  = document.getElementById('form-new-post');
const txtPost   = document.getElementById('post-text');
const imgPost   = document.getElementById('post-image');
const prevCont  = document.getElementById('preview-container');
const prevImg   = document.getElementById('preview-img');
const btnClear  = document.getElementById('btn-clear-preview');
const btnSubmit = formPost.querySelector('.btn-submit');
const feed      = document.getElementById('posts-feed');

let posts = [];

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  formPost.addEventListener('submit', onPostSubmit);
  txtPost.addEventListener('input', validatePostForm);
  imgPost.addEventListener('change', onPostImage);
  btnClear.addEventListener('click', clearPreview);

  // delegamos clicks y submits en el feed:
  feed.addEventListener('click', onFeedClick);
  feed.addEventListener('submit', onCommentSubmit);

  validatePostForm();
  loadFeed();
});

// ─── Helpers Formulario ───────────────────────────────────────────────────────
function validatePostForm(){
  btnSubmit.disabled = !txtPost.value.trim() && !imgPost.files.length;
}

function onPostImage(){
  const f = imgPost.files[0];
  if (!f || !f.type.startsWith('image/')) {
    return clearPreview();
  }
  prevImg.src = URL.createObjectURL(f);
  prevCont.hidden = false;
  validatePostForm();
}

function clearPreview(){
  prevCont.hidden = true;
  imgPost.value = '';
  prevImg.src = '';
  validatePostForm();
}

// ─── 1) Cargar Feed y render ─────────────────────────────────────────────────
async function loadFeed(){
  feed.innerHTML = `<p class="loading">Cargando publicaciones…</p>`;
  try {
    const res = await fetch(`${API}/comunidad`, {
      headers: { 'Authorization':'Bearer '+token() }
    });
    if (!res.ok) throw new Error();
    posts = await res.json();
    feed.innerHTML = posts.map(renderPost).join('');
    posts.forEach(p => loadComments(p._id));
  } catch {
    feed.innerHTML = `<p class="loading">Error cargando publicaciones.</p>`;
  }
}

// ─── 2) Render Post ───────────────────────────────────────────────────────────
function renderPost(p){
  const fecha = new Date(p.creado).toLocaleString();
  return `
  <div class="post" data-id="${p._id}">
    <div class="header">
      <img class="avatar" src="${p.avatarUrl||'/images/default-avatar.png'}"
           onerror="this.src='/images/default-avatar.png'"/>
      <div class="info">
        <div class="author">${escapeHTML(p.autorNombre)}</div>
        <div class="date">${fecha}</div>
      </div>
    </div>
    <div class="content">
      <p>${escapeHTML(p.texto)}</p>
      ${p.imagenUrl?`<img class="post-img" src="${p.imagenUrl}">`:``}
    </div>
    <div class="actions">
      <button data-tipo="like"    class="${p.liked  ?'active':''}">
        <i class="fas fa-thumbs-up"></i><span>${p.likes}</span>
      </button>
      <button data-tipo="dislike" class="${p.disliked?'active':''}">
        <i class="fas fa-thumbs-down"></i><span>${p.dislikes}</span>
      </button>
      <button data-tipo="love"    class="${p.loved  ?'active':''}">
        <i class="fas fa-heart"></i><span>${p.loves}</span>
      </button>
      <button data-tipo="share">
        <i class="fas fa-share-alt"></i>
      </button>
    </div>
    <div id="comentarios-${p._id}" class="comentarios-list"></div>
    <form class="form-comentario" data-id="${p._id}">
      <input type="text" name="texto" placeholder="Escribe un comentario…" required>
      <button type="submit">Comentar</button>
    </form>
  </div>`;
}

// ─── 3) Enviar nuevo Post ─────────────────────────────────────────────────────
async function onPostSubmit(e){
  e.preventDefault();
  const texto = txtPost.value.trim();
  if (!texto && !imgPost.files.length) return;
  btnSubmit.disabled = true;
  const fd = new FormData();
  fd.append('texto', texto);
  if (imgPost.files[0]) fd.append('file', imgPost.files[0]);
  try {
    const res = await fetch(`${API}/comunidad`, {
      method:'POST',
      headers:{ 'Authorization':'Bearer '+token() },
      body: fd
    });
    if (!res.ok) throw new Error();
    formPost.reset();
    clearPreview();
    await loadFeed();
  } catch {
    alert('❌ Error al publicar');
  } finally {
    btnSubmit.disabled = false;
  }
}

// ─── 4) Delegación (clicks: reacciones + share) ──────────────────────────────
async function onFeedClick(e){
  // — Compartir —
  const btnShare = e.target.closest('button[data-tipo="share"]');
  if (btnShare){
    const postEl = btnShare.closest('.post');
    const url = `${location.origin}${location.pathname}#${postEl.dataset.id}`;
    await navigator.clipboard.writeText(url);
    return alert('🔗 Enlace copiado');
  }

  // — Reacción —
  const btnR = e.target.closest('button[data-tipo="like"],button[data-tipo="dislike"],button[data-tipo="love"]');
  if (btnR){
    const tipo   = btnR.dataset.tipo;
    const postEl = btnR.closest('.post');
    const pid    = postEl.dataset.id;
    try {
      await fetch(`${API}/comunidad/${pid}/react`, {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization':'Bearer '+token()
        },
        body: JSON.stringify({ tipo })
      });
      // — actualizo en el DOM sin recargar todo —
      ['like','dislike','love'].forEach(t => {
        const b  = postEl.querySelector(`button[data-tipo="${t}"]`);
        const sp = b.querySelector('span');
        if (b === btnR) {
          // si NO estaba activo, lo activo y sumo
          if (!b.classList.contains('active')) {
            b.classList.add('active');
            sp.textContent = +sp.textContent + 1;
          }
        } else {
          // si otro estaba activo, lo desactivo y resto
          if (b.classList.contains('active')) {
            b.classList.remove('active');
            sp.textContent = +sp.textContent - 1;
          }
        }
      });
    } catch {
      alert('❌ Error al reaccionar');
    }
    return;
  }
}

// ─── 5) Delegación (submit de comentarios) ────────────────────────────────────
async function onCommentSubmit(e){
  if (!e.target.matches('.form-comentario')) return;
  e.preventDefault();
  const formC = e.target;
  const pid   = formC.dataset.id;
  const inp   = formC.querySelector('input[name="texto"]');
  const txt   = inp.value.trim();
  if (!txt) return;
  try {
    const res = await fetch(`${API}/comunidad/${pid}/comentarios`, {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':'Bearer '+token()
      },
      body: JSON.stringify({ texto: txt })
    });
    if (!res.ok) throw new Error();
    inp.value = '';
    await loadComments(pid);
  } catch {
    alert('❌ Error al comentar');
  }
}

// ─── 6) Cargar comentarios de un post ─────────────────────────────────────────
async function loadComments(postId){
  try {
    const res = await fetch(`${API}/comunidad/${postId}/comentarios`, {
      headers: { 'Authorization':'Bearer '+token() }
    });
    if (!res.ok) return;
    const arr = await res.json();
    const container = document.getElementById(`comentarios-${postId}`);
    container.innerHTML = arr.map(renderComment).join('');
  } catch {/* silent */}
}
function renderComment(c){
  const fecha = new Date(c.fecha).toLocaleString();
  const av    = c.avatarUrl||'/images/default-avatar.png';
  return `
    <div class="comentario-item">
      <img class="avatar" src="${av}" onerror="this.src='/images/default-avatar.png'"/>
      <div class="info-comentario">
        <strong>${escapeHTML(c.usuario)}</strong>
        <span class="comentario-fecha">${fecha}</span>
        <p>${escapeHTML(c.texto)}</p>
      </div>
    </div>`;
}

// ─── Util ────────────────────────────────────────────────────────────────────
function escapeHTML(str=''){
  return str.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
