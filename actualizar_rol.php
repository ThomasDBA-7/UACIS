<?php
header('Content-Type: application/json; charset=utf-8');
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$correoAdmin = $data['correoAdmin'] ?? '';
$idUsuario = $data['idUsuario'] ?? '';
$nuevoRol = $data['rol'] ?? '';

// Verificar permisos de admin (igual que antes, podrías reutilizar la lógica)
$stmt = $pdo->prepare('SELECT rol FROM usuarios WHERE correo = ?');
$stmt->execute([$correoAdmin]);
$admin = $stmt->fetch();
if (!$admin || $admin['rol'] !== 'Administrativo') {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$stmt = $pdo->prepare('UPDATE usuarios SET rol = ? WHERE id = ?');
$stmt->execute([$nuevoRol, $idUsuario]);

echo json_encode(['mensaje' => 'Rol actualizado']);