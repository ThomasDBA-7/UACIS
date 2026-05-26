<?php
session_start();

// CORS
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Si es una solicitud OPTIONS (preflight), terminar aquí
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

$correo = $data['correo'] ?? '';
$password = $data['password'] ?? '';

if (empty($correo) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Correo y contraseña son obligatorios']);
    exit;
}

// Buscar usuario por correo
$stmt = $pdo->prepare('SELECT * FROM usuarios WHERE correo = ?');
$stmt->execute([$correo]);
$usuario = $stmt->fetch();

if (!$usuario || !password_verify($password, $usuario['password'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuario o contraseña incorrectos']);
    exit;
}

// Guardar sesión
$_SESSION['usuario_correo'] = $usuario['correo'];
$_SESSION['usuario_id'] = $usuario['id'];
$_SESSION['usuario_rol'] = $usuario['rol'];

// No devolver la contraseña en la respuesta
unset($usuario['password']);

echo json_encode(['usuario' => $usuario]);
?>