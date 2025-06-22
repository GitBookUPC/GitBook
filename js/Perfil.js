// public/js/PerfilDashboard.js
(async function(){
  const token = localStorage.getItem('token');
  if (!token) return location.href = 'Login.html?redirect=Perfil.html';
  const headers = { 'Authorization':'Bearer '+token };

  // Elementos
  const avatarInput = document.getElementById('avatar-input');
  const bannerInput = document.getElementById('banner-input');
  const avatarImg   = document.getElementById('avatar-img');
  const bannerImg   = document.getElementById('banner-img');
  const nameH2      = document.getElementById('user-name');
  const aliasP      = document.getElementById('user-alias');

  const mPub        = document.getElementById('m-publicaciones');
  const mComp       = document.getElementById('m-compras');
  const mRes        = document.getElementById('m-reseñas');
  const mFav        = document.getElementById('m-favoritos');

  const tabs        = document.querySelectorAll('.tabs button');
  const sections    = document.querySelectorAll('.tab-content');

  // 1) Cargar perfil básico
  let user;
  try {
    const res = await fetch(`${API_BASE}/usuarios/me`, { headers });
    if (!res.ok) throw new Error();
    user = await res.json();
    avatarImg.src = user.AvatarURL;
    bannerImg.src = user.BannerURL;
    nameH2.textContent = user.NombreUsuario;
    aliasP.textContent = '@'+user.NombreUsuario.toLowerCase().replace(/\s+/g,'_');
  } catch {
    console.error('No se pudo cargar perfil');
  }

  // 2) Cargar métricas
  try {
    const [ r1, r2, r3 ] = await Promise.all([
      fetch(`${API_BASE}/api/comunidad/posts/mios`, { headers }), // adapta ruta
      fetch(`${API_BASE}/api/pedidos`, { headers }),
      fetch(`${API_BASE}/api/reseñas/mias`, { headers })         // adapta ruta
    ]);
    const [ posts, pedidos, resenas ] = await Promise.all(r1.json(), r2.json(), r3.json());
    mPub.textContent  = Array.isArray(posts)? posts.length : 0;
    mComp.textContent = Array.isArray(pedidos)? pedidos.length : 0;
    mRes.textContent  = Array.isArray(resenas)? resenas.length : 0;
    mFav.textContent  = '–'; // si tienes favoritos, llénalo aquí
  } catch(e){
    console.warn('Error cargando métricas', e);
  }

  // 3) Manejar pestañas
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      sections.forEach(s=>s.hidden = true);
      document.getElementById('tab-'+btn.dataset.tab).hidden = false;
    });
  });

  // 4) Configuración → actualizar perfil
  document.getElementById('perfil-config-form').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('NombreUsuario', document.getElementById('cfg-nombre').value);
    fd.append('Email', document.getElementById('cfg-email').value);
    if (avatarInput.files[0]) fd.append('avatar', avatarInput.files[0]);
    if (bannerInput.files[0]) fd.append('banner', bannerInput.files[0]);

    const cfgMsg = document.getElementById('cfg-message');
    cfgMsg.textContent = '';
    try {
      const res = await fetch(`${API_BASE}/usuarios/me`, {
        method:'PUT',
        headers,
        body: fd
      });
      if (!res.ok) throw new Error('Error actualizando');
      cfgMsg.textContent = '¡Perfil actualizado!';
      cfgMsg.className = 'message success';
      // refrescar avatar/banner
      const data = await res.json();
      // (tu PUT no devuelve URLs, así que recarga todo perfil)
      location.reload();
    } catch(err){
      cfgMsg.textContent = err.message;
      cfgMsg.className = 'message error';
    }
  });
})();
