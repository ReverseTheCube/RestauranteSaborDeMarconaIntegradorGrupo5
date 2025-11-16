// --- CONSTANTES DE LA API ---
const API_URL_CLIENTES = "http://localhost:8080/api/clientes";
const API_URL_EMPRESAS = "http://localhost:8080/api/empresas";

// --- EVENTO PRINCIPAL: Cargar todo al iniciar ---
document.addEventListener("DOMContentLoaded", () => {
    // La carga se realizará solo al buscar.
});

// --- FUNCIONALIDAD BÁSICA DEL PANEL ---
function mostrarSeccion(seccion) {
  // Oculta todas las secciones
  document.getElementById("clientes").classList.add("hidden");
  document.getElementById("empresas").classList.add("hidden");
  
  // NUEVO: Ocultar Pensionados
  const pensionadosEl = document.getElementById("pensionados");
  if (pensionadosEl) pensionadosEl.classList.add("hidden");
  
  // Desactiva todas las pestañas
  document.getElementById("tabClientes").classList.remove("active");
  document.getElementById("tabEmpresas").classList.remove("active");
  
  // NUEVO: Desactivar PENSIONADOS
  const tabPensionadosEl = document.getElementById("tabPensionados");
  if (tabPensionadosEl) tabPensionadosEl.classList.remove("active");
  

  const mensajeInicialClientes = '<tr><td colspan="3" style="text-align: center;">Pulse BUSCAR o escriba un filtro para cargar datos.</td></tr>';
  const mensajeInicialEmpresas = '<tr><td colspan="2" style="text-align: center;">Pulse BUSCAR o escriba un filtro para cargar datos.</td></tr>';
  const mensajeInicialPensionados = '<tr><td colspan="5" style="text-align: center;">Presione BUSCAR para ver el listado.</td></tr>'; // 5 columnas

  // Muestra la sección seleccionada
  if (seccion === "clientes") {
    document.getElementById("clientes").classList.remove("hidden");
    document.getElementById("tabClientes").classList.add("active");
    const tbody = document.querySelector("#tablaClientes tbody");
    if (tbody.children.length === 0 || tbody.children[0].textContent.includes('No hay clientes') || tbody.children[0].textContent.includes('encontraron coincidencias')) {
        tbody.innerHTML = mensajeInicialClientes;
    }
  } else if (seccion === "empresas") {
    document.getElementById("empresas").classList.remove("hidden");
    document.getElementById("tabEmpresas").classList.add("active");
    const tbody = document.querySelector("#tablaEmpresas tbody");
    if (tbody.children.length === 0 || tbody.children[0].textContent.includes('No hay empresas') || tbody.children[0].textContent.includes('encontraron coincidencias')) {
        tbody.innerHTML = mensajeInicialEmpresas;
    }
  } else if (seccion === "pensionados") { // NUEVO: Lógica para Pensionados
    document.getElementById("pensionados").classList.remove("hidden");
    if (tabPensionadosEl) tabPensionadosEl.classList.add("active");
    
    // Inicializa la tabla de pensionados
    const tbody = document.querySelector("#tablaPensionados tbody");
    if (tbody.children.length === 0 || tbody.children[0].textContent.includes('No hay') || tbody.children[0].textContent.includes('encontraron coincidencias')) {
        tbody.innerHTML = mensajeInicialPensionados;
    }
  }
}

// --- CLIENTES (API IMPLEMENTATION) ---

/**
 * Función central para cargar/filtrar clientes.
 * @param {string} filtro - El texto de búsqueda (DNI, Nombre o vacío).
 */
async function cargarClientes(filtro = '') {
    // Si el filtro es vacío y la llamada NO es para recargar tras un registro, no hace nada.
    if (!filtro && (event.type === 'input' || event.type === 'change')) {
        actualizarTablaClientes([]); // Vacía la tabla si el input está vacío
        return;
    }
    
    // Si no hay filtro, la URL es la base (que devolverá todos). Si hay, añade el filtro.
    const url = filtro ? `${API_URL_CLIENTES}?filtro=${encodeURIComponent(filtro)}` : API_URL_CLIENTES;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al cargar clientes");
        const clientes = await response.json();
        actualizarTablaClientes(clientes);
    } catch (error) {
        console.error("Error en cargarClientes:", error);
        actualizarTablaClientes([]); 
        throw error; 
    }
}

// MODIFICACIÓN: Se unifica la función de búsqueda para botón y oninput
function buscarCliente(filtro) {
  cargarClientes(filtro);
}

// REGISTRAR CLIENTE (POST)
async function registrarCliente() {
  const tipo = document.getElementById("tipoDocumento").value;
  const numero = document.getElementById("numeroDocumento").value.trim();
  const nombre = document.getElementById("nombresApellidos").value.trim();

  if (!tipo || !numero || !nombre) {
    alert("Por favor, Completar todos los campos.");
    return;
  }

  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre)) {
    alert("Error, solo se acepta letras en Nombres y Apellidos.");
    return;
  }

  const nuevoCliente = {
      tipoDocumento: tipo,
      numeroDocumento: numero,
      nombresApellidos: nombre
  };

  try {
      const response = await fetch(API_URL_CLIENTES, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoCliente)
      });

      if (response.ok) {
          alert("Cliente registrado exitosamente!");
          limpiarCamposClientes();
          
          // La tabla no se recarga automáticamente.
          
      } else {
          const errorTexto = await response.text();
          alert(`Error al registrar cliente: ${errorTexto}`);
      }
  } catch (error) {
      console.error("Error de red en registrarCliente:", error);
      alert("No se pudo conectar con el servidor.");
  }
}

// ACTUALIZAR TABLA CLIENTES (A partir de la lista recibida de la API)
function actualizarTablaClientes(lista) {
  const tbody = document.querySelector("#tablaClientes tbody");
  tbody.innerHTML = ""; // Limpiar tabla
  if (lista.length === 0) {
      // MODIFICACIÓN: Mensaje cuando no hay coincidencias
      tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No se encontraron coincidencias.</td></tr>';
      return;
  }
  lista.forEach(c => {
    const fila = `<tr>
      <td>${c.tipoDocumento}</td>
      <td>${c.numeroDocumento}</td>
      <td>${c.nombresApellidos}</td>
    </tr>`;
    tbody.innerHTML += fila;
  });
}

function limpiarCamposClientes() {
  document.getElementById("tipoDocumento").value = "";
  document.getElementById("numeroDocumento").value = "";
  document.getElementById("nombresApellidos").value = "";
}

// --- EMPRESAS (API IMPLEMENTATION) ---

/**
 * Función central para cargar/filtrar empresas.
 * @param {string} filtro - El texto de búsqueda (RUC, Razón Social o vacío).
 */
async function cargarEmpresas(filtro = '') {
    if (!filtro && (event.type === 'input' || event.type === 'change')) {
        actualizarTablaEmpresas([]); 
        return;
    }
    
    const url = filtro ? `${API_URL_EMPRESAS}?filtro=${encodeURIComponent(filtro)}` : API_URL_EMPRESAS;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al cargar empresas");
        const empresas = await response.json();
        actualizarTablaEmpresas(empresas);
    } catch (error) {
        console.error("Error en cargarEmpresas:", error);
        actualizarTablaEmpresas([]); 
        throw error; // Propagamos el error de la recarga
    }
}

// MODIFICACIÓN: Se unifica la función de búsqueda para botón y oninput
function buscarEmpresa(filtro) {
  cargarEmpresas(filtro);
}

// REGISTRAR EMPRESA (POST)
async function registrarEmpresa() {
  const ruc = document.getElementById("ruc").value.trim();
  const razon = document.getElementById("razonSocial").value.trim();

  if (!ruc || !razon) {
    alert("Por favor, Completar todos los campos.");
    return;
  }

  if (!/^[0-9]{11}$/.test(ruc)) {
    alert("Error: RUC debe tener 11 dígitos numéricos.");
    return;
  }

  const nuevaEmpresa = {
      ruc: ruc,
      razonSocial: razon
  };

  try {
      const response = await fetch(API_URL_EMPRESAS, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevaEmpresa)
      });

      if (response.ok) {
          alert("Empresa registrada exitosamente!");
          limpiarCamposEmpresas();
          
          // La tabla no se recarga automáticamente.
          
      } else {
          const errorTexto = await response.text();
          alert(`Error al registrar empresa: ${errorTexto}`);
      }
  } catch (error) {
      console.error("Error de red en registrarEmpresa:", error);
      alert("No se pudo conectar con el servidor.");
  }
}

// ACTUALIZAR TABLA EMPRESAS (A partir de la lista recibida de la API)
function actualizarTablaEmpresas(lista) {
  const tbody = document.querySelector("#tablaEmpresas tbody");
  tbody.innerHTML = ""; // Limpiar tabla
  if (lista.length === 0) {
       // MODIFICACIÓN: Mensaje cuando no hay coincidencias
       tbody.innerHTML = '<tr><td colspan="2" style="text-align: center;">No se encontraron coincidencias.</td></tr>';
       return;
  }
  lista.forEach(e => {
    const fila = `<tr>
      <td>${e.ruc}</td>
      <td>${e.razonSocial}</td>
    </tr>`;
    tbody.innerHTML += fila;
  });
}

function limpiarCamposEmpresas() {
  document.getElementById("ruc").value = "";
  document.getElementById("razonSocial").value = "";
}

// --- NUEVO: FUNCIONALIDAD PENSIONADOS (Placeholder) ---

function buscarPensionado() {
    alert("Funcionalidad de búsqueda de pensionados (Módulo PENSIONADOS) pendiente de implementar la lógica de la API.");
    // Aquí iría la lógica para llamar al endpoint /api/asignaciones con un filtro
}

// --- FUNCIÓN ATRÁS ---
function retroceder() {
  window.location.href = 'admin.html';
}