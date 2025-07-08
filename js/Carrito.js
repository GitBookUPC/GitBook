// public/js/Carrito.js

// 0) Asegúrate de que config.js cargó y expuso window.API_BASE
function getToken() {
  return localStorage.getItem('token');
}

// 0.1) Toast genérico (requiere <div id="toast-container"></div> en tu HTML)
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type==='success' ? 'fa-check-circle'
             : type==='error'   ? 'fa-exclamation-circle'
             : 'fa-info-circle';
  toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${message}</span>
    <button class="toast-close">&times;</button>
  `;
  container.appendChild(toast);
  // animación entrada/salida
  setTimeout(()=> toast.classList.add('show'), 50);
  setTimeout(()=>{
    toast.classList.remove('show');
    setTimeout(()=> container.removeChild(toast), 300);
  }, 4000);
  toast.querySelector('.toast-close').onclick = () => {
    toast.classList.remove('show');
    setTimeout(()=> container.removeChild(toast), 300);
  };
}

// ─── 1) Renderizar el carrito ─────────────────────────────────
async function renderCarrito() {
  const token = getToken();
  if (!token) return window.location.href = 'Login.html';

  const res   = await fetch(`${API_BASE}/carrito`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const items = res.ok ? await res.json() : [];
  const cont  = document.getElementById('lista-carrito');
  const empty = document.getElementById('empty-cart');
  const total = document.getElementById('total');
  const pay   = document.getElementById('btn-pay');

  // Reset UI
  cont.innerHTML    = '';
  empty.hidden      = true;
  pay.disabled      = false;
  total.textContent = '0.00';

  if (items.length === 0) {
    empty.hidden = false;
    pay.disabled = true;
    return;
  }

  let suma = 0;
  items.forEach(it => {
    const b = it.libro;
    suma += b.Precio * it.cantidad;

    const card = document.createElement('div');
    card.className = 'cart-card';
    card.innerHTML = `
      <img src="${b.UrlImagen}" alt="${b.Titulo}">
      <div class="info">
        <h3>${b.Titulo}</h3>
        <p>Precio: S/ ${b.Precio.toFixed(2)}</p>
      </div>
      <div class="actions">
        <input type="number" min="1" value="${it.cantidad}">
        <button class="btn-remove">Eliminar</button>
      </div>
    `;

    // Cambiar cantidad
    card.querySelector('input')
      .addEventListener('change', async e => {
        const n = parseInt(e.target.value, 10);
        if (n < 1) return renderCarrito();
        await fetch(`${API_BASE}/carrito/${it.itemCarritoID}`, {
          method: 'PUT',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type':  'application/json'
          },
          body: JSON.stringify({ Cantidad: n })
        });
        renderCarrito();
      });

    // Eliminar ítem
    card.querySelector('.btn-remove')
      .addEventListener('click', async () => {
        await fetch(`${API_BASE}/carrito/${it.itemCarritoID}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });
        renderCarrito();
      });

    cont.appendChild(card);
  });

  total.textContent = suma.toFixed(2);
}

// ─── 2) Modal de checkout ──────────────────────────────────────
function openModal() {
  document.getElementById('checkout-modal').hidden = false;
}
function closeModal() {
  document.getElementById('checkout-modal').hidden = true;
}

// ─── 3) Cargar direcciones y métodos de pago ──────────────────
async function loadCheckoutData() {
  const token  = getToken();
  const dirSel = document.getElementById('select-direccion');
  const paySel = document.getElementById('select-metodo');
  const newF   = document.getElementById('new-direccion-form');

  dirSel.innerHTML = `<option value="">— Selecciona dirección —</option>`;
  paySel.innerHTML = `<option value="">— Selecciona método —</option>`;
  newF.hidden      = true;

  // 3.1) Traer direcciones
  const resDir = await fetch(`${API_BASE}/direcciones`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  if (resDir.ok) {
    const dlist = await resDir.json();
    dlist.forEach(d => {
      const o = new Option(
        `${d.Calle}, ${d.Ciudad} (${d.CodigoPostal})`,
        d.DireccionID
      );
      dirSel.add(o);
    });
  }

  // 3.2) Traer métodos de pago
  const resPay = await fetch(`${API_BASE}/metodospago`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  if (resPay.ok) {
    const plist = await resPay.json();
    plist.forEach(m => {
      const o = new Option(m.Nombre, m.MetodoPagoID);
      paySel.add(o);
    });
  }
}

// ─── 4) Guardar nueva dirección ───────────────────────────────
async function saveNewDireccion() {
  const token  = getToken();
  const calle  = document.getElementById('dir-calle').value.trim();
  const ciudad = document.getElementById('dir-ciudad').value.trim();
  const cp     = document.getElementById('dir-codpostal').value.trim();
  if (!calle || !ciudad || !cp) {
    return showToast('❌ Completa todos los campos','error');
  }

  const res = await fetch(`${API_BASE}/direcciones`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type':  'application/json'
    },
    body: JSON.stringify({ Calle: calle, Ciudad: ciudad, CodigoPostal: cp })
  });
  if (!res.ok) {
    return showToast('❌ Error guardando dirección','error');
  }

  await loadCheckoutData();
  newF.hidden = true;
}

// ─── 5) Enviar pedido (checkout) ──────────────────────────────
async function submitCheckout(e) {
  e.preventDefault();
  const token    = getToken();
  const dirID    = +document.getElementById('select-direccion').value;
  const metodoID = +document.getElementById('select-metodo').value;
  if (!dirID || !metodoID) {
    return showToast('❌ Debes elegir dirección y método de pago','error');
  }

  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled    = true;
  btn.textContent = 'Procesando…';

  try {
    // 1) Creo el pedido
    const res = await fetch(`${API_BASE}/pedidos`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({
        direccionID:  dirID,
        metodoPagoID: metodoID,
        cuponID:      null
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || res.statusText);
    }
    const { pdfUrl } = await res.json();

    // 2) Cierro modal y refresco carrito
    closeModal();
    await renderCarrito();

    // 3) Descargo la boleta vía blob (mantengo la pestaña principal intacta)
    const fullUrl = pdfUrl.startsWith('http')
      ? pdfUrl
      : `${API_BASE.replace(/\/api\/?$/,'')}${pdfUrl}`;
    const pdfRes = await fetch(fullUrl, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!pdfRes.ok) throw new Error('No se pudo descargar factura');
    const blob    = await pdfRes.blob();
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');

    // 4) Notifico éxito
    showToast('✅ Compra completada. Tu factura se está descargando','success');

  } catch (err) {
    showToast('❌ ' + err.message,'error');
  } finally {
    // 5) Normalizo el botón
    btn.disabled    = false;
    btn.textContent = 'Confirmar y pagar';
  }
}

// ─── 6) Inicialización ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderCarrito();

  document.getElementById('btn-pay')
    .addEventListener('click', () => {
      openModal();
      loadCheckoutData();
    });

  document.getElementById('btn-close-modal')
    .addEventListener('click', closeModal);
  document.getElementById('btn-cancel-modal')
    .addEventListener('click', closeModal);

  document.getElementById('btn-new-direccion')
    .addEventListener('click', () => {
      document.getElementById('new-direccion-form').hidden = false;
    });

  document.getElementById('btn-save-dir')
    .addEventListener('click', saveNewDireccion);

  document.getElementById('form-checkout')
    .addEventListener('submit', submitCheckout);
});
