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
    @Autowired private MesaRepository mesaRepository;   
    
    public List<Pedido> obtenerTodosLosPedidos() {
        return pedidoRepository.findAll();
    }

    // --- Search by ID (New) ---
    public Optional<Pedido> findById(Long id) {
        return pedidoRepository.findById(id);
    }

    @Transactional
    public Pedido iniciarPedido(String tipoServicio, Integer numeroMesa, Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        if ("LOCAL".equals(tipoServicio) && numeroMesa != null) {
            String mesaStr = String.valueOf(numeroMesa);
            // Searches for PENDING orders to avoid duplication
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

@Transactional
    public Pedido finalizarPedido(Long pedidoId, FinalizarPedidoRequest request) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado: " + pedidoId));

        // 1. Limpieza de Datos
        String rol = request.getRolUsuario();
        if (rol != null) rol = rol.trim().toUpperCase();
        
        String numDoc = request.getNumeroDocumento();
        if (numDoc != null) numDoc = numDoc.trim();

        System.out.println(">>> INICIO FINALIZAR PEDIDO #" + pedidoId);
        System.out.println(">>> ROL: " + rol);
        System.out.println(">>> CLIENTE DOC: " + numDoc);

        // 2. Calcular Total
        double total = 0.0;
        List<PedidoPlato> detalles = new ArrayList<>();
        if (request.getDetallePlatos() != null) {
            for (PedidoPlatoRequest item : request.getDetallePlatos()) {
                Plato plato = platoRepository.findById(item.getPlatoId()).orElseThrow();
                PedidoPlato detalle = new PedidoPlato();
                detalle.setPedido(pedido); detalle.setPlato(plato);
                detalle.setCantidad(item.getCantidad()); detalle.setPrecioUnitario(plato.getPrecio());
                detalles.add(detalle);
                total += (plato.getPrecio() * item.getCantidad());
            }
        }
        pedido.setDetallePlatos(detalles);
        pedido.setTotal(total);
        System.out.println(">>> TOTAL CALCULADO: S/ " + total);

        // Asignar Cliente al Pedido
        if (numDoc != null && !numDoc.isEmpty()) {
             pedido.setCliente(clienteRepository.findByNumeroDocumento(numDoc).orElse(null));
        }

        // --- CASO MESERO ---
        if ("MESERO".equals(rol)) {
            pedido.setEstado(EstadoPedido.POR_PAGAR);
            return pedidoRepository.save(pedido); 
        }

        // --- CASO CAJERO ---
        if ("CAJERO".equals(rol) || "ADMINISTRADOR".equals(rol)) {
            
            // LÓGICA DE COBRO (Aquí está el problema, vamos a ver qué pasa)
            if (numDoc != null && !numDoc.isEmpty()) {
                System.out.println(">>> Buscando si el DNI " + numDoc + " es pensionado...");
                
                Optional<AsignacionPension> asignacionOpt = asignacionPensionRepository
                        .findByClienteNumeroDocumento(numDoc);

                if (asignacionOpt.isPresent()) {
                    AsignacionPension asignacion = asignacionOpt.get();
                    System.out.println(">>> ¡ES PENSIONADO! Saldo Actual: S/ " + asignacion.getSaldo());
                    
                    // Asignamos la empresa para el registro
                    pedido.setEmpresa(asignacion.getEmpresa());

                    if (asignacion.getSaldo() >= total) {
                        double saldoAnterior = asignacion.getSaldo();
                        double nuevoSaldo = saldoAnterior - total;
                        
                        asignacion.setSaldo(nuevoSaldo);
                        asignacionPensionRepository.save(asignacion); // <--- AQUÍ SE GUARDA LA RESTA
                        
                        System.out.println(">>> ✅ RESTA EXITOSA. Antes: " + saldoAnterior + " | Ahora: " + nuevoSaldo);
                    } else {
                        System.out.println(">>> ❌ ERROR: Saldo insuficiente.");
                        throw new RuntimeException("Saldo insuficiente. Su saldo es S/ " + asignacion.getSaldo() + " y el pedido es S/ " + total);
                    }
                } else {
                    System.out.println(">>> ⚠️ AVISO: El cliente existe pero NO tiene asignación de pensión activa.");
                }
            } else {
                System.out.println(">>> ℹ️ No hay documento de cliente, se cobra como anónimo.");
            }

            // Finalizar y Liberar
            pedido.setEstado(EstadoPedido.PAGADO);
            Pedido pedidoGuardado = pedidoRepository.save(pedido);

            if ("LOCAL".equals(pedido.getTipoServicio()) && pedido.getInfoServicio() != null) {
                try {
                    Long mesaId = Long.parseLong(pedido.getInfoServicio());
                    Optional<Mesa> mesaOpt = mesaRepository.findById(mesaId);
                    if (mesaOpt.isPresent()) {
                        Mesa mesa = mesaOpt.get();
                        mesa.setEstado(EstadoMesa.LIBRE);
                        mesaRepository.save(mesa);
                        System.out.println(">>> MESA LIBERADA.");
                    }
                } catch (Exception e) {}
            }
            return pedidoGuardado;
        }

        return pedidoRepository.save(pedido);
    }

    // --- FOR TABLE MAP (SEMAPHORE) ---
    public List<Map<String, Object>> obtenerMesasOcupadas() {
        // Ensure PedidoRepository returns 3 columns in the query
        List<Object[]> resultados = pedidoRepository.findMesasOcupadasConUsuario();
        List<Map<String, Object>> lista = new ArrayList<>();
        
        for (Object[] fila : resultados) {
            Map<String, Object> mapa = new HashMap<>();
            mapa.put("mesa", fila[0]);      // Column 0: InfoService (Table Number)
            mapa.put("usuarioId", fila[1]); // Column 1: User ID
            
            // Check if status column exists (index 2)
            if (fila.length > 2) {
                mapa.put("estado", fila[2]); // Column 2: Status
            } else {
                mapa.put("estado", "PENDIENTE"); 
            }
            
            lista.add(mapa);
        }
        return lista;
    }

    // --- ADVANCED SEARCH ---
    public List<Pedido> buscarPedidosAvanzado(LocalDate fechaDesde, LocalDate fechaHasta, Long clienteId, String rucEmpresa, String mesa, String deliveryCode) {
        LocalDateTime inicio = (fechaDesde != null) ? fechaDesde.atStartOfDay() : null;
        LocalDateTime fin = (fechaHasta != null) ? fechaHasta.atTime(23, 59, 59) : null;

        if (rucEmpresa != null && rucEmpresa.trim().isEmpty()) rucEmpresa = null;
        if (mesa != null && mesa.trim().isEmpty()) mesa = null;
        if (deliveryCode != null && deliveryCode.trim().isEmpty()) deliveryCode = null;

        String infoServicio = null;
        if (mesa != null) {
            infoServicio = mesa.replace("mesa", "").trim(); 
        } else if (deliveryCode != null) {
            infoServicio = deliveryCode.trim();
        }

        return pedidoRepository.buscarPedidosConFiltros(inicio, fin, clienteId, rucEmpresa, infoServicio);
    }
}