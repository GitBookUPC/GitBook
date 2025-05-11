let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");

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

document.getElementById('inicio').addEventListener('click', function () {
  document.getElementById('content-frame').src = 'views/Inicio.html';
});

document.getElementById('busqueda').addEventListener('click', function () {
  document.getElementById('content-frame').src = 'views/Busqueda.html';
});

document.getElementById('carrito').addEventListener('click', function () {
  document.getElementById('content-frame').src = 'views/Carrito.html';
});

window.onload = function () {
  document.getElementById("content-frame").src = "views/Inicio.html";
};
