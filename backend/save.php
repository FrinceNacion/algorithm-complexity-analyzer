<?php
require_once __DIR__ . '/connect_db.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    http_response_code(400);
    exit();
}

$size = $data['size'] ?? null;
$time = $data['time'] ?? null;
$algo = $data['algorithm'] ?? null;
$space = $data['space'] ?? null;

if ($size === null || $time === null || $algo === null || $space === null) {
    http_response_code(400);
    die('Missing required fields');
}

$stmt = $pdo->prepare('INSERT INTO results (input_size, execution_time, algorithm, space_used) VALUES (:size, :time, :algo, :space)');
$stmt->execute([
    ':size' => $size,
    ':time' => $time,
    ':algo' => $algo,
    ':space' => $space,
]);

http_response_code(201);
echo json_encode(['success' => true, 'message' => 'Saved']);
?>