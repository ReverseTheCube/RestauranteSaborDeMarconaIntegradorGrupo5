document.getElementById('backButton').addEventListener('click', () => {
    window.location.href = 'ventaehistorial.html';
});

document.getElementById('generateButton').addEventListener('click', async () => {
    const periodoElement = document.querySelector('input[name="periodo"]:checked');
    if (!periodoElement) return alert("Seleccione un periodo.");
    
    const requestData = {
        periodo: periodoElement.id,
        fecha: document.getElementById('fechaInput').value,
        graficos: document.getElementById('graficos').checked,
        resumen: document.getElementById('resumen').checked,
        detallados: document.getElementById('detallados').checked,
        archivo: document.getElementById('tipoPdf').checked ? 'pdf' : 'excel'
    };

    // Validación simple de tipo de archivo
    if (!document.getElementById('tipoPdf').checked && !document.getElementById('tipoExcel').checked) {
        return alert("Seleccione PDF o Excel.");
    }

    const btn = document.getElementById('generateButton');
    btn.disabled = true;
    btn.textContent = "Generando...";

    try {
        const response = await fetch('/api/reportes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) throw new Error(await response.text());

        const reporte = await response.json();
        window.location.href = `ventaehistorialB.html?reporteId=${reporte.id}`;

    } catch (error) {
        alert("Error: " + error.message);
        btn.disabled = false;
        btn.textContent = "Generar Reporte";
    }
});

const fechaInput = document.getElementById('fechaInput');
fechaInput.disabled = true;
document.querySelectorAll('input[name="periodo"]').forEach(radio => {
    radio.addEventListener('change', function() {
        fechaInput.disabled = (this.id !== 'fechaReferencia');
    });
});