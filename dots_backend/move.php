<?php
session_start();
require "db.php";

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

$gameId = (int)$input['game_id'];
$row = (int)$input['row'];
$col = (int)$input['col'];
$side = $input['side'];

$uid = $_SESSION['user_id'];

$stmt = $conn->prepare("SELECT * FROM games WHERE id = ?");
$stmt->bind_param("i", $gameId);
$stmt->execute();

$game = $stmt->get_result()->fetch_assoc();

if (!$game) {
    echo json_encode(["error" => "Game not found"]);
    exit;
}

if ($game['winner_id']) {
    echo json_encode(["error" => "Game finished"]);
    exit;
}

if ($uid != $game['current_turn']) {
    echo json_encode(["error" => "Not your turn"]);
    exit;
}

$state = json_decode($game['game_state'], true);

$squares = $state['squares'];
$size = $state['gridSize'];

$scores = $state['scores'] ?? [0, 0];

$score1 = $scores[0];
$score2 = $scores[1];

if ($squares[$row][$col][$side]) {
    echo json_encode(["error" => "Line already exists"]);
    exit;
}

$squares[$row][$col][$side] = true;

$nRow = $row;
$nCol = $col;
$nSide = '';

switch ($side) {

    case 'top':
        $nRow--;
        $nSide = 'bottom';
        break;

    case 'bottom':
        $nRow++;
        $nSide = 'top';
        break;

    case 'left':
        $nCol--;
        $nSide = 'right';
        break;

    case 'right':
        $nCol++;
        $nSide = 'left';
        break;
}

if (
    $nRow >= 0 &&
    $nRow < count($squares) &&
    $nCol >= 0 &&
    $nCol < count($squares[0])
) {
    $squares[$nRow][$nCol][$nSide] = true;
}

$isPlayer1 = ($uid == $game['player1_id']);

$points = 0;

function isComplete($sq)
{
    return (
        $sq['top'] &&
        $sq['bottom'] &&
        $sq['left'] &&
        $sq['right']
    );
}

if (
    isComplete($squares[$row][$col]) &&
    $squares[$row][$col]['owner'] === null
) {
    $squares[$row][$col]['owner'] = $isPlayer1;
    $points++;
}

if (
    $nRow >= 0 &&
    $nRow < count($squares) &&
    $nCol >= 0 &&
    $nCol < count($squares[0])
) {

    if (
        isComplete($squares[$nRow][$nCol]) &&
        $squares[$nRow][$nCol]['owner'] === null
    ) {
        $squares[$nRow][$nCol]['owner'] = $isPlayer1;
        $points++;
    }
}

if ($isPlayer1) {
    $score1 += $points;
} else {
    $score2 += $points;
}

$totalSquares = ($size - 1) * ($size - 1);

$finished = (($score1 + $score2) >= $totalSquares);

$nextTurn = $uid;

if ($points == 0) {

    $nextTurn = ($uid == $game['player1_id'])
        ? $game['player2_id']
        : $game['player1_id'];
}

$winner = null;

if ($finished) {

    if ($score1 > $score2) {
        $winner = $game['player1_id'];
        $nextTurn = $game['player1_id'];
    } elseif ($score2 > $score1) {
        $winner = $game['player2_id'];
        $nextTurn = $game['player2_id'];
    } else {
        // Empate, mantener el turno del jugador actual
        $nextTurn = $uid;
    }
}

$newState = json_encode([
    "gridSize" => $size,
    "squares" => $squares,
    "scores" => [$score1, $score2]
]);

$status = $finished ? 'finished' : 'active';

$update = $conn->prepare("
    UPDATE games
    SET
        game_state = ?,
        current_turn = ?,
        winner_id = ?,
        status = ?
    WHERE id = ?
");

$update->bind_param(
    "siisi",
    $newState,
    $nextTurn,
    $winner,
    $status,
    $gameId
);

if (!$update->execute()) {
    echo json_encode([
        "error" => $conn->error
    ]);
    exit;
}
echo json_encode([
    "status" => "ok",
    "game_state" => json_decode($newState),
    "turn" => $nextTurn,
    "winner" => $winner
]);