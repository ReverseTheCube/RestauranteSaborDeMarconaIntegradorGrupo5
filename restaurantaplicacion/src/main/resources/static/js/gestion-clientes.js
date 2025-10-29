// --- CONSTANTES DE LA API ---
const API_URL_CLIENTES = "http://localhost:8080/api/clientes";
const API_URL_EMPRESAS = "http://localhost:8080/api/empresas";

// --- EVENTO PRINCIPAL: Cargar todo al iniciar ---
document.addEventListener("DOMContentLoaded", () => {
    cargarClientes();
    // No cargamos empresas por defecto para no hacer 2 llamadas, se cargan al cambiar de pestaña.
});

// --- FUNCIONALIDAD BÁSICA DEL PANEL ---
function mostrarSeccion(seccion) {
  document.getElementById("clientes").classList.add("hidden");
  document.getElementById("empresas").classList.add("hidden");
  document.getElementById("tabClientes").classList.remove("active");
  document.getElementById("tabEmpresas").classList.remove("active");

  if (seccion === "clientes") {
    document.getElementById("clientes").classList.remove("hidden");
    document.getElementById("tabClientes").classList.add("active");
    cargarClientes(); // Recargar al mostrar la sección
  } else {
    document.getElementById("empresas").classList.remove("hidden");
    document.getElementById("tabEmpresas").classList.add("active");
    cargarEmpresas(); // Recargar al mostrar la sección
  }
}

// --- CLIENTES (API IMPLEMENTATION) ---

// CARGAR CLIENTES DESDE LA API
async function cargarClientes() {
    try {
        const response = await fetch(API_URL_CLIENTES);
        if (!response.ok) throw new Error("Error al cargar clientes");
        const clientes = await response.json();
        actualizarTablaClientes(clientes);
    } catch (error) {
        console.error("Error en cargarClientes:", error);
        // Si no hay datos, muestra la tabla vacía
        actualizarTablaClientes([]); 
    }
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
          cargarClientes(); // Recargar tabla
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
      tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No hay clientes registrados.</td></tr>';
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

function buscarCliente() {
  // Nota: La funcionalidad de búsqueda real requiere un endpoint en el backend.
  alert('La búsqueda con filtros no está conectada aún a la base de datos.');
  // El código original ha sido comentado o modificado ya que no funcionaba con el nuevo modelo.
}

function limpiarCamposClientes() {
  document.getElementById("tipoDocumento").value = "";
  document.getElementById("numeroDocumento").value = "";
  document.getElementById("nombresApellidos").value = "";
}

// --- EMPRESAS (API IMPLEMENTATION) ---

// CARGAR EMPRESAS DESDE LA API
async function cargarEmpresas() {
    try {
        const response = await fetch(API_URL_EMPRESAS);
        if (!response.ok) throw new Error("Error al cargar empresas");
        const empresas = await response.json();
        actualizarTablaEmpresas(empresas);
    } catch (error) {
        console.error("Error en cargarEmpresas:", error);
        // Si no hay datos, muestra la tabla vacía
        actualizarTablaEmpresas([]); 
    }
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
          cargarEmpresas(); // Recargar tabla
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
       tbody.innerHTML = '<tr><td colspan="2" style="text-align: center;">No hay empresas registradas.</td></tr>';
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

function buscarEmpresa() {
  // Nota: La funcionalidad de búsqueda real requiere un endpoint en el backend.
  alert('La búsqueda con filtros no está conectada aún a la base de datos.');
  // El código original ha sido comentado o modificado ya que no funcionaba con el nuevo modelo.
}

function limpiarCamposEmpresas() {
  document.getElementById("ruc").value = "";
  document.getElementById("razonSocial").value = "";
}

function retroceder() {
  window.location.href = 'admin.html';
}