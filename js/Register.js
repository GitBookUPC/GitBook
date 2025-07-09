// frontend/js/Register.js

document.getElementById('form-register')
  .addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();

    const nombreInput   = document.getElementById('reg-nombre');
    const emailInput    = document.getElementById('reg-email');
    const passwordInput = document.getElementById('reg-password');
    const btn           = document.getElementById('register-btn');
    const errorDiv      = document.getElementById('register-error');

    const nombre   = nombreInput.value.trim();
    const email    = emailInput.value.trim();
    const password = passwordInput.value;

    // Expresión regular básica para validar correo electrónico
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validaciones básicas
    if (!nombre) {
      showFieldError('nombre-error', 'El usuario es obligatorio');
      return;
    }
    if (!email) {
      showFieldError('email-error', 'El correo es obligatorio');
      return;
    }
    if (!emailPattern.test(email)) {
      showFieldError('email-error', 'Ingresa un correo electrónico válido');
      return;
    }
    if (!password) {
      showFieldError('password-error', 'La contraseña es obligatoria');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Registrando…';

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ nombre, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar');

      alert('✅ Registro exitoso. Por favor inicia sesión.');
      window.location.href = 'Login.html';
    } catch (err) {
      errorDiv.textContent = err.message;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Registrarme';
    }
  });

// Toggle mostrar/ocultar contraseña
const toggleReg = document.getElementById('toggle-password-register');
const pwdReg    = document.getElementById('reg-password');

toggleReg.addEventListener('click', () => {
  const isHidden = pwdReg.type === 'password';
  pwdReg.type = isHidden ? 'text' : 'password';
  toggleReg.textContent = isHidden ? '🙈' : '👁️';
  toggleReg.setAttribute(
    'aria-label',
    isHidden ? 'Ocultar contraseña' : 'Mostrar contraseña'
  );
});

// Funciones de error
function showFieldError(id, msg) {
  document.getElementById(id).textContent = msg;
}
function clearErrors() {
  document.querySelectorAll('.error-message').forEach(div => {
    div.textContent = '';
  });
}