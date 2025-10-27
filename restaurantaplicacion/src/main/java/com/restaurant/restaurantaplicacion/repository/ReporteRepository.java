package com.restaurant.restaurantaplicacion.repository;

import com.restaurant.restaurantaplicacion.model.Reporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReporteRepository extends JpaRepository<Reporte, Long> {

    // Podríamos necesitar buscar por nombre de archivo en el futuro
    Optional<Reporte> findByNombreArchivo(String nombreArchivo);
}