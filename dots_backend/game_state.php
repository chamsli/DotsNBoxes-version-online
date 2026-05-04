<?php
session_start();
require 'db.php';
$gameId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

$stmt = $conn->prepare("
    SELECT g.*, 
           u1.username AS player1_name, 
           u2.username AS player2_name 
    FROM games g
    LEFT JOIN users u1 ON u1.id = g.player1_id
    LEFT JOIN users u2 ON u2.id = g.player2_id
    WHERE g.id = ?
");
$stmt->bind_param("i", $gameId);
$stmt->execute();
$result = $stmt->get_result();
$game = $result->fetch_assoc();

if ($game) {
    $game['me'] = $_SESSION['user_id'] ?? null;
    echo json_encode($game);
} else {
    echo json_encode(["error" => "Game not found"]);
}
