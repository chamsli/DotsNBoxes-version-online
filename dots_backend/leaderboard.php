<?php
require 'db.php';
$stmt = $conn->prepare("
    SELECT u.username, MAX(s.score) as best_score 
    FROM scores s 
    JOIN users u ON u.id = s.user_id 
    GROUP BY u.id 
    ORDER BY best_score DESC 
    LIMIT 10
");
$stmt->execute();
$result = $stmt->get_result();
$leaderboard = [];
while ($row = $result->fetch_assoc()) {
    $leaderboard[] = $row;
}
echo json_encode($leaderboard);
