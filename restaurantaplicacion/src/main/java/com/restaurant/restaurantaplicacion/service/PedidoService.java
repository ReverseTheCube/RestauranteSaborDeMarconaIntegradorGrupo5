package com.restaurant.restaurantaplicacion.service;

import com.restaurant.restaurantaplicacion.dto.CrearPedidoRequest;
import com.restaurant.restaurantaplicacion.dto.PedidoPlatoRequest;
import com.restaurant.restaurantaplicacion.dto.FinalizarPedidoRequest;
import com.restaurant.restaurantaplicacion.model.*;
import com.restaurant.restaurantaplicacion.repository.ClienteRepository;
import com.restaurant.restaurantaplicacion.repository.EmpresaRepository;
import com.restaurant.restaurantaplicacion.repository.PedidoRepository;
import com.restaurant.restaurantaplicacion.repository.PlatoRepository;
import com.restaurant.restaurantaplicacion.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional; 

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;
    @Autowired
    private PlatoRepository platoRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ClienteRepository clienteRepository;
    @Autowired
    private EmpresaRepository empresaRepository;

    public List<Pedido> obtenerTodosLosPedidos() {
        return pedidoRepository.findAll();
    }

    // =========================================================================
    // LÓGICA DE INICIO (Creación / Reutilización del Pedido)
    // =========================================================================
    @Transactional
    public Pedido iniciarPedido(String tipoServicio, Integer numeroMesa, Long usuarioId) { // AHORA RECIBE EL ID REAL
        
        // 1. Usar el usuario REAL que viene del login
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario con ID " + usuarioId + " no encontrado."));

        // 2. Verificar si ya existe pedido PENDIENTE en esa mesa (Evitar duplicados)
        if ("LOCAL".equals(tipoServicio) && numeroMesa != null) {
            String mesaStr = String.valueOf(numeroMesa);
            
            Optional<Pedido> pedidoExistente = pedidoRepository
                .findByInfoServicioAndEstadoAndTipoServicio(mesaStr, EstadoPedido.PENDIENTE, "LOCAL");
            
            if (pedidoExistente.isPresent()) {
                // Si existe, verificamos que sea del MISMO usuario (TU LÓGICA DE BLOQUEO)
                Pedido existente = pedidoExistente.get();
                if (!existente.getUsuario().getId().equals(usuarioId)) {
                     throw new RuntimeException("Esta mesa ya está ocupada por otro mesero.");
                }
                return existente; // Devolvemos el pedido existente para que lo continúe
            }
        }

        // 3. Crear nuevo pedido si no existía (LÓGICA ORIGINAL)
        Pedido nuevoPedido = new Pedido();
        nuevoPedido.setUsuario(usuario); // ASIGNAMOS AL USUARIO REAL
        nuevoPedido.setFechaHora(LocalDateTime.now());
        nuevoPedido.setTotal(0.0); 
        nuevoPedido.setEstado(EstadoPedido.PENDIENTE);

        if ("LOCAL".equals(tipoServicio) && numeroMesa != null) {
            nuevoPedido.setTipoServicio("LOCAL");
            nuevoPedido.setInfoServicio(String.valueOf(numeroMesa)); 
        } else {
            nuevoPedido.setTipoServicio("DELIVERY");
            if (nuevoPedido.getInfoServicio() == null) {
                 nuevoPedido.setInfoServicio("DEL-" + System.currentTimeMillis());
            }
        }

        return pedidoRepository.save(nuevoPedido);
    }

    // =========================================================================
    // LÓGICA DE CREACIÓN COMPLETA (Mantengo por si la usas en otro lado)
    // =========================================================================
    @Transactional
    public Pedido crearPedido(CrearPedidoRequest request) {
        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Cliente cliente = null;
        if (request.getClienteId() != null) {
            cliente = clienteRepository.findById(request.getClienteId()).orElse(null);
        }

        Empresa empresa = null;
        if (request.getRucEmpresa() != null && !request.getRucEmpresa().isEmpty()) {
            empresa = empresaRepository.findByRuc(request.getRucEmpresa()).orElse(null);
        }

        Pedido nuevoPedido = new Pedido();
        nuevoPedido.setUsuario(usuario);
        nuevoPedido.setFechaHora(LocalDateTime.now());
        nuevoPedido.setEstado(EstadoPedido.PENDIENTE);
        
        nuevoPedido.setCliente(cliente);
        nuevoPedido.setEmpresa(empresa);
        nuevoPedido.setTipoServicio(request.getTipoServicio());
        nuevoPedido.setInfoServicio(request.getInfoServicio());
        
        double totalPedido = 0.0;
        List<PedidoPlato> detallePlatos = new ArrayList<>();

        if (request.getDetallePlatos() != null && !request.getDetallePlatos().isEmpty()) {
            for (PedidoPlatoRequest itemRequest : request.getDetallePlatos()) {
                Plato plato = platoRepository.findById(itemRequest.getPlatoId())
                        .orElseThrow(() -> new RuntimeException("Plato no encontrado: ID " + itemRequest.getPlatoId()));

                PedidoPlato detalle = new PedidoPlato();
                detalle.setPlato(plato);
                detalle.setCantidad(itemRequest.getCantidad());
                detalle.setPrecioUnitario(plato.getPrecio());
                detalle.setPedido(nuevoPedido); 

                detallePlatos.add(detalle);
                totalPedido += (plato.getPrecio() * itemRequest.getCantidad());
            }
        }

        nuevoPedido.setTotal(totalPedido);
        nuevoPedido.setDetallePlatos(detallePlatos);

        return pedidoRepository.save(nuevoPedido);
    }

    // =========================================================================
    // LÓGICA DE FINALIZACIÓN (Desbloquea la Mesa)
    // =========================================================================
    @Transactional
    public Pedido finalizarPedido(Long pedidoId, FinalizarPedidoRequest request) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado: " + pedidoId));

        if (request.getNumeroDocumento() != null && !request.getNumeroDocumento().isEmpty()) {
            Cliente cliente = clienteRepository.findByNumeroDocumento(request.getNumeroDocumento())
                    .orElse(null); 
            pedido.setCliente(cliente);
        }

        if (request.getRucEmpresa() != null && !request.getRucEmpresa().isEmpty()) {
            Empresa empresa = empresaRepository.findByRuc(request.getRucEmpresa())
                    .orElse(null);
            pedido.setEmpresa(empresa);
        }

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

        pedido.setDetallePlatos(detalles);
        pedido.setTotal(total);
        
        // ¡ESTA LÍNEA LIBERA LA MESA!
        pedido.setEstado(EstadoPedido.PAGADO); 

        return pedidoRepository.save(pedido);
    }

    // =========================================================================
    // LÓGICA DE BÚSQUEDA (Mesa Ocupada)
    // =========================================================================
    public List<java.util.Map<String, Object>> obtenerMesasOcupadas() {
        List<Object[]> resultados = pedidoRepository.findMesasOcupadasConUsuario();
        List<java.util.Map<String, Object>> listaLimpia = new ArrayList<>();

        for (Object[] fila : resultados) {
            java.util.Map<String, Object> mapa = new java.util.HashMap<>();
            mapa.put("mesa", fila[0]);      
            mapa.put("usuarioId", fila[1]); 
            listaLimpia.add(mapa);
        }
        return listaLimpia;
    }
}