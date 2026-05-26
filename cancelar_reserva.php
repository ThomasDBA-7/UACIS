<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
header('Content-Type: application/json; charset=utf-8');
require 'config.php';

$data       = json_decode(file_get_contents('php://input'), true);
$id         = intval($data['id']     ?? 0);
$correo     = trim($data['correo']   ?? '');

if (!$id || !$correo) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

// Solo puede cancelar el dueño y solo si está pendiente
$stmt = $pdo->prepare('SELECT id, estado FROM reservas WHERE id = ? AND usuario_correo = ?');
$stmt->execute([$id, $correo]);
$reserva = $stmt->fetch();

if (!$reserva) {
    http_response_code(404);
    echo json_encode(['error' => 'Reserva no encontrada']);
    exit;
}
if ($reserva['estado'] !== 'pendiente') {
    http_response_code(400);
    echo json_encode(['error' => 'Solo se pueden cancelar reservas en estado pendiente']);
    exit;
}

$stmt = $pdo->prepare('UPDATE reservas SET estado = "cancelada" WHERE id = ?');
$stmt->execute([$id]);

echo json_encode(['mensaje' => 'Reserva cancelada correctamente']);
?>
