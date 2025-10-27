package com.restaurant.restaurantaplicacion.dto;

import lombok.Data;

// Recibe la configuración desde historial-ventaA.js
@Data
public class GenerarReporteRequest {
    private String periodo; // "diario", "quincenal", "mensual", "fechaReferencia"
    private String fecha; // Solo si periodo es "fechaReferencia"
    private boolean graficos;
    private boolean resumen;
    private boolean detallados;
    private String archivo; // "pdf" o "excel"
    // Podrías añadir más filtros si fueran necesarios
}