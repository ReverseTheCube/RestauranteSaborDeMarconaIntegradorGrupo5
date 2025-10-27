let formatoSeleccionado = null;
let incluirMarcaAgua = false;

// Establecer fechas por defecto (última semana)
const hoy = new Date();
const hace7Dias = new Date();
hace7Dias.setDate(hoy.getDate() - 7);

document.getElementById('fechaDesde').value = hace7Dias.toISOString().split('T')[0];
document.getElementById('fechaHasta').value = hoy.toISOString().split('T')[0];

async function buscar() { // Añadimos async para usar await
    // Obtener valores de los filtros
    const empresa = document.getElementById('empresa').value;
    const cliente = document.getElementById('cliente').value;
    const fechaDesde = document.getElementById('fechaDesde').value;
    const fechaHasta = document.getElementById('fechaHasta').value;
    const local = document.getElementById('local').value;
    const delivery = document.getElementById('delivery').value;

    console.log('Buscando con filtros:', { empresa, cliente, fechaDesde, fechaHasta, local, delivery });

    // --- CONEXIÓN REAL CON LA API ---
    try {
        // Construir la URL con parámetros de consulta (solo si tienen valor)
        // NOTA: Tu API /api/pedidos aún no soporta estos filtros. Necesitarás añadirlos en PedidoController/PedidoService.
        const params = new URLSearchParams();
        if (cliente) params.append('cliente', cliente); // Ejemplo, necesitas implementar esto en backend
        if (fechaDesde) params.append('fechaDesde', fechaDesde);
        if (fechaHasta) params.append('fechaHasta', fechaHasta);
        // Añadir más parámetros si implementas los otros filtros en el backend (empresa, local, delivery)

        // Llama a la API para obtener los pedidos
        const response = await fetch(`http://localhost:8080/api/pedidos?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo obtener el historial.`);
        }

        const pedidos = await response.json(); // Obtiene la lista de pedidos del backend

        // --- LLENAR LA TABLA CON DATOS REALES ---
        const tablaBody = document.getElementById('tablaResultadosBody');
        const numRegistrosSpan = document.getElementById('numRegistros');
        const rangoFechasSpan = document.getElementById('rangoFechas');
        const paginacionDiv = document.getElementById('paginacion');
        const resultadosSection = document.getElementById('resultadosSection');

        tablaBody.innerHTML = ''; // Limpiar tabla antes de llenarla

        if (pedidos.length === 0) {
            numRegistrosSpan.textContent = '0';
            tablaBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No se encontraron pedidos con esos criterios.</td></tr>';
            paginacionDiv.innerHTML = ''; // Limpiar paginación
        } else {
            numRegistrosSpan.textContent = pedidos.length; // Mostrar número total (sin paginación real por ahora)

            pedidos.forEach(pedido => {
                // Asegúrate que el backend envíe el usuario anidado o ajusta esto
                const nombreCliente = pedido.usuario ? pedido.usuario.usuario : 'Desconocido';
                const fila = `
                    <tr>
                        <td>Marcona Delivery S.A.</td> <td>${nombreCliente}</td>
                        <td>${formatearFechaSimple(pedido.fechaHora)}</td>
                        <td>${formatoMoneda(pedido.total)}</td>
                    </tr>
                `;
                tablaBody.innerHTML += fila;
            });

            // Paginación simple (solo muestra página 1 por ahora)
            // Necesitarías lógica adicional aquí y en el backend para paginación real
            paginacionDiv.innerHTML = `
                <span style="color: #e0e6ea; margin-right: 15px;">Mostrando ${pedidos.length} registros</span>
                <button class="page-button active">1</button>
            `;
        }

        // Actualizar rango de fechas en resultados y mostrar sección
        const desdeFormateada = formatDate(fechaDesde);
        const hastaFormateada = formatDate(fechaHasta);
        rangoFechasSpan.textContent = `${desdeFormateada} - ${hastaFormateada}`;
        resultadosSection.style.display = 'block'; // Muestra la tabla de resultados

    } catch (error) {
        console.error("Error al buscar pedidos:", error);
        alert(`Error al buscar los pedidos: ${error.message}`);
        document.getElementById('resultadosSection').style.display = 'none'; // Ocultar si hay error
    }
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
    // Vuelve a la pantalla principal del admin
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

    // Actualizar UI para resaltar la opción seleccionada
    document.querySelectorAll('.download-option').forEach(option => {
        option.classList.remove('selected');
    });
     // Encuentra el elemento clickeado (necesita el 'event' implícito)
    const clickedOption = event.currentTarget; // 'event' es global en onclick
    if(clickedOption){
        clickedOption.classList.add('selected');
    }


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

    // --- LÓGICA DE DESCARGA REAL ---
    // Aquí podrías llamar a /api/reportes/descargar pasando los filtros actuales
    // para generar y descargar un reporte basado en la búsqueda actual,
    // o descargar un reporte pre-generado si la lógica fuera diferente.
    // Ejemplo (necesita implementación en backend):
    const params = new URLSearchParams({
        // ... (añadir los filtros actuales como en buscar()) ...
        formato: formatoSeleccionado,
        marcaAgua: (formatoSeleccionado === 'pdf' && incluirMarcaAgua)
    });
    // window.location.href = `http://localhost:8080/api/reportes/descargarBusqueda?${params.toString()}`;
    console.log("Simulando descarga con filtros...");
}

function cerrarModal() {
    document.getElementById('downloadModal').style.display = 'none';
}

function nuevaBusqueda() {
    document.getElementById('resultadosSection').style.display = 'none';
    // Opcional: limpiar filtros si se prefiere
    // limpiarFiltros();
}

// Función auxiliar para formato DD/MM
function formatDate(dateString) {
    if (!dateString) return '';
    try {
        // Asegura que la fecha se interprete en la zona horaria local
        const dateParts = dateString.split('-'); // yyyy-mm-dd
        const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    } catch (e) {
        return ''; // Devuelve vacío si la fecha es inválida
    }
}

// Función auxiliar para formato DD/MM simple (usado en la tabla)
function formatearFechaSimple(fechaISO) {
    if (!fechaISO) return '-';
    try {
        const fecha = new Date(fechaISO);
        return `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
    } catch(e) { return fechaISO; }
}

// Función auxiliar para formato de moneda S/
function formatoMoneda(valor) {
    if (valor === null || valor === undefined) return '-';
    try {
        return `S/ ${valor.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } catch(e) { return '-'; }
}


// Paginación (Simulado - necesita lógica real en backend y frontend)
document.querySelectorAll('.page-button').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.page-button').forEach(btn => {
            btn.classList.remove('active');
        });
        this.classList.add('active');
        // Aquí iría la lógica para cargar la página seleccionada (llamar a buscar() con parámetros de paginación)
        alert(`Simulando carga de página ${this.textContent}... (No implementado)`);
    });
});

// Cerrar modal al hacer clic fuera
document.getElementById('downloadModal').addEventListener('click', function(e) {
    // Cierra solo si se hace clic en el fondo oscuro (el propio modal)
    if (e.target === this) {
        cerrarModal();
    }
});