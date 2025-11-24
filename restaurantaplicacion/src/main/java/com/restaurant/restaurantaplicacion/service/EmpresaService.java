package com.restaurant.restaurantaplicacion.service;

import com.restaurant.restaurantaplicacion.dto.EmpresaRequest;
import com.restaurant.restaurantaplicacion.model.Empresa;
import com.restaurant.restaurantaplicacion.repository.EmpresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmpresaService {

    @Autowired
    private EmpresaRepository empresaRepository;

    // --- MÉTODO MODIFICADO/UNIFICADO PARA LISTAR Y BUSCAR ---
    // Reemplaza al anterior obtenerTodasLasEmpresas()
    public List<Empresa> buscarEmpresasPorFiltro(String filtro) {
         // Si el filtro es nulo o vacío, devuelve TODAS las empresas (comportamiento sin filtro)
         if (filtro == null || filtro.trim().isEmpty()) {
             return empresaRepository.findAll();
         }
         
         // Si hay filtro, busca por RUC o Razón Social (parcial)
         String busqueda = filtro.trim();
         return empresaRepository.findByRucContainingOrRazonSocialContainingIgnoreCase(busqueda, busqueda);
    }


    // REGISTRAR EMPRESA (sin cambios)
    public Empresa registrarEmpresa(EmpresaRequest request) {
        // Validación de existencia
        if (empresaRepository.findByRuc(request.getRuc()).isPresent()) {
             throw new RuntimeException("El RUC ya está registrado.");
        }

        Empresa empresa = new Empresa();
        empresa.setRuc(request.getRuc());
        empresa.setRazonSocial(request.getRazonSocial());

        return empresaRepository.save(empresa);
    }
}