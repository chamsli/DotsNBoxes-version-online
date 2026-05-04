<?php
session_start();
require 'db.php';
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$score = $data['score'] ?? 0;
$mode = $data['mode'] ?? 'LOCAL'; // CPU or LOCAL

$stmt = $conn->prepare("INSERT INTO scores (user_id, score, game_mode) VALUES (?, ?, ?)");
$stmt->bind_param("iis", $_SESSION['user_id'], $score, $mode);
$stmt->execute();
echo json_encode(["status" => "ok"]);
