package com.restaurant.restaurantaplicacion.dto;

import com.restaurant.restaurantaplicacion.model.Rol;
import lombok.Data;

// DTO para recibir los datos del formulario de "Crear Usuario"
@Data
public class CrearUsuarioRequest {
    private String usuario;
    private String contrasena;
    private Rol rol;
}