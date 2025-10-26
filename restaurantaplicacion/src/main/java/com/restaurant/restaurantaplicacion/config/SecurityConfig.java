package com.restaurant.restaurantaplicacion.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Deshabilitar CSRF (es común para APIs REST/formularios JS)
            .csrf(csrf -> csrf.disable()) 
            
            // 2. Configurar las reglas de autorización de peticiones
            .authorizeHttpRequests(authz -> authz
                
                // 3. Permitir acceso PÚBLICO a nuestra página de login y sus archivos
                .requestMatchers(
                    "/", "/index.html", "/css/style.css", "/js/login.js",
                    "/admin.html", "/cajero.html", "/mesero.html", "/cocinero.html",
                    "/gestion-usuarios.html", "/js/gestion-usuarios.js" // <-- AÑADIDOS
                ).permitAll()
                
                // 4. Permitir acceso PÚBLICO a nuestro endpoint de API de login
                .requestMatchers("/api/auth/login").permitAll()

                // 5. Permitir la creación de usuarios (POST) sin estar logueado
                // 5. Permitir TODAS las operaciones CRUD en /api/usuarios
                // Esto permite GET (leer), POST (crear), PUT (editar) y DELETE (eliminar)
                .requestMatchers("/api/usuarios/**").permitAll()
                
                // 6. Para CUALQUIER OTRA petición (ej. /admin.html), se debe estar autenticado
                .anyRequest().authenticated()
            )
            
            // 7. Deshabilitar el formulario de login POR DEFECTO de Spring
            // (Porque ya tenemos el nuestro en index.html)
            .formLogin(form -> form.disable()) 
            .httpBasic(basic -> basic.disable());

        return http.build();
    }
}