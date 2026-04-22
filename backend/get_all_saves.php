<?php
header("Access-Control-Allow-Origin: http://127.0.0.1:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

session_start();

// Include authentication script
require_once 'authenticate.php';

// Database connection
require_once 'connect_db.php';

// Fetch all results for authenticated user
try {
    $userId = $_SESSION['user_id']; 
    $stmt = $pdo->prepare("SELECT id, input_size, execution_time, algorithm, space_used, created_at FROM results WHERE user_id = :user_id AND deleted_at IS NULL ORDER BY created_at DESC");
    $stmt->execute(['user_id' => $userId]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "results" => $results
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch results", "details" => $e->getMessage()]);
    exit();
}
?>
