<?php
// This file assumes $conn is available from the parent file.
$user = null;
if (isset($_SESSION['user_id'])) {
    $stmt = $conn->prepare("SELECT username FROM users WHERE id = ?");
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();
}
?>
<header class="main-header">
    <div class="header-container container">
        <a href="index.php" class="logo">
            <img src="src/assets/logoleft.png" alt="HouseBeats Logo" class="logo-img">
            HouseBeats
        </a>
        <nav class="desktop-nav">
            <a href="index.php">Home</a>
            <a href="#">Genres</a>
            <a href="#">Artists</a>
            <a href="about.php">About</a>
            <?php if (isset($_SESSION['is_producer']) && $_SESSION['is_producer'] == 1): ?>
                <a href="dashboard.php">Dashboard</a>
            <?php endif; ?>
        </nav>
        <div class="header-actions">
            <?php if (isset($user)): ?>
                <span class="welcome-user">Hi, <?php echo htmlspecialchars($user['username']); ?></span>
                <a href="logout.php" class="logout-btn">Logout</a>
            <?php else: ?>
                <a href="auth.php?form=login" class="login-btn">Log In</a>
                <a href="auth.php?form=signup" class="signup-btn">Sign Up</a>
            <?php endif; ?>
            <button id="cart-toggle-btn" class="header-icon-btn" aria-label="Toggle shopping cart">
                <i class="fas fa-shopping-bag"></i>
                <span id="cart-item-count" class="cart-item-count">0</span>
            </button>
        </div>

        <button class="mobile-menu-toggle" aria-label="Toggle mobile menu">
            <span class="hamburger-icon"></span>
        </button>
    </div>
    <div id="mini-cart-panel" class="mini-cart-panel">
        <div class="mini-cart-header">
            <h3>Your Cart</h3>
            <button id="mini-cart-close-btn" class="close-btn">&times;</button>
        </div>
        <div id="mini-cart-content" class="mini-cart-content">
            <div class="empty-cart-message">
                <i class="fas fa-shopping-bag"></i>
                <p>Your cart is empty</p>
                <span>When you add something to your cart, it will appear here</span>
            </div>
        </div>
        <div class="mini-cart-footer">
            <div class="subtotal">
                <span>Subtotal:</span>
                <span id="mini-cart-subtotal">$0.00</span>
            </div>
            <a href="checkout.php" id="checkout-btn" class="checkout-btn disabled">Checkout</a>
        </div>
    </div>
    <div id="mini-cart-overlay" class="mini-cart-overlay"></div>

    <div class="mobile-nav-overlay"></div>
    <nav class="mobile-nav">
        <a href="index.php">Home</a>
        <a href="#">Genres</a>
        <a href="#">Artists</a>
        <a href="about.php">About</a>
        <?php if (isset($_SESSION['is_producer']) && $_SESSION['is_producer'] == 1): ?>
            <a href="dashboard.php">Dashboard</a>
        <?php endif; ?>
        <div class="mobile-header-actions">
            <?php if (isset($user)): ?>
                <span class="welcome-user">Hi, <?php echo htmlspecialchars($user['username']); ?></span>
                <a href="logout.php" class="logout-btn">Logout</a>
            <?php else: ?>
                <a href="auth.php?form=login" class="login-btn">Log In</a>
                <a href="auth.php?form=signup" class="signup-btn">Sign Up</a>
            <?php endif; ?>
        </div>
    </nav>
</header>