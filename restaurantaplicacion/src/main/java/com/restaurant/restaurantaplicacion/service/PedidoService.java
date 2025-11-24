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
    @Transactional
    public Pedido finalizarPedido(Long pedidoId, FinalizarPedidoRequest request) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado: " + pedidoId));

        if (request.getNumeroDocumento() != null && !request.getNumeroDocumento().isEmpty()) {
            clienteRepository.findByNumeroDocumento(request.getNumeroDocumento())
                .ifPresent(pedido::setCliente);
        }
        if (request.getRucEmpresa() != null && !request.getRucEmpresa().isEmpty()) {
            empresaRepository.findByRuc(request.getRucEmpresa())
                .ifPresent(pedido::setEmpresa);
        }

        double totalCalculado = 0.0;
        List<PedidoPlato> detalles = new ArrayList<>();
        
        if (request.getDetallePlatos() != null) {
            for (PedidoPlatoRequest item : request.getDetallePlatos()) {
                Plato plato = platoRepository.findById(item.getPlatoId())
                        .orElseThrow(() -> new RuntimeException("Plato no encontrado ID: " + item.getPlatoId()));

                PedidoPlato detalle = new PedidoPlato();
                detalle.setPedido(pedido);
                detalle.setPlato(plato);
                detalle.setCantidad(item.getCantidad());
                detalle.setPrecioUnitario(plato.getPrecio()); // Usamos el precio actual del plato
                
                detalles.add(detalle);
                // SUMA AL TOTAL
                totalCalculado += (plato.getPrecio() * item.getCantidad());
            }
        }

        // Guardamos los detalles y el total
        pedido.setDetallePlatos(detalles);
        pedido.setTotal(totalCalculado); // <--- AQUÍ SE GUARDA EL MONTO
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
}