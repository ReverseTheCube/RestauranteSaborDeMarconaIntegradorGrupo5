# "El Sabor de Marcona" - Sistema de Gestión de Restaurante

[cite_start]![](https://i.imgur.com/your-image-url.png) Este repositorio contiene el proyecto final "El Sabor de Marcona" [cite: 179] [cite_start]para el curso **Curso Integrador I: Sistemas Software** (Sección: 43118)[cite: 177, 183].

[cite_start]El proyecto es un sistema de gestión integral basado en web [cite: 291] desarrollado en **Java (Spring Boot)** para el backend y **HTML/CSS/JavaScript** para el frontend.

## 🎯 Problema y Objetivo

### Problema
[cite_start]El restaurante "El Sabor de Marcona" gestiona actualmente sus procesos de forma manual, utilizando cuadernos para registrar ventas y gastos[cite: 353]. [cite_start]Esto genera desorden en el control de ventas, pérdidas económicas [cite: 263, 358] [cite_start]y limita la capacidad de tomar decisiones informadas[cite: 263, 360].

### Objetivo General
[cite_start]Desarrollar un sistema de gestión integral basado en web que automatice y optimice los procesos administrativos y financieros del restaurante [cite: 291][cite_start], reemplazando los métodos manuales por una solución digital que garantice precisión, accesibilidad y apoyo a la toma de decisiones[cite: 291].

## 🚀 Módulos del Sistema

[cite_start]El sistema está dividido en los siguientes módulos principales, basados en los diagramas BPMN del proyecto [cite: 446-457]:

* **Módulo de Autenticación y Seguridad:**
    * [cite_start]Proceso de Login (con bloqueo de intentos)[cite: 447].
    * [cite_start]Gestión de Usuarios (CRUD de empleados/roles)[cite: 448].
* **Módulo de Gestión de Menú:**
    * [cite_start]Proceso de gestión y actualización de menús (CRUD de Platos)[cite: 449].
* **Módulo de Pedidos y Ventas:**
    * [cite_start]Proceso de Gestión de Pedidos (Cajero/Mesero)[cite: 450].
    * [cite_start]Proceso de Pedidos Registrados (Buscar, Modificar)[cite: 451].
* **Módulo de Clientes y Pensiones:**
    * [cite_start]Gestión de Clientes (CRUD)[cite: 452].
    * [cite_start]Gestión de Pensiones y Empresas[cite: 454, 455].
* **Módulo de Ventas e Historial:**
    * [cite_start]Historial de ventas y generación de reportes[cite: 456].
* **Módulo de Incidencias:**
    * [cite_start]Registro y gestión de incidencias[cite: 457].

## 📋 Alcance del Proyecto

[cite_start]Este sistema busca automatizar los procesos de caja y pedidos[cite: 343]. Las funciones implementadas incluyen:

* [cite_start]Registro y segmentación de pedidos (local, delivery)[cite: 344].
* [cite_start]Generación de reportes de ventas diarios[cite: 344].
* [cite_start]Cuadre automático de caja[cite: 344].
* [cite_start]Control de gastos operativos[cite: 344].
* [cite_start]Interfaz de usuario intuitiva y sencilla, diseñada para usuarios con bajo nivel tecnológico[cite: 345].

## ⚠️ Limitaciones

[cite_start]Es importante notar las limitaciones actuales del sistema, documentadas en el informe [cite: 347-351]:

* [cite_start]**Infraestructura:** Se implementa con la infraestructura disponible en el restaurante[cite: 347].
* [cite_start]**Compatibilidad:** Optimizado únicamente para navegadores basados en Google Chrome[cite: 348].
* [cite_start]**Datos:** La información se gestiona de manera local, no se contempla sincronización con la nube[cite: 349].
* [cite_start]**Pagos:** No incluye pasarelas de pago electrónico (solo registro de ventas presenciales)[cite: 350].
* [cite_start]**Delivery:** No implementa GPS; la función de delivery se limita a un cargo adicional en el pedido[cite: 351].

## 🛠️ Tecnologías Utilizadas

### Backend
* [cite_start]**Java (JDK 21)** [cite: 405]
* **Spring Boot:** Framework principal para la API REST.
* **Spring Data JPA (Hibernate):** Para la conexión con la base de datos y creación automática de tablas.
* **Spring Security:** Para la autenticación (login) y autorización (roles).
* **Lombok:** Para reducir código repetitivo en los modelos.

### Base de Datos
* [cite_start]**MySQL:** Gestor de base de datos relacional[cite: 410].

### Frontend
* **HTML5:** Estructura de las vistas.
* **CSS3:** Diseño y estilos (basado en prototipos de Figma).
* **JavaScript (Vanilla):** Para la lógica del cliente (login, CRUDs) y consumo de la API REST (fetch).

### Herramientas de Gestión y Modelado
* [cite_start]**Eclipse IDE** [cite: 420]
* **Git y GitHub:** Control de versiones.
* [cite_start]**Bizagi:** Modelado de procesos (BPMN)[cite: 434].
* [cite_start]**StarUML:** Diagramas de Casos de Uso, Clases y Secuencias[cite: 437].

## 🚀 Cómo Empezar

Sigue estos pasos para ejecutar el proyecto en tu máquina local:

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/RestauranteSaborDeMarconaIntegradorGrupo5.git](https://github.com/tu-usuario/RestauranteSaborDeMarconaIntegradorGrupo5.git)
    cd restauranteaplicacion
    ```

2.  **Configurar la Base de Datos:**
    * Asegúrate de tener MySQL instalado y corriendo.
    * Abre el archivo `src/main/resources/application.properties`.
    * Modifica las siguientes líneas con tu usuario y contraseña de MySQL:
        ```properties
        spring.datasource.url=jdbc:mysql://localhost:3306/restaurantsabormarcona_db?createDatabaseIfNotExist=true
        spring.datasource.username=root
        spring.datasource.password=tu_contraseña_de_mysql
        ```
    * **Nota:** Spring Boot (Hibernate) creará automáticamente la base de datos `restaurantsabormarcona_db` y sus tablas si no existen.

3.  **Ejecutar el Backend:**
    * Abre el proyecto en tu IDE (Eclipse, IntelliJ, VSCode).
    * Ejecuta la clase principal `RestaurantaplicacionApplication.java`.
    * El servidor se iniciará en `http://localhost:8080`.

4.  **Acceder a la Aplicación:**
    * [cite_start]Abre tu navegador (preferiblemente Google Chrome [cite: 348]) y ve a:
    * `http://localhost:8080/`

5.  **Usuario por Defecto:**
    * Puedes crear el usuario administrador usando la API (con Postman) o insertándolo directamente en tu MySQL.
    * **Usuario:** `admin`
    * **Contraseña:** `admin123`
    * **SQL (Si lo haces manual):**
        ```sql
        INSERT INTO usuarios (usuario, contrasena, rol, intentos_fallidos, cuenta_bloqueada) 
        VALUES ('admin', '$2a$10$A.A.0t/1Mv..yV.U2.lV7u.k/e.d.w.c.s.S.n.G.i.O.u.A.i.G', 'ADMINISTRADOR', 0, 0);
        ```

## 👨‍💻 Integrantes del Equipo

* [cite_start]**Chirinos Mercado, Edgard Rafael** (U21206012) [cite: 185]
* [cite_start]**Choque Alfaro, Jhonatan Jeanpierre** (U23256844) [cite: 186]
* [cite_start]**Sanchez Prieto, Victor Salvador** (U1627485) [cite: 187]
* [cite_start]**Quicaña Taboada, Andre Sebastian** (U222330322) [cite: 188]
