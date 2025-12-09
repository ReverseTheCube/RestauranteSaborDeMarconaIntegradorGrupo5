package com.restaurant.restaurantaplicacion.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "incidencias")
public class Incidencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String descripcion; // El detalle del problema

    @Column(nullable = false)
    private String prioridad; // ALTA, MEDIA, BAJA

    @Column(nullable = false)
    private String estado; // PENDIENTE, RESUELTO

    private LocalDateTime fechaReporte;
    
    private String usuarioReporta; // Guardamos el nombre del usuario que reportó
}