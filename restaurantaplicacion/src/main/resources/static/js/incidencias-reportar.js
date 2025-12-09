document.addEventListener("DOMContentLoaded", () => {
    // Referencias del DOM
    const btnAbrirReporte = document.getElementById("btn-reportar-incidencia");
    const modalReporte = document.getElementById("modal-reportar-incidencia");
    const btnCerrarReporte = document.getElementById("close-modal-reporte");
    const formReporte = document.getElementById("form-reportar-incidencia");

    // 1. Abrir Modal
    if (btnAbrirReporte) {
        btnAbrirReporte.addEventListener("click", (e) => {
            e.preventDefault(); // Evita navegación si es un <a>
            if (modalReporte) modalReporte.style.display = "flex";
        });
    }

    // 2. Cerrar Modal
    if (btnCerrarReporte) {
        btnCerrarReporte.addEventListener("click", () => {
            if (modalReporte) modalReporte.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === modalReporte) modalReporte.style.display = "none";
    });

    // 3. Enviar Reporte (POST)
    if (formReporte) {
        formReporte.addEventListener("submit", async (e) => {
            e.preventDefault();

            const datos = {
                descripcion: document.getElementById("incidencia-desc").value,
                prioridad: document.getElementById("incidencia-prio").value
            };

            try {
                const response = await fetch("/api/incidencias", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datos)
                });

                if (response.ok) {
                    alert("Incidencia reportada correctamente.");
                    modalReporte.style.display = "none";
                    formReporte.reset();
                } else {
                    alert("Error al reportar.");
                }
            } catch (error) {
                console.error(error);
                alert("Error de conexión.");
            }
        });
    }
});