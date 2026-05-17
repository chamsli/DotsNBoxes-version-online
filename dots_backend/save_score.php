<?php
header('Content-Type: application/json');
session_start();
require 'db.php';
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "No autorizado"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$userId = $_SESSION['user_id'];
$score = isset($data['score']) ? (int)$data['score'] : 0;
$mode = $data['mode'] ?? 'ONLINE';
$result = $data['result'] ?? 'WIN';

$stmt = $conn->prepare("INSERT INTO scores (user_id, score, game_mode, result) VALUES (?, ?, ?, ?)");
$stmt->bind_param("iiss", $userId, $score, $mode, $result);
if ($stmt->execute()) {

    echo json_encode([
        "status" => "ok"
    ]);

} else {

    http_response_code(500);

    echo json_encode([
        "error" => "Error guardando score"
    ]);
}
