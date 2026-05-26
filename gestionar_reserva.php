<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
header('Content-Type: application/json; charset=utf-8');
require 'config.php';

$data           = json_decode(file_get_contents('php://input'), true);
$id             = intval($data['id']             ?? 0);
$correo_admin   = trim($data['correo_admin']     ?? '');
$accion         = trim($data['accion']           ?? ''); // "aprobar" | "rechazar"
$motivo         = trim($data['motivo']           ?? '');

if (!$id || !$correo_admin || !in_array($accion, ['aprobar','rechazar'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos o acción inválida']);
    exit;
}

// Verificar que quien actúa es Administrativo
$stmt = $pdo->prepare('SELECT rol FROM usuarios WHERE correo = ?');
$stmt->execute([$correo_admin]);
$admin = $stmt->fetch();
if (!$admin || $admin['rol'] !== 'Administrativo') {
    http_response_code(403);
    echo json_encode(['error' => 'Solo los administradores pueden gestionar reservas']);
    exit;
}

// Verificar que la reserva existe y está pendiente
$stmt = $pdo->prepare('SELECT id, estado FROM reservas WHERE id = ?');
$stmt->execute([$id]);
$reserva = $stmt->fetch();
if (!$reserva) {
    http_response_code(404);
    echo json_encode(['error' => 'Reserva no encontrada']);
    exit;
}
if ($reserva['estado'] !== 'pendiente') {
    http_response_code(400);
    echo json_encode(['error' => 'Solo se pueden gestionar reservas en estado pendiente']);
    exit;
}

$nuevoEstado = $accion === 'aprobar' ? 'aprobada' : 'rechazada';
$stmt = $pdo->prepare('UPDATE reservas SET estado = ?, motivo_rechazo = ? WHERE id = ?');
$stmt->execute([$nuevoEstado, $motivo ?: null, $id]);

echo json_encode(['mensaje' => "Reserva $nuevoEstado correctamente"]);
?>
