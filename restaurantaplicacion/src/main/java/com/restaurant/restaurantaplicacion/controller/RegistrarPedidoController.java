package com.restaurant.restaurantaplicacion.controller;

import com.restaurant.restaurantaplicacion.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Simulación de un DTO de respuesta (debes crear este archivo en la carpeta dto/)
class PedidoInicioResponseDTO {
    private Long id;
    private String tipoServicio;
    private String estado;

    public PedidoInicioResponseDTO(Long id, String tipoServicio, String estado) {
        this.id = id;
        this.tipoServicio = tipoServicio;
        this.estado = estado;
    }

    // Getters y Setters para que Spring pueda serializar a JSON
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTipoServicio() { return tipoServicio; }
    public void setTipoServicio(String tipoServicio) { this.tipoServicio = tipoServicio; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}

@RestController
@RequestMapping("/api/pedidos")
public class RegistrarPedidoController { // CLASE RENOMBRADA

    // Se asume que PedidoService ya está implementado en tu proyecto.
    @Autowired
    private PedidoService pedidoService;

    /**
     * Endpoint para iniciar el registro de un nuevo pedido, usado por el botón "Delivery".
     * Recibe la petición POST del Front-end (registro-pedido.js).
     * @param tipoServicio El tipo de servicio seleccionado ("DELIVERY").
     * @return PedidoInicioResponseDTO con los datos del pedido creado.
     */
    @PostMapping("/registrar-inicio")
    public ResponseEntity<?> iniciarRegistroPedido(@RequestParam String tipoServicio) {
        try {
            // NOTA: Una vez que tengas el service real, borra la línea de simulación
            // y descomenta la línea de abajo.

            // Pedido nuevoPedido = pedidoService.crearPedido(tipoServicio); 

            // SIMULACIÓN DE CREACIÓN Y CONVERSIÓN A DTO
            Long nuevoPedidoId = 123L; 
            String estadoInicial = "PENDIENTE"; 

            // Creamos y devolvemos el DTO
            PedidoInicioResponseDTO responseDTO = new PedidoInicioResponseDTO(
                nuevoPedidoId, 
                tipoServicio, 
                estadoInicial
            );

            // Devuelve el DTO al Front-end como un JSON (ResponseEntity.ok se encarga de la conversión).
            return ResponseEntity.ok(responseDTO); 
        } catch (Exception e) {
            // Manejo de errores
            System.err.println("Error al iniciar el registro del pedido: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Error al iniciar el registro del pedido.");
        }
    }
}