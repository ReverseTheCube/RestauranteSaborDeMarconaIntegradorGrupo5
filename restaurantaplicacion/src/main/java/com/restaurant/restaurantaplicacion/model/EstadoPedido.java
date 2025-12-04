package com.restaurant.restaurantaplicacion.model;

public enum EstadoPedido {
    PENDIENTE,  // Mesero tomando la orden
    POR_PAGAR,  // Mesero finalizó, espera al Cajero (NUEVO)
    PAGADO,     // Cajero cobró
    ANULADO
}