<?php
session_start();
require_once 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    $is_producer = isset($_POST['is_producer']) ? 1 : 0; // Assuming a checkbox if you add one, else default to 0

    if (empty($username) || empty($email) || empty($password) || empty($confirm_password)) {
        $_SESSION['notification'] = "All fields are required.";
        $_SESSION['notification_type'] = "error";
        header("Location: auth.php?form=signup");
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $_SESSION['notification'] = "Invalid email format.";
        $_SESSION['notification_type'] = "error";
        header("Location: auth.php?form=signup");
        exit();
    }

    if (strlen($password) < 6) {
        $_SESSION['notification'] = "Password must be at least 6 characters long.";
        $_SESSION['notification_type'] = "error";
        header("Location: auth.php?form=signup");
        exit();
    }

    if ($password !== $confirm_password) {
        $_SESSION['notification'] = "Passwords do not match.";
        $_SESSION['notification_type'] = "error";
        header("Location: auth.php?form=signup");
        exit();
    }

    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        $_SESSION['notification'] = "Email already registered.";
        $_SESSION['notification_type'] = "error";
        $stmt->close();
        header("Location: auth.php?form=signup");
        exit();
    }
    $stmt->close();

    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user, default is_producer to 0 (false)
    $stmt = $conn->prepare("INSERT INTO users (username, email, password_hash, is_producer) VALUES (?, ?, ?, ?)");
    if ($stmt === false) {
        $_SESSION['notification'] = "Database error during signup. Please try again.";
        $_SESSION['notification_type'] = "error";
        header("Location: auth.php?form=signup");
        exit();
    }
    $default_is_producer = 0; // Default to non-producer on signup unless explicitly chosen
    $stmt->bind_param("sssi", $username, $email, $password_hash, $default_is_producer);

    if ($stmt->execute()) {
        $_SESSION['notification'] = "Account created successfully! You can now log in.";
        $_SESSION['notification_type'] = "success";
        header("Location: auth.php?form=login");
        exit();
    } else {
        $_SESSION['notification'] = "Registration failed. Please try again: " . $stmt->error;
        $_SESSION['notification_type'] = "error";
        header("Location: auth.php?form=signup");
        exit();
    }

    $stmt->close();
    $conn->close();
} else {
    header("Location: auth.php?form=signup");
    exit();
}
?>