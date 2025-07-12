<?php
// Define the page title for the main template to use.
$page_title = 'Shopping Cart';
?>

<!-- The content specific to the cart page begins here. -->
<!-- Note: The require_once for main_content_start.php has been removed. -->
 <br>
<div class="cart-page-container container">
    <h1 class="cart-title">Your Shopping Cart</h1>

    <div id="cart-container">
        <?php
        // The PHP logic to display cart items remains the same.
        $cart_items = $_SESSION['cart'] ?? [];
        $subtotal = 0;

        if (empty($cart_items)) {
            echo '<div class="cart-empty">';
            echo '  <i class="fas fa-shopping-bag"></i>';
            echo '  <h2>Your cart is currently empty.</h2>';
            echo '  <p>Looks like you haven\'t added any beats to your cart yet.</p>';
            echo '  <a href="beats.php" class="btn btn-primary">Explore Beats</a>';
            echo '</div>';
        } else {
            echo '<div class="cart-layout">';
            echo '  <div class="cart-items-list">';
            foreach ($cart_items as $item) {
                $item_price = floatval($item['price']);
                $subtotal += $item_price;
                echo '<div class="cart-item" data-beat-id="' . htmlspecialchars($item['id']) . '">';
                echo '  <img src="' . htmlspecialchars($item['artwork_url']) . '" alt="' . htmlspecialchars($item['title']) . '" class="item-artwork">';
                echo '  <div class="item-info">';
                echo '    <h3 class="item-title">' . htmlspecialchars($item['title']) . '</h3>';
                echo '    <p class="item-producer">' . htmlspecialchars($item['producer_name']) . '</p>';
                echo '    <p class="item-license">License: ' . htmlspecialchars($item['license_type']) . '</p>';
                echo '  </div>';
                echo '  <div class="item-price">$' . number_format($item_price, 2) . '</div>';
                echo '  <button class="item-remove-btn" data-beat-id="' . htmlspecialchars($item['id']) . '" title="Remove item">&times;</button>';
                echo '</div>';
            }
            echo '  </div>'; // end .cart-items-list

            echo '  <div class="cart-summary">';
            echo '    <h2>Order Summary</h2>';
            echo '    <div class="summary-line"><span>Subtotal</span><span id="summary-subtotal">$' . number_format($subtotal, 2) . '</span></div>';
            echo '    <div class="summary-line"><span>Taxes & Fees</span><span>Calculated at checkout</span></div>';
            echo '    <hr>';
            echo '    <div class="summary-line total"><span>Total</span><span id="summary-total">$' . number_format($subtotal, 2) . '</span></div>';
            echo '    <a href="checkout.php" class="btn btn-primary btn-block">Proceed to Checkout</a>';
            echo '  </div>'; // end .cart-summary
            echo '</div>'; // end .cart-layout
        }
        ?>
    </div>
</div>

<!-- Page-specific script for removing items -->
<script>
document.addEventListener('DOMContentLoaded', () => {
    // This event listener is safe to keep here as it will execute when this content is loaded into the main page.
    document.querySelectorAll('.item-remove-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const beatId = e.target.dataset.beatId;
            if (!confirm('Are you sure you want to remove this item?')) return;

            const response = await fetch('handle_cart.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'remove', beat_id: beatId })
            });
            const result = await response.json();

            if (result.status === 'success') {
                window.location.reload();
            } else {
                alert('Error: ' + (result.message || 'Could not remove item.'));
            }
        });
    });
});
</script>

<!-- Note: The require_once for main_content_end.php has been removed. -->
<!-- The main template file is now responsible for including the footer. -->
