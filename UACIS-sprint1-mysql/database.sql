CREATE DATABASE IF NOT EXISTS uacis CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE uacis;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  tipoDoc VARCHAR(10),
  dni VARCHAR(20),
  fechaExp DATE,
  primerNombre VARCHAR(100),
  segundoNombre VARCHAR(100),
  primerApellido VARCHAR(100),
  segundoApellido VARCHAR(100),
  sexo VARCHAR(20),
  fechaNac DATE,
  telefono VARCHAR(20),
  telefonoAlt VARCHAR(20),
  ciudad VARCHAR(100),
  direccion VARCHAR(255),
  rol VARCHAR(50),
  programa VARCHAR(255),
  bio TEXT,
  foto LONGTEXT
);

-- ── ÉPICA 02: Gestión de Espacios ──────────────────────────────
CREATE TABLE IF NOT EXISTS espacios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  tipo ENUM('salon','auditorio','laboratorio','cancha','zona_estudio') NOT NULL,
  capacidad INT NOT NULL,
  ubicacion VARCHAR(255) NOT NULL,
  descripcion TEXT,
  imagen LONGTEXT,
  estado ENUM('activo','inactivo') DEFAULT 'activo',
  creado_por VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla base de reservas (necesaria para mostrar disponibilidad en US-006)
CREATE TABLE IF NOT EXISTS reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  espacio_id INT NOT NULL,
  usuario_correo VARCHAR(255) NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  proposito TEXT,
  estado ENUM('pendiente','aprobada','rechazada','cancelada') DEFAULT 'pendiente',
  motivo_rechazo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (espacio_id) REFERENCES espacios(id) ON DELETE CASCADE
);
