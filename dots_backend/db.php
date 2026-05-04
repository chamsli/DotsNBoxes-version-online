<?php
$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'dots_multi';
$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "DB connection failed"]);
    exit;
}
