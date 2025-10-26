/*
 * Este script maneja la lógica para "eliminar" (inactivar) un plato.
 */

const API_URL = "http://localhost:8080/api/platos";
let platosData = []; // Guardamos los platos aquí

// 1. Cargar todos los platos activos cuando la página inicia
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

        // Solo mostrar platos que están ACTIVOS (no se puede eliminar uno ya inactivo)
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

// 2. Cargar la info del plato seleccionado en el cuadro
function cargarProducto() {
    const select = document.getElementById('productSelect');
    const productoId = select.value;
    const productInfo = document.getElementById('productInfo');
    
    // Resetear confirmación
    document.getElementById('confirmacion').checked = false;
    toggleEliminarButton();
    
    if (!productoId) {
        productInfo.style.display = 'none'; // Ocultar cuadro
        return;
    }

    // Encontrar el plato en los datos guardados
    const producto = platosData.find(p => p.id == productoId);
    
    if (producto) {
        // Llenar información del producto
        document.getElementById('infoNombre').textContent = producto.nombre;
        document.getElementById('infoTipo').textContent = producto.tipo;
        document.getElementById('infoPrecio').textContent = producto.precio.toFixed(2);
        document.getElementById('infoDescripcion').textContent = producto.descripcion;
        
        productInfo.style.display = 'block'; // Mostrar cuadro
    }
}

// 3. Habilitar/deshabilitar el botón de eliminar
function toggleEliminarButton() {
    const confirmacion = document.getElementById('confirmacion').checked;
    const productoSeleccionado = document.getElementById('productSelect').value;
    const btnEliminar = document.getElementById('btnEliminar');
    
    btnEliminar.disabled = !(confirmacion && productoSeleccionado);
}

// 4. Enviar la petición de borrado a la API (DELETE)
async function eliminarProducto() {
    const productoId = document.getElementById('productSelect').value;
    
    if (!productoId) {
        alert('Por favor, seleccione un producto para eliminar.');
        return;
    }
    
    if (!document.getElementById('confirmacion').checked) {
        alert('Debe confirmar la eliminación marcando la casilla.');
        return;
    }
    
    // Encontrar el nombre para el mensaje de confirmación
    const producto = platosData.find(p => p.id == productoId);
    
    // Confirmación final
    if(confirm(`¿ESTÁ ABSOLUTAMENTE SEGURO de que desea eliminar "${producto.nombre}"?`)) {
        
        try {
            const response = await fetch(`${API_URL}/${productoId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                alert(`Producto "${producto.nombre}" ha sido marcado como INACTIVO exitosamente.`);
                
                // Limpiar formulario y recargar la lista
                document.getElementById('deleteForm').reset();
                productInfo.style.display = 'none';
                cargarPlatosEnSelect(); // Recarga la lista (el plato ya no aparecerá)
            } else {
                 const error = await response.text();
                alert(`Error al eliminar: ${error}`);
            }

        } catch (error) {
             console.error("Error de red:", error);
             alert("No se pudo conectar con el servidor.");
        }
    }
}

function cancelar() {
    if(confirm('¿Está seguro de que desea cancelar la operación?')) {
        document.getElementById('deleteForm').reset();
        document.getElementById('productInfo').style.display = 'none';
    }
}

function volverAtras() {
    window.location.href = 'menu.html';
}