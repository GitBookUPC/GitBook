// js/Admin.js

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    // si no está autenticado, redirige al login
    return window.location.href = 'Login.html?redirect=Admin.html';
  }

  // Cargar categorías para el <select>
  const catSelect = document.getElementById('categoria');
  fetch(`${API_BASE}/categorias`)
    .then(res => res.json())
    .then(cats => {
      cats.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.CategoriaID;
        opt.textContent = cat.NombreCategoria;
        catSelect.appendChild(opt);
      });
    })
    .catch(err => console.error('Error cargando categorías:', err));

  // Manejo del formulario
  const form = document.getElementById('form-libro');
  const mensajeDiv = document.getElementById('mensaje');
  const submitBtn  = document.getElementById('submit-btn');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    mensajeDiv.textContent = '';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Subiendo…';

    const formData = new FormData(form);
    // autores es un string CSV ya en el input
    // formData.append('autores', formData.get('autores'));

    try {
      const res = await fetch(`${API_BASE}/libros`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        body: formData
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al crear el libro');
      }
      const { mensaje } = await res.json();
      mensajeDiv.textContent = '✅ ' + mensaje;
      mensajeDiv.classList.add('success');
      form.reset();
    } catch (err) {
      mensajeDiv.textContent = '❌ ' + err.message;
      mensajeDiv.classList.add('error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Agregar Libro';
    }
  });
});
