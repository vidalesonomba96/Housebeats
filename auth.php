<?php
// Initialize the application
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once 'db_connect.php';

// If user is already logged in, redirect them to the dashboard
if (isset($_SESSION['user_id'])) {
    header('Location: dashboard.php');
    exit();
}

// Include the start of the HTML document
include 'src/components/main_content_start.php';
?>

<title>Join HouseBeats</title>

<section class="auth-section-vibrant">
    <div class="auth-container-vibrant">
        <div class="auth-toggle">
            <button class="toggle-btn active" data-form="login">Log In</button>
            <button class="toggle-btn" data-form="signup">Sign Up</button>
        </div>

        <div id="login-form" class="auth-form active">
            <h2>Welcome Back</h2>
            <form action="handle_login.php" method="POST">
                <div class="form-group-icon">
                    <i class="fas fa-envelope"></i>
                    <input type="email" name="email" placeholder="Email" required>
                </div>
                <div class="form-group-icon">
                     <i class="fas fa-lock"></i>
                    <input type="password" name="password" placeholder="Password" required>
                </div>
                <a href="#" class="forgot-password">Forgot Password?</a>
                <button type="submit" class="submit-btn-vibrant">Log In</button>
            </form>
            <div class="social-auth">
                <span class="divider-text">or continue with</span>
                <button class="social-btn google"><i class="fab fa-google"></i> Google</button>
                <button class="social-btn facebook"><i class="fab fa-facebook"></i> Facebook</button>
            </div>
        </div>

        <div id="signup-form" class="auth-form">
             <h2>Create Account</h2>
            <form action="handle_signup.php" method="POST">
                 <div class="form-group-icon">
                    <i class="fas fa-user"></i>
                    <input type="text" name="username" placeholder="Username" required>
                </div>
                <div class="form-group-icon">
                   <i class="fas fa-envelope"></i>
                    <input type="email" name="email" placeholder="Email" required>
                </div>
                <div class="form-group-icon">
                    <i class="fas fa-lock"></i>
                    <input type="password" name="password" placeholder="Password" required>
                </div>
                <div class="form-group-checkbox">
                    <input type="checkbox" id="terms" name="terms" required>
                    <label for="terms">I agree to the <a href="#">Terms</a> & <a href="#">Privacy Policy</a>.</label>
                </div>
                <button type="submit" class="submit-btn-vibrant">Create Account</button>
            </form>
             <div class="social-auth">
                <span class="divider-text">or continue with</span>
                <button class="social-btn google"><i class="fab fa-google"></i> Google</button>
                <button class="social-btn facebook"><i class="fab fa-facebook"></i> Facebook</button>
            </div>
        </div>

    </div>
</section>

<?php
// Include the end of the HTML document
include 'src/components/main_content_end.php';
?>