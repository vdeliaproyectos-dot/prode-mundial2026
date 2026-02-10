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
            contenedor.innerHTML = ""; 

            // --- PUNTO 1: DICCIONARIO DE BANDERAS (VA AQUÍ) ---
            const banderas = {
                        // Grupo A
                        "México": "mx", "Sudáfrica": "za", "Corea del Sur": "kr",
                        // Grupo B
                        "Canadá": "ca", "Italia": "it", "Nigeria": "ng", "Gales": "gb-wls", "Bosnia": "ba", "Qatar": "qa", "Suiza": "ch",
                        // Grupo C
                        "Brasil": "br", "Marruecos": "ma", "Haití": "ht", "Escocia": "gb-sct",
                        // Grupo D
                        "Estados Unidos": "us", "Paraguay": "py", "Australia": "au", "Turquía": "tr", "Rumania": "ro", "Eslovaquia": "sk", "Kosovo": "xk",
                        // Grupo E
                        "Alemania": "de", "Curazao": "cw", "Costa de Marfil": "ci", "Ecuador": "ec",
                        // Grupo F
                        "Países Bajos": "nl", "Japón": "jp", "Ucrania": "ua", "Suecia": "se", "Polonia": "pl", "Albania": "al", "Túnez": "tn",
                        // Grupo G
                        "Bélgica": "be", "Egipto": "eg", "Irán": "ir", "Nueva Zelanda": "nz",
                        // Grupo H
                        "España": "es", "Cabo Verde": "cv", "Arabia Saudita": "sa", "Uruguay": "uy",
                        // Grupo I
                        "Francia": "fr", "Senegal": "sn", "Irak": "iq", "Bolivia": "bo", "Surinam": "sr", "Noruega": "no",
                        // Grupo J
                        "Argentina": "ar", "Argelia": "dz", "Austria": "at", "Jordania": "jo",
                        // Grupo K
                        "Portugal": "pt", "Jamaica": "jm", "RD de Congo": "cd", "Nueva Caledonia": "nc", "Uzbekistán": "uz", "Colombia": "co",
                        // Grupo L
                        "Inglaterra": "gb-eng", "Croacia": "hr", "Ghana": "gh", "Panamá": "pa",
                        // Extras / Repechajes
                        "Clasificatorio A": "un", "Clasificatorio B": "un", "Clasificatorio D": "un", "Clasificatorio F": "un", "Clasificatorio I": "un", "Clasificatorio K": "un"
            };

            // --- 2. AGRUPAR POR FASE/GRUPO ---
            const grupos = {};
            partidos.forEach(p => {
                if (!grupos[p.fase]) { grupos[p.fase] = []; }
                grupos[p.fase].push(p);
            });

            // --- 3. RECORRER CADA GRUPO Y DIBUJAR ---
            for (const nombreGrupo in grupos) {
                const seccion = document.createElement("div");
                seccion.className = "seccion-grupo";
                seccion.innerHTML = `<h3 class="titulo-fase">${nombreGrupo}</h3>`;
                
                const gridPartidos = document.createElement("div");
                gridPartidos.className = "grid-tres-columnas";

                // AQUÍ ES DONDE SE USA EL DICCIONARIO
                grupos[nombreGrupo].forEach(p => {
                    const codeL = banderas[p.equipoL] || "un";
                    const codeV = banderas[p.equipoV] || "un";

                    const card = document.createElement("div");
                    card.className = "partido-card";
                    card.innerHTML = `
                    
                        <div class="info-partido">${p.fecha}</div>
                        <div class="fila-horizontal">
                            <div class="bloque-equipo local">
                                <span class="nombre-equipo">${p.equipoL}</span>
                                <img src="https://flagcdn.com/w40/${codeL}.png" class="bandera">
                                <input type="number" id="golesL-${p.id}" class="input-goles" placeholder="0">
                            </div>
                            <div class="vs-divisor">vs</div>
                            <div class="bloque-equipo visitante">
                                <input type="number" id="golesV-${p.id}" class="input-goles" placeholder="0">
                                <img src="https://flagcdn.com/w40/${codeV}.png" class="bandera">
                                <span class="nombre-equipo">${p.equipoV}</span>
                            </div>
                        </div>
                    `;
                    gridPartidos.appendChild(card);
                });

                seccion.appendChild(gridPartidos);
                contenedor.appendChild(seccion);
            }

            // --- 4. ACTUALIZAR CONTADOR TOTAL ---
            document.getElementById("total-partidos").innerText = partidos.length;
            document.querySelectorAll('.input-goles').forEach(input => {
                input.addEventListener('input', actualizarContador);
            });
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