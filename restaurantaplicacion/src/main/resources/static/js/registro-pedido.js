/**
 * registro-pedido.js
 * Llama a la API REAL /api/pedidos para crear un pedido inicial de Delivery.
 */

// Función llamada por el botón 'Delivery'
async function iniciarPedido(tipoServicio) {
    // 1. Ocultar botón
    const deliveryBtn = document.getElementById('btnDelivery');
    if (deliveryBtn) {
        deliveryBtn.disabled = true;
        deliveryBtn.textContent = 'Registrando...';
    }

    // 2. Crear el DTO (CrearPedidoRequest)
    // Pedimos al usuario un "código" o referencia para el delivery
    const codigoDelivery = prompt("Ingrese un código de referencia para el Delivery (ej. N° Teléfono o 'Rappi'):");
    if (!codigoDelivery) {
        alert("Se canceló el pedido.");
        deliveryBtn.disabled = false;
        deliveryBtn.textContent = 'Delivery';
        return; // No hace nada si el usuario cancela
    }

    const pedidoRequest = {
        usuarioId: 7, // <-- ¡¡CAMBIA ESTO!! Usa el ID de un usuario real (ej. tu 'adm')
        detallePlatos: [], // Se envía una lista vacía
        tipoServicio: "DELIVERY",
        infoServicio: codigoDelivery, // Guardamos la referencia
        clienteId: null,      // (Opcional)
        rucEmpresa: null      // (Opcional)
    };

    // 3. Realizar la llamada a la API
    try {
        const response = await fetch('/api/pedidos', { // Llama a la API real
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pedidoRequest) // Envía el DTO
        });

        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.statusText}`);
        }
        
        const pedidoCreado = await response.json(); // Recibe el Pedido real

        // 4. Si la API devuelve el ID del pedido exitosamente
        console.log(`Pedido iniciado con ID: ${pedidoCreado.id}`);
        alert(`¡Pedido de ${tipoServicio} registrado! ID Real: ${pedidoCreado.id}. Redirigiendo...`);
        
        // Redirigir al siguiente paso
        window.location.href = `/seleccionar_menu.html?pedidoId=${pedidoCreado.id}`;

    } catch (error) {
        // 5. Manejo de errores
        console.error('Fallo al iniciar el pedido:', error);
        alert('Error: No se pudo registrar el pedido inicial. ' + error.message);

        // 6. Restablecer el botón
        if (deliveryBtn) {
            deliveryBtn.disabled = false;
            deliveryBtn.textContent = 'Delivery';
        }
    }
}