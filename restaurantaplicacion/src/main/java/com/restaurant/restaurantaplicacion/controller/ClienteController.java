package com.restaurant.restaurantaplicacion.controller;

import com.restaurant.restaurantaplicacion.dto.ClienteRequest;
import com.restaurant.restaurantaplicacion.model.Cliente;
import com.restaurant.restaurantaplicacion.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*") // Permite llamadas desde el frontend
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    // CREAR - POST http://localhost:8080/api/clientes
    @PostMapping
    public ResponseEntity<?> registrarCliente(@RequestBody ClienteRequest request) {
        try {
            Cliente nuevoCliente = clienteService.registrarCliente(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCliente);
        } catch (RuntimeException e) {
            // Error de documento duplicado o validación
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // LEER (TODOS) - GET http://localhost:8080/api/clientes
    @GetMapping
    public ResponseEntity<List<Cliente>> obtenerClientes() {
        return ResponseEntity.ok(clienteService.obtenerTodosLosClientes());
    }
}