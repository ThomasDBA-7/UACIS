<?php
header('Content-Type: application/json; charset=utf-8');
require 'config.php';

$correo = 'admin@pascualbravo.edu.co';
$passwordPlano = 'admin123';
$passwordHash = password_hash($passwordPlano, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("
    UPDATE usuarios
    SET password = ?, rol = 'admin'
    WHERE correo = ?
");

$stmt->execute([$passwordHash, $correo]);

if ($stmt->rowCount() > 0) {
    echo json_encode([
        'mensaje' => 'Admin actualizado correctamente',
        'correo' => $correo,
        'password' => $passwordPlano
    ]);
} else {
    echo json_encode([
        'error' => 'No se encontró el usuario admin. Revisa que exista en la base de datos.'
    ]);
}
?>