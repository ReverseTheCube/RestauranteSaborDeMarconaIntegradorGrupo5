package com.restaurant.restaurantaplicacion.service;

import com.restaurant.restaurantaplicacion.dto.ClienteRequest;
import com.restaurant.restaurantaplicacion.model.Cliente;
import com.restaurant.restaurantaplicacion.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    // OBTENER TODOS LOS CLIENTES
    public List<Cliente> obtenerTodosLosClientes() {
        return clienteRepository.findAll();
    }

    // REGISTRAR CLIENTE
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
}