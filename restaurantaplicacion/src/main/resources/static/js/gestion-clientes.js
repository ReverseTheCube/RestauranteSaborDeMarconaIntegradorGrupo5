let clientes = [];
let empresas = [];

function mostrarSeccion(seccion) {
  document.getElementById("clientes").classList.add("hidden");
  document.getElementById("empresas").classList.add("hidden");
  document.getElementById("tabClientes").classList.remove("active");
  document.getElementById("tabEmpresas").classList.remove("active");

  if (seccion === "clientes") {
    document.getElementById("clientes").classList.remove("hidden");
    document.getElementById("tabClientes").classList.add("active");
  } else {
    document.getElementById("empresas").classList.remove("hidden");
    document.getElementById("tabEmpresas").classList.add("active");
  }
}

// --- CLIENTES ---
function registrarCliente() {
  const tipo = document.getElementById("tipoDocumento").value;
  const numero = document.getElementById("numeroDocumento").value.trim();
  const nombre = document.getElementById("nombresApellidos").value.trim();

  if (!tipo || !numero || !nombre) {
    alert("Por favor, Completar todos los campos.");
    return;
  }

  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre)) {
    alert("Error, solo se acepta letras.");
    return;
  }

  clientes.push({ tipo, numero, nombre });
  actualizarTablaClientes();
  limpiarCamposClientes();
}

function actualizarTablaClientes(lista = clientes) {
  const tbody = document.querySelector("#tablaClientes tbody");
  tbody.innerHTML = "";
  lista.forEach(c => {
    const fila = `<tr>
      <td>${c.tipo}</td>
      <td>${c.numero}</td>
      <td>${c.nombre}</td>
    </tr>`;
    tbody.innerHTML += fila;
  });
}

function buscarCliente() {
  const num = document.getElementById("buscarCliente").value.trim();
  const resultado = clientes.filter(c => c.numero.includes(num));
  actualizarTablaClientes(resultado);
}

function limpiarCamposClientes() {
  document.getElementById("tipoDocumento").value = "";
  document.getElementById("numeroDocumento").value = "";
  document.getElementById("nombresApellidos").value = "";
}

// --- EMPRESAS ---
function registrarEmpresa() {
  const ruc = document.getElementById("ruc").value.trim();
  const razon = document.getElementById("razonSocial").value.trim();

  if (!ruc || !razon) {
    alert("Por favor, Completar todos los campos.");
    return;
  }

  if (!/^[0-9]{11}$/.test(ruc)) {
    alert("Elemento debe 11 dígitos numéricos.");
    return;
  }

  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(razon)) {
    alert("Error, solo se acepta letras.");
    return;
  }

  empresas.push({ ruc, razon });
  actualizarTablaEmpresas();
  limpiarCamposEmpresas();
}

function actualizarTablaEmpresas(lista = empresas) {
  const tbody = document.querySelector("#tablaEmpresas tbody");
  tbody.innerHTML = "";
  lista.forEach(e => {
    const fila = `<tr>
      <td>${e.ruc}</td>
      <td>${e.razon}</td>
    </tr>`;
    tbody.innerHTML += fila;
  });
}

function buscarEmpresa() {
  const rucBuscar = document.getElementById("buscarEmpresa").value.trim();
  const resultado = empresas.filter(e => e.ruc.includes(rucBuscar));
  actualizarTablaEmpresas(resultado);
}

function limpiarCamposEmpresas() {
  document.getElementById("ruc").value = "";
  document.getElementById("razonSocial").value = "";
}

function retroceder() {
  alert("Error");
}
