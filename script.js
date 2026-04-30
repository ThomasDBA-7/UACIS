
/* ══════════════════════════════
   ESTADO GLOBAL
══════════════════════════════ */
// Base de datos de usuarios registrados: { correo: { password, nombre, ... } }
let usuariosDB = {};

// Usuario actualmente autenticado
let usuarioActual = null;

// Paso actual en edición de perfil
let stepActual = 1;

/* ══════════════════════════════
   LOGIN
══════════════════════════════ */
document.getElementById('togglePassword').addEventListener('click', function () {
  const inp = document.getElementById('passwordInput');
  const ico = this.querySelector('i');
  inp.type = inp.type === 'password' ? 'text' : 'password';
  ico.className = inp.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
});

['passwordInput','usernameInput'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });
});

function doLogin() {
  const correoInput = document.getElementById('usernameInput').value.trim().toLowerCase();
  const passInput   = document.getElementById('passwordInput').value;
  const err         = document.getElementById('loginError');
  const errMsg      = document.getElementById('loginErrorMsg');

  if (!correoInput || !passInput) {
    errMsg.textContent = 'Por favor completa todos los campos.';
    err.classList.remove('hidden');
    return;
  }

  const usuario = usuariosDB[correoInput];
  if (!usuario) {
    errMsg.textContent = 'No existe una cuenta con ese correo.';
    err.classList.remove('hidden');
    return;
  }

  if (usuario.password !== passInput) {
    errMsg.textContent = 'Contraseña incorrecta.';
    err.classList.remove('hidden');
    return;
  }

  err.classList.add('hidden');
  usuarioActual = correoInput;
  iniciarDashboard();
}

function iniciarDashboard() {
  document.getElementById('app-login').classList.add('hidden');
  const dash = document.getElementById('app-dashboard');
  dash.classList.remove('hidden');
  dash.classList.add('flex');

  actualizarUI();
  mostrarSeccion('inicio');
  lucide.createIcons();
}

// Refresca toda la UI con los datos del usuario actual
function actualizarUI() {
  const u = usuariosDB[usuarioActual];
  if (!u) return;

  const nombreMostrar = construirNombreCompleto(u) || u.nombre || extraerNombre(usuarioActual);
  const inicial = nombreMostrar.charAt(0).toUpperCase();
  const correo  = usuarioActual;

  // Sidebar / avatar
  document.getElementById('miniNombre').textContent    = nombreMostrar;
  document.getElementById('avatarMini').textContent    = inicial;
  document.getElementById('avatarGrande').textContent  = inicial;
  document.getElementById('previewAvatar').textContent = inicial;

  // Welcome
  document.getElementById('welcomeMsg').textContent = `¡Bienvenido, ${nombreMostrar.split(' ')[0]}!`;

  // Vista perfil
  document.getElementById('nombreCompleto').textContent = nombreMostrar;
  document.getElementById('perfilCorreo').textContent   = correo;
  document.getElementById('vistaDni').textContent       = u.dni || '–';
  document.getElementById('vistaTelefono').textContent  = u.telefono || '–';
  document.getElementById('vistaFechaNac').textContent  = u.fechaNac || '–';
  document.getElementById('vistaSexo').textContent      = u.sexo || '–';
  document.getElementById('vistaCiudad').textContent    = u.ciudad || '–';

  // Si hay foto
  if (u.foto) {
    ['avatarMini','avatarGrande','previewAvatar'].forEach(id => {
      const el = document.getElementById(id);
      el.style.backgroundImage = `url(${u.foto})`;
      el.style.backgroundSize  = 'cover';
      el.style.backgroundPosition = 'center';
      el.textContent = '';
    });
  }
}

function construirNombreCompleto(u) {
  const partes = [u.primerNombre, u.segundoNombre, u.primerApellido, u.segundoApellido]
    .filter(Boolean).join(' ');
  return partes || u.nombre || '';
}

function extraerNombre(correo) {
  return capitalizar(correo.split('@')[0] || correo);
}

function doLogout() {
  usuarioActual = null;
  document.getElementById('app-dashboard').classList.add('hidden');
  document.getElementById('app-dashboard').classList.remove('flex');
  document.getElementById('app-login').classList.remove('hidden');
  document.getElementById('usernameInput').value = '';
  document.getElementById('passwordInput').value = '';
  document.getElementById('loginError').classList.add('hidden');
}

/* ══════════════════════════════
   REGISTRO
══════════════════════════════ */
function abrirRegistro() {
  limpiarRegistro();
  document.getElementById('modal-registro').classList.add('open');
  setTimeout(() => document.getElementById('regNombre').focus(), 100);
}

function cerrarRegistro() {
  document.getElementById('modal-registro').classList.remove('open');
}

document.getElementById('modal-registro').addEventListener('click', function(e) {
  if (e.target === this) cerrarRegistro();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') cerrarRegistro();
});

function toggleRegPass() {
  const inp = document.getElementById('regPass');
  const ico = document.querySelector('#toggleRegPassBtn i');
  inp.type = inp.type === 'password' ? 'text' : 'password';
  ico.className = inp.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
}

function limpiarRegistro() {
  ['regNombre','regCorreo','regPass','regPass2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.classList.remove('error'); }
  });
  ['errNombre','errCorreo','errPass','errPass2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('show');
  });
  document.getElementById('errCorreo').textContent = 'El correo debe ser @pascualbravo.edu.co';
  document.getElementById('regExito').classList.add('hidden');
  document.getElementById('regForm').style.display = '';
}

function mostrarErrorReg(inputId, errId) {
  document.getElementById(inputId).classList.add('error');
  document.getElementById(errId).classList.add('show');
}
function ocultarErrorReg(inputId, errId) {
  document.getElementById(inputId).classList.remove('error');
  document.getElementById(errId).classList.remove('show');
}

function doRegistro() {
  let valido = true;

  const nombre = document.getElementById('regNombre').value.trim();
  if (!nombre) { mostrarErrorReg('regNombre','errNombre'); valido = false; }
  else ocultarErrorReg('regNombre','errNombre');

  const correo = document.getElementById('regCorreo').value.trim().toLowerCase();
  const errCorreoEl = document.getElementById('errCorreo');
  const dominioOk = correo.endsWith('@pascualbravo.edu.co') && correo.length > '@pascualbravo.edu.co'.length;
  if (!dominioOk) {
    errCorreoEl.textContent = 'El correo debe ser @pascualbravo.edu.co';
    mostrarErrorReg('regCorreo','errCorreo'); valido = false;
  } else if (usuariosDB[correo]) {
    errCorreoEl.textContent = 'Este correo ya se encuentra registrado.';
    mostrarErrorReg('regCorreo','errCorreo'); valido = false;
  } else {
    ocultarErrorReg('regCorreo','errCorreo');
  }

  const pass  = document.getElementById('regPass').value;
  if (pass.length < 6) { mostrarErrorReg('regPass','errPass'); valido = false; }
  else ocultarErrorReg('regPass','errPass');

  const pass2 = document.getElementById('regPass2').value;
  if (pass !== pass2 || pass2 === '') { mostrarErrorReg('regPass2','errPass2'); valido = false; }
  else ocultarErrorReg('regPass2','errPass2');

  if (!valido) return;

  // Guardar usuario en la BD local
  usuariosDB[correo] = {
    password: pass,
    nombre: nombre,
    // Los demás campos se llenan en edición
    primerNombre: nombre.split(' ')[0] || '',
    primerApellido: nombre.split(' ').slice(1).join(' ') || '',
    correo: correo
  };

  document.getElementById('regForm').style.display = 'none';
  document.getElementById('regExito').classList.remove('hidden');

  // Pre-rellenar login
  document.getElementById('usernameInput').value = correo;

  setTimeout(() => {
    cerrarRegistro();
    mostrarToast('✓ Cuenta creada. ¡Ya puedes iniciar sesión!');
  }, 2000);
}

/* ══════════════════════════════
   DASHBOARD / NAVEGACIÓN
══════════════════════════════ */
function mostrarSeccion(id) {
  document.querySelectorAll('.seccion').forEach(s => s.classList.add('hidden'));
  const sec = document.getElementById(id);
  if (sec) {
    sec.classList.remove('hidden');
    sec.classList.remove('fade-up');
    void sec.offsetWidth;
    sec.classList.add('fade-up');
  }
  document.querySelectorAll('[id^="nav-"]').forEach(b => {
    b.classList.remove('active');
    b.classList.add('text-gray-600');
  });
  const navBtn = document.getElementById('nav-' + id);
  if (navBtn) {
    navBtn.classList.add('active');
    navBtn.classList.remove('text-gray-600');
  }
  lucide.createIcons();
}

/* ══════════════════════════════
   EDICIÓN POR PASOS
══════════════════════════════ */
function abrirEdicion() {
  // Cargar datos actuales en los campos
  const u = usuariosDB[usuarioActual] || {};

  setValue('editTipoDoc',        u.tipoDoc || 'CC');
  setValue('editDni',            u.dni || '');
  setValue('editFechaExp',       u.fechaExp || '');

  // Bloquear campos de documento si ya fueron guardados (solo se editan una vez)
  const dniYaRegistrado = !!(u.dni && u.dni.trim());
  ['editDni', 'editTipoDoc', 'editFechaExp'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) {
      el.disabled = dniYaRegistrado;
      el.style.opacity = dniYaRegistrado ? '0.55' : '';
      el.style.cursor  = dniYaRegistrado ? 'not-allowed' : '';
      el.title = dniYaRegistrado ? 'El número de documento no puede modificarse una vez guardado.' : '';
    }
  });
  setValue('editPrimerNombre',   u.primerNombre || '');
  setValue('editSegundoNombre',  u.segundoNombre || '');
  setValue('editPrimerApellido', u.primerApellido || '');
  setValue('editSegundoApellido',u.segundoApellido || '');
  setValue('editSexo',           u.sexo || '');
  setValue('editFechaNac',       u.fechaNac || '');
  setValue('editCorreo',         usuarioActual);
  setValue('editTelefono',       u.telefono || '');
  setValue('editTelefonoAlt',    u.telefonoAlt || '');
  setValue('editCiudad',         u.ciudad || '');
  setValue('editDireccion',      u.direccion || '');
  setValue('editRol',            u.rol || '');
  setValue('editPrograma',       u.programa || '');
  setValue('editBio',            u.bio || '');

  // Preview avatar
  const nombreM = construirNombreCompleto(u) || u.nombre || '';
  document.getElementById('previewAvatar').textContent = nombreM.charAt(0).toUpperCase() || '?';
  if (u.foto) {
    const av = document.getElementById('previewAvatar');
    av.style.backgroundImage = `url(${u.foto})`;
    av.style.backgroundSize = 'cover';
    av.textContent = '';
  }

  irStep(1);
  mostrarSeccion('perfil-edicion');
}

function setValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function irStep(num) {
  stepActual = num;

  // Ocultar todos los tabs
  [1,2,3].forEach(n => {
    document.getElementById(`edit-tab-${n}`).classList.remove('active');
    const pill = document.getElementById(`step-pill-${n}`);
    if (n < num) {
      pill.className = 'step-pill done';
      pill.querySelector('.step-dot').className = 'step-dot done-dot';
      pill.querySelector('.step-dot').innerHTML = '<i class="fas fa-check" style="font-size:8px"></i>';
    } else if (n === num) {
      pill.className = 'step-pill active';
      pill.querySelector('.step-dot').className = 'step-dot active-dot';
      pill.querySelector('.step-dot').textContent = n;
    } else {
      pill.className = 'step-pill pending';
      pill.querySelector('.step-dot').className = 'step-dot pending-dot';
      pill.querySelector('.step-dot').textContent = n;
    }
  });

  document.getElementById(`edit-tab-${num}`).classList.add('active');
  lucide.createIcons();
}

function previewFoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const av = document.getElementById('previewAvatar');
    av.style.backgroundImage = `url(${e.target.result})`;
    av.style.backgroundSize  = 'cover';
    av.style.backgroundPosition = 'center';
    av.textContent = '';
    // Guardar temporalmente
    if (usuarioActual && usuariosDB[usuarioActual]) {
      usuariosDB[usuarioActual].foto = e.target.result;
    }
  };
  reader.readAsDataURL(file);
}

function guardarPerfil() {
  if (!usuarioActual) return;

  const u = usuariosDB[usuarioActual];

  // Recoger todos los campos
  // Solo guardar el documento si no estaba registrado previamente (se edita una sola vez)
  if (!u.dni || !u.dni.trim()) {
    u.tipoDoc  = document.getElementById('editTipoDoc').value;
    u.dni      = document.getElementById('editDni').value.trim();
    u.fechaExp = document.getElementById('editFechaExp').value;
  }
  u.primerNombre    = document.getElementById('editPrimerNombre').value.trim();
  u.segundoNombre   = document.getElementById('editSegundoNombre').value.trim();
  u.primerApellido  = document.getElementById('editPrimerApellido').value.trim();
  u.segundoApellido = document.getElementById('editSegundoApellido').value.trim();
  u.sexo            = document.getElementById('editSexo').value;
  u.fechaNac        = document.getElementById('editFechaNac').value;
  u.telefono        = document.getElementById('editTelefono').value.trim();
  u.telefonoAlt     = document.getElementById('editTelefonoAlt').value.trim();
  u.ciudad          = document.getElementById('editCiudad').value.trim();
  u.direccion       = document.getElementById('editDireccion').value.trim();
  u.rol             = document.getElementById('editRol').value;
  u.programa        = document.getElementById('editPrograma').value.trim();
  u.bio             = document.getElementById('editBio').value.trim();

  // El correo puede cambiar (si el campo editCorreo lo permite)
  // En este caso lo dejamos igual para no perder la clave del mapa
  // (si se quisiera cambiar, habría que migrar la clave)

  // Nombre compuesto para mostrar
  u.nombre = construirNombreCompleto(u) || u.nombre;

  actualizarUI();
  mostrarSeccion('perfil-vista');
  mostrarToast('✓ Perfil actualizado correctamente');
}

/* ══════════════════════════════
   UTILIDADES
══════════════════════════════ */
function mostrarToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 3000);
}

function capitalizar(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
