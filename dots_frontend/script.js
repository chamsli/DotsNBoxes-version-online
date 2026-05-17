const CONFIGURACION = {

    modo: null,          // "CPU", "LOCAL", "ONLINE"
    gridSize: 5,         // 5, 7, 10
    cpuLevel: "-",    // easy, medium, hard
    timerEnabled: false,
    timeLimit: 60        // seconds

};

window.actualizarPuntuacion = actualizarPuntuacion;
window.dibujarTodo = dibujarTodo;
window.detenerTemporizador = detenerTemporizador;
window.Square = Square;
window.CONFIGURACION = CONFIGURACION;



const canvas = document.getElementById("canvasJuego");
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 600;

const btnCPU = document.getElementById('btnCPU');
const btnLocal = document.getElementById('btnLocal');
const btnInstrucciones = document.getElementById('btnInstrucciones');

const btnOnline = document.getElementById('btnOnline');
const btnVolver = document.querySelectorAll('.btnVolver');
// const btnReiniciar = document.getElementById('btnReiniciar');
const btnFacil = document.getElementById("btnFacil");
const btnMedio = document.getElementById("btnMedio");
const btnDificil = document.getElementById("btnDificil");
const btn5 = document.getElementById("btn5");
const btn7 = document.getElementById("btn7");
const btn10 = document.getElementById("btn10");
const btnRapido = document.getElementById("btnRapido");
const codigoInput = document.getElementById('codigoInput');
const puntuacion = document.getElementById('puntuacion');

let puntosJ1 = 0;
let puntosJ2 = 0;
let turnoJugador = true;
let juegoActivo = false;
let squares = [];

let cursorIndex = 0;
let margin = 40;
let intervaloReloj = null;
let tiempoRestante = CONFIGURACION.timeLimit;


btnCPU.addEventListener('click', () => seleccionarModo("CPU"));
btnLocal.addEventListener('click', () => seleccionarModo("LOCAL"));
btnInstrucciones.addEventListener('click', () => mostrarInstrucciones());
btnVolver.forEach(btn => {
    btn.addEventListener('click', () => volverAlMenu());
})
btnOnline.addEventListener('click', () => mostrarOnline());
// btnReiniciar.addEventListener('click', () => volverAlMenu());
btnFacil.addEventListener("click", () => setCPU("facil", 5));
btnMedio.addEventListener("click", () => setCPU("medio", 5));
btnDificil.addEventListener("click", () => setCPU("dificil", 5));
btn5.addEventListener('click', () => setGrid(5, false));
btn7.addEventListener('click', () => setGrid(7, false));
btn10.addEventListener('click', () => setGrid(10, false));
btnRapido.addEventListener('click', () => setGrid(5, true));


// modo online 
btnCrearSala.addEventListener('click', () => {
    if (!currentUserId) {
        alert('Debes iniciar sesión primero');
        return;
    }
    createOnlineGame();
});
btnUnirse.addEventListener('click', () => {
    if (!currentUserId) {
        alert('Debes iniciar sesión primero');
        return;
    }
    joinOnlineGame();
});


// Definición segura de toggleChat por si online.js aún no se ha cargado
function toggleChat(show) {
    const panel = document.getElementById('chatPanel');
    if (panel) panel.style.display = show ? 'block' : 'none';
}

function seleccionarModo(modo) {
    CONFIGURACION.modo = modo;
    document.getElementById("menu").style.display = "none";
    switch (modo) {
        case "CPU":
            document.getElementById('cpuLevels').style.display = "block";
            break;
        case "LOCAL":
            document.getElementById('gridSize').style.display = "block";
            break;
        case "ONLINE":
            mostrarOnline();
            break;
    }
}

function mostrarOnline() {
    document.getElementById("onlineMenu").style.display = "block";
    document.getElementById("menu").style.display = "none";
}
function mostrarInstrucciones() {
    document.getElementById("instrucciones").style.display = "block";
    document.getElementById("menu").style.display = "none";
}

function volverAlMenu() {
    // hideGame();
    juegoActivo = false;
    document.getElementById("menu").style.display = "block";
    document.getElementById("instrucciones").style.display = "none";
    document.getElementById("cpuLevels").style.display = "none";
    document.getElementById('gridSize').style.display = "none";
    document.getElementById("onlineMenu").style.display = "none";
    puntuacion.style.display = "none";
    document.getElementById('tiempoDisplay').style.display = "none";
    document.getElementById('gameOverlay').style.display = 'none';
    document.getElementById("canvasJuego").style.display = "none";
    document.getElementById('gameContainer').style.display = 'block';
    toggleChat(false);

}

function setCPU(level, size) {

    document.getElementById("cpuLevels").style.display = "none";
    document.getElementById("gridSize").style.display = "none";
    CONFIGURACION.cpuLevel = level;
    CONFIGURACION.gridSize = size;
    CONFIGURACION.timerEnabled = false;
    iniciarJuego();
}


function setGrid(size, timer) {
    CONFIGURACION.gridSize = size;
    CONFIGURACION.timerEnabled = timer === true;
    if (timer) {
        CONFIGURACION.timeLimit = 60;
    }

    iniciarJuego();
}

function iniciarJuego() {
    if (CONFIGURACION.modo === 'ONLINE') return;
    document.getElementById("menu").style.display = "none";
    document.getElementById("gridSize").style.display = "none";
    document.getElementById("cpuLevels").style.display = "none";
    document.getElementById('gameOverlay').style.display = 'none';
    document.getElementById("canvasJuego").style.display = "block";

    console.log("Modo:", CONFIGURACION.modo);
    console.log("Tamaño:", CONFIGURACION.gridSize);
    console.log("CPU:", CONFIGURACION.cpuLevel);
    console.log("Timer:", CONFIGURACION.timerEnabled);

    turnoJugador = true;
    juegoActivo = true;
    puntosJ1 = 0;
    puntosJ2 = 0;
    actualizarPuntuacion();
    detenerTemporizador();
    if (CONFIGURACION.timerEnabled) {
        document.getElementById("tiempoDisplay").style.display = "block";
        tiempoRestante = CONFIGURACION.timeLimit;
        iniciarTemporizador();
        actualizarTiempoDisplay();
    } else {
        document.getElementById("tiempoDisplay").style.display = "none";

    }

    crearTablero(CONFIGURACION.gridSize);
    document.getElementById("canvasJuego").style.display = "block";
    puntuacion.style.display = "block";
    console.log("Canvas y puntuación visibles");
}



function dibujarPuntos(gridSize) {
    const distancia = calcularDistancia(gridSize);
    ctx.fillStyle = "black";
    for (let fila = 0; fila < gridSize; fila++) {
        for (let col = 0; col < gridSize; col++) {
            let x = margin + col * distancia;
            let y = margin + fila * distancia;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function calcularDistancia(gridSize) {
    return (canvas.width - margin * 2) / (gridSize - 1);
}

function Square(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;

    this.top = false;
    this.bottom = false;
    this.left = false;
    this.right = false;
    this.owner = null;
}

function crearTablero(size) {
    squares = [];
    const distancia = calcularDistancia(size);

    for (let fila = 0; fila < size - 1; fila++) {
        squares[fila] = [];
        for (let col = 0; col < size - 1; col++) {
            let x = margin + col * distancia;
            let y = margin + fila * distancia;
            squares[fila][col] = new Square(x, y, distancia);
        }
    }
    dibujarTodo();
}

function dibujarTodo() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dibujarPuntos(CONFIGURACION.gridSize);

    for (let row of squares) {
        for (let square of row) {

            ctx.lineWidth = 3;
            ctx.strokeStyle = "black";

            if (square.top)
                drawLine(square.x, square.y, square.x + square.size, square.y);

            if (square.bottom)
                drawLine(square.x, square.y + square.size, square.x + square.size, square.y + square.size);

            if (square.left)
                drawLine(square.x, square.y, square.x, square.y + square.size);

            if (square.right)
                drawLine(square.x + square.size, square.y, square.x + square.size, square.y + square.size);

            if (square.owner !== null) {

                ctx.fillStyle = square.owner ? "lightskyblue" : "lightcoral";

                ctx.fillRect(
                    square.x + 5,
                    square.y + 5,
                    square.size - 10,
                    square.size - 10
                );
            }
        }
    }

    //2players

    if (CONFIGURACION.modo === "LOCAL" && !turnoJugador) {

        const lines = getAllAvailableLines();
        if (lines.length === 0) return;

        const selected = lines[cursorIndex];
        const square = selected.square;

        ctx.strokeStyle = "lightgrey";
        ctx.lineWidth = 5;

        if (selected.side === "top")
            drawLine(square.x, square.y, square.x + square.size, square.y);

        if (selected.side === "bottom")
            drawLine(square.x, square.y + square.size, square.x + square.size, square.y + square.size);

        if (selected.side === "left")
            drawLine(square.x, square.y, square.x, square.y + square.size);

        if (selected.side === "right")
            drawLine(square.x + square.size, square.y, square.x + square.size, square.y + square.size);
    }

}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

canvas.addEventListener("click", function (e) {
    if (!juegoActivo || squares.length === 0) return;

    const rect = canvas.getBoundingClientRect();//obtener posicion del canvas 
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    for (let r = 0; r < squares.length; r++) {
        for (let c = 0; c < squares[r].length; c++) {
            const square = squares[r][c];
            if (mx >= square.x && mx <= square.x + square.size && my >= square.y && my <= square.y + square.size) {
                const side = detectarLado(square, mx, my);
                if (!side) return;
                if (square[side]) return; // lado marcado

                // In online mode, only allow moves if it's the player's turn
                if (CONFIGURACION.modo === 'ONLINE') {

                    marcarLineaOnline(square, side, r, c);

                } else {

                    marcarLinea(square, side, r, c);
                }

                return;
            }
        }
    }
});

document.addEventListener("keydown", function (e) {
    if (!juegoActivo) return;
    if (CONFIGURACION.modo !== "LOCAL") return;
    if (turnoJugador) return; // Solo para jugador 2

    const lines = getAllAvailableLines();
    if (lines.length === 0) return;

    if (cursorIndex >= lines.length) cursorIndex = 0;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        cursorIndex = (cursorIndex + 1) % lines.length;
        e.preventDefault();
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        cursorIndex = (cursorIndex - 1 + lines.length) % lines.length;
        e.preventDefault();
    }


    if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        const chosen = lines[cursorIndex];
        marcarLinea(chosen.square, chosen.side, chosen.row, chosen.col);
    }

    dibujarTodo();
});


function detectarLado(square, mx, my) {

    const marginSide = 15;
    const topDist = Math.abs(my - square.y);
    const bottomDist = Math.abs(my - (square.y + square.size));
    const leftDist = Math.abs(mx - square.x);
    const rightDist = Math.abs(mx - (square.x + square.size));

    const min = Math.min(topDist, bottomDist, leftDist, rightDist);

    if (min > marginSide) return null;

    if (min === topDist) return "top";
    if (min === bottomDist) return "bottom";
    if (min === leftDist) return "left";
    if (min === rightDist) return "right";
}

function marcarLinea(square, side, row, col) {
    // Marcar lado del cuadrado actual
    square[side] = true;

    // Determinar el cuadrado vecino y su lado correspondiente
    let vecinoRow = row;
    let vecinoCol = col;
    let ladoVecino = "";

    switch (side) {
        case "top":
            vecinoRow = row - 1;
            ladoVecino = "bottom";
            break;
        case "bottom":
            vecinoRow = row + 1;
            ladoVecino = "top";
            break;
        case "left":
            vecinoCol = col - 1;
            ladoVecino = "right";
            break;
        case "right":
            vecinoCol = col + 1;
            ladoVecino = "left";
            break;
    }

    // Si el vecino existe, marcar su lado
    if (vecinoRow >= 0 && vecinoRow < squares.length && vecinoCol >= 0 && vecinoCol < squares[0].length) {
        squares[vecinoRow][vecinoCol][ladoVecino] = true;
    }

    // Verificar si se completó algún cuadrado (el actual o el vecino)
    let completo = false;
    if (square.top && square.bottom && square.left && square.right) {
        square.owner = turnoJugador;
        if (turnoJugador) puntosJ1++; else puntosJ2++;
        completo = true;
        actualizarPuntuacion();
    }
    // Verificar cuadrado vecino
    if (vecinoRow >= 0 && vecinoRow < squares.length && vecinoCol >= 0 && vecinoCol < squares[0].length) {
        let vecino = squares[vecinoRow][vecinoCol];
        if (vecino.top && vecino.bottom && vecino.left && vecino.right) {
            vecino.owner = turnoJugador;
            if (turnoJugador) puntosJ1++; else puntosJ2++;
            completo = true;
            actualizarPuntuacion();

        }
    }

    // Si no se completó ningún cuadrado, cambia el turno
    if (!completo) {
        turnoJugador = !turnoJugador;
    }

    dibujarTodo();

    if (juegoTerminado()) { mensajeGanador() }

    if (CONFIGURACION.modo === "CPU" && !turnoJugador) {
        setTimeout(turnoCPU, 500);
    }
}


//mensaje final 
function mensajeGanador() {
    juegoActivo = false;
    detenerTemporizador();
    let ganador = "";
    switch (CONFIGURACION.modo) {
        case "CPU":
            if (puntosJ1 > puntosJ2) ganador = "¡Gana Jugador 1!";
            else if (puntosJ2 > puntosJ1) ganador = "¡Gana CPU!";
            else ganador = "¡Empate!";
            break;
        case "LOCAL":
            if (puntosJ1 > puntosJ2) ganador = "¡Gana Jugador 1!";
            else if (puntosJ2 > puntosJ1) ganador = "¡Gana Jugador 2!";
            else ganador = "¡Empate!";
            break;
        default:
            alert('Opción no válida');
            volverAlMenu();
            return;
    }
    let result = 'DRAW';

    if (puntosJ1 > puntosJ2) {

        result = 'WIN';

    } else if (puntosJ1 < puntosJ2) {

        result = 'LOSE';
    }

    saveScore(
        puntosJ1,
        CONFIGURACION.modo,
        result
    );
    document.getElementById('gameResult').textContent = ganador;
    document.getElementById('finalPuntosJ1').textContent = puntosJ1;
    document.getElementById('finalPuntosJ2').textContent = puntosJ2;
    document.getElementById('gameOverlay').style.display = 'flex';

}

// Cuenta cuántos lados de un cuadrado están dibujados
function contarLados(square) {
    let count = 0;
    if (square.top) count++;
    if (square.bottom) count++;
    if (square.left) count++;
    if (square.right) count++;
    return count;
}

// Devuelve el cuadrado vecino según el lado, o null si no existe
function getNeighbor(row, col, side) {
    let r = row, c = col;
    switch (side) {
        case "top": r--; break;
        case "bottom": r++; break;
        case "left": c--; break;
        case "right": c++; break;
    }
    if (r >= 0 && r < squares.length && c >= 0 && c < squares[0].length) {
        return squares[r][c];
    }
    return null;
}

// Determina si dibujar esta línea completaría algún cuadrado
function cuadrado3Lados(square, side, row, col) {
    // Comprobar el cuadrado actual
    if (contarLados(square) === 3) return true;

    // Comprobar el vecino
    let neighbor = getNeighbor(row, col, side);
    if (neighbor) {
        let neighborSide;
        switch (side) {
            case "top": neighborSide = "bottom"; break;
            case "bottom": neighborSide = "top"; break;
            case "left": neighborSide = "right"; break;
            case "right": neighborSide = "left"; break;
        }
        if (contarLados(neighbor) === 3 && !neighbor[neighborSide]) return true;
    }
    return false;
}

function cuadrado2Lados(square, side, row, col) {
    let threat = false;
    // Cuadrado actual: si tiene 2 lados, pasaría a 3
    if (contarLados(square) === 2) threat = true;

    // Vecino
    let neighbor = getNeighbor(row, col, side);
    if (neighbor) {
        let neighborSide;
        switch (side) {
            case "top": neighborSide = "bottom"; break;
            case "bottom": neighborSide = "top"; break;
            case "left": neighborSide = "right"; break;
            case "right": neighborSide = "left"; break;
        }
        if (contarLados(neighbor) === 2 && !neighbor[neighborSide]) threat = true;
    }
    return threat;
}

function getAllAvailableLines() {
    const lines = [];
    for (let r = 0; r < squares.length; r++) {
        for (let c = 0; c < squares[r].length; c++) {
            const square = squares[r][c];
            if (!square.top) {
                lines.push({
                    square, side: 'top', row: r, col: c,
                    midX: square.x + square.size / 2,
                    midY: square.y
                });
            }
            if (!square.bottom) {
                lines.push({
                    square, side: 'bottom', row: r, col: c,
                    midX: square.x + square.size / 2,
                    midY: square.y + square.size
                });
            }
            if (!square.left) {
                lines.push({
                    square, side: 'left', row: r, col: c,
                    midX: square.x,
                    midY: square.y + square.size / 2
                });
            }
            if (!square.right) {
                lines.push({
                    square, side: 'right', row: r, col: c,
                    midX: square.x + square.size,
                    midY: square.y + square.size / 2
                });
            }
        }
    }
    // Eliminar duplicados 
    const uniqueMap = new Map();
    for (let line of lines) {
        const key = `${Math.round(line.midX)}_${Math.round(line.midY)}`;
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, line);
        }
    }

    // Convertir a array y ordenar por fila (midY) y luego columna (midX)
    const uniqueLines = Array.from(uniqueMap.values());
    uniqueLines.sort((a, b) => {
        if (a.midY !== b.midY) return a.midY - b.midY;
        return a.midX - b.midX;
    });

    return uniqueLines;
}

function cpuFacil() {
    const lines = getAllAvailableLines();
    if (lines.length === 0) return;
    // Pick random line
    const chosen = lines[Math.floor(Math.random() * lines.length)];
    marcarLinea(chosen.square, chosen.side, chosen.row, chosen.col);
}


function cpuMedio() {
    const lines = getAllAvailableLines();
    if (lines.length === 0) return;

    // Primero, si hay líneas que completan un cuadrado, tómalas
    const completing = lines.filter(line => cuadrado3Lados(line.square, line.side, line.row, line.col));
    if (completing.length > 0) {
        const chosen = completing[Math.floor(Math.random() * completing.length)];
        marcarLinea(chosen.square, chosen.side, chosen.row, chosen.col);
        return;
    }

    // Si no, evita crear nuevas amenazas
    const safe = lines.filter(line => !cuadrado2Lados(line.square, line.side, line.row, line.col));
    if (safe.length > 0) {
        const chosen = safe[Math.floor(Math.random() * safe.length)];
        marcarLinea(chosen.square, chosen.side, chosen.row, chosen.col);
    } else {
        // Todas las jugadas crean amenazas elegir una al azar
        const chosen = lines[Math.floor(Math.random() * lines.length)];
        marcarLinea(chosen.square, chosen.side, chosen.row, chosen.col);
    }
}


function cpuDificil() {
    const lines = getAllAvailableLines();
    if (lines.length === 0) return;

    // Close squares immediately
    const completing = lines.filter(line =>
        cuadrado3Lados(line.square, line.side, line.row, line.col)
    );

    if (completing.length > 0) {
        const chosen = completing[Math.floor(Math.random() * completing.length)];
        marcarLinea(chosen.square, chosen.side, chosen.row, chosen.col);
        return;
    }

    //  Safe moves
    const safe = lines.filter(line =>
        !cuadrado2Lados(line.square, line.side, line.row, line.col)
    );

    if (safe.length > 0) {
        const chosen = safe[Math.floor(Math.random() * safe.length)];
        marcarLinea(chosen.square, chosen.side, chosen.row, chosen.col);
        return;
    }

    //  if no safe moves choose move that gives least immediate squares
    let bestMove = lines[0];
    let minSquaresGiven = Infinity;

    for (let line of lines) {
        let count = 0;

        // Count how many squares would become 3-sided after this move
        if (cuadrado2Lados(line.square, line.side, line.row, line.col)) {
            count++;
        }

        if (count < minSquaresGiven) {
            minSquaresGiven = count;
            bestMove = line;
        }
    }

    marcarLinea(bestMove.square, bestMove.side, bestMove.row, bestMove.col);


}

function turnoCPU() {
    if (!juegoActivo) return;
    if (turnoJugador) return;
    if (CONFIGURACION.modo !== "CPU") return;

    switch (CONFIGURACION.cpuLevel) {
        case "facil":
            cpuFacil();
            break;
        case "medio":
            cpuMedio();
            break;
        case "dificil":
            cpuDificil();
            break;
        default:
            cpuFacil();
    }
}


function actualizarPuntuacion() {
    document.getElementById('puntosJ1').innerHTML = puntosJ1;
    document.getElementById('puntosJ2').innerHTML = puntosJ2;
}


function juegoTerminado() {
    // Verificar si todas las líneas están dibujadas
    for (let r = 0; r < squares.length; r++) {
        for (let c = 0; c < squares[r].length; c++) {
            const sq = squares[r][c];
            if (!sq.top || !sq.bottom || !sq.left || !sq.right) {
                return false;
            }
        }
    }
    return true;

}

function iniciarTemporizador() {
    if (intervaloReloj) clearInterval(intervaloReloj);
    tiempoRestante = CONFIGURACION.timeLimit || 60;
    actualizarTiempoDisplay();
    intervaloReloj = setInterval(() => {
        tiempoRestante--;
        actualizarTiempoDisplay();
        if (tiempoRestante <= 0) {
            terminarJuegoPorTiempo();
        }
    }, 1000);
}

function detenerTemporizador() {
    if (intervaloReloj) {
        clearInterval(intervaloReloj);
        intervaloReloj = null;
    }
}

function actualizarTiempoDisplay() {
    const tiempoSpan = document.getElementById('tiempo');
    if (tiempoSpan) {
        tiempoSpan.textContent = tiempoRestante;
    }
}


function terminarJuegoPorTiempo() {
    if (intervaloReloj) {
        clearInterval(intervaloReloj);
        intervaloReloj = null;
    }

    mensajeGanador();
}


