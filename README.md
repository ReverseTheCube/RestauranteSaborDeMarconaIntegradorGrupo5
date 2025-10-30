# "El Sabor de Marcona" - Sistema de Gestión de Restaurante

Este repositorio contiene el proyecto final "El Sabor de Marcona" para el curso **Curso Integrador I: Sistemas Software** (Sección: 43118).

El proyecto es un sistema de gestión integral basado en web desarrollado en **Java (Spring Boot)** para el backend y **HTML/CSS/JavaScript** para el frontend.

## 🎯 Problema y Objetivo

### Problema
El restaurante "El Sabor de Marcona" gestiona actualmente sus procesos de forma manual, utilizando cuadernos para registrar ventas y gastos. Esto genera desorden en el control de ventas, pérdidas económicas y limita la capacidad de tomar decisiones informadas.

### Objetivo General
Desarrollar un sistema de gestión integral basado en web que automatice y optimice los procesos administrativos y financieros del restaurante [cite: 291][cite_start], reemplazando los métodos manuales por una solución digital que garantice precisión, accesibilidad y apoyo a la toma de decisiones.

## 🚀 Módulos del Sistema

El sistema está dividido en los siguientes módulos principales, basados en los diagramas BPMN del proyecto :

* **Módulo de Autenticación y Seguridad:**
    * Proceso de Login (con bloqueo de intentos).
    * Gestión de Usuarios (CRUD de empleados/roles).
* **Módulo de Gestión de Menú:**
    * Proceso de gestión y actualización de menús (CRUD de Platos).
* **Módulo de Pedidos y Ventas:**
    * Proceso de Gestión de Pedidos (Cajero/Mesero).
    * Proceso de Pedidos Registrados (Buscar, Modificar).
* **Módulo de Clientes y Pensiones:**
    * Gestión de Clientes (CRUD).
    * Gestión de Pensiones y Empresas.
* **Módulo de Ventas e Historial:**
    * Historial de ventas y generación de reportes.
* **Módulo de Incidencias:**
    * Registro y gestión de incidencias.

## 📋 Alcance del Proyecto

Este sistema busca automatizar los procesos de caja y pedidos. Las funciones implementadas incluyen:

* Registro y segmentación de pedidos (local, delivery).
* Generación de reportes de ventas diarios.
* Cuadre automático de caja.
* Control de gastos operativos.
* Interfaz de usuario intuitiva y sencilla, diseñada para usuarios con bajo nivel tecnológico.

## ⚠️ Limitaciones

Es importante notar las limitaciones actuales del sistema, documentadas en el informe :

* **Infraestructura:** Se implementa con la infraestructura disponible en el restaurante.
* **Compatibilidad:** Optimizado únicamente para navegadores basados en Google Chrome.
* **Datos:** La información se gestiona de manera local, no se contempla sincronización con la nube.
* **Pagos:** No incluye pasarelas de pago electrónico (solo registro de ventas presenciales).
* **Delivery:** No implementa GPS; la función de delivery se limita a un cargo adicional en el pedido.

## 🛠️ Tecnologías Utilizadas

### Backend
* **Java (JDK 21)** 
* **Spring Boot:** Framework principal para la API REST.
* **Spring Data JPA (Hibernate):** Para la conexión con la base de datos y creación automática de tablas.
* **Spring Security:** Para la autenticación (login) y autorización (roles).
* **Lombok:** Para reducir código repetitivo en los modelos.

### Base de Datos
* **MySQL:** Gestor de base de datos relacional.

### Frontend
* **HTML5:** Estructura de las vistas.
* **CSS3:** Diseño y estilos (basado en prototipos de Figma).
* **JavaScript (Vanilla):** Para la lógica del cliente (login, CRUDs) y consumo de la API REST (fetch).

### Herramientas de Gestión y Modelado
* **Eclipse IDE** 
* **Git y GitHub:** Control de versiones.
* **Bizagi:** Modelado de procesos (BPMN).
* **StarUML:** Diagramas de Casos de Uso, Clases y Secuencias.

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
    * Abre tu navegador (preferiblemente Google Chrome) y ve a:
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

* **Chirinos Mercado, Edgard Rafael** (U21206012)
* **Choque Alfaro, Jhonatan Jeanpierre** (U23256844) 
* **Sanchez Prieto, Victor Salvador** (U1627485) 
* **Quicaña Taboada, Andre Sebastian** (U222330322) 
