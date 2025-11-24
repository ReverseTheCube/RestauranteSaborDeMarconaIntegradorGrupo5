// Funcionalidad para los botones de navegación
document.getElementById('backButton').addEventListener('click', () => {
    window.location.href = 'ventaehistorial.html';
});

// Manejo del botón "Generar Reporte"
document.getElementById('generateButton').addEventListener('click', async () => {
    
    // 1. Obtener las opciones seleccionadas por el usuario
    const periodoElement = document.querySelector('input[name="periodo"]:checked');
    if (!periodoElement) {
        alert("Por favor, seleccione un periodo.");
        return;
    }
    const periodoSeleccionado = periodoElement.id; // 'diario', 'quincenal', etc.
    
    const fechaReferencia = document.getElementById('fechaInput').value;
    
    // Checkboxes de contenido
    const incluirGraficos = document.getElementById('graficos').checked;
    const incluirResumen = document.getElementById('resumen').checked;
    const datosDetallados = document.getElementById('detallados').checked;

    // Determinar tipo de archivo (PDF o Excel)
    let tipoArchivo = null;
    if (document.getElementById('tipoPdf').checked) tipoArchivo = 'pdf';
    if (document.getElementById('tipoExcel').checked) tipoArchivo = 'excel';

    // 2. Validaciones antes de enviar
    if (!tipoArchivo) {
        alert("Por favor, seleccione un tipo de archivo (PDF o Excel).");
        return;
    }

    if (periodoSeleccionado === 'fechaReferencia' && !fechaReferencia) {
        alert("Por favor, seleccione una fecha de referencia en el calendario.");
        return;
    }

    // Bloquear botón para evitar dobles clics
    const btnGenerar = document.getElementById('generateButton');
    btnGenerar.disabled = true;
    btnGenerar.textContent = "Generando...";

    // 3. Preparar los datos para enviar al Backend (DTO)
    const requestData = {
        periodo: periodoSeleccionado,
        fecha: fechaReferencia, 
        graficos: incluirGraficos,
        resumen: incluirResumen,
        detallados: datosDetallados,
        archivo: tipoArchivo
    };

    try {
        console.log("Enviando solicitud de reporte:", requestData);

        // 4. Llamada REAL a la API Spring Boot
        const response = await fetch('/api/reportes', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Error del servidor: ${response.status}`);
        }

        // 5. Obtener respuesta exitosa (con el ID del reporte generado)
        const reporteGenerado = await response.json();
        console.log("Reporte generado con éxito. ID:", reporteGenerado.id);

        // 6. Redirigir a la pantalla de resultados B pasando el ID real
        window.location.href = `ventaehistorialB.html?reporteId=${reporteGenerado.id}`;

    } catch (error) {
        console.error("Error al generar reporte:", error);
        alert("Hubo un problema al generar el reporte:\n" + error.message);
        
        // Restaurar botón en caso de error
        btnGenerar.disabled = false;
        btnGenerar.textContent = "Generar Reporte";
    }
});

// --- Lógica visual para habilitar/deshabilitar el calendario ---
const fechaInput = document.getElementById('fechaInput');
fechaInput.disabled = true; // Empieza deshabilitado

const periodos = document.querySelectorAll('input[name="periodo"]');
periodos.forEach(radio => {
    radio.addEventListener('change', function() {
        // Solo habilita el input de fecha si se selecciona "Fecha de Referencia"
        fechaInput.disabled = (this.id !== 'fechaReferencia');
        if (!fechaInput.disabled) {
            fechaInput.focus(); // Poner el cursor ahí automáticamente
        } else {
            fechaInput.value = ""; // Limpiar si se deshabilita
        }
    });
});