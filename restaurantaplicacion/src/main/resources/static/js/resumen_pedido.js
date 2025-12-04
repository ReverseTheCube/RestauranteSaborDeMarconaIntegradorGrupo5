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

// --- 1. FUNCIÓN DE CARGA DE DATOS (Corregida) ---
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


    try {
        if (infoPedido && infoPedido.cliente) {
            const c = infoPedido.cliente;
            const selectTipo = document.getElementById('tipoDocumento');
            
        if(selectTipo && c.tipoDoc) {
                selectTipo.value = c.tipoDoc;
                if (typeof toggleDocumentType === "function") toggleDocumentType(c.tipoDoc);
                
                selectTipo.disabled = true; 
            }
setTimeout(() => {
                if (c.tipoDoc === 'DNI') {
                    const inputDNI = document.getElementById('numeroDocumentoDNI');
                    const inputNombre = document.getElementById('nombreCliente');
                    
                    if(inputDNI) {
                        inputDNI.value = c.doc || "";
                        // A) BLOQUEAR EL INPUT PARA QUE NO LO CAMBIEN
                        inputDNI.readOnly = true; 
                        inputDNI.style.backgroundColor = "rgba(0,0,0,0.3)"; // Un poco más oscuro para indicar bloqueo
                        
                        // B) FORZAR LA BÚSQUEDA AUTOMÁTICA (Para que salga saldo y empresa)
                        buscarClientePorDNI(c.doc); 
                    }
                    if(inputNombre) {
                        inputNombre.value = c.nombre || "";
                        inputNombre.readOnly = true; // Bloquear nombre también
                        inputNombre.style.color = "white";
                    }
                } else {
                    // Caso RUC
                    const inputRUC = document.getElementById('numeroDocumentoRUC');
                    const inputEmpresa = document.getElementById('empresaCliente');
                    
                    if(inputRUC) {
                        inputRUC.value = c.doc || "";
                        inputRUC.readOnly = true; // Bloquear
                        inputRUC.style.backgroundColor = "rgba(0,0,0,0.3)";
                        
                        // Si tienes función para buscar empresa, llámala aquí también:
                        // buscarEmpresaPorRUC(c.doc); 
                    }
                    if(inputEmpresa) {
                        inputEmpresa.value = c.nombre || "";
                        inputEmpresa.readOnly = true; // Bloquear
                        inputEmpresa.style.color = "white";
                    }
                }
            }, 100); // Pequeño retraso para asegurar que los inputs existen
        }
    } catch (error) {
        console.error("Error al cargar datos del cliente:", error);
    }
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
    const totalEl = document.getElementById('total-general');
    if(totalEl) totalEl.innerText = `TOTAL: S/ ${total.toFixed(2)}`;
}

// --- MODALES DE EDICIÓN ---
function abrirModalEditar(id, nombre, cantidad, precio) {
    idPlatoEnEdicion = id;
    precioPlatoEnEdicion = precio;
    document.getElementById('nombre-plato-editar').innerText = nombre;
    document.getElementById('nueva-cantidad').value = cantidad;
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

    let platos = JSON.parse(localStorage.getItem('detallePedido')) || [];
    const indice = platos.findIndex(p => p.platoId === idPlatoEnEdicion);
    if (indice !== -1) {
        platos[indice].cantidad = nuevaCant;
        platos[indice].subtotal = nuevaCant * platos[indice].precioUnitario;
        localStorage.setItem('detallePedido', JSON.stringify(platos));
        cargarDatosDelPedido();
        cerrarModalEditar();
    }
}

function eliminarItem(platoId) {
    if(!confirm("¿Eliminar este plato del pedido?")) return;
    let platos = JSON.parse(localStorage.getItem('detallePedido')) || [];
    platos = platos.filter(p => p.platoId !== platoId);
    localStorage.setItem('detallePedido', JSON.stringify(platos));
    cargarDatosDelPedido();
}

// --- EVENTOS ---
function setupEventListeners() {
    const tipoDoc = document.getElementById('tipoDocumento');
    if(tipoDoc) tipoDoc.addEventListener('change', (e) => toggleDocumentType(e.target.value));

    const inputDNI = document.getElementById('numeroDocumentoDNI');
    if(inputDNI) inputDNI.addEventListener('blur', (e) => buscarClientePorDNI(e.target.value));

    const inputRUC = document.getElementById('numeroDocumentoRUC');
    if(inputRUC) inputRUC.addEventListener('blur', (e) => buscarEmpresaPorRUC(e.target.value));
}

// --- EMPLEADO LOGUEADO (Corregido error de null) ---
function cargarEmpleadoLogueado() {
    const miId = localStorage.getItem('usuarioId');
    const miNombre = localStorage.getItem('usuarioNombre');
    
    // Verificamos si el elemento existe antes de asignar
    const elId = document.getElementById('dniUsuario');
    const elNombre = document.getElementById('registradoPor');

    if(miId && elId) elId.innerText = miId;
    if(miNombre && elNombre) elNombre.innerText = miNombre;
}

// --- CLIENTES ---
async function buscarClientePorDNI(dni) {
    const nombreClienteInput = document.getElementById('nombreCliente');
    const empresaClienteInput = document.getElementById('empresaCliente'); 
    const btnRegistrar = document.getElementById('btnRegistrarCliente'); 
    
    if(!nombreClienteInput) return; // Seguridad

    nombreClienteInput.value = 'Buscando...'; 
    if(btnRegistrar) btnRegistrar.style.display = 'none';

    if (dni.length !== 8) {
        nombreClienteInput.value = '';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL_CLIENTES}/buscar-dni/${dni}`);
        
        if (response.ok) {
            const data = await response.json();
            if(btnRegistrar) btnRegistrar.style.display = 'none';

            nombreClienteInput.value = data.nombresApellidos; 
            nombreClienteInput.style.color = "#ffffff"; 

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
            if(btnRegistrar) btnRegistrar.style.display = 'block'; 
        }
    } catch (error) {
        console.error(error);
        nombreClienteInput.value = "Error de conexión";
    }
}

// (Falta tu función buscarEmpresaPorRUC si la usas, agrégala si es necesario, si no, borra el listener)
function buscarEmpresaPorRUC(ruc) { 
    // Implementar si es necesario 
}

function abrirModalRegistro() {
    const tipo = document.getElementById('tipoDocumento').value;
    const numero = tipo === 'DNI' 
        ? document.getElementById('numeroDocumentoDNI').value 
        : document.getElementById('numeroDocumentoRUC').value;

    document.getElementById('modalTipoDoc').value = tipo;
    document.getElementById('modalNumeroDoc').value = numero;
    document.getElementById('modalNombre').value = "";
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
        nombresApellidos: nombre
    };

    try {
        const response = await fetch('/api/clientes', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoCliente)
        });

        if (response.ok) {
            const clienteGuardado = await response.json();
            alert("Cliente registrado correctamente");
            cerrarModalRegistro();
            document.getElementById('nombreCliente').value = clienteGuardado.nombresApellidos || clienteGuardado.nombres;
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
    
    if(!dniInput || !rucInput) return; // Seguridad

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

// --- FINALIZAR PEDIDO (Mesero y Cajero) ---
async function finalizarPedido() {
    const infoPedido = JSON.parse(localStorage.getItem('infoPedido'));
    const detallePedido = JSON.parse(localStorage.getItem('detallePedido'));

    if (!infoPedido || !infoPedido.pedidoId) return alert("Error: Falta información.");
    if (!detallePedido || detallePedido.length === 0) return alert("Pedido vacío.");

    const rolActual = localStorage.getItem('usuarioRol') || 'MESERO';

    const tipoDoc = document.getElementById('tipoDocumento').value;
    const esDni = tipoDoc === 'DNI';
    const numDoc = esDni 
        ? document.getElementById('numeroDocumentoDNI').value.trim() 
        : document.getElementById('numeroDocumentoRUC').value.trim();
    
    const nombreClienteTexto = esDni 
        ? document.getElementById('nombreCliente').value 
        : document.getElementById('empresaCliente').value;

    // VALIDACIÓN ESTRICTA
    if (!numDoc || numDoc.length < 8) {
        return alert(`⚠️ FALTAN DATOS:\nPor favor, ingrese un ${tipoDoc} válido del cliente.`);
    }

    if (!nombreClienteTexto || 
        nombreClienteTexto === "Cliente no registrado" || 
        nombreClienteTexto === "Buscando..." || 
        nombreClienteTexto === "Error de conexión" ||
        nombreClienteTexto.trim() === "") {
        return alert("⚠️ CLIENTE NO IDENTIFICADO:\n\nEl cliente no está registrado. Presione 'Registrar' antes de enviar.");
    }

    const mensajeConfirmacion = (rolActual === 'MESERO') 
        ? "¿Confirmar envío del pedido a CAJA?" 
        : "¿Confirma finalizar la venta y liberar la mesa?";

    if (!confirm(mensajeConfirmacion)) return;

    window.ultimoClienteInfo = { 
        nombre: nombreClienteTexto,
        doc: numDoc, 
        tipoDoc: tipoDoc 
    };

    const requestData = {
        pedidoId: infoPedido.pedidoId,
        detallePlatos: detallePedido.map(i => ({ platoId: i.platoId, cantidad: i.cantidad })),
        tipoDocumento: tipoDoc,
        numeroDocumento: esDni ? numDoc : null,
        rucEmpresa: !esDni ? numDoc : null,
        rolUsuario: rolActual 
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

        const responseText = await response.text();

        if (!response.ok) {
            console.error("Error servidor:", responseText);
            let mensajeError = "Error desconocido.";
            try {
                const errorJson = JSON.parse(responseText);
                mensajeError = errorJson.message || errorJson.error || responseText;
            } catch (e) { mensajeError = responseText; }
            throw new Error(mensajeError);
        }

        // ÉXITO
        window.ultimoPedidoGuardado = JSON.parse(responseText);
        window.ultimoDetallePedido = detallePedido;

        const modalExito = document.getElementById('modal-exito');
        const tituloExito = document.querySelector('#modal-exito h2') || document.getElementById('titulo-modal-exito');
        const btnPrint = document.getElementById('btnImprimir');
        const btnSalir = document.getElementById('btnSalirModal');

        if (modalExito) {
            if (rolActual === 'MESERO') {
                if(tituloExito) tituloExito.innerText = "¡Pedido Enviado a Caja!";
                if(btnPrint) btnPrint.style.display = 'none'; 
            } else {
                if(tituloExito) tituloExito.innerText = "¡Venta Exitosa!";
                if(btnPrint) {
                    btnPrint.style.display = 'inline-block';
                    btnPrint.onclick = () => generarBoletaHTML();
                }
            }
            // Aseguramos que el botón salir funcione
            if(btnSalir) btnSalir.onclick = cerrarModalYSalir;
            
            modalExito.style.display = 'flex';
        } else {
            if (rolActual === 'MESERO') alert("✅ Pedido enviado a caja.");
            else {
                alert("✅ Venta registrada.");
                generarBoletaHTML();
            }
            cerrarModalYSalir();
        }

    } catch (error) {
        console.error(error);
        alert("⚠️ NO SE PUDO PROCESAR:\n" + error.message);
        if(btn) {
            btn.disabled = false;
            btn.innerText = textoOriginal;
        }
    }
}

// --- FUNCIÓN CERRAR MODAL Y SALIR (IMPORTANTE) ---
function cerrarModalYSalir() {
    const modal = document.getElementById('modal-exito');
    if (modal) modal.style.display = 'none';

    localStorage.removeItem('detallePedido');
    localStorage.removeItem('infoPedido');

    // REDIRECCIÓN: Ajusta si tu archivo se llama diferente
    window.location.href = 'registrarpedido.html'; 
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