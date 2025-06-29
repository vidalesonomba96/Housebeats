// Housebeats/src/js/upload.js

function initializeUpload() {
    console.log("Initializing upload scripts...");

    const uploadForm = document.getElementById('upload-form');
    const submitBtn = document.getElementById('upload-submit-btn');

    // Initialize drag and drop for all drop zones
    initializeDropZones();

    // Form submission handler
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm()) {
                return;
            }

            // Show loading state
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
            submitBtn.disabled = true;

            // Create FormData object
            const formData = new FormData(uploadForm);

            // Submit form
            fetch('handle_upload.php', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                // Check if response contains success or error
                if (data.includes('Beat uploaded successfully')) {
                    if (typeof createToast === 'function') {
                        createToast('Beat uploaded successfully!', 'success');
                    }
                    // Redirect to dashboard after success
                    setTimeout(() => {
                        window.location.href = 'dashboard.php';
                    }, 2000);
                } else {
                    // Handle error response
                    if (typeof createToast === 'function') {
                        createToast('Upload failed. Please try again.', 'error');
                    }
                }
            })
            .catch(error => {
                console.error('Upload error:', error);
                if (typeof createToast === 'function') {
                    createToast('Upload failed. Please try again.', 'error');
                }
            })
            .finally(() => {
                // Restore button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    function validateForm() {
        const requiredFields = [
            'title', 'genre', 'price_mp3', 'price_wav', 
            'price_unlimited', 'bpm', 'key'
        ];

        let isValid = true;
        const errors = [];

        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (!field || !field.value.trim()) {
                isValid = false;
                errors.push(`${fieldName.replace('_', ' ')} is required`);
                field?.classList.add('error');
            } else {
                field?.classList.remove('error');
            }
        });

        // Validate file inputs
        const artworkFile = document.getElementById('artwork').files[0];
        const audioFile = document.getElementById('audio').files[0];

        if (!artworkFile) {
            isValid = false;
            errors.push('Artwork file is required');
        } else if (!isValidImageFile(artworkFile)) {
            isValid = false;
            errors.push('Invalid artwork file. Please use JPG, PNG, or GIF format.');
        }

        if (!audioFile) {
            isValid = false;
            errors.push('Audio file is required');
        } else if (!isValidAudioFile(audioFile)) {
            isValid = false;
            errors.push('Invalid audio file. Please use MP3 or WAV format.');
        }

        // Validate numeric fields
        const prices = ['price_mp3', 'price_wav', 'price_unlimited'];
        prices.forEach(priceField => {
            const field = document.getElementById(priceField);
            const value = parseFloat(field.value);
            if (isNaN(value) || value < 0) {
                isValid = false;
                errors.push(`${priceField.replace('_', ' ')} must be a valid positive number`);
                field.classList.add('error');
            }
        });

        const bpmField = document.getElementById('bpm');
        const bpmValue = parseInt(bpmField.value);
        if (isNaN(bpmValue) || bpmValue < 1 || bpmValue > 300) {
            isValid = false;
            errors.push('BPM must be between 1 and 300');
            bpmField.classList.add('error');
        }

        if (!isValid && typeof createToast === 'function') {
            createToast(errors[0], 'error');
        }

        return isValid;
    }

    function isValidImageFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        return validTypes.includes(file.type) && file.size <= maxSize;
    }

    function isValidAudioFile(file) {
        const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave'];
        const maxSize = 50 * 1024 * 1024; // 50MB
        return validTypes.includes(file.type) && file.size <= maxSize;
    }

    function initializeDropZones() {
        console.log("Initializing drop zones...");
        
        const dropZones = document.querySelectorAll(".drop-zone");
        console.log("Found drop zones:", dropZones.length);

        dropZones.forEach((dropZoneElement, index) => {
            console.log(`Setting up drop zone ${index + 1}`);
            
            const inputElement = dropZoneElement.querySelector(".drop-zone__input");
            const promptElement = dropZoneElement.querySelector(".drop-zone__prompt");
            const filenameElement = dropZoneElement.querySelector(".drop-zone__filename");

            if (!inputElement) {
                console.error("No input element found in drop zone", dropZoneElement);
                return;
            }

            console.log("Input element found:", inputElement.id);

            // Click to browse - attach to the entire drop zone
            dropZoneElement.addEventListener("click", (e) => {
                console.log("Drop zone clicked");
                e.preventDefault();
                e.stopPropagation();
                inputElement.click();
            });

            // File input change
            inputElement.addEventListener("change", (e) => {
                console.log("File input changed", e.target.files);
                if (inputElement.files.length) {
                    updateDropZone(dropZoneElement, inputElement.files[0]);
                } else {
                    updateDropZone(dropZoneElement, null);
                }
            });

            // Prevent default drag behaviors
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZoneElement.addEventListener(eventName, preventDefaults, false);
                document.body.addEventListener(eventName, preventDefaults, false);
            });

            // Highlight drop area when item is dragged over it
            ['dragenter', 'dragover'].forEach(eventName => {
                dropZoneElement.addEventListener(eventName, highlight, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropZoneElement.addEventListener(eventName, unhighlight, false);
            });

            // Handle dropped files
            dropZoneElement.addEventListener('drop', handleDrop, false);

            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }

            function highlight(e) {
                console.log("Drag highlight");
                dropZoneElement.classList.add('drop-zone--over');
            }

            function unhighlight(e) {
                console.log("Drag unhighlight");
                dropZoneElement.classList.remove('drop-zone--over');
            }

            function handleDrop(e) {
                console.log("File dropped", e.dataTransfer.files);
                const dt = e.dataTransfer;
                const files = dt.files;

                if (files.length > 0) {
                    const file = files[0];
                    
                    // Set the file to the input
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    inputElement.files = dataTransfer.files;
                    
                    // Trigger change event
                    const changeEvent = new Event('change', { bubbles: true });
                    inputElement.dispatchEvent(changeEvent);
                    
                    updateDropZone(dropZoneElement, file);
                }
            }

            function updateDropZone(dropZoneEl, file) {
                console.log("Updating drop zone with file:", file);
                
                const promptP = dropZoneEl.querySelector(".drop-zone__prompt p");
                const filenameSpan = dropZoneEl.querySelector(".drop-zone__filename");
                const icon = dropZoneEl.querySelector(".drop-zone__prompt i");

                if (file) {
                    if (promptP) promptP.style.display = 'none';
                    if (filenameSpan) {
                        filenameSpan.textContent = file.name;
                        filenameSpan.style.display = 'block';
                    }
                    dropZoneEl.classList.add('has-file');
                    
                    // Update icon based on file type
                    if (icon) {
                        if (file.type.startsWith('image/')) {
                            icon.className = 'fas fa-image';
                        } else if (file.type.startsWith('audio/')) {
                            icon.className = 'fas fa-music';
                        }
                    }
                } else {
                    if (promptP) promptP.style.display = 'block';
                    if (filenameSpan) {
                        filenameSpan.textContent = '';
                        filenameSpan.style.display = 'none';
                    }
                    dropZoneEl.classList.remove('has-file');
                    
                    // Reset icon
                    if (icon) {
                        const inputId = inputElement.id;
                        if (inputId === 'artwork') {
                            icon.className = 'fas fa-cloud-upload-alt';
                        } else if (inputId === 'audio') {
                            icon.className = 'fas fa-file-audio';
                        }
                    }
                }
            }

            // Initialize with existing files if any
            if (inputElement.files && inputElement.files.length) {
                updateDropZone(dropZoneElement, inputElement.files[0]);
            }
        });
    }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUpload);
} else {
    initializeUpload();
}

// Make function globally available
window.initializeUpload = initializeUpload;