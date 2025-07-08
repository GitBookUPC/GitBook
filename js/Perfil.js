// public/js/Perfil.js

// ─── 0) Helpers ────────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('token');
}
async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      ...(opts.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

// ─── 1) Elementos del DOM ─────────────────────────────────────────────────
const bannerImg       = document.getElementById('banner-img');
const bannerInput     = document.getElementById('banner-input');
const avatarImg       = document.getElementById('avatar-img');
const avatarInput     = document.getElementById('avatar-input');
const userNameEl      = document.getElementById('user-name');
const userAliasEl     = document.getElementById('user-alias');
const mCompras        = document.getElementById('m-compras');
const mResenas        = document.getElementById('m-reseñas');
const mFavoritos      = document.getElementById('m-favoritos');
const comprasListEl   = document.getElementById('compras-list');
const resenasListEl   = document.getElementById('resenas-list');
const favoritosListEl = document.getElementById('favoritos-list');

// ─── 2) Inicialización ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  setupTabs();
  await loadUserInfo();
  await loadMetrics();
  await loadCompras();
  loadResenas();
  loadFavoritos();
});

// ─── 3) Perfil básico: nombre, alias, banner y avatar ──────────────────────
async function loadUserInfo() {
  try {
    const me = await fetchJSON(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': 'Bearer ' + getToken() }
    });

    userNameEl.textContent  = me.nombre;
    userAliasEl.textContent = '@' + me.nombre;

    bannerImg.src = me.bannerUrl || '/images/default-banner.jpg';
    avatarImg.src = me.avatarUrl || '/images/default-avatar.png';

    setupImageUpload(bannerInput, bannerImg, 'banner');
    setupImageUpload(avatarInput, avatarImg, 'avatar');
  } catch (err) {
    console.error('Error cargando perfil:', err);
  }
}

// ─── 4) Subida de banner/avatar ────────────────────────────────────────────
function setupImageUpload(inputEl, imgEl, type) {
  inputEl.onchange = async () => {
    const file = inputEl.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);

    const res = await fetch(`${API_BASE}/auth/${type}`, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + getToken() },
      body: form
    });
    const { imageUrl } = await res.json();
    imgEl.src = imageUrl;
  };
}

// ─── 5) Métricas globales ─────────────────────────────────────────────────
async function loadMetrics() {
  try {
    const [pedidos, resenas, favs] = await Promise.all([
      fetchJSON(`${API_BASE}/pedidos`,   { headers:{ 'Authorization':'Bearer '+getToken() } }),
      fetchJSON(`${API_BASE}/reviews`,   { headers:{ 'Authorization':'Bearer '+getToken() } }),
      fetchJSON(`${API_BASE}/favorites`, { headers:{ 'Authorization':'Bearer '+getToken() } })
    ]);
    mCompras.textContent   = pedidos.length;
    mResenas.textContent   = resenas.length;
    mFavoritos.textContent = favs.length;
  } catch (err) {
    console.error('Error cargando métricas:', err);
  }
}

// ─── 6) Pestañas ───────────────────────────────────────────────────────────
function setupTabs() {
  document.querySelectorAll('.tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(sec => sec.hidden = true);
      document.getElementById('tab-' + tab).hidden = false;
    });
  });
}

// ─── 7) Compras ─────────────────────────────────────────────────────────────
async function loadCompras() {
  comprasListEl.textContent = 'Cargando compras…';
  try {
    const pedidos = await fetchJSON(`${API_BASE}/pedidos`, {
      headers: { 'Authorization':'Bearer '+getToken() }
    });
    mCompras.textContent = pedidos.length;
    if (!pedidos.length) {
      comprasListEl.innerHTML = '<p>No tienes compras aún.</p>';
      return;
    }
    comprasListEl.innerHTML = pedidos.map(p => `
      <div class="compra-item">
        <a href="${API_BASE.replace(/\/api\/?$/,'')}/api/pedidos/${p.pedidoID}/factura.pdf"
           target="_blank">
          Pedido #${p.pedidoID}
        </a>
        <span>${new Date(p.fecha).toLocaleDateString()}</span>
        <strong>S/ ${p.total.toFixed(2)}</strong>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error al cargar compras:', err);
    comprasListEl.textContent = 'Error al cargar compras';
  }
}

// ─── 8) Reseñas ────────────────────────────────────────────────────────────
async function loadResenas() {
  resenasListEl.textContent = 'Cargando reseñas…';
  try {
    const resenas = await fetchJSON(`${API_BASE}/reviews`, {
      headers:{ 'Authorization':'Bearer '+getToken() }
    });
    if (!resenas.length) {
      resenasListEl.innerHTML = '<p>No has escrito reseñas.</p>';
      return;
    }
    resenasListEl.innerHTML = resenas.map(r =>
      `<div class="reseña-item">
         <strong>${r.libroTitulo}</strong> — ${r.calificacion}/5<br>
         <em>${r.texto}</em>
       </div>`
    ).join('');
  } catch (err) {
    console.error('Error cargando reseñas:', err);
    resenasListEl.textContent = 'Error al cargar reseñas';
  }
}

// ─── 9) Favoritos ──────────────────────────────────────────────────────────
async function loadFavoritos() {
  favoritosListEl.innerHTML = '<p>Cargando favoritos…</p>';
  try {
    const favs = await fetchJSON(`${API_BASE}/favorites`, {
      headers:{ 'Authorization':'Bearer '+getToken() }
    });
    mFavoritos.textContent = favs.length;
    if (!favs.length) {
      favoritosListEl.innerHTML = '<p>No tienes favoritos aún.</p>';
      return;
    }
    favoritosListEl.innerHTML = favs.map(f => `
      <a href="DetalleLibro.html?libroID=${f.libroId}" class="fav-item">
        ${f.libroTitulo}
      </a>
    `).join('');
  } catch (err) {
    console.error('Error al cargar favoritos:', err);
    favoritosListEl.innerHTML = '<p>Error al cargar favoritos</p>';
  }
}
