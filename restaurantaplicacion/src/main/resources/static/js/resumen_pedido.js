/**
 * resumen-pedido.js
 * Lógica final para la pantalla de Resumen del Pedido.
 */

// --- CONSTANTES DE LA API ---
const API_URL_CLIENTES = "http://localhost:8080/api/clientes"; 
const API_URL_EMPRESAS = "http://localhost:8080/api/empresas"; 
// ----------------------------

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosDelPedido();
    setupEventListeners(); 
    cargarEmpleadoLogueado(); 
});

function cargarDatosDelPedido() {
    const platosSeleccionados = JSON.parse(localStorage.getItem('detallePedido')) || [];
    const infoPedido = JSON.parse(localStorage.getItem('infoPedido')) || {};

    if (platosSeleccionados.length === 0 && !window.location.search.includes("test")) {
        // En un ambiente real, este alert solo debería ser para debug
        // alert("No se encontraron platos en el pedido. Volviendo al menú."); 
        // window.location.href = 'seleccionar_menu.html';
        // return; // Si descomenta las líneas de arriba, descomente esta
    }
    const tituloEl = document.getElementById('info-pedido-titulo');
    if (tituloEl) {
        if (infoPedido.tipo === 'LOCAL') {
            tituloEl.innerText = `Mesa N° ${infoPedido.mesa}`;
        } else {
            tituloEl.innerText = `Delivery N° ${infoPedido.pedidoId || 'N/A'}`;
        }
    }

    popularTabla(platosSeleccionados);
    calcularTotal(platosSeleccionados);
}

// ESTA FUNCIÓN FUE COMPLETAMENTE REPARADA Y LIMPIADA DE FRAGMENTOS HTML
function popularTabla(platos) {
    const tablaBody = document.getElementById('detalle-tabla-body');
    if (!tablaBody) return;
    tablaBody.innerHTML = ''; 
    
    // Muestra mensaje si el array está vacío
    if (platos.length === 0) {
        tablaBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;">No se han agregado platos al pedido.</td></tr>`;
        return;
    }
    
    platos.forEach(plato => {
        const fila = `
            <tr>
                <td class="col-desc">${plato.nombre}</td>
                <td class="col-cant">${plato.cantidad}</td>
                <td class="col-pu">S/ ${plato.precioUnitario.toFixed(2)}</td>
                <td class="col-sub">S/ ${plato.subtotal.toFixed(2)}</td>
                <td class="col-accion">
                    <button class="btn-tabla-editar" onclick="editarItem(${plato.platoId})">Editar</button>
                    <button class="btn-tabla-eliminar" onclick="eliminarItem(${plato.platoId})">Eliminar</button>
                </td>
            </tr>
        `;
        tablaBody.innerHTML += fila;
    });
}

function calcularTotal(platos) {
    const total = platos.reduce((sum, plato) => sum + plato.subtotal, 0);
    document.getElementById('total-general').innerText = `TOTAL: S/ ${total.toFixed(2)}`;
}

function setupEventListeners() {
    document.getElementById('tipoDocumento').addEventListener('change', (e) => toggleDocumentType(e.target.value));
    
    document.getElementById('numeroDocumentoDNI').addEventListener('blur', (e) => buscarClientePorDNI(e.target.value));
    document.getElementById('numeroDocumentoRUC').addEventListener('blur', (e) => buscarEmpresaPorRUC(e.target.value));
}

function toggleDocumentType(tipo) {
    const numeroDNI = document.getElementById('numeroDocumentoDNI');
    const numeroRUC = document.getElementById('numeroDocumentoRUC');
    const nombreCliente = document.getElementById('nombreCliente');
    const empresaCliente = document.getElementById('empresaCliente');

    // Limpieza inicial
    numeroDNI.value = '';
    numeroRUC.value = '';
    nombreCliente.value = '';
    empresaCliente.value = '';
    nombreCliente.placeholder = (tipo === 'DNI') ? "Cargado por DNI..." : "Nombre del Pensionado";


    if (tipo === 'RUC') {
        // FLUJO PENSIONADO: Muestra RUC input y output, y deja DNI input/output visibles
        numeroRUC.style.display = 'block'; 
        empresaCliente.style.display = 'block'; 

        // IMPORTANTE: NO ocultar numeroDNI para que el pensionado lo use.
        numeroDNI.style.display = 'block'; 
        
    } else { // tipo === 'DNI'
        // FLUJO CLIENTE REGULAR
        numeroDNI.style.display = 'block';
        
        // Oculta campos RUC
        numeroRUC.style.display = 'none';
        empresaCliente.style.display = 'none';
    }
}

function cargarEmpleadoLogueado() {
    const miId = localStorage.getItem('usuarioId') || 'N/A';
    const miRol = localStorage.getItem('usuarioRol') || 'N/A';
    
    if (miId !== 'N/A' && miId !== 'null') {
        document.getElementById('dniUsuario').value = miId; 
        document.getElementById('registradoPor').value = `Mesero/Cajero (ID: ${miId}) - Rol: ${miRol}`;
    } else {
        document.getElementById('dniUsuario').value = "ERROR";
        document.getElementById('registradoPor').value = "Inicie sesión de nuevo.";
    }
}

// ======================= [ FUNCIONES DE BÚSQUEDA ] =======================

async function buscarClientePorDNI(dni) {
    const nombreClienteInput = document.getElementById('nombreCliente');
    nombreClienteInput.value = 'Buscando...'; 

    if (dni.length !== 8) {
        nombreClienteInput.value = '';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL_CLIENTES}/buscar-dni/${dni}`);
        
        if (response.ok) {
            const cliente = await response.json();
            nombreClienteInput.value = cliente.nombresApellidos; 
            
        } else if (response.status === 404) {
            nombreClienteInput.value = "Cliente no registrado (404)";
            
        } else {
            nombreClienteInput.value = `Error ${response.status} en la API.`;
        }
    } catch (error) {
        nombreClienteInput.value = "Error de conexión";
    }
}

async function buscarEmpresaPorRUC(ruc) {
    const empresaClienteInput = document.getElementById('empresaCliente');
    empresaClienteInput.value = 'Buscando...';

    if (ruc.length !== 11) {
        empresaClienteInput.value = '';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL_EMPRESAS}?filtro=${ruc}`);
        
        if (response.ok) {
            const empresas = await response.json();
            
            if (empresas.length > 0) {
                 empresaClienteInput.value = empresas[0].razonSocial;
            } else {
                empresaClienteInput.value = "Empresa no registrada";
            }
            
        } else {
            empresaClienteInput.value = `Error ${response.status} en la API.`;
        }
    } catch (error) {
        empresaClienteInput.value = "Error de conexión";
    }
}


// ======================= [ LÓGICA DE BOTONES ] =======================

function editarItem(platoId) {
    let platos = JSON.parse(localStorage.getItem('detallePedido')) || [];
    const platoIndex = platos.findIndex(p => p.platoId === platoId);

    if (platoIndex > -1) {
        const platoActual = platos[platoIndex];
        let nuevaCantidad = prompt(`Editar cantidad para "${platoActual.nombre}". Cantidad actual: ${platoActual.cantidad}. Ingrese nueva cantidad:`, platoActual.cantidad);

        if (nuevaCantidad === null || nuevaCantidad.trim() === "") {
            return; // El usuario canceló o no ingresó nada
        }

        nuevaCantidad = parseInt(nuevaCantidad.trim());

        if (isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
            alert("Por favor, ingrese una cantidad numérica válida y mayor a cero.");
            return;
        }

        // Actualiza el objeto en el array
        platos[platoIndex].cantidad = nuevaCantidad;
        platos[platoIndex].subtotal = nuevaCantidad * platos[platoIndex].precioUnitario;

        // Guarda el array actualizado en localStorage
        localStorage.setItem('detallePedido', JSON.stringify(platos));

        // Recarga la tabla y el total
        cargarDatosDelPedido(); 
    } else {
        alert("Plato no encontrado para editar.");
    }
}
function eliminarItem(platoId) {
    if (!confirm("¿Está seguro de que desea eliminar este plato del pedido?")) {
        return;
    }
    let platos = JSON.parse(localStorage.getItem('detallePedido'));
    platos = platos.filter(p => p.platoId !== platoId);
    localStorage.setItem('detallePedido', JSON.stringify(platos));

    cargarDatosDelPedido();
}

// En resumen_pedido.js, REEMPLAZA la función finalizarPedido:

function finalizarPedido() {
    if (confirm("¿Está seguro de que desea finalizar el pedido? Esto guardará los detalles y limpiará la selección actual.")) {
        // Aquí iría la lógica para enviar el pedido a la base de datos (Backend)
        // Por ahora, solo simulamos que se "finalizó" y limpiamos el carrito.

        alert("Pedido finalizado con éxito. ¡Gracias!");

        // Limpiar el localStorage después de finalizar el pedido
        localStorage.removeItem('detallePedido');
        localStorage.removeItem('infoPedido');

        // Redirigir a la pantalla de selección de mesa o un inicio
        window.location.href = 'Local_mesa.html'; 
    }
}