// --- URLs DE LAS APIS ---
const API_PEDIDOS_BUSCAR = "/api/pedidos/buscar";
const API_EMPRESAS = "/api/empresas";
const API_CLIENTES = "/api/clientes";

// --- AL CARGAR LA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    establecerFechasPorDefecto();
    cargarFiltrosDinamicos();
});

function establecerFechasPorDefecto() {
    const hoy = new Date();
    const hace7Dias = new Date();
    hace7Dias.setDate(hoy.getDate() - 7);

    // Formato YYYY-MM-DD para los inputs type="date"
    document.getElementById('fechaDesde').value = hace7Dias.toISOString().split('T')[0];
    document.getElementById('fechaHasta').value = hoy.toISOString().split('T')[0];
}

async function cargarFiltrosDinamicos() {
    try {
        // 1. Cargar Empresas
        const respEmp = await fetch(API_EMPRESAS);
        if (respEmp.ok) {
            const empresas = await respEmp.json();
            const selectEmp = document.getElementById('empresa');
            empresas.forEach(e => {
                const opt = document.createElement('option');
                opt.value = e.ruc;
                opt.textContent = e.razonSocial;
                selectEmp.appendChild(opt);
            });
        }

        // 2. Cargar Clientes
        const respCli = await fetch(API_CLIENTES);
        if (respCli.ok) {
            const clientes = await respCli.json();
            const selectCli = document.getElementById('cliente');
            clientes.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.nombresApellidos; // O c.numeroDocumento
                selectCli.appendChild(opt);
            });
        }
    } catch (error) {
        console.error("Error cargando filtros:", error);
    }
}

// --- FUNCIÓN PRINCIPAL: BUSCAR ---
async function buscar() {
    const btn = document.querySelector('.action-button.search');
    btn.disabled = true;
    btn.textContent = "Buscando...";

    // 1. Obtener valores del HTML
    const empresaRuc = document.getElementById('empresa').value;
    const clienteId = document.getElementById('cliente').value;
    const fDesde = document.getElementById('fechaDesde').value;
    const fHasta = document.getElementById('fechaHasta').value;
    const localMesa = document.getElementById('local').value; // "mesa1", "mesa2"...
    const deliveryCode = document.getElementById('delivery').value;

    // 2. Construir URL con parámetros
    const params = new URLSearchParams();
    if (empresaRuc) params.append('rucEmpresa', empresaRuc);
    if (clienteId) params.append('clienteId', clienteId);
    if (fDesde) params.append('fechaDesde', fDesde);
    if (fHasta) params.append('fechaHasta', fHasta);
    if (localMesa) params.append('mesa', localMesa);
    if (deliveryCode) params.append('delivery', deliveryCode);

    try {
        const response = await fetch(`${API_PEDIDOS_BUSCAR}?${params.toString()}`);
        
        if (!response.ok) throw new Error("Error en la búsqueda");

        const pedidos = await response.json();
        renderizarTabla(pedidos);
        
        // Mostrar sección de resultados
        document.getElementById('resultadosSection').style.display = 'block';
        document.getElementById('numRegistros').textContent = pedidos.length;
        document.getElementById('rangoFechas').textContent = `${fDesde} al ${fHasta}`;

    } catch (error) {
        alert("Error: " + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = "Buscar";
    }
}

function renderizarTabla(pedidos) {
    const tbody = document.getElementById('tablaResultadosBody');
    tbody.innerHTML = '';

    if (pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">No se encontraron resultados.</td></tr>';
        return;
    }

    pedidos.forEach(p => {
        // Lógica para mostrar datos bonitos (evitar nulls)
        const empresaNombre = p.empresa ? p.empresa.razonSocial : "Particular";
        const clienteNombre = p.cliente ? p.cliente.nombresApellidos : "Cliente General";
        
        // Formatear fecha
        const fechaObj = new Date(p.fechaHora);
        const fechaStr = fechaObj.toLocaleDateString() + ' ' + fechaObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        const tr = `
            <tr>
                <td>${empresaNombre}</td>
                <td>${clienteNombre}</td>
                <td>${fechaStr}</td>
                <td style="font-weight:bold; color:#2ecc71;">S/ ${p.total.toFixed(2)}</td>
            </tr>
        `;
        tbody.innerHTML += tr;
    });
}

function limpiarFiltros() {
    document.getElementById('empresa').value = "";
    document.getElementById('cliente').value = "";
    document.getElementById('local').value = "";
    document.getElementById('delivery').value = "";
    establecerFechasPorDefecto();
    document.getElementById('resultadosSection').style.display = 'none';
}

function volverAtras() {
    window.location.href = 'ventaehistorial.html';
}

// Funciones placeholder para la descarga (requeriría lógica extra en backend si quieres descargar esta tabla específica)
function mostrarOpcionesDescarga() {
    document.getElementById('downloadModal').style.display = 'flex';
}
function cerrarModal() {
    document.getElementById('downloadModal').style.display = 'none';
}
// Seleccionar formato visualmente
function seleccionarFormato(tipo) {
    document.querySelectorAll('.download-option').forEach(el => el.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    document.getElementById('btnDescargar').disabled = false;
}
function descargarResultados() {
    alert("Funcionalidad de descarga de búsqueda específica pendiente de implementación.");
    cerrarModal();
}