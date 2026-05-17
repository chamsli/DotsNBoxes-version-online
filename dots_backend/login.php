<?php
session_start();
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

$stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if ($user && password_verify($password, $user['password'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    echo json_encode([
        "status" => "ok",
        "id" => $user['id'],
        "username" => $user['username']
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "error" => "Usuario o contraseña incorrectos"
    ]);
}