// Espera a que todo el contenido del HTML esté cargado
document.addEventListener("DOMContentLoaded", () => {
    
    // --- Referencias a elementos del DOM ---
    const loginForm = document.getElementById("login-form");
    const usuarioInput = document.getElementById("usuario");
    const contrasenaInput = document.getElementById("contrasena");
    
    // Botones
    const btnProblemas = document.getElementById("btn-problemas");
    const btnVolver = document.getElementById("btn-problemas-volver");
    
    // Cajas de mensajes (basadas en figma)
    const errorMessage = document.getElementById("error-message");
    const problemasBox = document.getElementById("problemas-box");
    const bloqueadoBox = document.getElementById("bloqueado-box");

    // --- Lógica de Login ---
    loginForm.addEventListener("submit", async (e) => {
        // Previene que el formulario se envíe de la forma tradicional
        e.preventDefault(); 
        
        // Ocultar mensajes de error previos
        ocultarMensajes();

        // 1. Obtener los datos del formulario
        const usuario = usuarioInput.value;
        const contrasena = contrasenaInput.value;

        // 2. Crear el objeto de datos (LoginRequest DTO)
        const loginData = {
            usuario: usuario,
            contrasena: contrasena
        };

        try {
            // 3. Enviar la petición a la API de Spring Boot
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData)
            });

            // 4. Manejar la respuesta
            if (response.ok) {
                // ¡Login Exitoso! (HTTP 200)
                const loginResponse = await response.json();
                
                // Redirigir según el ROL (como en el flujo)
                switch(loginResponse.rol) {
                    case "ADMINISTRADOR":
                        window.location.href = "/admin.html"; // (Debes crear esta página)
                        break;
                    case "CAJERO":
                        window.location.href = "/cajero.html"; // (Debes crear esta página)
                        break;
                    case "MESERO":
                        window.location.href = "/mesero.html"; // (Debes crear esta página)
                        break;
                    case "COCINERO":
                         window.location.href = "/cocinero.html"; // (Debes crear esta página)
                        break;
                    default:
                        alert("Rol no reconocido.");
                }
            } else {
                // Error de Login (HTTP 401)
                const errorTexto = await response.text();
                mostrarError(errorTexto);
            }

        } catch (error) {
            console.error("Error de conexión:", error);
            mostrarError("No se pudo conectar con el servidor.");
        }
    });

    // --- Lógica para mostrar/ocultar cajas de error ---

    function mostrarError(mensaje) {
        if (mensaje.includes("bloqueado")) {
            // Muestra la caja roja de "bloqueado"
            bloqueadoBox.style.display = "flex";
        } else if (mensaje.includes("incorrecto")) {
             // Muestra el texto rojo "Usuario o contraseña incorrecto"
            errorMessage.style.display = "block";
        } else {
            errorMessage.textContent = mensaje;
            errorMessage.style.display = "block";
        }
    }

    function ocultarMensajes() {
        errorMessage.style.display = "none";
        problemasBox.style.display = "none";
        bloqueadoBox.style.display = "none";
    }

    // --- Lógica botones "Problemas" ---
    
    btnProblemas.addEventListener("click", () => {
        ocultarMensajes();
        problemasBox.style.display = "flex";
    });

    btnVolver.addEventListener("click", () => {
        ocultarMensajes();
    });
});