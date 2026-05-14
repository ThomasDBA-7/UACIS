<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

header('Content-Type: application/json; charset=utf-8');
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

$correo = $data['correo'] ?? '';

if (empty($correo)) {
    http_response_code(400);
    echo json_encode(['error' => 'Correo requerido para identificar al usuario']);
    exit;
}

// Verificar que el usuario existe y tiene rol Administrativo
$stmt = $pdo->prepare('SELECT rol FROM usuarios WHERE correo = ?');
$stmt->execute([$correo]);
$usuario = $stmt->fetch();

if (!$usuario) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuario no encontrado']);
    exit;
}

if ($usuario['rol'] !== 'Administrativo') {
    http_response_code(403);
    echo json_encode(['error' => 'Solo los administradores pueden crear espacios']);
    exit;
}

// Validar campos obligatorios
$nombre     = trim($data['nombre'] ?? '');
$tipo       = trim($data['tipo'] ?? '');
$capacidad  = intval($data['capacidad'] ?? 0);
$ubicacion  = trim($data['ubicacion'] ?? '');
$descripcion = trim($data['descripcion'] ?? '');
$imagen     = $data['imagen'] ?? null;

$tiposValidos = ['salon','auditorio','laboratorio','cancha','zona_estudio'];

if (empty($nombre)) {
    http_response_code(400);
    echo json_encode(['error' => 'El nombre del espacio es obligatorio']);
    exit;
}
if (!in_array($tipo, $tiposValidos)) {
    http_response_code(400);
    echo json_encode(['error' => 'Tipo de espacio no válido']);
    exit;
}
if ($capacidad <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'La capacidad debe ser un número positivo']);
    exit;
}
if (empty($ubicacion)) {
    http_response_code(400);
    echo json_encode(['error' => 'La ubicación es obligatoria']);
    exit;
}

$stmt = $pdo->prepare('INSERT INTO espacios (nombre, tipo, capacidad, ubicacion, descripcion, imagen, estado)
                       VALUES (?, ?, ?, ?, ?, ?, "activo")');
$stmt->execute([$nombre, $tipo, $capacidad, $ubicacion, $descripcion, $imagen]);

$nuevoId = $pdo->lastInsertId();

echo json_encode(['mensaje' => 'Espacio creado correctamente', 'id' => $nuevoId]);
?>
