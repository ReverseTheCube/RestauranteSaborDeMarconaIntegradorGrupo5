/*
 * Este script maneja la lógica para crear un nuevo plato.
 */

// URL de la API de Platos
const API_URL = "http://localhost:8080/api/platos";

async function crearProducto() {
    // 1. Obtener los datos del formulario
    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
    const precio = document.getElementById('precio').value;
    const tipo = document.getElementById('principal').value; // 'PRINCIPAL'

    // 2. Validar que los campos no estén vacíos
    if (!nombre || !descripcion || !precio) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
    }

    // 3. Crear el objeto (DTO - PlatoRequest)
    const nuevoPlato = {
        nombre: nombre,
        descripcion: descripcion,
        precio: parseFloat(precio),
        tipo: tipo
    };

    try {
        // 4. Enviar la petición a la API (POST)
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevoPlato)
        });

        // 5. Manejar la respuesta
        if (response.ok) {
            alert(`Producto "${nombre}" creado exitosamente!`);
            // Limpiar formulario después de crear
            document.getElementById('productForm').reset();
        } else {
            const error = await response.text();
            alert(`Error al crear el producto: ${error}`);
        }

    } catch (error) {
        console.error("Error de red:", error);
        alert("No se pudo conectar con el servidor.");
    }
}

function cancelar() {
    if(confirm('¿Está seguro de que desea cancelar? Se perderán los datos no guardados.')) {
        document.getElementById('productForm').reset();
    }
}

function volverAtras() {
    // Vuelve a la página de navegación del menú
    window.location.href = 'menu.html';
}