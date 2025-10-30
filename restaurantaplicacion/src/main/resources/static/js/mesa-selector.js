/**
 * mesa-selector.js
 *
 * Maneja la selección de una mesa en la pantalla de servicio "Local"
 * y hace una llamada a la API para iniciar un nuevo registro de pedido,
 * pasando el tipo de servicio ('LOCAL') y el número de mesa.
 */

// Función principal llamada desde el onclick de cada botón de mesa en mesa.html
function selectMesa(button) {
    // 1. Obtener el número de mesa del atributo data-mesa
    const mesaNumero = button.getAttribute("data-mesa");

    // 2. Desactivar todos los botones para evitar doble click y mostrar loading
    document.querySelectorAll('.table-card').forEach(btn => btn.disabled = true);
    button.classList.add('selected'); // Opcional: marca la mesa seleccionada

    // 3. Crear el tipo de servicio
    const tipoServicio = 'LOCAL';

    // 4. Construir la URL de la API con el número de mesa
    const url = `/api/pedidos/registrar-inicio?tipoServicio=${tipoServicio}&numeroMesa=${mesaNumero}`;

    // 5. Llamada POST a la API de Spring Boot
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // NOTA: Si usas Spring Security con JWT, deberías incluir el token aquí
        }
    })
    .then(response => {
        if (!response.ok) {
            // Manejar errores HTTP (400, 500)
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(pedidoDTO => {
        // La respuesta exitosa devuelve el DTO del pedido inicial
        
        // Mostrar confirmación
        // NOTA: Aquí deberías usar una ventana modal, no un alert en un proyecto real
        alert(`¡Pedido LOCAL iniciado! Mesa N° ${mesaNumero}. ID de Pedido: ${pedidoDTO.id}`);

        // Redireccionar a la pantalla de selección de platos, pasando el ID del pedido
        window.location.href = `/seleccionar_menu.html?pedidoId=${pedidoDTO.id}&mesa=${mesaNumero}`;
    })
    .catch(error => {
        console.error('Error al iniciar el pedido:', error);
        alert('Error al iniciar el pedido. Inténtelo de nuevo.');
        // Re-habilitar botones en caso de fallo
        document.querySelectorAll('.table-card').forEach(btn => btn.disabled = false);
        button.classList.remove('selected');
    });
}
