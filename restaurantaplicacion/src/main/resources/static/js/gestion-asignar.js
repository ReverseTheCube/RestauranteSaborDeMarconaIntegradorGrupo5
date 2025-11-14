// --- URLs DE LAS APIS ---
const API_EMPRESAS = "http://localhost:8080/api/empresas";
const API_CLIENTES = "http://localhost:8080/api/clientes"; 

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

// --- FUNCIÓN MODIFICADA: Redirige a gestion-cliente.html ---
function cerrarVentana() {
    // MODIFICACIÓN CLAVE: Redirige a la página principal de gestión
    window.location.href = 'gestion-cliente.html'; 
}

function guardarDatos() {
  const ruc = document.getElementById("ruc").value;
  // clienteId ahora representa el ID del cliente (pensionista)
  const clienteId = document.getElementById("trabajador").value; 
  const saldo = document.getElementById("saldo").value;

  if (!ruc || !clienteId || !saldo) {
    alert("Por favor complete todos los campos.");
    return;
  }

  // Lógica de guardado simulada
  alert(`Datos guardados (simulado):\n\nRUC: ${ruc}\nCliente ID: ${clienteId}\nSaldo: ${saldo}`);
}