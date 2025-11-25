// --- URLs ---
const API_PEDIDOS_BUSCAR = "/api/pedidos/buscar";
const API_EMPRESAS = "/api/empresas";
const API_CLIENTES = "/api/clientes";

// --- INICIO ---
document.addEventListener('DOMContentLoaded', () => {
    establecerFechasPorDefecto();
    cargarFiltrosDinamicos();
    
    // Configurar cierre del modal al hacer clic fuera
    document.getElementById('downloadModal').addEventListener('click', function(e) {
        if (e.target === this) cerrarModal();
    });
});

function establecerFechasPorDefecto() {
    const hoy = new Date();
    const hace7Dias = new Date();
    hace7Dias.setDate(hoy.getDate() - 7);
    
    // Formato YYYY-MM-DD
    document.getElementById('fechaDesde').value = hace7Dias.toISOString().split('T')[0];
    document.getElementById('fechaHasta').value = hoy.toISOString().split('T')[0];
}

async function cargarFiltrosDinamicos() {
    try {
        // Empresas
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
        // Clientes
        const respCli = await fetch(API_CLIENTES);
        if (respCli.ok) {
            const clientes = await respCli.json();
            const selectCli = document.getElementById('cliente');
            clientes.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.nombresApellidos;
                selectCli.appendChild(opt);
            });
        }
    } catch (error) {
        console.error("Error filtros:", error);
    }
}

// --- BUSCAR ---
async function buscar() {
    const btn = document.querySelector('.action-button.search');
    const textoOriginal = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Buscando...";

    const params = new URLSearchParams();
    
    // Solo agregamos parámetros si tienen valor
    const ruc = document.getElementById('empresa').value;
    if(ruc) params.append('rucEmpresa', ruc);
    
    const cli = document.getElementById('cliente').value;
    if(cli) params.append('clienteId', cli);
    
    const fDesde = document.getElementById('fechaDesde').value;
    if(fDesde) params.append('fechaDesde', fDesde);
    
    const fHasta = document.getElementById('fechaHasta').value;
    if(fHasta) params.append('fechaHasta', fHasta);
    
    const mesa = document.getElementById('local').value;
    if(mesa) params.append('mesa', mesa);
    
    const del = document.getElementById('delivery').value;
    if(del) params.append('delivery', del);

    try {
        const response = await fetch(`${API_PEDIDOS_BUSCAR}?${params.toString()}`);
        if (!response.ok) throw new Error("Error al consultar API");

        const pedidos = await response.json();
        
        // Renderizar
        const tbody = document.getElementById('tablaResultadosBody');
        tbody.innerHTML = '';
        
        if (pedidos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">No se encontraron resultados.</td></tr>';
        } else {
            pedidos.forEach(p => {
                // Evitar nulls visuales
                const empresa = p.empresa ? p.empresa.razonSocial : "-";
                const cliente = p.cliente ? p.cliente.nombresApellidos : "Público General";
                const fecha = new Date(p.fechaHora).toLocaleString();
                
                tbody.innerHTML += `
                    <tr>
                        <td>${empresa}</td>
                        <td>${cliente}</td>
                        <td>${fecha}</td>
                        <td style="font-weight:bold; color:#f59e0b;">S/ ${p.total.toFixed(2)}</td>
                    </tr>
                `;
            });
        }

        // Mostrar panel resultados
        document.getElementById('resultadosSection').style.display = 'block';
        document.getElementById('numRegistros').textContent = pedidos.length;
        document.getElementById('rangoFechas').textContent = `${fDesde} al ${fHasta}`;

    } catch (error) {
        alert("Error: " + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = textoOriginal;
    }
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

// --- MODAL DE DESCARGA ---
let formatoSeleccionado = null;

function mostrarOpcionesDescarga() {
    // Reiniciar estado
    formatoSeleccionado = null;
    document.querySelectorAll('.download-option').forEach(el => el.classList.remove('selected'));
    document.getElementById('watermarkOption').style.display = 'none';
    document.getElementById('btnDescargar').disabled = true;
    
    // Mostrar modal
    document.getElementById('downloadModal').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('downloadModal').style.display = 'none';
}

function seleccionarFormato(fmt) {
    formatoSeleccionado = fmt;
    
    // Estilos visuales de selección
    document.querySelectorAll('.download-option').forEach(el => el.classList.remove('selected'));
    // El evento click viene del div .download-option
    // Nota: en el HTML asegúrate de pasar 'pdf' o 'excel' como string
    // y que el onclick sea onclick="seleccionarFormato('pdf')" etc.
    
    // Truco para resaltar el div clickeado:
    const options = document.querySelectorAll('.download-option');
    if(fmt === 'pdf') options[0].classList.add('selected');
    if(fmt === 'excel') options[1].classList.add('selected');

    // Mostrar opción marca de agua solo para PDF
    document.getElementById('watermarkOption').style.display = (fmt === 'pdf') ? 'flex' : 'none';
    document.getElementById('btnDescargar').disabled = false;
}

function descargarResultados() {
    if (!formatoSeleccionado) {
        alert("Por favor seleccione un formato (PDF o Excel).");
        return;
    }

    // 1. Recolectar los mismos filtros de la pantalla
    const ruc = document.getElementById('empresa').value;
    const cli = document.getElementById('cliente').value;
    const fDesde = document.getElementById('fechaDesde').value;
    const fHasta = document.getElementById('fechaHasta').value;
    const mesa = document.getElementById('local').value;
    const del = document.getElementById('delivery').value;

    // 2. Construir URL de descarga
    const params = new URLSearchParams();
    if(ruc) params.append('rucEmpresa', ruc);
    if(cli) params.append('clienteId', cli);
    if(fDesde) params.append('fechaDesde', fDesde);
    if(fHasta) params.append('fechaHasta', fHasta);
    if(mesa) params.append('mesa', mesa);
    if(del) params.append('delivery', del);
    
    // Agregar el formato seleccionado (pdf o excel)
    params.append('formato', formatoSeleccionado);

    // 3. Iniciar descarga directa
    // Usamos window.location.href para que el navegador maneje la descarga del archivo
    const urlDescarga = `/api/reportes/busqueda/descargar?${params.toString()}`;
    
    console.log("Descargando desde:", urlDescarga);
    window.location.href = urlDescarga;

    // Cerrar modal
    cerrarModal();
}