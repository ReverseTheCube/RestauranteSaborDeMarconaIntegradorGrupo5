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

    // Consulta para Reportes (Ya la tenías)
    List<Pedido> findAllByFechaHoraBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    // Consulta para Mesas Ocupadas (Ya la tenías)
    @Query("SELECT p.infoServicio, p.usuario.id FROM Pedido p WHERE p.estado = 'PENDIENTE' AND p.tipoServicio = 'LOCAL'")
    List<Object[]> findMesasOcupadasConUsuario();

    // Validar mesa (Ya la tenías)
    Optional<Pedido> findByInfoServicioAndEstadoAndTipoServicio(String infoServicio, EstadoPedido estado, String tipoServicio);

    // --- NUEVA CONSULTA PARA BÚSQUEDA CON FILTROS ---
    // Esta consulta es "dinámica": si un parámetro es NULL, ignora esa condición.
    @Query("SELECT p FROM Pedido p WHERE " +
           "(:fechaInicio IS NULL OR p.fechaHora >= :fechaInicio) AND " +
           "(:fechaFin IS NULL OR p.fechaHora <= :fechaFin) AND " +
           "(:clienteId IS NULL OR p.cliente.id = :clienteId) AND " +
           "(:rucEmpresa IS NULL OR p.empresa.ruc = :rucEmpresa) AND " +
           "(:infoServicio IS NULL OR p.infoServicio = :infoServicio)")
    List<Pedido> buscarPedidosConFiltros(
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin,
            @Param("clienteId") Long clienteId,
            @Param("rucEmpresa") String rucEmpresa,
            @Param("infoServicio") String infoServicio
    );
}