package com.restaurant.restaurantaplicacion.dto;

import java.util.List;

public class FinalizarPedidoRequest {
    private Long pedidoId;
    private List<PedidoPlatoRequest> detallePlatos;
    private String tipoDocumento;
    private String numeroDocumento;
    private String rucEmpresa;
    private String rolUsuario; 

    // Getters y Setters OBLIGATORIOS
    public String getRolUsuario() { return rolUsuario; }
    public void setRolUsuario(String rolUsuario) { this.rolUsuario = rolUsuario; }
    
    // ... resto de getters y setters de los otros campos ...
    public Long getPedidoId() { return pedidoId; }
    public void setPedidoId(Long pedidoId) { this.pedidoId = pedidoId; }
    public List<PedidoPlatoRequest> getDetallePlatos() { return detallePlatos; }
    public void setDetallePlatos(List<PedidoPlatoRequest> detallePlatos) { this.detallePlatos = detallePlatos; }
    public String getTipoDocumento() { return tipoDocumento; }
    public void setTipoDocumento(String tipoDocumento) { this.tipoDocumento = tipoDocumento; }
    public String getNumeroDocumento() { return numeroDocumento; }
    public void setNumeroDocumento(String numeroDocumento) { this.numeroDocumento = numeroDocumento; }
    public String getRucEmpresa() { return rucEmpresa; }
    public void setRucEmpresa(String rucEmpresa) { this.rucEmpresa = rucEmpresa; }
}