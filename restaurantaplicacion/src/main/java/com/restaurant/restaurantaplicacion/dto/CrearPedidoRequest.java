    package com.restaurant.restaurantaplicacion.dto;

    import lombok.Data;
    import java.util.List;

// Este DTO representa el formulario completo para crear un pedido:
// ej. { "usuarioId": 3, "detallePlatos": [ { "platoId": 1, "cantidad": 2 }, { "platoId": 5, "cantidad": 1 } ] }
@Data
public class CrearPedidoRequest {
    private Long usuarioId; // ID del Cajero o Mesero
    private List<PedidoPlatoRequest> detallePlatos; // La lista de platos y cantidades
}