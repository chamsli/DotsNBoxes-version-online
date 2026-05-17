<?php
header('Content-Type: application/json');
session_start();
require 'db.php';
$gameId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

$stmt = $conn->prepare(
    "SELECT
        g.*,
        u1.username AS player1_name,
        u2.username AS player2_name
    FROM games g
    JOIN users u1 ON g.player1_id = u1.id
    LEFT JOIN users u2 ON g.player2_id = u2.id
    WHERE g.id = ?"
);
$stmt->bind_param("i", $gameId);
$stmt->execute();
$result = $stmt->get_result();
$game = $result ? $result->fetch_assoc() : null;

if ($game) {
    $game['game_state'] = json_decode($game['game_state'], true);
    $game['me'] = $_SESSION['user_id'] ?? null;
    echo json_encode($game);
} else {
    echo json_encode(["error" => "Game not found"]);
}