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
require_once __DIR__ . '/send_verification.php'; // imports sendVerificationEmail()

$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit();
}

$email = $input['email'] ?? null;

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'A valid email address is required.']);
    exit();
}

// Find the unverified user
$stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = :email AND is_verified = 0 AND deleted_at IS NULL");
$stmt->bindParam(':email', $email);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    // Return a generic message to avoid exposing whether the email exists
    echo json_encode(['success' => true, 'message' => 'If your email is registered and unverified, a new link has been sent.']);
    exit();
}

// Delete any existing tokens for this user to avoid stale links
$del = $pdo->prepare("DELETE FROM email_verifications WHERE user_id = :user_id");
$del->bindParam(':user_id', $user['user_id']);
$del->execute();

// Send a fresh verification email
$result = sendVerificationEmail($pdo, $user['user_id'], $email);

if ($result === true) {
    echo json_encode(['success' => true, 'message' => 'A new verification email has been sent. Please check your inbox.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to send verification email: ' . $result]);
}
