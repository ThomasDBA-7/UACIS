<?php
// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

header('Content-Type: application/json; charset=utf-8');
require 'config.php';

$id = intval($_GET['id'] ?? 0);

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID de espacio inválido']);
    exit;
}

// Datos del espacio
$stmt = $pdo->prepare('SELECT * FROM espacios WHERE id = ? AND estado = "activo"');
$stmt->execute([$id]);
$espacio = $stmt->fetch();

if (!$espacio) {
    http_response_code(404);
    echo json_encode(['error' => 'Espacio no encontrado']);
    exit;
}

// Disponibilidad: reservas aprobadas o pendientes de los próximos 7 días
$hoy   = date('Y-m-d');
$fin7  = date('Y-m-d', strtotime('+6 days'));

$stmt = $pdo->prepare(
    'SELECT fecha, hora_inicio, hora_fin, estado
     FROM reservas
     WHERE espacio_id = ?
       AND fecha BETWEEN ? AND ?
       AND estado IN ("pendiente","aprobada")
     ORDER BY fecha ASC, hora_inicio ASC'
);
$stmt->execute([$id, $hoy, $fin7]);
$reservas = $stmt->fetchAll();

// Agrupar reservas por fecha para facilitar el renderizado en el frontend
$disponibilidad = [];
for ($i = 0; $i < 7; $i++) {
    $fecha = date('Y-m-d', strtotime("+$i days"));
    $disponibilidad[$fecha] = [];
}
foreach ($reservas as $r) {
    $disponibilidad[$r['fecha']][] = [
        'hora_inicio' => $r['hora_inicio'],
        'hora_fin'    => $r['hora_fin'],
        'estado'      => $r['estado']
    ];
}

echo json_encode([
    'espacio'       => $espacio,
    'disponibilidad' => $disponibilidad
]);
?>
