const URL_GOOGLE_SCRIPT = "https://script.google.com/macros/s/AKfycbzYQF3OUT5gmmJmp9fk55IBpyjgqvuMFyrErwXvMSzFl_cFaWQyOk24XEJmlT-I2_QBUg/exec";

window.onload = function() {
    const inputNombre = document.getElementById("nombre-usuario");
    if (inputNombre) {
        inputNombre.value = "";
    }
};
// Al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    // Recuperar nombre si ya ingresó antes
    const nombre = localStorage.getItem("usuarioProde");
    if(nombre) document.getElementById("nombre-usuario").value = nombre;

    cargarFixture();
    cargarRanking();
});

function guardarNombreLocal() {
    const nombre = document.getElementById("nombre-usuario").value;
    localStorage.setItem("usuarioProde", nombre);
}

function cargarFixture() {
    fetch(URL_GOOGLE_SCRIPT + "?tipo=fixture")
    .then(res => {
        if (!res.ok) throw new Error("Error en la red");
        return res.json();
    })
    .then(partidos => {
        console.log("Partidos detectados:", partidos); // Esto te dirá en la consola si llegaron datos
        const contenedor = document.getElementById("contenedor-partidos");
        if (!contenedor) return console.error("No se encontró el contenedor en el HTML");
        
        contenedor.innerHTML = "";
        
        partidos.forEach(p => {
            const ahora = new Date();
            // Si la fecha da error, usamos la fecha de hoy para que al menos se vea el partido
            let fechaPartido = new Date(p.fecha);
            if (isNaN(fechaPartido)) fechaPartido = ahora; 

            const esCerrado = (fechaPartido - ahora) < (24 * 60 * 60 * 1000);

            contenedor.innerHTML += `
                <div class="match-card ${esCerrado ? 'locked' : ''}">
                    <small>${p.fase} - ${fechaPartido.toLocaleDateString()}</small>
                    <div class="teams">
                        <span>${p.equipoL}</span>
                        <input type="number" id="L-${p.id}" min="0" ${esCerrado ? 'disabled' : ''}>
                        <span>vs</span>
                        <input type="number" id="V-${p.id}" min="0" ${esCerrado ? 'disabled' : ''}>
                        <span>${p.equipoV}</span>
                    </div>
                    <button class="btn-guardar" onclick="enviar('${p.id}')" ${esCerrado ? 'disabled' : ''}>
                        ${esCerrado ? '🔒 Cerrado' : 'Guardar Predicción'}
                    </button>
                </div>
            `;
        });
    })
    .catch(err => {
        console.error("Fallo total:", err);
        document.getElementById("contenedor-partidos").innerHTML = "Error al conectar con el servidor.";
    });
}

function enviar(id, local, visita) {
    const user = document.getElementById("nombre-usuario").value;
    if(!user) return alert("¡Pon tu nombre!");
    
    const datos = {
        nombre: user,
        partido: id,
        golesL: document.getElementById(`L-${id}`).value,
        golesV: document.getElementById(`V-${id}`).value,
        local: local,
        visitante: visita
    };

    fetch(URL_GOOGLE_SCRIPT, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(datos)
    }).then(() => alert("¡Enviado!"));
    document.getElementById("nombre-usuario").value = "";
}

function cargarRanking() {
    fetch(URL_GOOGLE_SCRIPT + "?tipo=ranking")
    .then(res => res.json())
    .then(data => {
        const tbody = document.getElementById("cuerpo-ranking");
        tbody.innerHTML = data.map((j, i) => `
            <tr>
                <td>${i+1}</td>
                <td>${j.nombre}</td>
                <td>${j.puntos}</td>
            </tr>
        `).join('');
    });
}
function cargarRanking() {
    fetch(URL_GOOGLE_SCRIPT + "?tipo=ranking")
    .then(res => res.json())
    .then(posiciones => {
        const contenedor = document.getElementById("contenedor-ranking");
        if (!contenedor) return;
        
        let html = `<table><tr><th>Jugador</th><th>Puntos</th></tr>`;
        posiciones.forEach(p => {
            html += `<tr><td>${p.jugador}</td><td>${p.puntos}</td></tr>`;
        });
        html += `</table>`;
        contenedor.innerHTML = html;
    })
    .catch(err => console.error("Error al cargar ranking:", err));
}

// Llama a la función al cargar la página
cargarRanking();