

document.getElementById('form-login').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const usuario = form.usuario.value;
  const password = form.password.value;

  try {
    const res = await fetch('https://tu-backend.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password })
    });
    if (!res.ok) throw new Error('Credenciales inválidas');
    const { token, rol } = await res.json();
    localStorage.setItem('token', token);
    localStorage.setItem('rol', rol);
    // Redirect a la app
    window.location.href = 'index.html';
  } catch (err) {
    alert(err.message);
  }
});
