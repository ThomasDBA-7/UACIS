<?php
// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Si es una solicitud OPTIONS (preflight), terminar aquí
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

$nombre = $data['nombre'] ?? '';
$correo = $data['correo'] ?? '';
$password = $data['password'] ?? '';

// Validaciones básicas
if (empty($nombre) || empty($correo) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Todos los campos son obligatorios']);
    exit;
}

if (!str_ends_with($correo, '@pascualbravo.edu.co')) {
    http_response_code(400);
    echo json_encode(['error' => 'El correo debe ser @pascualbravo.edu.co']);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'La contraseña debe tener al menos 6 caracteres']);
    exit;
}

// Verificar si el correo ya existe
$stmt = $pdo->prepare('SELECT id FROM usuarios WHERE correo = ?');
$stmt->execute([$correo]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Este correo ya se encuentra registrado']);
    exit;
}

// Encriptar contraseña
$hashed = password_hash($password, PASSWORD_DEFAULT);

// Insertar usuario
$stmt = $pdo->prepare('INSERT INTO usuarios (nombre, correo, password) VALUES (?, ?, ?)');
$stmt->execute([$nombre, $correo, $hashed]);

echo json_encode(['mensaje' => 'Cuenta creada con éxito']);
?>