<?php
require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../utilities/connect_db.php';
require_once __DIR__ . '/../utilities/authenticate.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_error('Method not allowed', 405);
}

$input = get_json_input();
$id = $input['id'] ?? null;

if (!$id) {
    send_error('ID is required');
}

// Check if ID is a backend ID (e.g., "backend-123") or just "123"
// In the frontend, it might be prefixed with "backend-"
if (strpos($id, 'backend-') === 0) {
    $id = substr($id, 8);
}

try {
    $userId = $_SESSION['user_id'];
    
    // Soft delete the record
    $stmt = $pdo->prepare("UPDATE results SET deleted_at = NOW() WHERE id = :id AND user_id = :user_id");
    $stmt->execute([
        'id' => $id,
        'user_id' => $userId
    ]);

    if ($stmt->rowCount() > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Record deleted successfully"
        ]);
    } else {
        send_error('Record not found or unauthorized', 404);
    }
} catch (PDOException $e) {
    send_error('Database error: ' . $e->getMessage(), 500);
}
