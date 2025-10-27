package com.restaurant.restaurantaplicacion.repository;

import com.restaurant.restaurantaplicacion.model.Plato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlatoRepository extends JpaRepository<Plato, Long> {
    
}