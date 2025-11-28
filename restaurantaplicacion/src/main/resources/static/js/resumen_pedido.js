// --- CONSTANTES ---
const API_URL_CLIENTES = "/api/clientes"; 
const API_URL_EMPRESAS = "/api/empresas"; 

// Variables globales para pasar datos al modal
let ultimoPedidoGuardado = null;
let ultimoDetallePedido = [];
let ultimoClienteInfo = {};

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
                    <button class="btn btn-danger" style="padding: 5px 10px; font-size: 0.8rem;" onclick="eliminarItem(${plato.platoId})">🗑️</button>
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

    const inputDNI = document.getElementById('numeroDocumentoDNI');
    if(inputDNI) {
        inputDNI.addEventListener('input', async (e) => {
            const dni = e.target.value;
            const nombreInput = document.getElementById('nombreCliente');
            if (dni.length === 8) {
                nombreInput.value = "Buscando...";
                try {
                    const response = await fetch(`${API_URL_CLIENTES}/buscar-dni/${dni}`);
                    if (response.ok) {
                        const cliente = await response.json();
                        nombreInput.value = cliente.nombresApellidos;
                        nombreInput.style.color = "var(--success)";
                    } else {
                        nombreInput.value = "Cliente Nuevo";
                        nombreInput.style.color = "var(--warning)";
                    }
                } catch (error) { nombreInput.value = "Error"; }
            } else { nombreInput.value = ""; }
        });
    }

    const inputRUC = document.getElementById('numeroDocumentoRUC');
    if(inputRUC) {
        inputRUC.addEventListener('input', async (e) => {
            const ruc = e.target.value;
            const empresaInput = document.getElementById('empresaCliente');
            if (ruc.length === 11) {
                empresaInput.value = "Buscando...";
                try {
                    const response = await fetch(`${API_URL_EMPRESAS}?filtro=${ruc}`);
                    if (response.ok) {
                        const lista = await response.json();
                        if (lista && lista.length > 0) {
                            empresaInput.value = lista[0].razonSocial;
                            empresaInput.style.color = "var(--success)";
                        } else {
                            empresaInput.value = "Empresa no encontrada";
                            empresaInput.style.color = "var(--warning)";
                        }
                    } else { empresaInput.value = "Error"; }
                } catch (error) { empresaInput.value = "Error conex."; }
            } else { empresaInput.value = ""; }
        });
    }
    
    // Evento del botón imprimir del modal
    document.getElementById('btnImprimir').addEventListener('click', () => {
        generarBoletaHTML();
    });
}

function toggleDocumentType(tipo) {
    const dniInput = document.getElementById('numeroDocumentoDNI');
    const rucInput = document.getElementById('numeroDocumentoRUC');
    const nombreInput = document.getElementById('nombreCliente');
    const empresaInput = document.getElementById('empresaCliente');
    
    dniInput.value = ""; rucInput.value = "";
    nombreInput.value = ""; empresaInput.value = "";

    if (tipo === 'RUC') {
        dniInput.style.display = 'none'; nombreInput.style.display = 'none';
        rucInput.style.display = 'block'; empresaInput.style.display = 'block';
        rucInput.focus();
    } else {
        rucInput.style.display = 'none'; empresaInput.style.display = 'none';
        dniInput.style.display = 'block'; nombreInput.style.display = 'block';
        dniInput.focus();
    }
}

function cargarEmpleadoLogueado() {
    const miId = localStorage.getItem('usuarioId');
    const miNombre = localStorage.getItem('usuarioNombre');
    if(miId) document.getElementById('dniUsuario').innerText = miId;
    if(miNombre) document.getElementById('registradoPor').innerText = miNombre;
}

function eliminarItem(platoId) {
    let platos = JSON.parse(localStorage.getItem('detallePedido')) || [];
    platos = platos.filter(p => p.platoId !== platoId);
    localStorage.setItem('detallePedido', JSON.stringify(platos));
    cargarDatosDelPedido();
}

// --- FINALIZAR PEDIDO (CORREGIDO) ---
async function finalizarPedido() {
    const infoPedido = JSON.parse(localStorage.getItem('infoPedido'));
    const detallePedido = JSON.parse(localStorage.getItem('detallePedido'));

    if (!infoPedido || !infoPedido.pedidoId) return alert("Error: Falta información.");
    if (!detallePedido || detallePedido.length === 0) return alert("Pedido vacío.");

    if (!confirm("¿Confirma finalizar la venta?")) return;

    const tipoDoc = document.getElementById('tipoDocumento').value;
    const esDni = tipoDoc === 'DNI';
    const numDoc = esDni ? document.getElementById('numeroDocumentoDNI').value : document.getElementById('numeroDocumentoRUC').value;
    const nombreCl = esDni ? document.getElementById('nombreCliente').value : document.getElementById('empresaCliente').value;

    const requestData = {
        pedidoId: infoPedido.pedidoId,
        detallePlatos: detallePedido.map(i => ({ platoId: i.platoId, cantidad: i.cantidad })),
        tipoDocumento: tipoDoc,
        numeroDocumento: esDni ? numDoc : null,
        rucEmpresa: !esDni ? numDoc : null
    };

    const btn = document.querySelector('.btn-success');
    const textoOriginal = btn.innerText;
    btn.disabled = true; 
    btn.innerText = "Procesando...";

    try {
        const response = await fetch('/api/pedidos/finalizar', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) throw new Error(await response.text());

        // Guardamos datos para la impresión
        ultimoPedidoGuardado = await response.json();
        ultimoDetallePedido = detallePedido;
        ultimoClienteInfo = { nombre: nombreCl, doc: numDoc, tipoDoc: tipoDoc };

        // MOSTRAR MODAL DE ÉXITO (En lugar de abrir ventana directamente)
        document.getElementById('modal-exito').style.display = 'flex';

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
        btn.disabled = false;
        btn.innerText = textoOriginal;
    }
}

// --- NUEVAS FUNCIONES PARA EL MODAL ---

function generarBoletaHTML() {
    const pedido = ultimoPedidoGuardado;
    const items = ultimoDetallePedido;
    const { nombre, doc, tipoDoc } = ultimoClienteInfo;
    
    const fecha = new Date().toLocaleString();
    const cajero = localStorage.getItem('usuarioNombre') || 'Cajero';
    
    let total = 0;
    let filasHTML = '';
    items.forEach(item => {
        total += item.subtotal;
        filasHTML += `
            <tr>
                <td style="padding:5px; border-bottom:1px dashed #ccc;">${item.nombre}</td>
                <td style="padding:5px; text-align:center; border-bottom:1px dashed #ccc;">${item.cantidad}</td>
                <td style="padding:5px; text-align:right; border-bottom:1px dashed #ccc;">S/ ${item.precioUnitario.toFixed(2)}</td>
                <td style="padding:5px; text-align:right; border-bottom:1px dashed #ccc;">S/ ${item.subtotal.toFixed(2)}</td>
            </tr>`;
    });

    const ventana = window.open('', 'PRINT', 'height=600,width=400');
    
    if (ventana) {
        ventana.document.write(`
            <html>
            <head>
                <title>Boleta #${pedido.id}</title>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 20px; color: #000; }
                    .ticket { width: 100%; max-width: 300px; margin: 0 auto; text-align: center; }
                    h2, p { margin: 5px 0; }
                    .line { border-top: 1px dashed #000; margin: 10px 0; }
                    table { width: 100%; font-size: 12px; border-collapse: collapse; }
                    .total { font-size: 18px; font-weight: bold; margin-top: 10px; text-align: right; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <h2>EL SABOR DE MARCONA</h2>
                    <p>RUC: 20123456789</p>
                    <p>Av. Principal 123, Marcona</p>
                    <div class="line"></div>
                    <p style="text-align:left;"><strong>BOLETA ELECTRÓNICA</strong></p>
                    <p style="text-align:left;">ID: ${pedido.id} | Fecha: ${fecha}</p>
                    <p style="text-align:left;">Cajero: ${cajero}</p>
                    <div class="line"></div>
                    <p style="text-align:left;">CLIENTE: ${tipoDoc} ${doc || 'S/N'}</p>
                    <p style="text-align:left;">${nombre || 'Cliente General'}</p>
                    <div class="line"></div>
                    <table>
                        <thead><tr><th style="text-align:left;">Desc</th><th>Cant</th><th>P.U.</th><th style="text-align:right;">Total</th></tr></thead>
                        <tbody>${filasHTML}</tbody>
                    </table>
                    <div class="line"></div>
                    <div class="total">TOTAL: S/ ${total.toFixed(2)}</div>
                    <div class="line"></div>
                    <p>¡Gracias por su compra!</p>
                    <br>
                    <button class="no-print" onclick="window.print()" style="padding:10px; font-size:16px; cursor:pointer;">🖨️ IMPRIMIR</button>
                </div>
            </body>
            </html>
        `);
        ventana.document.close();
        ventana.focus();
    } else {
        alert("El navegador bloqueó la ventana. Por favor permita popups para este sitio.");
    }
}

function cerrarModalYSalir() {
    localStorage.removeItem('detallePedido');
    localStorage.removeItem('infoPedido');
    window.location.href = 'gestionpedidos.html';
}