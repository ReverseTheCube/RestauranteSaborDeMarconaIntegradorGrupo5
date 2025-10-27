// Este script maneja la navegación desde la pantalla intermedia
document.getElementById('repBtn').addEventListener('click', () => {
    // Redirige a la pantalla de configurar reporte periódico
    window.location.href = 'ventaehistorialA.html';
});

document.getElementById('busBtn').addEventListener('click', () => {
    // Redirige a la pantalla de búsqueda con filtros
    window.location.href = 'busquedafiltro.html';
});

document.getElementById('smallBack').addEventListener('click', () => {
    // Vuelve a la pantalla principal del admin
    window.location.href = 'admin.html';
});