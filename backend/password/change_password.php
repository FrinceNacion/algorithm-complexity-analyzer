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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

require_once __DIR__ . '/../utilities/connect_db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, "error" => "Unauthorized"]);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid JSON"]);
    exit();
}

$currentPassword = $input['currentPassword'] ?? null;
$newPassword = $input['newPassword'] ?? null;
$confirmPassword = $input['confirmPassword'] ?? null;

if (!$currentPassword || !$newPassword || !$confirmPassword) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'All fields are required.']);
    exit();
}

if ($newPassword !== $confirmPassword) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'New password and confirm password do not match.']);
    exit();
}

if (strlen($newPassword) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Password must be at least 8 characters long.']);
    exit();
}

// Get user from DB to verify current password
$stmt = $pdo->prepare("SELECT password FROM users WHERE user_id = :user_id AND deleted_at IS NULL");
$stmt->bindParam(':user_id', $_SESSION['user_id']);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($currentPassword, $user['password'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Incorrect current password.']);
    exit();
}

// Update password
$hashed_password = password_hash($newPassword, PASSWORD_DEFAULT);
$updateStmt = $pdo->prepare("UPDATE users SET password = :password WHERE user_id = :user_id");
$updateStmt->bindParam(':password', $hashed_password);
$updateStmt->bindParam(':user_id', $_SESSION['user_id']);

if ($updateStmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Password updated successfully.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to update password.']);
}
