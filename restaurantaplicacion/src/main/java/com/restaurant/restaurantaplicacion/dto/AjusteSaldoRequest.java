package com.restaurant.restaurantaplicacion.dto;

import lombok.Data;

@Data
public class AjusteSaldoRequest {
    private Double montoAjuste; // Valor positivo (suma) o negativo (resta)
}