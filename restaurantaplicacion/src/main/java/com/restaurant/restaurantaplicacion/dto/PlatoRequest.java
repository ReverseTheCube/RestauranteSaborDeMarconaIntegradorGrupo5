package com.restaurant.restaurantaplicacion.dto;
import com.restaurant.restaurantaplicacion.model.TipoPlato;
import lombok.Data;
@Data
public class PlatoRequest {
    private String nombre;
    private String descripcion;
    private double precio;
    private TipoPlato tipo;
}
