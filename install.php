<?php
$host = 'localhost';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->exec("CREATE DATABASE IF NOT EXISTS uacis CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci");
    $pdo->exec("USE uacis");

    $pdo->exec("CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        correo VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        tipoDoc VARCHAR(10),
        dni VARCHAR(20),
        fechaExp DATE,
        primerNombre VARCHAR(100),
        segundoNombre VARCHAR(100),
        primerApellido VARCHAR(100),
        segundoApellido VARCHAR(100),
        sexo VARCHAR(20),
        fechaNac DATE,
        telefono VARCHAR(20),
        telefonoAlt VARCHAR(20),
        ciudad VARCHAR(100),
        direccion VARCHAR(255),
        rol VARCHAR(50),
        programa VARCHAR(255),
        bio TEXT,
        foto LONGTEXT
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS espacios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        tipo ENUM('salon','auditorio','laboratorio','cancha','zona_estudio') NOT NULL,
        capacidad INT NOT NULL,
        ubicacion VARCHAR(255) NOT NULL,
        descripcion TEXT,
        imagen LONGTEXT,
        estado ENUM('activo','inactivo') DEFAULT 'activo',
        creado_por VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS reservas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        espacio_id INT NOT NULL,
        usuario_correo VARCHAR(255) NOT NULL,
        fecha DATE NOT NULL,
        hora_inicio TIME NOT NULL,
        hora_fin TIME NOT NULL,
        proposito TEXT,
        estado ENUM('pendiente','aprobada','rechazada','cancelada') DEFAULT 'pendiente',
        motivo_rechazo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (espacio_id) REFERENCES espacios(id) ON DELETE CASCADE
    )");

    echo "<h2>✅ Todo listo</h2>";
    echo "<p>Base de datos <strong>uacis</strong> y tablas <strong>usuarios</strong>, <strong>espacios</strong> y <strong>reservas</strong> creadas correctamente.</p>";
    echo "<p><a href='./index.html'>→ Ir al login</a></p>";

} catch (PDOException $e) {
    die("<h2>Error</h2><p>No se pudo conectar a MySQL: " . $e->getMessage() . "</p><p>Asegúrate de que XAMPP esté corriendo (Apache y MySQL).</p>");
}
?>
