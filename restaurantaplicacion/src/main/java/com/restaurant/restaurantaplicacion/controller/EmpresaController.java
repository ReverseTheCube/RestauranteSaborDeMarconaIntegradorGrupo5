package com.restaurant.restaurantaplicacion.controller;

import com.restaurant.restaurantaplicacion.dto.EmpresaRequest;
import com.restaurant.restaurantaplicacion.model.Empresa;
import com.restaurant.restaurantaplicacion.service.EmpresaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/empresas")
@CrossOrigin(origins = "*") // Permite llamadas desde el frontend
public class EmpresaController {

    @Autowired
    private EmpresaService empresaService;

    // CREAR - POST http://localhost:8080/api/empresas
    @PostMapping
    public ResponseEntity<?> registrarEmpresa(@RequestBody EmpresaRequest request) {
        try {
            Empresa nuevaEmpresa = empresaService.registrarEmpresa(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEmpresa);
        } catch (RuntimeException e) {
            // Error de RUC duplicado o validación
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // LEER (TODAS) - GET http://localhost:8080/api/empresas
    @GetMapping
    public ResponseEntity<List<Empresa>> obtenerEmpresas() {
        return ResponseEntity.ok(empresaService.obtenerTodasLasEmpresas());
    }
}