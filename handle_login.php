<?php
session_start();
require_once 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (empty($email) || empty($password)) {
        $_SESSION['notification'] = "Please enter both email and password.";
        $_SESSION['notification_type'] = "error";
        header("Location: auth.php?form=login");
        exit();
    }

    // Prepare statement to prevent SQL injection
    $stmt = $conn->prepare("SELECT id, username, password_hash, is_producer FROM users WHERE email = ?");
    if ($stmt === false) {
        $_SESSION['notification'] = "Database error during login. Please try again.";
        $_SESSION['notification_type'] = "error";
        header("Location: auth.php?form=login");
        exit();
    }
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if ($user && password_verify($password, $user['password_hash'])) {
        // Login successful
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['is_producer'] = $user['is_producer']; // Store producer status in session
        
        $_SESSION['notification'] = "Welcome back, " . htmlspecialchars($user['username']) . "!";
        $_SESSION['notification_type'] = "success";

        // Redirect producer to dashboard, others to index
        if ($user['is_producer'] == 1) {
            header("Location: dashboard.php");
        } else {
            header("Location: index.php");
        }
        exit();
    } else {
        // Login failed
        $_SESSION['notification'] = "Invalid email or password.";
        $_SESSION['notification_type'] = "error";
        header("Location: auth.php?form=login");
        exit();
    }

    $stmt->close();
    $conn->close();
} else {
    header("Location: auth.php?form=login");
    exit();
}
?>