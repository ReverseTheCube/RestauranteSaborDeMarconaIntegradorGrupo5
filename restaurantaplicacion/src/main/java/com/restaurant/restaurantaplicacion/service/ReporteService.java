package com.restaurant.restaurantaplicacion.service;

import com.restaurant.restaurantaplicacion.dto.GenerarReporteRequest;
import com.restaurant.restaurantaplicacion.dto.ReporteResponse;
import com.restaurant.restaurantaplicacion.model.Pedido;
import com.restaurant.restaurantaplicacion.model.Reporte;
import com.restaurant.restaurantaplicacion.repository.PedidoRepository;
import com.restaurant.restaurantaplicacion.repository.ReporteRepository;

// Imports PDF
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.TextAlignment;

// Imports Excel (Apache POI) - AHORA SÍ CORRECTOS
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.*; 

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.FileOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.DecimalFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReporteService {

    @Autowired
    private ReporteRepository reporteRepository;
    @Autowired
    private PedidoRepository pedidoRepository;

    @Value("${reportes.directorio:./reportes_generados}") 
    private String directorioReportes;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter FILENAME_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");
    private static final DateTimeFormatter PRETTY_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DecimalFormat CURRENCY_FORMAT = new DecimalFormat("S/ #,##0.00");

    @Transactional
    public ReporteResponse generarReporte(GenerarReporteRequest request) throws IOException {
        LocalDateTime fechaInicio;
        LocalDateTime fechaFin;
        String periodoDesc = request.getPeriodo();

        switch (request.getPeriodo()) {
            case "diario":
                fechaInicio = LocalDate.now().atStartOfDay();
                fechaFin = LocalDate.now().atTime(LocalTime.MAX);
                break;
            case "quincenal":
                fechaFin = LocalDateTime.now();
                fechaInicio = fechaFin.minusDays(15).with(LocalTime.MIN);
                break;
            case "mensual":
                fechaFin = LocalDateTime.now();
                fechaInicio = fechaFin.minusMonths(1).with(LocalTime.MIN);
                break;
            case "fechaReferencia":
                if (request.getFecha() == null || request.getFecha().isEmpty()) {
                    throw new RuntimeException("Debe seleccionar una fecha.");
                }
                LocalDate fechaRef = LocalDate.parse(request.getFecha(), DATE_FORMATTER);
                fechaInicio = fechaRef.atStartOfDay();
                fechaFin = fechaRef.atTime(LocalTime.MAX);
                periodoDesc = "fecha_" + request.getFecha();
                break;
            default:
                throw new RuntimeException("Periodo no válido: " + request.getPeriodo());
        }

        List<Pedido> pedidos = pedidoRepository.findAllByFechaHoraBetween(fechaInicio, fechaFin);

        if (pedidos.isEmpty()) {
            throw new RuntimeException("No se encontraron ventas en el periodo seleccionado.");
        }

        String timestamp = LocalDateTime.now().format(FILENAME_FORMATTER);
        String extension = request.getArchivo().equalsIgnoreCase("pdf") ? "pdf" : "xlsx";
        String nombreArchivo = String.format("Reporte_%s_%s.%s", periodoDesc, timestamp, extension);
        
        Path rutaDirectorio = Paths.get(directorioReportes);
        if (!Files.exists(rutaDirectorio)) Files.createDirectories(rutaDirectorio);
        Path rutaArchivo = rutaDirectorio.resolve(nombreArchivo);

        if ("pdf".equalsIgnoreCase(request.getArchivo())) {
            generarPdf(pedidos, request, rutaArchivo.toString(), fechaInicio, fechaFin);
        } else {
            generarExcel(pedidos, request, rutaArchivo.toString(), fechaInicio, fechaFin);
        }

        long tamanoBytes = Files.size(rutaArchivo);
        
        Reporte reporte = new Reporte();
        reporte.setNombreArchivo(nombreArchivo);
        reporte.setFechaGeneracion(LocalDateTime.now());
        reporte.setNumeroRegistros((long) pedidos.size());
        reporte.setTamanoArchivo(formatarTamano(tamanoBytes));
        reporte.setTipoArchivo(request.getArchivo().toUpperCase());
        reporte.setRutaArchivo(rutaArchivo.toAbsolutePath().toString());

        Reporte reporteGuardado = reporteRepository.save(reporte);

        return new ReporteResponse(
                reporteGuardado.getId(), reporteGuardado.getFechaGeneracion(),
                reporteGuardado.getNumeroRegistros(), reporteGuardado.getNombreArchivo(),
                reporteGuardado.getTamanoArchivo(), reporteGuardado.getTipoArchivo()
        );
    }

    private void generarPdf(List<Pedido> pedidos, GenerarReporteRequest config, String ruta, LocalDateTime inicio, LocalDateTime fin) throws IOException {
        PdfWriter writer = new PdfWriter(ruta);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        document.add(new Paragraph("REPORTE DE VENTAS - EL SABOR DE MARCONA").setBold().setFontSize(16).setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph("Periodo: " + config.getPeriodo().toUpperCase()).setFontSize(12).setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph("Desde: " + inicio.format(PRETTY_DATE) + " Hasta: " + fin.format(PRETTY_DATE)).setFontSize(10).setTextAlignment(TextAlignment.CENTER).setMarginBottom(20));

        if (config.isResumen()) {
            double totalVentas = pedidos.stream().mapToDouble(Pedido::getTotal).sum();
            document.add(new Paragraph("RESUMEN FINANCIERO").setBold().setUnderline());
            document.add(new Paragraph("Total de Pedidos: " + pedidos.size()));
            document.add(new Paragraph("Ingresos Totales: " + CURRENCY_FORMAT.format(totalVentas)));
            document.add(new Paragraph("\n"));
        }

        if (config.isDetallados()) {
            document.add(new Paragraph("DETALLE DE TRANSACCIONES").setBold().setUnderline().setMarginBottom(5));
            float[] columnWidths = {1, 3, 3, 2, 2}; 
            Table table = new Table(UnitValue.createPercentArray(columnWidths)).useAllAvailableWidth();
            table.addHeaderCell("ID"); table.addHeaderCell("Fecha / Hora"); table.addHeaderCell("Atendido Por"); table.addHeaderCell("Tipo"); table.addHeaderCell("Total");

            for (Pedido p : pedidos) {
                table.addCell(String.valueOf(p.getId()));
                table.addCell(p.getFechaHora().format(PRETTY_DATE));
                table.addCell(p.getUsuario() != null ? p.getUsuario().getUsuario() : "N/A");
                table.addCell(p.getTipoServicio());
                table.addCell(CURRENCY_FORMAT.format(p.getTotal()));
            }
            document.add(table);
        }
        document.close();
    }

    private void generarExcel(List<Pedido> pedidos, GenerarReporteRequest config, String ruta, LocalDateTime inicio, LocalDateTime fin) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            XSSFSheet sheet = workbook.createSheet("Reporte Ventas");
            int rowIdx = 0;
            Row titleRow = sheet.createRow(rowIdx++);
            titleRow.createCell(0).setCellValue("REPORTE DE VENTAS");
            rowIdx++;

            if (config.isDetallados()) {
                Row headerRow = sheet.createRow(rowIdx++);
                String[] headers = {"ID", "Fecha", "Mesero", "Tipo", "Total"};
                for (int i = 0; i < headers.length; i++) headerRow.createCell(i).setCellValue(headers[i]);
                
                for (Pedido p : pedidos) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(p.getId());
                    row.createCell(1).setCellValue(p.getFechaHora().toString());
                    row.createCell(2).setCellValue(p.getUsuario().getUsuario());
                    row.createCell(3).setCellValue(p.getTipoServicio());
                    row.createCell(4).setCellValue(p.getTotal());
                }
            }
            try (FileOutputStream fileOut = new FileOutputStream(ruta)) { workbook.write(fileOut); }
        }
    }

    public ReporteResponse obtenerReporteInfo(Long id) {
        Reporte reporte = reporteRepository.findById(id).orElseThrow(() -> new RuntimeException("Reporte no encontrado"));
        return new ReporteResponse(reporte.getId(), reporte.getFechaGeneracion(), reporte.getNumeroRegistros(), reporte.getNombreArchivo(), reporte.getTamanoArchivo(), reporte.getTipoArchivo());
    }

    public Resource cargarArchivoComoRecurso(String nombreArchivo) {
        try {
            Reporte reporte = reporteRepository.findByNombreArchivo(nombreArchivo).orElseThrow(() -> new RuntimeException("Archivo no encontrado"));
            Path path = Paths.get(reporte.getRutaArchivo());
            return new UrlResource(path.toUri());
        } catch (Exception e) { throw new RuntimeException("Error al cargar archivo", e); }
    }

    private String formatarTamano(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp-1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }

    // --- NUEVO MÉTODO: EXPORTAR BÚSQUEDA ---
    public Resource exportarBusqueda(LocalDate fDesde, LocalDate fHasta, Long clienteId, String ruc, String mesa, String delivery, String tipoArchivo) throws IOException {
        
        // 1. Preparar Fechas
        LocalDateTime inicio = (fDesde != null) ? fDesde.atStartOfDay() : null;
        LocalDateTime fin = (fHasta != null) ? fHasta.atTime(23, 59, 59) : null;

        // 2. Limpiar datos (Igual que en PedidoService)
        if (ruc != null && ruc.trim().isEmpty()) ruc = null;
        if (mesa != null && mesa.trim().isEmpty()) mesa = null;
        if (delivery != null && delivery.trim().isEmpty()) delivery = null;
        
        String infoServicio = null;
        if (mesa != null) infoServicio = mesa.replace("mesa", "").trim();
        else if (delivery != null) infoServicio = delivery.trim();

        // 3. Buscar datos
        List<Pedido> pedidos = pedidoRepository.buscarPedidosConFiltros(inicio, fin, clienteId, ruc, infoServicio);

        if (pedidos.isEmpty()) {
            throw new RuntimeException("No hay datos para exportar con estos filtros.");
        }

        // 4. Configuración "Dummy" para reutilizar tus generadores
        GenerarReporteRequest config = new GenerarReporteRequest();
        config.setPeriodo("BÚSQUEDA PERSONALIZADA");
        config.setResumen(true);   // Siempre incluir resumen
        config.setDetallados(true); // Siempre incluir tabla
        config.setGraficos(false);

        // 5. Generar Archivo Temporal
        String timestamp = LocalDateTime.now().format(FILENAME_FORMATTER);
        String extension = "pdf".equalsIgnoreCase(tipoArchivo) ? "pdf" : "xlsx";
        String nombreArchivo = String.format("Busqueda_%s.%s", timestamp, extension);
        
        Path rutaDirectorio = Paths.get(directorioReportes);
        if (!Files.exists(rutaDirectorio)) Files.createDirectories(rutaDirectorio);
        Path rutaArchivo = rutaDirectorio.resolve(nombreArchivo);

        if ("pdf".equalsIgnoreCase(tipoArchivo)) {
            // NOTA: Si tus métodos generarPdf/Excel piden fechaInicio/Fin obligatorias y son null, 
            // pasamos fechas dummy o las del primer/último pedido para evitar error.
            LocalDateTime safeInicio = (inicio != null) ? inicio : pedidos.get(0).getFechaHora();
            LocalDateTime safeFin = (fin != null) ? fin : pedidos.get(pedidos.size()-1).getFechaHora();
            
            generarPdf(pedidos, config, rutaArchivo.toString(), safeInicio, safeFin);
        } else {
            LocalDateTime safeInicio = (inicio != null) ? inicio : pedidos.get(0).getFechaHora();
            LocalDateTime safeFin = (fin != null) ? fin : pedidos.get(pedidos.size()-1).getFechaHora();
            
            generarExcel(pedidos, config, rutaArchivo.toString(), safeInicio, safeFin);
        }

        // 6. Retornar Recurso
        try {
            return new UrlResource(rutaArchivo.toUri());
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error al generar recurso de descarga");
        }
    }
}