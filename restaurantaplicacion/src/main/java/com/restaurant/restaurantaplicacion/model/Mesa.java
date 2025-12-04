package com.restaurant.restaurantaplicacion.model;

import jakarta.persistence.*;

@Entity
@Table(name = "mesas")
public class Mesa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numeroMesa; 

    @Enumerated(EnumType.STRING)
    private EstadoMesa estado;

    public Mesa() {}

    public Mesa(String numeroMesa, EstadoMesa estado) {
        this.numeroMesa = numeroMesa;
        this.estado = estado;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNumeroMesa() { return numeroMesa; }
    public void setNumeroMesa(String numeroMesa) { this.numeroMesa = numeroMesa; }
    public EstadoMesa getEstado() { return estado; }
    public void setEstado(EstadoMesa estado) { this.estado = estado; }
}