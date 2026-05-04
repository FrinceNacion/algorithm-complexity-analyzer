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
session_start();

$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    echo json_encode(["success" => false, "error" => "Invalid JSON"]);
    exit();
}

$email    = $input['email']    ?? null;
$password = $input['password'] ?? null;

$stmt = $pdo->prepare("SELECT user_id, name, email, role, password, is_verified FROM users WHERE email = :email AND deleted_at IS NULL");
$stmt->bindParam(':email', $email);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($password, $user['password'])) {

    // Block login if email is not verified
    if (!$user['is_verified']) {
        http_response_code(403);
        echo json_encode([
            'success'    => false,
            'error'      => 'unverified',
            'email'      => $email,
            'message'    => 'Your email address has not been verified yet. Please check your inbox or request a new verification link.'
        ]);
        exit();
    }

    $_SESSION['user_id'] = $user['user_id'];
    session_regenerate_id(true);

    unset($user['user_id']);
    unset($user['password']);
    unset($user['is_verified']); // don't expose this field to the client

    $_SESSION['user'] = $user;

    echo json_encode([
        'success' => true,
        'user'    => $user
    ]);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid email or password']);
}