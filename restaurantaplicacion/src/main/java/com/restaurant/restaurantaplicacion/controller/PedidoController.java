package com.restaurant.restaurantaplicacion.controller;

import com.restaurant.restaurantaplicacion.dto.CrearPedidoRequest;
// (Se quita la importación del DTO duplicado)
import com.restaurant.restaurantaplicacion.model.Pedido;
import com.restaurant.restaurantaplicacion.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.restaurant.restaurantaplicacion.dto.FinalizarPedidoRequest;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos") // URL base para los pedidos
@CrossOrigin(origins = "*") // Permite llamadas desde el frontend
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    /**
     * Endpoint para CREAR un nuevo Pedido con platos.
     * POST http://localhost:8080/api/pedidos
     */
    @PostMapping
    public ResponseEntity<Pedido> crearPedido(@RequestBody CrearPedidoRequest request) {
        try {
            // Esto ya funciona porque "crearPedido" existe en el Service corregido
            Pedido nuevoPedido = pedidoService.crearPedido(request); 
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPedido);
        } catch (RuntimeException e) {
            // Esto pasará si el usuarioId o un platoId no se encuentra
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    /**
     * Endpoint para OBTENER TODOS los Pedidos (Historial).
     * GET http://localhost:8080/api/pedidos
     */
    @GetMapping
    public ResponseEntity<List<Pedido>> obtenerTodosLosPedidos() {
        List<Pedido> pedidos = pedidoService.obtenerTodosLosPedidos();
        return ResponseEntity.ok(pedidos);
    }
// En src/main/java/com/restaurant/restaurantaplicacion/controller/PedidoController.java

// ... imports existentes ...

@GetMapping("/mesas-ocupadas")
public ResponseEntity<List<java.util.Map<String, Object>>> obtenerMesasOcupadas() {
    return ResponseEntity.ok(pedidoService.obtenerMesasOcupadas());
}

@PutMapping("/finalizar")
    public ResponseEntity<Pedido> finalizarPedido(@RequestBody FinalizarPedidoRequest request) {
        try {
            // Llamamos al método que acabamos de arreglar en el Service
            Pedido pedidoActualizado = pedidoService.finalizarPedido(request.getPedidoId(), request);
            return ResponseEntity.ok(pedidoActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}