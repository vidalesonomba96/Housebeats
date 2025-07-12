<?php
session_start();
require_once 'db_connect.php';

if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

$response = ['status' => 'error', 'message' => 'Invalid request.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? null;

    if ($action === 'add') {
        $beat_id = filter_var($data['beat_id'] ?? null, FILTER_VALIDATE_INT);
        $license_type = filter_var($data['license_type'] ?? null, FILTER_SANITIZE_STRING);

        if ($beat_id && $license_type) {
            // Determine the correct price column based on the license type for security
            $price_column = '';
            switch ($license_type) {
                case 'MP3 Lease':
                    $price_column = 'price_mp3';
                    break;
                case 'WAV Lease':
                    $price_column = 'price_wav';
                    break;
                case 'Unlimited Lease':
                    $price_column = 'price_unlimited';
                    break;
            }

            if ($price_column) {
                // Fetch the beat and its correct price from the database
                $stmt = $conn->prepare("SELECT id, title, producer_name, artwork_url, {$price_column} as price FROM beats WHERE id = ?");
                $stmt->bind_param("i", $beat_id);
                $stmt->execute();
                $result = $stmt->get_result();
                $beat = $result->fetch_assoc();
                $stmt->close();

                if ($beat) {
                    // Check if the beat is already in the cart
                    $is_in_cart = false;
                    foreach ($_SESSION['cart'] as $item) {
                        if ($item['id'] == $beat_id) {
                            $is_in_cart = true;
                            break;
                        }
                    }

                    if ($is_in_cart) {
                        $response = ['status' => 'info', 'message' => 'This beat is already in your cart.'];
                    } else {
                        // Add the beat with its details to the session cart
                        $_SESSION['cart'][] = [
                            'id' => $beat['id'],
                            'title' => $beat['title'],
                            'producer_name' => $beat['producer_name'],
                            'artwork_url' => $beat['artwork_url'],
                            'license_type' => $license_type,
                            'price' => $beat['price'] // Use the secure price from the database
                        ];
                        $response = ['status' => 'success', 'message' => 'Added to cart!'];
                    }
                } else {
                    $response = ['status' => 'error', 'message' => 'Beat not found.'];
                }
            } else {
                 $response = ['status' => 'error', 'message' => 'Invalid license type provided.'];
            }
        } else {
            $response = ['status' => 'error', 'message' => 'Incomplete data provided.'];
        }
    } elseif ($action === 'remove') {
        $beat_id = filter_var($data['beat_id'] ?? null, FILTER_VALIDATE_INT);
        if ($beat_id) {
            // Find and remove the item from the cart
            foreach ($_SESSION['cart'] as $key => $item) {
                if ($item['id'] == $beat_id) {
                    unset($_SESSION['cart'][$key]);
                    // Re-index the array
                    $_SESSION['cart'] = array_values($_SESSION['cart']); 
                    $response = ['status' => 'success', 'message' => 'Item removed from cart.'];
                    break;
                }
            }
        }
    } elseif ($action === 'get') {
        $response = ['status' => 'success', 'items' => $_SESSION['cart']];
    }
}

header('Content-Type: application/json');
echo json_encode($response);
exit();