package com.restaurant.restaurantaplicacion.service;

import com.restaurant.restaurantaplicacion.dto.IncidenciaRequest;
import com.restaurant.restaurantaplicacion.model.Incidencia;
import com.restaurant.restaurantaplicacion.repository.IncidenciaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class IncidenciaService {

    @Autowired
    private IncidenciaRepository incidenciaRepository;

    // Crear una nueva incidencia (Cualquier empleado)
    public Incidencia reportarIncidencia(IncidenciaRequest request, String nombreUsuario) {
        Incidencia incidencia = new Incidencia();
        incidencia.setDescripcion(request.getDescripcion());
        incidencia.setPrioridad(request.getPrioridad());
        incidencia.setUsuarioReporta(nombreUsuario);
        
        // Valores automáticos
        incidencia.setEstado("PENDIENTE");
        incidencia.setFechaReporte(LocalDateTime.now());

        return incidenciaRepository.save(incidencia);
    }

    // Listar todas (Solo Admin)
    public List<Incidencia> listarTodas() {
        // Devolvemos las más recientes primero
        return incidenciaRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "fechaReporte"));
    }

    // Resolver incidencia (Solo Admin)
    public Incidencia resolverIncidencia(Long id) {
        Incidencia incidencia = incidenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incidencia no encontrada"));
        
        incidencia.setEstado("RESUELTO");
        return incidenciaRepository.save(incidencia);
    }
    
    // Eliminar incidencia (Solo Admin)
    public void eliminarIncidencia(Long id) {
        incidenciaRepository.deleteById(id);
    }
}