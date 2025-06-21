// js/Admin.js
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) return window.location.href = 'Login.html?redirect=Admin.html';

  // DOM Elements
  const form = document.getElementById('form-libro');
  const estadoId = document.getElementById('libroId');
  const formTitle = document.getElementById('form-title');
  const formStatus = document.getElementById('form-status');
  
  // Form inputs
  const tituloInput = document.getElementById('titulo');
  const precioInput = document.getElementById('precio');
  const descInput = document.getElementById('descripcion');
  const catSelect = document.getElementById('categoria');
  const showNewCat = document.getElementById('show-new-cat');
  const newCatGroup = document.getElementById('new-cat-group');
  const addCatBtn = document.getElementById('add-cat');
  const nuevaCat = document.getElementById('nuevaCategoria');
  const descNewCat = document.getElementById('descNuevaCategoria');

  const authSelect = document.getElementById('autores');
  const showNewAuth = document.getElementById('show-new-autor');
  const newAuthGroup = document.getElementById('new-autor-group');
  const addAuthBtn = document.getElementById('add-autor');
  const inpAuthName = document.getElementById('nuevoAutor');
  const inpAuthBio = document.getElementById('nuevoBioAutor');

  const caInput = document.getElementById('cantidadActual');
  const cmInput = document.getElementById('cantidadMinima');
  const portadaInput = document.getElementById('portada');
  const previewImg = document.getElementById('preview-portada');
  const uploadPlaceholder = document.getElementById('upload-placeholder');
  const mensajeDiv = document.getElementById('mensaje');
  const submitBtn = document.getElementById('submit-btn');
  const cancelBtn = document.getElementById('cancel-edit');

  const tablaBody = document.querySelector('#tabla-libros tbody');
  const totalBooksSpan = document.getElementById('total-books');

  // Estado de edición
  let isEditing = false;

  // Inicialización
  portadaInput.required = true;
  setupImageUpload();
  loadAll();

  async function loadAll() {
    showLoadingState();
    await Promise.all([loadCategorias(), loadAutores(), loadLibros()]);
    resetForm();
    hideLoadingState();
  }

  function showLoadingState() {
    formStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
    formStatus.className = 'form-status loading';
  }

  function hideLoadingState() {
    formStatus.innerHTML = '';
    formStatus.className = 'form-status';
  }

  // — MANEJO DE IMAGEN —
  function setupImageUpload() {
    const imageContainer = document.querySelector('.image-upload-container');
    
    // Drag and drop
    imageContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      imageContainer.classList.add('drag-over');
    });

    imageContainer.addEventListener('dragleave', (e) => {
      e.preventDefault();
      imageContainer.classList.remove('drag-over');
    });

    imageContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      imageContainer.classList.remove('drag-over');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelection(files[0]);
      }
    });

    // Click to upload - Mejorado para permitir múltiples selecciones
    uploadPlaceholder.addEventListener('click', () => {
      // Resetear el valor del input para permitir seleccionar el mismo archivo nuevamente
      portadaInput.value = '';
      portadaInput.click();
    });

    // Agregar botón para cambiar imagen cuando ya hay una seleccionada
    previewImg.addEventListener('click', () => {
      portadaInput.value = '';
      portadaInput.click();
    });

    // File input change - Mejorado
    portadaInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
      }
    });
  }

  function handleFileSelection(file) {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      showMessage('❌ Por favor selecciona un archivo de imagen válido', 'error');
      return;
    }

    // Validar tamaño de archivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showMessage('❌ El archivo es demasiado grande. Máximo 5MB permitido', 'error');
      return;
    }

    handleImagePreview(file);
  }

  function handleImagePreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewImg.hidden = false;
      uploadPlaceholder.hidden = true;
      
      // Agregar título al preview para indicar que se puede hacer click
      previewImg.title = 'Click para cambiar imagen';
      previewImg.style.cursor = 'pointer';
    };
    reader.onerror = () => {
      showMessage('❌ Error al cargar la imagen', 'error');
    };
    reader.readAsDataURL(file);
  }

  // Función para resetear la selección de imagen
  function resetImageSelection() {
    portadaInput.value = '';
    previewImg.hidden = true;
    previewImg.src = '';
    uploadPlaceholder.hidden = false;
  }

  // — CATEGORÍAS —
  showNewCat.onclick = () => {
    const isHidden = newCatGroup.hidden;
    newCatGroup.hidden = !isHidden;
    showNewCat.innerHTML = isHidden 
      ? '<i class="fas fa-minus"></i> Cancelar' 
      : '<i class="fas fa-plus"></i> Nueva';
    
    if (!isHidden) {
      nuevaCat.value = '';
      descNewCat.value = '';
    } else {
      nuevaCat.focus();
    }
  };

  addCatBtn.onclick = async () => {
    const name = nuevaCat.value.trim();
    if (!name) {
      showMessage('❌ Nombre de categoría requerido', 'error');
      return;
    }
    
    addCatBtn.disabled = true;
    addCatBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Agregando...';
    
    const desc = descNewCat.value.trim();
    try {
      const res = await fetch(`${API_BASE}/categorias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ NombreCategoria: name, Descripcion: desc })
      });
      
      if (!res.ok) throw new Error('Error creando categoría');
      
      const cat = await res.json();
      await loadCategorias();
      catSelect.value = cat.CategoriaID;
      
      nuevaCat.value = '';
      descNewCat.value = '';
      newCatGroup.hidden = true;
      showNewCat.innerHTML = '<i class="fas fa-plus"></i> Nueva';
      
      showMessage('✅ Categoría creada exitosamente', 'success');
    } catch (error) {
      showMessage('❌ Error al crear categoría', 'error');
    } finally {
      addCatBtn.disabled = false;
      addCatBtn.innerHTML = '<i class="fas fa-check"></i> Agregar Categoría';
    }
  };

  async function loadCategorias() {
    try {
      const res = await fetch(`${API_BASE}/categorias`);
      const cats = await res.json();
      catSelect.innerHTML = `<option value="">— Selecciona categoría —</option>`;
      cats.forEach(c => {
        catSelect.innerHTML += `<option value="${c.CategoriaID}">${c.NombreCategoria}</option>`;
      });
    } catch (error) {
      showMessage('❌ Error al cargar categorías', 'error');
    }
  }

  // — AUTORES —
  showNewAuth.onclick = () => {
    const isHidden = newAuthGroup.hidden;
    newAuthGroup.hidden = !isHidden;
    showNewAuth.innerHTML = isHidden 
      ? '<i class="fas fa-minus"></i> Cancelar' 
      : '<i class="fas fa-plus"></i> Nuevo';
    
    if (!isHidden) {
      inpAuthName.value = '';
      inpAuthBio.value = '';
    } else {
      inpAuthName.focus();
    }
  };

  addAuthBtn.onclick = async () => {
    const name = inpAuthName.value.trim();
    if (!name) {
      showMessage('❌ Nombre de autor requerido', 'error');
      return;
    }
    
    addAuthBtn.disabled = true;
    addAuthBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Agregando...';
    
    const bio = inpAuthBio.value.trim();
    try {
      const res = await fetch(`${API_BASE}/autores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ NombreAutor: name, BioAutor: bio })
      });
      
      if (!res.ok) throw new Error('Error creando autor');
      
      await loadAutores();
      inpAuthName.value = '';
      inpAuthBio.value = '';
      newAuthGroup.hidden = true;
      showNewAuth.innerHTML = '<i class="fas fa-plus"></i> Nuevo';
      
      showMessage('✅ Autor agregado exitosamente', 'success');
    } catch (error) {
      showMessage('❌ Error al crear autor', 'error');
    } finally {
      addAuthBtn.disabled = false;
      addAuthBtn.innerHTML = '<i class="fas fa-check"></i> Agregar Autor';
    }
  };

  async function loadAutores() {
    try {
      const res = await fetch(`${API_BASE}/autores`);
      const list = await res.json();
      authSelect.innerHTML = '<option disabled>Mantén Ctrl/Cmd para seleccionar múltiples</option>';
      list.forEach(a => {
        authSelect.innerHTML += `<option value="${a.AutorID}">${a.NombreAutor}</option>`;
      });
    } catch (error) {
      showMessage('❌ Error al cargar autores', 'error');
    }
  }

  // — LIBROS —
  async function loadLibros() {
    try {
      const res = await fetch(`${API_BASE}/libros`);
      const list = await res.json();
      
      tablaBody.innerHTML = '';
      totalBooksSpan.textContent = list.length;
      
      if (list.length === 0) {
        tablaBody.innerHTML = `
          <tr class="empty-row">
            <td colspan="6">
              <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <p>No hay libros registrados</p>
              </div>
            </td>
          </tr>`;
        return;
      }
      
      list.forEach(b => {
        const autores = b.Autores.map(a => a.NombreAutor).join(', ');
        const stockClass = b.Stock.CantidadActual <= b.Stock.CantidadMinima ? 'low-stock' : '';
        
        tablaBody.innerHTML += `
          <tr data-id="${b.LibroID}" class="${stockClass}">
            <td class="book-title">
              <div class="book-info">
                <strong>${b.Titulo}</strong>
                ${b.Descripcion ? `<small>${b.Descripcion.substring(0, 50)}...</small>` : ''}
              </div>
            </td>
            <td class="price">S/ ${b.Precio.toFixed(2)}</td>
            <td class="stock">
              <span class="stock-badge ${b.Stock.CantidadActual <= b.Stock.CantidadMinima ? 'low' : 'normal'}">
                ${b.Stock.CantidadActual}
              </span>
              <small>Min: ${b.Stock.CantidadMinima}</small>
            </td>
            <td class="category">${b.Categoria.NombreCategoria}</td>
            <td class="authors">${autores}</td>
            <td class="actions">
              <button class="btn-action btn-edit" title="Editar libro">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-action btn-delete" title="Eliminar libro">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>`;
      });

      // Event listeners para botones
      document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.onclick = () => startEdit(btn.closest('tr').dataset.id);
      });
      document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.onclick = () => deleteLibro(btn.closest('tr').dataset.id);
      });
    } catch (error) {
      showMessage('❌ Error al cargar libros', 'error');
    }
  }

  // — EDITAR —
  async function startEdit(id) {
    try {
      const res = await fetch(`${API_BASE}/libros/${id}`);
      const b = await res.json();

      isEditing = true;
      estadoId.value = b.LibroID;
      tituloInput.value = b.Titulo;
      precioInput.value = b.Precio;
      descInput.value = b.Descripcion || '';
      caInput.value = b.Stock.CantidadActual;
      cmInput.value = b.Stock.CantidadMinima;
      catSelect.value = b.CategoriaID;

      // Seleccionar autores
      Array.from(authSelect.options).forEach(opt => {
        opt.selected = b.Autores.some(a => a.AutorID == opt.value);
      });

      // Actualizar UI
      formTitle.innerHTML = '<i class="fas fa-edit"></i> Editando Libro';
      submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Libro';
      cancelBtn.hidden = false;
      portadaInput.required = false;
      
      if (b.UrlImagen) {
        previewImg.src = b.UrlImagen;
        previewImg.hidden = false;
        previewImg.title = 'Click para cambiar imagen';
        previewImg.style.cursor = 'pointer';
        uploadPlaceholder.hidden = true;
      }
      
      // Scroll al formulario
      document.querySelector('.form-container').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      
      showMessage('📝 Modo edición activado', 'info');
    } catch (error) {
      showMessage('❌ Error al cargar datos del libro', 'error');
    }
  }

  // — CANCELAR EDICIÓN —
  cancelBtn.onclick = () => {
    if (confirm('¿Estás seguro de cancelar la edición? Se perderán los cambios no guardados.')) {
      resetForm();
      showMessage('✖️ Edición cancelada', 'info');
    }
  };

  // — BORRAR —
  async function deleteLibro(id) {
    if (!confirm('¿Estás seguro de eliminar este libro? Esta acción no se puede deshacer.')) return;
    
    try {
      const res = await fetch(`${API_BASE}/libros/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      
      if (res.ok) {
        await loadLibros();
        showMessage('✅ Libro eliminado exitosamente', 'success');
      } else {
        throw new Error('Error en el servidor');
      }
    } catch (error) {
      showMessage('❌ Error al eliminar el libro', 'error');
    }
  }

  // — SUBMIT CRUD —
  form.onsubmit = async e => {
    e.preventDefault();
    
    // Validaciones adicionales
    if (!validateForm()) return;
    
    mensajeDiv.innerHTML = '';
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    try {
      const fd = new FormData(form);
      const autoresArr = Array.from(authSelect.selectedOptions)
                               .filter(o => o.value) // Filtrar opciones vacías
                               .map(o => o.value);
      
      if (autoresArr.length === 0) {
        throw new Error('Debe seleccionar al menos un autor');
      }
      
      fd.set('autores', JSON.stringify(autoresArr));

      const id = estadoId.value;
      const url = id ? `${API_BASE}/libros/${id}` : `${API_BASE}/libros`;
      const opts = {
        method: id ? 'PUT' : 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: fd
      };

      const res = await fetch(url, opts);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Error en el servidor');
      }
      
      showMessage(`✅ Libro ${id ? 'actualizado' : 'creado'} exitosamente!`, 'success');
      await loadAll();
      
    } catch (error) {
      showMessage(`❌ ${error.message}`, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  };

  // — VALIDACIONES —
  function validateForm() {
    const errors = [];
    
    if (!tituloInput.value.trim()) errors.push('El título es requerido');
    if (!precioInput.value || precioInput.value <= 0) errors.push('El precio debe ser mayor a 0');
    if (!catSelect.value) errors.push('Debe seleccionar una categoría');
    if (!caInput.value || caInput.value < 0) errors.push('La cantidad actual debe ser mayor o igual a 0');
    if (!cmInput.value || cmInput.value < 0) errors.push('La cantidad mínima debe ser mayor o igual a 0');
    if (portadaInput.required && !portadaInput.files.length) errors.push('La portada es requerida');
    
    const selectedAuthors = Array.from(authSelect.selectedOptions).filter(o => o.value);
    if (selectedAuthors.length === 0) errors.push('Debe seleccionar al menos un autor');
    
    if (errors.length > 0) {
      showMessage('❌ Errores de validación:<br>• ' + errors.join('<br>• '), 'error');
      return false;
    }
    
    return true;
  }

  // — UTILIDADES —
  function resetForm() {
    isEditing = false;
    estadoId.value = '';
    form.reset();
    
    // Resetear imagen
    resetImageSelection();
    
    // Resetear UI
    formTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Agregar Nuevo Libro';
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Agregar Libro';
    cancelBtn.hidden = true;
    portadaInput.required = true;
    
    // Resetear grupos expandibles
    newCatGroup.hidden = true;
    newAuthGroup.hidden = true;
    showNewCat.innerHTML = '<i class="fas fa-plus"></i> Nueva';
    showNewAuth.innerHTML = '<i class="fas fa-plus"></i> Nuevo';
    
    // Limpiar mensajes
    clearMessages();
  }

  function showMessage(text, type = 'info') {
    mensajeDiv.innerHTML = text;
    mensajeDiv.className = `message-container ${type}`;
    mensajeDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-ocultar mensajes de éxito después de 5 segundos
    if (type === 'success') {
      setTimeout(() => {
        if (mensajeDiv.classList.contains('success')) {
          clearMessages();
        }
      }, 5000);
    }
  }

  function clearMessages() {
    mensajeDiv.innerHTML = '';
    mensajeDiv.className = 'message-container';
  }
});