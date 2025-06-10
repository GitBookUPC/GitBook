// js/Categorias.js

// 1) Carga todas las categorías desde la API
async function cargarCategorias() {
  try {
    console.log('🔍 Fetching:', `${API_BASE}/categorias`);
    const res = await fetch(`${API_BASE}/categorias`);
    if (!res.ok) throw new Error('Status ' + res.status);
    const categorias = await res.json();
    console.log('📂 Categorías:', categorias);
    renderizarCategorias(categorias);

    // Auto-selecciona la primera categoría
    if (categorias.length > 0) {
      seleccionarCategoria(categorias[0]);
    }
  } catch (err) {
    console.error('❌ Error cargando categorías:', err);
    document.getElementById('lista-categorias')
      .innerHTML = `<li style x|="color:red;">Error al cargar categorías</li>`;
  }
}

// 2) Pinta la lista de categorías
function renderizarCategorias(categorias) {
  const ul = document.getElementById('lista-categorias');
  ul.innerHTML = '';
  categorias.forEach(cat => {
    const li = document.createElement('li');
    li.className = 'categoria-item';
    li.textContent = cat.NombreCategoria;
    li.dataset.id = cat.CategoriaID; // dataset siempre es string
    li.addEventListener('click', () => seleccionarCategoria(cat));
    ul.appendChild(li);
  });
}

// 3) Cuando el usuario hace click en una categoría
async function seleccionarCategoria(cat) {
  // 3.1) Resalta la categoría activa
  document.querySelectorAll('.categoria-item').forEach(el => {
    el.classList.toggle('active',
      Number(el.dataset.id) === cat.CategoriaID
    );
  });

  // 3.2) Carga y renderiza los libros de esa categoría
  await cargarLibrosPorCategoria(cat);
}

// 4) Obtener TODOS los libros y filtrar solo los de esta categoría
async function cargarLibrosPorCategoria(cat) {
  try {
    const res = await fetch(`${API_BASE}/libros`);
    if (!res.ok) throw new Error('Status ' + res.status);
    let libros = await res.json();

    // IMPORTANTE: dataset.id es string, cat.CategoriaID es number
    libros = libros.filter(b =>
      Number(b.CategoriaID) === cat.CategoriaID
    );

    renderizarLibros(libros, cat);
  } catch (err) {
    console.error('❌ Error cargando libros:', err);
    document.getElementById('lista-libros')
      .innerHTML = `<p style="color:red;">Error al cargar libros</p>`;
  }
}

// 5) Pintar las tarjetas de libros
function renderizarLibros(libros, cat) {
  const cont = document.getElementById('lista-libros');
  cont.innerHTML = '';

  if (libros.length === 0) {
    cont.innerHTML = `<p>No hay libros en “${cat.NombreCategoria}”.</p>`;
    return;
  }

  libros.forEach(b => {
    const card = document.createElement('div');
    card.className = 'tarjeta-noticia fade-in';
    card.innerHTML = `
      <img src="${b.UrlImagen}" alt="${b.Titulo}">
      <h3>${b.Titulo}</h3>
    `;

    // 5.1) Al hacer click vamos a DetalleLibro.html
    card.addEventListener('click', () => {
      window.location.href = `DetalleLibro.html?libroID=${b.LibroID}`;
    });

    cont.appendChild(card);
  });
}

// 6) Arrancar al cargar la página
document.addEventListener('DOMContentLoaded', cargarCategorias);
