<?php
session_start();

// CORS
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Si es una solicitud OPTIONS (preflight), terminar aquí
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

$correo = $data['correo'] ?? '';

if (empty($correo)) {
    http_response_code(400);
    echo json_encode(['error' => 'Correo requerido']);
    exit;
}

// Validar sesión activa
if (empty($_SESSION['usuario_correo'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autenticado. Debes iniciar sesión.']);
    exit;
}

// Validar que el usuario autenticado sea el propietario del perfil
if ($_SESSION['usuario_correo'] !== $correo) {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado. No puedes modificar el perfil de otro usuario.']);
    exit;
}

// Construir consulta dinámica con los campos permitidos
// 'rol' NO está en la lista — no se puede cambiar desde la API
$campos = [
    'tipoDoc',
    'dni',
    'fechaExp',
    'primerNombre',
    'segundoNombre',
    'primerApellido',
    'segundoApellido',
    'sexo',
    'fechaNac',
    'telefono',
    'telefonoAlt',
    'ciudad',
    'direccion',
    'programa',
    'bio',
    'foto',
    'nombre'
];

$set = [];
$valores = [];

// Obtener el DNI actual para respetar la regla de edición única
$stmtCheck = $pdo->prepare('SELECT dni, tipoDoc, fechaExp FROM usuarios WHERE correo = ?');
$stmtCheck->execute([$correo]);
$usuarioActual = $stmtCheck->fetch();

if (!$usuarioActual) {
    http_response_code(404);
    echo json_encode(['error' => 'Usuario no encontrado']);
    exit;
}

$dniActual = trim($usuarioActual['dni'] ?? '');
$dniNuevo = trim($data['dni'] ?? '');

$usuarioYaTieneDni = $dniActual !== '';
$seEnviaDni = array_key_exists('dni', $data) && $dniNuevo !== '';
$quiereCambiarDni = $usuarioYaTieneDni && $seEnviaDni && $dniNuevo !== $dniActual;

if ($quiereCambiarDni) {
    http_response_code(409);
    echo json_encode([
        'error' => 'El número de documento ya fue registrado y no puede modificarse nuevamente.'
    ]);
    exit;
}

foreach ($campos as $campo) {
    if (isset($data[$campo])) {
        // Si ya tiene DNI registrado, no permitir actualizar campos de documento
        if (in_array($campo, ['dni', 'tipoDoc', 'fechaExp']) && $usuarioYaTieneDni) {
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

$valores[] = $correo;

$sql = 'UPDATE usuarios SET ' . implode(', ', $set) . ' WHERE correo = ?';
$stmt = $pdo->prepare($sql);
$stmt->execute($valores);

echo json_encode(['mensaje' => 'Perfil actualizado correctamente']);
?>