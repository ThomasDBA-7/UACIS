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