package com.restaurant.restaurantaplicacion.repository;

import com.restaurant.restaurantaplicacion.model.EstadoPedido;
import com.restaurant.restaurantaplicacion.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // Para Reportes (Ya existente)
    List<Pedido> findAllByFechaHoraBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    // Para Mesas (Ya existente)
    @Query("SELECT p.infoServicio, p.usuario.id FROM Pedido p WHERE p.estado = 'PENDIENTE' AND p.tipoServicio = 'LOCAL'")
    List<Object[]> findMesasOcupadasConUsuario();

    Optional<Pedido> findByInfoServicioAndEstadoAndTipoServicio(String infoServicio, EstadoPedido estado, String tipoServicio);

    // --- NUEVA CONSULTA MAESTRA PARA BÚSQUEDA ---
    // Usa LEFT JOIN para no perder pedidos sin cliente/empresa
    @Query("SELECT p FROM Pedido p " +
           "LEFT JOIN p.cliente c " +
           "LEFT JOIN p.empresa e " +
           "WHERE " +
           "(:fechaInicio IS NULL OR p.fechaHora >= :fechaInicio) AND " +
           "(:fechaFin IS NULL OR p.fechaHora <= :fechaFin) AND " +
           "(:clienteId IS NULL OR (c.id IS NOT NULL AND c.id = :clienteId)) AND " +
           "(:rucEmpresa IS NULL OR (e.ruc IS NOT NULL AND e.ruc = :rucEmpresa)) AND " +
           "(:infoServicio IS NULL OR p.infoServicio = :infoServicio)")
    List<Pedido> buscarPedidosConFiltros(
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin,
            @Param("clienteId") Long clienteId,
            @Param("rucEmpresa") String rucEmpresa,
            @Param("infoServicio") String infoServicio
    );
}