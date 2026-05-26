<?php
header('Content-Type: application/json; charset=utf-8');
require 'config.php';

// Verificar que quien solicita es administrador (enviado desde el frontend)
$correoAdmin = $_SERVER['HTTP_X_ADMIN_CORREO'] ?? '';
$stmt = $pdo->prepare('SELECT rol FROM usuarios WHERE correo = ?');
$stmt->execute([$correoAdmin]);
$admin = $stmt->fetch();

if (!$admin || $admin['rol'] !== 'Administrativo') {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$stmt = $pdo->query('SELECT id, nombre, correo, rol FROM usuarios ORDER BY id');
$usuarios = $stmt->fetchAll();

echo json_encode($usuarios);