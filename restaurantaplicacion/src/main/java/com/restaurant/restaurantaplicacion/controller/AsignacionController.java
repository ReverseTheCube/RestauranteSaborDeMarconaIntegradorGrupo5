package com.restaurant.restaurantaplicacion.controller;

import com.restaurant.restaurantaplicacion.dto.AsignacionRequest;
import com.restaurant.restaurantaplicacion.model.AsignacionPension;
import com.restaurant.restaurantaplicacion.service.AsignacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/asignaciones")
@CrossOrigin(origins = "*") 
public class AsignacionController {

    @Autowired
    private AsignacionService asignacionService;

    /**
     * Endpoint para crear una nueva asignación de pensión (Empresa + Cliente + Saldo).
     * POST http://localhost:8080/api/asignaciones
     */
    @PostMapping
    public ResponseEntity<?> crearAsignacion(@RequestBody AsignacionRequest request) {
        try {
            AsignacionPension nuevaAsignacion = asignacionService.crearAsignacion(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaAsignacion);
        } catch (RuntimeException e) {
            // Maneja errores de validación, Cliente/Empresa no encontrado, etc.
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}