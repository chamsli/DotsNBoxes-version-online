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


-- Table: scores (for leaderboard)
CREATE TABLE scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    score INT NOT NULL,
    game_mode ENUM('CPU', 'LOCAL', 'ONLINE') NOT NULL,
    date_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result ENUM('WIN','LOSE','DRAW') DEFAULT 'DRAW',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de chat (mensajes por partida)
CREATE TABLE chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

