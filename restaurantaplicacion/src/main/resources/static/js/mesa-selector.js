/**
 * mesa-selector.js
 * Llama a la API REAL /api/pedidos para crear un pedido inicial.
 */

// Función principal llamada desde el onclick de cada botón de mesa
async function selectMesa(button) {
    // 1. Obtener el número de mesa
    const mesaNumero = button.getAttribute("data-mesa");

    // 2. Desactivar botones
    document.querySelectorAll('.table-card').forEach(btn => btn.disabled = true);
    button.classList.add('selected');

    // 3. Crear el DTO (CrearPedidoRequest) para el backend
    // ¡¡IMPORTANTE!! Debes decidir CÓMO obtener el usuarioId, clienteId y rucEmpresa
    // Por ahora, usamos un ID de usuario fijo (ej. 7) y el resto nulos.
    const pedidoRequest = {
        usuarioId: 7, // <-- ¡¡CAMBIA ESTO!! Usa el ID de un usuario real (ej. tu 'adm')
        detallePlatos: [], // Se envía una lista vacía
        tipoServicio: "LOCAL",
        infoServicio: mesaNumero, // Guardamos el N° de Mesa
        clienteId: null,      // (Opcional: podrías añadir un <select> para cliente aquí)
        rucEmpresa: null      // (Opcional)
    };

    // 4. Llamada POST a la API de Spring Boot
    try {
        // Usamos la URL base /api/pedidos (la real, no la simulada)
        const response = await fetch('/api/pedidos', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedidoRequest) // Envía el DTO completo
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const pedidoCreado = await response.json(); // Recibe el Pedido REAL creado

        // 5. Éxito
        alert(`¡Pedido LOCAL iniciado! Mesa N° ${mesaNumero}. ID Real: ${pedidoCreado.id}`);

        // Redireccionar a la pantalla de selección de platos
        // (Asegúrate que se llame seleccionar_menu.html)
        window.location.href = `/seleccionar_menu.html?pedidoId=${pedidoCreado.id}&mesa=${mesaNumero}`;

    } catch (error) {
        console.error('Error al iniciar el pedido:', error);
        alert('Error al iniciar el pedido. Inténtelo de nuevo.');
        // Re-habilitar botones
        document.querySelectorAll('.table-card').forEach(btn => btn.disabled = false);
        button.classList.remove('selected');
    }
}