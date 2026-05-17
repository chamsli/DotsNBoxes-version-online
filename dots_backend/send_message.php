<?php
session_start();
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "No autorizado"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$gameId = (int)($input['game_id'] ?? 0);
$msg = trim($input['message'] ?? '');

if ($gameId <= 0 || $msg === '') {
    http_response_code(400);
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO chat_messages (game_id, user_id, message) VALUES (?, ?, ?)");
$stmt->bind_param("iis", $gameId, $_SESSION['user_id'], $msg);
if ($stmt->execute()) {
    echo json_encode(["status" => "ok"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error al guardar"]);
}
