// --- CONSTANTES Y REFERENCIAS DEL DOM ---
const API_URL = "/api/usuarios"; // Ruta relativa es más segura

// Tabla
const tablaUsuariosBody = document.querySelector("#tabla-usuarios tbody");

// Formulario de Crear
const formCrearUsuario = document.getElementById("form-crear-usuario");
const crearRol = document.getElementById("crear-rol");
const crearUsuario = document.getElementById("crear-usuario");
const crearContrasena = document.getElementById("crear-contrasena");

// --- REFERENCIAS MODAL EDITAR ---
const modalEditar = document.getElementById("modal-editar");
const formEditarUsuario = document.getElementById("form-editar-usuario");
const editarId = document.getElementById("editar-id");
const editarRol = document.getElementById("editar-rol");
const editarUsuario = document.getElementById("editar-usuario");
const editarContrasena = document.getElementById("editar-contrasena");
const btnCloseModalEditar = document.getElementById("close-modal-editar");
const btnDescartarCambios = document.getElementById("btn-descartar"); // ¡Ojo con este ID!

// --- REFERENCIAS MODAL ELIMINAR ---
const modalEliminar = document.getElementById("modal-eliminar");
const eliminarTextoUsuario = document.getElementById("eliminar-texto-usuario");
const btnEliminarNo = document.getElementById("btn-eliminar-no"); // ¡Ojo con este ID!
const btnEliminarSi = document.getElementById("btn-eliminar-si"); // ¡Ojo con este ID!

// Variable para guardar el ID del usuario a eliminar
let idUsuarioAEliminar = null;

// --- EVENTO PRINCIPAL: Cargar todo al iniciar ---
document.addEventListener("DOMContentLoaded", () => {
    console.log("Iniciando gestión de usuarios...");
    cargarUsuarios();

    // 1. Listeners para CREAR
    if (formCrearUsuario) {
        formCrearUsuario.addEventListener("submit", manejarCrearUsuario);
    }

    // 2. Listeners para EDITAR
    if (formEditarUsuario) {
        formEditarUsuario.addEventListener("submit", manejarEditarUsuario);
    }
    
    // Botón "X" de cerrar editar
    if (btnCloseModalEditar) {
        btnCloseModalEditar.addEventListener("click", () => {
            modalEditar.style.display = "none";
        });
    }
    
    // Botón "Descartar cambios" (Cancelar editar)
    if (btnDescartarCambios) {
        btnDescartarCambios.addEventListener("click", () => {
            console.log("Cancelando edición...");
            modalEditar.style.display = "none";
        });
    } else {
        console.error("ERROR: No se encontró el botón con id='btn-descartar'");
    }

    // 3. Listeners para ELIMINAR
    
    // Botón "No" (Cancelar eliminar)
    if (btnEliminarNo) {
        btnEliminarNo.addEventListener("click", () => {
            console.log("Cancelando eliminación...");
            modalEliminar.style.display = "none";
            idUsuarioAEliminar = null;
        });
    } else {
        console.error("ERROR: No se encontró el botón con id='btn-eliminar-no'");
    }

    // Botón "Sí" (Confirmar eliminar)
    if (btnEliminarSi) {
        btnEliminarSi.addEventListener("click", confirmarEliminarUsuario);
    } else {
        console.error("ERROR: No se encontró el botón con id='btn-eliminar-si'");
    }

    // Cerrar modales al hacer clic fuera
    window.addEventListener("click", (e) => {
        if (e.target === modalEditar) modalEditar.style.display = "none";
        if (e.target === modalEliminar) modalEliminar.style.display = "none";
    });
});

// --- FUNCIONES ---

async function cargarUsuarios() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Error al cargar usuarios");
        const usuarios = await response.json();

        tablaUsuariosBody.innerHTML = "";

        usuarios.forEach(user => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.rol}</td>
                <td>${user.usuario}</td>
                <td>********</td>
                <td class="acciones">
                    <button class="btn btn-accion-editar" onclick="mostrarModalEditar(${user.id}, '${user.rol}', '${user.usuario}')">Editar</button>
                    <button class="btn btn-accion-eliminar" onclick="mostrarModalEliminar(${user.id}, '${user.usuario}')">Eliminar</button>
                </td>
            `;
            tablaUsuariosBody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error:", error);
    }
}

async function manejarCrearUsuario(e) {
    e.preventDefault();
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
            formCrearUsuario.reset();
            cargarUsuarios();
        } else {
            alert("Error al crear usuario");
        }
    } catch (error) {
        console.error(error);
    }
}

// Funciones globales para que el onclick del HTML las encuentre
window.mostrarModalEditar = function(id, rol, usuario) {
    console.log("Editando usuario:", id);
    if(editarId) editarId.value = id;
    if(editarRol) editarRol.value = rol;
    if(editarUsuario) editarUsuario.value = usuario;
    if(editarContrasena) editarContrasena.value = "";
    if(modalEditar) modalEditar.style.display = "flex";
};

async function manejarEditarUsuario(e) {
    e.preventDefault();
    const id = editarId.value;
    const datosActualizados = {
        rol: editarRol.value,
        usuario: editarUsuario.value,
        contrasena: editarContrasena.value
    };
    
    if (datosActualizados.contrasena === "") delete datosActualizados.contrasena;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosActualizados)
        });

        if (response.ok) {
            alert("Usuario actualizado");
            modalEditar.style.display = "none";
            cargarUsuarios();
        } else {
            alert("Error al actualizar");
        }
    } catch (error) {
        console.error(error);
    }
}

window.mostrarModalEliminar = function(id, usuario) {
    console.log("Preparando eliminación de:", id);
    idUsuarioAEliminar = id;
    if(eliminarTextoUsuario) eliminarTextoUsuario.textContent = `Usuario: ${usuario} (ID: ${id})`;
    if(modalEliminar) modalEliminar.style.display = "flex";
};

async function confirmarEliminarUsuario() {
    console.log("Confirmando eliminación de ID:", idUsuarioAEliminar);
    if (!idUsuarioAEliminar) return;

    try {
        const response = await fetch(`${API_URL}/${idUsuarioAEliminar}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("Usuario eliminado");
            modalEliminar.style.display = "none";
            cargarUsuarios();
        } else {
            alert("Error al eliminar");
        }
        idUsuarioAEliminar = null;
    } catch (error) {
        console.error(error);
    }
}