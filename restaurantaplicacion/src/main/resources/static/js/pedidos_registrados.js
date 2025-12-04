document.addEventListener('DOMContentLoaded', () => {
    buscarPedidos(); 

    const input = document.getElementById('inputBusqueda');
    if(input){
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') buscarPedidos();
        });
    }
});

async function buscarPedidos() {
    // 1. Limpieza de lo que escribe el cajero
    let query = document.getElementById('inputBusqueda').value.trim();
    
    // TRUCO: Si escribe "Mesa 1", nos quedamos solo con "1" para comparar
    let queryMesa = query.toLowerCase().replace("mesa", "").trim();

    const tbody = document.querySelector('#tablaPedidos tbody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Cargando pedidos...</td></tr>';

    try {
        console.log(">>> Solicitando historial de pedidos...");
        const response = await fetch('/api/pedidos'); 
        
        if(!response.ok) throw new Error("Error al cargar pedidos");
        
        const pedidos = await response.json();
        
        console.log(">>> Pedidos recibidos del servidor:", pedidos); // <--- MIRA ESTO EN LA CONSOLA (F12)

        // 2. FILTRADO INTELIGENTE
        const pedidosFiltrados = pedidos.filter(p => {
            // Si no escribe nada, mostramos TODOS los pedidos activos (no anulados)
            if (!query) return true; 
            
            // Búsqueda por ID (parcial)
            const idMatch = p.id.toString().includes(query);
            
            // Búsqueda por Mesa (Si es LOCAL y coincide el número)
            // Usamos '==' para que "1" (string) coincida con 1 (number)
            const mesaMatch = (p.tipoServicio === 'LOCAL' && p.infoServicio == queryMesa);
            
            return idMatch || mesaMatch;
        });

        tbody.innerHTML = '';
        
        if (pedidosFiltrados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No se encontraron coincidencias.</td></tr>';
            return;
        }

        // 3. DIBUJAR TABLA
        pedidosFiltrados.forEach(p => {
            const fecha = new Date(p.fechaHora).toLocaleString();
            
            // Estilos de Badges
            const claseTipo = p.tipoServicio === 'LOCAL' ? 'badge-local' : 'badge-delivery';
            
            let claseEstado = 'badge-pendiente'; // Amarillo por defecto
            if (p.estado === 'PAGADO') claseEstado = 'badge-pagado'; // Gris
            else if (p.estado === 'POR_PAGAR') claseEstado = 'badge-delivery'; // Azul (o crea estilo nuevo)

            // Lógica del Botón
            let botonAccion = '';
            
            // Si es LOCAL
            if (p.tipoServicio === 'LOCAL') {
                if (p.estado === 'PAGADO') {
                    botonAccion = `<span style="color: var(--success); font-weight: bold;">✔ Listo</span>`;
                } 
                // AQUÍ ESTÁ LA CLAVE: Si es PENDIENTE o POR_PAGAR -> Botón COBRAR
                else if (p.estado === 'POR_PAGAR' || p.estado === 'PENDIENTE') {
                    botonAccion = `
                        <button class="btn btn-success" style="padding: 5px 15px; font-size: 0.8rem;" onclick="irACaja(${p.id})">
                            <i class="fas fa-cash-register"></i> Cobrar
                        </button>`;
                }
            } 
            // Si es DELIVERY
            else {
                if (p.estado === 'PAGADO') {
                    botonAccion = `<span style="color: var(--success); font-weight: bold;">✔ Entregado</span>`;
                } else {
                    botonAccion = `<button class="btn btn-secondary" style="padding: 5px 15px; font-size: 0.8rem;">Ver</button>`;
                }
            }

            const infoDetalle = p.tipoServicio === 'LOCAL' ? `Mesa ${p.infoServicio}` : 'Delivery';

            const fila = `
                <tr>
                    <td><b>#${p.id}</b></td>
                    <td>${fecha}</td>
                    <td><span class="badge ${claseTipo}">${p.tipoServicio}</span></td>
                    <td>${infoDetalle}</td>
                    <td><span class="badge ${claseEstado}">${p.estado}</span></td>
                    <td style="font-weight: bold; color: var(--success);">S/ ${p.total.toFixed(2)}</td>
                    <td style="text-align: center;">${botonAccion}</td>
                </tr>
            `;
            tbody.innerHTML += fila;
        });

    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--danger);">Error de conexión</td></tr>';
    }
}

async function irACaja(pedidoId) {
    try {
        const response = await fetch(`/api/pedidos/${pedidoId}`);
        if(response.ok) {
            const pedido = await response.json();
            
            // --- NUEVO: Extraer datos del cliente si existen ---
            let clienteData = null;
            if (pedido.cliente) {
                clienteData = {
                    nombre: pedido.cliente.nombresApellidos, // Asegúrate que tu Java devuelve este nombre
                    doc: pedido.cliente.numeroDocumento,
                    tipoDoc: pedido.cliente.tipoDocumento
                };
            }else if (pedido.rucEmpresa) {
                // Caso especial si solo tiene RUC de empresa asignado
                datosCliente = {
                    nombre: pedido.empresa ? pedido.empresa.razonSocial : "",
                    doc: pedido.rucEmpresa,
                    tipoDoc: 'RUC'
                };
            }
            // ---------------------------------------------------

            const infoPedido = {
                pedidoId: pedido.id,
                mesa: pedido.infoServicio, 
                tipo: pedido.tipoServicio,
                cliente: clienteData 
            };
            
            const detallePedido = pedido.detallePlatos.map(d => ({
                platoId: d.plato.id,
                nombre: d.plato.nombre,
                precioUnitario: d.precioUnitario,
                cantidad: d.cantidad,
                subtotal: d.precioUnitario * d.cantidad
            }));

            localStorage.setItem('infoPedido', JSON.stringify(infoPedido));
            localStorage.setItem('detallePedido', JSON.stringify(detallePedido));

            window.location.href = 'resumen_pedido.html';
        }
    } catch (e) {
        console.error(e);
        alert("Error al recuperar datos del pedido");
    }
}
