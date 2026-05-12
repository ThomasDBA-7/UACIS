/* ══════════════════════════════
   ESTADO GLOBAL
══════════════════════════════ */
let usuarioActual = null;   // correo del usuario logueado
let usuarioDatos  = null;   // objeto con todos los datos del perfil
let stepActual    = 1;
let imagenEspacioBase64 = null;  // imagen temporal al crear espacio

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

    err.classList.add('hidden');
    usuarioActual = correoInput;
    usuarioDatos  = result.usuario;
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
  configurarVistaPorRol();
  mostrarSeccion('inicio');
  cargarEspacios();   // precarga el catálogo al entrar
  lucide.createIcons();
}

function actualizarUI() {
  const u = usuarioDatos;
  if (!u) return;

  const nombreMostrar = construirNombreCompleto(u) || u.nombre || extraerNombre(usuarioActual);
  const inicial = nombreMostrar.charAt(0).toUpperCase();
  const correo  = usuarioActual;

  document.getElementById('miniNombre').textContent    = nombreMostrar;
  document.getElementById('avatarMini').textContent    = inicial;
  document.getElementById('avatarGrande').textContent  = inicial;
  document.getElementById('previewAvatar').textContent = inicial;
  document.getElementById('welcomeMsg').textContent    = `¡Bienvenido, ${nombreMostrar.split(' ')[0]}!`;

  document.getElementById('nombreCompleto').textContent = nombreMostrar;
  document.getElementById('perfilCorreo').textContent   = correo;
  document.getElementById('vistaDni').textContent       = u.dni || '–';
  document.getElementById('vistaTelefono').textContent  = u.telefono || '–';
  document.getElementById('vistaFechaNac').textContent  = u.fechaNac || '–';
  document.getElementById('vistaSexo').textContent      = u.sexo || '–';
  document.getElementById('vistaCiudad').textContent    = u.ciudad || '–';

  if (u.foto) {
    ['avatarMini','avatarGrande','previewAvatar'].forEach(id => {
      const el = document.getElementById(id);
      el.style.backgroundImage    = `url(${u.foto})`;
      el.style.backgroundSize     = 'cover';
      el.style.backgroundPosition = 'center';
      el.textContent = '';
    });
  }
}

/* Muestra/oculta elementos según el rol del usuario */
function configurarVistaPorRol() {
  const esAdmin = usuarioDatos && usuarioDatos.rol === 'Administrativo';
  document.getElementById('nav-espacio-crear').classList.toggle('hidden', !esAdmin);
  const btnHeader = document.getElementById('btnCrearEspacioHeader');
  if (btnHeader) btnHeader.classList.toggle('hidden', !esAdmin);
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
  usuarioActual       = null;
  usuarioDatos        = null;
  imagenEspacioBase64 = null;
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
  const dominioOk = correo.endsWith('@pascualbravo.edu.co') && correo.length > '@pascualbravo.edu.co'.length;
  if (!dominioOk) {
    document.getElementById('errCorreo').textContent = 'El correo debe ser @pascualbravo.edu.co';
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
   EDICIÓN DE PERFIL POR PASOS
══════════════════════════════ */
function abrirEdicion() {
  const u = usuarioDatos || {};

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
    av.style.backgroundImage    = `url(${e.target.result})`;
    av.style.backgroundSize     = 'cover';
    av.style.backgroundPosition = 'center';
    av.textContent = '';
    if (usuarioDatos) usuarioDatos.foto = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function guardarPerfil() {
  if (!usuarioActual) return;

  const datos = {};
  datos.correo = usuarioActual;

  // Solo guardamos documento si no estaba registrado previamente
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

    for (let key in datos) {
      if (datos.hasOwnProperty(key)) usuarioDatos[key] = datos[key];
    }

    actualizarUI();
    configurarVistaPorRol();   // re-evalúa el rol por si cambió
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

/* ══════════════════════════════════════════════
   ÉPICA 02 — GESTIÓN DE ESPACIOS
══════════════════════════════════════════════ */

const TIPO_LABELS = {
  salon:        'Salón',
  auditorio:    'Auditorio',
  laboratorio:  'Laboratorio',
  cancha:       'Cancha',
  zona_estudio: 'Zona de estudio'
};

const TIPO_COLORS = {
  salon:        'badge-salon',
  auditorio:    'badge-auditorio',
  laboratorio:  'badge-laboratorio',
  cancha:       'badge-cancha',
  zona_estudio: 'badge-zona'
};

/* ─── US-005: Catálogo de Espacios ─── */
async function cargarEspacios() {
  const tipo        = document.getElementById('filtroTipo')?.value || '';
  const capacidad   = document.getElementById('filtroCapacidad')?.value || '';
  const ordenar     = document.getElementById('filtroOrden')?.value || 'nombre';

  const grid     = document.getElementById('espaciosGrid');
  const cargando = document.getElementById('espaciosCargando');
  const vacio    = document.getElementById('espaciosVacio');

  if (!grid) return;

  grid.innerHTML = '';
  cargando.classList.remove('hidden');
  vacio.classList.add('hidden');

  const params = new URLSearchParams();
  if (tipo)      params.append('tipo', tipo);
  if (capacidad) params.append('capacidad_min', capacidad);
  params.append('ordenar', ordenar);

  try {
    const res  = await fetch(`./listar_espacios.php?${params.toString()}`);
    const data = await res.json();
    cargando.classList.add('hidden');

    const espacios = data.espacios || [];

    // Actualizar contador en inicio
    const totalEl = document.getElementById('totalEspaciosHome');
    if (totalEl) totalEl.textContent = espacios.length;

    if (espacios.length === 0) {
      vacio.classList.remove('hidden');
      return;
    }

    espacios.forEach(e => {
      const card = document.createElement('div');
      card.className = 'espacio-card';
      card.innerHTML = `
        <div class="espacio-img">
          ${e.imagen
            ? `<img src="${e.imagen}" alt="${e.nombre}" class="w-full h-full object-cover">`
            : `<i data-lucide="building-2" class="w-10 h-10 text-gray-300"></i>`}
        </div>
        <div class="p-4">
          <div class="flex items-start justify-between gap-2 mb-2">
            <h3 class="text-sm font-bold text-gray-800 leading-tight">${e.nombre}</h3>
            <span class="espacio-badge ${TIPO_COLORS[e.tipo] || ''} flex-shrink-0">${TIPO_LABELS[e.tipo] || e.tipo}</span>
          </div>
          <div class="space-y-1.5 mb-4">
            <p class="text-xs text-gray-500 flex items-center gap-1.5">
              <i data-lucide="users" class="w-3.5 h-3.5"></i> ${e.capacidad} personas
            </p>
            <p class="text-xs text-gray-500 flex items-center gap-1.5">
              <i data-lucide="map-pin" class="w-3.5 h-3.5"></i> ${e.ubicacion}
            </p>
            ${e.descripcion ? `<p class="text-xs text-gray-400 line-clamp-2">${e.descripcion}</p>` : ''}
          </div>
          <button onclick="verDetalleEspacio(${e.id})"
            class="w-full bg-[#0165a7] hover:bg-[#014e85] text-white text-xs font-semibold py-2 rounded-lg transition flex items-center justify-center gap-1.5">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i> Ver detalles
          </button>
        </div>`;
      grid.appendChild(card);
    });

    lucide.createIcons();
  } catch (err) {
    console.error('Error cargando espacios:', err);
    cargando.classList.add('hidden');
    vacio.classList.remove('hidden');
  }
}

/* ─── US-006: Detalle + Disponibilidad ─── */
async function verDetalleEspacio(id) {
  mostrarSeccion('espacio-detalle');

  // Limpiar estado anterior
  document.getElementById('detalleNombre').textContent      = 'Cargando...';
  document.getElementById('detalleTipoUbicacion').textContent = '–';
  document.getElementById('disponibilidadGrid').innerHTML   = '<p class="text-sm text-gray-400">Cargando disponibilidad...</p>';

  try {
    const res  = await fetch(`./detalle_espacio.php?id=${id}`);
    const data = await res.json();

    if (!res.ok || data.error) {
      alert(data.error || 'No se pudo cargar el espacio');
      mostrarSeccion('espacios');
      return;
    }

    const e   = data.espacio;
    const dis = data.disponibilidad;

    // Cabecera
    document.getElementById('detalleNombre').textContent        = e.nombre;
    document.getElementById('detalleTipoUbicacion').textContent = `${TIPO_LABELS[e.tipo] || e.tipo} · ${e.ubicacion}`;

    // Badge tipo
    const badge = document.getElementById('detalleBadgeTipo');
    badge.textContent  = TIPO_LABELS[e.tipo] || e.tipo;
    badge.className    = `espacio-badge ${TIPO_COLORS[e.tipo] || ''}`;

    document.getElementById('detalleCapacidad').textContent  = e.capacidad;
    document.getElementById('detalleUbicacion').textContent  = e.ubicacion;
    document.getElementById('detalleDescripcion').textContent = e.descripcion || 'Sin descripción';

    // Imagen
    const imgContainer = document.getElementById('detalleImagen');
    if (e.imagen) {
      imgContainer.innerHTML = `<img src="${e.imagen}" alt="${e.nombre}" class="w-full h-full object-cover">`;
    } else {
      imgContainer.innerHTML = `<i data-lucide="building-2" class="w-16 h-16 text-blue-300"></i>`;
    }

    // Disponibilidad: grilla 7 días x franjas horarias
    renderizarDisponibilidad(dis);
    lucide.createIcons();

  } catch (err) {
    console.error('Error cargando detalle:', err);
    alert('Error de conexión al cargar el espacio');
    mostrarSeccion('espacios');
  }
}

function renderizarDisponibilidad(disponibilidad) {
  const container = document.getElementById('disponibilidadGrid');
  container.innerHTML = '';

  // Franjas de 2 horas entre 7:00 y 21:00
  const FRANJAS = [
    '07:00–09:00', '09:00–11:00', '11:00–13:00',
    '13:00–15:00', '15:00–17:00', '17:00–19:00', '19:00–21:00'
  ];

  const DIAS_ES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const MESES_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

  Object.entries(disponibilidad).forEach(([fecha, reservas]) => {
    const d = new Date(fecha + 'T00:00:00');
    const diaNombre = DIAS_ES[d.getDay()];
    const diaLabel  = `${diaNombre} ${d.getDate()} ${MESES_ES[d.getMonth()]}`;

    const fila = document.createElement('div');
    fila.className = 'disponibilidad-fila';

    const labelDia = document.createElement('span');
    labelDia.className = 'disponibilidad-dia';
    labelDia.textContent = diaLabel;
    fila.appendChild(labelDia);

    const slots = document.createElement('div');
    slots.className = 'disponibilidad-slots';

    FRANJAS.forEach(franja => {
      const [inicioF, finF] = franja.split('–');
      const ocupado = reservas.some(r => {
        return r.hora_inicio < finF && r.hora_fin > inicioF;
      });

      const slot = document.createElement('div');
      slot.className = `disponibilidad-slot ${ocupado ? 'ocupado' : 'libre'}`;
      slot.title     = `${franja} · ${ocupado ? 'Reservado' : 'Disponible'}`;
      slot.textContent = inicioF.slice(0,5);
      slots.appendChild(slot);
    });

    fila.appendChild(slots);
    container.appendChild(fila);
  });
}

/* ─── US-004: Crear Espacio (Admin) ─── */
function previewImagenEspacio(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    imagenEspacioBase64 = e.target.result;
    const prev = document.getElementById('crearImagenPreview');
    prev.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover rounded-xl">`;
  };
  reader.readAsDataURL(file);
}

async function crearEspacio() {
  const nombre      = document.getElementById('crearNombre').value.trim();
  const tipo        = document.getElementById('crearTipo').value;
  const capacidad   = document.getElementById('crearCapacidad').value;
  const ubicacion   = document.getElementById('crearUbicacion').value.trim();
  const descripcion = document.getElementById('crearDescripcion').value.trim();

  const errDiv = document.getElementById('crearEspacioError');
  const errMsg = document.getElementById('crearEspacioErrorMsg');

  errDiv.classList.add('hidden');

  // Validación frontend
  if (!nombre || !tipo || !capacidad || !ubicacion) {
    errMsg.textContent = 'Por favor completa todos los campos obligatorios.';
    errDiv.classList.remove('hidden');
    return;
  }
  if (parseInt(capacidad) <= 0) {
    errMsg.textContent = 'La capacidad debe ser un número positivo.';
    errDiv.classList.remove('hidden');
    return;
  }

  try {
    const response = await fetch('./crear_espacio.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo:      usuarioActual,
        nombre,
        tipo,
        capacidad:   parseInt(capacidad),
        ubicacion,
        descripcion,
        imagen:      imagenEspacioBase64 || null
      })
    });

    const result = await response.json();

    if (!response.ok) {
      errMsg.textContent = result.error || 'Error al crear el espacio';
      errDiv.classList.remove('hidden');
      return;
    }

    // Limpiar formulario
    ['crearNombre','crearCapacidad','crearUbicacion','crearDescripcion'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('crearTipo').value = '';
    document.getElementById('crearImagenPreview').innerHTML = '<i data-lucide="image" class="w-7 h-7 text-gray-300"></i>';
    imagenEspacioBase64 = null;
    lucide.createIcons();

    mostrarToast('✓ Espacio creado correctamente');
    await cargarEspacios();
    mostrarSeccion('espacios');

  } catch (err) {
    console.error('Error:', err);
    errMsg.textContent = 'Error de conexión con el servidor';
    errDiv.classList.remove('hidden');
  }
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
