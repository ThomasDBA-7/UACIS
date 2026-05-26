<?php
session_start();

header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
require 'config.php';

if (empty($_SESSION['usuario_correo'])) {
    http_response_code(401);
    echo json_encode([
        'error' => 'No autenticado',
        'debug_session' => $_SESSION
    ]);
    exit;
}

$correo = $_SESSION['usuario_correo'];

$stmt = $pdo->prepare("
    SELECT 
        r.id,
        r.fecha,
        r.hora_inicio,
        r.hora_fin,
        r.estado,
        r.proposito,
        e.nombre AS espacio_nombre,
        e.tipo AS espacio_tipo,
        e.ubicacion AS espacio_ubicacion
    FROM reservas r
    INNER JOIN espacios e ON e.id = r.espacio_id
    WHERE r.usuario_correo = ?
      AND r.estado IN ('pendiente', 'aprobada')
      AND TIMESTAMP(r.fecha, r.hora_inicio) >= NOW()
    ORDER BY r.fecha ASC, r.hora_inicio ASC
    LIMIT 1
");

$stmt->execute([$correo]);
$reserva = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode([
    'correo_sesion' => $correo,
    'recordatorios' => $reserva ? [$reserva] : []
]);
?>