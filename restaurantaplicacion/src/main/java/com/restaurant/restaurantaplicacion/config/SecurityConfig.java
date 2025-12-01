package com.restaurant.restaurantaplicacion.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

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
            // 1. Deshabilitar CSRF (Crítico para que el POST de login funcione sin tokens extra)
            .csrf(csrf -> csrf.disable())
            
            // 2. Habilitar CORS (Para evitar problemas si el front y el back se consideran orígenes distintos)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 3. Reglas de Autorización
            .authorizeHttpRequests(authz -> authz
                // --- REGLAS PÚBLICAS (Permitir a todos) ---
                
                // A. La API de Login (¡Muy Importante!)
                .requestMatchers("/api/auth/login").permitAll()
                
                // B. Recursos estáticos (CSS, JS, Imágenes)
                .requestMatchers("/css/**", "/js/**", "/complementos/**", "/images/**").permitAll()
                
                // C. Páginas HTML públicas (Login, Cambio de Pass)
                .requestMatchers("/", "/index.html", "/cambiar-password.html").permitAll()
                
                // D. Scripts específicos públicos
                .requestMatchers("/js/login.js", "/js/cambiar-password.js").permitAll()
                .requestMatchers("/api/usuarios/cambiar-contrasena").authenticated() // Esta requiere estar logueado

                // --- REGLAS POR ROL (Seguridad Real) ---
                
                // Administrador
                .requestMatchers("/admin.html", "/gestion-usuarios.html").hasAuthority("ADMINISTRADOR")
                .requestMatchers("/api/usuarios/**").permitAll()

                // Cajero
                .requestMatchers("/cajero.html").hasAuthority("CAJERO")
                
                // Mesero
                .requestMatchers("/mesero.html").hasAuthority("MESERO")
                
                // Cocinero
                .requestMatchers("/cocinero.html").hasAuthority("COCINERO")

                // --- CUALQUIER OTRA COSA: BLOQUEADA ---
                .anyRequest().authenticated()
            )
            
            // 4. Configuración de Logout
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            );

        return http.build();
    }

    // Configuración CORS para permitir peticiones desde el mismo servidor (y otros si fuera necesario)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:8080")); // Permitir origen local
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}