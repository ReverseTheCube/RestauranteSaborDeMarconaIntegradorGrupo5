package com.restaurant.restaurantaplicacion.dto;

import com.restaurant.restaurantaplicacion.model.Rol;
import lombok.AllArgsConstructor;
import lombok.Data;

// DTO para enviar la respuesta después de un login exitoso
@Data
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String usuario;
    private Rol rol;
    private String mensaje;
}