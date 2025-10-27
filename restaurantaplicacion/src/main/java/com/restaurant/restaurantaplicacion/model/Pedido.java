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

    // Relación: Muchos pedidos pueden ser tomados por UN usuario
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario; // El Cajero o Mesero que tomó el pedido

    // Relación: UN pedido puede tener MUCHOS platos (detalles)
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL)
    private List<PedidoPlato> detallePlatos;
}
