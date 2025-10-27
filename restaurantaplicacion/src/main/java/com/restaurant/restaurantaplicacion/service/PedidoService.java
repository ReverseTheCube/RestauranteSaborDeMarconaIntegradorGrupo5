package com.restaurant.restaurantaplicacion.service;

import com.restaurant.restaurantaplicacion.dto.CrearPedidoRequest;
import com.restaurant.restaurantaplicacion.dto.PedidoPlatoRequest;
import com.restaurant.restaurantaplicacion.model.*;
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

    // Necesitamos todos estos repositorios para crear un pedido
    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private PlatoRepository platoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // No necesitamos PedidoPlatoRepository para crear, 
    // se guarda automáticamente con el "cascade = CascadeType.ALL" del Modelo Pedido.

    /**
     * Lógica para el Historial de Pedidos
     */

    // OBTENER TODOS LOS PEDIDOS (Para el historial)
    public List<Pedido> obtenerTodosLosPedidos() {
        // Esto traerá todos los pedidos con sus detalles
        return pedidoRepository.findAll();
    }

    // CREAR UN NUEVO PEDIDO
    // @Transactional asegura que si algo falla, no se guarda nada (todo o nada)
    @Transactional
    public Pedido crearPedido(CrearPedidoRequest request) {

        // 1. Buscar al Usuario (Cajero/Mesero) que crea el pedido
        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. Crear el objeto Pedido principal (la "boleta")
        Pedido nuevoPedido = new Pedido();
        nuevoPedido.setUsuario(usuario);
        nuevoPedido.setFechaHora(LocalDateTime.now());
        nuevoPedido.setEstado(EstadoPedido.PENDIENTE); // Todos los pedidos nacen PENDIENTES
        
        double totalPedido = 0.0;
        List<PedidoPlato> detallePlatos = new ArrayList<>();

        // 3. Recorrer cada línea del pedido (los platos y cantidades)
        for (PedidoPlatoRequest itemRequest : request.getDetallePlatos()) {
            
            // 4. Buscar el Plato en la BD para saber su precio
            Plato plato = platoRepository.findById(itemRequest.getPlatoId())
                    .orElseThrow(() -> new RuntimeException("Plato no encontrado: ID " + itemRequest.getPlatoId()));

            // 5. Crear el objeto de detalle (la línea de la boleta)
            PedidoPlato detalle = new PedidoPlato();
            detalle.setPlato(plato);
            detalle.setCantidad(itemRequest.getCantidad());
            detalle.setPrecioUnitario(plato.getPrecio()); // Guardamos el precio actual
            detalle.setPedido(nuevoPedido); // Lo asociamos al pedido principal

            // 6. Añadir al detalle y sumar al total
            detallePlatos.add(detalle);
            totalPedido += (plato.getPrecio() * itemRequest.getCantidad());
        }

        // 7. Guardar el total y la lista de detalles en el pedido principal
        nuevoPedido.setTotal(totalPedido);
        nuevoPedido.setDetallePlatos(detallePlatos);

        // 8. Guardar el pedido principal en la BD
        // Gracias a (cascade = CascadeType.ALL), esto también guarda
        // automáticamente todas las líneas de "detallePlatos".
        return pedidoRepository.save(nuevoPedido);
    }
    
    // Aquí se podrían agregar más métodos (actualizar estado a PAGADO, CANCELADO, etc.)
}