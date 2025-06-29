<?php
// This file assumes a session has been started and a DB connection ($conn) is available from the parent page.
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

    <link rel="stylesheet" href="src/css/styles.css">
    <?php if (basename($_SERVER['PHP_SELF']) == 'dashboard.php'): ?>
        <link rel="stylesheet" href="src/css/dashboard.css">
    <?php endif; ?>
    <?php if (basename($_SERVER['PHP_SELF']) == 'checkout.php'): ?>
        <link rel="stylesheet" href="src/css/checkout.css">
    <?php endif; ?>

    <link rel="icon" type="image/png" href="src/assets/logoleft.png">
    
    </head>
<body class="<?php echo (basename($_SERVER['PHP_SELF']) == 'auth.php') ? 'utility-page' : ''; ?>">

    <?php include 'src/components/header.php'; ?>

    <div id="toast-container"></div>

<main>