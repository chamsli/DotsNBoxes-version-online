CREATE database dots_multi;
USE dots_multi;

-- Table: users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: games
CREATE TABLE games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player1_id INT NOT NULL,
    player2_id INT DEFAULT NULL,
    game_state TEXT NOT NULL,     -- Stores the board as JSON
    current_turn INT NOT NULL,    -- player1_id or player2_id
    status ENUM('waiting', 'active', 'finished', 'abandoned') DEFAULT 'waiting',
    winner_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (player1_id) REFERENCES users(id),
    FOREIGN KEY (player2_id) REFERENCES users(id),
    FOREIGN KEY (current_turn) REFERENCES users(id),
    FOREIGN KEY (winner_id) REFERENCES users(id)
);
--tengo que modificar tabla games 

-- CREATE TABLE dots_games (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     player1 INT NOT NULL,
--     player2 INT DEFAULT NULL,
--     turn INT,           -- ID del jugador que debe jugar
--     winner INT DEFAULT NULL,
--     game_state TEXT NOT NULL,   -- JSON con el tablero completo
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (player1) REFERENCES users(id),
--     FOREIGN KEY (player2) REFERENCES users(id),
--     FOREIGN KEY (turn) REFERENCES users(id),
--     FOREIGN KEY (winner) REFERENCES users(id)
-- );



-- Table: scores (for leaderboard)
CREATE TABLE scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    score INT NOT NULL,
    game_mode ENUM('CPU', 'LOCAL', 'ONLINE') NOT NULL,
    date_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);