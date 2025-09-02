// UTILS
function alerta(mensaje, tipo = 'danger', tiempo = 3000) {
  const alertArea = document.getElementById('alertArea');
  if (!alertArea) return;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
  alertArea.appendChild(wrapper);
  setTimeout(() => {
    wrapper.firstElementChild.classList.add('fade-out');
    setTimeout(() => wrapper.remove(), 300);
  }, tiempo);
}

function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function generarIdReserva() {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
}

// Detectar página
const paginas = {
  mesas: document.querySelector('body[data-page="mesas"]') !== null,
  reservas: document.querySelector('body[data-page="reservas"]') !== null,
};

if (paginas.mesas) {
  // Inicializar mesas si no existen
  if (!localStorage.getItem('mesas')) {
    setLocalStorage('mesas', [
      { id: 'mesa1', capacidad: 4, ubicacion: 'Ventana', estado: 'disponible' },
      { id: 'mesa2', capacidad: 2, ubicacion: 'Jardín', estado: 'disponible' },
      { id: 'mesa3', capacidad: 6, ubicacion: 'Centro', estado: 'disponible' },
    ]);
  }

  const gridMesas = document.getElementById('gridMesas');
  const formMesa = document.getElementById('formMesa');
  const modalMesa = new bootstrap.Modal(document.getElementById('modalMesa'));
  const filtroEstadoBase = document.getElementById('filtroEstadoBase');
  const formFiltroOcupacion = document.getElementById('formFiltroOcupacion');

  function cargarMesas() {
    const mesas = getLocalStorage('mesas');
    const reservas = getLocalStorage('reservas');
    mesas.forEach(m => {
      // Actualizar estado en base a reservas activas
      const ocupada = reservas.find(r =>
        r.idMesaAsignada === m.id &&
        ['Pendiente', 'Confirmada'].includes(r.estado)
      );
      m.estado = ocupada ? 'ocupada' : (m.estado === 'deshabilitada' ? 'deshabilitada' : 'disponible');
    });
    setLocalStorage('mesas', mesas);

    let mesasFiltradas = mesas;
    const filtro = filtroEstadoBase.value;
    if (filtro !== 'todos') {
      mesasFiltradas = mesas.filter(m => m.estado === filtro);
    }

    gridMesas.innerHTML = '';
    if (!mesasFiltradas.length) {
      gridMesas.innerHTML = '<p class="text-center text-muted">No hay mesas para mostrar.</p>';
      return;
    }

    mesasFiltradas.forEach((m, idx) => {
      const div = document.createElement('div');
      div.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
      const card = document.createElement('div');
      card.className = `card p-3 state-${m.estado}`;
      card.innerHTML = `
        <h5>${m.id}</h5>
        <p>Capacidad: ${m.capacidad}</p>
        <p>Ubicación: ${m.ubicacion}</p>
        <p>Estado: ${m.estado}</p>
        <div class="d-flex gap-2 mt-2">
          <button class="btn btn-sm btn-warning btn-editar">Editar</button>
          <button class="btn btn-sm btn-primary btn-reservar">Reservar</button>
          <button class="btn btn-sm btn-danger btn-eliminar">Eliminar</button>
        </div>`;

      card.querySelector('.btn-editar').onclick = () => abrirModalMesa(m, idx);
      card.querySelector('.btn-eliminar').onclick = () => {
        if (confirm(`¿Eliminar mesa ${m.id}?`)) eliminarMesa(idx);
      };
      card.querySelector('.btn-reservar').onclick = () => {
        window.location.href = `index1.html?mesa=${m.id}`;
      };

      div.appendChild(card);
      gridMesas.appendChild(div);
    });
  }

  function abrirModalMesa(mesa = null, index = null) {
    document.getElementById('modalMesaLabel').textContent = mesa ? 'Editar Mesa' : 'Nueva Mesa';
    if (mesa) {
      document.getElementById('mesaId').value = mesa.id;
      document.getElementById('mesaCapacidad').value = mesa.capacidad;
      document.getElementById('mesaUbicacion').value = mesa.ubicacion;
      document.getElementById('mesaEstado').value = mesa.estado === 'ocupada' ? 'disponible' : mesa.estado;
      document.getElementById('mesaId').disabled = true;
      document.getElementById('mesaIndex').value = index;
    } else {
      formMesa.reset();
      document.getElementById('mesaId').disabled = false;
      document.getElementById('mesaIndex').value = '';
    }
    modalMesa.show();
  }

  function eliminarMesa(idx) {
    const mesas = getLocalStorage('mesas');
    const reservas = getLocalStorage('reservas');
    if (reservas.find(r => r.idMesaAsignada === mesas[idx].id && ['Pendiente','Confirmada'].includes(r.estado))) {
      alerta('No se puede eliminar una mesa con reservas activas.', 'warning');
      return;
    }
    mesas.splice(idx, 1);
    setLocalStorage('mesas', mesas);
    alerta('Mesa eliminada correctamente.', 'success');
    cargarMesas();
  }

  formMesa.onsubmit = e => {
    e.preventDefault();
    const id = document.getElementById('mesaId').value.trim();
    const capacidad = +document.getElementById('mesaCapacidad').value;
    const ubicacion = document.getElementById('mesaUbicacion').value.trim();
    const estado = document.getElementById('mesaEstado').value;
    const idx = document.getElementById('mesaIndex').value;

    if (!/^mesa\d+$/.test(id)) return alerta('Formato incorrecto para el ID (ej: mesa1).', 'danger');
    if (capacidad <= 0) return alerta('Capacidad debe ser mayor a 0.', 'danger');
    if (!ubicacion) return alerta('Ubicación es obligatoria.', 'danger');

    const mesas = getLocalStorage('mesas');

    if (!idx) {
      if (mesas.some(m => m.id === id)) return alerta('ID ya existe.', 'danger');
      mesas.push({ id, capacidad, ubicacion, estado });
      alerta('Mesa creada.', 'success');
    } else {
      const m = mesas[+idx];
      m.capacidad = capacidad;
      m.ubicacion = ubicacion;
      m.estado = estado;
      alerta('Mesa actualizada.', 'success');
    }

    setLocalStorage('mesas', mesas);
    modalMesa.hide();
    cargarMesas();
  };

  document.getElementById('btnNuevaMesa').onclick = () => abrirModalMesa();
  formFiltroOcupacion.onsubmit = e => {
    e.preventDefault();
    cargarMesas();
  };

  cargarMesas();
}

if (paginas.reservas) {
  if (!localStorage.getItem('reservas')) setLocalStorage('reservas', []);
  if (!localStorage.getItem('mesas')) setLocalStorage('mesas', [
    { id: 'mesa1', capacidad: 4, ubicacion: 'Ventana', estado: 'disponible' },
    { id: 'mesa2', capacidad: 2, ubicacion: 'Jardín', estado: 'disponible' },
    { id: 'mesa3', capacidad: 6, ubicacion: 'Centro', estado: 'disponible' },
  ]);

  const grid = document.getElementById('gridReservas');
  const form = document.getElementById('formReserva');
  const modal = new bootstrap.Modal(document.getElementById('modalReserva'));
  const filtroF = document.getElementById('filtroFecha');
  const filtroE = document.getElementById('filtroEstado');
  const url = new URLSearchParams(window.location.search);
  const preMesa = url.get('mesa');

  const imgMap = {
    'Cumpleaños': 'https://via.placeholder.com/300x140?text=Cumpleaños',
    'Aniversario': 'https://via.placeholder.com/300x140?text=Aniversario',
    'Reunión de Negocios': 'https://via.placeholder.com/300x140?text=Negocios',
    'Cena Romántica': 'https://via.placeholder.com/300x140?text=Cena+Romántica',
    'Graduación': 'https://via.placeholder.com/300x140?text=Graduación',
    'Despedida': 'https://via.placeholder.com/300x140?text=Despedida',
    'Evento Especial': 'https://via.placeholder.com/300x140?text=Evento+Especial',
    'Ninguna': 'https://via.placeholder.com/300x140?text=Reserva'
  };

  function cargarOpcionesMesas() {
    const selectMesa = document.getElementById('idMesaAsignada');
    selectMesa.innerHTML = '';
    const mesas = getLocalStorage('mesas').filter(m => m.estado !== 'deshabilitada');
    mesas.forEach(m => {
      const option = document.createElement('option');
      option.value = m.id;
      option.textContent = `${m.id} - Capacidad: ${m.capacidad} (${m.ubicacion})`;
      selectMesa.appendChild(option);
    });
    if (preMesa && mesas.some(m => m.id === preMesa)) {
      selectMesa.value = preMesa;
    }
  }

  function cargarReservas() {
    let reservas = getLocalStorage('reservas');
    const filtroFecha = filtroF.value;
    const filtroEstado = filtroE.value;

    if (filtroFecha) {
      reservas = reservas.filter(r => r.fechaReserva === filtroFecha);
    }
    if (filtroEstado !== 'todos') {
      reservas = reservas.filter(r => r.estado === filtroEstado);
    }

    grid.innerHTML = '';
    if (reservas.length === 0) {
      grid.innerHTML = '<p class="text-center text-muted">No hay reservas que mostrar.</p>';
      return;
    }

    reservas.forEach((r, idx) => {
      const div = document.createElement('div');
      div.className = 'col-12 col-md-6 col-lg-4';

      const imgSrc = imgMap[r.ocasionEspecial] || imgMap['Ninguna'];

      div.innerHTML = `
        <div class="card state-${r.estado.toLowerCase()} h-100">
          <img src="${imgSrc}" alt="${r.ocasionEspecial}" class="img-ocasion" />
          <div class="card-body">
            <h5 class="card-title">${r.nombreCliente}</h5>
            <p><strong>Personas:</strong> ${r.numeroPersonas}</p>
            <p><strong>Fecha y Hora:</strong> ${r.fechaReserva} ${r.horaReserva}</p>
            <p><strong>Mesa:</strong> ${r.idMesaAsignada}</p>
            <p><strong>Estado:</strong> ${r.estado}</p>
            <p><strong>Ocasión:</strong> ${r.ocasionEspecial}</p>
            <p>${r.notasAdicionales ? r.notasAdicionales : ''}</p>
          </div>
          <div class="card-footer d-flex gap-2">
            <button class="btn btn-sm btn-warning btn-editar">Editar</button>
            <button class="btn btn-sm btn-danger btn-eliminar">Eliminar</button>
          </div>
        </div>`;

      div.querySelector('.btn-editar').onclick = () => abrirModalReserva(r, idx);
      div.querySelector('.btn-eliminar').onclick = () => {
        if (confirm('¿Eliminar esta reserva?')) eliminarReserva(idx);
      };

      grid.appendChild(div);
    });
  }

  function abrirModalReserva(reserva = null, index = null) {
    document.getElementById('modalReservaLabel').textContent = reserva ? 'Editar Reserva' : 'Nueva Reserva';

    if (reserva) {
      document.getElementById('reservaIndex').value = index;
      document.getElementById('nombreCliente').value = reserva.nombreCliente;
      document.getElementById('numeroPersonas').value = reserva.numeroPersonas;
      document.getElementById('fechaReserva').value = reserva.fechaReserva;
      document.getElementById('horaReserva').value = reserva.horaReserva;
      document.getElementById('idMesaAsignada').value = reserva.idMesaAsignada;
      document.getElementById('ocasionEspecial').value = reserva.ocasionEspecial;
      document.getElementById('notasAdicionales').value = reserva.notasAdicionales || '';
      document.getElementById('estadoReserva').value = reserva.estado;
    } else {
      form.reset();
      document.getElementById('reservaIndex').value = '';
      if (preMesa) {
        document.getElementById('idMesaAsignada').value = preMesa;
      }
      // Default values
      const hoy = new Date().toISOString().split('T')[0];
      document.getElementById('fechaReserva').setAttribute('min', hoy);
      document.getElementById('fechaReserva').value = hoy;
      document.getElementById('horaReserva').value = '19:00';
      document.getElementById('estadoReserva').value = 'Pendiente';
    }
    modal.show();
  }

  function eliminarReserva(idx) {
    const reservas = getLocalStorage('reservas');
    reservas.splice(idx, 1);
    setLocalStorage('reservas', reservas);
    alerta('Reserva eliminada.', 'success');
    cargarReservas();
  }

  form.onsubmit = e => {
    e.preventDefault();
    const idx = document.getElementById('reservaIndex').value;
    const nombreCliente = document.getElementById('nombreCliente').value.trim();
    const numeroPersonas = +document.getElementById('numeroPersonas').value;
    const fechaReserva = document.getElementById('fechaReserva').value;
    const horaReserva = document.getElementById('horaReserva').value;
    const idMesaAsignada = document.getElementById('idMesaAsignada').value;
    const ocasionEspecial = document.getElementById('ocasionEspecial').value;
    const notasAdicionales = document.getElementById('notasAdicionales').value.trim();
    const estado = document.getElementById('estadoReserva').value;

    if (!nombreCliente) return alerta('El nombre del cliente es obligatorio.', 'danger');
    if (numeroPersonas <= 0) return alerta('Número de personas debe ser mayor que 0.', 'danger');
    if (!fechaReserva) return alerta('Fecha de reserva es obligatoria.', 'danger');
    if (!horaReserva) return alerta('Hora de reserva es obligatoria.', 'danger');

    const mesas = getLocalStorage('mesas');
    const mesaAsignada = mesas.find(m => m.id === idMesaAsignada);
    if (!mesaAsignada) return alerta('La mesa asignada no existe.', 'danger');
    if (numeroPersonas > mesaAsignada.capacidad) return alerta(`La mesa asignada tiene capacidad para ${mesaAsignada.capacidad} personas.`, 'danger');

    // Verificar disponibilidad de mesa en la fecha y hora para evitar reservas duplicadas
    const reservas = getLocalStorage('reservas');

    const conflicto = reservas.some((r, i) => {
      if (i == idx) return false; // Ignorar la reserva editada
      if (r.idMesaAsignada !== idMesaAsignada) return false;
      if (r.fechaReserva !== fechaReserva) return false;
      if (r.estado === 'Finalizada') return false;

      // Asumimos reservas de 1.5 horas para comprobación simple
      const horaIniR = parseInt(r.horaReserva.split(':')[0]) * 60 + parseInt(r.horaReserva.split(':')[1]);
      const horaIniN = parseInt(horaReserva.split(':')[0]) * 60 + parseInt(horaReserva.split(':')[1]);
      const duracion = 90; // minutos

      return Math.abs(horaIniR - horaIniN) < duracion;
    });

    if (conflicto) return alerta('La mesa ya está reservada en ese horario.', 'danger');

    const nuevaReserva = {
      id: idx ? reservas[idx].id : generarIdReserva(),
      nombreCliente,
      numeroPersonas,
      fechaReserva,
      horaReserva,
      idMesaAsignada,
      ocasionEspecial,
      notasAdicionales,
      estado,
    };

    if (idx) {
      reservas[idx] = nuevaReserva;
      alerta('Reserva actualizada.', 'success');
    } else {
      reservas.push(nuevaReserva);
      alerta('Reserva creada.', 'success');
    }

    setLocalStorage('reservas', reservas);
    modal.hide();
    cargarReservas();
  };

  document.getElementById('btnNuevaReserva').onclick = () => abrirModalReserva();
  document.getElementById('formFiltros').onsubmit = e => {
    e.preventDefault();
    cargarReservas();
  };

  cargarOpcionesMesas();
  cargarReservas();
}

