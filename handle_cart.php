<?php
session_start();
require_once 'db_connect.php';

// Decode incoming JSON request
$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? null;
$beat_id = $data['beat_id'] ?? null;
$user_id = $_SESSION['user_id'] ?? null;

header('Content-Type: application/json');

// --- ADD TO CART ---
if ($action === 'add' && $beat_id) {
    // Note: The `license_type` passed from `main.js` is not stored in the `cart` table
    // in this simplified implementation. For a full solution, your `cart` table
    // would need a `license_type` column (e.g., ALTER TABLE cart ADD COLUMN license_type VARCHAR(50) DEFAULT 'MP3 Lease';).
    // For now, only the beat_id is stored.

    if ($user_id) { // Logged-in user
        // Using INSERT IGNORE to prevent duplicate entries if a beat is added multiple times to cart
        $stmt = $conn->prepare("INSERT IGNORE INTO cart (user_id, beat_id) VALUES (?, ?)");
        $stmt->bind_param("ii", $user_id, $beat_id);
        $stmt->execute();
    } else { // Guest user
        if (!isset($_SESSION['cart'])) {
            $_SESSION['cart'] = [];
        }
        // Add beat_id only if it's not already there
        if (!in_array($beat_id, $_SESSION['cart'])) {
            $_SESSION['cart'][] = (int)$beat_id;
        }
    }
    echo json_encode(['status' => 'success', 'message' => 'Added to cart!']);
    exit();
}

// --- REMOVE FROM CART ---
if ($action === 'remove' && $beat_id) {
    if ($user_id) { // Logged-in user
        $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ? AND beat_id = ?");
        $stmt->bind_param("ii", $user_id, $beat_id);
        $stmt->execute();
    } else { // Guest user
        if (isset($_SESSION['cart'])) {
            // Remove the specific beat_id from the session array
            $_SESSION['cart'] = array_values(array_diff($_SESSION['cart'], [(int)$beat_id]));
        }
    }
    echo json_encode(['status' => 'success', 'message' => 'Removed from cart.']);
    exit();
}

// --- GET CART CONTENTS ---
if ($action === 'get') {
    $cart_beat_ids = [];
    if ($user_id) { // Logged-in user
        $stmt = $conn->prepare("SELECT beat_id FROM cart WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $cart_beat_ids[] = $row['beat_id'];
        }
    } else { // Guest user
        $cart_beat_ids = $_SESSION['cart'] ?? [];
    }

    $cart_items = [];
    if (!empty($cart_beat_ids)) {
        // Fetch details for all beats in the cart in a single query
        $in_clause = implode(',', array_fill(0, count($cart_beat_ids), '?'));
        $types = str_repeat('i', count($cart_beat_ids));
        // SELECT price_mp3 AS price to maintain compatibility with existing JS expecting 'price' field
        $sql = "SELECT id, title, producer_name, price_mp3 AS price, artwork_url FROM beats WHERE id IN ($in_clause)"; //
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$cart_beat_ids);
        $stmt->execute();
        $result = $stmt->get_result();
        $cart_items = $result->fetch_all(MYSQLI_ASSOC);
    }
    
    echo json_encode(['status' => 'success', 'items' => $cart_items]);
    exit();
}

// If no action matched
echo json_encode(['status' => 'error', 'message' => 'Invalid action.']);
$conn->close();
?>