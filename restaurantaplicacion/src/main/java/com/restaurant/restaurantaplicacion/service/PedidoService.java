package com.restaurant.restaurantaplicacion.service;

import com.restaurant.restaurantaplicacion.dto.CrearPedidoRequest;
import com.restaurant.restaurantaplicacion.dto.FinalizarPedidoRequest;
import com.restaurant.restaurantaplicacion.dto.PedidoPlatoRequest;
import com.restaurant.restaurantaplicacion.model.*;
import com.restaurant.restaurantaplicacion.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@Service
public class PedidoService {

    @Autowired private PedidoRepository pedidoRepository;
    @Autowired private PlatoRepository platoRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private ClienteRepository clienteRepository;
    @Autowired private EmpresaRepository empresaRepository;
    @Autowired private AsignacionPensionRepository asignacionPensionRepository;

    public List<Pedido> obtenerTodosLosPedidos() {
        return pedidoRepository.findAll();
    }

    @Transactional
    public Pedido iniciarPedido(String tipoServicio, Integer numeroMesa, Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        if ("LOCAL".equals(tipoServicio) && numeroMesa != null) {
            String mesaStr = String.valueOf(numeroMesa);
            Optional<Pedido> pedidoExistente = pedidoRepository
                .findByInfoServicioAndEstadoAndTipoServicio(mesaStr, EstadoPedido.PENDIENTE, "LOCAL");
            
            if (pedidoExistente.isPresent()) {
                return pedidoExistente.get(); 
            }
        }

        Pedido nuevoPedido = new Pedido();
        nuevoPedido.setUsuario(usuario);
        nuevoPedido.setFechaHora(LocalDateTime.now());
        nuevoPedido.setTotal(0.0);
        nuevoPedido.setEstado(EstadoPedido.PENDIENTE);

        if ("LOCAL".equals(tipoServicio) && numeroMesa != null) {
            nuevoPedido.setTipoServicio("LOCAL");
            nuevoPedido.setInfoServicio(String.valueOf(numeroMesa));
        } else {
            nuevoPedido.setTipoServicio("DELIVERY");
            nuevoPedido.setInfoServicio("DEL-" + System.currentTimeMillis());
        }
        return pedidoRepository.save(nuevoPedido);
    }

    @Transactional
    public Pedido crearPedido(CrearPedidoRequest request) {
        return iniciarPedido(request.getTipoServicio(), 
            request.getInfoServicio() != null ? Integer.parseInt(request.getInfoServicio()) : null, 
            request.getUsuarioId());
    }

    // --- AQUÍ ESTÁ LA MAGIA DEL TOTAL ---

    // 2. ACTUALIZA EL MÉTODO finalizarPeddo
    @Transactional
    public Pedido finalizarPedido(Long pedidoId, FinalizarPedidoRequest request) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado: " + pedidoId));

        // Calcular Total del Pedido
        double total = 0.0;
        List<PedidoPlato> detalles = new ArrayList<>();
        
        if (request.getDetallePlatos() != null) {
            for (PedidoPlatoRequest item : request.getDetallePlatos()) {
                Plato plato = platoRepository.findById(item.getPlatoId())
                        .orElseThrow(() -> new RuntimeException("Plato no encontrado ID: " + item.getPlatoId()));

                PedidoPlato detalle = new PedidoPlato();
                detalle.setPedido(pedido);
                detalle.setPlato(plato);
                detalle.setCantidad(item.getCantidad());
                detalle.setPrecioUnitario(plato.getPrecio());
                
                detalles.add(detalle);
                total += (plato.getPrecio() * item.getCantidad());
            }
        }
        
        // --- LÓGICA DE PENSIONADO (DESCUENTO DE SALDO) ---
        // Si el pedido tiene un DNI asociado, verificamos si es pensionado
        if (request.getNumeroDocumento() != null && !request.getNumeroDocumento().isEmpty()) {
            
            // 1. Asignar Cliente al Pedido
            Cliente cliente = clienteRepository.findByNumeroDocumento(request.getNumeroDocumento()).orElse(null);
            pedido.setCliente(cliente);

            // 2. Buscar si tiene Asignación (Pensión)
            Optional<AsignacionPension> asignacionOpt = asignacionPensionRepository
                    .findByClienteNumeroDocumento(request.getNumeroDocumento());

            if (asignacionOpt.isPresent()) {
                AsignacionPension asignacion = asignacionOpt.get();
                
                // Asignar la empresa automáticamente
                pedido.setEmpresa(asignacion.getEmpresa());

                // VERIFICAR SALDO
                if (asignacion.getSaldo() >= total) {
                    // DESCONTAR SALDO
                    double nuevoSaldo = asignacion.getSaldo() - total;
                    asignacion.setSaldo(nuevoSaldo);
                    asignacionPensionRepository.save(asignacion); // Guardar nuevo saldo
                    System.out.println("Cobro a pensionado exitoso. Nuevo saldo: " + nuevoSaldo);
                } else {
                throw new RuntimeException("Saldo insuficiente. Su saldo es S/ " + asignacion.getSaldo() + " y el pedido es S/ " + total);                }
            }
        }
        // ------------------------------------------------

        pedido.setDetallePlatos(detalles);
        pedido.setTotal(total);
        pedido.setEstado(EstadoPedido.PAGADO);

        return pedidoRepository.save(pedido);
    }

    public List<Map<String, Object>> obtenerMesasOcupadas() {
        List<Object[]> resultados = pedidoRepository.findMesasOcupadasConUsuario();
        List<Map<String, Object>> lista = new ArrayList<>();
        for (Object[] fila : resultados) {
            Map<String, Object> mapa = new HashMap<>();
            mapa.put("mesa", fila[0]);      
            mapa.put("usuarioId", fila[1]); 
            lista.add(mapa);
        }
        return lista;
    }

// --- LÓGICA DE BÚSQUEDA AVANZADA ---
   public List<Pedido> buscarPedidosAvanzado(LocalDate fechaDesde, LocalDate fechaHasta, Long clienteId, String rucEmpresa, String mesa, String deliveryCode) {
        
        // 1. Ajustar Fechas (Inicio del día 00:00 -> Fin del día 23:59)
        LocalDateTime inicio = (fechaDesde != null) ? fechaDesde.atStartOfDay() : null;
        LocalDateTime fin = (fechaHasta != null) ? fechaHasta.atTime(23, 59, 59) : null;

        // 2. Limpiar Strings vacíos (Convertir "" a null)
        if (rucEmpresa != null && rucEmpresa.trim().isEmpty()) rucEmpresa = null;
        if (mesa != null && mesa.trim().isEmpty()) mesa = null;
        if (deliveryCode != null && deliveryCode.trim().isEmpty()) deliveryCode = null;

        // 3. Unificar info de servicio
        String infoServicio = null;
        if (mesa != null) {
            // Si viene "mesa1", guardamos "1"
            infoServicio = mesa.replace("mesa", "").trim(); 
        } else if (deliveryCode != null) {
            infoServicio = deliveryCode.trim();
        }

        // 4. Ejecutar consulta
        return pedidoRepository.buscarPedidosConFiltros(inicio, fin, clienteId, rucEmpresa, infoServicio);
    }
}