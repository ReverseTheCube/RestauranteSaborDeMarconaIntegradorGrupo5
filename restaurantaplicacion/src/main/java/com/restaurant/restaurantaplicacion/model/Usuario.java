package com.restaurant.restaurantaplicacion.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String usuario; // El nombre de usuario para el login

    @Column(nullable = false)
    private String contrasena; // La contraseña CIFRADA

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rol rol;

    // Campos para la lógica de bloqueo 
    private int intentosFallidos = 0;
    private boolean cuentaBloqueada = false;
    private LocalDateTime tiempoBloqueo;
}