// Funcionalidad para los botones
document.getElementById('backButton').addEventListener('click', () => {
    // Vuelve a la pantalla anterior (ventaehistorial.html)
    window.location.href = 'ventaehistorial.html';
});

document.getElementById('generateButton').addEventListener('click', async () => { // Marcado como async
    // 1. Obtener las opciones seleccionadas
    const periodoSeleccionado = document.querySelector('input[name="periodo"]:checked').id;
    const fechaReferencia = document.getElementById('fechaInput').value;
    const incluirGraficos = document.getElementById('graficos').checked;
    const incluirResumen = document.getElementById('resumen').checked;
    const datosDetallados = document.getElementById('detallados').checked;
    // Obtiene 'pdf' o 'excel' directamente
    const tipoArchivo = document.querySelector('input[name="tipoArchivo"]:checked')?.id.replace('tipo', '').toLowerCase();

    // 2. Validar que se seleccionó tipo de archivo
    if (!tipoArchivo) {
        alert("Por favor, seleccione un tipo de archivo (PDF o Excel).");
        return;
    }

    // 3. Mostrar mensaje de generación
    alert('Generando reporte...');
    console.log("Configuración del reporte:", {
        periodo: periodoSeleccionado,
        fecha: fechaReferencia,
        graficos: incluirGraficos,
        resumen: incluirResumen,
        detallados: datosDetallados,
        archivo: tipoArchivo // Ya está en minúscula 'pdf' o 'excel'
    });

    // 4. Simular llamada a API para generar el reporte y obtener un ID

    // Como no tenemos la API real, simulamos un ID de reporte
    const reporteIdSimulado = Math.floor(Math.random() * 1000) + 1; // Genera un ID aleatorio (ej. 123)

    // 5. Redirigir a la pantalla de resultados B, PASANDO EL ID en la URL
    window.location.href = `ventaehistorialB.html?reporteId=${reporteIdSimulado}`;
    // La URL se verá así: ventaehistorialB.html?reporteId=123
});

// Desactivar el campo de fecha inicialmente y manejar cambios
const fechaRadio = document.getElementById('fechaReferencia');
const fechaInput = document.getElementById('fechaInput');
fechaInput.disabled = true; // Empieza deshabilitado

const periodos = document.querySelectorAll('input[name="periodo"]');
periodos.forEach(radio => {
    radio.addEventListener('change', function() {
        // Habilita el input de fecha solo si se selecciona "Fecha de Referencia"
        fechaInput.disabled = (this.id !== 'fechaReferencia');
    });
});