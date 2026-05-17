<?php
header('Content-Type: application/json');
session_start();
require 'db.php';
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "error" => "No estás autenticado"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$gameId = isset($data['game_id']) ? (int)$data['game_id'] : 0;

if ($gameId <= 0) {
    echo json_encode(["status" => "error", "error" => "Código de sala inválido"]);
    exit;
}

$stmt = $conn->prepare("UPDATE games SET player2_id = ?, status = 'active' WHERE id = ? AND player2_id IS NULL");
$stmt->bind_param("ii", $_SESSION['user_id'], $gameId);
if ($stmt->execute() && $stmt->affected_rows > 0) {
    echo json_encode(["status" => "active"]);
} else {
    echo json_encode(["status" => "error"]);
}