const URL_GOOGLE_SCRIPT = "https://script.google.com/macros/s/AKfycbzdP1GbBI2_j05m6ZDzy8ApX4zgwQZnykJU7G2dxNL83w0RZLsb08JVWHuxwZwmlSB_kg/exec";

// Función que se ejecuta al cargar la página
window.onload = function() {
    cargarFixture();
    cargarRanking();
    // Limpiamos el nombre por si el navegador lo recordó
    document.getElementById("nombre-usuario").value = "";
};

// --- CARGAR FIXTURE ---
function cargarFixture() {
    fetch(URL_GOOGLE_SCRIPT + "?tipo=fixture")
        .then(res => res.json())
        .then(partidos => {
            const contenedor = document.getElementById("contenedor-partidos");
            contenedor.innerHTML = ""; // Limpiamos el "Cargando..."

            partidos.forEach(p => {
                const div = document.createElement("div");
                div.className = "partido-card";
                div.innerHTML = `
                    <div class="info-partido">
                        <span>${p.fase} - ${p.fecha}</span>
                    </div>
                    <div class="equipos-fila">
                        <span class="nombre-equipo">${p.equipoL}</span>
                        <input type="number" id="golesL-${p.id}" class="input-goles" min="0" placeholder="0">
                        <span> vs </span>
                        <input type="number" id="golesV-${p.id}" class="input-goles" min="0" placeholder="0">
                        <span class="nombre-equipo">${p.equipoV}</span>
                    </div>
                `;
                contenedor.appendChild(div);
            });
        })
        .catch(err => {
            console.error("Error al cargar fixture:", err);
            document.getElementById("contenedor-partidos").innerHTML = "Error al cargar los partidos.";
        });
}

// --- ENVIAR PREDICCIONES ---
function enviar() {
    const nombre = document.getElementById("nombre-usuario").value;
    if (!nombre) {
        alert("⚠️ Por favor, ingresa tu nombre antes de guardar.");
        return;
    }

    // Buscamos todos los inputs de goles que tengan un ID que empiece con "golesL-"
    const inputsGolesL = document.querySelectorAll('input[id^="golesL-"]');
    
    // Vamos a enviar cada predicción al Excel
    inputsGolesL.forEach(inputL => {
        const partidoId = inputL.id.replace("golesL-", ""); // Extraemos el ID (ej: P1)
        const golesL = inputL.value;
        const golesV = document.getElementById(`golesV-${partidoId}`).value;

        // Solo enviamos si el usuario escribió algo en ambos campos
        if (golesL !== "" && golesV !== "") {
            const datos = {
                nombre: nombre,
                partido: partidoId,
                golesL: golesL,
                golesV: golesV
            };

            fetch(URL_GOOGLE_SCRIPT, {
                method: "POST",
                mode: "no-cors",
                cache: "no-cache",
                body: JSON.stringify(datos)
            });
        }
    });

    alert("✅ ¡Tus predicciones han sido enviadas! Revisa el Excel en unos segundos.");
    document.getElementById("nombre-usuario").value = ""; // Limpiamos para el siguiente
}

// --- CARGAR RANKING ---
function cargarRanking() {
    fetch(URL_GOOGLE_SCRIPT + "?tipo=ranking")
        .then(res => res.json())
        .then(posiciones => {
            const contenedor = document.getElementById("contenedor-ranking");
            if (posiciones.length === 0) {
                contenedor.innerHTML = "<p>Aún no hay puntos calculados.</p>";
                return;
            }

            let tablaHTML = `<table class="tabla-ranking">
                                <thead>
                                    <tr>
                                        <th>Pos</th>
                                        <th>Jugador</th>
                                        <th>Pts</th>
                                    </tr>
                                </thead>
                                <tbody>`;
            
            posiciones.sort((a, b) => b.puntos - a.puntos); // Ordenar por puntos

            posiciones.forEach((p, index) => {
                tablaHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${p.jugador}</td>
                        <td><strong>${p.puntos}</strong></td>
                    </tr>`;
            });

            tablaHTML += `</tbody></table>`;
            contenedor.innerHTML = tablaHTML;
        });
}