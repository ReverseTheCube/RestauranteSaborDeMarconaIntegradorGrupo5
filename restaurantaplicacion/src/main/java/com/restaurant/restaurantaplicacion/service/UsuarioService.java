package com.restaurant.restaurantaplicacion.service;

import com.restaurant.restaurantaplicacion.dto.CrearUsuarioRequest;
import com.restaurant.restaurantaplicacion.dto.LoginRequest;
import com.restaurant.restaurantaplicacion.dto.LoginResponse;
import com.restaurant.restaurantaplicacion.model.Rol;
import com.restaurant.restaurantaplicacion.model.Usuario;
import com.restaurant.restaurantaplicacion.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private static final int MAX_INTENTOS_FALLIDOS = 3;
    private static final int MINUTOS_BLOQUEO = 5;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Repositorio para guardar la sesión manualmente
    private SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    public LoginResponse login(LoginRequest loginRequest) {
        Optional<Usuario> optUsuario = usuarioRepository.findByUsuario(loginRequest.getUsuario());

        if (!optUsuario.isPresent()) {
            throw new RuntimeException("Usuario o contraseña incorrecto");
        }

        Usuario usuario = optUsuario.get();

        if (usuario.isCuentaBloqueada()) {
            if (usuario.getTiempoBloqueo() != null && LocalDateTime.now().isBefore(usuario.getTiempoBloqueo())) {
                throw new RuntimeException("Se detectaron demasiados intentos de acceso. Se ha bloqueado el acceso durante 5 minutos");
            } else {
                usuario.setCuentaBloqueada(false);
                usuario.setIntentosFallidos(0);
                usuario.setTiempoBloqueo(null);
            }
        }

        if (passwordEncoder.matches(loginRequest.getContrasena(), usuario.getContrasena())) {
            usuario.setIntentosFallidos(0);
            usuarioRepository.save(usuario);

            // --- LÓGICA DE SESIÓN CORREGIDA ---
            
            // 1. Crear el token de autenticación
            SimpleGrantedAuthority authority = new SimpleGrantedAuthority(usuario.getRol().name());
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(usuario.getUsuario(), null, Collections.singletonList(authority));

            // 2. Establecer el contexto
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            // 3. ¡IMPORTANTE! Guardar explícitamente el contexto en la sesión HTTP
            // Esto es necesario en Spring Boot 3 para que persista entre peticiones
            ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            HttpServletRequest request = attr.getRequest();
            HttpServletResponse response = attr.getResponse();
            
            securityContextRepository.saveContext(context, request, response);
            
            // ----------------------------------

            return new LoginResponse(
                    usuario.getId(),
                    usuario.getUsuario(),
                    usuario.getRol(),
                    "Login exitoso"
                    ,usuario.isCambioPasswordObligatorio()
            );
        } else {
            usuario.setIntentosFallidos(usuario.getIntentosFallidos() + 1);
            if (usuario.getIntentosFallidos() >= MAX_INTENTOS_FALLIDOS) {
                usuario.setCuentaBloqueada(true);
                usuario.setTiempoBloqueo(LocalDateTime.now().plusMinutes(MINUTOS_BLOQUEO));
            }
            usuarioRepository.save(usuario);
            throw new RuntimeException("Usuario o contraseña incorrecto");
        }
    }

    public Usuario crearUsuario(CrearUsuarioRequest request) {
        if (usuarioRepository.findByUsuario(request.getUsuario()).isPresent()) {
            throw new RuntimeException("El nombre de usuario ya existe");
        }
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setUsuario(request.getUsuario());
        nuevoUsuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
        nuevoUsuario.setRol(request.getRol());

        if (request.getRol() == Rol.ADMINISTRADOR) {
            nuevoUsuario.setCambioPasswordObligatorio(false);
        } else {
            nuevoUsuario.setCambioPasswordObligatorio(true);
        }
        return usuarioRepository.save(nuevoUsuario);
    }

    public List<Usuario> obtenerTodosLosUsuarios() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> obtenerUsuarioPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    public Usuario actualizarUsuario(Long id, CrearUsuarioRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setUsuario(request.getUsuario());
        usuario.setRol(request.getRol());
        if (request.getContrasena() != null && !request.getContrasena().isEmpty()) {
            usuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
        }
        return usuarioRepository.save(usuario);
    }

    public void eliminarUsuario(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuario no encontrado");
        }
        usuarioRepository.deleteById(id);
    }

    public void cambiarContrasena(Long idUsuario, String nuevaContrasena) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        usuario.setContrasena(passwordEncoder.encode(nuevaContrasena));
        usuario.setCambioPasswordObligatorio(false); // ¡Ya cumplió!
        
        usuarioRepository.save(usuario);
    }
}