package com.restaurant.restaurantaplicacion.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "clientes")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tipoDocumento; // DNI, PASAPORTE

    @Column(unique = true, nullable = false)
    private String numeroDocumento;

    @Column(nullable = false)
    private String nombresApellidos;
}