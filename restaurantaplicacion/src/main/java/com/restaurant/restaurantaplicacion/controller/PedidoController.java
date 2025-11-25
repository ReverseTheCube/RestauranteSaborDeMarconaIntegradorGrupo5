package com.restaurant.restaurantaplicacion.controller;

import com.restaurant.restaurantaplicacion.dto.CrearPedidoRequest;
import com.restaurant.restaurantaplicacion.dto.FinalizarPedidoRequest;
import com.restaurant.restaurantaplicacion.dto.PedidoInicioResponseDTO;
import com.restaurant.restaurantaplicacion.model.Pedido;
import com.restaurant.restaurantaplicacion.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat; // <--- IMPORTANTE
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate; // <--- IMPORTANTE
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    // --- 1. INICIAR PEDIDO (Mesa o Delivery) ---
    @PostMapping("/registrar-inicio")
    public ResponseEntity<?> iniciarRegistroPedido(
            @RequestParam String tipoServicio,
            @RequestParam(required = false) Integer numeroMesa,
            @RequestParam Long usuarioId 
    ) {
        try {
            Pedido nuevoPedido = pedidoService.iniciarPedido(tipoServicio, numeroMesa, usuarioId);
            
            PedidoInicioResponseDTO response = new PedidoInicioResponseDTO(
                nuevoPedido.getId(),
                nuevoPedido.getTipoServicio(),
                nuevoPedido.getEstado().toString()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al iniciar: " + e.getMessage());
        }
    }

    // --- 2. CREAR/ACTUALIZAR (Método genérico) ---
    @PostMapping
    public ResponseEntity<Pedido> crearPedido(@RequestBody CrearPedidoRequest request) {
        try {
            Pedido nuevoPedido = pedidoService.crearPedido(request); 
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPedido);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // --- 3. FINALIZAR PEDIDO (Calcula totales y cierra mesa) ---
    @PutMapping("/finalizar")
    public ResponseEntity<Pedido> finalizarPedido(@RequestBody FinalizarPedidoRequest request) {
        try {
            Pedido pedidoActualizado = pedidoService.finalizarPedido(request.getPedidoId(), request);
            return ResponseEntity.ok(pedidoActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // --- 4. OBTENER HISTORIAL COMPLETO ---
    @GetMapping
    public ResponseEntity<List<Pedido>> obtenerTodosLosPedidos() {
        return ResponseEntity.ok(pedidoService.obtenerTodosLosPedidos());
    }

    // --- 5. VER MESAS OCUPADAS ---
    @GetMapping("/mesas-ocupadas")
    public ResponseEntity<List<Map<String, Object>>> obtenerMesasOcupadas() {
        return ResponseEntity.ok(pedidoService.obtenerMesasOcupadas());
    }

    // --- 6. BÚSQUEDA CON FILTROS ---
    @GetMapping("/buscar")
    public ResponseEntity<List<Pedido>> buscarPedidos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
            @RequestParam(required = false) Long clienteId,
            @RequestParam(required = false) String rucEmpresa,
            @RequestParam(required = false) String mesa,
            @RequestParam(required = false) String delivery
    ) {
        List<Pedido> resultados = pedidoService.buscarPedidosAvanzado(fechaDesde, fechaHasta, clienteId, rucEmpresa, mesa, delivery);
        return ResponseEntity.ok(resultados);
    }
}