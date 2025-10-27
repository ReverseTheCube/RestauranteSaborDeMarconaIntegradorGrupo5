package com.restaurant.restaurantaplicacion.service;

import com.restaurant.restaurantaplicacion.dto.CrearUsuarioRequest;
import com.restaurant.restaurantaplicacion.dto.LoginRequest;
import com.restaurant.restaurantaplicacion.dto.LoginResponse;
import com.restaurant.restaurantaplicacion.model.Usuario;
import com.restaurant.restaurantaplicacion.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    // Límite de intentos de login (como en image_e1a1f6.png)
    private static final int MAX_INTENTOS_FALLIDOS = 3;
    // Tiempo de bloqueo en minutos
    private static final int MINUTOS_BLOQUEO = 5;


    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    
    public LoginResponse login(LoginRequest loginRequest) {
        Optional<Usuario> optUsuario = usuarioRepository.findByUsuario(loginRequest.getUsuario());

        if (!optUsuario.isPresent()) {
            // Error: Usuario no existe (como en image_e1a1f6.png)
            throw new RuntimeException("Usuario o contraseña incorrecto");
        }

        Usuario usuario = optUsuario.get();

        // --- Lógica de Bloqueo ---
        if (usuario.isCuentaBloqueada()) {
            if (usuario.getTiempoBloqueo() != null && LocalDateTime.now().isBefore(usuario.getTiempoBloqueo())) {
                // Error: Cuenta bloqueada temporalmente (como en image_e1a1f6.png)
                throw new RuntimeException("Se detectaron demasiados intentos de acceso. Se ha bloqueado el acceso durante 5 minutos");
            } else {
                // Si ya pasó el tiempo, desbloqueamos
                usuario.setCuentaBloqueada(false);
                usuario.setIntentosFallidos(0);
                usuario.setTiempoBloqueo(null);
            }
        }

        // --- Verificación de Contraseña ---
        if (passwordEncoder.matches(loginRequest.getContrasena(), usuario.getContrasena())) {
            // ¡Login Exitoso!
            usuario.setIntentosFallidos(0);
            usuarioRepository.save(usuario);

            return new LoginResponse(
                    usuario.getId(),
                    usuario.getUsuario(),
                    usuario.getRol(),
                    "Login exitoso"
            );
        } else {
            // Contraseña incorrecta
            usuario.setIntentosFallidos(usuario.getIntentosFallidos() + 1);

            if (usuario.getIntentosFallidos() >= MAX_INTENTOS_FALLIDOS) {
                // Bloqueamos la cuenta
                usuario.setCuentaBloqueada(true);
                usuario.setTiempoBloqueo(LocalDateTime.now().plusMinutes(MINUTOS_BLOQUEO));
            }
            usuarioRepository.save(usuario);
            throw new RuntimeException("Usuario o contraseña incorrecto");
        }
    }

    /**
     * Lógica de Gestión de Usuarios (CRUD)
     */

    // CREAR USUARIO
    public Usuario crearUsuario(CrearUsuarioRequest request) {
        if (usuarioRepository.findByUsuario(request.getUsuario()).isPresent()) {
            throw new RuntimeException("El nombre de usuario ya existe");
        }

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setUsuario(request.getUsuario());
        // Importante: Ciframos la contraseña antes de guardarla
        nuevoUsuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
        nuevoUsuario.setRol(request.getRol());

        return usuarioRepository.save(nuevoUsuario);
    }

    // OBTENER TODOS LOS USUARIOS
    public List<Usuario> obtenerTodosLosUsuarios() {
        return usuarioRepository.findAll();
    }

    // OBTENER UN USUARIO POR ID
    public Optional<Usuario> obtenerUsuarioPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    // ACTUALIZAR USUARIO
    public Usuario actualizarUsuario(Long id, CrearUsuarioRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setUsuario(request.getUsuario());
        usuario.setRol(request.getRol());

        // Opcional: solo actualiza la contraseña si se proporciona una nueva
        if (request.getContrasena() != null && !request.getContrasena().isEmpty()) {
            usuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
        }

        return usuarioRepository.save(usuario);
    }

    // ELIMINAR USUARIO
    public void eliminarUsuario(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuario no encontrado");
        }
        usuarioRepository.deleteById(id);
    }
}