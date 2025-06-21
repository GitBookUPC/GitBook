document.addEventListener('DOMContentLoaded', () => {
  let allBooks = [];

  // Cargar libros desde la API
  fetch(`${API_BASE}/libros`)
    .then(res => res.json())
    .then(json => { 
      allBooks = json;
      console.log('Libros cargados:', allBooks.length);
    })
    .catch(err => console.error('Error cargando libros:', err));

  // Placeholder rotatorio
  const searchBox = document.querySelector('.search-box');
  const texts = [
    'Busca tu próxima gran lectura...',
    'Encuentra bestsellers y clásicos...',
    'Descubre nuevos autores...',
    'Explora géneros literarios...'
  ];
  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % texts.length;
    searchBox.placeholder = texts[idx];
  }, 3000);

  // Crear contenedor de sugerencias
  const searchContainer = document.querySelector('.search-container');
  const suggestionsContainer = document.createElement('div');
  suggestionsContainer.className = 'suggestions-container';
  searchContainer.appendChild(suggestionsContainer);

  // Función para mostrar sugerencias
  function showSuggestions(query) {
    if (!query || query.length < 2) {
      suggestionsContainer.innerHTML = '';
      suggestionsContainer.style.display = 'none';
      searchContainer.classList.remove('active');
      return;
    }

    const filteredBooks = allBooks.filter(book => {
      const titleMatch = book.Titulo.toLowerCase().includes(query.toLowerCase());
      const authorMatch = book.Autores.some(author => 
        author.NombreAutor.toLowerCase().includes(query.toLowerCase())
      );
      return titleMatch || authorMatch;
    }).slice(0, 5); // Limitar a 5 sugerencias

    if (filteredBooks.length === 0) {
      suggestionsContainer.innerHTML = '<div class="suggestion-item no-results">No se encontraron resultados</div>';
      suggestionsContainer.style.display = 'block';
      searchContainer.classList.add('active');
      return;
    }

    const suggestionsHTML = filteredBooks.map(book => `
      <div class="suggestion-item" data-book-id="${book.LibroID}">
        <img src="${book.UrlImagen}" alt="${book.Titulo}" class="suggestion-image">
        <div class="suggestion-content">
          <div class="suggestion-title">${book.Titulo}</div>
          <div class="suggestion-author">${book.Autores.map(a => a.NombreAutor).join(', ')}</div>
          
        </div>
      </div>
    `).join('');

    suggestionsContainer.innerHTML = suggestionsHTML;
    suggestionsContainer.style.display = 'block';
    searchContainer.classList.add('active');

    // Agregar eventos de click a las sugerencias
    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
      if (!item.classList.contains('no-results')) {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const bookId = item.getAttribute('data-book-id');
          const selectedBook = allBooks.find(book => book.LibroID == bookId);
          if (selectedBook) {
            searchBox.value = selectedBook.Titulo;
            suggestionsContainer.style.display = 'none';
            searchContainer.classList.remove('active');
            // Redirigir al detalle del libro
            window.location.href = `DetalleLibro.html?libroID=${selectedBook.LibroID}`;
          }
        });
      }
    });
  }

  // Event listeners para la búsqueda
  searchBox.addEventListener('input', (e) => {
    showSuggestions(e.target.value);
  });

  searchBox.addEventListener('focus', (e) => {
    if (e.target.value.length >= 2) {
      showSuggestions(e.target.value);
    }
  });

  // Ocultar sugerencias al hacer click fuera
  document.addEventListener('click', (e) => {
    if (!searchContainer.contains(e.target)) {
      suggestionsContainer.style.display = 'none';
      searchContainer.classList.remove('active');
    }
  });

  // Manejar teclas de navegación
  let selectedIndex = -1;
  searchBox.addEventListener('keydown', (e) => {
    const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item:not(.no-results)');
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
      updateSelectedSuggestion(suggestions);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
      updateSelectedSuggestion(suggestions);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        const clickEvent = new Event('click', { bubbles: true });
        suggestions[selectedIndex].dispatchEvent(clickEvent);
      }
    } else if (e.key === 'Escape') {
      suggestionsContainer.style.display = 'none';
      searchContainer.classList.remove('active');
      selectedIndex = -1;
    }
  });

  function updateSelectedSuggestion(suggestions) {
    suggestions.forEach((item, index) => {
      if (index === selectedIndex) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }

  // ======= NUEVAS ANIMACIONES AGREGADAS =======

  // Crear libros flotantes dinámicos
  function createFloatingBooks() {
    const floatingContainer = document.querySelector('.floating-elements');
    if (!floatingContainer) return;

    // Limpiar libros existentes
    floatingContainer.innerHTML = '';

    // Crear más libros con diferentes estilos
    const bookStyles = [
      { color: '#48bb78', shadowColor: 'rgba(72, 187, 120, 0.3)' },
      { color: '#4299e1', shadowColor: 'rgba(66, 153, 225, 0.3)' },
      { color: '#ed64a6', shadowColor: 'rgba(237, 100, 166, 0.3)' },
      { color: '#f56565', shadowColor: 'rgba(245, 101, 101, 0.3)' },
      { color: '#9f7aea', shadowColor: 'rgba(159, 122, 234, 0.3)' },
      { color: '#38b2ac', shadowColor: 'rgba(56, 178, 172, 0.3)' }
    ];

    for (let i = 0; i < 8; i++) {
      const book = document.createElement('div');
      book.className = 'floating-book';
      
      const style = bookStyles[i % bookStyles.length];
      book.style.background = `linear-gradient(45deg, ${style.color}, ${style.color}dd)`;
      book.style.boxShadow = `0 10px 30px ${style.shadowColor}`;
      
      // Posiciones aleatorias
      book.style.left = Math.random() * 90 + '%';
      book.style.top = Math.random() * 80 + '%';
      book.style.animationDelay = Math.random() * 6 + 's';
      book.style.animationDuration = (4 + Math.random() * 4) + 's';
      
      floatingContainer.appendChild(book);
    }
  }

  // Efecto de ondas en el background
  function createWaveEffect() {
    const hero = document.querySelector('.hero-section');
    const wave = document.createElement('div');
    wave.className = 'wave-animation';
    hero.appendChild(wave);
  }

  // Animación de typing para el título
  function typeWriterEffect() {
    const title = document.querySelector('.hero-title');
    if (!title) return;

    const originalText = title.textContent;
    title.textContent = '';
    title.style.borderRight = '3px solid white';
    
    let i = 0;
    function typeWriter() {
      if (i < originalText.length) {
        title.textContent += originalText.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
      } else {
        // Quitar el cursor después de completar
        setTimeout(() => {
          title.style.borderRight = 'none';
        }, 1000);
      }
    }
    
    setTimeout(typeWriter, 1000);
  }

  // Animación de contador para las estadísticas
  function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach((stat, index) => {
      const finalNumber = parseInt(stat.textContent.replace(/[^\d]/g, ''));
      stat.textContent = '0';
      
      setTimeout(() => {
        let current = 0;
        const increment = finalNumber / 50;
        const timer = setInterval(() => {
          current += increment;
          if (current >= finalNumber) {
            stat.textContent = finalNumber.toLocaleString() + '+';
            clearInterval(timer);
          } else {
            stat.textContent = Math.floor(current).toLocaleString();
          }
        }, 50);
      }, 2000 + (index * 500));
    });
  }

  // Efecto de brillo en los botones
  function addButtonGlowEffect() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.style.animation = 'glow 0.6s ease-in-out';
      });
      
      btn.addEventListener('animationend', () => {
        btn.style.animation = '';
      });
    });
  }

  // Animar tarjetas con IntersectionObserver (mejorado)
  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.animation = 'slideInUp 0.8s ease-out forwards';
          entry.target.style.transform = 'translateY(0)';
        }, index * 200);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.card, .tarjeta-noticia').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(50px)';
    observer.observe(el);
  });

  // Scroll parallax suave en hero (mejorado)
  window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero-section');
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    if (hero) {
      hero.style.transform = `translateY(${rate}px)`;
    }

    // Efecto parallax en libros flotantes
    const floatingBooks = document.querySelectorAll('.floating-book');
    floatingBooks.forEach((book, index) => {
      const speed = 0.2 + (index * 0.1);
      book.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.05}deg)`;
    });
  });

  // Inicializar todas las animaciones
  setTimeout(() => {
    createFloatingBooks();
    createWaveEffect();
    typeWriterEffect();
    animateStats();
    addButtonGlowEffect();
  }, 500);

  // Recrear libros flotantes cada 30 segundos para variedad
  setInterval(createFloatingBooks, 30000);
});