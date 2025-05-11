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
