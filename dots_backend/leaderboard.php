<?php
session_start();
require 'db.php';
$sql = "SELECT
u.username,
SUM(s.score) AS total_score,
COUNT(
    CASE
        WHEN s.result = 'WIN'
        THEN 1
    END
) AS wins
FROM scores s
JOIN users u
ON s.user_id = u.id
GROUP BY s.user_id
ORDER BY total_score DESC
LIMIT 5";
$result = $conn->query($sql);

$data = [];

while($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
