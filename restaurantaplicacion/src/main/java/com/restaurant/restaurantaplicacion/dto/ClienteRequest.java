package com.restaurant.restaurantaplicacion.dto;

import lombok.Data;

@Data
public class ClienteRequest {
    private String tipoDocumento;
    private String numeroDocumento;
    private String nombresApellidos;
}