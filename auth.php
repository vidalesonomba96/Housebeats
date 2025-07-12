<?php
session_start();
require_once 'db_connect.php';

if (isset($_SESSION['user_id'])) {
    header('Location: dashboard.php');
    exit();
}

$show_signup = isset($_GET['form']) && $_GET['form'] === 'signup';

// --- IMPORTANT: Conditional includes for AJAX vs. Full Page Load ---
if (!isset($_GET['ajax']) || $_GET['ajax'] !== 'true') {
    // For full page loads, include the standard HTML start (which contains <header>, <main> tags)
    include 'src/components/main_content_start.php';
    echo '<title>HouseBeats - Authentication</title>'; // Set title for full page load
}
?>

<section class="auth-section-vibrant">
    <div class="auth-container-vibrant">
        <div class="auth-header">
            <a href="?form=login" class="auth-header-link <?php echo !$show_signup ? 'active' : ''; ?>">Sign In</a>
            <a href="?form=signup" class="auth-header-link <?php echo $show_signup ? 'active' : ''; ?>">Sign Up</a>
        </div>

        <form id="login-form" class="auth-form <?php echo !$show_signup ? 'active' : ''; ?>" action="handle_login.php" method="POST">
            <h2>Welcome Back!</h2>
            <div class="form-group-icon">
                <i class="fas fa-envelope"></i>
                <input type="email" name="email" placeholder="Email Address" required>
            </div>
            <div class="form-group-icon">
                <i class="fas fa-lock"></i>
                <input type="password" name="password" placeholder="Password" required>
            </div>
            <a href="#" class="forgot-password">Forgot Password?</a>
            <button type="submit" class="submit-btn-vibrant">Log In</button>
        </form>

        <form id="signup-form" class="auth-form <?php echo $show_signup ? 'active' : ''; ?>" action="handle_signup.php" method="POST">
            <h2>Create Account</h2>
            <div class="form-group-icon">
                <i class="fas fa-user"></i>
                <input type="text" name="username" placeholder="Username" required>
            </div>
            <div class="form-group-icon">
                <i class="fas fa-envelope"></i>
                <input type="email" name="email" placeholder="Email Address" required>
            </div>
            <div class="form-group-icon">
                <i class="fas fa-lock"></i>
                <input type="password" name="password" placeholder="Password" required>
            </div>
            <div class="form-group-icon">
                <i class="fas fa-check-double"></i>
                <input type="password" name="confirm_password" placeholder="Confirm Password" required>
            </div>
            <button type="submit" class="submit-btn-vibrant">Sign Up</button>
        </form>

        <div class="social-auth">
            <div class="divider-text">Or continue with</div>
            <button class="social-btn google"><i class="fab fa-google"></i> Google</button>
            <button class="social-btn facebook"><i class="fab fa-facebook"></i> Facebook</button>
        </div>
    </div>
</section>

<?php
// --- IMPORTANT: Conditional includes for AJAX vs. Full Page Load ---
if (!isset($_GET['ajax']) || $_GET['ajax'] !== 'true') {
    // For full page loads, include the standard HTML end (which closes </main>, <footer>, </body>, </html>)
    include 'src/components/main_content_end.php';
}
?>