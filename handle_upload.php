<?php
// ALWAYS start the session at the very top of the script.
session_start();
require_once 'db_connect.php';

// Authentication Check: Only process if a user is logged in
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

// Retrieve producer_id and producer_name from session
$producer_id = $_SESSION['user_id'];
$producer_name = $_SESSION['username'] ?? 'Unknown Producer'; // Use session username as producer_name

// --- File Upload Handling ---
$artwork_dir = 'uploads/artwork/';
$audio_dir = 'uploads/audio/';

// Function to handle file uploads
function uploadFile($file, $target_dir) {
    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        // More specific error messages
        $phpFileUploadErrors = array(
            UPLOAD_ERR_OK => 'There is no error, the file uploaded with success',
            UPLOAD_ERR_INI_SIZE => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
            UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form',
            UPLOAD_ERR_PARTIAL => 'The uploaded file was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk.',
            UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload.',
        );
        $_SESSION['notification'] = "File upload error: " . ($phpFileUploadErrors[$file['error']] ?? 'Unknown error');
        $_SESSION['notification_type'] = "error";
        header("Location: upload.php");
        exit();
    }

    // Create a unique filename to prevent overwriting
    $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $unique_filename = uniqid('', true) . '.' . $file_extension;
    $target_file = $target_dir . $unique_filename;

    // Check if target directory exists, create if not
    if (!is_dir($target_dir)) {
        mkdir($target_dir, 0777, true);
    }

    // Move the file to the target directory
    if (move_uploaded_file($file['tmp_name'], $target_file)) {
        return $target_file; // Return the path to be stored in DB
    } else {
        $_SESSION['notification'] = "Sorry, there was an error uploading your file.";
        $_SESSION['notification_type'] = "error";
        header("Location: upload.php");
        exit();
    }
}

$artwork_path = uploadFile($_FILES['artwork'], $artwork_dir);
$audio_path = uploadFile($_FILES['audio'], $audio_dir);

// --- Data Sanitization & Preparation ---
$title = trim($_POST['title'] ?? '');
// $producer_name is now from session
$genre = trim($_POST['genre'] ?? '');
$mood = trim($_POST['mood'] ?? ''); // Optional, default to empty string if not set

// Use filter_var with FILTER_VALIDATE_FLOAT for prices and FILTER_VALIDATE_INT for BPM
$price_mp3 = filter_var($_POST['price_mp3'] ?? 0, FILTER_VALIDATE_FLOAT);
$price_wav = filter_var($_POST['price_wav'] ?? 0, FILTER_VALIDATE_FLOAT);
$price_unlimited = filter_var($_POST['price_unlimited'] ?? 0, FILTER_VALIDATE_FLOAT);
$bpm = filter_var($_POST['bpm'] ?? 0, FILTER_VALIDATE_INT);
$key = trim($_POST['key'] ?? '');
$is_featured = isset($_POST['is_featured']) ? 1 : 0;

// --- Server-Side Validation ---
if (empty($title) || empty($producer_name) || empty($genre) || empty($key)) {
    $_SESSION['notification'] = "Please fill in all required text fields.";
    $_SESSION['notification_type'] = "error";
    header("Location: upload.php");
    exit();
}

if ($price_mp3 === false || $price_mp3 < 0 ||
    $price_wav === false || $price_wav < 0 ||
    $price_unlimited === false || $price_unlimited < 0) {
    $_SESSION['notification'] = "Invalid price input. Prices must be valid positive numbers.";
    $_SESSION['notification_type'] = "error";
    header("Location: upload.php");
    exit();
}

if ($bpm === false || $bpm < 0) {
    $_SESSION['notification'] = "Invalid BPM. BPM must be a positive integer.";
    $_SESSION['notification_type'] = "error";
    header("Location: upload.php");
    exit();
}

// --- Database Insertion ---
// SQL query updated: producer_name is included, and producer_id is also inserted
$sql = "INSERT INTO beats (title, producer_name, price_mp3, price_wav, price_unlimited, genre, mood, bpm, `key`, artwork_url, audio_url, is_featured, upload_date, producer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)";

$stmt = $conn->prepare($sql);
if ($stmt === false) {
    $_SESSION['notification'] = "Database statement preparation error: " . $conn->error;
    $_SESSION['notification_type'] = "error";
    header("Location: upload.php");
    exit();
}

// Bind parameters - 's' for string, 'd' for double (float), 'i' for integer
// The order must match the SQL query columns:
// (title, producer_name, price_mp3, price_wav, price_unlimited, genre, mood, bpm, key, artwork_url, audio_url, is_featured, producer_id)
// s   s   d   d   d   s   s   i   s   s   s   i   i
$stmt->bind_param("ssdddssissiis", $title, $producer_name, $price_mp3, $price_wav, $price_unlimited, $genre, $mood, $bpm, $key, $artwork_path, $audio_path, $is_featured, $producer_id);

// Execute the statement
if ($stmt->execute()) {
    $_SESSION['notification'] = "Beat uploaded successfully!";
    $_SESSION['notification_type'] = "success";
    header("Location: index.php"); // Redirect to homepage on success
    exit();
} else {
    $_SESSION['notification'] = "Database execution error: " . $stmt->error;
    $_SESSION['notification_type'] = "error";
    header("Location: upload.php"); // Redirect back to upload form on error
    exit();
}

$stmt->close();
$conn->close();

?>