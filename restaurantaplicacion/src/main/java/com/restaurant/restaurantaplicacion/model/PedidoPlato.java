package com.restaurant.restaurantaplicacion.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "pedido_platos") // Tabla de detalle
public class PedidoPlato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación: Muchos detalles pertenecen a UN pedido
    @ManyToOne
    @JoinColumn(name = "pedido_id", nullable = false)
    @JsonIgnore // Evita bucles infinitos al mostrar el JSON
    private Pedido pedido;

    // Relación: Muchos detalles pueden ser del MISMO plato
    @ManyToOne
    @JoinColumn(name = "plato_id", nullable = false)
    private Plato plato;

    @Column(nullable = false)
    private int cantidad;

    @Column(nullable = false)
    private Double precioUnitario; // Guardamos el precio al momento de la venta
}