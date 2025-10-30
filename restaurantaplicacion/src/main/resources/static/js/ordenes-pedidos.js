function pedidoListo(button) {
    // 1. Encuentra la fila (el <tr>) más cercana al botón que fue presionado
    const row = button.closest('tr');

    if (row) {
        // 2. (Opcional) Añadimos un efecto de "fade-out" (desvanecimiento)
        row.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        row.style.opacity = '0';
        row.style.transform = 'translateX(50px)';
        
        // 3. Espera a que termine la animación y luego la elimina
        setTimeout(() => {
            row.remove();
        }, 500); // 500ms = 0.5s (debe coincidir con la transición)
    }
}
