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
            // 1. Deshabilitar CSRF
            .csrf(csrf -> csrf.disable())

            // 2. Configurar las reglas de autorización
            .authorizeHttpRequests(authz -> authz

                // 3. Permitir acceso PÚBLICO a páginas estáticas y sus recursos
                .requestMatchers(
                    // Login y Generales
                    "/", "/index.html",
                    "/css/style.css", "/js/login.js",
                    // Menús de Rol
                    "/admin.html", "/cajero.html", "/mesero.html", "/cocinero.html",
                    // Gestión Usuarios
                    "/gestion-usuarios.html", "/js/gestion-usuarios.js",
                    // Gestión Clientes
                    "/gestion-cliente.html", "/css/style-cliente.css", "/js/gestion-clientes.js",
                    // Gestión Menú (Platos)
                    "/menu.html",
                    "/menu-crear.html",
                    "/menu-editar.html",
                    "/menu-eliminar.html",
                    "/css/menu-style.css",
                    "/js/menu-navegacion.js",
                    "/js/menu-crear.js",
                    "/js/menu-editar.js",
                    "/js/menu-eliminar.js",
                    //GestionClientes
                    "/gestion-clientes.html",
                    "/js/gestion-clientes.js",
                    // Historial/Reportes
                    "/busquedafiltro.html",
                    "/ventaehistorial.html",
                    "/ventaehistorialA.html",
                    "/ventaehistorialB.html",
                    "/css/historial-style.css",
                    "/js/historial-busqueda.js",
                    "/js/historial-venta.js",
                    "/js/historial-ventaA.js",
                    "/js/historial-ventaB.js",

                    //Registrar_Pedidos
                    "/registrarpedido.html", "/mesa.html","/pedidos.html",

                    // Rutas para los recursos estáticos (CSS, JS, Imágenes)
                    "/css/**", 
                    "/js/**", 
                    "/complementos/imagenes/**"

                ).permitAll() // Permite acceso a todo lo listado arriba

                // 4. Permitir acceso PÚBLICO (o autenticado, si prefieres) a las APIs
                .requestMatchers("/api/auth/login").permitAll()      // API Login
                .requestMatchers("/api/usuarios/**").permitAll()   // API Usuarios
                .requestMatchers("/api/platos/**").permitAll()     // API Platos
                .requestMatchers("/api/pedidos/**").permitAll()    // API Pedidos
                .requestMatchers("/api/reportes/**").permitAll()   // API Reportes
                .requestMatchers("/api/clientes/**").permitAll()   // API Clientes
                .requestMatchers("/api/empresas/**").permitAll()   // API Empresas

                // 5. Para CUALQUIER OTRA petición, se debe estar autenticado
                .anyRequest().authenticated()
            )

            // 6. Deshabilitar formulario de login por defecto
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable());

        return http.build();
    }
}