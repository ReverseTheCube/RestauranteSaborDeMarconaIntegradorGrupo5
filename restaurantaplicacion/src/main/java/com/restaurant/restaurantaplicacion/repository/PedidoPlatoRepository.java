package com.restaurant.restaurantaplicacion.repository;

import com.restaurant.restaurantaplicacion.model.PedidoPlato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PedidoPlatoRepository extends JpaRepository<PedidoPlato, Long> {
    
}