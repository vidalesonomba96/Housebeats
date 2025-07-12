<?php
// This file should be included at the very top of every page.
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
// The db_connect.php file should be included here if it's needed globally.
// require_once 'db_connect.php'; 
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title>
        <?php 
        // Sets the page title dynamically
        if (isset($page_title)) {
            echo htmlspecialchars($page_title) . ' - Housebeats';
        } else {
            echo 'Housebeats - High Quality Beats for Artists';
        }
        ?>
    </title>

    <!-- Global Fonts and Icons -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="src/assets/logoleft.png">

    <!-- Global Stylesheets -->
    <link rel="stylesheet" href="src/css/styles.css">
    <link rel="stylesheet" href="src/css/notifications.css">

    <?php
    // Conditionally load page-specific stylesheets
    $current_page = basename($_SERVER['PHP_SELF']);
    if ($current_page == 'cart.php') {
        echo '<link rel="stylesheet" href="src/css/cart.css">';
    }
    if ($current_page == 'dashboard.php') {
        echo '<link rel="stylesheet" href="src/css/dashboard.css">';
    }
    if ($current_page == 'upload.php') {
        echo '<link rel="stylesheet" href="src/css/upload.css">';
    }
    ?>

</head>
<body>
    <div id="toast-container"></div>

    <?php 
    // Include the main header component
    require_once 'src/components/header.php'; 
    ?>

    <main class="main-content">
        <!-- The main page content will start after this file is included -->
