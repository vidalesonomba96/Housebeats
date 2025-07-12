<header class="main-header">
    <div class="header-content container">
        <!-- Left Section: Logo -->
        <div class="header-left">
            <a href="index.php" class="logo-link">
                <img src="src/assets/logoleft.png" alt="Housebeats Logo" class="logo-image">
                <span class="logo-text">Housebeats</span>
            </a>
        </div>

        <!-- Center Section: Main Navigation -->
        <nav class="main-nav">
            <a href="index.php" class="nav-link">Home</a>
            <a href="beats.php" class="nav-link">Beats</a>
            <a href="producers.php" class="nav-link">Producers</a>
            <a href="about.php" class="nav-link">About</a>
            <a href="contact.php" class="nav-link">Contact</a>
        </nav>

        <!-- Right Section: Search, Auth, and Cart -->
        <div class="header-right">
            <div class="search-bar">
                <i class="fas fa-search"></i>
                <input type="text" placeholder="Search...">
            </div>
            <div class="auth-actions">
                <?php if (isset($_SESSION['user_id'])): ?>
                    <a href="dashboard.php" class="nav-link">Dashboard</a>
                    <a href="logout.php" class="nav-link logout-btn">Logout</a>
                <?php else: ?>
                    <a href="auth.php" class="nav-link">Login</a>
                    <a href="auth.php?form=signup" class="nav-link btn btn-primary">Sign Up</a>
                <?php endif; ?>
            </div>
            <a href="cart.php" id="cart-link" class="cart-icon-link">
                <i class="fas fa-shopping-cart"></i>
                <span id="cart-item-count" class="cart-item-count" style="display: none;">0</span>
            </a>
        </div>

        <!-- Mobile Menu Toggle -->
        <button class="mobile-menu-toggle">
            <i class="fas fa-bars"></i>
        </button>
    </div>
</header>

<!-- Mobile Navigation (should be outside the header for proper layering) -->
<div class="mobile-nav-overlay"></div>
<nav class="mobile-nav">
    <!-- Mobile links should be populated here, mirroring the main nav and auth actions -->
    <a href="index.php" class="nav-link">Home</a>
    <a href="beats.php" class="nav-link">Beats</a>
    <a href="producers.php" class="nav-link">Producers</a>
    <a href="about.php" class="nav-link">About</a>
    <a href="contact.php" class="nav-link">Contact</a>
    <hr>
    <?php if (isset($_SESSION['user_id'])): ?>
        <a href="dashboard.php" class="nav-link">Dashboard</a>
        <a href="logout.php" class="nav-link logout-btn">Logout</a>
    <?php else: ?>
        <a href="auth.php" class="nav-link">Login</a>
        <a href="auth.php?form=signup" class="nav-link btn btn-primary">Sign Up</a>
    <?php endif; ?>
</nav>
