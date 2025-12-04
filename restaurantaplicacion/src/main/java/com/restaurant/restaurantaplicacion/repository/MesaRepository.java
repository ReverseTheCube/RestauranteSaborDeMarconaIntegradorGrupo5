package com.restaurant.restaurantaplicacion.repository;

import com.restaurant.restaurantaplicacion.model.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MesaRepository extends JpaRepository<Mesa, Long> {
    Optional<Mesa> findByNumeroMesa(String numeroMesa);
}