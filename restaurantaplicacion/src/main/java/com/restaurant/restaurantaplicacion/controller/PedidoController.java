package com.restaurant.restaurantaplicacion.controller;

import com.restaurant.restaurantaplicacion.dto.CrearPedidoRequest;
import com.restaurant.restaurantaplicacion.model.Pedido;
import com.restaurant.restaurantaplicacion.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos") // URL base para los pedidos
@CrossOrigin(origins = "*") // Permite llamadas desde el frontend
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    /**
     * Endpoint para CREAR un nuevo Pedido.
     * El frontend debe hacer un POST a http://localhost:8080/api/pedidos
     */
    @PostMapping
    public ResponseEntity<Pedido> crearPedido(@RequestBody CrearPedidoRequest request) {
        try {
            Pedido nuevoPedido = pedidoService.crearPedido(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPedido);
        } catch (RuntimeException e) {
            // Esto pasará si el usuarioId o un platoId no se encuentra
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    /**
     * Endpoint para OBTENER TODOS los Pedidos (Historial).
     * El frontend debe hacer un GET a http://localhost:8080/api/pedidos
     */
    @GetMapping
    public ResponseEntity<List<Pedido>> obtenerTodosLosPedidos() {
        List<Pedido> pedidos = pedidoService.obtenerTodosLosPedidos();
        return ResponseEntity.ok(pedidos);
    }
}