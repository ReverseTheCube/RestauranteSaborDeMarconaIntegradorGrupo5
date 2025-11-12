package com.restaurant.restaurantaplicacion.controller;

import com.restaurant.restaurantaplicacion.dto.ClienteRequest; 
import com.restaurant.restaurantaplicacion.model.Cliente;
import com.restaurant.restaurantaplicacion.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus; 
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List; 
import java.util.Optional; 

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*") 
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    // REGISTRAR CLIENTE (sin cambios)
    @PostMapping
    public ResponseEntity<?> registrarCliente(@RequestBody ClienteRequest request) {
        try {
            Cliente nuevoCliente = clienteService.registrarCliente(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCliente);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // OBTENER CLIENTES (MODIFICADO para recibir filtro)
    // Reemplaza al anterior obtenerClientes()
    @GetMapping
    public ResponseEntity<List<Cliente>> obtenerClientes(
        // Acepta un parámetro de consulta "filtro" opcional
        @RequestParam(required = false) String filtro) { 
        
        List<Cliente> clientes = clienteService.buscarClientesPorFiltro(filtro);
        return ResponseEntity.ok(clientes);
    }


    // BUSCAR POR DNI (sin cambios)
    @GetMapping("/buscar-dni/{dni}")
    public ResponseEntity<Cliente> buscarClientePorDni(@PathVariable String dni) {
        
        Optional<Cliente> clienteOpt = clienteService.buscarPorDni(dni);
        
        if (clienteOpt.isPresent()) {
            return ResponseEntity.ok(clienteOpt.get()); 
        } else {
            return ResponseEntity.notFound().build(); 
        }
    }
}