package com.restaurant.restaurantaplicacion.dto;

import lombok.Data;

@Data
public class AsignacionRequest {
    private String rucEmpresa; // RUC del combobox
    private Long clienteId;    // ID del cliente/pensionista del combobox
    private Double saldo;      // Saldo del input
}