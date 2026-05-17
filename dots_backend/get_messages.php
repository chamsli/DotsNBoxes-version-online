<?php
session_start();
require "db.php";
$gameId = (int)($_GET['game_id'] ?? 0);
$lastId = (int)($_GET['last_id'] ?? 0);
$stmt = $conn->prepare("
    SELECT m.id, m.user_id, u.username, m.message, m.created_at
    FROM chat_messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.game_id = ? AND m.id > ?
    ORDER BY m.id ASC
");
$stmt->bind_param("ii", $gameId, $lastId);
$stmt->execute();
$result = $stmt->get_result();
$messages = [];
while ($row = $result->fetch_assoc()) {
    $messages[] = $row;
}
echo json_encode($messages);
