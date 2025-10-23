// --- CONSTANTES Y REFERENCIAS DEL DOM ---
const API_URL = "http://localhost:8080/api/usuarios";

// Tabla
const tablaUsuariosBody = document.querySelector("#tabla-usuarios tbody");

// Formulario de Crear
const formCrearUsuario = document.getElementById("form-crear-usuario");
const crearRol = document.getElementById("crear-rol");
const crearUsuario = document.getElementById("crear-usuario");
const crearContrasena = document.getElementById("crear-contrasena");

// Modal de Editar
const modalEditar = document.getElementById("modal-editar");
const formEditarUsuario = document.getElementById("form-editar-usuario");
const editarId = document.getElementById("editar-id");
const editarRol = document.getElementById("editar-rol");
const editarUsuario = document.getElementById("editar-usuario");
const editarContrasena = document.getElementById("editar-contrasena");
const btnCloseModalEditar = document.getElementById("close-modal-editar");
const btnDescartarCambios = document.getElementById("btn-descartar");

// Modal de Eliminar
const modalEliminar = document.getElementById("modal-eliminar");
const eliminarTextoUsuario = document.getElementById("eliminar-texto-usuario");
const btnEliminarNo = document.getElementById("btn-eliminar-no");
const btnEliminarSi = document.getElementById("btn-eliminar-si");

// Variable para guardar el ID del usuario a eliminar
let idUsuarioAEliminar = null;


// --- EVENTO PRINCIPAL: Cargar todo al iniciar ---
document.addEventListener("DOMContentLoaded", () => {
    cargarUsuarios();

    // --- Listeners de formularios y modales ---
    formCrearUsuario.addEventListener("submit", manejarCrearUsuario);
    formEditarUsuario.addEventListener("submit", manejarEditarUsuario);
    
    // Listeners para cerrar modales
    btnCloseModalEditar.addEventListener("click", () => modalEditar.style.display = "none");
    btnDescartarCambios.addEventListener("click", () => modalEditar.style.display = "none");
    btnEliminarNo.addEventListener("click", () => modalEliminar.style.display = "none");
    
    // Listener para confirmar eliminación
    btnEliminarSi.addEventListener("click", confirmarEliminarUsuario);
});

// --- FUNCIÓN 1: Cargar y mostrar todos los usuarios ---
async function cargarUsuarios() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Error al cargar usuarios");
        const usuarios = await response.json();

        // Limpiar tabla
        tablaUsuariosBody.innerHTML = "";

        // Llenar tabla
        usuarios.forEach(user => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.rol}</td>
                <td>${user.usuario}</td>
                <td>********</td> <td class="acciones">
                    <button class="btn btn-accion-editar" onclick="mostrarModalEditar(${user.id}, '${user.rol}', '${user.usuario}')">Editar</button>
                    <button class="btn btn-accion-eliminar" onclick="mostrarModalEliminar(${user.id}, '${user.usuario}')">Eliminar</button>
                </td>
            `;
            tablaUsuariosBody.appendChild(tr);
        });

    } catch (error) {
        console.error("Error en cargarUsuarios:", error);
    }
}

// --- FUNCIÓN 2: Crear un nuevo usuario ---
async function manejarCrearUsuario(e) {
    e.preventDefault(); // Evitar recarga de página

    const nuevoUsuario = {
        rol: crearRol.value,
        usuario: crearUsuario.value,
        contrasena: crearContrasena.value
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoUsuario)
        });

        if (response.ok) {
            alert("Usuario creado exitosamente");
            formCrearUsuario.reset(); // Limpiar formulario
            cargarUsuarios(); // Recargar la tabla
        } else {
            const error = await response.text();
            alert(`Error al crear usuario: ${error}`);
        }
    } catch (error) {
        console.error("Error en manejarCrearUsuario:", error);
    }
}

// --- FUNCIÓN 3: Mostrar el modal para Editar ---
function mostrarModalEditar(id, rol, usuario) {
    // Llenar el formulario del modal con los datos actuales
    editarId.value = id;
    editarRol.value = rol;
    editarUsuario.value = usuario;
    editarContrasena.value = ""; // Limpiar campo de contraseña

    // Mostrar el modal
    modalEditar.style.display = "flex";
}

// --- FUNCIÓN 4: Actualizar (Editar) un usuario ---
async function manejarEditarUsuario(e) {
    e.preventDefault();

    const id = editarId.value;
    const datosActualizados = {
        rol: editarRol.value,
        usuario: editarUsuario.value,
        contrasena: editarContrasena.value // Enviar contraseña (vacía o nueva)
    };
    
    // Si la contraseña está vacía, la quitamos del objeto
    // para que el backend no la actualice
    if (datosActualizados.contrasena === "") {
        delete datosActualizados.contrasena;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosActualizados)
        });

        if (response.ok) {
            alert("Usuario actualizado exitosamente");
            modalEditar.style.display = "none"; // Ocultar modal
            cargarUsuarios(); // Recargar tabla
        } else {
            const error = await response.text();
            alert(`Error al actualizar usuario: ${error}`);
        }
    } catch (error) {
        console.error("Error en manejarEditarUsuario:", error);
    }
}

// --- FUNCIÓN 5: Mostrar modal de confirmación para Eliminar ---
function mostrarModalEliminar(id, usuario) {
    // Guardar el ID para usarlo si confirman
    idUsuarioAEliminar = id;
    // Mostrar nombre de usuario en el modal
    eliminarTextoUsuario.textContent = `Usuario: ${usuario} (ID: ${id})`;
    // Mostrar el modal
    modalEliminar.style.display = "flex";
}

// --- FUNCIÓN 6: Eliminar un usuario ---
async function confirmarEliminarUsuario() {
    if (!idUsuarioAEliminar) return;

    try {
        const response = await fetch(`${API_URL}/${idUsuarioAEliminar}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("Usuario eliminado exitosamente");
            modalEliminar.style.display = "none";
            cargarUsuarios(); // Recargar tabla
        } else {
            const error = await response.text();
            alert(`Error al eliminar usuario: ${error}`);
        }
        idUsuarioAEliminar = null; // Limpiar ID
    } catch (error) {
        console.error("Error en confirmarEliminarUsuario:", error);
    }
}