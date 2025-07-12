<?php
// Start session and connect to database
session_start();
require_once 'db_connect.php';

// Check if this is an AJAX request
if (isset($_GET['ajax']) && $_GET['ajax'] === 'true') {
    // For AJAX requests, only render the content that goes inside <main>
} else {
    // For full page loads, include the standard HTML start
    include 'src/components/main_content_start.php';
    echo '<title>Shopping Cart - HouseBeats</title>';
}

// Initialize cart if it doesn't exist
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

$cart_items = $_SESSION['cart'];
$subtotal = 0;
?>

<div class="cart-page-container container">
    <h1 class="cart-title">Your Shopping Cart</h1>

    <div id="cart-container">
        <?php if (empty($cart_items)): ?>
            <div class="cart-empty">
                <i class="fas fa-shopping-bag"></i>
                <h2>Your cart is currently empty.</h2>
                <p>Looks like you haven't added any beats to your cart yet.</p>
                <a href="index.php" class="btn btn-primary">Explore Beats</a>
            </div>
        <?php else: ?>
            <div class="cart-layout">
                <div class="cart-items-list">
                    <?php foreach ($cart_items as $item): ?>
                        <?php 
                        $item_price = floatval($item['price']);
                        $subtotal += $item_price;
                        ?>
                        <div class="cart-item" data-beat-id="<?php echo htmlspecialchars($item['id']); ?>">
                            <img src="<?php echo htmlspecialchars($item['artwork_url']); ?>" 
                                 alt="<?php echo htmlspecialchars($item['title']); ?>" 
                                 class="item-artwork">
                            <div class="item-info">
                                <h3 class="item-title"><?php echo htmlspecialchars($item['title']); ?></h3>
                                <p class="item-producer"><?php echo htmlspecialchars($item['producer_name']); ?></p>
                                <p class="item-license">License: <?php echo htmlspecialchars($item['license_type']); ?></p>
                            </div>
                            <div class="item-price">$<?php echo number_format($item_price, 2); ?></div>
                            <button class="item-remove-btn" 
                                    data-beat-id="<?php echo htmlspecialchars($item['id']); ?>" 
                                    title="Remove item">&times;</button>
                        </div>
                    <?php endforeach; ?>
                </div>

                <div class="cart-summary">
                    <h2>Order Summary</h2>
                    <div class="summary-line">
                        <span>Subtotal</span>
                        <span id="summary-subtotal">$<?php echo number_format($subtotal, 2); ?></span>
                    </div>
                    <div class="summary-line">
                        <span>Taxes & Fees</span>
                        <span>Calculated at checkout</span>
                    </div>
                    <hr>
                    <div class="summary-line total">
                        <span>Total</span>
                        <span id="summary-total">$<?php echo number_format($subtotal, 2); ?></span>
                    </div>
                    <button class="btn btn-primary btn-block checkout-btn">Proceed to Checkout</button>
                </div>
            </div>
        <?php endif; ?>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    // Handle remove item buttons
    document.querySelectorAll('.item-remove-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const beatId = e.target.dataset.beatId;
            if (!confirm('Are you sure you want to remove this item?')) return;

            try {
                const response = await fetch('handle_cart.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'remove', beat_id: beatId })
                });
                
                const result = await response.json();

                if (result.status === 'success') {
                    // Remove the item from the DOM
                    const cartItem = e.target.closest('.cart-item');
                    if (cartItem) {
                        cartItem.remove();
                    }
                    
                    // Update cart count in header
                    const cartCountEl = document.getElementById('cart-item-count');
                    if (cartCountEl) {
                        const currentCount = parseInt(cartCountEl.textContent) || 0;
                        const newCount = Math.max(0, currentCount - 1);
                        cartCountEl.textContent = newCount;
                        cartCountEl.style.display = newCount > 0 ? 'flex' : 'none';
                    }
                    
                    // Check if cart is now empty
                    const remainingItems = document.querySelectorAll('.cart-item');
                    if (remainingItems.length === 0) {
                        // Reload page to show empty cart message
                        window.location.reload();
                    } else {
                        // Recalculate totals
                        updateCartTotals();
                    }
                    
                    // Show success message
                    if (typeof createToast === 'function') {
                        createToast('Item removed from cart', 'success');
                    }
                } else {
                    if (typeof createToast === 'function') {
                        createToast('Error: ' + (result.message || 'Could not remove item.'), 'error');
                    } else {
                        alert('Error: ' + (result.message || 'Could not remove item.'));
                    }
                }
            } catch (error) {
                console.error('Error removing item:', error);
                if (typeof createToast === 'function') {
                    createToast('An error occurred while removing the item.', 'error');
                } else {
                    alert('An error occurred while removing the item.');
                }
            }
        });
    });
    
    // Function to update cart totals
    function updateCartTotals() {
        const priceElements = document.querySelectorAll('.item-price');
        let newSubtotal = 0;
        
        priceElements.forEach(priceEl => {
            const priceText = priceEl.textContent.replace('$', '');
            const price = parseFloat(priceText) || 0;
            newSubtotal += price;
        });
        
        const subtotalEl = document.getElementById('summary-subtotal');
        const totalEl = document.getElementById('summary-total');
        
        if (subtotalEl) {
            subtotalEl.textContent = '$' + newSubtotal.toFixed(2);
        }
        if (totalEl) {
            totalEl.textContent = '$' + newSubtotal.toFixed(2);
        }
    }
});
</script>

<?php
// For full page loads, include the standard HTML end
if (!isset($_GET['ajax']) || $_GET['ajax'] !== 'true') {
    include 'src/components/main_content_end.php';
}
?>