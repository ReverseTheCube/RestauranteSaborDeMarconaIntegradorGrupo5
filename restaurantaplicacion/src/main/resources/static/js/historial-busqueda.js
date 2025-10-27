let formatoSeleccionado = null;
let incluirMarcaAgua = false;

// Establecer fechas por defecto (última semana)
const hoy = new Date();
const hace7Dias = new Date();
hace7Dias.setDate(hoy.getDate() - 7);

document.getElementById('fechaDesde').value = hace7Dias.toISOString().split('T')[0];
document.getElementById('fechaHasta').value = hoy.toISOString().split('T')[0];

function buscar() {
    // Obtener valores de los filtros
    const empresa = document.getElementById('empresa').value;
    const cliente = document.getElementById('cliente').value;
    const fechaDesde = document.getElementById('fechaDesde').value;
    const fechaHasta = document.getElementById('fechaHasta').value;
    const local = document.getElementById('local').value;
    const delivery = document.getElementById('delivery').value;

    // Validar que haya al menos un filtro
    // if (!empresa && !cliente && !local && !delivery && !fechaDesde && !fechaHasta) { // Ajusta la validación si es necesario
    //     alert('Por favor, selecciona al menos un filtro para buscar.');
    //     return;
    // }

    // --- AQUÍ IRÍA LA LLAMADA A LA API (fetch GET /api/pedidos) ---
    // Deberías pasar los filtros como parámetros en la URL, ej:
    // fetch(`/api/pedidos?cliente=${cliente}&fechaDesde=${fechaDesde}...`)
    // Y luego llenar la tabla con los resultados.

    // Por ahora, solo mostramos la sección con datos de ejemplo
    console.log('Buscando con filtros:', {
        empresa, cliente, fechaDesde, fechaHasta, local, delivery
    });

    // Mostrar sección de resultados (simulado)
    document.getElementById('resultadosSection').style.display = 'block';
    document.getElementById('numRegistros').textContent = '3'; // Ejemplo
    const desdeFormateada = formatDate(fechaDesde);
    const hastaFormateada = formatDate(fechaHasta);
    document.getElementById('rangoFechas').textContent = `${desdeFormateada} - ${hastaFormateada}`;

    // Llenar tabla (ejemplo)
    const tablaBody = document.getElementById('tablaResultadosBody');
    tablaBody.innerHTML = `
        <tr>
            <td>Marcona Delivery S.A.</td>
            <td>Jeanpier Rodriguez</td>
            <td>01/12</td>
            <td>S/1,200</td>
        </tr>
        <tr>
            <td>Sabores Andinos E.I.R.L.</td>
            <td>Jeanpier Lopez</td>
            <td>02/12</td>
            <td>S/850</td>
        </tr>
        <tr>
            <td>Marcona Delivery S.A.</td>
            <td>Jeanpier Torres</td>
            <td>03/12</td>
            <td>S/1,500</td>
        </tr>
    `;
    // Llenar paginación (ejemplo)
    document.getElementById('paginacion').innerHTML = `
        <span style="color: #e0e6ea; margin-right: 15px;">Pagina 1 de 1</span>
        <button class="page-button active">1</button>
    `;
}

function limpiarFiltros() {
    document.getElementById('empresa').value = '';
    document.getElementById('cliente').value = ''; // Limpiar también cliente
    document.getElementById('local').value = '';
    document.getElementById('delivery').value = '';

    // Restablecer fechas a última semana
    const hoy = new Date();
    const hace7Dias = new Date();
    hace7Dias.setDate(hoy.getDate() - 7);

    document.getElementById('fechaDesde').value = hace7Dias.toISOString().split('T')[0];
    document.getElementById('fechaHasta').value = hoy.toISOString().split('T')[0];

    // Ocultar resultados
    document.getElementById('resultadosSection').style.display = 'none';
}

function volverAtras() {
    // Asumiendo que vienes de admin.html
    window.location.href = 'admin.html';
}

function mostrarOpcionesDescarga() {
    formatoSeleccionado = null;
    incluirMarcaAgua = false;
    document.getElementById('downloadModal').style.display = 'flex';
    document.getElementById('btnDescargar').disabled = true;
    document.getElementById('watermarkOption').style.display = 'none';

    // Limpiar selecciones anteriores
    document.querySelectorAll('.download-option').forEach(option => {
        option.classList.remove('selected');
    });
}

function seleccionarFormato(formato) {
    formatoSeleccionado = formato;

    // Actualizar UI
    document.querySelectorAll('.download-option').forEach(option => {
        option.classList.remove('selected');
    });
    // Necesitamos el evento para saber qué elemento se clickeó
    // Buscamos el elemento por el formato seleccionado
    const options = document.querySelectorAll('.download-option');
    options.forEach(opt => {
        if (opt.getAttribute('onclick').includes(`'${formato}'`)) {
            opt.classList.add('selected');
        }
    });


    // Mostrar opción de marca de agua solo para PDF
    if (formato === 'pdf') {
        document.getElementById('watermarkOption').style.display = 'flex';
    } else {
        document.getElementById('watermarkOption').style.display = 'none';
    }

    // Habilitar botón de descarga
    document.getElementById('btnDescargar').disabled = false;
}


function descargarResultados() {
    if (!formatoSeleccionado) {
        alert('Por favor selecciona un formato de descarga.');
        return;
    }

    incluirMarcaAgua = document.getElementById('marcaAgua').checked;

    let mensaje = `Descargando resultados en formato ${formatoSeleccionado.toUpperCase()}`;
    if (formatoSeleccionado === 'pdf' && incluirMarcaAgua) {
        mensaje += ' con marca de agua "CONFIDENCIAL"';
    }

    alert(mensaje);
    cerrarModal();

    // --- AQUÍ IRÍA LA LÓGICA REAL DE DESCARGA ---
    // Dependiendo del formato, podrías llamar a un endpoint diferente
    // o usar una librería JS para generar el archivo (ej. jsPDF, SheetJS)
}

function cerrarModal() {
    document.getElementById('downloadModal').style.display = 'none';
}

function nuevaBusqueda() {
    document.getElementById('resultadosSection').style.display = 'none';
    // No limpiamos los filtros para que el usuario pueda refinar
}

function formatDate(dateString) {
    // Si no hay fecha, devuelve vacío
    if (!dateString) return '';
    // Formato DD/MM
    try {
        const date = new Date(dateString + 'T00:00:00'); // Asegura que se interprete como local
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    } catch (e) {
        return ''; // Devuelve vacío si la fecha es inválida
    }
}


// Paginación (Simulado - necesita lógica real)
document.querySelectorAll('.page-button').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.page-button').forEach(btn => {
            btn.classList.remove('active');
        });
        this.classList.add('active');
        // Aquí iría la lógica para cargar la página seleccionada (llamar a buscar con offset/limit)
        alert(`Cargando página ${this.textContent}...`);
    });
});

// Cerrar modal al hacer clic fuera
document.getElementById('downloadModal').addEventListener('click', function(e) {
    if (e.target === this) {
        cerrarModal();
    }
});