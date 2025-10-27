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
                    "/gestion-usuarios.html", "/js/gestion-usuarios.js",

                    // --- MENU ---
                    // Tus 4 nuevos HTML
                    "/menu.html",
                    "/menu - crear.html",
                    "/menu - editar.html",
                    "/menu - eliminar.html",
                    // Tu nuevo CSS
                    "/css/menu-style.css", 
                    // Tus 4 nuevos JS
                    "/js/menu-navegacion.js", 
                    "/js/menu-crear.js",
                    "/js/menu-editar.js",
                    "/js/menu-eliminar.js"
                   

                ).permitAll()
                
                // 4. Permitir acceso PÚBLICO a nuestro endpoint de API de login
                .requestMatchers("/api/auth/login").permitAll()

                // 5. Permitir TODAS las operaciones CRUD en /api/usuarios
                .requestMatchers("/api/usuarios/**").permitAll()
                
                // --- LÍNEA AÑADIDA ---
                // 6. Permitir TODAS las operaciones CRUD en /api/platos
                .requestMatchers("/api/platos/**").permitAll()
                // ---------------------
                // --- AÑADIR ESTA LÍNEA ---
                .requestMatchers("/api/reportes/**").permitAll() 
    // -------------------------
                // 7. Para CUALQUIER OTRA petición, se debe estar autenticado
                .anyRequest().authenticated()
            )
            
            // 8. Deshabilitar el formulario de login POR DEFECTO de Spring
            .formLogin(form -> form.disable()) 
            .httpBasic(basic -> basic.disable());

        return http.build();
    }
}