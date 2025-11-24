package com.restaurant.restaurantaplicacion.dto;

import lombok.Data;

@Data
public class GenerarReporteRequest {
    private String periodo; // "diario", "quincenal", "mensual", "fechaReferencia"
    private String fecha;   // "yyyy-MM-dd" (Solo si usa fechaReferencia)
    
    // Opciones de configuración (Checkboxes)
    private boolean graficos;
    private boolean resumen;
    private boolean detallados;
    
    private String archivo; // "pdf" o "excel"
}