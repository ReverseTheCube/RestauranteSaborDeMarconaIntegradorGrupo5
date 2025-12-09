package com.restaurant.restaurantaplicacion.controller;

import com.restaurant.restaurantaplicacion.dto.IncidenciaRequest;
import com.restaurant.restaurantaplicacion.model.Incidencia;
import com.restaurant.restaurantaplicacion.service.IncidenciaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidencias")
public class IncidenciaController {

    @Autowired
    private IncidenciaService incidenciaService;

    // 1. POST: Crear Incidencia (Permitido a todos los roles según SecurityConfig)
    @PostMapping
    public ResponseEntity<Incidencia> crearIncidencia(@RequestBody IncidenciaRequest request, Authentication authentication) {
        // Obtenemos el nombre del usuario logueado automáticamente
        String nombreUsuario = authentication.getName();
        return ResponseEntity.ok(incidenciaService.reportarIncidencia(request, nombreUsuario));
    }

    // 2. GET: Listar Incidencias (Solo Admin)
    @GetMapping
    public ResponseEntity<List<Incidencia>> listarIncidencias() {
        return ResponseEntity.ok(incidenciaService.listarTodas());
    }

    // 3. PUT: Marcar como Resuelta (Solo Admin)
    @PutMapping("/{id}/resolver")
    public ResponseEntity<Incidencia> resolverIncidencia(@PathVariable Long id) {
        return ResponseEntity.ok(incidenciaService.resolverIncidencia(id));
    }
    
    // 4. DELETE: Eliminar (Solo Admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarIncidencia(@PathVariable Long id) {
        incidenciaService.eliminarIncidencia(id);
        return ResponseEntity.noContent().build();
    }
}