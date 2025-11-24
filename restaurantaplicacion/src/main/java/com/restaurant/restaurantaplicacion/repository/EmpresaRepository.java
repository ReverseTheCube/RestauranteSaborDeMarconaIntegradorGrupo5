package com.restaurant.restaurantaplicacion.repository;

import com.restaurant.restaurantaplicacion.model.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List; // Importar List
import java.util.Optional;

@Repository
public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    // Para validar que el RUC no esté duplicado
    Optional<Empresa> findByRuc(String ruc);
    
    // NUEVO: Para buscar por RUC o Razón Social (parcial y sin distinguir mayúsculas)
    List<Empresa> findByRucContainingOrRazonSocialContainingIgnoreCase(String ruc, String razonSocial);
}