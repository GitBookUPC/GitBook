// frontend/js/Index.js

document.addEventListener('DOMContentLoaded', async () => {
  const sidebar   = document.querySelector(".sidebar");
  const closeBtn  = document.querySelector("#btn");
  const frame     = document.getElementById("content-frame");

  // 1) Toggle sidebar
  closeBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    menuBtnChange();
  });

  function menuBtnChange() {
    if (sidebar.classList.contains("open")) {
      closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
    } else {
      closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
    }
  }

  // 2) Navegación normal
  document.getElementById('inicio').addEventListener('click', () => {
    frame.src = 'views/Inicio.html';
  });
  document.getElementById('categorias').addEventListener('click', () => {
    frame.src = 'views/Categorias.html';
  });
  document.getElementById('busqueda').addEventListener('click', () => {
    frame.src = 'views/Busqueda.html';
  });
  document.getElementById('carrito').addEventListener('click', () => {
    frame.src = 'views/Carrito.html';
  });
  document.getElementById('login').addEventListener('click', () => {
    frame.src = 'views/Login.html';
  });

  // 3) Admin: oculto por defecto en HTML (style="display:none;")
  const adminLi   = document.getElementById('admin-link');
  const adminBtn  = document.getElementById('admin');
  adminLi.style.display = 'none';

  // 4) Carga inicial
  frame.src = 'views/Inicio.html';

  // 5) Chequeo de sesión y rol real desde la API
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!res.ok) throw new Error();

      const user = await res.json();
      if (user.rol === 1) {
        // Mostrar enlace Admin y asignar su click
        adminLi.style.display = 'block';
        adminBtn.addEventListener('click', () => {
          frame.src = 'views/Admin.html';
        });
      }
    } catch {
      // Token inválido: limpiar y recargar para resetear UI
      localStorage.removeItem('token');
      localStorage.removeItem('rol');
      window.location.reload();
    }
  }
  const logoutIcon = document.getElementById('log_out');
logoutIcon.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('rol');
  // Redirige al login dentro del iframe
  document.getElementById('content-frame').src = 'views/Login.html';
  // O si cargas la página completa:
  // window.location.href = 'views/Login.html';
})});