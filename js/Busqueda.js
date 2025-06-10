function mostrarDetalle(tipo) {
    const contenedor = document.getElementById("detalle");
    let contenido = "";
  
    switch (tipo) {
      case "itsm":
        contenido = `
          <h3>ITSM y Gestión de Dispositivos</h3>
          <ul>
            <li>✔️ CMDB Integrado</li>
            <li>✔️ Inventario y Parcheo</li>
            <li>✔️ Gestión remota de equipos</li>
          </ul>`;
        break;
  
      case "esm":
        contenido = `
          <h3>Enterprise Service Management</h3>
          <ul>
            <li>📌 Servicios Compartidos</li>
            <li>📌 RRHH y Facilities</li>
            <li>📌 Integración entre áreas</li>
          </ul>`;
        break;
  
      case "clientes":
        contenido = `
          <h3>Soporte a Clientes Externos</h3>
          <p>Automatización de atención al cliente, chatbots y autoservicio para mejorar la experiencia.</p>`;
        break;
  
      case "teletrabajo":
        contenido = `
          <h3>Teletrabajo y Productividad</h3>
          <p>Soluciones remotas seguras, colaboración y monitoreo eficiente para entornos híbridos.</p>`;
        break;
    }
  
    contenedor.innerHTML = contenido;
  }
// esto le pedi a gpt pero no sabia para que funcionaba me dijo que si queria la eliminaba o le buscaba una funcion pero no le he encontrado la verdad
  function buscarLibro() {
    const searchValue = document.getElementById('search-bar').value.toLowerCase();
    const libros = document.querySelectorAll('.tarjeta-noticia');
  
    libros.forEach(libro => {
      const titulo = libro.querySelector('h3').textContent.toLowerCase();
      if (titulo.includes(searchValue)) {
        libro.style.display = 'block';
      } else {
        libro.style.display = 'none';
      }
    });
  }
  // Con este haces una busqueda y la encuentra 
document.getElementById('search-bar').addEventListener('input', function () {
    const searchValue = this.value.toLowerCase();
    const libros = document.querySelectorAll('.tarjeta-noticia');
  
    libros.forEach(libro => {
      const titulo = libro.querySelector('h3').textContent.toLowerCase();
      if (titulo.includes(searchValue)) {
        libro.style.display = 'block';
      } else {
        libro.style.display = 'none';
      }
    });
  });
  // Al final de tu función de búsqueda en Busqueda.js
async function buscarLibro() {
  const term = document.getElementById('search-bar').value.trim();
  // … lógica de filtrar/mostrar libros …
  // GRABAR HISTORIAL
  fetch(`${API_BASE}/search-history`, {
    method: 'POST',
    headers: {
      'Content-Type':'application/json',
      'Authorization':'Bearer '+ getToken()
    },
    body: JSON.stringify({ term })
  }).catch(console.warn);
}
