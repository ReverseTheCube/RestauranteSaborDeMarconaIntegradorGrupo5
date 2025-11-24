package com.restaurant.restaurantaplicacion.service;

import com.restaurant.restaurantaplicacion.dto.CrearPedidoRequest;
import com.restaurant.restaurantaplicacion.dto.PedidoPlatoRequest;
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

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;
    @Autowired
    private PlatoRepository platoRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;

    // --- Repositorios añadidos por la fusión de Git ---
    @Autowired
    private ClienteRepository clienteRepository;
    @Autowired
    private EmpresaRepository empresaRepository;
    // ------------------------------------

    /**
     * Lógica para el Historial de Pedidos
     */
    public List<Pedido> obtenerTodosLosPedidos() {
        return pedidoRepository.findAll();
    }

    /**
     * Lógica para el INICIO del Pedido (Delivery o Local).
     * (Este método venía del archivo RegistrarPedidoController)
     */
    @Transactional
    public Pedido iniciarPedido(String tipoServicio, Integer numeroMesa) {
        
        // --- INICIO DE LA CORRECCIÓN (Simulación de Usuario) ---
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

        // 3. Asignar estado y tipo/info
        nuevoPedido.setEstado(EstadoPedido.PENDIENTE); // Usamos el valor que sí existe en el Enum

        if ("LOCAL".equals(tipoServicio) && numeroMesa != null) {
            nuevoPedido.setTipoServicio("LOCAL");
            nuevoPedido.setInfoServicio(String.valueOf(numeroMesa)); // Guardamos el N° de Mesa
        } else {
            nuevoPedido.setTipoServicio("DELIVERY");
            // (infoServicio puede quedar nulo o guardar alguna referencia si la tuvieras)
        }
        // --- FIN DE CORRECCIÓN DE ESTADO ---

        // 4. Guardar el pedido inicial (aún sin platos)
        return pedidoRepository.save(nuevoPedido);
    }


    /**
     * Lógica para CREAR/FINALIZAR el Pedido Completo (con platos).
     * NOTA: Se renombró de "crearPedidoCompleto" a "crearPedido"
     * para que coincida con lo que tu PedidoController espera.
     */
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
}