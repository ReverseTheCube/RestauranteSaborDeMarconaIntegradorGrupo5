package com.restaurant.restaurantaplicacion.controller;

import com.restaurant.restaurantaplicacion.dto.ClienteRequest;
import com.restaurant.restaurantaplicacion.model.Cliente;
import com.restaurant.restaurantaplicacion.model.AsignacionPension; 
import com.restaurant.restaurantaplicacion.repository.AsignacionPensionRepository;
import com.restaurant.restaurantaplicacion.repository.ClienteRepository;
import com.restaurant.restaurantaplicacion.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;     
import java.util.HashMap; 

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    // Inyectamos el repositorio de pensiones para verificar saldo y empresa
    @Autowired
    private AsignacionPensionRepository asignacionRepo;

    @Autowired
    private ClienteRepository clienteRepository;

    // --- REGISTRAR CLIENTE ---
    @PostMapping
    public ResponseEntity<?> registrarCliente(@RequestBody ClienteRequest request) {
        try {
            Cliente nuevoCliente = clienteService.registrarCliente(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCliente);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    // ClienteController.java
        @PostMapping ("/simple")
        public ResponseEntity<Cliente> crearCliente(@RequestBody Cliente cliente) {
            Cliente nuevo = clienteRepository.save(cliente);
            return ResponseEntity.ok(nuevo);
        }

    // --- OBTENER TODOS LOS CLIENTES (Con filtro opcional) ---
    @GetMapping
    public ResponseEntity<List<Cliente>> obtenerClientes(@RequestParam(required = false) String filtro) {
        List<Cliente> clientes = clienteService.buscarClientesPorFiltro(filtro);
        return ResponseEntity.ok(clientes);
    }

    // --- BUSCAR POR DNI (Lógica Inteligente: Cliente + Pensión) ---
    @GetMapping("/buscar-dni/{dni}")
    public ResponseEntity<Map<String, Object>> buscarClientePorDni(@PathVariable String dni) {
        
        // 1. Buscamos si el cliente existe
        Optional<Cliente> clienteOpt = clienteService.buscarPorDni(dni);
        
        if (clienteOpt.isPresent()) {
            Cliente cliente = clienteOpt.get();
            Map<String, Object> respuesta = new HashMap<>();
            
            // 2. Llenamos los datos básicos del cliente
            respuesta.put("id", cliente.getId());
            respuesta.put("nombresApellidos", cliente.getNombresApellidos());
            respuesta.put("numeroDocumento", cliente.getNumeroDocumento());
            respuesta.put("esPensionado", false); // Asumimos que no, por defecto

            // 3. Consultamos si tiene asignación de pensión activa
            // (Esto busca en la tabla asignaciones_pension usando el DNI)
            Optional<AsignacionPension> asignacionOpt = asignacionRepo.findByClienteNumeroDocumento(dni);

            if (asignacionOpt.isPresent()) {
                AsignacionPension asignacion = asignacionOpt.get();
                
                // 4. Si es pensionado, agregamos los datos extra
                respuesta.put("esPensionado", true);
                respuesta.put("rucEmpresa", asignacion.getEmpresa().getRuc());
                respuesta.put("razonSocial", asignacion.getEmpresa().getRazonSocial());
                respuesta.put("saldoActual", asignacion.getSaldo());
            }

            return ResponseEntity.ok(respuesta); 
        } else {
            return ResponseEntity.notFound().build(); 
        }
    }
    
}