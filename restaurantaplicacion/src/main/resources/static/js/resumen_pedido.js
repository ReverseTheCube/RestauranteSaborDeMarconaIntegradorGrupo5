/**
 * resumen-pedido.js
 * Lógica para la pantalla de Resumen del Pedido.
 * 1. Carga los datos del pedido (platos, info) desde localStorage.
 * 2. Puebla la tabla de detalles y calcula el total.
 * 3. Maneja la lógica de UI para el selector DNI/RUC.
 * 4. Llama a APIs para buscar cliente y empleado.
 */

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosDelPedido();
    setupEventListeners()   ;
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
    document.getElementById('numeroDocumentoDNI').addEventListener('blur', (e) => buscarClientePorDNI(e.target.value));
    document.getElementById('numeroDocumentoRUC').addEventListener('blur', (e) => buscarEmpresaPorRUC(e.target.value));
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
    fetch('/api/usuarios/perfil') 
        .then(response => {
            if (!response.ok) throw new Error('Error al obtener perfil del empleado.');
            return response.json();
        })
        .then(usuario => {
            document.getElementById('dniUsuario').value = usuario.dni || 'N/A'; 
            document.getElementById('registradoPor').value = `Empleado: ${usuario.nombres} (ID: ${usuario.id})`;
        })
        .catch(error => {
            console.error('Error al cargar empleado:', error);
            document.getElementById('dniUsuario').value = "73172750";
            document.getElementById('registradoPor').value = "Empleado: Jorgito (ID: 3)";
        });
}

function buscarClientePorDNI(dni) {
    if (dni.length !== 8) return;
    console.log(`Buscando DNI: ${dni}`);
    setTimeout(() => {
        document.getElementById('nombreCliente').value = "Edgard C. (Simulado)";
    }, 500);
}

function buscarEmpresaPorRUC(ruc) {
    if (ruc.length !== 11) return;
    console.log(`Buscando RUC: ${ruc}`);

    setTimeout(() => {
        document.getElementById('empresaCliente').value = "MITSUI AUTO FINANCE (Simulado)";
    }, 500);
}

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