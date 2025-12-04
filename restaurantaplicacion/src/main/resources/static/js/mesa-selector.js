/**
 * mesa-selector.js
 * Versión Final: Implementa lógica de 3 estados (En Caja, Tu Pedido, Ocupado Ajeno)
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
                
                // 1. LIMPIEZA: Quitamos todas las clases posibles
                boton.classList.remove('ocupada-ajena', 'mi-mesa', 'en-caja');
                
                // Resetear texto del badge
                const badge = boton.querySelector('.badge');
                if(badge) {
                    badge.textContent = "LIBRE"; 
                    badge.style.backgroundColor = "var(--secondary)"; // Color por defecto
                }
                
                // 2. BUSCAR ESTADO
                const ocupacion = listaOcupadas.find(o => String(o.mesa) === String(numeroMesa));

                if (ocupacion) {
                    const idDuenoMesa = String(ocupacion.usuarioId);
                    const estadoPedido = ocupacion.estado; // "PENDIENTE" o "POR_PAGAR"

                    // --- CASO 1: EN CAJA (Estado POR_PAGAR) ---
                    // Esto aplica para TODOS, sea tuya o ajena.
                    if (estadoPedido === 'POR_PAGAR') {
                        boton.classList.add('en-caja');
                        if(badge) {
                            badge.textContent = "EN CAJA";
                            badge.style.backgroundColor = "#7f8c8d"; // Gris Plomo
                        }
                        // Opcional: Bloquear clic
                        // boton.onclick = () => alert("Mesa en proceso de cobro.");
                    }
                    
                    // --- CASO 2: TU PEDIDO (PENDIENTE + Es tu ID) ---
                    else if (estadoPedido === 'PENDIENTE' && idDuenoMesa === miId) {
                        boton.classList.add('mi-mesa'); 
                        if(badge) {
                            badge.textContent = "TU PEDIDO";
                            badge.style.backgroundColor = "var(--success)"; // Verde
                        }
                    } 
                    
                    // --- CASO 3: OCUPADO AJENO (PENDIENTE + No es tu ID) ---
                    else {
                        boton.classList.add('ocupada-ajena');
                        if(badge) {
                            badge.textContent = "OCUPADO";
                            badge.style.backgroundColor = "var(--danger)"; // Rojo
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error("Error al verificar mesas:", error);
    }
}

function selectMesa(button) {
    
    // 1. Bloqueo estricto si es ajena (Rojo)
    if (button.classList.contains('ocupada-ajena')) {
        alert("⛔ Esta mesa está atendida por otro mesero.");
        return; // Detiene la ejecución
    }

    // 2. Bloqueo estricto si está EN CAJA (Plomo)
    if (button.classList.contains('en-caja')) {
        alert("ℹ️ Esta mesa ya envió su pedido a caja. No se pueden hacer más cambios.");
        return; // <--- ESTO ES LO QUE FALTABA PARA QUE NO TE DEJE ENTRAR
    }
    
    // OBTENEMOS EL ID DEL USUARIO A ENVIAR
    const miId = localStorage.getItem('usuarioId');
    if (!miId) {
        alert("Error de sesión: Por favor, cierre sesión y vuelva a iniciar.");
        return;
    }

    const mesaNumero = button.getAttribute("data-mesa");
    button.classList.add('selected'); 

    const tipoServicio = 'LOCAL';
    
    // CONSTRUCCIÓN DE URL
    const url = `/api/pedidos/registrar-inicio?tipoServicio=${tipoServicio}&numeroMesa=${mesaNumero}&usuarioId=${miId}`; 

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Fallo en el servidor: Status ${response.status}`);
        }
        return response.json();
    })
    .then(pedidoDTO => {
        // Guardamos info
        const infoPedido = {
            pedidoId: pedidoDTO.id,
            mesa: mesaNumero,
            tipo: tipoServicio
        };
        localStorage.setItem('infoPedido', JSON.stringify(infoPedido));
        
        window.location.href = `/seleccionar_menu.html?pedidoId=${pedidoDTO.id}&mesa=${mesaNumero}`;
    })
    .catch(error => {
        console.error("Fallo al iniciar el pedido:", error);
        alert('Error al acceder a la mesa. Intente nuevamente.');
        button.classList.remove('selected');
    });
}