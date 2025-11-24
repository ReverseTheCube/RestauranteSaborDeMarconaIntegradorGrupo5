package com.restaurant.restaurantaplicacion.repository;

import com.restaurant.restaurantaplicacion.model.EstadoPedido;
import com.restaurant.restaurantaplicacion.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

// --- AÑADIR ESTOS IMPORTS ---
import java.time.LocalDateTime;
import java.util.List;
// -----------------------------

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // --- AÑADIR ESTE MÉTODO PARA FILTRAR PEDIDOS POR RANGO DE FECHAS ---
    List<Pedido> findAllByFechaHoraBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    // -------------------------
// Devuelve un arreglo de objetos: [numeroMesa, usuarioId]
@Query("SELECT p.infoServicio, p.usuario.id FROM Pedido p WHERE p.estado = 'PENDIENTE' AND p.tipoServicio = 'LOCAL'")
List<Object[]> findMesasOcupadasConUsuario();
Optional<Pedido> findByInfoServicioAndEstadoAndTipoServicio(String infoServicio, EstadoPedido estado, String tipoServicio);

}