<?php
session_start();
require_once 'db_connect.php';

header('Content-Type: application/json');

// Check if user is logged in and is a producer
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Authentication required.']);
    exit();
}

$user_id = $_SESSION['user_id'];
$stmt = $conn->prepare("SELECT is_producer FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user_data = $result->fetch_assoc();
$stmt->close();

if (!$user_data || $user_data['is_producer'] != 1) {
    echo json_encode(['status' => 'error', 'message' => 'Access denied. Producer privileges required.']);
    exit();
}

// Process incoming requests
$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? null;

if ($action === 'delete_beat') {
    $beat_id = $data['beat_id'] ?? null;

    if ($beat_id) {
        // IMPORTANT: Ensure the producer can only delete THEIR OWN beats
        $delete_stmt = $conn->prepare("DELETE FROM beats WHERE id = ? AND producer_id = ?");
        $delete_stmt->bind_param("ii", $beat_id, $user_id);

        if ($delete_stmt->execute()) {
            if ($delete_stmt->affected_rows > 0) {
                echo json_encode(['status' => 'success', 'message' => 'Beat deleted successfully.']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Beat not found or you do not have permission to delete it.']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $conn->error]);
        }
        $delete_stmt->close();
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Beat ID is missing.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid action.']);
}

$conn->close();
?>