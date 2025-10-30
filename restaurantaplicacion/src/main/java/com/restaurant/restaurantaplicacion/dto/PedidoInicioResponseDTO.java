package com.restaurant.restaurantaplicacion.dto;

// Clase DTO para estructurar la respuesta del servidor al iniciar un pedido.
// Contiene solo los datos necesarios para el Front-end.
public class PedidoInicioResponseDTO {
    private Long id;
    private String tipoServicio;
    private String estado;

    // Constructor que usa el Controller
    public PedidoInicioResponseDTO(Long id, String tipoServicio, String estado) {
        this.id = id;
        this.tipoServicio = tipoServicio;
        this.estado = estado;
    }

    // Getters y Setters para que Spring pueda serializar (convertir) a JSON
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTipoServicio() { return tipoServicio; }
    public void setTipoServicio(String tipoServicio) { this.tipoServicio = tipoServicio; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}