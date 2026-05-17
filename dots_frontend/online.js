let currentUserId = null;
let currentGameId = null;
let pollingInterval = null;


let isPlayer1 = false;

const btnCrearSala = document.getElementById('btnCrearSala');
const btnUnirse = document.getElementById('btnUnirse');
// =========================
// SHOW / HIDE GAME
// =========================

function showGame() {

    document.getElementById('gameContainer').style.display = 'block';

    document.getElementById('menu').style.display = 'block';

    document.getElementById('puntuacion').style.display = 'none';
    loadPlayerStats()
}

function hideGame() {

    document.getElementById('gameContainer').style.display = 'none';
}

// =========================
// CHECK SESSION
// =========================

function checkSession() {

    fetch('../dots_backend/check_login.php', {
        credentials: 'include'
    })
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
        });
    loadPlayerStats()
}

// =========================
// LOGIN
// =========================

document.getElementById('btnLogin').addEventListener('click', () => {

    const username = document.getElementById('loginUser').value;

    const password = document.getElementById('loginPass').value;

    fetch('../dots_backend/login.php', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            username,
            password
        }),

        credentials: 'include'
    })

        .then(r => r.json())

        .then(data => {

            if (data.status === 'ok') {

                checkSession();

                document.getElementById('loginMessage').innerText = '';

            } else {

                document.getElementById('loginMessage').innerText =
                    'Usuario o contraseña incorrectos';
            }
        });
});

// =========================
// REGISTER
// =========================



document.getElementById('goRegister')
    .addEventListener('click', () => {

        document.getElementById('loginRegisterPanel').style.display = 'none';

        document.getElementById('registerPanel').style.display = 'flex';
    });

document.getElementById('goLogin')
    .addEventListener('click', () => {

        document.getElementById('registerPanel').style.display = 'none';

        document.getElementById('loginRegisterPanel').style.display = 'flex';
    });



document.getElementById('btnRegister').addEventListener('click', () => {

    const username = document.getElementById('regUser').value;

    const password = document.getElementById('regPass').value;

    fetch('../dots_backend/register.php', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            username,
            password
        })
    })

        .then(r => r.text())

        .then(text => {

            if (text === 'success') {

                document.getElementById('registerMessage').innerText =
                    'Registro exitoso';

            } else {

                document.getElementById('registerMessage').innerText = text;
            }
        });
});

// =========================
// LOGOUT
// =========================

document.getElementById('btnLogout').addEventListener('click', () => {

    fetch('../dots_backend/logout.php', {
        credentials: 'include'
    })

        .then(() => {

            currentUserId = null;

            currentGameId = null;

            if (chatPollInterval) {
                clearInterval(chatPollInterval);
            }

            chatStarted = false;

            checkSession();
        });
});

// =========================
// CREATE GAME
// =========================

async function createOnlineGame() {

    CONFIGURACION.modo = 'ONLINE';

    const res = await fetch('../dots_backend/create_game.php', {
        credentials: 'include'
    });

    const data = await res.json();

    if (data.game_id) {

        currentGameId = data.game_id;
        isPlayer1 = true;
        document.getElementById('chatMessages').innerHTML = '';
        lastChatId = 0;
        chatStarted = false;

        document.getElementById('codigoInput').value =
            currentGameId;

        document.getElementById('onlineStatus').innerText =
            'Sala creada. Esperando jugador...';

        startPolling();
    }
}

// =========================
// JOIN GAME
// =========================

async function joinOnlineGame() {

    CONFIGURACION.modo = 'ONLINE';

    const gameId = parseInt(
        document.getElementById('codigoInput').value,
        10
    );

    if (Number.isNaN(gameId) || gameId <= 0) {
        alert('Ingrese un código de sala válido');
        return;
    }

    const res = await fetch('../dots_backend/join_game.php', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            game_id: gameId
        }),

        credentials: 'include'
    });

    const text = await res.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (err) {
        console.error('Join game invalid JSON response:', text);
        alert('Error al unir: respuesta inválida del servidor. Mira la consola.');
        return;
    }

    if (data.status === 'active') {

        currentGameId = gameId;
        isPlayer1 = false;
        document.getElementById('chatMessages').innerHTML = '';
        lastChatId = 0;
        chatStarted = false;

        document.getElementById('onlineStatus').innerText =
            'Conectado a la partida';

        startPolling();

    } else {

        alert('No se pudo unir');
    }
}

// =========================
// POLLING
// =========================

function startPolling() {

    if (pollingInterval) {
        clearInterval(pollingInterval);
    }

    pollingInterval = setInterval(() => {

        if (!currentGameId) return;

        fetch(`../dots_backend/game_state.php?id=${currentGameId}`, {
            credentials: 'include'
        })
            .then(async r => {
                const text = await r.text();
                try {
                    return JSON.parse(text);
                } catch (err) {
                    console.error('game_state invalid JSON response:', text);
                    return { error: 'Invalid server response' };
                }
            })
            .then(state => {

                if (state.error) return;

                if (state.status === 'active') {

                    document.getElementById('canvasJuego').style.display = 'block';

                    document.getElementById('puntuacion').style.display = 'block';

                    juegoActivo = true;
                    toggleChat(true);
                    if (!chatStarted) {
                        startChatPolling();
                        chatStarted = true;
                    }

                    if (state.game_state) {
                        loadGameState(state.game_state);
                    }

                    turnoJugador =
                        (state.current_turn == currentUserId);


                    document.getElementById('onlinePlayers').style.display = 'block';

                    document.getElementById('player1Name').textContent =
                        state.player1_name;

                    document.getElementById('player2Name').textContent =
                        state.player2_name || 'Esperando...';

                    document.getElementById('turnoTexto').textContent =
                        turnoJugador
                            ? 'Tu turno'
                            : 'Turno del rival';


                } else if (state.status === 'finished') {
                    // Cargar el estado final del tablero
                    loadGameState(state.game_state);
                    // Detener los intervalos de polling
                    clearInterval(pollingInterval);
                    if (chatPollInterval) {
                        clearInterval(chatPollInterval);
                    }
                    chatStarted = false;

                    // Determinar resultado y guardar puntuación
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

                    // Mostrar overlay con el resultado
                    let ganador = '';
                    if (puntosJ1 > puntosJ2) ganador = '¡Gana Jugador 1!';
                    else if (puntosJ2 > puntosJ1) ganador = '¡Gana Jugador 2!';
                    else ganador = '¡Empate!';

                    document.getElementById('gameResult').textContent = ganador;
                    document.getElementById('finalPuntosJ1').textContent = puntosJ1;
                    document.getElementById('finalPuntosJ2').textContent = puntosJ2;
                    document.getElementById('gameOverlay').style.display = 'flex';
                }



            });

    }, 1000);
}

// =========================
// LOAD GAME STATE
// =========================

function loadGameState(gameStateJson) {

    const state = typeof gameStateJson === 'string'
        ? JSON.parse(gameStateJson)
        : gameStateJson;

    squares = [];

    for (let i = 0; i < state.squares.length; i++) {

        squares[i] = [];

        for (let j = 0; j < state.squares[i].length; j++) {

            const s = state.squares[i][j];

            const sq = new Square(
                s.x,
                s.y,
                s.size
            );

            sq.top = s.top;
            sq.bottom = s.bottom;
            sq.left = s.left;
            sq.right = s.right;
            sq.owner = s.owner;

            squares[i][j] = sq;
        }
    }

    puntosJ1 = state.scores
        ? state.scores[0]
        : 0;

    puntosJ2 = state.scores
        ? state.scores[1]
        : 0;

    actualizarPuntuacion();

    dibujarTodo();
}

// =========================
// SEND MOVE
// =========================

function marcarLineaOnline(square, side, row, col) {

    if (!turnoJugador) return;

    fetch('../dots_backend/move.php', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({

            game_id: currentGameId,
            row,
            col,
            side
        }),

        credentials: 'include'
    })

        .then(r => r.json())

        .then(data => {

            if (data.error) {
                console.error(data.error);
                return;
            }

            loadGameState(data.game_state);
        });
}

// =========================
// OVERRIDE GAME FUNCTION
// =========================

const originalMarcarLinea = marcarLinea;

marcarLinea = function (square, side, row, col) {

    if (CONFIGURACION.modo === 'ONLINE') {

        marcarLineaOnline(square, side, row, col);

    } else {

        originalMarcarLinea(square, side, row, col);
    }
};



// =========================
// CHAT FUNCTIONALITY
// =========================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

let lastChatId = 0;
let chatPollInterval = null;
let chatStarted = false;


function startChatPolling() {

    if (chatPollInterval)
        clearInterval(chatPollInterval);

    fetchMessages();

    chatPollInterval = setInterval(() => {

        if (
            currentGameId &&
            CONFIGURACION.modo === 'ONLINE'
        ) {
            fetchMessages();
        }

    }, 1000);
}

function fetchMessages() {

    fetch(`../dots_backend/get_messages.php?game_id=${currentGameId}&last_id=${lastChatId}`, {
        credentials: 'include'
    })
        .then(r => r.json())
        .then(messages => {

            if (!messages || !messages.length) return;

            const chatDiv = document.getElementById('chatMessages');

            messages.forEach(msg => {

                lastChatId = msg.id;

                const bubble = document.createElement('div');

                bubble.className =
                    'chat-bubble ' +
                    (msg.user_id == currentUserId ? 'mine' : 'theirs');

                bubble.innerHTML = `
                <div class="chat-username">${escapeHtml(msg.username)}</div>
                <div class="chat-text">${escapeHtml(msg.message)}</div>
                <div class="chat-time">
                    ${new Date(msg.created_at).toLocaleTimeString()}
                </div>
            `;

                chatDiv.appendChild(bubble);
            });

            chatDiv.scrollTop = chatDiv.scrollHeight;
        });
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg || !currentGameId) {
        console.warn("No message or gameId", { msg, currentGameId });
        return;
    }
    input.value = '';
    fetch('../dots_backend/send_message.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: currentGameId, message: msg }),
        credentials: 'include'
    })
        .then(r => r.json())
        .then(data => {

            if (data.status === 'ok') {

                fetchMessages();
            }
        })
}



// Conectar el botón de enviar
document.getElementById('sendChatBtn')?.addEventListener('click', sendChatMessage);
document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
});

// Mostrar/ocultar el chat cuando cambie el estado de la partida
function toggleChat(show) {
    const panel = document.getElementById('chatPanel');
    if (panel) panel.style.display = show ? 'block' : 'none';
}



function loadLeaderboard() {

    fetch('../dots_backend/leaderboard.php')

        .then(r => r.json())

        .then(players => {

            const board =
                document.getElementById('leaderboardList');

            board.innerHTML = '';

            players.forEach((p, index) => {

                board.innerHTML += `
                <div class="leader-row">
                    <span>#${index + 1} ${p.username}</span>
                    <strong>${p.total_score}</strong>
                </div>
            `;
            });
        });
}

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    loadLeaderboard();
});




function saveScore(score, mode, result) {

    console.log("SAVE SCORE CALLED");

    fetch('../dots_backend/save_score.php', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({

            score: score,

            mode: mode,

            result: result
        }),

        credentials: 'include'
    })
        .then(r => r.json())
        .then(data => {

            console.log("SERVER RESPONSE", data);

            if (typeof loadLeaderboard === 'function') {
                loadLeaderboard();
            }
        })
        .catch(console.error);
}

// =========================
// PLAYER STATS
function loadPlayerStats() {
    if (!currentUserId) return;
    fetch('../dots_backend/statistics.php', { credentials: 'include' })
        .then(r => r.json())
        .then(stats => {
            document.getElementById('statWins').innerText = stats.wins || 0;
            document.getElementById('statLosses').innerText = stats.losses || 0;
            document.getElementById('statDraws').innerText = stats.draws || 0;
            document.getElementById('statTotal').innerText = stats.total || 0;
        })
        .catch(console.error);
}