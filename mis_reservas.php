<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
header('Content-Type: application/json; charset=utf-8');
require 'config.php';

$correo = trim($_GET['correo'] ?? '');
if (!$correo) {
    http_response_code(400);
    echo json_encode(['error' => 'Correo requerido']);
    exit;
}

$hoy = date('Y-m-d');

// Próximas reservas: fecha >= hoy y no canceladas/rechazadas
$stmt = $pdo->prepare(
    'SELECT r.id, r.fecha, r.hora_inicio, r.hora_fin, r.proposito, r.estado, r.created_at,
            e.nombre AS espacio_nombre, e.tipo AS espacio_tipo, e.ubicacion AS espacio_ubicacion
     FROM reservas r
     JOIN espacios e ON e.id = r.espacio_id
     WHERE r.usuario_correo = ?
       AND r.fecha >= ?
       AND r.estado NOT IN ("cancelada","rechazada")
     ORDER BY r.fecha ASC, r.hora_inicio ASC'
);
$stmt->execute([$correo, $hoy]);
$proximas = $stmt->fetchAll();

// Historial: fecha < hoy O estado cancelada/rechazada
$stmt = $pdo->prepare(
    'SELECT r.id, r.fecha, r.hora_inicio, r.hora_fin, r.proposito, r.estado, r.motivo_rechazo, r.created_at,
            e.nombre AS espacio_nombre, e.tipo AS espacio_tipo, e.ubicacion AS espacio_ubicacion
     FROM reservas r
     JOIN espacios e ON e.id = r.espacio_id
     WHERE r.usuario_correo = ?
       AND (r.fecha < ? OR r.estado IN ("cancelada","rechazada"))
     ORDER BY r.fecha DESC, r.hora_inicio DESC'
);
$stmt->execute([$correo, $hoy]);
$historial = $stmt->fetchAll();

echo json_encode(['proximas' => $proximas, 'historial' => $historial]);
?>
