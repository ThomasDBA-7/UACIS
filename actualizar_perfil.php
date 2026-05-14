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

$correo = $data['correo'] ?? ''; // Identificador del usuario

if (empty($correo)) {
    http_response_code(400);
    echo json_encode(['error' => 'Correo requerido']);
    exit;
}

// Construir consulta dinámica con los campos permitidos
// 'rol' NO está en la lista — no se puede cambiar desde la API
$campos = ['tipoDoc','dni','fechaExp','primerNombre','segundoNombre','primerApellido','segundoApellido','sexo','fechaNac','telefono','telefonoAlt','ciudad','direccion','programa','bio','foto','nombre'];
$set = [];
$valores = [];

// Obtener el DNI actual para respetar la regla de edición única
$stmtCheck = $pdo->prepare('SELECT dni FROM usuarios WHERE correo = ?');
$stmtCheck->execute([$correo]);
$usuarioActual = $stmtCheck->fetch();

foreach ($campos as $campo) {
    if (isset($data[$campo])) {
        // Si ya tiene DNI registrado, ignorar los campos de documento
        if (in_array($campo, ['dni','tipoDoc','fechaExp']) && !empty($usuarioActual['dni'])) {
            continue;
        }
        $set[] = "$campo = ?";
        $valores[] = $data[$campo];
    }
}
if (empty($set)) {
    http_response_code(400);
    echo json_encode(['error' => 'No hay campos para actualizar']);
    exit;
}
$valores[] = $correo; // para el WHERE

$sql = 'UPDATE usuarios SET ' . implode(', ', $set) . ' WHERE correo = ?';
$stmt = $pdo->prepare($sql);
$stmt->execute($valores);

echo json_encode(['mensaje' => 'Perfil actualizado correctamente']);
?>