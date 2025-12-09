document.addEventListener('DOMContentLoaded', () => {
    cargarPedidosCocina();
    setInterval(cargarPedidosCocina, 10000); // Refresco automático
});

async function cargarPedidosCocina() {
    const grid = document.getElementById('grid-cocina');
    
    try {
        console.log(">>> Solicitando pedidos al servidor...");
        const response = await fetch('/api/pedidos'); 
        
        if (!response.ok) {
            console.warn("⚠️ API falló. Cargando datos de prueba...");
            usarDatosDePrueba();
            return;
        }
        
        const pedidos = await response.json();
        console.log(">>> Pedidos recibidos:", pedidos);

        if (pedidos.length === 0) {
            console.warn("⚠️ Base de datos vacía. Mostrando prueba...");
            usarDatosDePrueba();
            return;
        }

        // --- RECUPERAR LISTA DE COMPLETADOS (Memoria del navegador) ---
        const completadosLocalmente = JSON.parse(localStorage.getItem('pedidosCocinaCompletados')) || [];

        // --- FILTRO DE COCINA ---
        const pedidosCocina = pedidos.filter(p => {
            // 1. REGLA NUEVA: Si ya lo marqué como listo, lo oculto
            if (completadosLocalmente.includes(p.id)) return false;

            const estado = p.estado ? p.estado.toUpperCase() : "";
            const tipo = p.tipoServicio ? p.tipoServicio.toUpperCase() : "";

            // 2. MESA: El Mozo finalizó (POR_PAGAR) o ya se cobró (PAGADO)
            const esMesaLista = tipo === 'LOCAL' && (estado === 'POR_PAGAR' || estado === 'PAGADO');

            // 3. DELIVERY: El Cajero finalizó (PAGADO)
            const esDeliveryListo = tipo === 'DELIVERY' && estado === 'PAGADO';
            
            return esMesaLista || esDeliveryListo;
        });

        // 3. RENDERIZADO
        grid.innerHTML = '';

        if (pedidosCocina.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; margin-top: 50px;">
                    <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--secondary); margin-bottom: 10px;"></i>
                    <p style="color: var(--text-muted); font-size: 1.2rem;">No hay pedidos en cola de preparación.</p>
                </div>`;
            return;
        }

        renderizarPedidos(pedidosCocina);

    } catch (e) {
        console.error(">>> ERROR CONEXIÓN:", e);
        usarDatosDePrueba();
    }
}

// --- DATOS FALSOS (SOLO PARA PRUEBAS) ---
function usarDatosDePrueba() {
    const datosFalsos = [
        { id: 101, tipoServicio: 'LOCAL', infoServicio: '1', fechaHora: new Date().toISOString(), estado: 'POR_PAGAR', detallePlatos: [{cantidad: 2, plato: {nombre: 'Ceviche Clásico'}}] },
        { id: 102, tipoServicio: 'DELIVERY', id: 55, fechaHora: new Date().toISOString(), estado: 'PAGADO', detallePlatos: [{cantidad: 1, plato: {nombre: 'Lomo Saltado'}}] }
    ];
    renderizarPedidos(datosFalsos);
}

function renderizarPedidos(listaPedidos) {
    const grid = document.getElementById('grid-cocina');
    let htmlContent = ''; 

    // Estilo de lista vertical para los desplegables
    grid.style.display = 'flex';
    grid.style.flexDirection = 'column';
    grid.style.gap = '10px';

    listaPedidos.forEach(p => {
        let titulo = "";
        let icono = "";
        
        if (p.tipoServicio === 'LOCAL') {
            titulo = `MESA ${p.infoServicio}`;
            icono = '<i class="fas fa-utensils"></i>';
        } else {
            titulo = `DELIVERY Nº ${p.id}`;
            icono = '<i class="fas fa-motorcycle"></i>';
        }

        let etiqueta = "";
        if (p.estado === 'POR_PAGAR') {
            etiqueta = `<span style="font-size:0.7rem; background:#3498db; color:white; padding:2px 6px; border-radius:4px; margin-left:10px;">CONFIRMADO</span>`;
        } else if (p.estado === 'PAGADO') {
            etiqueta = `<span style="font-size:0.7rem; background:#2ecc71; color:white; padding:2px 6px; border-radius:4px; margin-left:10px;">PAGADO</span>`;
        }

        let htmlPlatos = '';
        if (p.detallePlatos && Array.isArray(p.detallePlatos) && p.detallePlatos.length > 0) {
            p.detallePlatos.forEach(d => {
                const nombrePlato = (d.plato && d.plato.nombre) ? d.plato.nombre : 'Item desconocido';
                htmlPlatos += `
                    <div class="order-item">
                        <span class="item-qty">${d.cantidad}</span>
                        <span class="item-name">${nombrePlato}</span>
                    </div>`;
            });
        } else {
            htmlPlatos = '<p style="color: grey; font-style: italic; padding:10px;">Sin platos registrados...</p>';
        }

        let hora = "--:--";
        if(p.fechaHora) {
            try {
                const fechaObj = Array.isArray(p.fechaHora) 
                    ? new Date(p.fechaHora[0], p.fechaHora[1]-1, p.fechaHora[2], p.fechaHora[3], p.fechaHora[4])
                    : new Date(p.fechaHora);
                hora = fechaObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            } catch(err) { console.warn("Error fecha", err); }
        }

        // Usamos <details> para el efecto acordeón/desplegable
        // Quitamos el atributo 'open' para que aparezcan cerrados por defecto (ahorra espacio)
        htmlContent += `
            <details class="order-card" style="margin-bottom:5px; overflow:visible;">
                <summary class="order-header" style="cursor:pointer; list-style:none; display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center;">
                        <span style="margin-right:10px; color:var(--primary); font-size:1.2rem;">${icono}</span>
                        <span class="order-title" style="font-size:1.1rem;">${titulo}</span>
                        ${etiqueta}
                    </div>
                    <div class="order-meta" style="display:flex; align-items:center; gap:10px;">
                        <span>${hora}</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </summary>
                
                <div class="order-body" style="border-top:1px solid var(--secondary); margin-top:10px; padding-top:10px;">
                    ${htmlPlatos}
                </div>
                
                <div class="order-footer">
                    <button class="btn btn-success" style="width: 100%;" onclick="marcarListo(${p.id})">
                        <i class="fas fa-check-circle"></i> ¡Pedido Listo! (Archivar)
                    </button>
                </div>
            </details>
        `;
    });
    
    grid.innerHTML = htmlContent;
}

async function marcarListo(id) {
    if(!confirm(`¿Confirmar que el pedido #${id} ya salió de cocina?`)) return;
    
    // 1. GUARDAR EN MEMORIA QUE ESTE PEDIDO YA FUE ATENDIDO
    let completados = JSON.parse(localStorage.getItem('pedidosCocinaCompletados')) || [];
    if(!completados.includes(id)) {
        completados.push(id);
        localStorage.setItem('pedidosCocinaCompletados', JSON.stringify(completados));
    }

    // 2. RECARGAR INMEDIATAMENTE
    // Al recargar, el filtro de arriba leerá la memoria y ocultará este ID
    alert("¡Oído cocina! Pedido archivado.");
    cargarPedidosCocina(); 
}