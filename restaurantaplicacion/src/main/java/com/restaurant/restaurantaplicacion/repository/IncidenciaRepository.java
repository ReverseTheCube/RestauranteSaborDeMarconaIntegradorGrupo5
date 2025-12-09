package com.restaurant.restaurantaplicacion.repository;

import com.restaurant.restaurantaplicacion.model.Incidencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidenciaRepository extends JpaRepository<Incidencia, Long> {
    
    List<Incidencia> findByEstado(String estado);
}