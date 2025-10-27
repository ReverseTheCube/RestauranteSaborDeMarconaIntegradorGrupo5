package com.restaurant.restaurantaplicacion.repository;

import com.restaurant.restaurantaplicacion.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// --- AÑADIR ESTOS IMPORTS ---
import java.time.LocalDateTime;
import java.util.List;
// -----------------------------

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // --- AÑADIR ESTE MÉTODO PARA FILTRAR PEDIDOS POR RANGO DE FECHAS ---
    List<Pedido> findAllByFechaHoraBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    // -------------------------

}