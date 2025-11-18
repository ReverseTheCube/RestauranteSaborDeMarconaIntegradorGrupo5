package com.restaurant.restaurantaplicacion.service;

import com.restaurant.restaurantaplicacion.dto.AsignacionRequest;
import com.restaurant.restaurantaplicacion.dto.AjusteSaldoRequest; // <-- ESTA LÍNEA ES CLAVE
import com.restaurant.restaurantaplicacion.model.AsignacionPension;
import com.restaurant.restaurantaplicacion.model.Cliente;
import com.restaurant.restaurantaplicacion.model.Empresa;
import com.restaurant.restaurantaplicacion.repository.AsignacionPensionRepository;
import com.restaurant.restaurantaplicacion.repository.ClienteRepository;
import com.restaurant.restaurantaplicacion.repository.EmpresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AsignacionService {

    @Autowired
    private AsignacionPensionRepository asignacionPensionRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    // --- Lógica de Asignación Inicial (crearAsignacion) ---
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
    
    // --- Lógica de Búsqueda por RUC (buscarAsignacionesPorRuc) ---
    public List<AsignacionPension> buscarAsignacionesPorRuc(String ruc) {
        return asignacionPensionRepository.findByEmpresaRuc(ruc);
    }

    // --- LÓGICA DE ACTUALIZACIÓN DE SALDO (ajustarSaldo) ---
    @Transactional
    public AsignacionPension ajustarSaldo(Long asignacionId, AjusteSaldoRequest request) {
        
        // 1. Buscar la asignación
        AsignacionPension asignacion = asignacionPensionRepository.findById(asignacionId)
                .orElseThrow(() -> new RuntimeException("Asignación de pensión no encontrada con ID: " + asignacionId));
        
        // 2. Validar que el monto de ajuste no sea nulo
        if (request.getMontoAjuste() == null) {
            throw new RuntimeException("El monto de ajuste no puede ser nulo.");
        }
        
        // 3. Aplicar el ajuste al saldo actual
        Double nuevoSaldo = asignacion.getSaldo() + request.getMontoAjuste();
        
        // 4. Validación de saldo negativo (opcional, pero buena práctica)
        if (nuevoSaldo < 0) {
            throw new RuntimeException("La operación resultaría en un saldo negativo. Saldo actual: S/ " + asignacion.getSaldo());
        }
        
        // 5. Actualizar y guardar
        asignacion.setSaldo(nuevoSaldo);
        return asignacionPensionRepository.save(asignacion);
    }

    // --- LÓGICA DE ELIMINACIÓN (eliminarAsignacion) ---
    @Transactional
    public void eliminarAsignacion(Long asignacionId) {
        if (!asignacionPensionRepository.existsById(asignacionId)) {
            throw new RuntimeException("Asignación de pensión no encontrada con ID: " + asignacionId);
        }
        asignacionPensionRepository.deleteById(asignacionId);
    }
}