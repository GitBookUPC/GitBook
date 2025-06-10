// Login.js
document.getElementById('form-login')
  .addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();

    const emailInput    = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const btn           = document.getElementById('login-btn');
    const errorDiv      = document.getElementById('login-error');

    const email    = emailInput.value.trim();
    const password = passwordInput.value;

    // Validación básica front
    if (!email) {
      showFieldError('email-error', 'El correo es obligatorio');
      return;
    }
    if (!password) {
      showFieldError('password-error', 'La contraseña es obligatoria');
      return;
    }

    // Leer redirect
    const params   = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect') || '../views/Carrito.html';

    // Estado loading
    btn.disabled = true;
    btn.textContent = 'Cargando…';

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Credenciales inválidas');

      // Guardar token
      localStorage.setItem('token', data.token);

      // Redirigir
     if (window.self !== window.top) {
  window.top.location.reload();
} else {
  window.location.href = redirect;
}

    } catch (err) {
      errorDiv.textContent = err.message;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  });

// Mostrar error de un campo específico
function showFieldError(id, msg) {
  const div = document.getElementById(id);
  div.textContent = msg;
}

// Limpiar todos los errores
function clearErrors() {
  document.querySelectorAll('.error-message').forEach(div => {
    div.textContent = '';
  });
}

// Toggle mostrar/ocultar contraseña con cambio de icono
const toggleBtn = document.getElementById('toggle-password');
const pwdInput  = document.getElementById('password');

toggleBtn.addEventListener('click', () => {
  const isHidden = pwdInput.type === 'password';
  // Cambia el tipo del input
  pwdInput.type = isHidden ? 'text' : 'password';
  // Actualiza el icono
  toggleBtn.textContent = isHidden ? '🙈' : '👁️';
  // Ajusta el aria-label para accesibilidad
  toggleBtn.setAttribute(
    'aria-label',
    isHidden ? 'Ocultar contraseña' : 'Mostrar contraseña'
  );
});
