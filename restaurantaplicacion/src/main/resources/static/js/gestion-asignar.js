// --- URLs DE LAS APIS ---
const API_EMPRESAS = "http://localhost:8080/api/empresas";
const API_CLIENTES = "http://localhost:8080/api/clientes"; // MODIFICADO: Apunta a la API de Clientes

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
            option.value = empresa.ruc; // El valor será el RUC
            option.textContent = `${empresa.razonSocial} (${empresa.ruc})`; // Muestra Razón Social y RUC
            selectRuc.appendChild(option);
        });

        // 2. Cargar CLIENTES (para Trabajador/Pensionista) - BLOQUE MODIFICADO
        const responseClientes = await fetch(API_CLIENTES); // Llama a la API de clientes
        if (!responseClientes.ok) throw new Error('Error al cargar clientes');
        const clientes = await responseClientes.json();
        
        const selectTrabajador = document.getElementById('trabajador');
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id; // El valor será el ID del cliente
            option.textContent = cliente.nombresApellidos; // Muestra solo nombres y apellidos
            selectTrabajador.appendChild(option);
        });

    } catch (error) {
        console.error("Error cargando datos para selects:", error);
        alert("No se pudieron cargar las listas de empresas o clientes. " + error.message);
    }
}

// --- Funciones existentes ---

function cerrarVentana() {
  if (confirm("¿Desea cerrar la ventana?")) {
    window.close(); // Cierra la ventana emergente
  }
}

function guardarDatos() {
  const ruc = document.getElementById("ruc").value;
  // Ahora es un ID de cliente (pensionista)
  const clienteId = document.getElementById("trabajador").value; 
  const saldo = document.getElementById("saldo").value;

  if (!ruc || !clienteId || !saldo) {
    alert("Por favor complete todos los campos.");
    return;
  }

  // Aquí iría la lógica para guardar los datos, por ejemplo, una llamada a una API.  
  alert(`Datos guardados (simulado):\n\nRUC: ${ruc}\nCliente ID: ${clienteId}\nSaldo: ${saldo}`);
}