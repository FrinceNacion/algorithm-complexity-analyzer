<?php
require_once __DIR__ . '/../bootstrap.php';

session_start();
session_unset();
session_destroy();

echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
