package com.restaurant.restaurantaplicacion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// Envía la información del reporte a historial-ventaB.js
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteResponse {
    private Long id;
    private LocalDateTime fechaGeneracion;
    private Long numeroRegistros;
    private String nombreArchivo;
    private String tamanoArchivo;
    private String tipoArchivo;
    // No enviamos la ruta del archivo al frontend por seguridad
}