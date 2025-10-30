package com.restaurant.restaurantaplicacion.service;

import com.restaurant.restaurantaplicacion.dto.ClienteRequest;
import com.restaurant.restaurantaplicacion.model.Cliente;
import com.restaurant.restaurantaplicacion.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional; // Asegúrate de importar Optional

@Service
public class ClienteService {

 @Autowired
 private ClienteRepository clienteRepository;

// --- (Este es tu método existente para OBTENER TODOS) ---
public List<Cliente> obtenerTodosLosClientes() {
 return clienteRepository.findAll();
  }

 // --- (Este es tu método existente para REGISTRAR) ---
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

 // --- (ESTE ES EL MÉTODO QUE FALTABA para el ClienteController) ---
 /**
      * Busca un cliente por su DNI (usando el número de documento).
      * Es llamado por el ClienteController.
      *
      * @param dni El DNI del cliente a buscar.
      * @return Un Optional<Cliente>
      */
 public Optional<Cliente> buscarPorDni(String dni) {
 // Reutiliza el método que ya tenías en tu ClienteRepository
 return clienteRepository.findByNumeroDocumento(dni);
 }
}