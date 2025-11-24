/**
 * mesa-selector.js
 * Versión Final: Asegura que el usuarioId se envíe al iniciar el pedido.
 */

document.addEventListener('DOMContentLoaded', () => {
    verificarMesasOcupadas();
});

async function verificarMesasOcupadas() {
    try {
        // Obtenemos el ID del LocalStorage
        const miId = String(localStorage.getItem('usuarioId'));
        
        if (!miId || miId === "null") {
            console.warn("⚠️ No hay usuario logueado en LocalStorage.");
        }

        const response = await fetch('/api/pedidos/mesas-ocupadas');
        
        if (response.ok) {
            const listaOcupadas = await response.json();
            const botonesMesas = document.querySelectorAll('.table-card');
            
            botonesMesas.forEach(boton => {
                const numeroMesa = boton.getAttribute('data-mesa');
                
                // Limpiamos clases previas
                boton.classList.remove('ocupada-ajena', 'mi-mesa');
                
                const ocupacion = listaOcupadas.find(o => String(o.mesa) === String(numeroMesa));

                if (ocupacion) {
                    const idDuenoMesa = String(ocupacion.usuarioId);
                    
                    // Comparamos String vs String para evitar errores de tipo
                    if (idDuenoMesa === miId) {
                        boton.classList.add('mi-mesa'); 
                        const badge = boton.querySelector('.badge');
                        if(badge) badge.textContent = "TU PEDIDO";
                    } else {
                        boton.classList.add('ocupada-ajena');
                        const badge = boton.querySelector('.badge');
                        if(badge) badge.textContent = "OCUPADO";
                    }
                }
            });
        }
    } catch (error) {
        console.error("Error al verificar mesas (cierre el servidor si hay errores):", error);
    }
}

function selectMesa(button) {
    
    // 1. Bloqueo estricto
    if (button.classList.contains('ocupada-ajena')) {
        alert("⛔ Esta mesa está atendida por otro mesero.");
        return;
    }
    
    // OBTENEMOS EL ID DEL USUARIO A ENVIAR (CRUCIAL)
    const miId = localStorage.getItem('usuarioId');
    if (!miId) {
        alert("Error de sesión: Por favor, cierre sesión y vuelva a iniciar.");
        return;
    }

    const mesaNumero = button.getAttribute("data-mesa");
    button.classList.add('selected'); 

    const tipoServicio = 'LOCAL';
    
    // 2. CONSTRUCCIÓN DE URL CORRECTA (INCLUYENDO usuarioId)
    const url = `/api/pedidos/registrar-inicio?tipoServicio=${tipoServicio}&numeroMesa=${mesaNumero}&usuarioId=${miId}`; // <--- ¡AQUÍ VA EL ID!

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (!response.ok) {
            // Si la respuesta no es OK, el error está en el backend (ej. 404/500)
            throw new Error(`Fallo en el servidor: Status ${response.status}`);
        }
        return response.json();
    })
    .then(pedidoDTO => {
        console.log("Pedido iniciado ID:", pedidoDTO.id);
        window.location.href = `/seleccionar_menu.html?pedidoId=${pedidoDTO.id}&mesa=${mesaNumero}`;
    })
    .catch(error => {
        console.error("Fallo al iniciar el pedido:", error);
        alert('Error al acceder a la mesa. Intente nuevamente.'); // La alerta que usted vio
        button.classList.remove('selected');
    });
}