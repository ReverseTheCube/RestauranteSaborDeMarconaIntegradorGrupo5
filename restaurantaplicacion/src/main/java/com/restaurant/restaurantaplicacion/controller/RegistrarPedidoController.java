package com.restaurant.restaurantaplicacion.controller;

// --- IMPORTS AÑADIDOS ---
import com.restaurant.restaurantaplicacion.model.Pedido; // Importamos el modelo real
import com.restaurant.restaurantaplicacion.service.PedidoService;
import com.restaurant.restaurantaplicacion.dto.PedidoInicioResponseDTO; // Importamos el DTO real
// --- FIN IMPORTS ---

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/*
 * Ya no simulamos la clase DTO aquí.
 * Se importa desde el paquete /dto.
 */

@RestController
@RequestMapping("/api/pedidos")
public class RegistrarPedidoController { 

    @Autowired
    private PedidoService pedidoService; // Inyectamos el servicio real

    /**
     * Endpoint para iniciar el registro de un nuevo pedido (Delivery o Local).
     * Recibe la petición POST del Front-end (registro-pedido.js o mesa-selector.js).
     *
     * @param tipoServicio El tipo de servicio ("DELIVERY" o "LOCAL").
     * @param numeroMesa (Opcional) El número de mesa si el tipo es "LOCAL".
     * @return PedidoInicioResponseDTO con los datos del pedido creado.
     */
    @PostMapping("/registrar-inicio")
    public ResponseEntity<?> iniciarRegistroPedido(
            // --- CAMBIO CLAVE AÑADIDO ---
            @RequestParam String tipoServicio,
            @RequestParam(required = false) Integer numeroMesa,
            @RequestParam Long usuarioId //
    ) {
        try {
            
            // 1. LLAMADA AL SERVICIO REAL (YA NO ES SIMULACIÓN)
            // Llama al método que creamos en PedidoService.java
            Pedido nuevoPedido = pedidoService.iniciarPedido(tipoServicio, numeroMesa,usuarioId);

            // 2. CREAR EL DTO DE RESPUESTA
            // Usamos los datos del Pedido real que se guardó en la BD (con el ID real).
            PedidoInicioResponseDTO responseDTO = new PedidoInicioResponseDTO(
                    nuevoPedido.getId(), // <-- ESTE ES EL ID REAL (ej. 1, 2, 3...)
                    tipoServicio,
                    nuevoPedido.getEstado().toString() // Convertimos el Enum a String
            );

            // 3. Devolver el DTO al Front-end (JavaScript)
            return ResponseEntity.ok(responseDTO);

        } catch (Exception e) {
            // Manejo de errores
            System.err.println("Error al iniciar el registro del pedido: " + e.getMessage());
            // Devolvemos un error 500 (Internal Server Error) al front-end
            return ResponseEntity.internalServerError().body("Error al iniciar el registro del pedido: " + e.getMessage());
        }
    }
}