package com.restaurant.restaurantaplicacion;

import com.restaurant.restaurantaplicacion.model.Rol;
import com.restaurant.restaurantaplicacion.model.Usuario;
import com.restaurant.restaurantaplicacion.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class RestaurantaplicacionApplication {

	public static void main(String[] args) {
		SpringApplication.run(RestaurantaplicacionApplication.class, args);
	}

    // Este Bean se ejecuta automáticamente al iniciar la app
    @Bean
    public CommandLineRunner initData(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Verificar si existe el usuario 'admin'
            if (usuarioRepository.findByUsuario("admin").isEmpty()) {
                
                System.out.println("--- CREANDO ADMINISTRADOR POR DEFECTO ---");
                
                Usuario admin = new Usuario();
                admin.setUsuario("admin");
                admin.setContrasena(passwordEncoder.encode("admin123")); // Contraseña cifrada
                admin.setRol(Rol.ADMINISTRADOR);
                admin.setCambioPasswordObligatorio(false); // El admin principal no necesita cambiar pass
                
                usuarioRepository.save(admin);
                
                System.out.println(">>> Usuario 'admin' creado con contraseña 'admin123'");
            } else {
                System.out.println("--- El administrador ya existe, no se realizaron cambios ---");
            }
        };
    }
}