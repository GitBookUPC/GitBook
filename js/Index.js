// frontend/js/Index.js

document.addEventListener('DOMContentLoaded', async () => {
  const sidebar    = document.querySelector(".sidebar");
  const closeBtn   = document.querySelector("#btn");
  const frame      = document.getElementById("content-frame");

  // — Elementos del sidebar —
  const inicioLi      = document.getElementById('inicio').closest('li');
  const categoriasLi  = document.getElementById('categorias').closest('li');
  const carritoLi     = document.getElementById('carrito').closest('li');
  const comunidadLi   = document.getElementById('comunidad').closest('li');
  const accountLi     = document.getElementById('account');
  const accountAnchor = document.getElementById('account-link');
  const adminLi       = document.getElementById('admin-link');
  const adminBtn      = document.getElementById('admin');
  const profileLi     = document.querySelector('.profile');
  const logoutIcon    = document.getElementById('log_out');

  // 1) Toggle sidebar
  closeBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    if (sidebar.classList.contains("open")) {
      closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
    } else {
      closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
    }
  });

  // 2) Navegación básica
  inicioLi     .addEventListener('click', e => { e.preventDefault(); frame.src = 'views/Inicio.html'; });
  categoriasLi .addEventListener('click', e => { e.preventDefault(); frame.src = 'views/Categorias.html'; });
  carritoLi    .addEventListener('click', e => { e.preventDefault(); frame.src = 'views/Carrito.html'; });

  // 2.1) Comunidad (requiere login)
  comunidadLi.addEventListener('click', e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    frame.src = token
      ? 'views/Comunidad.html'
      : 'views/Login.html?redirect=Comunidad.html';
  });

  // 2.2) AccountAnchor (login o perfil según estado)
  accountAnchor.addEventListener('click', e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    frame.src = token
      ? 'views/Perfil.html'
      : 'views/Login.html';
  });

  // 3) Admin (oculto por defecto)
  adminLi.style.display = 'none';

  // 4) Perfil (bloque inferior), oculto hasta login
  profileLi.style.display = 'none';
  profileLi.addEventListener('click', e => {
    e.preventDefault();
    frame.src = 'views/Perfil.html';
  });

  // 5) Vista inicial
  frame.src = 'views/Inicio.html';

  // 6) Chequear token y poblar UI
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const res  = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!res.ok) throw new Error();

      const user = await res.json();

      // — Ocultar “Iniciar sesión” y mostrar “Mi cuenta” —
      accountLi.querySelector('i')
        .className = 'bi bi-person-circle';
      accountLi.querySelector('.links_name')
        .textContent = 'Mi cuenta';
      accountLi.querySelector('.tooltip')
        .textContent = 'Mi perfil';

      // — Mostrar bloque perfil con nombre/rol —
      accountLi.style.display = 'block';  // siempre visible
      profileLi.style.display = 'flex';
      profileLi.querySelector('.name')
        .textContent = user.nombreUsuario || user.email;
      profileLi.querySelector('.job')
        .textContent = user.rol === 1 ? 'Administrador' : 'Cliente';

      // — Si es admin, mostrar sección Admin —
      if (user.rol === 1) {
        adminLi.style.display = 'block';
        adminBtn.addEventListener('click', e => {
          e.preventDefault();
          frame.src = 'views/Admin.html';
        });
      }
    } catch {
      // token inválido → limpio y recargo
      localStorage.removeItem('token');
      window.location.reload();
    }
  } else {
    // sin token → “Iniciar sesión” visible, perfil/admin ocultos
    accountLi.querySelector('i')
      .className = 'bi bi-person-fill';
    accountLi.querySelector('.links_name')
      .textContent = 'Iniciar sesión';
    accountLi.querySelector('.tooltip')
      .textContent = 'Iniciar sesión';

    profileLi.style.display = 'none';
    adminLi.style.display   = 'none';
  }

  // 7) Cerrar sesión
  logoutIcon.addEventListener('click', e => {
    e.preventDefault();
    localStorage.removeItem('token');

    // restaurar UI inicial
    accountLi.querySelector('i')
      .className = 'bi bi-person-fill';
    accountLi.querySelector('.links_name')
      .textContent = 'Iniciar sesión';
    accountLi.querySelector('.tooltip')
      .textContent = 'Iniciar sesión';

    profileLi.style.display = 'none';
    adminLi.style.display   = 'none';
    frame.src = 'views/Login.html';
  });
});
