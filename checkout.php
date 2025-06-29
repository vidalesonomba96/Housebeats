<?php
// Initialize the application
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once 'db_connect.php';

// Check if this is an AJAX request
if (isset($_GET['ajax']) && $_GET['ajax'] === 'true') {
    // For AJAX requests, only render the content that goes inside <main>
} else {
    // For full page loads, include the standard HTML start
    include 'src/components/main_content_start.php';
    echo '<title>Checkout - HouseBeats</title>';
}

// Get cart items
$cart_beat_ids = [];
$user_id = $_SESSION['user_id'] ?? null;

if ($user_id) {
    // Logged-in user - get from database
    $stmt = $conn->prepare("SELECT beat_id FROM cart WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $cart_beat_ids[] = $row['beat_id'];
    }
    $stmt->close();
} else {
    // Guest user - get from session
    $cart_beat_ids = $_SESSION['cart'] ?? [];
}

$cart_items = [];
$total = 0;

if (!empty($cart_beat_ids)) {
    $in_clause = implode(',', array_fill(0, count($cart_beat_ids), '?'));
    $types = str_repeat('i', count($cart_beat_ids));
    $sql = "SELECT id, title, producer_name, price_mp3, price_wav, price_unlimited, artwork_url FROM beats WHERE id IN ($in_clause)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$cart_beat_ids);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $cart_items[] = $row;
        $total += $row['price_mp3']; // Default to MP3 price for now
    }
    $stmt->close();
}

$conn->close();
?>

<section class="checkout-section">
    <div class="container">
        <div class="checkout-container">
            <div class="checkout-header">
                <h1>Checkout</h1>
                <p>Complete your purchase to download your beats</p>
            </div>

            <?php if (empty($cart_items)): ?>
                <div class="empty-checkout">
                    <i class="fas fa-shopping-cart"></i>
                    <h2>Your cart is empty</h2>
                    <p>Add some beats to your cart before checking out</p>
                    <a href="index.php" class="continue-shopping-btn">Continue Shopping</a>
                </div>
            <?php else: ?>
                <div class="checkout-content">
                    <div class="checkout-left">
                        <div class="order-summary">
                            <h2>Order Summary</h2>
                            <div class="order-items">
                                <?php foreach ($cart_items as $item): ?>
                                    <div class="order-item" data-beat-id="<?php echo $item['id']; ?>">
                                        <img src="<?php echo htmlspecialchars($item['artwork_url']); ?>" alt="<?php echo htmlspecialchars($item['title']); ?>">
                                        <div class="item-details">
                                            <h3><?php echo htmlspecialchars($item['title']); ?></h3>
                                            <p><?php echo htmlspecialchars($item['producer_name']); ?></p>
                                            <div class="license-selector">
                                                <label for="license-<?php echo $item['id']; ?>">License Type:</label>
                                                <select id="license-<?php echo $item['id']; ?>" class="license-select" data-beat-id="<?php echo $item['id']; ?>">
                                                    <option value="mp3" data-price="<?php echo $item['price_mp3']; ?>">MP3 Lease - $<?php echo number_format($item['price_mp3'], 2); ?></option>
                                                    <option value="wav" data-price="<?php echo $item['price_wav']; ?>">WAV Lease - $<?php echo number_format($item['price_wav'], 2); ?></option>
                                                    <option value="unlimited" data-price="<?php echo $item['price_unlimited']; ?>">Unlimited Lease - $<?php echo number_format($item['price_unlimited'], 2); ?></option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="item-price">
                                            <span class="price">$<?php echo number_format($item['price_mp3'], 2); ?></span>
                                            <button class="remove-item-btn" data-beat-id="<?php echo $item['id']; ?>">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                            <div class="order-total">
                                <div class="total-row">
                                    <span>Subtotal:</span>
                                    <span id="checkout-subtotal">$<?php echo number_format($total, 2); ?></span>
                                </div>
                                <div class="total-row">
                                    <span>Tax:</span>
                                    <span id="checkout-tax">$0.00</span>
                                </div>
                                <div class="total-row total-final">
                                    <span>Total:</span>
                                    <span id="checkout-total">$<?php echo number_format($total, 2); ?></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="checkout-right">
                        <div class="payment-section">
                            <h2>Payment Information</h2>
                            
                            <?php if (!$user_id): ?>
                                <div class="guest-checkout-notice">
                                    <p><i class="fas fa-info-circle"></i> You're checking out as a guest. <a href="auth.php?form=login">Login</a> or <a href="auth.php?form=signup">create an account</a> for faster checkout next time.</p>
                                </div>
                            <?php endif; ?>

                            <form id="checkout-form" class="checkout-form">
                                <div class="form-section">
                                    <h3>Contact Information</h3>
                                    <div class="form-group">
                                        <label for="email">Email Address</label>
                                        <input type="email" id="email" name="email" required <?php echo $user_id ? 'readonly' : ''; ?>>
                                    </div>
                                </div>

                                <div class="form-section">
                                    <h3>Billing Information</h3>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="first_name">First Name</label>
                                            <input type="text" id="first_name" name="first_name" required>
                                        </div>
                                        <div class="form-group">
                                            <label for="last_name">Last Name</label>
                                            <input type="text" id="last_name" name="last_name" required>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="address">Address</label>
                                        <input type="text" id="address" name="address" required>
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="city">City</label>
                                            <input type="text" id="city" name="city" required>
                                        </div>
                                        <div class="form-group">
                                            <label for="state">State</label>
                                            <input type="text" id="state" name="state" required>
                                        </div>
                                        <div class="form-group">
                                            <label for="zip">ZIP Code</label>
                                            <input type="text" id="zip" name="zip" required>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-section">
                                    <h3>Payment Method</h3>
                                    <div class="payment-methods">
                                        <div class="payment-method active" data-method="card">
                                            <i class="fas fa-credit-card"></i>
                                            <span>Credit/Debit Card</span>
                                        </div>
                                        <div class="payment-method" data-method="paypal">
                                            <i class="fab fa-paypal"></i>
                                            <span>PayPal</span>
                                        </div>
                                    </div>

                                    <div id="card-payment" class="payment-form active">
                                        <div class="form-group">
                                            <label for="card_number">Card Number</label>
                                            <input type="text" id="card_number" name="card_number" placeholder="1234 5678 9012 3456" maxlength="19">
                                        </div>
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label for="expiry">Expiry Date</label>
                                                <input type="text" id="expiry" name="expiry" placeholder="MM/YY" maxlength="5">
                                            </div>
                                            <div class="form-group">
                                                <label for="cvv">CVV</label>
                                                <input type="text" id="cvv" name="cvv" placeholder="123" maxlength="4">
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label for="card_name">Name on Card</label>
                                            <input type="text" id="card_name" name="card_name">
                                        </div>
                                    </div>

                                    <div id="paypal-payment" class="payment-form">
                                        <p>You will be redirected to PayPal to complete your payment.</p>
                                    </div>
                                </div>

                                <button type="submit" class="complete-order-btn">
                                    <i class="fas fa-lock"></i>
                                    Complete Order
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</section>

<?php
// For full page loads, include the standard HTML end
if (!isset($_GET['ajax']) || $_GET['ajax'] !== 'true') {
    include 'src/components/main_content_end.php';
}
?>