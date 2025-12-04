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

    // --- CORRECCIÓN AQUÍ (Línea clave) ---
    // Antes: p.estado = 'PENDIENTE'
    // Ahora: p.estado IN ('PENDIENTE', 'POR_PAGAR')
    @Query("SELECT p.infoServicio, p.usuario.id, p.estado FROM Pedido p WHERE p.tipoServicio = 'LOCAL' AND p.estado IN ('PENDIENTE', 'POR_PAGAR')")
    List<Object[]> findMesasOcupadasConUsuario();
    // -------------------------------------

    // Este método busca por un estado específico, sirve para "Iniciar Pedido" (buscar si ya existe uno abierto)
    // Si quieres que el mesero pueda agregar platos a un pedido que ya envió a caja, 
    // tendrías que cambiar esto también, pero para visualizar mesas ocupadas, con la corrección de arriba basta.
    Optional<Pedido> findByInfoServicioAndEstadoAndTipoServicio(String infoServicio, EstadoPedido estado, String tipoServicio);

    // --- CONSULTA MAESTRA PARA BÚSQUEDA ---
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