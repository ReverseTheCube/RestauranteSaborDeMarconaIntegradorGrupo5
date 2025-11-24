// --- CONSTANTES ---
const API_URL_CLIENTES = "http://localhost:8080/api/clientes"; 
const API_URL_EMPRESAS = "http://localhost:8080/api/empresas"; 

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosDelPedido();
    setupEventListeners(); 
    cargarEmpleadoLogueado(); 
});

// --- FUNCIONES DE CARGA ---
function cargarDatosDelPedido() {
    const platosSeleccionados = JSON.parse(localStorage.getItem('detallePedido')) || [];
    const infoPedido = JSON.parse(localStorage.getItem('infoPedido')) || {};

    const tituloEl = document.getElementById('info-pedido-titulo');
    if (tituloEl && infoPedido.tipo) {
        tituloEl.innerText = (infoPedido.tipo === 'LOCAL') 
            ? `Mesa N° ${infoPedido.mesa}` 
            : `Delivery N° ${infoPedido.pedidoId || '?'}`;
    }
    popularTabla(platosSeleccionados);
    calcularTotal(platosSeleccionados);
}

function popularTabla(platos) {
    const tablaBody = document.getElementById('detalle-tabla-body');
    if (!tablaBody) return;
    tablaBody.innerHTML = ''; 
    
    if (platos.length === 0) {
        tablaBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Agregue platos.</td></tr>`;
        return;
    }
    
    platos.forEach(plato => {
        tablaBody.innerHTML += `
            <tr>
                <td>${plato.nombre}</td>
                <td style="text-align:center">${plato.cantidad}</td>
                <td style="text-align:right">S/ ${plato.precioUnitario.toFixed(2)}</td>
                <td style="text-align:right">S/ ${plato.subtotal.toFixed(2)}</td>
                <td style="text-align:center">
                    <button class="btn-tabla-eliminar" onclick="eliminarItem(${plato.platoId})">🗑️</button>
                </td>
            </tr>`;
    });
}

function calcularTotal(platos) {
    const total = platos.reduce((sum, plato) => sum + plato.subtotal, 0);
    document.getElementById('total-general').innerText = `TOTAL: S/ ${total.toFixed(2)}`;
}

// --- EVENTOS ---
function setupEventListeners() {
    const tipoDoc = document.getElementById('tipoDocumento');
    if(tipoDoc) tipoDoc.addEventListener('change', (e) => toggleDocumentType(e.target.value));
}

function toggleDocumentType(tipo) {
    const dniInput = document.getElementById('numeroDocumentoDNI');
    const rucInput = document.getElementById('numeroDocumentoRUC');
    
    if (tipo === 'RUC') {
        if(dniInput) dniInput.style.display = 'none';
        if(rucInput) rucInput.style.display = 'block';
    } else {
        if(dniInput) dniInput.style.display = 'block';
        if(rucInput) rucInput.style.display = 'none';
    }
}

function cargarEmpleadoLogueado() {
    const miId = localStorage.getItem('usuarioId');
    if(miId) document.getElementById('dniUsuario').value = miId;
}

function eliminarItem(platoId) {
    let platos = JSON.parse(localStorage.getItem('detallePedido')) || [];
    platos = platos.filter(p => p.platoId !== platoId);
    localStorage.setItem('detallePedido', JSON.stringify(platos));
    cargarDatosDelPedido();
}

// --- FUNCIÓN FINALIZAR PEDIDO (CRUCIAL) ---
async function finalizarPedido() {
    const infoPedido = JSON.parse(localStorage.getItem('infoPedido'));
    const detallePedido = JSON.parse(localStorage.getItem('detallePedido'));

    if (!infoPedido || !infoPedido.pedidoId) return alert("Error: Falta información del pedido.");
    if (!detallePedido || detallePedido.length === 0) return alert("Error: El pedido está vacío.");

    if (!confirm("¿Finalizar pedido?")) return;

    // Preparar datos para el backend
    const requestData = {
        pedidoId: infoPedido.pedidoId,
        detallePlatos: detallePedido.map(i => ({ platoId: i.platoId, cantidad: i.cantidad })),
        tipoDocumento: document.getElementById('tipoDocumento').value,
        numeroDocumento: (document.getElementById('tipoDocumento').value === 'DNI') 
            ? document.getElementById('numeroDocumentoDNI').value 
            : document.getElementById('numeroDocumentoRUC').value,
        rucEmpresa: (document.getElementById('tipoDocumento').value === 'RUC') 
            ? document.getElementById('numeroDocumentoRUC').value 
            : null
    };

    const btn = document.querySelector('.btn-finalizar');
    btn.disabled = true; 
    btn.textContent = "Guardando...";

    try {
        const response = await fetch('/api/pedidos/finalizar', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) throw new Error(await response.text());

        const pedido = await response.json();
        alert(`✅ Pedido guardado.\nTotal: S/ ${pedido.total.toFixed(2)}`);
        
        localStorage.removeItem('detallePedido');
        localStorage.removeItem('infoPedido');
        window.location.href = 'gestionpedidos.html'; // Volver al inicio

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
        btn.disabled = false;
        btn.textContent = "Finalizar Pedido";
    }
}