<?php
$conn = new mysqli("localhost", "root", "", "aco_db");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$data = json_decode(file_get_contents("php://input"), true);

$size = $data['size'];
$time = $data['time'];
$algo = $data['algo'];
$space = $data['space'];

$sql = "INSERT INTO results (input_size, execution_time, algorithm, space_used)
        VALUES ('$size', '$time', '$algo', '$space')";

$conn->query($sql);

$conn->close();
?>