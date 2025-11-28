/**
 * registro-pedido.js
 * Gestiona el inicio de pedidos (especialmente Delivery).
 */

async function iniciarPedido(tipoServicio) {
    const deliveryBtn = document.getElementById('btnDelivery');
    
    // 1. OBTENER ID DEL USUARIO LOGUEADO (CORREGIDO)
    const usuarioId = localStorage.getItem('usuarioId');

    if (!usuarioId) {
        alert("Error de sesión: No se identificó al usuario. Por favor, inicie sesión nuevamente.");
        window.location.href = "index.html";
        return;
    }

    if (deliveryBtn) {
        deliveryBtn.disabled = true;
        deliveryBtn.textContent = 'Procesando...';
    }

    // 2. Pedir referencia para Delivery
    const codigoDelivery = prompt("Ingrese referencia para el Delivery (Nombre Cliente / Teléfono):");
    if (!codigoDelivery) {
        if (deliveryBtn) {
            deliveryBtn.disabled = false;
            deliveryBtn.textContent = '🛵 DELIVERY';
        }
        return;
    }

    // 3. Crear el objeto DTO
    const pedidoRequest = {
        usuarioId: parseInt(usuarioId), // Usamos el ID real de localStorage
        detallePlatos: [], 
        tipoServicio: "DELIVERY",
        infoServicio: codigoDelivery,
        clienteId: null,
        rucEmpresa: null
    };

    try {
        const response = await fetch('/api/pedidos', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedidoRequest)
        });

        if (!response.ok) {
            throw new Error(`Error servidor: ${response.statusText}`);
        }
        
        const pedidoCreado = await response.json();

        // 4. Redirigir al menú para agregar platos
        // Pasamos el ID del pedido y el ID del delivery en la URL
        window.location.href = `/seleccionar_menu.html?pedidoId=${pedidoCreado.id}&deliveryId=${pedidoCreado.id}`;

    } catch (error) {
        console.error('Fallo al iniciar:', error);
        alert('Error al crear el pedido: ' + error.message);
        
        if (deliveryBtn) {
            deliveryBtn.disabled = false;
            deliveryBtn.textContent = '🛵 DELIVERY';
        }
    }
}