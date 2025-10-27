/*
 * Este script maneja la lógica para editar un plato existente.
 */

const API_URL = "http://localhost:8080/api/platos";
let platosData = []; // Guardamos los platos aquí

// 1. Cargar todos los platos cuando la página inicia
document.addEventListener("DOMContentLoaded", () => {
    cargarPlatosEnSelect();
});

async function cargarPlatosEnSelect() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Error al cargar platos");

        const platos = await response.json();
        platosData = platos; // Guardar datos globalmente

        const select = document.getElementById('productSelect');
        select.innerHTML = '<option value="">-- Seleccione un producto --</option>'; // Limpiar

        // Solo mostrar platos que están ACTIVOS
        platos.filter(plato => plato.activo).forEach(plato => {
            const option = document.createElement('option');
            option.value = plato.id;
            option.textContent = plato.nombre;
            select.appendChild(option);
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

// 2. Cargar los datos del plato seleccionado en el formulario
function cargarProducto() {
    const select = document.getElementById('productSelect');
    const productoId = select.value;

    // Limpiar formulario si no hay selección
    if (!productoId) {
        document.getElementById('editForm').reset();
        return;
    }

    // Encontrar el plato en los datos guardados
    const producto = platosData.find(p => p.id == productoId);

    if (producto) {
        // Llenar los campos con los datos del producto
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('descripcion').value = producto.descripcion;
        document.getElementById('precio').value = producto.precio;
        // El tipo (radio button 'principal') ya está 'checked' en el HTML
    }
}

// 3. Enviar los cambios a la API (PUT)
async function actualizarProducto() {
    const productoId = document.getElementById('productSelect').value;

    if (!productoId) {
        alert('Por favor, seleccione un producto para editar.');
        return;
    }

    // Obtener datos del formulario
    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
    const precio = document.getElementById('precio').value;
    const tipo = document.getElementById('principal').value;

    if (!nombre || !descripcion || !precio) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    // Crear el objeto DTO (PlatoRequest)
    const platoActualizado = {
        nombre: nombre,
        descripcion: descripcion,
        precio: parseFloat(precio),
        tipo: tipo
    };

    try {
        const response = await fetch(`${API_URL}/${productoId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(platoActualizado)
        });

        if (response.ok) {
            alert(`Producto "${nombre}" actualizado exitosamente!`);
            // Recargar la lista y limpiar el formulario
            document.getElementById('editForm').reset();
            cargarPlatosEnSelect();
        } else {
            const error = await response.text();
            alert(`Error al actualizar: ${error}`);
        }

    } catch (error) {
        console.error("Error de red:", error);
        alert("No se pudo conectar con el servidor.");
    }
}

function cancelar() {
    if(confirm('¿Está seguro de que desea cancelar? Se perderán los cambios no guardados.')) {
        document.getElementById('editForm').reset();
    }
}

function volverAtras() {
    window.location.href = 'menu.html';
}