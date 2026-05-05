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
require_once __DIR__ . '/../email/send_verification.php'; // imports sendVerificationEmail()

$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    echo json_encode(["success" => false, "error" => "Invalid JSON"]);
    exit();
}

$name     = $input['name']     ?? null;
$email    = $input['email']    ?? null;
$password = $input['password'] ?? null;

if (!$name || !$email || !$password) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'All fields are required.']);
    exit();
}

// Check if name or email already exists
$stmt = $pdo->prepare("SELECT * FROM users WHERE (name = :name OR email = :email) AND deleted_at IS NULL");
$stmt->bindParam(':name',  $name);
$stmt->bindParam(':email', $email);
$stmt->execute();

$user = $stmt->fetch(PDO::FETCH_ASSOC);
if ($user) {
    echo json_encode(['error' => 'Name or email already exists']);
    exit();
}

// Insert new user (is_verified defaults to 0 from DB schema)
$hashed_password = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare("INSERT INTO users (name, password, email) VALUES (:name, :password, :email)");
$stmt->bindParam(':name',     $name);
$stmt->bindParam(':password', $hashed_password);
$stmt->bindParam(':email',    $email);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['error' => 'Registration failed']);
    exit();
}

$userId = (int) $pdo->lastInsertId();

// Send verification email — report any mail errors but don't block registration
$mailResult = sendVerificationEmail($pdo, $userId, $email);

if ($mailResult === true) {
    echo json_encode([
        'success' => true,
        'message' => 'Registration successful! A verification email has been sent to ' . $email . '. Please verify before signing in.'
    ]);
} else {
    // Account was created but email failed — user can resend later
    echo json_encode([
        'success'       => true,
        'mailError'     => true,
        'message'       => 'Account created, but the verification email could not be sent. Please use the resend option on the login page.'
    ]);
}