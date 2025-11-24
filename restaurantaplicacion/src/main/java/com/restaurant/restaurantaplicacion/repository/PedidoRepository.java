package com.restaurant.restaurantaplicacion.repository;

import com.restaurant.restaurantaplicacion.model.EstadoPedido;
import com.restaurant.restaurantaplicacion.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // Busca pedidos en un rango de fechas (Esencial para los reportes)
    List<Pedido> findAllByFechaHoraBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    // Para verificar mesas ocupadas
    @Query("SELECT p.infoServicio, p.usuario.id FROM Pedido p WHERE p.estado = 'PENDIENTE' AND p.tipoServicio = 'LOCAL'")
    List<Object[]> findMesasOcupadasConUsuario();

    Optional<Pedido> findByInfoServicioAndEstadoAndTipoServicio(String infoServicio, EstadoPedido estado, String tipoServicio);
}