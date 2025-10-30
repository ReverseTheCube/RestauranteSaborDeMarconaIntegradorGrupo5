package com.restaurant.restaurantaplicacion.service;

import com.restaurant.restaurantaplicacion.dto.CrearPedidoRequest;
import com.restaurant.restaurantaplicacion.dto.PedidoPlatoRequest;
import com.restaurant.restaurantaplicacion.model.*;
import com.restaurant.restaurantaplicacion.repository.ClienteRepository; // <-- IMPORTAR
import com.restaurant.restaurantaplicacion.repository.EmpresaRepository; // <-- IMPORTAR
import com.restaurant.restaurantaplicacion.repository.PedidoRepository;
import com.restaurant.restaurantaplicacion.repository.PlatoRepository;
import com.restaurant.restaurantaplicacion.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;
    @Autowired
    private PlatoRepository platoRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;

    // --- AÑADIR ESTOS REPOSITORIOS ---
    @Autowired
    private ClienteRepository clienteRepository;
    @Autowired
    private EmpresaRepository empresaRepository;
    // ------------------------------------

    // OBTENER TODOS LOS PEDIDOS (Para el historial)
    // (Este método se queda igual por ahora)
    public List<Pedido> obtenerTodosLosPedidos() {
        return pedidoRepository.findAll();
    }

    // CREAR UN NUEVO PEDIDO (ACTUALIZADO)
    @Transactional
    public Pedido crearPedido(CrearPedidoRequest request) {

        // 1. Buscar al Usuario (Cajero/Mesero)
        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. Buscar Cliente (si se proporcionó ID)
        Cliente cliente = null;
        if (request.getClienteId() != null) {
            cliente = clienteRepository.findById(request.getClienteId()).orElse(null);
        }

        // 3. Buscar Empresa (si se proporcionó RUC)
        Empresa empresa = null;
        if (request.getRucEmpresa() != null && !request.getRucEmpresa().isEmpty()) {
            empresa = empresaRepository.findByRuc(request.getRucEmpresa()).orElse(null);
        }

        // 4. Crear el Pedido principal
        Pedido nuevoPedido = new Pedido();
        nuevoPedido.setUsuario(usuario);
        nuevoPedido.setFechaHora(LocalDateTime.now());
        nuevoPedido.setEstado(EstadoPedido.PENDIENTE);
        
        // --- GUARDAR LOS NUEVOS CAMPOS ---
        nuevoPedido.setCliente(cliente);
        nuevoPedido.setEmpresa(empresa);
        nuevoPedido.setTipoServicio(request.getTipoServicio());
        nuevoPedido.setInfoServicio(request.getInfoServicio());
        // ---------------------------------
        
        double totalPedido = 0.0;
        List<PedidoPlato> detallePlatos = new ArrayList<>();

        // 5. Procesar platos SOLO SI la lista no está vacía
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
        // Si la lista está vacía, el total simplemente se queda en 0.0

        // 6. Guardar total y detalles
        nuevoPedido.setTotal(totalPedido);
        nuevoPedido.setDetallePlatos(detallePlatos);

        // 7. Guardar todo en la BD
        return pedidoRepository.save(nuevoPedido);
    }
    
    // (Aquí iría la lógica de filtros que hicimos antes)
}