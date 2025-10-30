/**
 * pedidos-welcome.js
 *
 * Maneja la lógica de la pantalla de bienvenida (pedidos.html).
 * Específicamente, hace que el botón "Atrás" sea inteligente,
 * redirigiendo al perfil correcto (Admin, Mesero, Cajero)
 * basado en el rol guardado en localStorage.
 */

// 1. Espera a que todo el contenido del HTML esté cargado.
document.addEventListener('DOMContentLoaded', () => {
    
    // 2. Busca el botón "Atrás" en el HTML (el que tiene el ID que le pusimos).
    const botonAtras = document.getElementById('btn-atras-perfil');

    if (!botonAtras) {
        console.error('Error: No se encontró el botón con id="btn-atras-perfil".');
        return;
    }

    // 3. Lee el rol del usuario desde el localStorage.
    // (Asegúrate de que tu pantalla de Login SÍ guarde "usuarioRol").
    const rol = localStorage.getItem('usuarioRol');

    let urlDestino = 'index.html'; // URL por defecto si no hay rol o si falla

    // 4. Decide la URL de destino basada en el rol.
    // (Asegúrate de que estos nombres (ADMIN, MESERO) coincidan
    // con lo que guardas en el localStorage durante el login).
    switch (rol) {
        case 'ADMIN':
            urlDestino = 'admin.html';
            break;
        case 'MESERO':
            urlDestino = 'mesero.html';
            break;
        case 'CAJERO':
            urlDestino = 'cajero.html';
            break;
        case 'COCINERO':
            urlDestino = 'cocinero.html';
            break;
        default:
            // Si el rol es nulo o no reconocido, lo manda al index (login)
            console.warn('No se encontró un rol de usuario válido. Enviando al login.');
            urlDestino = 'index.html';
    }

    // 5. Asigna la URL correcta al evento onclick del botón "Atrás".
    botonAtras.onclick = () => {
        window.location.href = urlDestino;
    };
});