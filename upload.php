<?php
session_start();
require_once 'db_connect.php';

// Access control: Ensure only logged-in producers can access this page.
if (!isset($_SESSION['user_id'])) {
    $_SESSION['notification'] = "You must be logged in to upload beats.";
    $_SESSION['notification_type'] = "error";
    header("Location: auth.php?form=login");
    exit();
}

// This includes the HTML head, main stylesheet, and header.
include 'src/components/main_content_start.php';
?>

<link rel="stylesheet" href="src/css/upload.css">
<title>Upload Beat - HouseBeats</title>

<br/>
<br>

<main class="main-container">
    <div class="upload-container">
        <h1>Upload Your Beat</h1>
        <p class="upload-subtitle">Fill out the details below to add your track to the marketplace.</p>

        <form action="handle_upload.php" method="POST" enctype="multipart/form-data" class="upload-form">

            <div class="form-section">
                <h2 class="form-section-title">Track Details</h2>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="title">Title</label>
                        <input type="text" id="title" name="title" required placeholder="e.g., Sunset Drive">
                    </div>
                    
                    <div class="form-group">
                        <label for="genre">Genre</label>
                        <select id="genre" name="genre" required>
                            <option value="" disabled selected>Select a Genre</option>
                            <option value="Hip Hop">Hip Hop</option>
                            <option value="Pop">Pop</option>
                            <option value="R&B">R&B</option>
                            <option value="Trap">Trap</option>
                            <option value="Drill">Drill</option>
                            <option value="Lofi">Lofi</option>
                            <option value="EDM">EDM</option>
                            <option value="Rock">Rock</option>
                            <option value="Afrobeat">Afrobeat</option>
                            <option value="Amapiano">Amapiano</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="mood">Mood</label>
                        <select id="mood" name="mood">
                             <option value="" disabled selected>Select a Mood</option>
                            <option value="Energetic">Energetic</option>
                            <option value="Chill">Chill</option>
                            <option value="Melancholic">Melancholic</option>
                            <option value="Happy">Happy</option>
                            <option value="Dark">Dark</option>
                            <option value="Epic">Epic</option>
                            <option value="Groovy">Groovy</option>
                            <option value="Romantic">Romantic</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="bpm">BPM</label>
                        <input type="number" id="bpm" name="bpm" required placeholder="e.g., 120">
                    </div>
                    <div class="form-group">
                        <label for="key">Key</label>
                        <input type="text" id="key" name="key" required placeholder="e.g., C# Minor">
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h2 class="form-section-title">License Pricing</h2>
                <p class="section-description">Prices are fixed to ensure a consistent marketplace.</p>
                <div class="form-grid price-grid">
                    <div class="price-item">
                        <span class="price-license">Basic Lease</span>
                        <span class="price-amount">$29.99</span>
                        <span class="price-format">(MP3)</span>
                        <input type="hidden" name="price_mp3" value="29.99">
                    </div>
                    <div class="price-item">
                        <span class="price-license">WAV Lease</span>
                        <span class="price-amount">$49.99</span>
                         <span class="price-format">(WAV)</span>
                        <input type="hidden" name="price_wav" value="49.99">
                    </div>
                    <div class="price-item">
                        <span class="price-license">Unlimited Lease</span>
                        <span class="price-amount">$99.99</span>
                         <span class="price-format">(Stems)</span>
                        <input type="hidden" name="price_unlimited" value="99.99">
                    </div>
                </div>
            </div>

            <div class="form-section">
                 <h2 class="form-section-title">Required Files</h2>
                <div class="form-grid file-grid">
                    <div class="form-group">
                        <label for="artwork">Artwork</label>
                        <div class="drop-zone" id="artwork-drop-zone">
                            <span class="drop-zone__prompt"><i class="fas fa-image"></i><p>Drop artwork here or click</p></span>
                            <input type="file" id="artwork" name="artwork" accept="image/*" required class="drop-zone__input">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="audio">Audio File</label>
                        <div class="drop-zone" id="audio-drop-zone">
                            <span class="drop-zone__prompt"><i class="fas fa-music"></i><p>Drop audio file here or click</p></span>
                            <input type="file" id="audio" name="audio" accept="audio/*" required class="drop-zone__input">
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="form-group checkbox-group">
                <input type="checkbox" id="is_featured" name="is_featured" value="1">
                <label for="is_featured">Feature this beat on the homepage?</label>
            </div>
            
            <button type="submit" class="btn-upload">Upload Beat & Finalize</button>
        </form>
    </div>
</main>

<script>
// This script does not need any changes.
document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
    const dropZoneElement = inputElement.closest(".drop-zone");

    dropZoneElement.addEventListener("click", (e) => {
        inputElement.click();
    });

    inputElement.addEventListener("change", (e) => {
        if (inputElement.files.length) {
            updateThumbnail(dropZoneElement, inputElement.files[0]);
        }
    });

    dropZoneElement.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZoneElement.classList.add("drop-zone--over");
    });

    ["dragleave", "dragend"].forEach((type) => {
        dropZoneElement.addEventListener(type, (e) => {
            dropZoneElement.classList.remove("drop-zone--over");
        });
    });

    dropZoneElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) {
            inputElement.files = e.dataTransfer.files;
            updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
        }
        dropZoneElement.classList.remove("drop-zone--over");
    });
});

function updateThumbnail(dropZoneElement, file) {
    let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");
    const promptElement = dropZoneElement.querySelector(".drop-zone__prompt");

    if (promptElement) {
        promptElement.style.display = 'none';
    }

    if (!thumbnailElement) {
        thumbnailElement = document.createElement("div");
        thumbnailElement.classList.add("drop-zone__thumb");
        dropZoneElement.appendChild(thumbnailElement);
    }

    thumbnailElement.dataset.label = file.name;

    if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
            thumbnailElement.innerHTML = '';
        };
    } else {
        thumbnailElement.style.backgroundImage = "";
        thumbnailElement.innerHTML = `<i class="fas fa-file-audio" style="font-size: 3rem; color: #6b7280;"></i>`;
    }
}
</script>

<?php
// This includes the global player and closes the HTML document.
include 'src/components/main_content_end.php';
?>