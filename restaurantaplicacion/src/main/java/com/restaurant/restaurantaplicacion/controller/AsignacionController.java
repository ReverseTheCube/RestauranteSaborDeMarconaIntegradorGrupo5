package com.restaurant.restaurantaplicacion.controller;

import com.restaurant.restaurantaplicacion.dto.AsignacionRequest;
import com.restaurant.restaurantaplicacion.dto.AjusteSaldoRequest; // NUEVO
import com.restaurant.restaurantaplicacion.model.AsignacionPension;
import com.restaurant.restaurantaplicacion.service.AsignacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/asignaciones")
@CrossOrigin(origins = "*") 
public class AsignacionController {

    @Autowired
    private AsignacionService asignacionService;

    // --- ENDPOINT POST (Crear Asignación) ---
    @PostMapping
    public ResponseEntity<?> crearAsignacion(@RequestBody AsignacionRequest request) {
        try {
            AsignacionPension nuevaAsignacion = asignacionService.crearAsignacion(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaAsignacion);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    // --- ENDPOINT GET (Buscar por RUC) ---
    @GetMapping("/buscar")
    public ResponseEntity<List<AsignacionPension>> buscarPorRuc(@RequestParam String ruc) {
        List<AsignacionPension> asignaciones = asignacionService.buscarAsignacionesPorRuc(ruc);
        return ResponseEntity.ok(asignaciones);
    }
    
    // --- NUEVO ENDPOINT: Ajustar Saldo (PUT) ---
    /**
     * PUT http://localhost:8080/api/asignaciones/{id}/saldo
     * Ajusta el saldo de una asignación específica.
     */
    @PutMapping("/{id}/saldo")
    public ResponseEntity<AsignacionPension> actualizarSaldo(@PathVariable Long id, @RequestBody AjusteSaldoRequest request) {
        try {
            AsignacionPension asignacionActualizada = asignacionService.ajustarSaldo(id, request);
            return ResponseEntity.ok(asignacionActualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
}