<?php
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../utilities/connect_db.php';

$token = $_GET['token'] ?? null;

if (!$token) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Verification token is missing.']);
    exit();
}

// Sanitize token — should only be hex characters (64 chars from bin2hex(random_bytes(32)))
if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid token format.']);
    exit();
}

// Find the token and check expiry
$stmt = $pdo->prepare(
    "SELECT ev.user_id, ev.expires_at
     FROM email_verifications ev
     WHERE ev.token = :token"
);
$stmt->bindParam(':token', $token);
$stmt->execute();
$record = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$record) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Invalid or already-used verification link.']);
    exit();
}

if (strtotime($record['expires_at']) < time()) {
    // Clean up expired token
    $del = $pdo->prepare("DELETE FROM email_verifications WHERE token = :token");
    $del->bindParam(':token', $token);
    $del->execute();

    http_response_code(410);
    echo json_encode(['success' => false, 'error' => 'Verification link has expired. Please request a new one.']);
    exit();
}

$userId = $record['user_id'];

// Mark the user as verified
$update = $pdo->prepare("UPDATE users SET is_verified = 1 WHERE user_id = :user_id");
$update->bindParam(':user_id', $userId);
$update->execute();

// Delete the used token to prevent reuse
$del = $pdo->prepare("DELETE FROM email_verifications WHERE user_id = :user_id");
$del->bindParam(':user_id', $userId);
$del->execute();

echo json_encode(['success' => true, 'message' => 'Email verified successfully! You can now sign in.']);
