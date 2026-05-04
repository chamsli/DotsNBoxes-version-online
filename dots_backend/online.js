let currentUserId = null;
let currentGameId = null;
let pollingInterval = null;

// Mostrar el juego (menú principal) después de login
function showGame() {
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer) gameContainer.style.display = 'block';
    // Asegurar que el menú principal esté visible
    const menu = document.getElementById('menu');
    if (menu) menu.style.display = 'block';
    // Ocultar puntuación y canvas hasta que empiece la partida
    const puntuacion = document.getElementById('puntuacion');
    if (puntuacion) puntuacion.style.display = 'none';
}

function hideGame() {
    document.getElementById('gameContainer').style.display = 'none';
}

function checkSession() {
    fetch('../dots_backend/check_login.php', { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
            if (data.logged_in) {
                currentUserId = data.user_id;
                document.getElementById('loginRegisterPanel').style.display = 'none';
                document.getElementById('registerPanel').style.display = 'none';
                document.getElementById('userInfo').style.display = 'block';
                document.getElementById('loggedUsername').textContent = data.username;
                showGame();
            } else {
                currentUserId = null;
                document.getElementById('loginRegisterPanel').style.display = 'block';
                document.getElementById('userInfo').style.display = 'none';
                hideGame();
            }
        })
        .catch(err => console.error('Session check error', err));
}

// Login
document.getElementById('btnLogin').addEventListener('click', () => {
    const username = document.getElementById('loginUser').value;
    const password = document.getElementById('loginPass').value;
    fetch('../dots_backend/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                checkSession();
                document.getElementById('loginMessage').innerText = '';
            } else {
                document.getElementById('loginMessage').innerText = data.message;
            }
        });
});

// Mostrar/ocultar panel de registro
document.getElementById('btnShowRegister').addEventListener('click', () => {
    document.getElementById('loginRegisterPanel').style.display = 'none';
    document.getElementById('registerPanel').style.display = 'block';
});
document.getElementById('btnCancelRegister').addEventListener('click', () => {
    document.getElementById('registerPanel').style.display = 'none';
    document.getElementById('loginRegisterPanel').style.display = 'block';
});

// Registro
document.getElementById('btnRegister').addEventListener('click', () => {
    const username = document.getElementById('regUser').value;
    const password = document.getElementById('regPass').value;
    fetch('../dots_backend/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(r => r.text())
        .then(text => {
            if (text === 'success') {
                document.getElementById('registerMessage').innerText = 'Registro exitoso. Ahora inicia sesión.';
                setTimeout(() => {
                    document.getElementById('registerPanel').style.display = 'none';
                    document.getElementById('loginRegisterPanel').style.display = 'block';
                    document.getElementById('regUser').value = '';
                    document.getElementById('regPass').value = '';
                    document.getElementById('registerMessage').innerText = '';
                }, 1500);
            } else {
                document.getElementById('registerMessage').innerText = text;
            }
        });
});

// Logout
document.getElementById('btnLogout').addEventListener('click', () => {
    fetch('../dots_backend/logout.php', { credentials: 'include' })
        .then(() => checkSession());
});

// ========== MULTIPLAYER ONLINE ==========
async function createOnlineGame() {
    if (!currentUserId) { alert('Debes iniciar sesión'); return; }
    const res = await fetch('../dots_backend/create_game.php', { credentials: 'include' });
    const data = await res.json();
    if (data.game_id) {
        currentGameId = data.game_id;
        document.getElementById('codigoInput').value = data.game_id;
        document.getElementById('onlineStatus').innerText = 'Partida creada. Esperando oponente...';
        startPolling();
    } else {
        alert('Error al crear partida');
    }
}

async function joinOnlineGame() {
    if (!currentUserId) { alert('Debes iniciar sesión'); return; }
    const gameId = document.getElementById('codigoInput').value;
    if (!gameId) { alert('Introduce ID'); return; }
    const res = await fetch('../dots_backend/join_game.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId }),
        credentials: 'include'
    });
    const data = await res.json();
    if (data.status === 'active') {
        currentGameId = gameId;
        document.getElementById('onlineStatus').innerText = 'Te has unido. Iniciando...';
        startPolling();
    } else {
        alert('No se pudo unir');
    }
}

function startPolling() {
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(() => {
        if (!currentGameId) return;
        fetch(`../dots_backend/game_state.php?id=${currentGameId}`, { credentials: 'include' })
            .then(r => r.json())
            .then(state => {
                if (state.error) return;
                if (state.status === 'active') {
                    loadGameState(state.game_state);
                    if (state.current_turn == currentUserId) {
                        juegoActivo = true;
                        turnoJugador = true;
                    } else {
                        turnoJugador = false;
                    }
                } else if (state.status === 'finished') {
                    clearInterval(pollingInterval);
                    alert('Partida terminada');
                    volverAlMenu();
                }
            });
    }, 2000);
}

function loadGameState(gameStateJson) {
    const state = JSON.parse(gameStateJson);
    // Mostrar canvas y puntuación cuando se carga el estado
    document.getElementById('canvasJuego').style.display = 'block';
    document.getElementById('puntuacion').style.display = 'block';
    // Reconstruir tablero
    squares = [];
    for (let i = 0; i < state.squares.length; i++) {
        squares[i] = [];
        for (let j = 0; j < state.squares[i].length; j++) {
            const sq = state.squares[i][j];
            const newSquare = new Square(
                margin + j * calcularDistancia(state.gridSize),
                margin + i * calcularDistancia(state.gridSize),
                calcularDistancia(state.gridSize)
            );
            newSquare.top = sq.top;
            newSquare.bottom = sq.bottom;
            newSquare.left = sq.left;
            newSquare.right = sq.right;
            newSquare.owner = sq.owner;
            squares[i][j] = newSquare;
        }
    }
    puntosJ1 = state.scores[0];
    puntosJ2 = state.scores[1];
    actualizarPuntuacion();
    dibujarTodo();
}

// Sobrescribir función de movimiento para online
const originalMarcarLinea = marcarLinea;
function marcarLineaOnline(square, side, row, col) {
    if (CONFIGURACION.modo === 'ONLINE' && currentGameId) {
        fetch('../dots_backend/move.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ game_id: currentGameId, move: { row, col, side } }),
            credentials: 'include'
        }).catch(err => console.error(err));
    } else {
        originalMarcarLinea(square, side, row, col);
    }
}
marcarLinea = marcarLineaOnline;

// Botones online
document.getElementById('btnCrearSala').addEventListener('click', createOnlineGame);
document.getElementById('btnUnirse').addEventListener('click', joinOnlineGame);

// Iniciar sesión al cargar
document.addEventListener('DOMContentLoaded', checkSession);