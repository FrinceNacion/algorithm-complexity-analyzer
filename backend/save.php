<?php
header("Access-Control-Allow-Origin: http://127.0.0.1:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['message' => 'Preflight check successful']);
    exit();
}

session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

require_once 'authenticate.php';

require_once 'connect_db.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid JSON"]);
    exit();
}

$user_id = $input['userId'] ?? null;
$size = $input['size'] ?? null;
$time = $input['time'] ?? null;
$algorithm = $input['algorithm'] ?? null;
$space = $input['space'] ?? null;

if ($user_id === null || $size === null || $time === null || $algorithm === null || $space === null) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit();
}

$stmt = $pdo->prepare('INSERT INTO results ( user_id, input_size, execution_time, algorithm, space_used) VALUES (:user_id, :size, :time, :algorithm, :space)');
$stmt->bindParam(':user_id', $user_id);
$stmt->bindParam(':size', $size);
$stmt->bindParam(':time', $time);
$stmt->bindParam(':algorithm', $algorithm);
$stmt->bindParam(':space', $space);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Saved']);
}else{
    http_response_code(501);
    echo json_encode(['success' => false, 'message' => 'Failed to save']);
}