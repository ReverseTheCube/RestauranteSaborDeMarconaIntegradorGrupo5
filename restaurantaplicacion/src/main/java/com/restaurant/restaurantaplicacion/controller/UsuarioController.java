package com.restaurant.restaurantaplicacion.controller;

import com.restaurant.restaurantaplicacion.dto.CrearUsuarioRequest;
import com.restaurant.restaurantaplicacion.dto.LoginRequest;
import com.restaurant.restaurantaplicacion.dto.LoginResponse;
import com.restaurant.restaurantaplicacion.model.Usuario;
import com.restaurant.restaurantaplicacion.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.restaurant.restaurantaplicacion.dto.CambiarPasswordRequest;
import org.springframework.security.core.Authentication;
import java.util.List;

@RestController
@RequestMapping("/api") // Prefijo para todas las rutas de esta API
@CrossOrigin(origins = "*") // Permite llamadas desde cualquier frontend (cambiar en producción)
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    /**
     * Endpoint para el Login.
     * El frontend debe hacer un POST a http://localhost:8080/api/auth/login
     */
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = usuarioService.login(loginRequest);
            // Si el login es exitoso, devuelve 200 OK
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Si hay un error (usuario no existe, pass incorrecta, bloqueado)
            // devuelve 401 Unauthorized
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    /**
     * Endpoints para el CRUD de Usuarios (Gestión de Usuarios)
     */

    // CREAR - POST http://localhost:8080/api/usuarios
    @PostMapping("/usuarios")
    public ResponseEntity<Usuario> crearUsuario(@RequestBody CrearUsuarioRequest request) {
        Usuario nuevoUsuario = usuarioService.crearUsuario(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
    }

    // LEER (TODOS) - GET http://localhost:8080/api/usuarios
    @GetMapping("/usuarios")
    public ResponseEntity<List<Usuario>> obtenerUsuarios() {
        return ResponseEntity.ok(usuarioService.obtenerTodosLosUsuarios());
    }

    // LEER (UNO) - GET http://localhost:8080/api/usuarios/1
    @GetMapping("/usuarios/{id}")
    public ResponseEntity<Usuario> obtenerUsuarioPorId(@PathVariable Long id) {
        return usuarioService.obtenerUsuarioPorId(id)
                .map(ResponseEntity::ok) // Si lo encuentra, devuelve 200 OK
                .orElse(ResponseEntity.notFound().build()); // Si no, 404 Not Found
    }

    // ACTUALIZAR - PUT http://localhost:8080/api/usuarios/1
    @PutMapping("/usuarios/{id}")
    public ResponseEntity<Usuario> actualizarUsuario(@PathVariable Long id, @RequestBody CrearUsuarioRequest request) {
        try {
            Usuario usuarioActualizado = usuarioService.actualizarUsuario(id, request);
            return ResponseEntity.ok(usuarioActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ELIMINAR - DELETE http://localhost:8080/api/usuarios/1
    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        try {
            usuarioService.eliminarUsuario(id);
            return ResponseEntity.noContent().build(); // 204 No Content (éxito)
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/usuarios/cambiar-contrasena")
    public ResponseEntity<?> cambiarContrasena(@RequestBody CambiarPasswordRequest request, Authentication authentication) {
        try {
            // Obtenemos el usuario que está logueado actualmente
            String nombreUsuario = authentication.getName();
            Usuario usuario = usuarioService.obtenerTodosLosUsuarios().stream()
                    .filter(u -> u.getUsuario().equals(nombreUsuario))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            usuarioService.cambiarContrasena(usuario.getId(), request.getNuevaContrasena());
            return ResponseEntity.ok("Contraseña actualizada correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}