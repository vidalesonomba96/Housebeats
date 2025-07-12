<?php
// ALWAYS start the session at the very top of the script.
session_start();
require_once 'db_connect.php';

// Authentication Check
if (!isset($_SESSION['user_id'])) {
    $_SESSION['notification'] = "You must be logged in to upload beats.";
    $_SESSION['notification_type'] = "error";
    header("Location: auth.php?form=login");
    exit();
}

// Only process POST requests.
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: upload.php");
    exit();
}

// Check for file upload errors first
if ($_FILES['artwork']['error'] !== UPLOAD_ERR_OK || $_FILES['audio']['error'] !== UPLOAD_ERR_OK) {
    // You can add more detailed error reporting here if you wish
    $_SESSION['notification'] = "There was an error during file upload. Please try again.";
    $_SESSION['notification_type'] = "error";
    header("Location: upload.php");
    exit();
}

// Retrieve producer_id and producer_name from session
$producer_id = $_SESSION['user_id'];
$producer_name = $_SESSION['username'] ?? 'Unknown Producer';

// Function to handle moving the uploaded file
function moveUploadedFileAndGetPath($file, $target_dir) {
    if (!is_dir($target_dir)) {
        mkdir($target_dir, 0777, true);
    }
    $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $unique_filename = uniqid('', true) . '.' . $file_extension;
    $target_file = $target_dir . $unique_filename;

    if (move_uploaded_file($file['tmp_name'], $target_file)) {
        return $target_file;
    }
    return false;
}

$artwork_path = moveUploadedFileAndGetPath($_FILES['artwork'], 'uploads/artwork/');
$audio_path = moveUploadedFileAndGetPath($_FILES['audio'], 'uploads/audio/');

// If either move failed, stop everything.
if ($artwork_path === false || $audio_path === false) {
    $_SESSION['notification'] = "Sorry, there was a critical error saving your file(s). Check folder permissions.";
    $_SESSION['notification_type'] = "error";
    header("Location: upload.php");
    exit();
}

// --- Data Sanitization & Preparation ---
$title = trim($_POST['title'] ?? '');
$genre = trim($_POST['genre'] ?? '');
$mood = trim($_POST['mood'] ?? '');
$price_mp3 = filter_var($_POST['price_mp3'] ?? 0, FILTER_VALIDATE_FLOAT);
$price_wav = filter_var($_POST['price_wav'] ?? 0, FILTER_VALIDATE_FLOAT);
$price_unlimited = filter_var($_POST['price_unlimited'] ?? 0, FILTER_VALIDATE_FLOAT);
$bpm = filter_var($_POST['bpm'] ?? 0, FILTER_VALIDATE_INT);
$key = trim($_POST['key'] ?? '');
$is_featured = isset($_POST['is_featured']) ? 1 : 0;

// --- Database Insertion ---
$sql = "INSERT INTO beats (title, producer_name, price_mp3, price_wav, price_unlimited, genre, mood, bpm, `key`, artwork_url, audio_url, is_featured, upload_date, producer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)";

$stmt = $conn->prepare($sql);
if ($stmt === false) {
    $_SESSION['notification'] = "Database statement preparation error: " . $conn->error;
    $_SESSION['notification_type'] = "error";
    header("Location: upload.php");
    exit();
}

//                            title producer_name mp3   wav   unlim  genre mood  bpm key   art_url aud_url feat  prod_id
// Original Incorrect Types: "s    s             d     d     d      s     s     i   s     s       i       i     s"
// CORRECTED Types:          "s    s             d     d     d      s     s     i   s     s       s       i     i"
$stmt->bind_param("ssdddssisssii", $title, $producer_name, $price_mp3, $price_wav, $price_unlimited, $genre, $mood, $bpm, $key, $artwork_path, $audio_path, $is_featured, $producer_id);

if ($stmt->execute()) {
    $_SESSION['notification'] = "Beat uploaded successfully!";
    $_SESSION['notification_type'] = "success";
    header("Location: index.php"); 
} else {
    $_SESSION['notification'] = "Database execution error: " . $stmt->error;
    $_SESSION['notification_type'] = "error";
    header("Location: upload.php"); 
}

$stmt->close();
$conn->close();
exit();
?>