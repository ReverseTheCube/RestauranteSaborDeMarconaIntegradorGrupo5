let formatoSeleccionado = null;
let incluirMarcaAgua = false;

// --- URLs DE LAS APIS ---
const API_PEDIDOS = "http://localhost:8080/api/pedidos";
const API_EMPRESAS = "http://localhost:8080/api/empresas";
const API_CLIENTES = "http://localhost:8080/api/clientes";


// --- INICIO: CÓDIGO NUEVO PARA CARGAR FILTROS ---

// Se ejecuta cuando el HTML termina de cargar
document.addEventListener('DOMContentLoaded', () => {
    establecerFechasPorDefecto();
    cargarFiltrosDinamicos();
});

// Función para poner las fechas de la última semana
function establecerFechasPorDefecto() {
    const hoy = new Date();
    const hace7Dias = new Date();
    hace7Dias.setDate(hoy.getDate() - 7);

    document.getElementById('fechaDesde').value = hace7Dias.toISOString().split('T')[0];
    document.getElementById('fechaHasta').value = hoy.toISOString().split('T')[0];
}

// Función para llamar a las APIs y llenar los <select>
async function cargarFiltrosDinamicos() {
    try {
        // Cargar Empresas
        const responseEmpresas = await fetch(API_EMPRESAS);
        if (!responseEmpresas.ok) throw new Error('Error al cargar empresas');
        const empresas = await responseEmpresas.json();
        
        const selectEmpresa = document.getElementById('empresa');
        empresas.forEach(empresa => {
            const option = document.createElement('option');
            option.value = empresa.ruc; // Usamos RUC como valor
            option.textContent = empresa.razonSocial; // Mostramos la Razón Social
            selectEmpresa.appendChild(option);
        });

        // Cargar Clientes
        const responseClientes = await fetch(API_CLIENTES);
        if (!responseClientes.ok) throw new Error('Error al cargar clientes');
        const clientes = await responseClientes.json();
        
        const selectCliente = document.getElementById('cliente');
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id; // Usamos el ID como valor
            option.textContent = cliente.nombresApellidos; // Mostramos el Nombre
            selectCliente.appendChild(option);
        });

    } catch (error) {
        console.error("Error cargando filtros dinámicos:", error);
        alert("No se pudieron cargar los filtros (Empresas/Clientes). " + error.message);
    }
}

// --- FIN: CÓDIGO NUEVO PARA CARGAR FILTROS ---


async function buscar() { // Añadimos async
    // Obtener valores de los filtros
    const empresaRuc = document.getElementById('empresa').value;
    const clienteId = document.getElementById('cliente').value; // Ahora es un ID de cliente
    const fechaDesde = document.getElementById('fechaDesde').value;
    const fechaHasta = document.getElementById('fechaHasta').value;
    const local = document.getElementById('local').value;
    const delivery = document.getElementById('delivery').value;

    console.log('Buscando con filtros:', { empresaRuc, clienteId, fechaDesde, fechaHasta, local, delivery });

    try {
        // Construir la URL con parámetros de consulta
        const params = new URLSearchParams();
        if (clienteId) params.append('clienteId', clienteId); // Enviamos el ID del cliente
        if (fechaDesde) params.append('fechaDesde', fechaDesde);
        if (fechaHasta) params.append('fechaHasta', fechaHasta);
        if (empresaRuc) params.append('ruc', empresaRuc); // Enviamos el RUC de la empresa
        // (Necesitarás implementar la lógica para estos filtros en tu PedidoController/Service)

        const response = await fetch(`${API_PEDIDOS}?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo obtener el historial.`);
        }

        const pedidos = await response.json(); 

        // --- LLENAR LA TABLA CON DATOS REALES ---
        const tablaBody = document.getElementById('tablaResultadosBody');
        const numRegistrosSpan = document.getElementById('numRegistros');
        const rangoFechasSpan = document.getElementById('rangoFechas');
        const paginacionDiv = document.getElementById('paginacion');
        const resultadosSection = document.getElementById('resultadosSection');

        tablaBody.innerHTML = ''; 

        if (pedidos.length === 0) {
            numRegistrosSpan.textContent = '0';
            tablaBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No se encontraron pedidos con esos criterios.</td></tr>';
            paginacionDiv.innerHTML = ''; 
        } else {
            numRegistrosSpan.textContent = pedidos.length; 

            pedidos.forEach(pedido => {
                const nombreCliente = pedido.usuario ? pedido.usuario.usuario : 'Desconocido';
                // En el futuro, la API debería devolver el nombre de la empresa e info del cliente
                const nombreEmpresa = "Empresa (Dato Real)"; 
                
                const fila = `
                    <tr>
                        <td>${nombreEmpresa}</td>
                        <td>${nombreCliente}</td>
                        <td>${formatearFechaSimple(pedido.fechaHora)}</td>
                        <td>${formatoMoneda(pedido.total)}</td>
                    </tr>
                `;
                tablaBody.innerHTML += fila;
            });

            paginacionDiv.innerHTML = `
                <span style="color: #e0e6ea; margin-right: 15px;">Mostrando ${pedidos.length} registros</span>
                <button class="page-button active">1</button>
            `;
        }

        const desdeFormateada = formatDate(fechaDesde);
        const hastaFormateada = formatDate(fechaHasta);
        rangoFechasSpan.textContent = `${desdeFormateada} - ${hastaFormateada}`;
        resultadosSection.style.display = 'block';

    } catch (error) {
        console.error("Error al buscar pedidos:", error);
        alert(`Error al buscar los pedidos: ${error.message}`);
        resultadosSection.style.display = 'none';
    }
}

function limpiarFiltros() {
    document.getElementById('empresa').value = '';
    document.getElementById('cliente').value = ''; 
    document.getElementById('local').value = '';
    document.getElementById('delivery').value = '';
    establecerFechasPorDefecto(); // Restablecer fechas
    document.getElementById('resultadosSection').style.display = 'none';
}

function volverAtras() {
    window.location.href = 'ventaehistorial.html'; // Corregido para volver al menú de historial
}

function mostrarOpcionesDescarga() {
    formatoSeleccionado = null;
    incluirMarcaAgua = false;
    document.getElementById('downloadModal').style.display = 'flex';
    document.getElementById('btnDescargar').disabled = true;
    document.getElementById('watermarkOption').style.display = 'none';
    document.querySelectorAll('.download-option').forEach(option => {
        option.classList.remove('selected');
    });
}

function seleccionarFormato(formato) {
    formatoSeleccionado = formato;
    document.querySelectorAll('.download-option').forEach(option => {
        option.classList.remove('selected');
    });
    const clickedOption = event.currentTarget;
    if(clickedOption){
        clickedOption.classList.add('selected');
    }
    document.getElementById('watermarkOption').style.display = (formato === 'pdf') ? 'flex' : 'none';
    document.getElementById('btnDescargar').disabled = false;
}

function descargarResultados() {
    if (!formatoSeleccionado) {
        alert('Por favor selecciona un formato de descarga.');
        return;
    }
    
    // (Lógica de descarga real usando la API de Reportes - necesita implementación en backend)
    alert(`Simulando descarga en ${formatoSeleccionado}... (requiere API de Reportes)`);
    cerrarModal();
}

function cerrarModal() {
    document.getElementById('downloadModal').style.display = 'none';
}

function nuevaBusqueda() {
    document.getElementById('resultadosSection').style.display = 'none';
}

function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const dateParts = dateString.split('-'); 
        const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    } catch (e) { return ''; }
}

function formatearFechaSimple(fechaISO) {
    if (!fechaISO) return '-';
    try {
        const fecha = new Date(fechaISO);
        return `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
    } catch(e) { return fechaISO; }
}

function formatoMoneda(valor) {
    if (valor === null || valor === undefined) return '-';
    try {
        return `S/ ${valor.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } catch(e) { return '-'; }
}

// Paginación (Simulado)
document.querySelectorAll('.page-button').forEach(button => {
    button.addEventListener('click', function() {
        // ... (lógica de paginación real iría aquí) ...
        alert(`Simulando carga de página ${this.textContent}... (No implementado)`);
    });
});

// Cerrar modal
document.getElementById('downloadModal').addEventListener('click', function(e) {
    if (e.target === this) {
        cerrarModal();
    }
});