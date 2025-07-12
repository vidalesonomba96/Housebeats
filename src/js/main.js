document.addEventListener('DOMContentLoaded', () => {
    console.log('🎵 Main.js loaded - Starting initialization...');
    
    // --- Global Variables & Helper Functions ---
    const toastContainer = document.getElementById('toast-container');
    const cartItemCount = document.getElementById('cart-item-count');

    /**
     * Creates and displays a toast notification.
     */
    function createToast(message, type = 'info') {
        console.log(`📢 Toast: ${message} (${type})`);
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

    // Make createToast globally available
    window.createToast = createToast;

    /**
     * Sends a POST request with JSON data.
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
     * Updates the cart item count in the header.
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

    // --- GLOBAL PLAYER STORAGE ---
    const PLAYER_STORAGE_KEY = 'housebeats_player_state';
    
    function savePlayerState(state) {
        try {
            localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(state));
            console.log('💾 Player state saved:', state);
        } catch (e) {
            console.warn('Could not save player state:', e);
        }
    }
    
    function loadPlayerState() {
        try {
            const saved = localStorage.getItem(PLAYER_STORAGE_KEY);
            const state = saved ? JSON.parse(saved) : null;
            console.log('📂 Player state loaded:', state);
            return state;
        } catch (e) {
            console.warn('Could not load player state:', e);
            return null;
        }
    }

    // --- MAIN INITIALIZATION FUNCTION ---
    function initializePageScripts() {
        console.log('🚀 Initializing all page scripts...');

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
        initializeLicenseModal();
        
        // 3. Global Music Player - MAIN FOCUS
        initializeGlobalPlayer();
        
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
        initializeTestimonialsSlider();

        // Initial call to set cart count on page load
        updateCartCount();
    }

    // --- GLOBAL PLAYER INITIALIZATION ---
    function initializeGlobalPlayer() {
        console.log('🎵 Starting Global Player initialization...');
        
        // Get all required elements
        const player = document.getElementById('global-player');
        const audio = document.getElementById('global-audio');
        const playPauseBtn = document.getElementById('play-pause-btn-global');
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        const progressBar = document.getElementById('progress-bar-global');
        const progress = document.getElementById('progress-global');
        const currentTimeEl = document.getElementById('current-time');
        const totalTimeEl = document.getElementById('total-time');
        const playerTitle = document.getElementById('player-title');
        const playerProducer = document.getElementById('player-producer');
        const playerArtwork = document.getElementById('player-artwork');
        const volumeSlider = document.getElementById('volume-slider');

        // Debug: Check if all elements exist
        console.log('🔍 Player elements check:', {
            player: !!player,
            audio: !!audio,
            playPauseBtn: !!playPauseBtn,
            nextBtn: !!nextBtn,
            prevBtn: !!prevBtn,
            progressBar: !!progressBar,
            progress: !!progress,
            currentTimeEl: !!currentTimeEl,
            totalTimeEl: !!totalTimeEl,
            playerTitle: !!playerTitle,
            playerProducer: !!playerProducer,
            playerArtwork: !!playerArtwork,
            volumeSlider: !!volumeSlider
        });

        if (!player || !audio) {
            console.error('❌ Critical player elements missing!');
            return;
        }

        // Get all beat cards and create playlist
        const beatCards = Array.from(document.querySelectorAll('.beat-card'));
        console.log(`🎼 Found ${beatCards.length} beat cards`);

        const playlist = beatCards.map((card, index) => {
            const track = {
                beatId: card.dataset.beatId,
                title: card.dataset.title,
                producer: card.dataset.producer,
                artworkSrc: card.dataset.artworkSrc,
                audioSrc: card.dataset.audioSrc,
                genre: card.dataset.genre,
                bpm: card.dataset.bpm,
                key: card.dataset.key,
                mood: card.dataset.mood
            };
            console.log(`🎵 Track ${index}:`, track);
            return track;
        });

        // Player state
        let currentTrackIndex = -1;
        let isPlaying = false;
        let currentTrack = null;

        // --- CORE PLAYER FUNCTIONS ---
        
        function updatePlayerUI(track) {
            console.log('🎨 Updating player UI with track:', track);
            
            if (playerTitle) playerTitle.textContent = track.title || 'Unknown Track';
            if (playerProducer) playerProducer.textContent = track.producer || 'Unknown Producer';
            if (playerArtwork) {
                playerArtwork.src = track.artworkSrc || 'https://placehold.co/56';
                playerArtwork.alt = track.title || 'Beat Artwork';
            }
            
            // Update metadata if elements exist
            const playerGenre = document.getElementById('player-genre');
            const playerBpm = document.getElementById('player-bpm');
            const playerKey = document.getElementById('player-key');
            const playerMood = document.getElementById('player-mood');
            
            if (playerGenre) playerGenre.textContent = track.genre || '';
            if (playerBpm) playerBpm.textContent = track.bpm ? `${track.bpm} BPM` : '';
            if (playerKey) playerKey.textContent = track.key || '';
            if (playerMood) playerMood.textContent = track.mood || '';
        }

        function updatePlayPauseButton() {
            if (playPauseBtn) {
                const icon = playPauseBtn.querySelector('i');
                if (icon) {
                    icon.className = `fas fa-${isPlaying ? 'pause' : 'play'}`;
                }
            }
        }

        function updateAllCardIcons() {
            beatCards.forEach((card, index) => {
                const playBtn = card.querySelector('.play-pause-btn-card');
                if (playBtn) {
                    const icon = playBtn.querySelector('i');
                    if (icon) {
                        const isCurrentCard = currentTrack && card.dataset.beatId === currentTrack.beatId;
                        icon.className = `fas fa-${isCurrentCard && isPlaying ? 'pause' : 'play'}`;
                    }
                    
                    // Add visual indicator for currently playing card
                    card.classList.toggle('is-playing', currentTrack && card.dataset.beatId === currentTrack.beatId && isPlaying);
                }
            });
        }

        function loadTrack(track, autoPlay = false) {
            console.log('📀 Loading track:', track, 'autoPlay:', autoPlay);
            
            if (!track || !track.audioSrc) {
                console.error('❌ Invalid track data');
                return;
            }

            currentTrack = track;
            
            // Find track index in current playlist
            currentTrackIndex = playlist.findIndex(t => t.beatId === track.beatId);
            console.log('📍 Track index in playlist:', currentTrackIndex);

            // Update UI
            updatePlayerUI(track);
            
            // Load audio
            audio.src = track.audioSrc;
            console.log('🔊 Audio source set to:', track.audioSrc);
            
            // Show player
            player.classList.add('visible');
            
            // Save state
            savePlayerState({
                currentTrack: track,
                currentTime: 0,
                isPlaying: false
            });

            if (autoPlay) {
                // Wait for audio to be ready
                const playWhenReady = () => {
                    console.log('▶️ Auto-playing track...');
                    playTrack();
                };
                
                if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
                    playWhenReady();
                } else {
                    audio.addEventListener('canplay', playWhenReady, { once: true });
                }
            }
            
            updateAllCardIcons();
        }

        function playTrack() {
            console.log('▶️ Attempting to play track...');
            
            if (!audio.src) {
                console.error('❌ No audio source set');
                return;
            }

            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('✅ Audio playing successfully');
                    isPlaying = true;
                    updatePlayPauseButton();
                    updateAllCardIcons();
                    
                    // Save state
                    if (currentTrack) {
                        savePlayerState({
                            currentTrack: currentTrack,
                            currentTime: audio.currentTime,
                            isPlaying: true
                        });
                    }
                }).catch(error => {
                    console.error('❌ Audio play failed:', error);
                    isPlaying = false;
                    updatePlayPauseButton();
                    
                    // Show user-friendly error
                    createToast('Unable to play audio. Please try again.', 'error');
                });
            }
        }

        function pauseTrack() {
            console.log('⏸️ Pausing track...');
            audio.pause();
            isPlaying = false;
            updatePlayPauseButton();
            updateAllCardIcons();
            
            // Save state
            if (currentTrack) {
                savePlayerState({
                    currentTrack: currentTrack,
                    currentTime: audio.currentTime,
                    isPlaying: false
                });
            }
        }

        function playNext() {
            console.log('⏭️ Playing next track...');
            if (currentTrackIndex >= 0 && currentTrackIndex < playlist.length - 1) {
                loadTrack(playlist[currentTrackIndex + 1], true);
            } else if (playlist.length > 0) {
                // Loop to beginning
                loadTrack(playlist[0], true);
            }
        }

        function playPrevious() {
            console.log('⏮️ Playing previous track...');
            if (currentTrackIndex > 0) {
                loadTrack(playlist[currentTrackIndex - 1], true);
            } else if (playlist.length > 0) {
                // Loop to end
                loadTrack(playlist[playlist.length - 1], true);
            }
        }

        // --- EVENT LISTENERS ---

        // Play/Pause button
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                console.log('🎯 Play/pause button clicked, isPlaying:', isPlaying);
                
                if (!currentTrack && playlist.length > 0) {
                    // No track loaded, load first track
                    loadTrack(playlist[0], true);
                } else if (isPlaying) {
                    pauseTrack();
                } else {
                    playTrack();
                }
            });
        }

        // Next/Previous buttons
        if (nextBtn) {
            nextBtn.addEventListener('click', playNext);
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', playPrevious);
        }

        // Beat card play buttons
        beatCards.forEach((card, index) => {
            const playBtn = card.querySelector('.play-pause-btn-card');
            if (playBtn) {
                playBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log('🎯 Beat card play button clicked for:', playlist[index]);
                    
                    const track = playlist[index];
                    if (currentTrack && currentTrack.beatId === track.beatId) {
                        // Same track, toggle play/pause
                        if (isPlaying) {
                            pauseTrack();
                        } else {
                            playTrack();
                        }
                    } else {
                        // Different track, load and play
                        loadTrack(track, true);
                    }
                });
            }
        });

        // Audio event listeners
        audio.addEventListener('loadstart', () => {
            console.log('🔄 Audio loading started...');
        });

        audio.addEventListener('canplay', () => {
            console.log('✅ Audio can play');
        });

        audio.addEventListener('error', (e) => {
            console.error('❌ Audio error:', e);
            createToast('Error loading audio file', 'error');
        });

        audio.addEventListener('timeupdate', () => {
            if (audio.duration && !isNaN(audio.duration)) {
                const progressPercent = (audio.currentTime / audio.duration) * 100;
                if (progress) progress.style.width = `${progressPercent}%`;
                
                const formatTime = (seconds) => {
                    const mins = Math.floor(seconds / 60);
                    const secs = Math.floor(seconds % 60);
                    return `${mins}:${secs.toString().padStart(2, '0')}`;
                };
                
                if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
                if (totalTimeEl) totalTimeEl.textContent = formatTime(audio.duration);
                
                // Save state periodically
                if (Math.floor(audio.currentTime) % 10 === 0 && currentTrack) {
                    savePlayerState({
                        currentTrack: currentTrack,
                        currentTime: audio.currentTime,
                        isPlaying: isPlaying
                    });
                }
            }
        });

        audio.addEventListener('ended', () => {
            console.log('🔚 Track ended, playing next...');
            playNext();
        });

        // Progress bar click
        if (progressBar) {
            progressBar.addEventListener('click', (e) => {
                if (audio.duration && !isNaN(audio.duration)) {
                    const rect = progressBar.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const width = rect.width;
                    const newTime = (clickX / width) * audio.duration;
                    audio.currentTime = newTime;
                    console.log('🎯 Seeked to:', newTime);
                }
            });
        }

        // Volume control
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                audio.volume = parseFloat(e.target.value);
                console.log('🔊 Volume set to:', audio.volume);
            });
            // Set initial volume
            audio.volume = parseFloat(volumeSlider.value) || 0.75;
        }

        // --- RESTORE SAVED STATE ---
        const savedState = loadPlayerState();
        if (savedState && savedState.currentTrack) {
            console.log('🔄 Restoring saved player state...');
            
            // Try to find track in current playlist
            const trackInPlaylist = playlist.find(t => t.beatId === savedState.currentTrack.beatId);
            
            if (trackInPlaylist) {
                console.log('✅ Found saved track in current playlist');
                loadTrack(trackInPlaylist, false);
            } else {
                console.log('📂 Using saved track data (not in current playlist)');
                loadTrack(savedState.currentTrack, false);
            }
            
            // Restore time and play state when audio is ready
            audio.addEventListener('loadedmetadata', () => {
                if (savedState.currentTime && savedState.currentTime > 0) {
                    audio.currentTime = savedState.currentTime;
                    console.log('⏰ Restored playback time:', savedState.currentTime);
                }
                
                if (savedState.isPlaying) {
                    console.log('▶️ Auto-resuming playback...');
                    playTrack();
                }
            }, { once: true });
        } else {
            console.log('📭 No saved player state found');
        }

        // Save state before page unload
        window.addEventListener('beforeunload', () => {
            if (currentTrack) {
                savePlayerState({
                    currentTrack: currentTrack,
                    currentTime: audio.currentTime,
                    isPlaying: !audio.paused
                });
                console.log('💾 Saved state before page unload');
            }
        });

        console.log('✅ Global Player initialization complete!');
    }

    // --- LICENSE MODAL ---
    function initializeLicenseModal() {
        const licenseModal = document.getElementById('license-modal');
        if (!licenseModal) return;

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
                if (data.price) {
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

    // --- TESTIMONIALS SLIDER ---
    function initializeTestimonialsSlider() {
        const testimonialsSlider = document.querySelector('.testimonials-slider');
        if (!testimonialsSlider) return;

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
        
        if (totalSlides > 1) startSlider();
    }

    // Run the initialization
    initializePageScripts();
});