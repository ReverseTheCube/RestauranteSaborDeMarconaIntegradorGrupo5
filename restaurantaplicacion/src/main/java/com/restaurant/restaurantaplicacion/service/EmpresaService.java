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

    // OBTENER TODAS LAS EMPRESAS
    public List<Empresa> obtenerTodasLasEmpresas() {
        return empresaRepository.findAll();
    }

    // REGISTRAR EMPRESA
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