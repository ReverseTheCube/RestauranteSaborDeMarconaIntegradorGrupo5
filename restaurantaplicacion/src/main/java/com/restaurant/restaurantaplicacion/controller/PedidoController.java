package com.restaurant.restaurantaplicacion.controller;

import com.restaurant.restaurantaplicacion.dto.CrearPedidoRequest;
import com.restaurant.restaurantaplicacion.dto.PedidoInicioResponseDTO; // <-- IMPORTACIÓN AÑADIDA
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
     * Endpoint para CREAR un nuevo Pedido con platos.
     * POST http://localhost:8080/api/pedidos
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
     * GET http://localhost:8080/api/pedidos
     */
    @GetMapping
    public ResponseEntity<List<Pedido>> obtenerTodosLosPedidos() {
        List<Pedido> pedidos = pedidoService.obtenerTodosLosPedidos();
        return ResponseEntity.ok(pedidos);
    }

    // --- MÉTODO AÑADIDO (MOVIDO DESDE RegistrarPedidoController) ---

    /**
     * Endpoint para iniciar el registro de un nuevo pedido (Paso 1: Delivery o Mesa).
     * Recibe la petición POST del Front-end (registro-pedido.js, mesa-selector.js).
     */
    @PostMapping("/registrar-inicio")
    public ResponseEntity<?> iniciarRegistroPedido(@RequestParam String tipoServicio,
                                                   // "numeroMesa" es opcional, solo viene de mesa-selector.js
                                                   @RequestParam(required = false) String numeroMesa) {
        try {
            // NOTA: El código de tu compañero es una SIMULACIÓN.
            // No llama a pedidoService.crearPedido() porque ese método espera
            // una lista de platos, y en este paso aún no los tenemos.
            // ¡Esto es algo que tendrás que arreglar con tus compañeros!
            // Por ahora, mantenemos la simulación para que el frontend funcione.

            // Pedido nuevoPedido = pedidoService.crearPedido(tipoServicio, numeroMesa); // <-- Lógica real futura

            // SIMULACIÓN DE CREACIÓN Y CONVERSIÓN A DTO
            Long nuevoPedidoId = 123L; // ID Falso
            String estadoInicial = "PENDIENTE";
            String servicioInfo = tipoServicio;
            if ("LOCAL".equals(tipoServicio) && numeroMesa != null) {
                servicioInfo = "LOCAL - Mesa " + numeroMesa;
            }

            // Creamos y devolvemos el DTO
            PedidoInicioResponseDTO responseDTO = new PedidoInicioResponseDTO(
                nuevoPedidoId,
                servicioInfo, // Usamos la descripción completa
                estadoInicial
            );

            // Devuelve el DTO al Front-end como un JSON
            return ResponseEntity.ok(responseDTO);

        } catch (Exception e) {
            // Manejo de errores
            System.err.println("Error al iniciar el registro del pedido: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Error al iniciar el registro del pedido.");
        }
    }
}