<?php
require_once __DIR__ . '/../bootstrap.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, "error" => "Unauthorized"]);
    exit();
}

echo json_encode([
    'success' => true,
    'user' => $_SESSION['user']
]);