package com.restaurant.restaurantaplicacion.repository;

import com.restaurant.restaurantaplicacion.model.AsignacionPension;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AsignacionPensionRepository extends JpaRepository<AsignacionPension, Long> {
    
    // Busca asignaciones por el RUC de la empresa relacionada
    List<AsignacionPension> findByEmpresaRuc(String ruc);
    // En AsignacionPensionRepository.java (dentro de la interfaz)
    Optional<AsignacionPension> findByClienteNumeroDocumentoAndEmpresaRuc(String numeroDocumento, String ruc);

}