<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
header('Content-Type: application/json; charset=utf-8');
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

$correo      = trim($data['correo']      ?? '');
$espacio_id  = intval($data['espacio_id'] ?? 0);
$fecha       = trim($data['fecha']       ?? '');
$hora_inicio = trim($data['hora_inicio'] ?? '');
$hora_fin    = trim($data['hora_fin']    ?? '');
$proposito   = trim($data['proposito']   ?? '');

// Validaciones básicas
if (!$correo || !$espacio_id || !$fecha || !$hora_inicio || !$hora_fin) {
    http_response_code(400);
    echo json_encode(['error' => 'Todos los campos obligatorios deben completarse']);
    exit;
}

// Fecha no anterior a hoy
if ($fecha < date('Y-m-d')) {
    http_response_code(400);
    echo json_encode(['error' => 'La fecha no puede ser anterior a hoy']);
    exit;
}

// Hora inicio < hora fin
if ($hora_inicio >= $hora_fin) {
    http_response_code(400);
    echo json_encode(['error' => 'La hora de inicio debe ser menor a la hora de fin']);
    exit;
}

// Duración entre 30 min y 4 horas
$inicio_ts = strtotime("1970-01-01 $hora_inicio");
$fin_ts    = strtotime("1970-01-01 $hora_fin");
$duracion  = ($fin_ts - $inicio_ts) / 60; // en minutos

if ($duracion < 30) {
    http_response_code(400);
    echo json_encode(['error' => 'La duración mínima de la reserva es 30 minutos']);
    exit;
}
if ($duracion > 240) {
    http_response_code(400);
    echo json_encode(['error' => 'La duración máxima de la reserva es 4 horas']);
    exit;
}

// Verificar que el espacio existe y está activo
$stmt = $pdo->prepare('SELECT id, nombre FROM espacios WHERE id = ? AND estado = "activo"');
$stmt->execute([$espacio_id]);
$espacio = $stmt->fetch();
if (!$espacio) {
    http_response_code(404);
    echo json_encode(['error' => 'El espacio no existe o no está disponible']);
    exit;
}

// Verificar disponibilidad: no debe haber traslape con reservas pendientes o aprobadas
$stmt = $pdo->prepare(
    'SELECT id FROM reservas
     WHERE espacio_id = ?
       AND fecha = ?
       AND estado IN ("pendiente","aprobada")
       AND hora_inicio < ?
       AND hora_fin > ?'
);
$stmt->execute([$espacio_id, $fecha, $hora_fin, $hora_inicio]);
$conflicto = $stmt->fetch();

if ($conflicto) {
    // Buscar alternativas: siguiente bloque disponible ese día
    $stmt2 = $pdo->prepare(
        'SELECT hora_fin FROM reservas
         WHERE espacio_id = ? AND fecha = ? AND estado IN ("pendiente","aprobada")
         ORDER BY hora_fin DESC LIMIT 1'
    );
    $stmt2->execute([$espacio_id, $fecha]);
    $ultima = $stmt2->fetchColumn();
    $alternativa = $ultima ? "El primer horario libre ese día sería desde las $ultima." : '';

    http_response_code(409);
    echo json_encode([
        'error'       => 'El espacio ya está reservado en ese horario.',
        'alternativa' => $alternativa
    ]);
    exit;
}

// Crear la reserva
$stmt = $pdo->prepare(
    'INSERT INTO reservas (espacio_id, usuario_correo, fecha, hora_inicio, hora_fin, proposito, estado)
     VALUES (?, ?, ?, ?, ?, ?, "pendiente")'
);
$stmt->execute([$espacio_id, $correo, $fecha, $hora_inicio, $hora_fin, $proposito]);

echo json_encode([
    'mensaje'     => 'Reserva creada correctamente. Queda pendiente de aprobación.',
    'id'          => $pdo->lastInsertId(),
    'espacio'     => $espacio['nombre']
]);
?>
