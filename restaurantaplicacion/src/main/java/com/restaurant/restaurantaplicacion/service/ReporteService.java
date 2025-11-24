package com.restaurant.restaurantaplicacion.service;

import com.restaurant.restaurantaplicacion.dto.GenerarReporteRequest;
import com.restaurant.restaurantaplicacion.dto.ReporteResponse;
import com.restaurant.restaurantaplicacion.model.Pedido;
import com.restaurant.restaurantaplicacion.model.Reporte;
import com.restaurant.restaurantaplicacion.repository.PedidoRepository;
import com.restaurant.restaurantaplicacion.repository.ReporteRepository;

// Imports PDF (iText)
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.TextAlignment;

// Imports Excel (Apache POI) - ¡CORREGIDO AQUÍ!
import org.apache.poi.ss.usermodel.*;
// El asterisco (*) importa XSSFWorkbook, XSSFSheet y cualquier otra clase de ese paquete
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

    // Carpeta donde se guardan los reportes
    @Value("${reportes.directorio:./reportes_generados}") 
    private String directorioReportes;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter FILENAME_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");
    private static final DateTimeFormatter PRETTY_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DecimalFormat CURRENCY_FORMAT = new DecimalFormat("S/ #,##0.00");

    @Transactional
    public ReporteResponse generarReporte(GenerarReporteRequest request) throws IOException {

        // 1. LÓGICA DE FECHAS (Filtro de Periodo)
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
                    throw new RuntimeException("Debe seleccionar una fecha en el calendario.");
                }
                LocalDate fechaRef = LocalDate.parse(request.getFecha(), DATE_FORMATTER);
                fechaInicio = fechaRef.atStartOfDay();
                fechaFin = fechaRef.atTime(LocalTime.MAX);
                periodoDesc = "fecha_" + request.getFecha();
                break;
            default:
                throw new RuntimeException("Periodo no válido: " + request.getPeriodo());
        }

        // 2. OBTENCIÓN DE DATOS DE LA BD
        List<Pedido> pedidos = pedidoRepository.findAllByFechaHoraBetween(fechaInicio, fechaFin);

        if (pedidos.isEmpty()) {
            throw new RuntimeException("No se encontraron ventas en el periodo seleccionado (" + periodoDesc + ").");
        }

        // 3. PREPARAR EL ARCHIVO
        String timestamp = LocalDateTime.now().format(FILENAME_FORMATTER);
        String extension = request.getArchivo().equalsIgnoreCase("pdf") ? "pdf" : "xlsx";
        String nombreArchivo = String.format("Reporte_%s_%s.%s", periodoDesc, timestamp, extension);
        
        Path rutaDirectorio = Paths.get(directorioReportes);
        if (!Files.exists(rutaDirectorio)) {
            Files.createDirectories(rutaDirectorio);
        }
        Path rutaArchivo = rutaDirectorio.resolve(nombreArchivo);

        // 4. GENERAR EL DOCUMENTO REAL
        if ("pdf".equalsIgnoreCase(request.getArchivo())) {
            generarPdf(pedidos, request, rutaArchivo.toString(), fechaInicio, fechaFin);
        } else {
            generarExcel(pedidos, request, rutaArchivo.toString(), fechaInicio, fechaFin);
        }

        // 5. GUARDAR METADATOS EN BD
        long tamanoBytes = Files.size(rutaArchivo);
        
        Reporte reporte = new Reporte();
        reporte.setNombreArchivo(nombreArchivo);
        reporte.setFechaGeneracion(LocalDateTime.now());
        reporte.setNumeroRegistros((long) pedidos.size());
        reporte.setTamanoArchivo(formatarTamano(tamanoBytes));
        reporte.setTipoArchivo(request.getArchivo().toUpperCase());
        reporte.setRutaArchivo(rutaArchivo.toAbsolutePath().toString());

        Reporte reporteGuardado = reporteRepository.save(reporte);

        // 6. RETORNAR RESPUESTA
        return new ReporteResponse(
                reporteGuardado.getId(),
                reporteGuardado.getFechaGeneracion(),
                reporteGuardado.getNumeroRegistros(),
                reporteGuardado.getNombreArchivo(),
                reporteGuardado.getTamanoArchivo(),
                reporteGuardado.getTipoArchivo()
        );
    }

    // --- GENERADOR PDF (Usando iText) ---
    private void generarPdf(List<Pedido> pedidos, GenerarReporteRequest config, String ruta, LocalDateTime inicio, LocalDateTime fin) throws IOException {
        PdfWriter writer = new PdfWriter(ruta);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Título
        document.add(new Paragraph("REPORTE DE VENTAS - EL SABOR DE MARCONA")
                .setBold().setFontSize(16).setTextAlignment(TextAlignment.CENTER));
        
        document.add(new Paragraph("Periodo: " + config.getPeriodo().toUpperCase())
                .setFontSize(12).setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph("Desde: " + inicio.format(PRETTY_DATE) + " Hasta: " + fin.format(PRETTY_DATE))
                .setFontSize(10).setTextAlignment(TextAlignment.CENTER).setMarginBottom(20));

        // 1. SECCIÓN RESUMEN
        if (config.isResumen()) {
            double totalVentas = pedidos.stream().mapToDouble(Pedido::getTotal).sum();
            long totalPedidos = pedidos.size();
            
            document.add(new Paragraph("RESUMEN FINANCIERO").setBold().setUnderline());
            document.add(new Paragraph("Total de Pedidos: " + totalPedidos));
            document.add(new Paragraph("Ingresos Totales: " + CURRENCY_FORMAT.format(totalVentas)));
            document.add(new Paragraph("\n")); 
        }

        // 2. SECCIÓN DETALLADA
        if (config.isDetallados()) {
            document.add(new Paragraph("DETALLE DE TRANSACCIONES").setBold().setUnderline().setMarginBottom(5));
            
            float[] columnWidths = {1, 3, 3, 2, 2}; 
            Table table = new Table(UnitValue.createPercentArray(columnWidths)).useAllAvailableWidth();
            
            table.addHeaderCell("ID");
            table.addHeaderCell("Fecha / Hora");
            table.addHeaderCell("Atendido Por");
            table.addHeaderCell("Tipo");
            table.addHeaderCell("Total");

            for (Pedido p : pedidos) {
                table.addCell(String.valueOf(p.getId()));
                table.addCell(p.getFechaHora().format(PRETTY_DATE));
                table.addCell(p.getUsuario() != null ? p.getUsuario().getUsuario() : "N/A");
                table.addCell(p.getTipoServicio());
                table.addCell(CURRENCY_FORMAT.format(p.getTotal()));
            }
            document.add(table);
        }
        
        if (config.isGraficos()) {
            document.add(new Paragraph("\n(Los gráficos estadísticos están disponibles en la vista web del administrador)").setItalic().setFontSize(8));
        }

        document.close();
    }

    // --- GENERADOR EXCEL (Usando Apache POI) ---
    private void generarExcel(List<Pedido> pedidos, GenerarReporteRequest config, String ruta, LocalDateTime inicio, LocalDateTime fin) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            // AHORA SÍ FUNCIONARÁ PORQUE IMPORTAMOS org.apache.poi.xssf.usermodel.*
            XSSFSheet sheet = workbook.createSheet("Reporte Ventas");

            int rowIdx = 0;

            // Título
            Row titleRow = sheet.createRow(rowIdx++);
            titleRow.createCell(0).setCellValue("REPORTE DE VENTAS - EL SABOR DE MARCONA");
            
            Row dateRow = sheet.createRow(rowIdx++);
            dateRow.createCell(0).setCellValue("Desde: " + inicio.format(PRETTY_DATE) + " - Hasta: " + fin.format(PRETTY_DATE));
            
            rowIdx++; 

            // 1. RESUMEN
            if (config.isResumen()) {
                double totalVentas = pedidos.stream().mapToDouble(Pedido::getTotal).sum();
                Row resRow1 = sheet.createRow(rowIdx++);
                resRow1.createCell(0).setCellValue("Total Pedidos:");
                resRow1.createCell(1).setCellValue(pedidos.size());
                
                Row resRow2 = sheet.createRow(rowIdx++);
                resRow2.createCell(0).setCellValue("Ingresos Totales:");
                resRow2.createCell(1).setCellValue(totalVentas);
                rowIdx++;
            }

            // 2. DETALLES
            if (config.isDetallados()) {
                Row headerRow = sheet.createRow(rowIdx++);
                String[] headers = {"ID Pedido", "Fecha", "Hora", "Mesero/Cajero", "Servicio", "Estado", "Monto Total"};
                
                CellStyle headerStyle = workbook.createCellStyle();
                Font font = workbook.createFont();
                font.setBold(true);
                headerStyle.setFont(font);

                for (int i = 0; i < headers.length; i++) {
                    Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
                }

                for (Pedido p : pedidos) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(p.getId());
                    row.createCell(1).setCellValue(p.getFechaHora().toLocalDate().toString());
                    row.createCell(2).setCellValue(p.getFechaHora().toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm")));
                    row.createCell(3).setCellValue(p.getUsuario() != null ? p.getUsuario().getUsuario() : "N/A");
                    row.createCell(4).setCellValue(p.getTipoServicio());
                    row.createCell(5).setCellValue(p.getEstado().toString());
                    row.createCell(6).setCellValue(p.getTotal());
                }
                
                for(int i=0; i<headers.length; i++) {
                    sheet.autoSizeColumn(i);
                }
            }

            try (FileOutputStream fileOut = new FileOutputStream(ruta)) {
                workbook.write(fileOut);
            }
        }
    }

    // --- MÉTODOS AUXILIARES ---
    public ReporteResponse obtenerReporteInfo(Long id) {
        Reporte reporte = reporteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado: ID " + id));
        return new ReporteResponse(
            reporte.getId(), reporte.getFechaGeneracion(), reporte.getNumeroRegistros(),
            reporte.getNombreArchivo(), reporte.getTamanoArchivo(), reporte.getTipoArchivo()
        );
    }

    public Resource cargarArchivoComoRecurso(String nombreArchivo) {
        try {
            Reporte reporte = reporteRepository.findByNombreArchivo(nombreArchivo)
                 .orElseThrow(() -> new RuntimeException("Archivo no encontrado en BD."));
            Path rutaArchivo = Paths.get(reporte.getRutaArchivo());
            Resource resource = new UrlResource(rutaArchivo.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                 throw new RuntimeException("No se puede leer el archivo físico.");
            }
        } catch (Exception e) {
             throw new RuntimeException("Error cargando archivo: " + e.getMessage());
        }
    }

    private String formatarTamano(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp-1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }
}