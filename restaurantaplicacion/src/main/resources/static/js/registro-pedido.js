// Función para iniciar el proceso de pedido y llamar a la API
function iniciarPedido(tipoServicio) {
    // 1. Ocultar el botón para evitar clics múltiples y mostrar feedback
    const deliveryBtn = document.getElementById('btnDelivery');
    if (deliveryBtn) {
        deliveryBtn.disabled = true;
        deliveryBtn.textContent = 'Registrando...';
    }

    // 2. Realizar la llamada a la API
    // Usamos el tipoServicio (DELIVERY) como parámetro de consulta
    fetch(`/api/pedidos/registrar-inicio?tipoServicio=${tipoServicio}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Si el proyecto usa autenticación (JWT o Basic), se añadiría aquí.
        }
    })
    .then(response => {
        // Manejar errores HTTP (4xx o 5xx)
        if (!response.ok) {
            // Lanza el error para que vaya al bloque .catch
            throw new Error(`Error en el servidor: ${response.statusText} (${response.status})`);
        }
        // Espera que la respuesta sea el ID del pedido
        return response.json();
    })
    .then(pedidoId => {
        // 3. Si la API devuelve el ID del pedido exitosamente
        console.log(`Pedido iniciado con ID: ${pedidoId}`);
        // Muestra el ID y redirige
        alert(`¡Pedido de ${tipoServicio} registrado! ID: ${pedidoId}. Redirigiendo...`);
        
        // Redirigir al siguiente paso (ej: seleccionar platos)
        // Nota: Asegúrate de crear el archivo seleccionar-platos.html
        window.location.href = `/seleccionar-platos.html?pedidoId=${pedidoId}`;

    })
    .catch(error => {
        // 4. Manejo de errores de red o del servidor
        console.error('Fallo al iniciar el pedido:', error);
        alert('Error: No se pudo registrar el pedido inicial. Revisa la consola (F12) para más detalles.');

        // 5. Restablecer el botón
        if (deliveryBtn) {
            deliveryBtn.disabled = false;
            deliveryBtn.textContent = 'Delivery';
        }
    });
}