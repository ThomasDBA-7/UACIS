/* ══════════════════════════════
   ESTADO GLOBAL
══════════════════════════════ */
let usuarioActual = null;   // correo del usuario logueado
let usuarioDatos = null;    // objeto con todos los datos del perfil
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

async function doLogin() {
  const correoInput = document.getElementById('usernameInput').value.trim().toLowerCase();
  const passInput   = document.getElementById('passwordInput').value;
  const err         = document.getElementById('loginError');
  const errMsg      = document.getElementById('loginErrorMsg');

  if (!correoInput || !passInput) {
    errMsg.textContent = 'Por favor completa todos los campos.';
    err.classList.remove('hidden');
    return;
  }

  try {
    const response = await fetch('./login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: correoInput, password: passInput })
    });

    const result = await response.json();

    if (!response.ok) {
      errMsg.textContent = result.error || 'Error al iniciar sesión';
      err.classList.remove('hidden');
      return;
    }

    // Login exitoso
    err.classList.add('hidden');
    usuarioActual = correoInput;
    usuarioDatos = result.usuario;   // todos los datos del usuario desde la BD
    iniciarDashboard();
  } catch (error) {
    console.error('Error:', error);
    errMsg.textContent = 'Error de conexión con el servidor';
    err.classList.remove('hidden');
  }
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
  const u = usuarioDatos;
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
  usuarioDatos = null;
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

async function doRegistro() {
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

  try {
    const response = await fetch('./registro.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, correo, password: pass })
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.error && result.error.includes('correo')) {
        mostrarErrorReg('regCorreo','errCorreo');
        document.getElementById('errCorreo').textContent = result.error;
      } else {
        alert(result.error || 'Error en el registro');
      }
      return;
    }

    // Registro exitoso
    document.getElementById('regForm').style.display = 'none';
    document.getElementById('regExito').classList.remove('hidden');
    document.getElementById('usernameInput').value = correo;

    setTimeout(() => {
      cerrarRegistro();
      mostrarToast('✓ Cuenta creada. ¡Ya puedes iniciar sesión!');
    }, 2000);
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión con el servidor');
  }
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
  const u = usuarioDatos || {};

  setValue('editTipoDoc',        u.tipoDoc || 'CC');
  setValue('editDni',            u.dni || '');
  setValue('editFechaExp',       u.fechaExp || '');

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
    if (usuarioDatos) {
      usuarioDatos.foto = e.target.result;
    }
  };
  reader.readAsDataURL(file);
}

async function guardarPerfil() {
  if (!usuarioActual) return;

  const datos = {};
  datos.correo = usuarioActual;  // identificación

  // Solo enviamos los campos que se modifican (incluyendo documento si es nuevo)
  if (!usuarioDatos.dni || !usuarioDatos.dni.trim()) {
    datos.tipoDoc  = document.getElementById('editTipoDoc').value;
    datos.dni      = document.getElementById('editDni').value.trim();
    datos.fechaExp = document.getElementById('editFechaExp').value;
  }
  datos.primerNombre    = document.getElementById('editPrimerNombre').value.trim();
  datos.segundoNombre   = document.getElementById('editSegundoNombre').value.trim();
  datos.primerApellido  = document.getElementById('editPrimerApellido').value.trim();
  datos.segundoApellido = document.getElementById('editSegundoApellido').value.trim();
  datos.sexo            = document.getElementById('editSexo').value;
  datos.fechaNac        = document.getElementById('editFechaNac').value;
  datos.telefono        = document.getElementById('editTelefono').value.trim();
  datos.telefonoAlt     = document.getElementById('editTelefonoAlt').value.trim();
  datos.ciudad          = document.getElementById('editCiudad').value.trim();
  datos.direccion       = document.getElementById('editDireccion').value.trim();
  datos.rol             = document.getElementById('editRol').value;
  datos.programa        = document.getElementById('editPrograma').value.trim();
  datos.bio             = document.getElementById('editBio').value.trim();
  datos.foto            = usuarioDatos.foto || null;
  datos.nombre          = construirNombreCompleto(datos) || usuarioDatos.nombre;

  try {
    const response = await fetch('./actualizar_perfil.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || 'Error al guardar los cambios');
      return;
    }

    // Actualizar datos locales
    for (let key in datos) {
      if (datos.hasOwnProperty(key)) {
        usuarioDatos[key] = datos[key];
      }
    }

    actualizarUI();
    mostrarSeccion('perfil-vista');
    mostrarToast('✓ Perfil actualizado correctamente');
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión al guardar');
  }
}

/* ══════════════════════════════
   RESTRICCIÓN DOCUMENTO SOLO NÚMEROS
══════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  const dniInput = document.getElementById('editDni');
  if (dniInput) {
    dniInput.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, '');
    });
  }
});

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