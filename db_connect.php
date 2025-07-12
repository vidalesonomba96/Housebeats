<?php
// db_connect.php

// --- Database Credentials ---
// Replace with your actual database credentials
$servername = "localhost"; // Or your database host
$username = "root";        // Your database username (default is often 'root' for localhost)
$password = "";            // Your database password (default is often empty for localhost)
$dbname = "housebeats_db"; // The name of the database we created

// --- Create Connection ---
$conn = new mysqli($servername, $username, $password, $dbname);

// --- Check Connection ---
if ($conn->connect_error) {
    // Stop the script and display an error if connection fails
    die("Connection failed: " . $conn->connect_error);
}

// Set the character set to utf8mb4 for full Unicode support
$conn->set_charset("utf8mb4");

?>