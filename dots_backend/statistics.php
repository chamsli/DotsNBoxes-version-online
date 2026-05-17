<?php
session_start();
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "No autorizado"]);
    exit;
}

$userId = $_SESSION['user_id'];

$stmt = $conn->prepare("
    SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN result = 'WIN' THEN 1 ELSE 0 END) AS wins,
        SUM(CASE WHEN result = 'LOSE' THEN 1 ELSE 0 END) AS losses,
        SUM(CASE WHEN result = 'DRAW' THEN 1 ELSE 0 END) AS draws
    FROM scores
    WHERE user_id = ?
");
$stmt->bind_param("i", $userId);
$stmt->execute();
$stats = $stmt->get_result()->fetch_assoc();

echo json_encode($stats);
