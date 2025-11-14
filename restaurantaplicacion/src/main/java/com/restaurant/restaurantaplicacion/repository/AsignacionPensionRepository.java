package com.restaurant.restaurantaplicacion.repository;

import com.restaurant.restaurantaplicacion.model.AsignacionPension;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AsignacionPensionRepository extends JpaRepository<AsignacionPension, Long> {
}