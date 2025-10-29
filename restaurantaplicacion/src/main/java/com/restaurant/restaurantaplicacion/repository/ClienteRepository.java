package com.restaurant.restaurantaplicacion.repository;

import com.restaurant.restaurantaplicacion.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    // Para validar que el documento no esté duplicado
    Optional<Cliente> findByNumeroDocumento(String numeroDocumento);
}