/**
 * LOGIN.JS
 * Maneja el inicio de sesión evitando la recarga de página.
 */

document.addEventListener("DOMContentLoaded", () => {
    console.log("SCRIPT LOGIN CARGADO CORRECTAMENTE"); // Si no ves esto en consola, el archivo está mal

    // Referencias al DOM
    const loginForm = document.getElementById("login-form");
    const usuarioInput = document.getElementById("usuario");
    const contrasenaInput = document.getElementById("contrasena");
    const errorMessage = document.getElementById("error-message");
    const btnProblemas = document.getElementById("btn-problemas");
    const btnVolver = document.getElementById("btn-problemas-volver");
    const problemasBox = document.getElementById("problemas-box");
    const bloqueadoBox = document.getElementById("bloqueado-box");

    // Verificamos que el formulario exista antes de añadir eventos
    if (!loginForm) {
        console.error("ERROR: No se encontró el formulario con id 'login-form'");
        return;
    }

    // EVENTO PRINCIPAL: SUBMIT
    loginForm.addEventListener("submit", async (event) => {
        // 1. DETENER EL ENVÍO NORMAL (CRUCIAL)
        event.preventDefault();
        console.log("Formulario detenido. Iniciando Fetch...");

        // 2. Limpiar errores previos
        ocultarMensajes();

        // 3. Obtener datos
        const usuario = usuarioInput.value;
        const contrasena = contrasenaInput.value;

        try {
            // 4. Petición al Backend
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuario, contrasena })
            });

            // 5. Procesar respuesta
            if (response.ok) {
                const data = await response.json();
                console.log("Login exitoso:", data);

                // Guardar sesión
                localStorage.setItem('usuarioId', data.id);
                localStorage.setItem('usuarioRol', data.rol);

                // Redirección
                switch(data.rol) {
                    case "ADMINISTRADOR": window.location.href = "/admin.html"; break;
                    case "CAJERO": window.location.href = "/cajero.html"; break;
                    case "MESERO": window.location.href = "/mesero.html"; break;
                    case "COCINERO": window.location.href = "/cocinero.html"; break;
                    default: alert("Rol desconocido: " + data.rol);
                }
            } else {
                const textoError = await response.text();
                mostrarError(textoError);
            }
        } catch (error) {
            console.error("Error de red:", error);
            mostrarError("No se pudo conectar con el servidor (Backend apagado o error de red).");
        }
    });

    // Funciones auxiliares
    function mostrarError(msg) {
        if (msg.includes("bloqueado") && bloqueadoBox) {
            bloqueadoBox.style.display = "flex";
        } else if(errorMessage) {
            errorMessage.textContent = msg;
            errorMessage.style.display = "block";
        }
    }

    function ocultarMensajes() {
        if(errorMessage) errorMessage.style.display = "none";
        if(problemasBox) problemasBox.style.display = "none";
        if(bloqueadoBox) bloqueadoBox.style.display = "none";
    }

    // Botones extra
    if(btnProblemas) btnProblemas.addEventListener("click", () => { ocultarMensajes(); problemasBox.style.display = "flex"; });
    if(btnVolver) btnVolver.addEventListener("click", ocultarMensajes);
});