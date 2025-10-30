package com.restaurant.restaurantaplicacion.controller;

import com.restaurant.restaurantaplicacion.dto.ClienteRequest; // Importado de tu código
import com.restaurant.restaurantaplicacion.model.Cliente;
import com.restaurant.restaurantaplicacion.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus; // Importado de tu código
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List; // Importado de tu código
import java.util.Optional; // Asegúrate de importar Optional

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*") // Mantenemos tu CrossOrigin
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    // --- (Este es tu método existente para CREAR) ---
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

    // --- (Este es tu método existente para OBTENER TODOS) ---
    @GetMapping
    public ResponseEntity<List<Cliente>> obtenerClientes() {
        return ResponseEntity.ok(clienteService.obtenerTodosLosClientes());
    }


    // --- (ESTE ES EL MÉTODO QUE FALTABA para el resumen_pedido.js) ---
    /**
     * Endpoint para buscar un cliente por su DNI.
     * Es llamado por el JavaScript (resumen-pedido.js) al salir del campo DNI.
     *
     * @param dni El DNI del cliente a buscar.
     * @return El Cliente encontrado o un 404 Not Found.
     */
    @GetMapping("/buscar-dni/{dni}")
    public ResponseEntity<Cliente> buscarClientePorDni(@PathVariable String dni) {
        
        Optional<Cliente> clienteOpt = clienteService.buscarPorDni(dni);
        
        if (clienteOpt.isPresent()) {
            return ResponseEntity.ok(clienteOpt.get()); // 200 OK con el cliente
        } else {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }

    // Nota: Se deja como anotación únicamente — no implementar por ahora.
    // TODO: Implementar el endpoint para buscar por RUC en el futuro.
    // Ejemplo de plantilla:
    // @GetMapping("/buscar-ruc/{ruc}")
    // public ResponseEntity<?> buscarEmpresaPorRuc(@PathVariable String ruc) {
    //     // Lógica para buscar empresa por RUC (por ejemplo, clienteService.buscarPorRuc(ruc))
    //     // return ResponseEntity.ok(empresa);
    //     // o return ResponseEntity.notFound().build();
    // }
}
