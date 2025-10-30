package com.restaurant.restaurantaplicacion.dto;

import lombok.Data;
import java.util.List;

// Este DTO representa el formulario completo para crear un pedido
@Data
public class CrearPedidoRequest {
    
    // Campos originales
    private Long usuarioId; // ID del Cajero o Mesero
    private List<PedidoPlatoRequest> detallePlatos; // La lista de platos y cantidades

    // --- CAMPOS NUEVOS (Añadidos por la fusión de Git) ---
    private Long clienteId; // ID del cliente (si se seleccionó)
    private String rucEmpresa; // RUC de la empresa (si se seleccionó)
    private String tipoServicio; // "LOCAL" o "DELIVERY"
    private String infoServicio; // N° Mesa o Cód. Delivery
}