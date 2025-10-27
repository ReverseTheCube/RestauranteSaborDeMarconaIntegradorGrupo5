// URL base de la API (ajusta si es diferente)
const API_BASE_URL = "http://localhost:8080/api"; // URL base general
const API_REPORTE_URL = `${API_BASE_URL}/reportes`; // URL para reportes

let datosReporte = null; // Para guardar los datos del reporte actual

// Cargar datos del reporte al iniciar la página
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const reporteId = urlParams.get('reporteId');

    if (!reporteId) {
        alert("Error: No se especificó un ID de reporte.");
        // Podrías redirigir si no hay ID
        // window.location.href = 'ventaehistorialA.html';
        return;
    }

    try {
        // --- LLAMADA A TU API PARA OBTENER DETALLES ---
        const response = await fetch(`${API_REPORTE_URL}/${reporteId}`); // GET /api/reportes/123

        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo cargar el reporte ${reporteId}`);
        }
        datosReporte = await response.json();

        // Actualizar la interfaz
        document.getElementById('fechaConsulta').textContent = formatearFecha(datosReporte.fechaGeneracion);
        document.getElementById('registrosProcesados').textContent = datosReporte.numeroRegistros;
        document.getElementById('nombreArchivo').textContent = datosReporte.nombreArchivo;
        document.getElementById('tamanoArchivo').textContent = datosReporte.tamanoArchivo;

    } catch (error) {
        console.error("Error al cargar reporte:", error);
        alert(`No se pudo cargar la información del reporte ${reporteId}. ${error.message}`);
        // Limpiar interfaz en caso de error
        document.getElementById('fechaConsulta').textContent = 'Error';
        document.getElementById('registrosProcesados').textContent = '-';
        document.getElementById('nombreArchivo').textContent = 'No disponible';
        document.getElementById('tamanoArchivo').textContent = '-';
    }
});


// Funciones de los botones
function guardarDispositivo() {
    if (!datosReporte || !datosReporte.nombreArchivo) {
        return alert("No hay información del archivo para guardar.");
    }

    // --- LÓGICA DE DESCARGA REAL ---
    // Construye la URL de descarga. Asume que tu backend tiene un endpoint
    // GET /api/reportes/descargar?archivo=nombre_del_archivo.pdf
    // que envía el archivo con la cabecera 'Content-Disposition: attachment'.
    const urlDescarga = `${API_REPORTE_URL}/descargar?archivo=${encodeURIComponent(datosReporte.nombreArchivo)}`;

    // Redirige el navegador a la URL de descarga.
    // Esto iniciará la descarga automáticamente si el backend está configurado correctamente.
    console.log("Iniciando descarga desde:", urlDescarga);
    window.location.href = urlDescarga;
}

function visualizarNavegador() {
    if (!datosReporte || !datosReporte.nombreArchivo) {
        return alert("No hay información del archivo para visualizar.");
    }

    // --- LÓGICA DE VISUALIZACIÓN REAL ---
    // Asume que tu backend tiene un endpoint GET /api/reportes/ver?archivo=...
    // que envía el archivo con la cabecera 'Content-Disposition: inline' (para PDF)
    // o el Content-Type correcto para otros formatos.
    const urlVisualizacion = `${API_REPORTE_URL}/ver?archivo=${encodeURIComponent(datosReporte.nombreArchivo)}`;

    console.log("Abriendo visualización en:", urlVisualizacion);
    // Abre la URL en una nueva pestaña.
    window.open(urlVisualizacion, '_blank');
}

function nuevoReporte() {
    // Siempre redirige a la pantalla de configuración A
    window.location.href = 'ventaehistorialA.html';
}

// Función auxiliar para formatear fechas
function formatearFecha(fechaISO) {
    if (!fechaISO) return '-';
    try {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-PE', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    } catch (e) {
        return fechaISO;
    }
}