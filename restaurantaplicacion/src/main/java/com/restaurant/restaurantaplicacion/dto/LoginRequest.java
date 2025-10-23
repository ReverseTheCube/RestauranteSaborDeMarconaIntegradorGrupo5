package com.restaurant.restaurantaplicacion.dto;

import lombok.Data;

// DTO para recibir los datos del formulario de Login
@Data
public class LoginRequest {
    private String usuario;
    private String contrasena;
}