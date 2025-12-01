document.addEventListener("DOMContentLoaded", () => {
    
    const loginForm = document.getElementById("login-form");
    const usuarioInput = document.getElementById("usuario");
    const contrasenaInput = document.getElementById("contrasena");
    const errorMessage = document.getElementById("error-message");
    const bloqueadoBox = document.getElementById("bloqueado-box");
    
    // Modal
    const modalProblemas = document.getElementById("modal-problemas");
    const btnProblemas = document.getElementById("btn-problemas");
    const btnCerrarModal = document.getElementById("close-modal-problemas");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault(); 
        
        errorMessage.style.display = "none";
        bloqueadoBox.style.display = "none";

        const loginData = {
            usuario: usuarioInput.value,
            contrasena: contrasenaInput.value
        };

        try {
            const response = await fetch("/api/auth/login", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData)
            });

            if (response.ok) {
                const loginResponse = await response.json();
                
                // Guardar en memoria
                localStorage.setItem('usuarioId', loginResponse.id);
                localStorage.setItem('usuarioNombre', loginResponse.usuario);
                localStorage.setItem('usuarioRol', loginResponse.rol);

                // --- NUEVO: VERIFICACIÓN DE CAMBIO DE CONTRASEÑA ---
                if (loginResponse.cambioPasswordObligatorio) {
                    // Si es true, lo mandamos a cambiar la contraseña
                    window.location.href = "/cambiar-password.html";
                    return; // Detenemos la ejecución aquí para que no siga al menú
                }
                // ---------------------------------------------------

                // Redirigir según el ROL
                switch(loginResponse.rol) {
                    case "ADMINISTRADOR": window.location.href = "/admin.html"; break;
                    case "CAJERO": window.location.href = "/cajero.html"; break;
                    case "MESERO": window.location.href = "/mesero.html"; break;
                    case "COCINERO": window.location.href = "/cocinero.html"; break;
                    default: alert("Rol no reconocido.");
                }
            } else {
                const errorTexto = await response.text();
                mostrarError(errorTexto);
            }

        } catch (error) {
            console.error("Error de conexión:", error);
            mostrarError("No se pudo conectar con el servidor.");
        }
    });

    function mostrarError(mensaje) {
        if (mensaje.includes("bloqueado")) {
            if(bloqueadoBox) bloqueadoBox.style.display = "block";
        } else {
            errorMessage.textContent = mensaje;
            errorMessage.style.display = "block";
        }
    }

    // Lógica del Modal
    if(btnProblemas) {
        btnProblemas.addEventListener("click", () => modalProblemas.style.display = "flex");
    }
    if(btnCerrarModal) {
        btnCerrarModal.addEventListener("click", () => modalProblemas.style.display = "none");
    }
    window.addEventListener("click", (e) => {
        if (e.target === modalProblemas) modalProblemas.style.display = "none";
    });
});