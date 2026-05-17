<?php
session_start();
require 'db.php';
if (!isset($_SESSION['user_id'])) exit;

$uid = $_SESSION['user_id'];

// Create initial empty game state for a 5x5 grid
$gridSize = 5;
$spacing = (600 - 80) / ($gridSize - 1);


$squares = [];
for ($row = 0; $row < $gridSize - 1; $row++) {
    $squares[$row] = [];
    for ($col = 0; $col < $gridSize - 1; $col++) {
        $x = 40 + $col * $spacing;
$y = 40 + $row * $spacing;
$squares[$row][$col] = [
    "x" => $x,
    "y" => $y,
    "size" => $spacing,
    "top" => false,
    "bottom" => false,
    "left" => false,
    "right" => false,
    "owner" => null
];}}
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
