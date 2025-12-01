document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-cambiar-pass");
    const nuevaPassInput = document.getElementById("nueva-pass");
    const confirmarPassInput = document.getElementById("confirmar-pass");
    const errorMsg = document.getElementById("error-msg");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const p1 = nuevaPassInput.value;
        const p2 = confirmarPassInput.value;

        if (p1 !== p2) {
            mostrarError("Las contraseñas no coinciden");
            return;
        }
        
        if (p1.length < 4) { // Validación simple
            mostrarError("La contraseña es muy corta");
            return;
        }

        try {
            const response = await fetch("/api/usuarios/cambiar-contrasena", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nuevaContrasena: p1 })
            });

            if (response.ok) {
                alert("Contraseña actualizada. Por favor inicia sesión con tu nueva clave.");
                // Cerramos sesión para obligarlo a entrar con la nueva
                window.location.href = "/logout"; 
            } else {
                mostrarError("Error al actualizar");
            }
        } catch (error) {
            console.error(error);
            mostrarError("Error de conexión");
        }
    });

    function mostrarError(msg) {
        errorMsg.textContent = msg;
        errorMsg.style.display = "block";
    }
});