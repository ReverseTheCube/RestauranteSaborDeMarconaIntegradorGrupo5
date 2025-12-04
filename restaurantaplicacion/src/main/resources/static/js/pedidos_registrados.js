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
    let query = document.getElementById('inputBusqueda').value.trim();
    // Preparamos variables para búsquedas flexibles
    let queryTexto = query.toLowerCase(); 
    let queryMesa = queryTexto.replace("mesa", "").trim(); // "mesa 5" -> "5", "mesa" -> ""

    const tbody = document.querySelector('#tablaPedidos tbody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Cargando pedidos...</td></tr>';

    try {
        const response = await fetch('/api/pedidos'); 
        
        if(!response.ok) throw new Error("Error al cargar pedidos");
        
        const pedidos = await response.json();

        // --- ORDENAR: MÁS RECIENTE PRIMERO (ID Descendente) ---
        pedidos.sort((a, b) => b.id - a.id);
        
        // --- FILTRADO INTELIGENTE (VERSIÓN ESTRICTA + TIPO + MESA GENERAL) ---
        const pedidosFiltrados = pedidos.filter(p => {
            
            // 1. REGLA DE ORO DELIVERY:
            // Si es Delivery, SOLO mostrar si ya está PAGADO.
            if (p.tipoServicio === 'DELIVERY' && p.estado !== 'PAGADO') {
                return false; 
            }

            // 2. Filtros de Búsqueda
            if (!query) return true; 
            
            // A) Búsqueda por ID (ej: "52")
            const idMatch = p.id.toString().includes(query);
            
            // B) Búsqueda por Mesa
            let mesaMatch = false;
            if (p.tipoServicio === 'LOCAL') {
                if (queryMesa !== "") {
                    // Si el usuario escribió un número ("5" o "mesa 5"), buscamos esa mesa específica
                    mesaMatch = (p.infoServicio == queryMesa);
                } else if (queryTexto.includes("mesa")) {
                    // Si escribió solo "mesa" (sin número), mostramos TODAS las mesas
                    mesaMatch = true;
                }
            }

            // C) Búsqueda por TIPO (ej: "Delivery")
            const tipoMatch = p.tipoServicio.toLowerCase().includes(queryTexto);
            
            return idMatch || mesaMatch || tipoMatch;
        });

        tbody.innerHTML = '';
        
        if (pedidosFiltrados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No se encontraron pedidos recientes.</td></tr>';
            return;
        }

        // DIBUJAR TABLA
        pedidosFiltrados.forEach(p => {
            const fecha = new Date(p.fechaHora).toLocaleString();
            
            // Estilos de Badges
            const claseTipo = p.tipoServicio === 'LOCAL' ? 'badge-local' : 'badge-delivery';
            
            let claseEstado = 'badge-pendiente'; 
            if (p.estado === 'PAGADO') claseEstado = 'badge-pagado';
            else if (p.estado === 'POR_PAGAR') claseEstado = 'badge-delivery'; 

            let botonAccion = '';
            
            // Lógica del Botón
            if (p.tipoServicio === 'LOCAL') {
                if (p.estado === 'PAGADO') {
                    botonAccion = `<span style="color: var(--success); font-weight: bold;">✔ Listo</span>`;
                } 
                else if (p.estado === 'POR_PAGAR' || p.estado === 'PENDIENTE') {
                    botonAccion = `
                        <button class="btn btn-success" style="padding: 5px 15px; font-size: 0.8rem;" onclick="irACaja(${p.id})">
                            <i class="fas fa-cash-register"></i> Cobrar
                        </button>`;
                }
            } 
            else {
                // DELIVERY
                if (p.estado === 'PAGADO') {
                    botonAccion = `<span style="color: var(--success); font-weight: bold;">✔ Entregado</span>`;
                } 
                else {
                    botonAccion = `
                        <button class="btn btn-success" style="padding: 5px 15px; font-size: 0.8rem;" onclick="irACaja(${p.id})">
                            <i class="fas fa-cash-register"></i> Cobrar
                        </button>`;
                }
            }

            const infoDetalle = p.tipoServicio === 'LOCAL' 
                ? `Mesa ${p.infoServicio}` 
                : `Delivery Nº ${p.id}`;

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
            
            let datosCliente = null;
            if (pedido.cliente) {
                datosCliente = {
                    nombre: pedido.cliente.nombresApellidos, 
                    doc: pedido.cliente.numeroDocumento,
                    tipoDoc: pedido.cliente.tipoDocumento
                };
            }

            const infoPedido = {
                pedidoId: pedido.id,
                mesa: pedido.infoServicio, 
                tipo: pedido.tipoServicio,
                cliente: datosCliente
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