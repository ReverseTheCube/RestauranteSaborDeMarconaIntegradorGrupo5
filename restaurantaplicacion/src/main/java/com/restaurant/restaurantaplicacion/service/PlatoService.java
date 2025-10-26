package com.restaurant.restaurantaplicacion.service;
import com.restaurant.restaurantaplicacion.dto.PlatoRequest;
import com.restaurant.restaurantaplicacion.model.Plato;
import com.restaurant.restaurantaplicacion.repository.PlatoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
@Service
public class PlatoService {
   @Autowired
    private PlatoRepository platoRepository;

    // CREAR PLATO
    public Plato crearPlato(PlatoRequest request) {
        Plato plato = new Plato();
        plato.setNombre(request.getNombre());
        plato.setDescripcion(request.getDescripcion());
        plato.setPrecio(request.getPrecio());
        plato.setTipo(request.getTipo()); // (Será "PRINCIPAL")
        plato.setActivo(true); // Siempre se crea como activo
        return platoRepository.save(plato);
    }

    // OBTENER TODOS LOS PLATOS
    public List<Plato> obtenerTodosLosPlatos() {
        return platoRepository.findAll();
    }

    // OBTENER UN PLATO POR ID
    public Optional<Plato> obtenerPlatoPorId(Long id) {
        return platoRepository.findById(id);
    }

    // ACTUALIZAR PLATO
    public Plato actualizarPlato(Long id, PlatoRequest request) {
        // Busca el plato o lanza un error si no existe
        Plato plato = platoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plato no encontrado"));

        plato.setNombre(request.getNombre());
        plato.setDescripcion(request.getDescripcion());
        plato.setPrecio(request.getPrecio());
        plato.setTipo(request.getTipo());
        
        return platoRepository.save(plato);
    }

    // ELIMINAR PLATO (Marcar como inactivo)
    // Esto coincide con el "SE PONDRÁ INACTIVO" de tu HTML
    public void eliminarPlato(Long id) {
        Plato plato = platoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plato no encontrado"));

        plato.setActivo(false); // ¡No lo borramos! Solo lo inactivamos (Soft Delete)
        platoRepository.save(plato);
    } 
}
