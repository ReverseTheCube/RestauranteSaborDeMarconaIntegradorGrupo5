package com.restaurant.restaurantaplicacion.repository;

import com.restaurant.restaurantaplicacion.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Spring Data JPA creará automáticamente la consulta
    // SELECT * FROM usuarios WHERE usuario = ?
    Optional<Usuario> findByUsuario(String usuario);
}