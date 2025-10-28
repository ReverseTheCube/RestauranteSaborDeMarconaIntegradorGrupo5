function cerrarVentana() {
  if (confirm("¿Desea cerrar la ventana?")) {
    window.close();
  }
}

function guardarDatos() {
  const ruc = document.getElementById("ruc").value;
  const trabajador = document.getElementById("trabajador").value;
  const saldo = document.getElementById("saldo").value;

  if (!ruc || !trabajador || !saldo) {
    alert("Por favor complete todos los campos.");
    return;
  }

  alert(`Datos guardados:\n\nRUC: ${ruc}\nTrabajador: ${trabajador}\nSaldo: ${saldo}`);
}