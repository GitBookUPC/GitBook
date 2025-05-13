// js/Admin.js
document.getElementById('form-libro').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const token = localStorage.getItem('token');

  try {
    const res = await fetch('https://TU_BACKEND.com/api/libros', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      body: formData
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al crear el libro');
    }

    const { mensaje, url } = await res.json();
    document.getElementById('mensaje').textContent = '✅ Libro agregado correctamente.';
    form.reset();
  } catch (err) {
    document.getElementById('mensaje').textContent = '❌ ' + err.message;
  }
});
