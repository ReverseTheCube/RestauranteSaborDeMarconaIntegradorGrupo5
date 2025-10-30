package com.restaurant.restaurantaplicacion.service;

import com.restaurant.restaurantaplicacion.dto.CrearPedidoRequest;
import com.restaurant.restaurantaplicacion.dto.PedidoPlatoRequest;
import com.restaurant.restaurantaplicacion.model.*;
import com.restaurant.restaurantaplicacion.repository.PedidoRepository;
import com.restaurant.restaurantaplicacion.repository.PlatoRepository;
import com.restaurant.restaurantaplicacion.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
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

    /**
     * Lógica para el Historial de Pedidos
     */
    public List<Pedido> obtenerTodosLosPedidos() {
        return pedidoRepository.findAll();
    }

    /**
     * Lógica para el INICIO del Pedido (Delivery o Local).
     * Este es el método que llama RegistrarPedidoController.
     */
    @Transactional
    public Pedido iniciarPedido(String tipoServicio, Integer numeroMesa) {
        
        // --- INICIO DE LA CORRECCIÓN (Simulación de Usuario) ---
        // El código original fallaba aquí porque buscaba "anonymousUser"
        // String username = SecurityContextHolder.getContext().getAuthentication().getName();
        // Usuario usuario = usuarioRepository.findByUsuario(username)
        //         .orElseThrow(() -> new UsernameNotFoundException("Usuario (Empleado) no encontrado: " + username));

        // SIMULACIÓN TEMPORAL:
        // Asumimos que el empleado "Jorgito" (ID 1) está logueado.
        // CAMBIA 1L por un ID de usuario que SÍ exista en tu BD.
        Long usuarioIdSimulado = 1L; // <--- CAMBIO REALIZADO (de 3L a 1L)
        Usuario usuario = usuarioRepository.findById(usuarioIdSimulado)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario (Empleado) SIMULADO con ID: " + usuarioIdSimulado + " no encontrado."));
        // --- FIN DE LA CORRECCIÓN ---


        // 2. Crear el objeto Pedido principal (vacío)
        Pedido nuevoPedido = new Pedido();
        nuevoPedido.setUsuario(usuario);
        nuevoPedido.setFechaHora(LocalDateTime.now());
        nuevoPedido.setTotal(0.0); // El total se calcula al final

        // 3. Asignar estado y mesa
        // --- CORRECCIÓN DE ESTADO ---
        // Usamos "PENDIENTE" que es el valor que sí existe en el Enum
        nuevoPedido.setEstado(EstadoPedido.PENDIENTE);

        if ("LOCAL".equals(tipoServicio) && numeroMesa != null) {
            // (Opcional: si tu Modelo Pedido tiene un campo para el N° de mesa)
            // nuevoPedido.setNumeroMesa(numeroMesa); 
        } else {
            // (Opcional: si tu Modelo Pedido tiene un campo para "tipo")
            // nuevoPedido.setTipo("DELIVERY");
        }
        // --- FIN DE CORRECCIÓN DE ESTADO ---

        // 4. Guardar el pedido inicial (aún sin platos)
        return pedidoRepository.save(nuevoPedido);
    }


    /**
     * Lógica para CREAR/FINALIZAR el Pedido Completo (con platos).
     * Este método se llamará desde la pantalla de Resumen.
     */
    @Transactional
    public Pedido crearPedidoCompleto(CrearPedidoRequest request) {

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
        return pedidoRepository.save(nuevoPedido);
    }
    
    // (Aquí irían los otros métodos que tenías, como el de actualizar, etc.)
}
