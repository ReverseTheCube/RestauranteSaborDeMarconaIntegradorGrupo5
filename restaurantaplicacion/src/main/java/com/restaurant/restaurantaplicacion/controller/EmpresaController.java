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
@CrossOrigin(origins = "*") 
public class EmpresaController {

    @Autowired
    private EmpresaService empresaService;

    // REGISTRAR EMPRESA (sin cambios)
    @PostMapping
    public ResponseEntity<?> registrarEmpresa(@RequestBody EmpresaRequest request) {
        try {
            Empresa nuevaEmpresa = empresaService.registrarEmpresa(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEmpresa);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // OBTENER EMPRESAS (MODIFICADO para recibir filtro)
    // Reemplaza al anterior obtenerEmpresas()
    @GetMapping
    public ResponseEntity<List<Empresa>> obtenerEmpresas(
        // Acepta un parámetro de consulta "filtro" opcional
        @RequestParam(required = false) String filtro) { 
        
        List<Empresa> empresas = empresaService.buscarEmpresasPorFiltro(filtro);
        return ResponseEntity.ok(empresas);
    }
}