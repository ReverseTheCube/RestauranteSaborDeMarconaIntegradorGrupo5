
function selectMesa(button) {
const mesaNumero = button.getAttribute("data-mesa");

document.querySelectorAll('.table-card').forEach(btn => btn.disabled = true);
button.classList.add('selected'); // Opcional: marca la mesa seleccionada
const tipoServicio = 'LOCAL';
const url = `/api/pedidos/registrar-inicio?tipoServicio=${tipoServicio}&numeroMesa=${mesaNumero}`;

fetch(url, {
method: 'POST',
headers: {
'Content-Type': 'application/json' 
}
 })
.then(response => {
if (!response.ok) {
 throw new Error(`HTTP error! Status: ${response.status}`);
}
return response.json();
 })
.then(pedidoDTO => {
alert(`¡Pedido LOCAL iniciado! Mesa N° ${mesaNumero}.`); // ¡Alerta simplificada!

window.location.href = `/seleccionar_menu.html?pedidoId=${pedidoDTO.id}&mesa=${mesaNumero}`;
 })
 .catch(error => {
console.error('Error al iniciar el pedido:', error);
 alert('Error al iniciar el pedido. Inténtelo de nuevo.');
document.querySelectorAll('.table-card').forEach(btn => btn.disabled = false);
button.classList.remove('selected');
 });
}