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
    // 1. Obtener y limpiar la búsqueda
    let queryOriginal = document.getElementById('inputBusqueda').value.trim();
    let queryLower = queryOriginal.toLowerCase();
    
    // Preparar versión "solo número" para mesas (ej: "mesa 5" -> "5")
    let queryMesa = queryLower.replace("mesa", "").trim(); 

    const tbody = document.querySelector('#tablaPedidos tbody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Cargando pedidos...</td></tr>';

    try {
        const response = await fetch('/api/pedidos'); 
        
        if(!response.ok) throw new Error("Error al cargar pedidos");
        
        const pedidos = await response.json();
        
        // ORDENAR: Más recientes primero
        pedidos.sort((a, b) => b.id - a.id);

        // --- FILTRADO INTELIGENTE ---
        const pedidosFiltrados = pedidos.filter(p => {
            
            // REGLA 1: Delivery Oculto si no está pagado
            if (p.tipoServicio === 'DELIVERY' && p.estado !== 'PAGADO') {
                return false; 
            }

            // Si no hay búsqueda, mostramos todo lo que pasó la regla 1
            if (!queryOriginal) return true; 

            // --- LÓGICA DE BÚSQUEDA ---

            // A) Buscar por TIPO ("Delivery", "Local")
            const tipoMatch = p.tipoServicio.toLowerCase().includes(queryLower);

            // B) Buscar por ID (ej: "52")
            const idMatch = p.id.toString().includes(queryOriginal);

            // C) Buscar por DETALLE (Mesa)
            let mesaMatch = false;
            if (p.tipoServicio === 'LOCAL') {
                // Si el usuario escribió un número específico (ej: "1" o "mesa 1")
                if (queryMesa !== "") {
                    // Comparamos el infoServicio (que es el número de mesa) con lo buscado
                    mesaMatch = (p.infoServicio.toString() === queryMesa);
                }
            }

            // Si coincide con cualquiera de los criterios, lo mostramos
            return tipoMatch || idMatch || mesaMatch;
        });

        tbody.innerHTML = '';
        
        if (pedidosFiltrados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No se encontraron pedidos.</td></tr>';
            return;
        }

        // DIBUJAR TABLA
        pedidosFiltrados.forEach(p => {
            const fecha = new Date(p.fechaHora).toLocaleString();
            
            const claseTipo = p.tipoServicio === 'LOCAL' ? 'badge-local' : 'badge-delivery';
            
            let claseEstado = 'badge-pendiente'; 
            if (p.estado === 'PAGADO') claseEstado = 'badge-pagado';
            else if (p.estado === 'POR_PAGAR') claseEstado = 'badge-delivery'; 

            let botonAccion = '';
            
            // Botón para LOCAL (Cobrar si está pendiente/por pagar)
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
            // Botón para DELIVERY (Ver o Cobrar si llegara a filtrarse)
            else {
                if (p.estado === 'PAGADO') {
                    botonAccion = `<span style="color: var(--success); font-weight: bold;">✔ Entregado</span>`;
                } else {
                    botonAccion = `
                        <button class="btn btn-success" style="padding: 5px 15px; font-size: 0.8rem;" onclick="irACaja(${p.id})">
                            <i class="fas fa-cash-register"></i> Cobrar
                        </button>`;
                }
            }

            // Detalle visual: "Mesa 1" o "Delivery Nº 52"
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