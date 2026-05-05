<?php
// Load configuration
require_once __DIR__ . '/config.php';

// CORS Handling
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, ALLOWED_ORIGINS)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Default to first allowed origin or none
    header("Access-Control-Allow-Origin: " . ALLOWED_ORIGINS[0]);
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json');

// Handle Preflight OPTIONS Request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['message' => 'Preflight check successful']);
    exit();
}

// Utility to get input data
function get_json_input() {
    $input = json_decode(file_get_contents("php://input"), true);
    if ($input === null && json_last_error() !== JSON_ERROR_NONE) {
        return null;
    }
    return $input;
}

// Common error response
function send_error($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $message]);
    exit();
}
