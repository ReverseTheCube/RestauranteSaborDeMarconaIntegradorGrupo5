package com.restaurant.restaurantaplicacion.repository;

import com.restaurant.restaurantaplicacion.model.AsignacionPension;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List; // Debe importar List

@Repository
public interface AsignacionPensionRepository extends JpaRepository<AsignacionPension, Long> {
    
    // ESTA LÍNEA ES CRUCIAL
    // Le dice a Spring que busque Asignaciones donde el RUC de la Empresa relacionada sea igual a 'ruc'.
    List<AsignacionPension> findByEmpresaRuc(String ruc); 
}