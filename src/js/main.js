document.addEventListener('DOMContentLoaded', () => {
    // --- Global Variables & Helper Functions ---
    const toastContainer = document.getElementById('toast-container');
    const cartItemCount = document.getElementById('cart-item-count');

    // --- Global Player State Management ---
    const PLAYER_STORAGE_KEY = 'housebeats_player_state';
    
    function savePlayerState(state) {
        try {
            localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Could not save player state:', e);
        }
    }
    
    function loadPlayerState() {
        try {
            const saved = localStorage.getItem(PLAYER_STORAGE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.warn('Could not load player state:', e);
            return null;
        }
    }
    
    function clearPlayerState() {
        try {
            localStorage.removeItem(PLAYER_STORAGE_KEY);
        } catch (e) {
            console.warn('Could not clear player state:', e);
        }
    }

    /**
     * Creates and displays a toast notification.
     * @param {string} message The message to display.
     * @param {string} type The type of toast (success, error, info).
     */
    function createToast(message, type = 'info') {
        if (!toastContainer || !message) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
        toast.innerHTML = `<i class="fas ${icons[type] || icons['info']} toast-icon"></i><span class="toast-message">${message}</span><button class="toast-close-btn">&times;</button>`;
        toastContainer.appendChild(toast);
        const removeToast = () => {
            toast.classList.add('fade-out');
            toast.addEventListener('animationend', () => toast.remove());
        };
        setTimeout(removeToast, 5000);
        toast.querySelector('.toast-close-btn').addEventListener('click', removeToast);
    }

    // Display initial notification if it exists from a previous page load
    if (typeof notificationDetails !== 'undefined' && notificationDetails.message) {
        createToast(notificationDetails.message, notificationDetails.type);
    }

    /**
     * Sends a POST request with JSON data.
     * @param {string} url The URL to send the request to.
     * @param {object} data The data to send in the request body.
     * @returns {Promise<object>} The JSON response from the server.
     */
    async function postData(url = '', data = {}) {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    /**
     * Updates the cart item count in the header by fetching the latest cart data.
     */
    const updateCartCount = async function() {
        try {
            const response = await postData('handle_cart.php', { action: 'get' });
            if (response.status === 'success' && response.items) {
                const count = response.items.length;
                if (cartItemCount) {
                    cartItemCount.textContent = count;
                    cartItemCount.style.display = count > 0 ? 'flex' : 'none';
                }
            } else {
                if (cartItemCount) cartItemCount.style.display = 'none';
            }
        } catch (error) {
            console.error("Could not update cart count:", error);
        }
    };

    // --- Main Initialization Function ---
    function initializePageScripts() {
        console.log('Initializing all page scripts...');

        // 1. Header & Mobile Navigation
        const body = document.querySelector('body');
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => body.classList.toggle('nav-open'));
        }
        document.querySelector('.mobile-nav-overlay')?.addEventListener('click', () => body.classList.remove('nav-open'));
        const header = document.querySelector('.main-header');
        if (header) {
            window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 10));
        }
        
        // 2. License Modal & "Add to Cart" Logic
        const licenseModal = document.getElementById('license-modal');
        if (licenseModal) {
            const licenseOverlay = document.getElementById('license-modal-overlay');
            const licenseCloseBtn = document.getElementById('license-modal-close-btn');

            const toggleLicenseModal = (shouldOpen) => {
                licenseModal.classList.toggle('open', shouldOpen);
                licenseOverlay.classList.toggle('open', shouldOpen);
            };

            licenseCloseBtn?.addEventListener('click', () => toggleLicenseModal(false));
            licenseOverlay?.addEventListener('click', () => toggleLicenseModal(false));

            const openLicenseModal = (beatCard) => {
                const beatData = beatCard.dataset;
                const licenseOptionsContainer = licenseModal.querySelector('.license-options');
                const usageTermsContainer = licenseModal.querySelector('#usage-terms-content');
                const totalPriceEl = licenseModal.querySelector('#license-total-price');
                const modalAddToCartBtn = licenseModal.querySelector('#modal-add-to-cart-btn');

                const licenses = {
                    'MP3 Lease': { price: beatData.priceMp3, files: 'MP3', terms: '<ul><li><i class="fas fa-microphone"></i>USED FOR MUSIC RECORDING</li><li><i class="fas fa-chart-line"></i>DISTRIBUTE UP TO 2,000 COPIES</li><li><i class="fas fa-broadcast-tower"></i>25,000 ONLINE AUDIO STREAMS</li></ul>' },
                    'WAV Lease': { price: beatData.priceWav, files: 'MP3, WAV', terms: '<ul><li><i class="fas fa-microphone"></i>USED FOR MUSIC RECORDING</li><li><i class="fas fa-chart-line"></i>DISTRIBUTE UP TO 5,000 COPIES</li><li><i class="fas fa-broadcast-tower"></i>100,000 ONLINE AUDIO STREAMS</li></ul>' },
                    'Unlimited Lease': { price: beatData.priceUnlimited, files: 'MP3, WAV, STEMS', terms: '<ul><li><i class="fas fa-infinity"></i>UNLIMITED DISTRIBUTION</li><li><i class="fas fa-broadcast-tower"></i>UNLIMITED ONLINE STREAMS</li></ul>' }
                };

                licenseOptionsContainer.innerHTML = '';
                Object.entries(licenses).forEach(([name, data]) => {
                    if (data.price) { // Only show licenses that have a price
                        licenseOptionsContainer.innerHTML += `<div class="license-option" data-license-name="${name}" data-price="${data.price}" data-terms='${data.terms}'><div class="name">${name}</div><div class="price">$${parseFloat(data.price).toFixed(2)}</div><div class="files">${data.files}</div></div>`;
                    }
                });

                let selectedLicense = {};
                const selectLicense = (optionEl) => {
                    if (!optionEl) return;
                    licenseOptionsContainer.querySelectorAll('.license-option').forEach(el => el.classList.remove('selected'));
                    optionEl.classList.add('selected');
                    selectedLicense = { name: optionEl.dataset.licenseName, price: optionEl.dataset.price };
                    totalPriceEl.textContent = `$${parseFloat(selectedLicense.price).toFixed(2)}`;
                    usageTermsContainer.innerHTML = optionEl.dataset.terms;
                };

                licenseOptionsContainer.querySelectorAll('.license-option').forEach(option => {
                    option.addEventListener('click', () => selectLicense(option));
                });
                selectLicense(licenseOptionsContainer.querySelector('.license-option'));

                modalAddToCartBtn.onclick = () => {
                    if (!selectedLicense.name || !selectedLicense.price) {
                        createToast('Please select a license.', 'error');
                        return;
                    }
                    postData('handle_cart.php', {
                        action: 'add',
                        beat_id: beatData.beatId,
                        license_type: selectedLicense.name,
                        price: selectedLicense.price
                    }).then(data => {
                        createToast(data.message, data.status);
                        if (data.status === 'success') {
                            updateCartCount();
                            toggleLicenseModal(false);
                        }
                    });
                };
                toggleLicenseModal(true);
            };

            document.addEventListener('click', (e) => {
                const buyButton = e.target.closest('.cart-action-btn');
                if (buyButton) {
                    e.preventDefault();
                    const beatCard = buyButton.closest('.beat-card');
                    if (beatCard) {
                        openLicenseModal(beatCard);
                    }
                }
            });
        }

        // 3. Global Music Player
        const player = document.getElementById('global-player');
        if (player) {
            const audio = document.getElementById('global-audio');
            const playPauseGlobalBtn = document.getElementById('play-pause-btn-global');
            const nextBtn = document.getElementById('next-btn');
            const prevBtn = document.getElementById('prev-btn');
            const progressBar = document.getElementById('progress-bar-global');
            const progress = document.getElementById('progress-global');
            const currentTimeEl = document.getElementById('current-time');
            const totalTimeEl = document.getElementById('total-time');
            const playerTitle = document.getElementById('player-title');
            const playerProducer = document.getElementById('player-producer');
            const playerArtwork = document.getElementById('player-artwork');
            const playerGenre = document.getElementById('player-genre');
            const playerBpm = document.getElementById('player-bpm');
            const playerKey = document.getElementById('player-key');
            const playerMood = document.getElementById('player-mood');
            
            const beatCards = Array.from(document.querySelectorAll('.beat-card'));
            const playlist = beatCards.map(card => card.dataset);
            let currentTrackIndex = -1;
            let isPlaying = false;
            
            // Load saved player state on page load
            const savedState = loadPlayerState();
            if (savedState && savedState.currentTrack) {
                // Find the track in current playlist or use saved data
                const trackIndex = playlist.findIndex(track => 
                    track.beatId === savedState.currentTrack.beatId
                );
                
                if (trackIndex !== -1) {
                    // Track found in current playlist
                    loadTrack(trackIndex, false);
                    if (savedState.currentTime) {
                        audio.currentTime = savedState.currentTime;
                    }
                    if (savedState.isPlaying) {
                        playTrack();
                    }
                } else {
                    // Track not in current playlist, use saved data
                    loadTrackFromSavedData(savedState.currentTrack);
                    if (savedState.currentTime) {
                        audio.currentTime = savedState.currentTime;
                    }
                    if (savedState.isPlaying) {
                        playTrack();
                    }
                }
                player.classList.add('visible');
            }

            const loadTrack = (index, autoPlay = true) => {
                if (index < 0 || index >= playlist.length) return;
                currentTrackIndex = index;
                const track = playlist[index];
                
                playerTitle.textContent = track.title || 'Unknown Track';
                playerProducer.textContent = track.producer || 'Unknown Producer';
                playerArtwork.src = track.artworkSrc || 'https://placehold.co/56';
                if (playerGenre) playerGenre.textContent = track.genre || '';
                if (playerBpm) playerBpm.textContent = track.bpm ? `${track.bpm} BPM` : '';
                if (playerKey) playerKey.textContent = track.key || '';
                if (playerMood) playerMood.textContent = track.mood || '';
                audio.src = track.audioSrc;
                
                // Save current track state
                savePlayerState({
                    currentTrack: track,
                    currentTime: 0,
                    isPlaying: false
                });
                
                if (autoPlay) {
                    playTrack();
                }
                player.classList.add('visible');
            };
            
            const loadTrackFromSavedData = (trackData) => {
                currentTrackIndex = -1; // Not in current playlist
                
                playerTitle.textContent = trackData.title || 'Unknown Track';
                playerProducer.textContent = trackData.producer || 'Unknown Producer';
                playerArtwork.src = trackData.artworkSrc || 'https://placehold.co/56';
                if (playerGenre) playerGenre.textContent = trackData.genre || '';
                if (playerBpm) playerBpm.textContent = trackData.bpm ? `${trackData.bpm} BPM` : '';
                if (playerKey) playerKey.textContent = trackData.key || '';
                if (playerMood) playerMood.textContent = trackData.mood || '';
                audio.src = trackData.audioSrc;
                
                player.classList.add('visible');
            };

            const playTrack = () => {
                isPlaying = true;
                audio.play().catch(e => console.error("Audio play failed:", e));
                playPauseGlobalBtn.innerHTML = '<i class="fas fa-pause"></i>';
                updateAllCardIcons();
                
                // Update saved state
                const currentTrack = currentTrackIndex >= 0 ? playlist[currentTrackIndex] : null;
                if (currentTrack) {
                    savePlayerState({
                        currentTrack: currentTrack,
                        currentTime: audio.currentTime,
                        isPlaying: true
                    });
                }
            };

            const pauseTrack = () => {
                isPlaying = false;
                audio.pause();
                playPauseGlobalBtn.innerHTML = '<i class="fas fa-play"></i>';
                updateAllCardIcons();
                
                // Update saved state
                const currentTrack = currentTrackIndex >= 0 ? playlist[currentTrackIndex] : null;
                if (currentTrack) {
                    savePlayerState({
                        currentTrack: currentTrack,
                        currentTime: audio.currentTime,
                        isPlaying: false
                    });
                }
            };

            const updateAllCardIcons = () => {
                beatCards.forEach((card, index) => {
                    const icon = card.querySelector('.play-pause-btn-card i');
                    if (icon) {
                        icon.className = `fas fa-${index === currentTrackIndex && isPlaying ? 'pause' : 'play'}`;
                    }
                    card.classList.toggle('is-playing', index === currentTrackIndex);
                });
            };

            const playNext = () => {
                if (currentTrackIndex >= 0 && playlist.length > 0) {
                    loadTrack((currentTrackIndex + 1) % playlist.length);
                }
            };
            
            const playPrev = () => {
                if (currentTrackIndex >= 0 && playlist.length > 0) {
                    loadTrack((currentTrackIndex - 1 + playlist.length) % playlist.length);
                }
            };

            playPauseGlobalBtn?.addEventListener('click', () => (isPlaying ? pauseTrack() : playTrack()));
            nextBtn?.addEventListener('click', playNext);
            prevBtn?.addEventListener('click', playPrev);

            audio.addEventListener('timeupdate', () => {
                if (audio.duration) {
                    progress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
                    const formatTime = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
                    currentTimeEl.textContent = formatTime(audio.currentTime);
                    totalTimeEl.textContent = formatTime(audio.duration);
                    
                    // Periodically save current time
                    const currentTrack = currentTrackIndex >= 0 ? playlist[currentTrackIndex] : null;
                    if (currentTrack && Math.floor(audio.currentTime) % 5 === 0) { // Save every 5 seconds
                        savePlayerState({
                            currentTrack: currentTrack,
                            currentTime: audio.currentTime,
                            isPlaying: isPlaying
                        });
                    }
                }
            });
            
            audio.addEventListener('ended', () => {
                playNext();
            });
            
            audio.addEventListener('pause', () => {
                // Update state when audio is paused
                const currentTrack = currentTrackIndex >= 0 ? playlist[currentTrackIndex] : null;
                if (currentTrack) {
                    savePlayerState({
                        currentTrack: currentTrack,
                        currentTime: audio.currentTime,
                        isPlaying: false
                    });
                }
            });

            progressBar?.addEventListener('click', (e) => {
                if(audio.duration) {
                    audio.currentTime = (e.offsetX / progressBar.clientWidth) * audio.duration;
                }
            });

            beatCards.forEach((card, index) => {
                card.querySelector('.play-pause-btn-card')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (currentTrackIndex === index && isPlaying) {
                        pauseTrack();
                    } else {
                        loadTrack(index);
                    }
                });
            });
            
            // Clear player state when page is unloaded (optional)
            window.addEventListener('beforeunload', () => {
                if (audio.src && !audio.paused) {
                    const currentTrack = currentTrackIndex >= 0 ? playlist[currentTrackIndex] : null;
                    if (currentTrack) {
                        savePlayerState({
                            currentTrack: currentTrack,
                            currentTime: audio.currentTime,
                            isPlaying: !audio.paused
                        });
                    }
                }
            });
        }
        
        // 4. Search Bar Logic
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) {
            searchInput.addEventListener('keyup', () => {
                const searchTerm = searchInput.value.toLowerCase().trim();
                document.querySelectorAll('.beat-card').forEach(card => {
                    const title = card.dataset.title?.toLowerCase() || '';
                    const producer = card.dataset.producer?.toLowerCase() || '';
                    const genre = card.dataset.genre?.toLowerCase() || '';
                    const mood = card.dataset.mood?.toLowerCase() || '';
                    const isMatch = title.includes(searchTerm) || producer.includes(searchTerm) || genre.includes(searchTerm) || mood.includes(searchTerm);
                    card.style.display = isMatch ? 'flex' : 'none';
                });
            });
        }

        // 5. Testimonials Slider
        const testimonialsSlider = document.querySelector('.testimonials-slider');
        if (testimonialsSlider) {
            const sliderContainer = testimonialsSlider.querySelector('.slider-container');
            const navDots = testimonialsSlider.querySelectorAll('.nav-dot');
            const totalSlides = navDots.length;
            let currentSlide = 0;
            let slideInterval;
            const slideDuration = 7000;

            const goToSlide = (slideIndex) => {
                currentSlide = slideIndex;
                if (sliderContainer) sliderContainer.style.transform = `translateX(-${slideIndex * 100}%)`;
                navDots.forEach(dot => dot.classList.remove('active'));
                if (navDots[slideIndex]) navDots[slideIndex].classList.add('active');
            };

            const startSlider = () => {
                clearInterval(slideInterval);
                slideInterval = setInterval(() => {
                    currentSlide = (currentSlide + 1) % totalSlides;
                    goToSlide(currentSlide);
                }, slideDuration);
            };

            navDots.forEach(dot => {
                dot.addEventListener('click', () => {
                    goToSlide(parseInt(dot.dataset.slide));
                    clearInterval(slideInterval);
                    startSlider();
                });
            });
            if(totalSlides > 1) startSlider();
        }

        // 6. Auth Form Toggling
        const authContainer = document.querySelector('.auth-container-vibrant');
        if (authContainer) {
            const toggleButtons = authContainer.querySelectorAll('.toggle-btn');
            const loginForm = document.getElementById('login-form');
            const signupForm = document.getElementById('signup-form');
            const switchForm = (formType) => {
                if (loginForm) loginForm.classList.toggle('active', formType === 'login');
                if (signupForm) signupForm.classList.toggle('active', formType === 'signup');
                toggleButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.form === formType));
            };
            toggleButtons.forEach(button => {
                button.addEventListener('click', () => switchForm(button.dataset.form));
            });
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('form') === 'signup') {
                switchForm('signup');
            } else {
                switchForm('login');
            }
        }

        // Initial call to set cart count on page load
        updateCartCount();
    }

    // Run the initialization for all scripts
    initializePageScripts();
});
