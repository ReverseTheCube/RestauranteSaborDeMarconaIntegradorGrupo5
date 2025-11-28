// --- CONSTANTES ---
const API_URL_CLIENTES = "/api/clientes"; 
const API_URL_EMPRESAS = "/api/empresas"; 

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

// --- EVENTOS (AQUÍ ESTÁ LA LÓGICA DE AUTOCOMPLETADO) ---
function setupEventListeners() {
    const tipoDoc = document.getElementById('tipoDocumento');
    
    // Cambio entre DNI y RUC
    if(tipoDoc) {
        tipoDoc.addEventListener('change', (e) => toggleDocumentType(e.target.value));
    }

    // 1. Escuchar cuando escriben el DNI
    const inputDNI = document.getElementById('numeroDocumentoDNI');
    if(inputDNI) {
        inputDNI.addEventListener('input', async (e) => {
            const dni = e.target.value;
            const nombreInput = document.getElementById('nombreCliente');
            
            if (dni.length === 8) {
                nombreInput.value = "Buscando...";
                try {
                    // Llamada a tu API de Clientes
                    const response = await fetch(`${API_URL_CLIENTES}/buscar-dni/${dni}`);
                    if (response.ok) {
                        const cliente = await response.json();
                        nombreInput.value = cliente.nombresApellidos; //
                        nombreInput.style.color = "var(--success)";
                    } else {
                        nombreInput.value = "Cliente no encontrado (Se registrará nuevo)";
                        nombreInput.style.color = "var(--warning)";
                    }
                } catch (error) {
                    console.error(error);
                    nombreInput.value = "Error al buscar";
                }
            } else {
                nombreInput.value = ""; // Limpiar si borran números
            }
        });
    }

    // 2. Escuchar cuando escriben el RUC
    const inputRUC = document.getElementById('numeroDocumentoRUC');
    if(inputRUC) {
        inputRUC.addEventListener('input', async (e) => {
            const ruc = e.target.value;
            const empresaInput = document.getElementById('empresaCliente');
            
            if (ruc.length === 11) {
                empresaInput.value = "Buscando...";
                try {
                    // Llamada a tu API de Empresas (usando filtro)
                    const response = await fetch(`${API_URL_EMPRESAS}?filtro=${ruc}`);
                    if (response.ok) {
                        const lista = await response.json();
                        // Verificamos si la lista trae resultados
                        if (lista && lista.length > 0) {
                            empresaInput.value = lista[0].razonSocial;
                            empresaInput.style.color = "var(--success)";
                        } else {
                            empresaInput.value = "Empresa no encontrada";
                            empresaInput.style.color = "var(--warning)";
                        }
                    } else {
                        empresaInput.value = "Error al buscar";
                    }
                } catch (error) {
                    console.error(error);
                    empresaInput.value = "Error de conexión";
                }
            } else {
                empresaInput.value = ""; // Limpiar si borran números
            }
        });
    }
}

function toggleDocumentType(tipo) {
    const dniInput = document.getElementById('numeroDocumentoDNI');
    const rucInput = document.getElementById('numeroDocumentoRUC');
    const nombreInput = document.getElementById('nombreCliente');
    const empresaInput = document.getElementById('empresaCliente');
    
    // Limpiamos los campos al cambiar
    dniInput.value = "";
    rucInput.value = "";
    nombreInput.value = "";
    empresaInput.value = "";

    if (tipo === 'RUC') {
        dniInput.style.display = 'none';
        nombreInput.style.display = 'none';
        rucInput.style.display = 'block';
        empresaInput.style.display = 'block';
        rucInput.focus();
    } else {
        rucInput.style.display = 'none';
        empresaInput.style.display = 'none';
        dniInput.style.display = 'block';
        nombreInput.style.display = 'block';
        dniInput.focus();
    }
}

function cargarEmpleadoLogueado() {
    const miId = localStorage.getItem('usuarioId');
    const miNombre = localStorage.getItem('usuarioNombre'); // Asumiendo que guardaste el nombre en login.js
    
    if(miId) document.getElementById('dniUsuario').innerText = miId;
    if(miNombre) document.getElementById('registradoPor').innerText = miNombre;
}

function eliminarItem(platoId) {
    let platos = JSON.parse(localStorage.getItem('detallePedido')) || [];
    platos = platos.filter(p => p.platoId !== platoId);
    localStorage.setItem('detallePedido', JSON.stringify(platos));
    cargarDatosDelPedido();
}

// --- FUNCIÓN FINALIZAR PEDIDO ---
async function finalizarPedido() {
    const infoPedido = JSON.parse(localStorage.getItem('infoPedido'));
    const detallePedido = JSON.parse(localStorage.getItem('detallePedido'));

    if (!infoPedido || !infoPedido.pedidoId) return alert("Error: Falta información del pedido.");
    if (!detallePedido || detallePedido.length === 0) return alert("Error: El pedido está vacío.");

    if (!confirm("¿Finalizar pedido?")) return;

    // Detectar qué tipo de cliente se está enviando
    const tipoDoc = document.getElementById('tipoDocumento').value;
    const esDni = tipoDoc === 'DNI';
    const numDoc = esDni ? document.getElementById('numeroDocumentoDNI').value : document.getElementById('numeroDocumentoRUC').value;
    
    // Preparar datos para el backend
    const requestData = {
        pedidoId: infoPedido.pedidoId,
        detallePlatos: detallePedido.map(i => ({ platoId: i.platoId, cantidad: i.cantidad })),
        tipoDocumento: tipoDoc,
        numeroDocumento: esDni ? numDoc : null,
        rucEmpresa: !esDni ? numDoc : null,
        // Opcional: Si es cliente nuevo, podrías enviar el nombre también si modificas tu DTO
        // nombreCliente: document.getElementById('nombreCliente').value 
    };

    const btn = document.querySelector('.btn-success'); // Botón finalizar
    const textoOriginal = btn.innerText;
    btn.disabled = true; 
    btn.innerText = "Guardando...";

    try {
        const response = await fetch('/api/pedidos/finalizar', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) throw new Error(await response.text());

        const pedido = await response.json();
        alert(`✅ Pedido guardado exitosamente.\nTotal: S/ ${pedido.total.toFixed(2)}`);
        
        localStorage.removeItem('detallePedido');
        localStorage.removeItem('infoPedido');
        window.location.href = 'gestionpedidos.html'; // Volver al inicio

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
        btn.disabled = false;
        btn.innerText = textoOriginal;
    }
}