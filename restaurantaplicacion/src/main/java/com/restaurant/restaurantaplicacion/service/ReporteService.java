package com.restaurant.restaurantaplicacion.service;

import com.restaurant.restaurantaplicacion.dto.GenerarReporteRequest;
import com.restaurant.restaurantaplicacion.dto.ReporteResponse;
import com.restaurant.restaurantaplicacion.model.Pedido;
import com.restaurant.restaurantaplicacion.model.PedidoPlato;
import com.restaurant.restaurantaplicacion.model.Reporte;
import com.restaurant.restaurantaplicacion.repository.PedidoRepository;
import com.restaurant.restaurantaplicacion.repository.ReporteRepository;

// Imports para archivos y fechas
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

// Imports para PDF (iText)
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;

// Imports para Excel (Apache POI)
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

// Imports de Spring
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReporteService {

    @Autowired
    private ReporteRepository reporteRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    @Value("${reportes.directorio:/tmp/reportes}")
    private String directorioReportes;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter FILENAME_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");
    private static final DecimalFormat CURRENCY_FORMAT = new DecimalFormat("S/ #,##0.00");

    @Transactional
    public ReporteResponse generarReporte(GenerarReporteRequest request) throws IOException { // Añadido throws IOException

        // 1. Determinar rango de fechas
        LocalDateTime fechaInicio;
        LocalDateTime fechaFin;
        String periodoDesc = request.getPeriodo();

        switch (request.getPeriodo()) {
            case "diario":
                fechaInicio = LocalDate.now().atStartOfDay();
                fechaFin = LocalDate.now().atTime(LocalTime.MAX);
                break;
            case "quincenal": // Últimos 15 días
                fechaFin = LocalDateTime.now();
                fechaInicio = fechaFin.minusDays(15).with(LocalTime.MIN);
                break;
            case "mensual": // Últimos 30 días
                fechaFin = LocalDateTime.now();
                fechaInicio = fechaFin.minusMonths(1).with(LocalTime.MIN);
                break;
            case "fechaReferencia":
                if (request.getFecha() == null || request.getFecha().isEmpty()) {
                    throw new RuntimeException("Se requiere fecha para el periodo 'fechaReferencia'");
                }
                LocalDate fechaRef = LocalDate.parse(request.getFecha(), DATE_FORMATTER);
                fechaInicio = fechaRef.atStartOfDay();
                fechaFin = fechaRef.atTime(LocalTime.MAX);
                periodoDesc = "fecha_" + request.getFecha();
                break;
            default:
                throw new RuntimeException("Periodo no válido: " + request.getPeriodo());
        }

        // 2. Consultar los pedidos
        // ¡IMPORTANTE! Necesitas crear este método en PedidoRepository.java
        // List<Pedido> pedidos = pedidoRepository.findAll(); // <-- BORRA O COMENTA ESTA LÍNEA
List<Pedido> pedidos = pedidoRepository.findAllByFechaHoraBetween(fechaInicio, fechaFin);//findAllByFechaHoraBetween(fechaInicio, fechaFin);
         if (pedidos.isEmpty()) {
              throw new RuntimeException("No hay datos de pedidos para el periodo seleccionado.");
         }

        // 3. Generar nombre y ruta del archivo
        String timestamp = LocalDateTime.now().format(FILENAME_FORMATTER);
        String nombreArchivo = String.format("reporte_%s_%s.%s",
                periodoDesc, timestamp, request.getArchivo().toLowerCase());
        Path rutaArchivo = Paths.get(directorioReportes, nombreArchivo);

        // Crear directorios si no existen
        Files.createDirectories(rutaArchivo.getParent());

        // 4. Llamar a la función de generación correspondiente
        if ("pdf".equalsIgnoreCase(request.getArchivo())) {
            generarPdf(pedidos, request, rutaArchivo.toString());
        } else if ("excel".equalsIgnoreCase(request.getArchivo())) {
            generarExcel(pedidos, request, rutaArchivo.toString());
        } else {
            throw new RuntimeException("Formato de archivo no soportado: " + request.getArchivo());
        }

        // 5. Calcular tamaño
        long tamanoBytes = Files.size(rutaArchivo);
        String tamanoLegible = formatarTamano(tamanoBytes);

        // 6. Guardar info en BD
        Reporte reporte = new Reporte();
        reporte.setNombreArchivo(nombreArchivo);
        reporte.setFechaGeneracion(LocalDateTime.now());
        reporte.setNumeroRegistros((long) pedidos.size());
        reporte.setTamanoArchivo(tamanoLegible);
        reporte.setTipoArchivo(request.getArchivo().toUpperCase());
        reporte.setRutaArchivo(rutaArchivo.toString());

        Reporte reporteGuardado = reporteRepository.save(reporte);

        // 7. Devolver respuesta
        return new ReporteResponse(
                reporteGuardado.getId(),
                reporteGuardado.getFechaGeneracion(),
                reporteGuardado.getNumeroRegistros(),
                reporteGuardado.getNombreArchivo(),
                reporteGuardado.getTamanoArchivo(),
                reporteGuardado.getTipoArchivo()
        );
    }

    // --- GENERACIÓN DE PDF (Ejemplo Básico) ---
    private void generarPdf(List<Pedido> pedidos, GenerarReporteRequest config, String rutaArchivo) throws IOException {
        PdfWriter writer = new PdfWriter(rutaArchivo);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        document.add(new Paragraph("Reporte de Pedidos - El Sabor de Marcona").setBold().setFontSize(18));
        document.add(new Paragraph("Periodo: " + config.getPeriodo())); // Añadir más detalles de config si se quiere

        // Crear tabla
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 3, 2, 2, 2})).useAllAvailableWidth();
        table.addHeaderCell("ID");
        table.addHeaderCell("Fecha");
        table.addHeaderCell("Usuario");
        table.addHeaderCell("Estado");
        table.addHeaderCell("Total");

        // Llenar tabla con datos de pedidos
        for (Pedido p : pedidos) {
            table.addCell(String.valueOf(p.getId()));
            table.addCell(p.getFechaHora().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            table.addCell(p.getUsuario().getUsuario()); // Asume que Usuario tiene getUsuario()
            table.addCell(p.getEstado().toString());
            table.addCell(CURRENCY_FORMAT.format(p.getTotal()));
        }

        document.add(table);

        // Aquí podrías añadir gráficos, resúmenes, detalles según config.isGraficos(), etc.

        document.close(); // Guarda y cierra el archivo PDF
    }

    // --- GENERACIÓN DE EXCEL (Ejemplo Básico) ---
    private void generarExcel(List<Pedido> pedidos, GenerarReporteRequest config, String rutaArchivo) throws IOException {
        XSSFWorkbook workbook = new XSSFWorkbook();
        XSSFSheet sheet = workbook.createSheet("Pedidos");

        // Crear cabecera
        Row headerRow = sheet.createRow(0);
        String[] headers = {"ID", "Fecha", "Hora", "Usuario", "Estado", "Total", "Detalle"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            // Podrías añadir estilo a la cabecera
        }

        // Llenar filas con datos
        int rowNum = 1;
        for (Pedido p : pedidos) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(p.getId());
            row.createCell(1).setCellValue(p.getFechaHora().format(DateTimeFormatter.ISO_DATE));
            row.createCell(2).setCellValue(p.getFechaHora().format(DateTimeFormatter.ISO_TIME));
            row.createCell(3).setCellValue(p.getUsuario().getUsuario());
            row.createCell(4).setCellValue(p.getEstado().toString());
            row.createCell(5).setCellValue(p.getTotal()); // Excel maneja números directamente

            // Crear una celda con el detalle (ejemplo simple)
            StringBuilder detalle = new StringBuilder();
            if (p.getDetallePlatos() != null) {
                for (PedidoPlato dp : p.getDetallePlatos()) {
                     detalle.append(dp.getCantidad())
                           .append("x ")
                           .append(dp.getPlato().getNombre()) // Asume getNombre() en Plato
                           .append("; ");
                }
            }
            row.createCell(6).setCellValue(detalle.toString());
        }

        // Ajustar ancho de columnas (opcional)
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        // Guardar archivo Excel
        FileOutputStream fileOut = new FileOutputStream(rutaArchivo);
        workbook.write(fileOut);
        fileOut.close();
        workbook.close();
    }

    // --- OBTENER INFO Y CARGAR ARCHIVO (Igual que antes) ---
    public ReporteResponse obtenerReporteInfo(Long id) {
        Reporte reporte = reporteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado: ID " + id));
        return new ReporteResponse(/* ... mapear campos ... */
            reporte.getId(), reporte.getFechaGeneracion(), reporte.getNumeroRegistros(),
            reporte.getNombreArchivo(), reporte.getTamanoArchivo(), reporte.getTipoArchivo()
        );
    }

    public Resource cargarArchivoComoRecurso(String nombreArchivo) {
        try {
            Reporte reporte = reporteRepository.findByNombreArchivo(nombreArchivo)
                 .orElseThrow(() -> new RuntimeException("Archivo no encontrado en BD: " + nombreArchivo));

            Path rutaArchivo = Paths.get(reporte.getRutaArchivo());
            Resource resource = new UrlResource(rutaArchivo.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                 throw new RuntimeException("Archivo no existe o no se puede leer: " + rutaArchivo);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error URL archivo: " + nombreArchivo, e);
        } catch (Exception e) {
             throw new RuntimeException("Error al cargar: " + nombreArchivo, e);
        }
    }

    // --- Función auxiliar para formatear tamaño ---
    private String formatarTamano(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp-1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre).replace(",",".");
    }
}