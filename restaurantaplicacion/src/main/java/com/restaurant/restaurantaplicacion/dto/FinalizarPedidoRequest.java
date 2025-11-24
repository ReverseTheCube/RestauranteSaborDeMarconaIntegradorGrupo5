package com.restaurant.restaurantaplicacion.dto;

import lombok.Data;
import java.util.List;

@Data
public class FinalizarPedidoRequest {
    private Long pedidoId;
    private List<PedidoPlatoRequest> detallePlatos;
    
    // Datos del cliente y empresa
    private String tipoDocumento;
    private String numeroDocumento;
    private String rucEmpresa;
    
    // Campos opcionales (por si los necesitas en el futuro)
    private String nombreCliente;
    private String razonSocial;
}