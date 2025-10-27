package com.restaurant.restaurantaplicacion.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "reportes")
public class Reporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombreArchivo; // ej: "reporte_quincenal_2610.pdf"

    @Column(nullable = false)
    private LocalDateTime fechaGeneracion;

    private Long numeroRegistros; // Podría ser Long si son muchos

    private String tamanoArchivo; // ej: "1.8 MB" (o podrías guardarlo en bytes como Long)

    // Podrías añadir más campos, como el tipo (PDF/EXCEL),
    // el usuario que lo generó, la configuración usada, etc.
    private String tipoArchivo; // "PDF" o "EXCEL"

    // Ruta donde se guardó el archivo en el servidor (¡Importante!)
    // Necesitarás decidir dónde guardar los archivos.
    private String rutaArchivo;
}