package com.restaurant.restaurantaplicacion.controller;

import com.restaurant.restaurantaplicacion.dto.AsignacionRequest;
import com.restaurant.restaurantaplicacion.dto.AjusteSaldoRequest; 
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
    
    // --- ENDPOINT GET (Buscar por DNI) ---
    @GetMapping("/buscar")
    public ResponseEntity<List<AsignacionPension>> buscarPorDni(@RequestParam String dni) {
        List<AsignacionPension> asignaciones = asignacionService.buscarAsignacionPorDni(dni);
        return ResponseEntity.ok(asignaciones);
    }
    
    // --- ENDPOINT PUT (Ajustar Saldo: Suma/Resta de Delta) ---
    // Se mantiene para compatibilidad con la resta, pero su uso es opcional.
    @PutMapping("/{id}/saldo")
    public ResponseEntity<AsignacionPension> actualizarSaldo(@PathVariable Long id, @RequestBody AjusteSaldoRequest request) {
        try {
            AsignacionPension asignacionActualizada = asignacionService.ajustarSaldo(id, request);
            return ResponseEntity.ok(asignacionActualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // --- ENDPOINT: ESTABLECER SALDO TOTAL (EDICIÓN DIRECTA) ---
    @PutMapping("/{id}/saldo-total")
    public ResponseEntity<AsignacionPension> establecerSaldoTotal(@PathVariable Long id, @RequestBody AjusteSaldoRequest request) {
        try {
            // El DTO (AjusteSaldoRequest) se reutiliza para pasar el valor del saldo total en 'montoAjuste'
            AsignacionPension asignacionActualizada = asignacionService.establecerNuevoSaldo(id, request.getMontoAjuste());
            return ResponseEntity.ok(asignacionActualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
    
    // --- ENDPOINT DELETE (Eliminar Asignación) ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarAsignacion(@PathVariable Long id) {
        try {
            asignacionService.eliminarAsignacion(id);
            return ResponseEntity.noContent().build(); // 204 No Content (Éxito)
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build(); 
        }
    }
}