// --- URLs DE LAS APIS ---
const API_EMPRESAS = "http://localhost:8080/api/empresas";
const API_CLIENTES = "http://localhost:8080/api/clientes"; 
const API_ASIGNACIONES = "http://localhost:8080/api/asignaciones"; // NUEVO ENDPOINT

// --- Se ejecuta cuando el HTML termina de cargar ---
document.addEventListener('DOMContentLoaded', () => {
    cargarDatosSelects();
});

// --- FUNCIÓN: Carga Empresas y Clientes en los <select> ---
async function cargarDatosSelects() {
    try {
        // 1. Cargar Empresas (para el RUC)
        const responseEmpresas = await fetch(API_EMPRESAS);
        if (!responseEmpresas.ok) throw new Error('Error al cargar empresas');
        const empresas = await responseEmpresas.json();
        
        const selectRuc = document.getElementById('ruc');
        empresas.forEach(empresa => {
            const option = document.createElement('option');
            option.value = empresa.ruc; 
            option.textContent = `${empresa.razonSocial} (${empresa.ruc})`; 
            selectRuc.appendChild(option);
        });

        // 2. Cargar CLIENTES (Pensionistas)
        const responseClientes = await fetch(API_CLIENTES);
        if (!responseClientes.ok) throw new Error('Error al cargar clientes');
        const clientes = await responseClientes.json();
        
        const selectTrabajador = document.getElementById('trabajador');
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id; 
            
            // Muestra Nombres y Apellidos (Número de Documento)
            option.textContent = `${cliente.nombresApellidos} (${cliente.numeroDocumento})`; 
            
            selectTrabajador.appendChild(option);
        });

    } catch (error) {
        console.error("Error cargando datos para selects:", error);
        alert("No se pudieron cargar las listas de empresas o clientes. " + error.message);
    }
}

// --- FUNCIÓN CERRAR (Regresa a gestión-cliente.html) ---
function cerrarVentana() {
  if (confirm("¿Desea regresar a la gestión de clientes y empresas?")) {
    window.location.href = 'gestion-cliente.html'; 
  }
}

// --- FUNCIÓN GUARDAR (Almacena en la BD) ---
async function guardarDatos() {
  const ruc = document.getElementById("ruc").value;
  const clienteId = document.getElementById("trabajador").value; 
  const saldo = document.getElementById("saldo").value;

  if (!ruc || !clienteId || !saldo) {
    alert("Por favor complete todos los campos.");
    return;
  }
  
  // 1. Crear el DTO (AsignacionRequest)
  const asignacionRequest = {
    rucEmpresa: ruc,
    clienteId: parseInt(clienteId), 
    saldo: parseFloat(saldo)
  };
  
  // 2. Llamada POST a la nueva API
  try {
    const response = await fetch(API_ASIGNACIONES, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(asignacionRequest),
    });

    if (response.ok) {
      alert("¡Asignación de pensión guardada exitosamente!");
      // Redirigir a la página principal después de guardar
      window.location.href = 'gestion-cliente.html';
    } else {
      const errorText = await response.text();
      alert(`Error al guardar la asignación: ${errorText}`);
    }
  } catch (error) {
    console.error("Error de red al guardar asignación:", error);
    alert("No se pudo conectar con el servidor para guardar los datos.");
  }
}