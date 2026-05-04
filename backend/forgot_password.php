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

require_once 'connect_db.php';

$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid JSON"]);
    exit();
}

$email = $input['email'] ?? null;
$newPassword = $input['newPassword'] ?? null;
$confirmPassword = $input['confirmPassword'] ?? null;

if (!$email || !$newPassword || !$confirmPassword) {
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

// Verify email exists
$stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = :email AND deleted_at IS NULL");
$stmt->bindParam(':email', $email);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'No account found with that email address.']);
    exit();
}

// Update password
$hashed_password = password_hash($newPassword, PASSWORD_DEFAULT);
$updateStmt = $pdo->prepare("UPDATE users SET password = :password WHERE user_id = :user_id");
$updateStmt->bindParam(':password', $hashed_password);
$updateStmt->bindParam(':user_id', $user['user_id']);

if ($updateStmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Password reset successfully.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to reset password.']);
}
