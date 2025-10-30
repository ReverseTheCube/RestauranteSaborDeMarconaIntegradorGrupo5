// --- URLs DE LAS APIS ---
const API_EMPRESAS = "http://localhost:8080/api/empresas";
const API_USUARIOS = "http://localhost:8080/api/usuarios";

// --- Se ejecuta cuando el HTML termina de cargar ---
document.addEventListener('DOMContentLoaded', () => {
    cargarDatosSelects();
});

// --- FUNCIÓN NUEVA: Carga Empresas y Trabajadores en los <select> ---
async function cargarDatosSelects() {
    try {
        // Cargar Empresas (para el RUC)
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

        // Cargar Usuarios (para Trabajador)
        const responseUsuarios = await fetch(API_USUARIOS);
        if (!responseUsuarios.ok) throw new Error('Error al cargar usuarios');
        const usuarios = await responseUsuarios.json();
        
        const selectTrabajador = document.getElementById('trabajador');
        usuarios.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.id; // El valor será el ID del usuario
            option.textContent = `${usuario.usuario} (${usuario.rol})`; // Muestra nombre y Rol
            selectTrabajador.appendChild(option);
        });

    } catch (error) {
        console.error("Error cargando datos para selects:", error);
        alert("No se pudieron cargar las listas de empresas o trabajadores. " + error.message);
    }
}

// --- Funciones existentes ---

function cerrarVentana() {
  if (confirm("¿Desea cerrar la ventana?")) {
    window.close(); // Cierra la ventana emergente
    // Si no es emergente, puedes redirigir:
    // window.location.href = 'gestion-cliente.html'; 
  }
}

function guardarDatos() {
  const ruc = document.getElementById("ruc").value;
  const trabajadorId = document.getElementById("trabajador").value;
  const saldo = document.getElementById("saldo").value;

  if (!ruc || !trabajadorId || !saldo) {
    alert("Por favor complete todos los campos.");
    return;
  }

  // Aquí iría la lógica para guardar los datos, por ejemplo, una llamada a una API.  
  alert(`Datos guardados (simulado):\n\nRUC: ${ruc}\nTrabajador ID: ${trabajadorId}\nSaldo: ${saldo}`);
}