/**
 * resumen-pedido.js
 * Lógica para la pantalla de Resumen del Pedido.
 * 1. Carga los datos del pedido (platos, info) desde localStorage.
 * 2. Puebla la tabla de detalles y calcula el total.
 * 3. Maneja la lógica de UI para el selector DNI/RUC.
 * 4. Llama a APIs para buscar cliente y empresa.
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

    if (platosSeleccionados.length === 0 && !window.location.search.includes("test")) { // Permite tests
        alert("No se encontraron platos en el pedido. Volviendo al menú.");
        window.location.href = 'seleccionar_menu.html';
        return;
    }
    const tituloEl = document.getElementById('info-pedido-titulo');
    if (tituloEl) {
        if (infoPedido.tipo === 'LOCAL') {
            tituloEl.innerText = `Mesa N° ${infoPedido.mesa}`;
        } else {
            tituloEl.innerText = `Delivery N° ${infoPedido.pedidoId || 'N/A'}`;
        }
    } else {
        console.error("No se encontró el elemento #info-pedido-titulo en el HTML.");
    }

    popularTabla(platosSeleccionados);
    calcularTotal(platosSeleccionados);
}

function popularTabla(platos) {
    const tablaBody = document.getElementById('detalle-tabla-body');
    if (!tablaBody) return;
    tablaBody.innerHTML = ''; 
    platos.forEach(plato => {
        const fila = `
            <tr>
                <td>${plato.nombre}</td>
                <td>${plato.tipo || 'Plato'}</td>
                <td>${plato.cantidad}</td>
                <td>S/ ${plato.precioUnitario.toFixed(2)}</td>
                <td>S/ ${plato.subtotal.toFixed(2)}</td>
                <td>
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
    
    // --- CONEXIÓN DE BUSQUEDA REAL ---
    document.getElementById('numeroDocumentoDNI').addEventListener('blur', (e) => buscarClientePorDNI(e.target.value));
    document.getElementById('numeroDocumentoRUC').addEventListener('blur', (e) => buscarEmpresaPorRUC(e.target.value));
    // ----------------------------------
}

function toggleDocumentType(tipo) {
    const camposDNI = document.getElementById('camposDNI');
    const camposRUC = document.getElementById('camposRUC');

    if (tipo === 'RUC') {
        camposDNI.style.display = 'none';
        camposRUC.style.display = 'flex'; 
    } else {
        camposDNI.style.display = 'flex';
        camposRUC.style.display = 'none';
    }
}

function cargarEmpleadoLogueado() {
    console.log("Buscando empleado logueado...");
    // NOTA: Este endpoint '/api/usuarios/perfil' no fue confirmado en el backend. 
    // Mantenemos la simulación o usamos un ID fijo hasta implementarlo.
    
    // Deberías usar fetch('/api/usuarios/perfil') para obtener los datos del usuario logueado.
    // Usaremos la simulación por ahora:
    document.getElementById('dniUsuario').value = "73172750";
    document.getElementById('registradoPor').value = "Empleado: Jorgito (ID: 3)";
}

// =================================================================================
// 🚀 LÓGICA DE BÚSQUEDA REAL DE CLIENTES Y EMPRESAS
// =================================================================================

/**
 * Función que busca el cliente por DNI en la base de datos y rellena el campo.
 */
async function buscarClientePorDNI(dni) {
    const nombreClienteInput = document.getElementById('nombreCliente');
    nombreClienteInput.value = 'Buscando...'; 

    // 1. Validar DNI (ejemplo: 8 dígitos)
    if (dni.length !== 8) {
        nombreClienteInput.value = '';
        return;
    }
    
    try {
        // Llama a: GET /api/clientes/buscar-dni/{dni}
        const response = await fetch(`${API_URL_CLIENTES}/buscar-dni/${dni}`);
        
        if (response.ok) {
            const cliente = await response.json();
            nombreClienteInput.value = cliente.nombresApellidos; 
            
        } else if (response.status === 404) {
            nombreClienteInput.value = "Cliente no registrado";
            
        } else {
            throw new Error(`Error ${response.status}`);
        }
    } catch (error) {
        console.error('Error al buscar cliente por DNI:', error);
        nombreClienteInput.value = "Error de conexión";
    }
}

/**
 * Función que busca la empresa por RUC en la base de datos y rellena el campo.
 */
async function buscarEmpresaPorRUC(ruc) {
    const empresaClienteInput = document.getElementById('empresaCliente');
    empresaClienteInput.value = 'Buscando...';

    // 1. Validar RUC (ejemplo: 11 dígitos)
    if (ruc.length !== 11) {
        empresaClienteInput.value = '';
        return;
    }
    
    try {
        // Llama a: GET /api/empresas/buscar-ruc/{ruc} (Asumiendo que existe o usamos la ruta genérica)
        const response = await fetch(`${API_URL_EMPRESAS}?filtro=${ruc}`);
        
        if (response.ok) {
            const empresas = await response.json();
            
            // Suponemos que la API de empresas/buscar devuelve una lista, tomamos el primero
            if (empresas.length > 0) {
                 empresaClienteInput.value = empresas[0].razonSocial;
            } else {
                empresaClienteInput.value = "Empresa no registrada";
            }
            
        } else {
            throw new Error(`Error ${response.status}`);
        }
    } catch (error) {
        console.error('Error al buscar empresa por RUC:', error);
        empresaClienteInput.value = "Error de conexión";
    }
}


// =================================================================================
// LÓGICA EXISTENTE
// =================================================================================

function editarItem(platoId) {
    alert(`Funcionalidad "Editar" (ID: ${platoId}) no implementada.`);
    
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


function finalizarPedido() {
    alert("TODO: Implementar lógica final de guardado de pedido.");
}