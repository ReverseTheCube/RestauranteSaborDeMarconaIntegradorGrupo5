package com.restaurant.restaurantaplicacion.service;

import com.restaurant.restaurantaplicacion.dto.ClienteRequest;
import com.restaurant.restaurantaplicacion.model.Cliente;
import com.restaurant.restaurantaplicacion.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional; 

@Service
public class ClienteService {

 @Autowired
 private ClienteRepository clienteRepository;

// --- MÉTODO MODIFICADO/UNIFICADO PARA LISTAR Y BUSCAR ---
// Reemplaza al anterior obtenerTodosLosClientes()
public List<Cliente> buscarClientesPorFiltro(String filtro) {
     // Si el filtro es nulo o vacío, devuelve TODOS los clientes (comportamiento sin filtro)
     if (filtro == null || filtro.trim().isEmpty()) {
         return clienteRepository.findAll();
     }
     
     // Si hay filtro, busca por número de documento o nombre/apellido (parcial)
     String busqueda = filtro.trim();
     return clienteRepository.findByNumeroDocumentoContainingOrNombresApellidosContainingIgnoreCase(busqueda, busqueda);
  }

 // --- (Este es tu método existente para REGISTRAR, sin cambios) ---
public Cliente registrarCliente(ClienteRequest request) {
// Validación de existencia
 if (clienteRepository.findByNumeroDocumento(request.getNumeroDocumento()).isPresent()) {
 throw new RuntimeException("El número de documento ya está registrado.");
 }

 Cliente cliente = new Cliente();
 cliente.setTipoDocumento(request.getTipoDocumento());
 cliente.setNumeroDocumento(request.getNumeroDocumento());
 cliente.setNombresApellidos(request.getNombresApellidos());

 return clienteRepository.save(cliente);
 }

 // --- (Este es tu método existente para buscar por DNI, sin cambios) ---
 public Optional<Cliente> buscarPorDni(String dni) {
 return clienteRepository.findByNumeroDocumento(dni);
 }
}