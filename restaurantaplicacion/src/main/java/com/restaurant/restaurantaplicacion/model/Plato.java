package com.restaurant.restaurantaplicacion.model;
import jakarta.persistence.*;
import lombok.Data;

@Data // Lombok para getters y setters automáticos
@Entity // Le dice a Spring que esto es una tabla de BD
@Table(name = "platos") // Nombre de la tabla
public class Plato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(length = 1000) // Damos más espacio para la descripción
    private String descripcion;

    @Column(nullable = false)
    private double precio;

    @Enumerated(EnumType.STRING) // Guarda el texto "PRINCIPAL" en la BD
    @Column(nullable = false)
    private TipoPlato tipo;

    // Esto es para la lógica de "Eliminar" (Inactivar)
    // Un plato nuevo siempre está activo
    private boolean activo = true;
}