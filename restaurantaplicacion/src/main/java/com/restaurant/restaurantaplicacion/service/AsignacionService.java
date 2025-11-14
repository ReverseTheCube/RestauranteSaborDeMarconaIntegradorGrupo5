package com.restaurant.restaurantaplicacion.service;

import com.restaurant.restaurantaplicacion.dto.AsignacionRequest;
import com.restaurant.restaurantaplicacion.model.AsignacionPension;
import com.restaurant.restaurantaplicacion.model.Cliente;
import com.restaurant.restaurantaplicacion.model.Empresa;
import com.restaurant.restaurantaplicacion.repository.AsignacionPensionRepository;
import com.restaurant.restaurantaplicacion.repository.ClienteRepository;
import com.restaurant.restaurantaplicacion.repository.EmpresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AsignacionService {

    @Autowired
    private AsignacionPensionRepository asignacionPensionRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Transactional
    public AsignacionPension crearAsignacion(AsignacionRequest request) {
        
        // 1. Buscar Empresa por RUC
        Optional<Empresa> optionalEmpresa = empresaRepository.findByRuc(request.getRucEmpresa());
        if (!optionalEmpresa.isPresent()) {
            throw new RuntimeException("Empresa con RUC " + request.getRucEmpresa() + " no encontrada.");
        }
        Empresa empresa = optionalEmpresa.get();

        // 2. Buscar Cliente por ID
        Optional<Cliente> optionalCliente = clienteRepository.findById(request.getClienteId());
        if (!optionalCliente.isPresent()) {
            throw new RuntimeException("Cliente con ID " + request.getClienteId() + " no encontrado.");
        }
        Cliente cliente = optionalCliente.get();

        // 3. Validar Saldo
        if (request.getSaldo() == null || request.getSaldo() < 0) {
            throw new RuntimeException("El saldo debe ser un valor positivo.");
        }
        
        // 4. Crear y Guardar la nueva Asignación
        AsignacionPension asignacion = new AsignacionPension();
        asignacion.setEmpresa(empresa);
        asignacion.setCliente(cliente);
        asignacion.setSaldo(request.getSaldo());

        return asignacionPensionRepository.save(asignacion);
    }
}