package com.restaurant.restaurantaplicacion.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime fechaHora;

    @Column(nullable = false)
    private Double total;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoPedido estado;

    // --- CAMPOS NUEVOS AÑADIDOS ---

    // Tipo de servicio: "LOCAL" o "DELIVERY"
    @Column(nullable = false)
    private String tipoServicio;

    // Guarda el N° de Mesa (si es LOCAL) o el Cód. Pedido (si es DELIVERY)
    @Column(nullable = true) // Puede ser nulo (ej. un delivery sin código)
    private String infoServicio;

    // Relación: Muchos pedidos pueden ser de UN Cliente
    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = true) // Puede ser nulo
    private Cliente cliente;

    // Relación: Muchos pedidos pueden ser de UNA Empresa
    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = true) // Puede ser nulo
    private Empresa empresa;

    // --- FIN CAMPOS NUEVOS ---

    // Relación: Muchos pedidos pueden ser tomados por UN usuario (empleado)
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario; // El Cajero o Mesero que tomó el pedido

    // Relación: UN pedido puede tener MUCHOS platos (detalles)
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL)
    private List<PedidoPlato> detallePlatos;
}