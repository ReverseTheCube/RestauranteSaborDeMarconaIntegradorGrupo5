// --- CONSTANTES DE LA API ---
const API_URL_CLIENTES = "http://localhost:8080/api/clientes";
const API_URL_EMPRESAS = "http://localhost:8080/api/empresas";
const API_ASIGNACIONES = "http://localhost:8080/api/asignaciones"; // API de Asignaciones

// --- EVENTO PRINCIPAL: Cargar todo al iniciar ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. INICIALIZACIÓN: La tabla de CLIENTES comienza vacía.
    actualizarTablaClientes([]); 
    
    // 2. INICIALIZACIÓN: Muestra la sección Clientes al cargar la página
    mostrarSeccion('clientes'); 
});

// --- FUNCIONALIDAD BÁSICA DEL PANEL ---
function mostrarSeccion(seccion) {
  // Oculta todas las secciones
  document.getElementById("clientes").classList.add("hidden");
  document.getElementById("empresas").classList.add("hidden");
  
  const pensionadosEl = document.getElementById("pensionados");
  if (pensionadosEl) pensionadosEl.classList.add("hidden");
  
  // Desactiva todas las pestañas
  document.getElementById("tabClientes").classList.remove("active");
  document.getElementById("tabEmpresas").classList.remove("active");
  
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
  } else if (seccion === "pensionados") { // Lógica para Pensionados
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
async function cargarClientes(numeroDocumentoBusqueda) {
    if (!numeroDocumentoBusqueda || numeroDocumentoBusqueda.trim() === '') {
         actualizarTablaClientes([]);
         return;
    }
    
    try {
        const params = new URLSearchParams();
        params.append('filtro', numeroDocumentoBusqueda.trim());
        
        const response = await fetch(`${API_URL_CLIENTES}?${params.toString()}`);
        if (!response.ok) throw new Error(`Error ${response.status} al cargar clientes`);
        const clientes = await response.json();
        
        if (clientes.length === 0) {
             alert(`No se encontró ningún cliente con documento: ${numeroDocumentoBusqueda.trim()}`);
        }
        
        actualizarTablaClientes(clientes);
    } catch (error) {
        console.error("Error en cargarClientes:", error);
        alert(`Error al cargar clientes: ${error.message}`);
        actualizarTablaClientes([]); 
    }
}

function buscarCliente() {
  const numBusqueda = document.getElementById("buscarCliente").value.trim();
  
  if (numBusqueda.length === 0) {
      alert("Por favor, ingrese un número de documento para buscar.");
      actualizarTablaClientes([]); 
      return;
  }
  
  cargarClientes(numBusqueda);
}


async function registrarCliente() {
  const tipo = document.getElementById("tipoDocumento").value;
  const numero = document.getElementById("numeroDocumento").value.trim();
  const nombre = document.getElementById("nombresApellidos").value.trim();

  if (!tipo || !numero || !nombre) {
    alert("Por favor, Complete todos los campos.");
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
          cargarClientes(numero); 
      } else {
          const errorTexto = await response.text();
          alert(`Error al registrar cliente: ${errorTexto}`);
      }
  } catch (error) {
      console.error("Error de red en registrarCliente:", error);
      alert("No se pudo conectar con el servidor.");
  }
}

function actualizarTablaClientes(lista) {
  const tbody = document.querySelector("#tablaClientes tbody");
  tbody.innerHTML = ""; 
  if (lista.length === 0) {
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
async function cargarEmpresas(filtro = '') {
    const url = filtro ? `${API_URL_EMPRESAS}?filtro=${encodeURIComponent(filtro)}` : API_URL_EMPRESAS;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al cargar empresas");
        const empresas = await response.json();
        actualizarTablaEmpresas(empresas);
    } catch (error) {
        console.error("Error en cargarEmpresas:", error);
        alert(`Error al cargar empresas: ${error.message}`);
        actualizarTablaEmpresas([]); 
    }
}

function buscarEmpresa() {
  const filtro = document.getElementById("buscarEmpresa").value.trim();
  cargarEmpresas(filtro);
}

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

function actualizarTablaEmpresas(lista) {
  const tbody = document.querySelector("#tablaEmpresas tbody");
  tbody.innerHTML = ""; 
  if (lista.length === 0) {
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

// --- FUNCIÓN MODIFICADA: Ahora solo maneja el AJUSTE TOTAL (✏️) ---
async function ajustarSaldo(asignacionId, tipo) {
    if (tipo !== 1) { // Solo procesamos el tipo 1 (Edición/Establecer Saldo)
        return; 
    }

    let montoString = prompt(`Ingrese el NUEVO SALDO TOTAL:`);
    
    if (montoString === null || montoString.trim() === '') return;
    
    const montoTotal = parseFloat(montoString);
    if (isNaN(montoTotal) || montoTotal < 0) {
        alert("Monto inválido. Debe ser un número no negativo.");
        return;
    }

    const endpointUrl = `${API_ASIGNACIONES}/${asignacionId}/saldo-total`; 
    const requestData = { montoAjuste: montoTotal }; 
    
    try {
        const response = await fetch(endpointUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData),
        });

        if (response.ok) {
            alert(`Saldo actualizado exitosamente. Nuevo Saldo: S/ ${montoTotal.toFixed(2)}`);
            await buscarPensionado(); // Re-ejecutar la búsqueda para actualizar la tabla
        } else {
            const errorText = await response.text();
            alert(`Error al ajustar saldo: ${errorText}`);
        }
        
    } catch (error) {
        console.error("Error de red o servidor al ajustar saldo:", error);
        alert("No se pudo conectar con el servidor para actualizar el saldo.");
    }
}

// FUNCIÓN NUEVA: Confirma y ejecuta el DELETE de la asignación (Botón 🗑️)
async function confirmarEliminarAsignacion(asignacionId) {
    if (!confirm(`¿Está seguro de que desea ELIMINAR la Asignación.`)) {
        return;
    }
    
    try {
        // Llama al endpoint DELETE /api/asignaciones/{id}
        const response = await fetch(`${API_ASIGNACIONES}/${asignacionId}`, {
            method: "DELETE", 
        });

        if (response.status === 204) { // 204 No Content (Éxito en DELETE)
            alert(`Asignación eliminada exitosamente.`);
            await buscarPensionado();
        } else if (response.status === 404) {
            alert("Error: La asignación no fue encontrada en el servidor.");
        } else {
            const errorText = await response.text();
            alert(`Error al eliminar: ${response.status} - ${errorText}`);
        }
        
    } catch (error) {
        console.error("Error de red o servidor al eliminar asignación:", error);
        alert("No se pudo conectar con el servidor para eliminar la asignación.");
    }
}


// Función principal de búsqueda de pensionados (MODIFICADA: AHORA BUSCA POR DNI)
async function buscarPensionado() {
    const input = document.getElementById('buscarPensionado');
    const dni = input.value.trim(); // Cambiado de 'ruc' a 'dni'

    // 1. Validación (Ahora 8 dígitos numéricos para DNI)
    const dniRegex = /^\d{8}$/; // DNI validation (asumiendo 8 dígitos)
    if (!dniRegex.test(dni)) {
        alert("Datos incorrectos. Debe ingresar exactamente 8 dígitos numéricos (DNI).");
        actualizarTablaPensionados([]);
        return;
    }

    try {
        // 2. Búsqueda por DNI (Endpoint modificado: /api/asignaciones/buscar?dni={dni})
        const urlBusqueda = `${API_ASIGNACIONES}/buscar?dni=${dni}`; 
        
        const response = await fetch(urlBusqueda);
        const asignaciones = await response.json(); 

        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.status}`);
        }
        
        // El resultado siempre será una lista de 0 o 1 asignación, ya que el DNI es único.
        if (asignaciones.length === 0) {
             alert(`Cliente con DNI ${dni} no encontrado o no tiene asignación de pensión.`); // Mensaje ajustado
             actualizarTablaPensionados([]);
             return;
        }

        // 4. Mostrar datos en la tabla
        actualizarTablaPensionados(asignaciones);

    } catch (error) {
        console.error("Error buscando asignaciones:", error);
        alert(`Error de red o servidor al buscar asignaciones: ${error.message}`);
        actualizarTablaPensionados([]);
    }
}


// Función auxiliar para dibujar la tabla de asignaciones (CON ICONOS ✏️ y 🗑️)
function actualizarTablaPensionados(lista) {
    const tbody = document.querySelector("#tablaPensionados tbody");
    tbody.innerHTML = "";
    
    if (!lista || lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No se encontraron asignaciones para este RUC.</td></tr>';
        return;
    }
    
    lista.forEach(asignacion => {
        const clienteInfo = `${asignacion.cliente.nombresApellidos} (${asignacion.cliente.numeroDocumento})`;
        const saldoFormateado = `S/. ${asignacion.saldo.toFixed(2)}`;
        
        const fila = `
            <tr>
                <td>${asignacion.id}</td>
                <td>${asignacion.empresa.ruc}</td>
                <td>${clienteInfo}</td>
                <td>${saldoFormateado}</td>
                <td>
                    <button class="icon-button" style="background-color: #2ecc71; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; margin-right: 5px; font-weight: bold;" onclick="ajustarSaldo(${asignacion.id}, 1)">✏️</button>
                    
                    <button class="icon-button" style="background-color: #e74c3c; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-weight: bold;" onclick="confirmarEliminarAsignacion(${asignacion.id})">🗑️</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += fila;
    });
}

function retroceder() {
    // 1. Recuperamos el rol guardado en el Login
    const rolUsuario = localStorage.getItem('usuarioRol');

    // 2. Decidimos a dónde ir según el rol
    if (rolUsuario === 'ADMINISTRADOR') {
        window.location.href = '/admin.html';
    } else if (rolUsuario === 'CAJERO') {
        window.location.href = '/cajero.html';
    } else {
        // Por si acaso no hay rol o es otro, lo mandamos al login
        // o a una página por defecto segura.
        console.warn("Rol no reconocido o no logueado, redirigiendo al inicio.");
        window.location.href = '/'; 
    }
}