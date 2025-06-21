// js/Categorias.js

// 1) Arranque
document.addEventListener('DOMContentLoaded', () => {
  inicializarInterfaz();
  cargarCategorias();
});

// Inicializar elementos de la interfaz
function inicializarInterfaz() {
  // Mostrar estado de carga inicial
  mostrarEstadoCarga();
  
  // Smooth scroll para categorías si es necesario
  const listaCategorias = document.getElementById('lista-categorias');
  if (listaCategorias) {
    listaCategorias.style.scrollBehavior = 'smooth';
  }
}

// 2) Cargo y renderizo categorías
async function cargarCategorias() {
  try {
    // Mostrar loading en categorías
    const contCategorias = document.getElementById('lista-categorias');
    contCategorias.innerHTML = '<li class="categoria-loading">Cargando categorías...</li>';
    
    const res = await fetch(`${API_BASE}/categorias`);
    if (!res.ok) throw new Error(res.statusText);
    const categorias = await res.json();
    
    // Pequeño delay para suavizar la transición
    await new Promise(resolve => setTimeout(resolve, 100));
    
    renderizarCategorias(categorias);

    // auto‐selecciona la primera con animación
    if (categorias.length > 0) {
      setTimeout(() => {
        seleccionarCategoria(categorias[0]);
      }, 50);
    }
  } catch (err) {
    console.error('Error cargando categorías:', err);
    mostrarErrorCategorias();
  }
}

// 3) Pinto botones de categoría con animaciones
function renderizarCategorias(categorias) {
  const cont = document.getElementById('lista-categorias');
  cont.innerHTML = '';
  
  categorias.forEach((cat, index) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    
    btn.type = 'button';
    btn.className = 'categoria-btn';
    btn.textContent = cat.NombreCategoria;
    btn.dataset.id = cat.CategoriaID;
    
    // Animación escalonada
    btn.style.animationDelay = `${index * 0.1}s`;
    btn.classList.add('slide-in');
    
    // Efectos hover y click
    btn.addEventListener('mouseenter', () => {
      btn.classList.add('hover-effect');
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.classList.remove('hover-effect');
    });
    
    btn.addEventListener('click', (e) => {
      // Efecto ripple
      crearEfectoRipple(e, btn);
      setTimeout(() => seleccionarCategoria(cat), 150);
    });
    
    li.appendChild(btn);
    cont.appendChild(li);
  });
}

// 4) Marca activa y carga libros con transiciones
async function seleccionarCategoria(cat) {
  // Actualizar título de categoría con animación
  const tituloCategoriaActual = document.getElementById('titulo-categoria-actual');
  if (tituloCategoriaActual) {
    tituloCategoriaActual.style.opacity = '0';
    setTimeout(() => {
      tituloCategoriaActual.textContent = cat.NombreCategoria;
      tituloCategoriaActual.style.opacity = '1';
    }, 150);
  }
  
  // quito active de todas con transición
  document.querySelectorAll('.categoria-btn').forEach(b => {
    b.classList.remove('active');
    b.classList.add('inactive');
  });

  // marco la pulsada
  const miBtn = document.querySelector(`.categoria-btn[data-id="${cat.CategoriaID}"]`);
  if (miBtn) {
    miBtn.classList.remove('inactive');
    miBtn.classList.add('active');
  }

  // cargo sus libros
  await cargarLibrosPorCategoria(cat);
}

// 5) Traigo todos y filtro con loading
async function cargarLibrosPorCategoria(cat) {
  const cont = document.getElementById('lista-libros');
  const estadoCarga = document.getElementById('estado-carga');
  const estadoVacio = document.getElementById('estado-vacio');
  const contadorResultados = document.getElementById('contador-resultados');
  
  try {
    // Mostrar loading
    mostrarEstadoCarga();
    ocultarEstadoVacio();
    
    // Ocultar libros actuales con fade out
    cont.style.opacity = '0';
    
    const res = await fetch(`${API_BASE}/libros`);
    if (!res.ok) throw new Error(res.statusText);
    const all = await res.json();

    // filtro por CategoryID
    const libros = all.filter(b => Number(b.Categoria.CategoriaID) === cat.CategoriaID);
    
    // Pequeño delay para transición suave
    await new Promise(resolve => setTimeout(resolve, 100));
    
    ocultarEstadoCarga();
    
    // Actualizar contador
    if (contadorResultados) {
      contadorResultados.textContent = `${libros.length} libro${libros.length !== 1 ? 's' : ''} encontrado${libros.length !== 1 ? 's' : ''}`;
    }
    
    renderizarLibros(libros, cat.NombreCategoria);
  } catch (err) {
    console.error('Error cargando libros:', err);
    mostrarErrorLibros();
  }
}

// 6) Pinto tarjetas de libros con animaciones
function renderizarLibros(libros, catName) {
  const cont = document.getElementById('lista-libros');
  cont.innerHTML = '';

  if (libros.length === 0) {
    mostrarEstadoVacio();
    return;
  }

  libros.forEach((b, index) => {
    const card = document.createElement('div');
    card.className = 'libro-card';
    
    // Verificar si la imagen existe
    const imgSrc = b.UrlImagen || '../assets/img/libro-placeholder.jpg';
    
    card.innerHTML = `
      <div class="card-img-container">
        <img src="${imgSrc}" alt="${b.Titulo}" class="card-img" loading="lazy">
        <div class="card-overlay">
          <span class="card-action">Ver detalles</span>
        </div>
      </div>
      <div class="card-body">
        <h3 class="card-title">${b.Titulo}</h3>
       
        <p class="card-author">${b.Autores?.map(autor => autor.nombre || autor.Nombre).join(', ')}</p>
        <div class="card-footer">
          <span class="card-price">S/ ${b.Precio || '0.00'}</span>
          <span class="card-category">${catName}</span>
        </div>
      </div>
    `;
  
    // Animación escalonada
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add('fade-in-up');
    
    // Efectos hover
    card.addEventListener('mouseenter', () => {
      card.classList.add('card-hover');
    });
    
    card.addEventListener('mouseleave', () => {
      card.classList.remove('card-hover');
    });
    
    // Navegación con efecto de carga
    card.addEventListener('click', () => {
      card.classList.add('card-clicked');
      setTimeout(() => {
        window.location.href = `DetalleLibro.html?libroID=${b.LibroID}`;
      }, 200);
    });
    
    cont.appendChild(card);
  });
  
  // Fade in del contenedor
  setTimeout(() => {
    cont.style.opacity = '1';
  }, 100);
}

// Funciones de estado de UI
function mostrarEstadoCarga() {
  const estadoCarga = document.getElementById('estado-carga');
  const estadoVacio = document.getElementById('estado-vacio');
  
  if (estadoCarga) {
    estadoCarga.classList.remove('hidden');
    estadoCarga.classList.add('visible');
  }
  if (estadoVacio) {
    estadoVacio.classList.add('hidden');
  }
}

function ocultarEstadoCarga() {
  const estadoCarga = document.getElementById('estado-carga');
  if (estadoCarga) {
    estadoCarga.classList.add('hidden');
    estadoCarga.classList.remove('visible');
  }
}

function mostrarEstadoVacio() {
  const estadoVacio = document.getElementById('estado-vacio');
  const estadoCarga = document.getElementById('estado-carga');
  
  if (estadoVacio) {
    estadoVacio.classList.remove('hidden');
    estadoVacio.classList.add('visible');
  }
  if (estadoCarga) {
    estadoCarga.classList.add('hidden');
  }
}

function ocultarEstadoVacio() {
  const estadoVacio = document.getElementById('estado-vacio');
  if (estadoVacio) {
    estadoVacio.classList.add('hidden');
    estadoVacio.classList.remove('visible');
  }
}

function mostrarErrorCategorias() {
  const cont = document.getElementById('lista-categorias');
  cont.innerHTML = `
    <li class="error-state">
      <div class="error-icon">⚠️</div>
      <p>Error al cargar las categorías</p>
      <button onclick="cargarCategorias()" class="retry-btn">Reintentar</button>
    </li>
  `;
}

function mostrarErrorLibros() {
  const cont = document.getElementById('lista-libros');
  ocultarEstadoCarga();
  cont.innerHTML = `
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <p>Error al cargar los libros</p>
      <button onclick="location.reload()" class="retry-btn">Reintentar</button>
    </div>
  `;
  cont.style.opacity = '1';
}

// Efecto ripple para botones
function crearEfectoRipple(event, elemento) {
  const ripple = document.createElement('span');
  const rect = elemento.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple-effect 0.6s ease-out;
    pointer-events: none;
  `;
  
  ripple.classList.add('ripple');
  elemento.style.position = 'relative';
  elemento.style.overflow = 'hidden';
  elemento.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
}