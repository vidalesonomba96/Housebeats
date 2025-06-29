<?php
session_start();
require_once 'db_connect.php';

// Access control: Ensure only logged-in producers can access this page.
// This logic should be here before any HTML output.
if (!isset($_SESSION['user_id'])) {
    $_SESSION['notification'] = "You must be logged in to upload beats.";
    $_SESSION['notification_type'] = "error";
    // Redirect to login page; add current page as redirect_to if needed for post-login redirection
    header("Location: auth.php?form=login");
    exit();
}

// Check if this is an AJAX request
if (isset($_GET['ajax']) && $_GET['ajax'] === 'true') {
    // For AJAX requests, only render the content that goes inside <main>
    // No header, footer, or full HTML boilerplate needed
} else {
    // For full page loads, include the standard HTML start
    include 'src/components/main_content_start.php';
    echo '<title>Upload Beat - HouseBeats</title>'; // Set specific title
}
?>

        <section class="upload-section">
            <div class="container">
                <h2>Upload Your Beat</h2>
                <p>Fill out the details below to add your track to the marketplace.</p>

                <form action="handle_upload.php" method="POST" enctype="multipart/form-data" class="upload-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="title">Beat Title</label>
                            <input type="text" id="title" name="title" placeholder="e.g., Sunset Drive" required>
                        </div>

                        <div class="form-group">
                            <label for="genre">Genre</label>
                            <input type="text" id="genre" name="genre" placeholder="e.g., Lofi, Trap, Drill" required>
                        </div>

                        <div class="form-group">
                            <label for="mood">Mood (Optional)</label>
                            <input type="text" id="mood" name="mood" placeholder="e.g., Energetic, Chill, Melancholic">
                        </div>
                        
                        <div class="form-group">
                            <label for="price_mp3">MP3 Lease Price ($)</label>
                            <input type="number" id="price_mp3" name="price_mp3" step="0.01" placeholder="e.g., 29.99" required>
                        </div>

                        <div class="form-group">
                            <label for="price_wav">WAV Lease Price ($)</label>
                            <input type="number" id="price_wav" name="price_wav" step="0.01" placeholder="e.g., 49.99" required>
                        </div>

                        <div class="form-group">
                            <label for="price_unlimited">Unlimited Lease Price ($)</label>
                            <input type="number" id="price_unlimited" name="price_unlimited" step="0.01" placeholder="e.g., 99.99" required>
                        </div>

                        <div class="form-group">
                            <label for="bpm">BPM</label>
                            <input type="number" id="bpm" name="bpm" placeholder="e.g., 120" required>
                        </div>

                        <div class="form-group">
                            <label for="key">Key</label>
                            <input type="text" id="key" name="key" placeholder="e.g., C# Minor" required>
                        </div>

                        <div class="form-group full-width">
                            <label for="artwork">Artwork (Image File)</label>
                            <div class="drop-zone" id="artwork-drop-zone">
                                <input type="file" id="artwork" name="artwork" accept="image/*" required class="drop-zone__input">
                                <div class="drop-zone__prompt">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                    <p>Drag & Drop your artwork here or <span>click to browse</span></p>
                                    <span class="drop-zone__filename"></span>
                                </div>
                            </div>
                        </div>

                        <div class="form-group full-width">
                            <label for="audio">Audio File (MP3, WAV)</label>
                            <div class="drop-zone" id="audio-drop-zone">
                                <input type="file" id="audio" name="audio" accept="audio/*" required class="drop-zone__input">
                                <div class="drop-zone__prompt">
                                    <i class="fas fa-file-audio"></i>
                                    <p>Drag & Drop your audio here or <span>click to browse</span></p>
                                    <span class="drop-zone__filename"></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-group-checkbox">
                        <input type="checkbox" id="is_featured" name="is_featured" value="1">
                        <label for="is_featured">Feature this beat on the homepage?</label>
                    </div>

                    <button type="submit" class="submit-btn">Upload Beat</button>
                </form>
            </div>
        </section>

<?php
// For full page loads, include the standard HTML end
if (!isset($_GET['ajax']) || $_GET['ajax'] !== 'true') {
    include 'src/components/main_content_end.php';
}
?>