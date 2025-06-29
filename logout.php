<?php
session_start();

if (isset($_SESSION['user_id'])) {
    // Unset user-specific data but keep the session alive for the notification
    unset($_SESSION['user_id']);
    unset($_SESSION['username']);
    
    // Set the logout notification
    $_SESSION['notification'] = "You have been successfully logged out.";
    $_SESSION['notification_type'] = "info";
}

// Redirect to the homepage to show the notification
header("Location: index.php");
exit();
?>
