package com.restaurant.restaurantaplicacion.dto;

import lombok.Data;

// Este DTO representa una línea en el pedido:
// ej. { "platoId": 1, "cantidad": 2 }
@Data
public class PedidoPlatoRequest {
    private Long platoId;
    private int cantidad;
}