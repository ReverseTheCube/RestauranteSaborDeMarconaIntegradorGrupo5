let platosList = [];
let pedidoInfo = {};


document.addEventListener('DOMContentLoaded', () => {
    obtenerInfoPedido();
    fetchYcargarMenu();
});


function obtenerInfoPedido() {
    const params = new URLSearchParams(window.location.search);
    const pedidoId = params.get("pedidoId");
    const mesaNro = params.get("mesa");
    const deliveryId = params.get("deliveryId"); // Asumiendo que delivery pasa esto

    const tituloEl = document.getElementById("mesa-titulo");
    
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
    
    fetch('/api/platos') 
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar platos. Status: ' + response.status);
            }
            return response.json();
        })
        .then(platos => {
            platosList = platos;
            cargarMenu(platos); 
        })
        .catch(error => {
            console.error("Error en fetchYcargarMenu:", error);
            menuContainer.innerHTML = '<div class="error">No se pudieron cargar los platos.</div>';
        });
}


function cargarMenu(platos) {
    const menuContainer = document.getElementById('menu');
    menuContainer.innerHTML = ''; // Limpia el "Cargando..."

    if (!platos || platos.length === 0) {
        menuContainer.innerHTML = '<div class="error">No hay platos disponibles.</div>';
        return;
    }

    platos.forEach(plato => {
        // Añadimos 'data-id' para saber qué plato es
        const itemHTML = `
          <div class="menu-item" data-id="${plato.id}">
            <div class="item-name">${plato.nombre} </div>
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
        
    if (delta === -1 && currentQty > 0) {
        qtyElement.textContent = currentQty - 1;
    } else if (delta === 1) {
        qtyElement.textContent = currentQty + 1;
    }
}

function confirmarPedido() {
    let platosSeleccionados = [];
    
    platosList.forEach(plato => {
        const qtyElement = document.getElementById(`qty-${plato.id}`);
        if (qtyElement) { 
            const cantidad = parseInt(qtyElement.textContent);
        
        if (cantidad > 0) {
            platosSeleccionados.push({
                platoId: plato.id,
                nombre: plato.nombre,
                tipo: plato.tipo,
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

    // Guardamos los platos seleccionados y la info del pedido
    localStorage.setItem('detallePedido', JSON.stringify(platosSeleccionados));
    localStorage.setItem('infoPedido', JSON.stringify(pedidoInfo));
    window.location.href = 'resumen_pedido.html';
}
