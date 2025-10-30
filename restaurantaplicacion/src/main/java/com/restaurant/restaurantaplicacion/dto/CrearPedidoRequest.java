package com.restaurant.restaurantaplicacion.dto;

import lombok.Data;
import java.util.List;

@Data
public class CrearPedidoRequest {
    private Long usuarioId; // ID del Cajero o Mesero
    private List<PedidoPlatoRequest> detallePlatos; // La lista de platos (puede estar vacía)

    // --- CAMPOS NUEVOS AÑADIDOS ---
    private String tipoServicio; // "LOCAL" o "DELIVERY"
    private String infoServicio; // N° de Mesa o Cód. Delivery
    
    private Long clienteId; // ID del cliente (opcional)
    private String rucEmpresa; // RUC de la empresa (opcional)
}