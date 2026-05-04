<?php
session_start();
require 'db.php';
if (!isset($_SESSION['user_id'])) exit;

$uid = $_SESSION['user_id'];

$gridSize = 5;
$spacing = (600 - 80) / ($gridSize - 1);
$squares = [];
for ($row = 0; $row < $gridSize - 1; $row++) {
    for ($col = 0; $col < $gridSize - 1; $col++) {
        $squares[$row][$col] = [
            "top" => false, "bottom" => false, "left" => false, "right" => false,
            "owner" => null
        ];
    }
}
$gameState = json_encode([
    "gridSize" => $gridSize,
    "squares" => $squares,
    "scores" => [0, 0],
    "currentTurn" => $uid
]);

$stmt = $conn->prepare("INSERT INTO games (player1_id, current_turn, game_state, status) VALUES (?, ?, ?, 'waiting')");
$stmt->bind_param("iis", $uid, $uid, $gameState);
$stmt->execute();
$gameId = $stmt->insert_id;

echo json_encode(["game_id" => $gameId]);
