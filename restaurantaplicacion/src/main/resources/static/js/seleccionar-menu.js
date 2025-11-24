/**
 * seleccionar-menu.js
 * Lógica final para la pantalla de selección de menú.
 */

let platosList = [];
let pedidoInfo = {}; 

// --- CONSTANTES DE LA API ---
const API_URL_PLATOS = "/api/platos";
// -----------------------------

document.addEventListener('DOMContentLoaded', () => {
    obtenerInfoPedido();
    fetchYcargarMenu();
});


function obtenerInfoPedido() {
    const params = new URLSearchParams(window.location.search);
    const pedidoId = params.get("pedidoId");
    const mesaNro = params.get("mesa");
    const deliveryId = params.get("deliveryId"); 

    const tituloEl = document.getElementById("mesa-titulo");
    
    // Almacenar el contexto del pedido para pasarlo al resumen
    if (mesaNro) {
        tituloEl.innerText = `Mesa N° ${mesaNro}`;
        pedidoInfo = { pedidoId: pedidoId, mesa: mesaNro, tipo: 'LOCAL' };
    } else if (deliveryId) {
        tituloEl.innerText = `Delivery Pedido N° ${deliveryId}`;
        pedidoInfo = { pedidoId: deliveryId, tipo: 'DELIVERY' };
    } else {
        tituloEl.innerText = "Seleccione Pedido";
    }
}

function fetchYcargarMenu() {
    const menuContainer = document.getElementById('menu');
    menuContainer.innerHTML = '<div class="loading">Cargando Platos...</div>';
    
    fetch(API_URL_PLATOS) 
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar platos. Status: ' + response.status);
            }
            return response.json();
        })
        .then(platos => {
            platosList = platos.filter(p => p.activo);
            cargarMenu(platosList); 
        })
        .catch(error => {
            console.error("Error en fetchYcargarMenu:", error);
            menuContainer.innerHTML = '<div class="error">No se pudieron cargar los platos.</div>';
        });
}


function cargarMenu(platos) {
    const menuContainer = document.getElementById('menu');
    menuContainer.innerHTML = ''; 

    if (!platos || platos.length === 0) {
        menuContainer.innerHTML = '<div class="error">No hay platos disponibles o activos.</div>';
        return;
    }

    platos.forEach(plato => {
        const itemHTML = `
            <div class="menu-item" data-id="${plato.id}">
              <div class="item-name">${plato.nombre} (S/ ${plato.precio.toFixed(2)})</div>
              <div class="item-qty">
                <button class="btn-qty" onclick="updateQuantity(${plato.id}, -1)">-</button>
                <span id="qty-${plato.id}">0</span>
                <button class="btn-qty" onclick="updateQuantity(${plato.id}, 1)">+</button>
              </div>
            </div>
        `;
        menuContainer.innerHTML += itemHTML;
    });
}

function updateQuantity(platoId, delta) {
    const qtyElement = document.getElementById(`qty-${platoId}`);
    let currentQty = parseInt(qtyElement.textContent);
    
    let newQty;
    if (delta === -1 && currentQty > 0) {
        newQty = currentQty - 1;
    } else if (delta === 1) {
        newQty = currentQty + 1;
    } else {
        return;
    }
    qtyElement.textContent = newQty;
}

function confirmarPedido() {
    let platosSeleccionados = [];
    
    platosList.forEach(plato => {
        const qtyElement = document.getElementById(`qty-${plato.id}`);
        if (qtyElement) { 
            // LECTURA ROBUSTA DE LA CANTIDAD: 
            const cantidad = parseInt(qtyElement.textContent.trim()); 
            
            if (cantidad > 0) {
                platosSeleccionados.push({
                    platoId: plato.id,
                    nombre: plato.nombre,
                    precioUnitario: plato.precio,
                    cantidad: cantidad,
                    subtotal: plato.precio * cantidad
                });
            }
        }
    });

    if (platosSeleccionados.length === 0) {
        alert("Por favor, seleccione al menos un plato.");
        return;
    }

    // --- GUARDADO DE DATOS EN LOCAL STORAGE Y REDIRECCIÓN ---
    localStorage.setItem('detallePedido', JSON.stringify(platosSeleccionados));
    localStorage.setItem('infoPedido', JSON.stringify(pedidoInfo));
    
    // Redirigir al resumen
    window.location.href = 'resumen_pedido.html';
}