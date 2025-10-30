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

<<<<<<< HEAD
    /**
     * Lógica para el Historial de Pedidos
     */
=======
    // --- AÑADIR ESTOS REPOSITORIOS ---
    @Autowired
    private ClienteRepository clienteRepository;
    @Autowired
    private EmpresaRepository empresaRepository;
    // ------------------------------------

    // OBTENER TODOS LOS PEDIDOS (Para el historial)
    // (Este método se queda igual por ahora)
>>>>>>> 6f0277f4f98acad18a1d9090a0667b34563672e5
    public List<Pedido> obtenerTodosLosPedidos() {
        return pedidoRepository.findAll();
    }

<<<<<<< HEAD
    /**
     * Lógica para el INICIO del Pedido (Delivery o Local).
     * Este es el método que llama RegistrarPedidoController.
     */
=======
    // CREAR UN NUEVO PEDIDO (ACTUALIZADO)
>>>>>>> 6f0277f4f98acad18a1d9090a0667b34563672e5
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

<<<<<<< HEAD
        // 8. Guardar el pedido principal en la BD
        return pedidoRepository.save(nuevoPedido);
    }
    
    // (Aquí irían los otros métodos que tenías, como el de actualizar, etc.)
}
=======
        // 7. Guardar todo en la BD
        return pedidoRepository.save(nuevoPedido);
    }
    
    // (Aquí iría la lógica de filtros que hicimos antes)
}
>>>>>>> 6f0277f4f98acad18a1d9090a0667b34563672e5
