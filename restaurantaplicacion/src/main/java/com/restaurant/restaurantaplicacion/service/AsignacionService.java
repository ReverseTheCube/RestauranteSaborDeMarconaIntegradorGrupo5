package com.restaurant.restaurantaplicacion.service;

import com.restaurant.restaurantaplicacion.dto.AsignacionRequest;
import com.restaurant.restaurantaplicacion.dto.AjusteSaldoRequest; 
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

@Transactional
public AsignacionPension crearAsignacion(AsignacionRequest request) {
 Optional<Empresa> optionalEmpresa = empresaRepository.findByRuc(request.getRucEmpresa());
if (!optionalEmpresa.isPresent()) {
throw new RuntimeException("Empresa con RUC " + request.getRucEmpresa() + " no encontrada."); }
Empresa empresa = optionalEmpresa.get();

Optional<Cliente> optionalCliente = clienteRepository.findById(request.getClienteId());
if (!optionalCliente.isPresent()) {
throw new RuntimeException("Cliente con ID " + request.getClienteId() + " no encontrado.");
}
Cliente cliente = optionalCliente.get();

if (request.getSaldo() == null || request.getSaldo() < 0) {
throw new RuntimeException("El saldo debe ser un valor positivo.");
}

AsignacionPension asignacion = new AsignacionPension();
asignacion.setEmpresa(empresa);
asignacion.setCliente(cliente);
asignacion.setSaldo(request.getSaldo());

return asignacionPensionRepository.save(asignacion);
}
public List<AsignacionPension> buscarAsignacionesPorRuc(String ruc) {
return asignacionPensionRepository.findByEmpresaRuc(ruc);
}

@Transactional
public AsignacionPension establecerNuevoSaldo(Long asignacionId, Double nuevoSaldoTotal) {
AsignacionPension asignacion = asignacionPensionRepository.findById(asignacionId)
.orElseThrow(() -> new RuntimeException("Asignación de pensión no encontrada con ID: " + asignacionId));
if (nuevoSaldoTotal == null || nuevoSaldoTotal < 0) {
throw new RuntimeException("El saldo total no puede ser nulo o negativo.");
 }

// 3. Establecer el nuevo saldo directamente (reemplazando el valor anterior)
asignacion.setSaldo(nuevoSaldoTotal);
return asignacionPensionRepository.save(asignacion);
 }

// --- LÓGICA ORIGINAL: AJUSTE DE SALDO (Se mantiene para el botón de resta) ---
 @Transactional
 public AsignacionPension ajustarSaldo(Long asignacionId, AjusteSaldoRequest request) {
// 1. Buscar la asignación
AsignacionPension asignacion = asignacionPensionRepository.findById(asignacionId)
.orElseThrow(() -> new RuntimeException("Asignación de pensión no encontrada con ID: " + asignacionId));

// 2. Validar que el monto de ajuste no sea nulo
if (request.getMontoAjuste() == null) {
 throw new RuntimeException("El monto de ajuste no puede ser nulo.");
 }

// 3. Aplicar el ajuste al saldo actual (suma o resta si es negativo)
 Double nuevoSaldo = asignacion.getSaldo() + request.getMontoAjuste();

// 4. Validación de saldo negativo 
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
    
    // =========================================================================
    // NUEVA LÓGICA DE VALIDACIÓN PENSIONADO (USADA POR CLIENTECONTROLLER)
    // =========================================================================
    @Transactional(readOnly = true)
    public Cliente buscarClienteYValidarPension(String dni, String ruc) {
        // 1. Verificar si el cliente existe (DNI)
        Optional<Cliente> optCliente = clienteRepository.findByNumeroDocumento(dni);
        
        if (optCliente.isEmpty()) {
            // Lanza una excepción si el DNI no está registrado
            throw new RuntimeException("El DNI ingresado no corresponde a un cliente registrado."); 
        }
        
        // 2. Si hay RUC, verificar la asignación
        if (ruc != null && !ruc.isEmpty()) {
            Optional<AsignacionPension> optAsignacion = asignacionPensionRepository
                .findByClienteNumeroDocumentoAndEmpresaRuc(dni, ruc);
            
            if (optAsignacion.isEmpty()) {
                // Lanza una excepción si el vínculo NO existe
                throw new RuntimeException("El cliente no tiene pensión asignada a esta empresa (RUC).");
            }
        }
        
        return optCliente.get();
    }
}