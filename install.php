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

    echo "<h2>Todo listo</h2>";
    echo "<p>La base de datos <strong>uacis</strong> y la tabla <strong>usuarios</strong> se han creado correctamente.</p>";
    echo "<p>Ya puedes usar la aplicacion: <a href='./index.html'>Ir al login</a></p>";

} catch (PDOException $e) {
    die("<h2>Error</h2><p>No se pudo conectar a MySQL: " . $e->getMessage() . "</p><p>Asegurate de que XAMPP este corriendo (Apache y MySQL).</p>");
}
?>