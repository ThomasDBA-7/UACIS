<?php
// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

header('Content-Type: application/json; charset=utf-8');
require 'config.php';

// Parámetros de filtro y orden
$tipo         = $_GET['tipo'] ?? '';
$capacidadMin = intval($_GET['capacidad_min'] ?? 0);
$ordenar      = $_GET['ordenar'] ?? 'nombre';

$tiposValidos  = ['salon','auditorio','laboratorio','cancha','zona_estudio'];
$ordenValidos  = ['nombre','capacidad'];

// Sanitizar
if (!in_array($tipo, $tiposValidos)) $tipo = '';
if (!in_array($ordenar, $ordenValidos)) $ordenar = 'nombre';

$sql    = 'SELECT id, nombre, tipo, capacidad, ubicacion, descripcion, imagen, estado FROM espacios WHERE estado = "activo"';
$params = [];

if (!empty($tipo)) {
    $sql .= ' AND tipo = ?';
    $params[] = $tipo;
}
if ($capacidadMin > 0) {
    $sql .= ' AND capacidad >= ?';
    $params[] = $capacidadMin;
}

$sql .= ' ORDER BY ' . $ordenar . ' ASC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$espacios = $stmt->fetchAll();

echo json_encode(['espacios' => $espacios]);
?>
