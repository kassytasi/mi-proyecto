// Utilidades LocalStorage
function obtenerMesas() {
    return JSON.parse(localStorage.getItem("mesas")) || [];
}

function obtenerReservas() {
    return JSON.parse(localStorage.getItem("reservas")) || [];
}

function guardarEnLocalStorage(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}

// Inicializar mesas si no existen
if (!localStorage.getItem("mesas")) {
    const mesasIniciales = [
        { id: "mesa1", capacidad: 2, ubicacion: "Ventana", estado: "disponible" },
        { id: "mesa2", capacidad: 4, ubicacion: "Jardín", estado: "disponible" },
        { id: "mesa3", capacidad: 6, ubicacion: "Interior", estado: "disponible" }
    ];
    guardarEnLocalStorage("mesas", mesasIniciales);
}

// Mostrar mensaje tipo alerta (sin alert())
function mostrarMensaje(mensaje, tipo) {
    const contenedor = document.getElementById("mensaje");
    contenedor.innerHTML = `<div class="alert alert-${tipo}">${mensaje}</div>`;
    setTimeout(() => contenedor.innerHTML = "", 3000);
}

// Mostrar mesas
function mostrarMesas() {
    const contenedor = document.getElementById("mesas");
    contenedor.innerHTML = "";
    const mesas = obtenerMesas();

    mesas.forEach(mesa => {
        const card = document.createElement("div");
        card.className = "card m-2";
        card.style.width = "18rem";
        card.style.backgroundColor =
            mesa.estado === "disponible" ? "green" :
            mesa.estado === "ocupada" ? "blue" :
            "black";
        card.style.color = mesa.estado === "deshabilitada" ? "white" : "white";

        const cardBody = document.createElement("div");
        cardBody.className = "card-body";

        cardBody.innerHTML = `
            <h5 class="card-title">${mesa.id}</h5>
            <p class="card-text">
                Capacidad: ${mesa.capacidad}<br>
                Ubicación: ${mesa.ubicacion}<br>
                Estado: ${mesa.estado}
            </p>
        `;

        const editarBtn = document.createElement("button");
        editarBtn.className = "btn btn-warning btn-sm me-1";
        editarBtn.textContent = "Editar";
        editarBtn.onclick = () => editarMesa(mesa.id);

        const reservarBtn = document.createElement("button");
        reservarBtn.className = "btn btn-primary btn-sm me-1";
        reservarBtn.textContent = "Reservar";
        reservarBtn.onclick = () => reservarMesa(mesa.id);

        const eliminarBtn = document.createElement("button");
        eliminarBtn.className = "btn btn-danger btn-sm";
        eliminarBtn.textContent = "Eliminar";
        eliminarBtn.onclick = () => eliminarMesa(mesa.id);

        cardBody.appendChild(editarBtn);
        cardBody.appendChild(reservarBtn);
        cardBody.appendChild(eliminarBtn);

        card.appendChild(cardBody);
        contenedor.appendChild(card);
    });
}

// Mostrar reservas
function mostrarReservas() {
    const contenedor = document.getElementById("reservas");
    contenedor.innerHTML = "";
    const reservas = obtenerReservas();

    reservas.forEach(reserva => {
        const card = document.createElement("div");
        card.className = "card m-2";
        card.style.width = "22rem";

        const cardBody = document.createElement("div");
        cardBody.className = "card-body";

        cardBody.innerHTML = `
            <h5 class="card-title">${reserva.nombreCliente}</h5>
            <p class="card-text">
                Personas: ${reserva.numeroPersonas}<br>
                Fecha: ${reserva.fechaReserva}<br>
                Hora: ${reserva.horaReserva}<br>
                Mesa: ${reserva.idMesaAsignada}<br>
                Estado: ${reserva.estado}
            </p>
        `;

        const editarBtn = document.createElement("button");
        editarBtn.className = "btn btn-warning btn-sm me-1";
        editarBtn.textContent = "Editar";
        editarBtn.onclick = () => editarReserva(reserva.idReserva);

        const pagarBtn = document.createElement("button");
        pagarBtn.className = "btn btn-success btn-sm me-1";
        pagarBtn.textContent = "Pagar";
        pagarBtn.onclick = () => pagarReserva(reserva.idReserva);

        const eliminarBtn = document.createElement("button");
        eliminarBtn.className = "btn btn-danger btn-sm";
        eliminarBtn.textContent = "Eliminar";
        eliminarBtn.onclick = () => eliminarReserva(reserva.idReserva);

        cardBody.appendChild(editarBtn);
        cardBody.appendChild(pagarBtn);
        cardBody.appendChild(eliminarBtn);

        card.appendChild(cardBody);
        contenedor.appendChild(card);
    });
}

// Guardar reserva con validaciones
function guardarReserva() {
    const nombre = document.getElementById("nombreCliente").value.trim();
    const personas = parseInt(document.getElementById("numeroPersonas").value, 10);
    const fecha = document.getElementById("fechaReserva").value;
    const hora = document.getElementById("horaReserva").value;
    const mesaId = document.getElementById("mesaSelect").value;

    if (!nombre) {
        mostrarMensaje("El nombre es obligatorio.", "danger");
        return;
    }
    if (!personas || personas <= 0) {
        mostrarMensaje("Número de personas inválido.", "danger");
        return;
    }
    const hoy = new Date();
    const fechaReserva = new Date(fecha);
    if (fechaReserva <= hoy) {
        mostrarMensaje("La fecha debe ser futura.", "danger");
        return;
    }

    // Validación: hora entre 08:00 y 20:00
    const horaParts = hora.split(":");
    const horaNum = parseInt(horaParts[0], 10);
    if (horaNum < 8 || horaNum > 20) {
        mostrarMensaje("La hora debe estar entre 08:00 y 20:00.", "danger");
        return;
    }

    const mesas = obtenerMesas();
    const reservas = obtenerReservas();

    const mesa = mesas.find(m => m.id === mesaId);
    if (!mesa || mesa.estado !== "disponible") {
        mostrarMensaje("La mesa no está disponible.", "danger");
        return;
    }

    // Crear reserva
    const nuevaReserva = {
        idReserva: "res_" + Date.now(),
        nombreCliente: nombre,
        numeroPersonas: personas,
        fechaReserva: fecha,
        horaReserva: hora,
        ocasionEspecial: "",
        notasAdicionales: "",
        idMesaAsignada: mesaId,
        estado: "Pendiente"
    };

    reservas.push(nuevaReserva);
    mesa.estado = "ocupada";

    guardarEnLocalStorage("reservas", reservas);
    guardarEnLocalStorage("mesas", mesas);

    mostrarMensaje("Reserva guardada con éxito.", "success");
    mostrarReservas();
    mostrarMesas();
}

// Eliminar mesa
function eliminarMesa(id) {
    let mesas = obtenerMesas();
    mesas = mesas.filter(m => m.id !== id);
    guardarEnLocalStorage("mesas", mesas);
    mostrarMesas();
}

// Reservar mesa
function reservarMesa(idMesa) {
    document.getElementById("mesaSelect").value = idMesa;
    // Mostrar modal si estás usando uno
}

// Eliminar reserva
function eliminarReserva(idReserva) {
    let reservas = obtenerReservas();
    reservas = reservas.filter(r => r.idReserva !== idReserva);
    guardarEnLocalStorage("reservas", reservas);
    mostrarReservas();
}

// Pagar reserva: cambiar estado y liberar mesa
function pagarReserva(idReserva) {
    const reservas = obtenerReservas();
    const mesas = obtenerMesas();

    const reserva = reservas.find(r => r.idReserva === idReserva);
    if (!reserva) {
        mostrarMensaje("Reserva no encontrada.", "danger");
        return;
    }

    reserva.estado = "Finalizada";

    const mesa = mesas.find(m => m.id === reserva.idMesaAsignada);
    if (mesa) {
        mesa.estado = "disponible";
    }

    guardarEnLocalStorage("reservas", reservas);
    guardarEnLocalStorage("mesas", mesas);

    mostrarMensaje("Reserva finalizada y mesa liberada.", "success");
    mostrarReservas();
    mostrarMesas();
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
    mostrarMesas();
    mostrarReservas();
});



