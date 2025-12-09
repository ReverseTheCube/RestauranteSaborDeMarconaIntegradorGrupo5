document.addEventListener("DOMContentLoaded", cargarIncidencias);

async function cargarIncidencias() {
    try {
        const response = await fetch("/api/incidencias");
        if (!response.ok) throw new Error("Error al cargar");
        const lista = await response.json();

        const tbody = document.querySelector("#tabla-incidencias tbody");
        tbody.innerHTML = "";

        lista.forEach(inc => {
            // Color según prioridad
            let colorPrio = "white";
            if (inc.prioridad === "ALTA") colorPrio = "#e74c3c"; // Rojo
            if (inc.prioridad === "MEDIA") colorPrio = "#f39c12"; // Naranja

            // Estado
            const esResuelto = inc.estado === "RESUELTO";
            const estadoTexto = esResuelto ? "✅ RESUELTO" : "⏳ PENDIENTE";
            
            const tr = document.createElement("tr");
            tr.style.borderBottom = "1px solid #444";
            
            tr.innerHTML = `
                <td style="padding: 10px;">${new Date(inc.fechaReporte).toLocaleString()}</td>
                <td>${inc.usuarioReporta || 'Anónimo'}</td>
                <td style="color: ${colorPrio}; font-weight: bold;">${inc.prioridad}</td>
                <td>${inc.descripcion}</td>
                <td>${estadoTexto}</td>
                <td>
                    ${!esResuelto ? 
                        `<button class="btn" style="background: #2ecc71; padding: 5px 10px;" onclick="resolver(${inc.id})">Resolver</button>` 
                        : '<span style="color: #2ecc71;">Completado</span>'}
                    <button class="btn" style="background: #e74c3c; padding: 5px 10px; margin-left: 5px;" onclick="eliminar(${inc.id})">X</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error(error);
        alert("Error cargando incidencias");
    }
}

async function resolver(id) {
    if(!confirm("¿Marcar como resuelto?")) return;
    await fetch(`/api/incidencias/${id}/resolver`, { method: "PUT" });
    cargarIncidencias();
}

async function eliminar(id) {
    if(!confirm("¿Eliminar registro?")) return;
    await fetch(`/api/incidencias/${id}`, { method: "DELETE" });
    cargarIncidencias();
}