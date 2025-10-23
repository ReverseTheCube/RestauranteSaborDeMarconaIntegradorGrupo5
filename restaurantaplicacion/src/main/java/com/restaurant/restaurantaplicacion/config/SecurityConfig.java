package com.restaurant.restaurantaplicacion.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity // Le dice a Spring que esta es nuestra configuración de seguridad
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Usa BCrypt, el estándar moderno para cifrado de contraseñas
        return new BCryptPasswordEncoder();
    }

    /**
     * ¡AQUÍ ESTÁ LA MAGIA!
     * Este Bean configura las reglas de seguridad de HTTP.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Deshabilitar CSRF (es común para APIs REST/formularios JS)
            .csrf(csrf -> csrf.disable()) 
            
            // 2. Configurar las reglas de autorización de peticiones
            .authorizeHttpRequests(authz -> authz
                
                // 3. Permitir acceso PÚBLICO a nuestra página de login y sus archivos
                .requestMatchers("/", "/index.html", "/css/style.css", "/js/login.js",
                    "/admin.html", "/cajero.html", "/mesero.html", "/cocinero.html"
                ).permitAll()
                
                // 4. Permitir acceso PÚBLICO a nuestro endpoint de API de login
                .requestMatchers("/api/auth/login").permitAll()

                // 5. Permitir la creación de usuarios (POST) sin estar logueado
                // (Esto permite usar Postman como en la Opción A)
                .requestMatchers(HttpMethod.POST, "/api/usuarios").permitAll()
                
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