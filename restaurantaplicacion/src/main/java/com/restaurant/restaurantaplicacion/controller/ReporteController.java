package com.restaurant.restaurantaplicacion.controller;

import com.restaurant.restaurantaplicacion.dto.GenerarReporteRequest;
import com.restaurant.restaurantaplicacion.dto.ReporteResponse;
import com.restaurant.restaurantaplicacion.service.ReporteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.nio.file.Files;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
public class ReporteController {

    @Autowired
    private ReporteService reporteService;

    // --- ENDPOINT PARA GENERAR REPORTE ---
    @PostMapping
    public ResponseEntity<ReporteResponse> generarReporte(@RequestBody GenerarReporteRequest request) {
        try {
            ReporteResponse response = reporteService.generarReporte(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            // Podrías devolver un mensaje de error más específico
            System.err.println("Error al generar reporte: " + e.getMessage());
            return ResponseEntity.badRequest().body(null); // O un DTO de error
        } catch (Exception e) {
            System.err.println("Error inesperado al generar reporte: " + e.getMessage());
            return ResponseEntity.internalServerError().body(null);
        }
    }

    // --- ENDPOINT PARA OBTENER INFO DE UN REPORTE ---
    @GetMapping("/{id}")
    public ResponseEntity<ReporteResponse> obtenerReporteInfo(@PathVariable Long id) {
        try {
            ReporteResponse response = reporteService.obtenerReporteInfo(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // --- ENDPOINT PARA DESCARGAR ARCHIVO ---
    @GetMapping("/descargar")
    public ResponseEntity<Resource> descargarArchivo(@RequestParam String archivo) {
        try {
            Resource resource = reporteService.cargarArchivoComoRecurso(archivo);
            String contentType = "application/octet-stream"; // Tipo genérico para descarga

            // Intenta determinar el tipo MIME real (opcional pero mejor)
            try {
                contentType = Files.probeContentType(resource.getFile().toPath());
            } catch (Exception e) { /* Ignorar si no se puede determinar */ }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    // ¡Esta cabecera fuerza la descarga!
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (RuntimeException e) {
            System.err.println("Error al descargar archivo: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error inesperado al descargar: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

     // --- ENDPOINT PARA VISUALIZAR ARCHIVO ---
    @GetMapping("/ver")
    public ResponseEntity<Resource> visualizarArchivo(@RequestParam String archivo) {
        try {
            Resource resource = reporteService.cargarArchivoComoRecurso(archivo);
            String contentType = "application/octet-stream"; // Default

            try {
                contentType = Files.probeContentType(resource.getFile().toPath());
                 // Para PDF, asegúrate que sea application/pdf
                if (archivo.toLowerCase().endsWith(".pdf")) {
                    contentType = "application/pdf";
                }
            } catch (Exception e) { /* Ignorar */ }


            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    // ¡Esta cabecera intenta mostrarlo en el navegador!
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (RuntimeException e) {
             System.err.println("Error al visualizar archivo: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error inesperado al visualizar: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}