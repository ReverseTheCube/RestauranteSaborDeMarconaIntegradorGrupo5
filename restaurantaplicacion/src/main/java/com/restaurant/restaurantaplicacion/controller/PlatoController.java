package com.restaurant.restaurantaplicacion.controller;
import com.restaurant.restaurantaplicacion.dto.PlatoRequest;
import com.restaurant.restaurantaplicacion.model.Plato;
import com.restaurant.restaurantaplicacion.service.PlatoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/platos")
@CrossOrigin(origins = "*")
public class PlatoController {
   @Autowired
    private PlatoService platoService;

    // CREAR - POST http://localhost:8080/api/platos
    @PostMapping
    public ResponseEntity<Plato> crearPlato(@RequestBody PlatoRequest request) {
        Plato nuevoPlato = platoService.crearPlato(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPlato);
    }

    // LEER (TODOS) - GET http://localhost:8080/api/platos
    @GetMapping
    public ResponseEntity<List<Plato>> obtenerPlatos() {
        return ResponseEntity.ok(platoService.obtenerTodosLosPlatos());
    }

    // LEER (UNO) - GET http://localhost:8080/api/platos/1
    @GetMapping("/{id}")
    public ResponseEntity<Plato> obtenerPlatoPorId(@PathVariable Long id) {
        return platoService.obtenerPlatoPorId(id)
                .map(ResponseEntity::ok) // Si lo encuentra, 200 OK
                .orElse(ResponseEntity.notFound().build()); // Si no, 404
    }

    // ACTUALIZAR - PUT http://localhost:8080/api/platos/1
    @PutMapping("/{id}")
    public ResponseEntity<Plato> actualizarPlato(@PathVariable Long id, @RequestBody PlatoRequest request) {
        try {
            Plato platoActualizado = platoService.actualizarPlato(id, request);
            return ResponseEntity.ok(platoActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ELIMINAR (Inactivar) - DELETE http://localhost:8080/api/platos/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPlato(@PathVariable Long id) {
        try {
            platoService.eliminarPlato(id);
            return ResponseEntity.noContent().build(); // 204 No Content (Éxito)
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    } 
}
