<?php
session_start();
require_once 'db_connect.php';

header('Content-Type: application/json');

// Decode incoming JSON request
$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? null;

if ($action === 'process_order') {
    $user_id = $_SESSION['user_id'] ?? null;
    $order_data = $data['order_data'] ?? [];
    $billing_info = $data['billing_info'] ?? [];
    $payment_method = $data['payment_method'] ?? 'card';

    // Validate required fields
    $required_fields = ['email', 'first_name', 'last_name', 'address', 'city', 'state', 'zip'];
    foreach ($required_fields as $field) {
        if (empty($billing_info[$field])) {
            echo json_encode(['status' => 'error', 'message' => 'Please fill in all required fields.']);
            exit();
        }
    }

    if (empty($order_data['items'])) {
        echo json_encode(['status' => 'error', 'message' => 'No items in cart.']);
        exit();
    }

    try {
        $conn->begin_transaction();

        // Create order record
        $order_total = $order_data['total'];
        $order_status = 'completed'; // In a real app, this would be 'pending' until payment is confirmed
        
        $stmt = $conn->prepare("INSERT INTO orders (user_id, email, total_amount, status, billing_info, payment_method, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())");
        $billing_json = json_encode($billing_info);
        $stmt->bind_param("isdsss", $user_id, $billing_info['email'], $order_total, $order_status, $billing_json, $payment_method);
        $stmt->execute();
        $order_id = $conn->insert_id;
        $stmt->close();

        // Create order items
        foreach ($order_data['items'] as $item) {
            $stmt = $conn->prepare("INSERT INTO order_items (order_id, beat_id, license_type, price) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("iisd", $order_id, $item['beat_id'], $item['license_type'], $item['price']);
            $stmt->execute();
            $stmt->close();
        }

        // Clear cart
        if ($user_id) {
            $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $stmt->close();
        } else {
            unset($_SESSION['cart']);
        }

        $conn->commit();

        echo json_encode([
            'status' => 'success',
            'message' => 'Order completed successfully!',
            'order_id' => $order_id
        ]);

    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['status' => 'error', 'message' => 'Order processing failed: ' . $e->getMessage()]);
    }

} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid action.']);
}

$conn->close();
?>