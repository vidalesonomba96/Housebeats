<?php
// This script checks if a notification is set in the session and displays it.

if (isset($_SESSION['notification']) && isset($_SESSION['notification_type'])) {
    
    $message = $_SESSION['notification'];
    $type = $_SESSION['notification_type']; // 'success' or 'error'

    // Determine the icon based on the notification type
    $icon_class = 'fas fa-info-circle'; // Default icon
    if ($type === 'success') {
        $icon_class = 'fas fa-check-circle';
    } elseif ($type === 'error') {
        $icon_class = 'fas fa-exclamation-triangle';
    }

    // --- HTML for the notification (with the new ID) ---
    echo "
    <div class='notification-container'>
        <div class='notification {$type}' id='auto-dismiss-notification'>
            <i class='icon {$icon_class}'></i>
            <span class='message'>{$message}</span>
            <button class='close-btn' onclick='this.parentElement.remove();'>&times;</button>
        </div>
    </div>
    ";

    // Unset the session variables so the notification doesn't show again
    unset($_SESSION['notification']);
    unset($_SESSION['notification_type']);
}
?>