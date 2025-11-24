package com.restaurant.restaurantaplicacion.dto;

import lombok.Data;
import java.util.List;

@Data
public class FinalizarPedidoRequest {
    private Long pedidoId;
    private List<PedidoPlatoRequest> detallePlatos;
    private String tipoDocumento;
    private String numeroDocumento;
    private String rucEmpresa;
    private String nombreCliente; // Opcional
}