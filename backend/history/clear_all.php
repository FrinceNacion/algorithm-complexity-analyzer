<?php
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../utilities/connect_db.php';
require_once __DIR__ . '/../utilities/authenticate.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_error('Method not allowed', 405);
}

try {
    $userId = $_SESSION['user_id'];
    
    // Soft delete all records for the user
    $stmt = $pdo->prepare("UPDATE results SET deleted_at = NOW() WHERE user_id = :user_id AND deleted_at IS NULL");
    $stmt->execute(['user_id' => $userId]);

    echo json_encode([
        "success" => true,
        "message" => "History cleared successfully",
        "count" => $stmt->rowCount()
    ]);
} catch (PDOException $e) {
    send_error('Database error: ' . $e->getMessage(), 500);
}
