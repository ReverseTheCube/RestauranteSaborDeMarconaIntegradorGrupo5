package com.restaurant.restaurantaplicacion.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "asignaciones_pension")
public class AsignacionPension {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con la Empresa (por RUC)
    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    // Relación con el Cliente (el pensionista)
    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    // Saldo asignado
    @Column(nullable = false)
    private Double saldo;
}