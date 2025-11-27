// Espera a que todo el contenido del HTML esté cargado
document.addEventListener("DOMContentLoaded", () => {
    
    // --- Referencias a elementos del DOM ---
    const loginForm = document.getElementById("login-form");
    const usuarioInput = document.getElementById("usuario");
    const contrasenaInput = document.getElementById("contrasena");
    
    // Botones
    const btnProblemas = document.getElementById("btn-problemas");
    
    // Cajas y Modales
    const errorMessage = document.getElementById("error-message");
    const bloqueadoBox = document.getElementById("bloqueado-box");
    
    // Referencias del NUEVO MODAL
    const modalProblemas = document.getElementById("modal-problemas");
    const btnCerrarModal = document.getElementById("close-modal-problemas");

    // --- Lógica de Login ---
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault(); 
        
        // Ocultar mensajes previos
        errorMessage.style.display = "none";
        bloqueadoBox.style.display = "none";

        const loginData = {
            usuario: usuarioInput.value,
            contrasena: contrasenaInput.value
        };

        try {
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData)
            });

            if (response.ok) {
                const loginResponse = await response.json();
                
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
            bloqueadoBox.style.display = "flex"; // Muestra la caja roja sobre el form
        } else {
            errorMessage.textContent = mensaje;
            errorMessage.style.display = "block"; // Muestra texto rojo pequeño
        }
    }

    // --- LÓGICA DEL MODAL DE PROBLEMAS ---
    
    // 1. Abrir modal al hacer clic en "¿Problemas...?"
    btnProblemas.addEventListener("click", () => {
        modalProblemas.style.display = "flex";
    });

    // 2. Cerrar modal al hacer clic en la "X"
    btnCerrarModal.addEventListener("click", () => {
        modalProblemas.style.display = "none";
    });

    // 3. Cerrar modal al hacer clic fuera del contenido (en el fondo oscuro)
    window.addEventListener("click", (e) => {
        if (e.target === modalProblemas) {
            modalProblemas.style.display = "none";
        }
    });
});