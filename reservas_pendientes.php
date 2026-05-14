<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
header('Content-Type: application/json; charset=utf-8');
require 'config.php';

$correo_admin = trim($_GET['correo_admin'] ?? '');
$filtro_estado = trim($_GET['estado'] ?? 'pendiente');

if (!$correo_admin) {
    http_response_code(400);
    echo json_encode(['error' => 'Correo requerido']);
    exit;
}

// Verificar rol
$stmt = $pdo->prepare('SELECT rol FROM usuarios WHERE correo = ?');
$stmt->execute([$correo_admin]);
$admin = $stmt->fetch();
if (!$admin || $admin['rol'] !== 'Administrativo') {
    http_response_code(403);
    echo json_encode(['error' => 'Acceso denegado']);
    exit;
}

$estadosValidos = ['pendiente','aprobada','rechazada'];
if (!in_array($filtro_estado, $estadosValidos)) $filtro_estado = 'pendiente';

$stmt = $pdo->prepare(
    'SELECT r.id, r.fecha, r.hora_inicio, r.hora_fin, r.proposito, r.estado, r.motivo_rechazo, r.created_at,
            r.usuario_correo,
            e.nombre AS espacio_nombre, e.tipo AS espacio_tipo, e.ubicacion AS espacio_ubicacion,
            u.nombre AS usuario_nombre, u.primerNombre, u.primerApellido
     FROM reservas r
     JOIN espacios e ON e.id = r.espacio_id
     LEFT JOIN usuarios u ON u.correo = r.usuario_correo
     WHERE r.estado = ?
     ORDER BY r.fecha ASC, r.hora_inicio ASC'
);
$stmt->execute([$filtro_estado]);
$reservas = $stmt->fetchAll();

echo json_encode(['reservas' => $reservas]);
?>
