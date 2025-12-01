// --- CONSTANTES ---
const API_URL_CLIENTES = "/api/clientes"; 
const API_URL_EMPRESAS = "/api/empresas"; 

// Variables globales para el modal de edición
let idPlatoEnEdicion = null;
let precioPlatoEnEdicion = 0;

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
    tablaBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;">No hay platos seleccionados.</td></tr>`;        
    return;
    }
    
    platos.forEach(plato => {
        tablaBody.innerHTML += `
            <tr>
                <td>${plato.nombre}</td>
                <td style="text-align:center; font-weight:bold; font-size: 1.1rem;">${plato.cantidad}</td>
                <td style="text-align:right">S/ ${plato.precioUnitario.toFixed(2)}</td>
                <td style="text-align:right">S/ ${plato.subtotal.toFixed(2)}</td>
                <td style="text-align:center">
                    <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px; background-color: #3498db; border-color: #2980b9;" 
                        onclick="abrirModalEditar(${plato.platoId}, '${plato.nombre}', ${plato.cantidad}, ${plato.precioUnitario})">
                        ✏️
                    </button>
                    <button class="btn btn-danger" style="padding: 5px 10px; font-size: 0.8rem;" 
                        onclick="eliminarItem(${plato.platoId})">
                        🗑️
                    </button>
                </td>
            </tr>`;
    });
}

function calcularTotal(platos) {
    const total = platos.reduce((sum, plato) => sum + plato.subtotal, 0);
    document.getElementById('total-general').innerText = `TOTAL: S/ ${total.toFixed(2)}`;
}

// --- LÓGICA DEL MODAL DE EDICIÓN (NUEVO) ---

function abrirModalEditar(id, nombre, cantidad, precio) {
    // Guardamos datos en variables globales temporales
    idPlatoEnEdicion = id;
    precioPlatoEnEdicion = precio;

    // Llenamos el modal
    document.getElementById('nombre-plato-editar').innerText = nombre;
    document.getElementById('nueva-cantidad').value = cantidad;

    // Mostramos el modal
    document.getElementById('modal-editar-cantidad').style.display = 'flex';
    document.getElementById('nueva-cantidad').focus();
}

function cerrarModalEditar() {
    document.getElementById('modal-editar-cantidad').style.display = 'none';
    idPlatoEnEdicion = null;
}

function guardarNuevaCantidad() {
    const inputCantidad = document.getElementById('nueva-cantidad');
    const nuevaCant = parseInt(inputCantidad.value);

    if (!nuevaCant || nuevaCant <= 0) {
        alert("La cantidad debe ser mayor a 0");
        return;
    }

    // 1. Obtener lista actual
    let platos = JSON.parse(localStorage.getItem('detallePedido')) || [];
    
    // 2. Buscar y actualizar el plato
    const indice = platos.findIndex(p => p.platoId === idPlatoEnEdicion);
    if (indice !== -1) {
        platos[indice].cantidad = nuevaCant;
        platos[indice].subtotal = nuevaCant * platos[indice].precioUnitario;
        
        // 3. Guardar en localStorage
        localStorage.setItem('detallePedido', JSON.stringify(platos));
        
        // 4. Refrescar la tabla
        cargarDatosDelPedido();
        cerrarModalEditar();
    }
}

// --- FUNCIONES EXISTENTES --- (El resto sigue igual)

function eliminarItem(platoId) {
    if(!confirm("¿Eliminar este plato del pedido?")) return;
    
    let platos = JSON.parse(localStorage.getItem('detallePedido')) || [];
    platos = platos.filter(p => p.platoId !== platoId);
    localStorage.setItem('detallePedido', JSON.stringify(platos));
    cargarDatosDelPedido();
}

// --- EVENTOS Y AUTOCOMPLETADO ---
function setupEventListeners() {
    const tipoDoc = document.getElementById('tipoDocumento');
    if(tipoDoc) tipoDoc.addEventListener('change', (e) => toggleDocumentType(e.target.value));

    // DNI Listener
    const inputDNI = document.getElementById('numeroDocumentoDNI');
    if(inputDNI) {
        inputDNI.addEventListener('blur', (e) => buscarClientePorDNI(e.target.value));
            }

            // LISTENER RUC
            const inputRUC = document.getElementById('numeroDocumentoRUC');
            if(inputRUC) {
                inputRUC.addEventListener('blur', (e) => buscarEmpresaPorRUC(e.target.value));
            }
        }

        // --- FUNCIÓN CLAVE PARA PENSIONADOS ---
async function buscarClientePorDNI(dni) {
    const nombreClienteInput = document.getElementById('nombreCliente');
    const empresaClienteInput = document.getElementById('empresaCliente'); 
    
    // 1. NUEVO: Obtenemos referencia al botón
    const btnRegistrar = document.getElementById('btnRegistrarCliente'); 
    
    nombreClienteInput.value = 'Buscando...'; 

    // 2. NUEVO: Ocultamos el botón siempre al empezar a buscar (por si estaba visible antes)
    if(btnRegistrar) btnRegistrar.style.display = 'none';

    if (dni.length !== 8) {
        nombreClienteInput.value = '';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL_CLIENTES}/buscar-dni/${dni}`);
        
        if (response.ok) {
            const data = await response.json();
            
            // 3. NUEVO: Si encontramos al cliente, nos aseguramos que el botón siga oculto
            if(btnRegistrar) btnRegistrar.style.display = 'none';

            // Llenar nombre
            nombreClienteInput.value = data.nombresApellidos; 
            nombreClienteInput.style.color = "#ffffff"; 

            // SI ES PENSIONADO: Mostrar Empresa y Saldo
            if (data.esPensionado) {
                empresaClienteInput.value = `${data.razonSocial} (Saldo: S/ ${data.saldoActual})`;
                empresaClienteInput.style.display = "block"; 
                empresaClienteInput.style.color = "#2ecc71"; 
            } else {
                empresaClienteInput.value = "Cliente Particular";
                empresaClienteInput.style.display = "block";
                empresaClienteInput.style.color = "#ffffff";
            }
            
        } else if (response.status === 404) {
            nombreClienteInput.value = "Cliente no registrado";
            nombreClienteInput.style.color = "#ef4444"; 
            empresaClienteInput.value = "";
            
            // 4. NUEVO: Aquí es donde mostramos el botón para que pueda registrarlo
            if(btnRegistrar) btnRegistrar.style.display = 'block'; 
        }
    } catch (error) {
        console.error(error);
        nombreClienteInput.value = "Error de conexión";
    }
}

function abrirModalRegistro() {
    // Obtener valores actuales de la búsqueda para pre-llenar el modal
    const tipo = document.getElementById('tipoDocumento').value;
    const numero = tipo === 'DNI' 
        ? document.getElementById('numeroDocumentoDNI').value 
        : document.getElementById('numeroDocumentoRUC').value;

    document.getElementById('modalTipoDoc').value = tipo;
    document.getElementById('modalNumeroDoc').value = numero;
    document.getElementById('modalNombre').value = ""; // Limpiar nombre anterior

    document.getElementById('modalRegistroCliente').style.display = 'flex';
    document.getElementById('modalNombre').focus();
}

function cerrarModalRegistro() {
    document.getElementById('modalRegistroCliente').style.display = 'none';
}

async function guardarClienteRapido() {
    const tipo = document.getElementById('modalTipoDoc').value;
    const numero = document.getElementById('modalNumeroDoc').value;
    const nombre = document.getElementById('modalNombre').value;

    if (!nombre.trim()) return alert("El nombre es obligatorio");

    const nuevoCliente = {
        tipoDocumento: tipo,
        numeroDocumento: numero,
        nombresApellidos: nombre// Asegúrate que este campo coincida con tu entidad Java (nombres o razonSocial)
    };

    try {
        const response = await fetch('/api/clientes', { // Tu ruta POST de clientes
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoCliente)
        });

        if (response.ok) {
            // ÉXITO
            const clienteGuardado = await response.json();
            alert("Cliente registrado correctamente");
            
            // Cerrar modal
            cerrarModalRegistro();

            // Actualizar la interfaz principal automáticamente
            document.getElementById('nombreCliente').value = clienteGuardado.nombres;
            document.getElementById('nombreCliente').style.color = "white";
            document.getElementById('btnRegistrarCliente').style.display = 'none';

        } else {
            alert("Error al guardar cliente");
        }
    } catch (e) {
        console.error(e);
        alert("Error de conexión");
    }
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

// --- FINALIZAR PEDIDO (Con Modal de Éxito) ---
// En resumen_pedido.js

async function finalizarPedido() {
    const infoPedido = JSON.parse(localStorage.getItem('infoPedido'));
    const detallePedido = JSON.parse(localStorage.getItem('detallePedido'));

    if (!infoPedido || !infoPedido.pedidoId) return alert("Error: Falta información.");
    if (!detallePedido || detallePedido.length === 0) return alert("Pedido vacío.");
            const tipoDocVal = document.getElementById('tipoDocumento').value;
            const esDniVal = tipoDocVal === 'DNI';
                
                // 2. Leemos qué dice el campo de nombre actualmente
                const nombreClienteTexto = esDniVal 
                    ? document.getElementById('nombreCliente').value 
                    : document.getElementById('empresaCliente').value;

                // 3. Si dice "Cliente no registrado", está vacío o dice error, NO dejamos pasar
                if (nombreClienteTexto === "Cliente no registrado" || 
                    nombreClienteTexto === "Buscando..." || 
                    nombreClienteTexto === "Error de conexión" ||
                    nombreClienteTexto.trim() === "") {
                    
                    return alert("⚠️ ACCIÓN REQUERIDA:\nEl cliente no está registrado en el sistema.\n\nPor favor, haga clic en el botón 'Registrar' antes de finalizar la venta.");
                }
    if (!confirm("¿Confirma finalizar la venta?")) return;

    const tipoDoc = document.getElementById('tipoDocumento').value;
    const esDni = tipoDoc === 'DNI';
    const numDoc = esDni ? document.getElementById('numeroDocumentoDNI').value : document.getElementById('numeroDocumentoRUC').value;
    
    window.ultimoClienteInfo = { 
        nombre: esDni ? document.getElementById('nombreCliente').value : document.getElementById('empresaCliente').value,
        doc: numDoc, 
        tipoDoc: tipoDoc 
    };

    const requestData = {
        pedidoId: infoPedido.pedidoId,
        detallePlatos: detallePedido.map(i => ({ platoId: i.platoId, cantidad: i.cantidad })),
        tipoDocumento: tipoDoc,
        numeroDocumento: esDni ? numDoc : null,
        rucEmpresa: !esDni ? numDoc : null
    };

    const btn = document.querySelector('.btn-finalizar');
    let textoOriginal = "Finalizar Pedido";
    if(btn) {
        textoOriginal = btn.innerText;
        btn.disabled = true; 
        btn.innerText = "Procesando...";
    }

    try {
        const response = await fetch('/api/pedidos/finalizar', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        // 1. LEEMOS LA RESPUESTA COMO TEXTO PRIMERO (Para ver qué llegó)
        const responseText = await response.text();

        if (!response.ok) {
            console.error("Error del servidor (RAW):", responseText);
            
            // Intentamos extraer el mensaje útil
            let mensajeError = "Error desconocido del servidor.";
            
            try {
                // Si es JSON (formato de error de Spring Boot)
                const errorJson = JSON.parse(responseText);
                if (errorJson.message) mensajeError = errorJson.message;
                else if (errorJson.error) mensajeError = errorJson.error;
            } catch (e) {
                // Si no es JSON, es texto plano (nuestro mensaje directo)
                if (responseText && responseText.trim().length > 0) {
                    mensajeError = responseText;
                }
            }

            throw new Error(mensajeError);
        }

        // Si es éxito, parseamos el JSON del pedido
        window.ultimoPedidoGuardado = JSON.parse(responseText);
        window.ultimoDetallePedido = detallePedido;

        const modalExito = document.getElementById('modal-exito');
        if(modalExito) modalExito.style.display = 'flex';
        else {
            alert("Venta Exitosa");
            cerrarModalYSalir();
        }

        const btnPrint = document.getElementById('btnImprimir');
        if(btnPrint) btnPrint.onclick = () => generarBoletaHTML();

    } catch (error) {
        console.error(error);
        // Mostramos el mensaje exacto que recuperamos
        alert("⚠️ NO SE PUDO PROCESAR:\n" + error.message);
        
        if(btn) {
            btn.disabled = false;
            btn.innerText = textoOriginal;
        }
    }
}

// --- GENERAR BOLETA ---
function generarBoletaHTML() {
    const pedido = window.ultimoPedidoGuardado;
    const items = window.ultimoDetallePedido;
    const { nombre, doc, tipoDoc } = window.ultimoClienteInfo;
    const fecha = new Date().toLocaleString();
    const cajero = localStorage.getItem('usuarioNombre') || 'Cajero';
    
    let total = 0;
    let filasHTML = '';
    items.forEach(item => {
        total += item.subtotal;
        filasHTML += `<tr>
            <td style="padding:5px; border-bottom:1px dashed #ccc;">${item.nombre}</td>
            <td style="padding:5px; text-align:center; border-bottom:1px dashed #ccc;">${item.cantidad}</td>
            <td style="padding:5px; text-align:right; border-bottom:1px dashed #ccc;">S/ ${item.precioUnitario.toFixed(2)}</td>
            <td style="padding:5px; text-align:right; border-bottom:1px dashed #ccc;">S/ ${item.subtotal.toFixed(2)}</td>
        </tr>`;
    });

    const ventana = window.open('', 'PRINT', 'height=600,width=400');
    if(ventana) {
        ventana.document.write(`<html><head><title>Boleta #${pedido.id}</title><style>body{font-family:'Courier New',monospace;padding:20px;text-align:center}table{width:100%;font-size:12px}.total{font-size:18px;font-weight:bold;text-align:right;margin-top:10px}</style></head><body>
            <h2>EL SABOR DE MARCONA</h2><p>RUC: 20123456789</p><hr>
            <p style="text-align:left">ID: ${pedido.id} <br> Fecha: ${fecha} <br> Cajero: ${cajero}</p>
            <p style="text-align:left">Cliente: ${nombre} <br> ${tipoDoc}: ${doc}</p><hr>
            <table><thead><tr><th align="left">Desc</th><th>Cant</th><th>P.U.</th><th align="right">Total</th></tr></thead><tbody>${filasHTML}</tbody></table>
            <hr><div class="total">TOTAL: S/ ${total.toFixed(2)}</div><hr><p>¡Gracias!</p>
            <button onclick="window.print()" style="padding:10px;margin-top:20px">🖨️ IMPRIMIR</button>
        </body></html>`);
        ventana.document.close();
    }
}

function cerrarModalYSalir() {
    localStorage.removeItem('detallePedido');
    localStorage.removeItem('infoPedido');
    window.location.href = 'registrarpedido.html';
}

