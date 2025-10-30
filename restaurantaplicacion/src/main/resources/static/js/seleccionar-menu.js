

let platosList = []; // Almacenará los platos de la BD (reemplaza la data simulada)

// NUEVA FUNCIÓN para llamar a la API y cargar los platos
async function fetchYcargarMenu() {
    try {
        // 1. Llamamos al endpoint del backend que obtendrá los platos
        // (Esto coincide con tu PlatoController @GetMapping("/api/platos"))
        const response = await fetch('/api/platos'); 
        
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: No se pudo cargar el menú.`);
        }
        
        platosList = await response.json(); // 2. Guardar en la variable global
        
        console.log("Platos cargados desde la BD:", platosList);

        // 3. Ahora llamamos a cargarMenu (que usará platosList)
        cargarMenu(); 

    } catch (error) {
        console.error('Error fetching platos:', error);
        alert('Error al cargar el menú desde la base de datos.');
    }
}


// Función para cargar el menú (MODIFICADA - ya no recibe data simulada)
function cargarMenu() {
  const menuContainer = document.getElementById('menu');
  if (!menuContainer) return;

  menuContainer.innerHTML = ''; // Limpiamos el contenedor por si acaso

  // 4. Usamos la lista global 'platosList'
  platosList.forEach((item, index) => {
    // Usamos las propiedades del Modelo (ej: item.nombre, item.activo)
    // Solo mostramos platos activos
    if (item.activo) {
        const itemHTML = `
          <div class="menu-item">
            <div class="item-name">${index + 1}. ${item.nombre}</div>
            <div class="item-qty">
              <button class="btn-qty" onclick="updateQuantity(${index}, -1)">-</button>
              <span id="qty-${index}">0</span>
      	  <button class="btn-qty" onclick="updateQuantity(${index}, 1)">+</button>
            </div>
          </div>
        `;
        menuContainer.innerHTML += itemHTML;
    }
  });
}

// Función para actualizar la cantidad de productos seleccionados (MODIFICADA)
function updateQuantity(index, delta) {
  const qtyElement = document.getElementById(`qty-${index}`);
  const currentQty = parseInt(qtyElement.textContent);

  // 5. Usamos la lista global 'platosList' y su propiedad 'stock' (si existe)
  // Tu modelo Plato.java no tiene 'stock', así que usaremos un límite alto (ej. 99)
  const stockDisponible = platosList[index].stock || 99; 

  if (delta === 1 && currentQty < stockDisponible) {
    qtyElement.textContent = currentQty + 1;
  } else if (delta === -1 && currentQty > 0) {
    qtyElement.textContent = currentQty - 1;
  }
}

// Función para confirmar el pedido (MODIFICADA)
function confirmarPedido() {
  
  // 1. Recolectar los datos seleccionados
  const pedidoDetalles = [];
  platosList.forEach((plato, index) => {
      // Asegurarse de que el elemento exista antes de leerlo
      const qtyElement = document.getElementById(`qty-${index}`);
      if (!qtyElement) return; 

      const cantidad = parseInt(qtyElement.textContent);
      
      if (cantidad > 0) {
          // 6. Usamos el 'id' real del plato de la BD
          pedidoDetalles.push({
              platoId: plato.id, 
              cantidad: cantidad
          });
      }
  });

  if (pedidoDetalles.length === 0) {
      alert("Por favor, selecciona al menos un plato.");
      return;
  }

  // 2. Obtener el ID del pedido (de la URL)
  const params = new URLSearchParams(window.location.search);
  const pedidoId = params.get("pedidoId");

  if (!pedidoId) {
      alert("Error: No se encontró un ID de pedido. Vuelva a empezar.");
      return;
  }

  // 3. TODO: Enviar 'pedidoDetalles' y 'pedidoId' a la API de Spring Boot
  // (Necesitaremos un nuevo endpoint, ej: POST /api/pedidos/agregar-platos)
  alert("Pedido confirmado! (Simulación de envío al backend)");
  console.log("Enviando al backend:", { pedidoId, detalles: pedidoDetalles });
  
  // TODO: Cambiar esto para que redirija solo después de una respuesta exitosa del backend
  window.location.href = "confirmar.html"; // Redirige a la página de confirmación
}

// Función para obtener el número de mesa desde la URL
function obtenerMesa() {
  const params = new URLSearchParams(window.location.search);
  const mesaNumero = params.get("mesa");
  const pedidoId = params.get("pedidoId"); // El ID del pedido que ya iniciamos

  const tituloEl = document.getElementById("mesa-titulo");
  if (!tituloEl) return;

  if (mesaNumero) {
    tituloEl.innerText = `Mesa N° ${mesaNumero}`; 
  } else if (pedidoId) {
    // Si viene de Delivery, usamos el pedidoId
    tituloEl.innerText = `Pedido Delivery N° ${pedidoId}`;
  } else {
    tituloEl.innerText = `Selecciona el pedido`;
  }
}

// Cargar el menú y mostrar la mesa al iniciar la página
// (MODIFICADO para llamar a la API)
document.addEventListener('DOMContentLoaded', () => {
  obtenerMesa();
  fetchYcargarMenu(); // 7. Llamar a la nueva función asíncrona
});
