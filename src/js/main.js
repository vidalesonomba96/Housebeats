// Housebeats/src/js/main.js

document.addEventListener('DOMContentLoaded', () => {

        // --- Global Helper Functions & Notification System (KEPT) ---
    const toastContainer = document.getElementById('toast-container'); // This element is now in main_content_start.php for persistence

    function createToast(message, type = 'info') {
        if (!toastContainer || !message) return; // toastContainer should now always exist
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

    // Pass notification details from PHP to JS (only on full page load)
    if (typeof notificationDetails !== 'undefined' && notificationDetails.message) {
        createToast(notificationDetails.message, notificationDetails.type);
        // Clear PHP session notification variables after displaying
        // This part is handled by PHP now (header.php) but good to keep in mind.
    }

    async function postData(url = '', data = {}) {
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        return response.json();
    }


    // --- Central Function to Initialize/Re-initialize Page-Specific Scripts ---
    // This function will be called on initial load AND after AJAX content loads.
    function initializePageScripts() {
        console.log('initializePageScripts called.'); // Added for debugging

        // --- General Website Logic (Header, Mobile Nav) - KEPT ---
        // These are mostly global, so they might not need re-initialization unless their DOM structure changes
        const body = document.querySelector('body');
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        if (menuToggle && body) {
            const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
            // Remove previous listeners to prevent duplicates on AJAX loads
            const newMenuToggle = menuToggle.cloneNode(true);
            menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);
            newMenuToggle.addEventListener('click', () => body.classList.toggle('nav-open'));
            mobileNavOverlay?.addEventListener('click', () => body.classList.remove('nav-open'));
            // Re-attach listeners for mobile nav links
            document.querySelectorAll('.mobile-nav a').forEach(link => {
                const newLink = link.cloneNode(true);
                link.parentNode.replaceChild(newLink, link);
                newLink.addEventListener('click', () => body.classList.remove('nav-open'));
            });
        }
        const header = document.querySelector('.main-header');
        if (header) { window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 10)); }


        // --- A. Mini Cart & License Modal System (KEPT & Re-initialized) ---
        let updateCart; // Needs to be re-declared if inside this function, or passed as global variable/context
        const cartToggleButton = document.getElementById('cart-toggle-btn'); // Global, no re-selection
        const licenseModal = document.getElementById('license-modal'); // Global, no re-selection

        // Re-attach listeners for buttons that can be loaded dynamically
        const reinitializeCartAndLicenseListeners = () => {
             // Ensure this only runs if elements exist
            if (cartToggleButton && licenseModal) {
                const cartPanel = document.getElementById('mini-cart-panel');
                const cartOverlay = document.getElementById('mini-cart-overlay');
                const cartCloseButton = document.getElementById('mini-cart-close-btn');
                const cartContent = document.getElementById('mini-cart-content');
                const cartItemCount = document.getElementById('cart-item-count');
                const cartSubtotal = document.getElementById('mini-cart-subtotal');
                const checkoutBtn = document.getElementById('checkout-btn');

                updateCart = async function() {
                    try {
                        const response = await postData('handle_cart.php', { action: 'get' });
                        if (response.status !== 'success') return;
                        const items = response.items;
                        let subtotal = 0;
                        cartItemCount.textContent = items.length;
                        cartItemCount.style.display = items.length > 0 ? 'flex' : 'none';
                        checkoutBtn.classList.toggle('disabled', items.length === 0);

                        if (items.length > 0) {
                            cartContent.innerHTML = '';
                            items.forEach(item => {
                                const price = item.price;
                                subtotal += parseFloat(price);
                                cartContent.innerHTML += `
                                    <div class="mini-cart-item" data-beat-id="${item.id}">
                                        <img src="${item.artwork_url || 'https://placehold.co/64'}" alt="${item.title}">
                                        <div class="mini-cart-item-info"><div class="title">${item.title}</div><div class="producer">${item.producer_name}</div></div>
                                        <span class="mini-cart-item-price">$${parseFloat(price).toFixed(2)}</span>
                                        <button class="mini-cart-item-remove" data-beat-id="${item.id}">&times;</button>
                                    </div>`;
                            });
                        } else {
                            cartContent.innerHTML = `<div class="empty-cart-message"><i class="fas fa-shopping-bag"></i><p>Your cart is empty</p><span>When you add something to your cart, it will appear here</span></div>`;
                        }
                        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
                    } catch (error) { console.error("Could not update cart:", error); }
                };

                const toggleMiniCart = (forceOpen = null) => {
                    const shouldOpen = forceOpen !== null ? forceOpen : !cartPanel.classList.contains('open');
                    if (shouldOpen) { updateCart(); }
                    cartPanel.classList.toggle('open', shouldOpen);
                    cartOverlay.classList.toggle('open', shouldOpen);
                };

                // Ensure event listeners are not duplicated
                cartToggleButton.removeEventListener('click', toggleMiniCart);
                cartToggleButton.addEventListener('click', () => toggleMiniCart(true));
                cartCloseButton.removeEventListener('click', toggleMiniCart);
                cartCloseButton.addEventListener('click', () => toggleMiniCart(false));
                cartOverlay.removeEventListener('click', toggleMiniCart);
                cartOverlay.addEventListener('click', () => toggleMiniCart(false));

                const licenseOverlay = document.getElementById('license-modal-overlay');
                const licenseCloseBtn = document.getElementById('license-modal-close-btn');
                const toggleLicenseModal = (shouldOpen) => { licenseModal.classList.toggle('open', shouldOpen); licenseOverlay.classList.toggle('open', shouldOpen); };
                licenseCloseBtn?.removeEventListener('click', toggleLicenseModal);
                licenseCloseBtn?.addEventListener('click', () => toggleLicenseModal(false));
                licenseOverlay?.removeEventListener('click', toggleLicenseModal);
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
                        'Unlimited Lease': { price: beatData.priceUnlimited, files: 'MP3, WAV, STEMS', terms: '<ul><li><i class="fas fa-microphone"></i>USED FOR MUSIC RECORDING</li><li><i class="fas fa-chart-line"></i>DISTRIBUTE UP TO 5,000 COPIES</li><li><i class="fas fa-infinity"></i>UNLIMITED DISTRIBUTION</li><li><i class="fas fa-broadcast-tower"></i>UNLIMITED ONLINE STREAMS</li></ul>' }
                    };

                    licenseOptionsContainer.innerHTML = '';
                    Object.entries(licenses).forEach(([name, data]) => { licenseOptionsContainer.innerHTML += `<div class="license-option" data-license-name="${name}" data-price="${data.price}" data-terms='${data.terms}'><div class="name">${name}</div><div class="price">$${parseFloat(data.price).toFixed(2)}</div><div class="files">${data.files}</div></div>`; });

                    let selectedLicense = {};
                    const selectLicense = (optionEl) => {
                        if (!optionEl) return;
                        licenseOptionsContainer.querySelectorAll('.license-option').forEach(el => el.classList.remove('selected'));
                        optionEl.classList.add('selected');
                        selectedLicense = { name: optionEl.dataset.licenseName, price: optionEl.dataset.price };
                        totalPriceEl.textContent = `$${parseFloat(selectedLicense.price).toFixed(2)}`;
                        usageTermsContainer.innerHTML = optionEl.dataset.terms;
                    };

                    licenseOptionsContainer.querySelectorAll('.license-option').forEach(option => option.addEventListener('click', () => selectLicense(option)));
                    selectLicense(licenseOptionsContainer.querySelector('.license-option'));

                    modalAddToCartBtn.onclick = () => {
                        postData('handle_cart.php', { action: 'add', beat_id: beatData.beatId, license_type: selectedLicense.name }).then(data => {
                            createToast(data.message, data.status);
                            if (data.status === 'success') {
                                updateCart();
                                toggleLicenseModal(false);
                            }
                        });
                    };
                    toggleLicenseModal(true);
                };

                // Re-attach event listeners for cart/remove buttons on dynamically loaded content
                // Use event delegation for dynamically loaded items
                document.removeEventListener('click', handleCartOrRemoveButtonClick); // Remove previous delegation handler
                document.addEventListener('click', handleCartOrRemoveButtonClick);

                function handleCartOrRemoveButtonClick(e) {
                    const cartButton = e.target.closest('.cart-action-btn.primary');
                    const removeButton = e.target.closest('.mini-cart-item-remove');

                    if (cartButton) { e.preventDefault(); openLicenseModal(cartButton.closest('.beat-card')); }
                    if (removeButton) {
                        const beatId = removeButton.dataset.beatId;
                        postData('handle_cart.php', { action: 'remove', beat_id: beatId }).then(data => {
                            createToast(data.message, data.status);
                            if (data.status === 'success') updateCart();
                        });
                    }
                }

                updateCart();
            }
        };
        reinitializeCartAndLicenseListeners(); // Initial call


        // --- B. Showcase Banner Logic (KEPT & Re-initialized) ---
        const showcaseGrid = document.querySelector('.showcase-grid');
        if (showcaseGrid) {
            const columns = showcaseGrid.querySelectorAll('.showcase-column');
            const duplicationFactor = 10;
            columns.forEach(column => {
                // Clear previous duplications before re-duplicating
                const originalContent = column.children[0] ? Array.from(column.children).map(child => child.outerHTML).join('') : ''; // Get original content
                column.innerHTML = originalContent; // Reset to original before duplicating
                if (column.innerHTML.trim() !== '') {
                    for (let i = 0; i < duplicationFactor; i++) {
                        column.innerHTML += originalContent;
                    }
                }
            });
        }

        // --- C. Global Player & Search Logic (KEPT & Re-initialized) ---
        // Global player elements are outside <main>, so they persist.
        // We need to re-attach listeners to dynamically loaded beat cards.
        const player = document.getElementById('global-player');
        if(player) {
            console.log('Global player element found.'); // Added for debugging
            const audio = document.getElementById('global-audio');
            const playerArtworkContainer = document.getElementById('player-artwork-container');
            const playPauseGlobalBtn = document.getElementById('play-pause-btn-global');
            const nextBtn = document.getElementById('next-btn');
            const prevBtn = document.getElementById('prev-btn');
            const shuffleBtn = document.getElementById('shuffle-btn');
            const repeatBtn = document.getElementById('repeat-btn');
            const progressBar = document.getElementById('progress-bar-global');
            const progress = document.getElementById('progress-global');
            const currentTimeEl = document.getElementById('current-time');
            const totalTimeEl = document.getElementById('total-time');
            const volumeSlider = document.getElementById('volume-slider');
            const playerTitle = document.getElementById('player-title');
            const playerProducer = document.getElementById('player-producer');
            const playerArtwork = document.getElementById('player-artwork');
            const playerGenre = document.getElementById('player-genre');
            const playerBPM = document.getElementById('player-bpm');
            const playerKey = document.getElementById('player-key');
            const playerMood = document.getElementById('player-mood');

            // Collect all beat cards (they might be dynamically loaded)
            const beatCards = Array.from(document.querySelectorAll('.beat-card'));
            console.log('Number of beat cards found:', beatCards.length); // Added for debugging
            let playlist = beatCards.map(card => card.dataset); // Re-create playlist
            console.log('Playlist created:', playlist); // Added for debugging
            let currentTrackIndex = -1; // Reset or try to find current playing track in new playlist
            let isPlaying = !audio.paused; // Maintain playing state
            let isShuffling = shuffleBtn.classList.contains('active');
            let isRepeating = repeatBtn.classList.contains('active');

            const loadTrack = (index) => {
                console.log('loadTrack called for index:', index); // Added for debugging
                if (index < 0 || index >= playlist.length) {
                    console.warn('Invalid track index:', index); // Added for debugging
                    return;
                }
                const track = playlist[index];
                console.log('Loading track:', track.title, 'Source:', track.audioSrc); // Added for debugging
                currentTrackIndex = index;
                playerTitle.textContent = track.title;
                playerProducer.textContent = track.producer;
                if(playerArtwork) playerArtwork.src = track.artworkSrc;
                if(playerGenre) playerGenre.textContent = track.genre;
                if(playerBPM) playerBPM.textContent = `${track.bpm} BPM`;
                if(playerKey) playerKey.textContent = track.key;
                if(playerMood) playerMood.textContent = track.mood;
                audio.src = track.audioSrc;
                playTrack();
                player.classList.add('visible');
                player.classList.remove('hidden');
                updateAllCardIcons();
            };

            const playTrack = () => {
                console.log('playTrack called. Current audio paused state:', audio.paused); // Added for debugging
                isPlaying = true;
                audio.play().catch(e => console.error('Audio play failed:', e)); // Added for debugging
                playPauseGlobalBtn.innerHTML = '<i class="fas fa-pause"></i>';
                updateAllCardIcons();
            };
            const pauseTrack = () => {
                console.log('pauseTrack called.'); // Added for debugging
                isPlaying = false;
                audio.pause();
                playPauseGlobalBtn.innerHTML = '<i class="fas fa-play"></i>';
                updateAllCardIcons();
            };
            const playNext = () => {
                if (isShuffling) {
                    let randomIndex;
                    do { randomIndex = Math.floor(Math.random() * playlist.length); }
                    while (playlist.length > 1 && randomIndex === currentTrackIndex);
                    loadTrack(randomIndex);
                } else {
                    loadTrack((currentTrackIndex + 1) % playlist.length);
                }
            };
            const playPrev = () => loadTrack((currentTrackIndex - 1 + playlist.length) % playlist.length);
            const updateAllCardIcons = () => beatCards.forEach((card, index) => {
                const icon = card.querySelector('.play-pause-btn-card i');
                if(icon) icon.className = `fas fa-${index === currentTrackIndex && isPlaying ? 'pause' : 'play'}`;
                card.classList.toggle('is-playing', index === currentTrackIndex && isPlaying);
            });
            const updateProgress = () => {
                if (!audio.duration) return;
                progress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
                const formatTime = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
                totalTimeEl.textContent = formatTime(audio.duration);
                currentTimeEl.textContent = formatTime(audio.currentTime);
            };

            playerArtworkContainer?.addEventListener('click', () => {
                if (currentTrackIndex !== -1) {
                    const trackId = playlist[currentTrackIndex].beatId;
                    const cardElement = document.querySelector(`.beat-card[data-beat-id="${trackId}"]`);
                    if (cardElement) cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });

            // Re-attach listeners for all play/pause buttons on beat cards
            beatCards.forEach((card, index) => {
                const playPauseBtn = card.querySelector('.play-pause-btn-card');
                if (playPauseBtn) {
                    // Clone and replace to remove existing listeners
                    const newPlayPauseBtn = playPauseBtn.cloneNode(true);
                    playPauseBtn.parentNode.replaceChild(newPlayPauseBtn, playPauseBtn);
                    newPlayPauseBtn.addEventListener('click', e => { e.stopPropagation(); console.log('Beat card play/pause button clicked. Index:', index); (index === currentTrackIndex && isPlaying) ? pauseTrack() : loadTrack(index); }); // Added for debugging
                }
            });

            // Global player controls (likely don't need re-attaching as they are global)
            // But ensure they are attached only once if initializePageScripts can be called multiple times
            if (!playPauseGlobalBtn.dataset.listenerAttached) { // Simple flag to prevent duplicates
                playPauseGlobalBtn?.addEventListener('click', () => (currentTrackIndex === -1) ? loadTrack(0) : (isPlaying ? pauseTrack() : playTrack()));
                nextBtn?.addEventListener('click', playNext);
                prevBtn?.addEventListener('click', playPrev);
                audio.addEventListener('timeupdate', updateProgress);
                audio.addEventListener('ended', () => { isRepeating ? playTrack() : playNext(); });
                progressBar?.addEventListener('click', (e) => { if(audio.duration) audio.currentTime = (e.offsetX / progressBar.clientWidth) * audio.duration; });
                volumeSlider?.addEventListener('input', e => audio.volume = e.target.value);
                shuffleBtn?.addEventListener('click', () => { isShuffling = !isShuffling; shuffleBtn.classList.toggle('active', isShuffling); });
                repeatBtn?.addEventListener('click', () => { isRepeating = !isRepeating; repeatBtn.classList.toggle('active', isRepeating); audio.loop = isRepeating; });
                playPauseGlobalBtn.dataset.listenerAttached = 'true';
            }


            const searchInput = document.querySelector('.search-bar input');
            if (searchInput) {
                // Clone and replace to remove existing listeners
                const newSearchInput = searchInput.cloneNode(true);
                searchInput.parentNode.replaceChild(newSearchInput, searchInput);
                newSearchInput.addEventListener('keyup', () => {
                    const searchTerm = newSearchInput.value.toLowerCase().trim();
                    beatCards.forEach(card => {
                        const title = card.dataset.title.toLowerCase();
                        const producer = card.dataset.producer.toLowerCase();
                        const genre = card.querySelector('.beat-genre')?.textContent.toLowerCase() || '';
                        const mood = card.querySelector('.beat-mood')?.textContent.toLowerCase() || '';
                        const isMatch = title.includes(searchTerm) || producer.includes(searchTerm) || genre.includes(searchTerm) || mood.includes(searchTerm);
                        card.style.display = isMatch ? 'flex' : 'none';
                    });
                });
            }
        }

        // --- D. Testimonials Slider Logic (KEPT & Re-initialized) ---
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
                if(sliderContainer) sliderContainer.style.transform = `translateX(-${slideIndex * 100}%)`;
                navDots.forEach(dot => dot.classList.remove('active'));
                if(navDots[slideIndex]) navDots[slideIndex].classList.add('active');
            };

            const startSlider = () => {
                clearInterval(slideInterval);
                slideInterval = setInterval(() => {
                    currentSlide = (currentSlide + 1) % totalSlides;
                    goToSlide(currentSlide);
                }, slideDuration);
            };

            const resetSliderInterval = () => {
                clearInterval(slideInterval);
                startSlider();
            };

            navDots.forEach(dot => {
                // Clone and replace to remove existing listeners
                const newDot = dot.cloneNode(true);
                dot.parentNode.replaceChild(newDot, dot);
                newDot.addEventListener('click', () => {
                    goToSlide(parseInt(newDot.dataset.slide));
                    resetSliderInterval();
                });
            });

            startSlider();
        }

        // --- E. Authentication Form Toggle Logic (KEPT & Re-initialized) ---
        const authContainer = document.querySelector('.auth-container-vibrant');
        if (authContainer) {
            const toggleButtons = authContainer.querySelectorAll('.toggle-btn');
            const loginForm = document.getElementById('login-form');
            const signupForm = document.getElementById('signup-form');
            const switchForm = (formType) => {
                loginForm.classList.toggle('active', formType === 'login');
                signupForm.classList.toggle('active', formType === 'signup');
                toggleButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.form === formType));
            };
            toggleButtons.forEach(button => {
                // Clone and replace to remove existing listeners
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                newButton.addEventListener('click', () => switchForm(newButton.dataset.form));
            });
            const urlParams = new URLSearchParams(window.location.search);
            switchForm(urlParams.get('form') === 'signup' ? 'signup' : 'login');
        }

        // --- F. Drag & Drop File Upload (KEPT & Re-initialized) ---
        document.querySelectorAll(".drop-zone").forEach(dropZoneElement => {
            const inputElement = dropZoneElement.querySelector(".drop-zone__input");
            const promptElement = dropZoneElement.querySelector(".drop-zone__prompt p");
            const filenameElement = dropZoneElement.querySelector(".drop-zone__filename");

            // Clone and replace to remove existing listeners
            const newInputElement = inputElement.cloneNode(true);
            inputElement.parentNode.replaceChild(newInputElement, inputElement);

            const newDropZoneElement = dropZoneElement.cloneNode(true);
            dropZoneElement.parentNode.replaceChild(newDropZoneElement, dropZoneElement);

            newDropZoneElement.addEventListener("click", () => {
                newInputElement.click();
            });

            newInputElement.addEventListener("change", () => {
                if (newInputElement.files.length) {
                    updateDropZone(newDropZoneElement, newInputElement.files[0]);
                } else {
                    updateDropZone(newDropZoneElement, null);
                }
            });

            newDropZoneElement.addEventListener("dragover", e => {
                e.preventDefault();
                newDropZoneElement.classList.add("drop-zone--over");
            });

            ["dragleave", "dragend"].forEach(type => {
                newDropZoneElement.addEventListener(type, () => {
                    newDropZoneElement.classList.remove("drop-zone--over");
                });
            });

            newDropZoneElement.addEventListener("drop", e => {
                e.preventDefault();
                newDropZoneElement.classList.remove("drop-zone--over");

                if (e.dataTransfer.files.length) {
                    newInputElement.files = e.dataTransfer.files;
                    updateDropZone(newDropZoneElement, e.dataTransfer.files[0]);
                } else {
                    updateDropZone(newDropZoneElement, null);
                }
            });

            function updateDropZone(dropZoneEl, file) {
                const promptP = dropZoneEl.querySelector(".drop-zone__prompt p");
                const filenameSpan = dropZoneEl.querySelector(".drop-zone__filename");

                if (file) {
                    promptP.style.display = 'none';
                    filenameSpan.textContent = file.name;
                } else {
                    promptP.style.display = 'block';
                    filenameSpan.textContent = '';
                }
            }

            if (newInputElement.files.length) {
                updateDropZone(newDropZoneElement, newInputElement.files[0]);
            }
        });

        // --- G. Showcase Section Overlay Content (KEPT & Re-initialized) ---
        document.querySelectorAll(".showcase-artwork").forEach(artworkElement => {
            const title = artworkElement.dataset.title;
            const producer = artworkElement.dataset.producer;

            const overlayTitle = artworkElement.querySelector(".showcase-overlay-title");
            const overlayProducer = artworkElement.querySelector(".showcase-overlay-producer");

            if (overlayTitle) overlayTitle.textContent = title;
            if (overlayProducer) overlayProducer.textContent = producer;
        });

        // --- H. Fade-in animation for Featured Beats Section (KEPT & Re-initialized) ---
        const beatsSection = document.getElementById('beats-section');
        if (beatsSection) {
            // Remove previous class if present (e.g., on re-load)
            beatsSection.classList.remove('beats-section--loaded');
            // Use a slight delay to ensure CSS is rendered and then trigger animation
            setTimeout(() => {
                beatsSection.classList.add('beats-section--loaded');
            }, 100);
        }
    } // End of initializePageScripts

    // --- Main AJAX Navigation Logic ---
    let currentPath = window.location.pathname + window.location.search; // Track current path for history

    // Initial call to initialize scripts on first page load
    initializePageScripts();

    // --- **FIX** DYNAMIC STYLESHEET MANAGEMENT ---
    const manageStylesheets = (path) => {
        const dashboardStylesheetId = 'dashboard-stylesheet';
        const existingStylesheet = document.getElementById(dashboardStylesheetId);

        // If navigating TO the dashboard page
        if (path.includes('dashboard.php')) {
            // And the stylesheet doesn't already exist in the head
            if (!existingStylesheet) {
                const link = document.createElement('link');
                link.id = dashboardStylesheetId;
                link.rel = 'stylesheet';
                link.href = 'src/css/dashboard.css';
                document.head.appendChild(link);
            }
        } 
        // If navigating AWAY from the dashboard page
        else {
            // And the stylesheet exists
            if (existingStylesheet) {
                // Remove it from the head to prevent style conflicts
                existingStylesheet.remove();
            }
        }
    };

    // Event listener for all internal links
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a'); // Use closest to get the <a> tag even if child element is clicked

        if (target &&
            target.href.startsWith(window.location.origin) && // Is an internal link
            !target.target && // Not target="_blank"
            !target.hash && // Not an anchor link
            !target.download && // Not a download link
            !target.classList.contains('logout-btn') && // Don't intercept logout, it needs full reload
            !target.classList.contains('logout-btn-dashboard') && // Don't intercept dashboard logout
            !target.classList.contains('cart-toggle-btn') && // Don't intercept cart toggle
            !target.closest('#mini-cart-panel') // Don't intercept links inside mini-cart (e.g., checkout)
        ) {
            e.preventDefault(); // Stop default navigation

            const url = new URL(target.href);
            url.searchParams.set('ajax', 'true');

            // Store current path before fetching new content for popstate
            history.pushState({ path: currentPath }, '', currentPath);
            currentPath = target.pathname + target.search; // Update currentPath to the new URL

            // Show loading indicator (optional, but good for UX)
            document.body.classList.add('loading-page');

            fetch(url.toString())
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok.');
                    return response.text(); // Get raw HTML of the <main> content
                })
                .then(html => {
                    const currentMain = document.querySelector('main');
                    if (currentMain) {
                        // Create a temporary div to parse the incoming HTML string
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = html;

                        // Replace the content of the current <main> with the content from the temporary div
                        currentMain.innerHTML = tempDiv.innerHTML;

                        // Update actual URL in address bar
                        history.pushState({ path: currentPath }, '', target.href);

                        // Scroll to top of the page after content change
                        window.scrollTo(0, 0);

                        // --- **FIX** Manage stylesheets based on the new page ---
                        manageStylesheets(target.pathname);

                        // --- Re-initialize all page-specific scripts for the new content ---
                        initializePageScripts();

                        // Specific re-initialization for dashboard.js if it exists and dashboard is loaded
                        if (target.pathname.includes('dashboard.php') && typeof initializeDashboardScripts === 'function') {
                            initializeDashboardScripts(); // Call dashboard specific JS init
                        }

                        // Remove loading indicator
                        document.body.classList.remove('loading-page');
                    } else {
                        console.error('AJAX: Could not find the main content element on the current page.');
                        window.location.href = target.href; // Fallback
                    }
                })
                .catch(error => {
                    console.error('AJAX navigation failed:', error);
                    // Fallback to full page reload on error
                    window.location.href = target.href;
                });
        }
    });

    // Handle browser's back/forward buttons (popstate event)
    window.addEventListener('popstate', (e) => {
        // Only handle if state exists (to avoid initial page load popstate)
        if (e.state && e.state.path) {
            const url = new URL(window.location.origin + e.state.path);
            url.searchParams.set('ajax', 'true');

            document.body.classList.add('loading-page');

            fetch(url.toString())
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok.');
                    return response.text();
                })
                .then(html => {
                    const currentMain = document.querySelector('main');
                    if (currentMain) {
                         // Create a temporary div to parse the incoming HTML string
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = html;

                        // Replace the content of the current <main> with the content from the temporary div
                        currentMain.innerHTML = tempDiv.innerHTML;

                        window.scrollTo(0, 0); // Scroll to top

                        // --- **FIX** Manage stylesheets based on the restored page ---
                        manageStylesheets(window.location.pathname);

                        // Re-initialize scripts for the restored content
                        initializePageScripts();

                        // Specific re-initialization for dashboard.js if dashboard is loaded
                        if (window.location.pathname.includes('dashboard.php') && typeof initializeDashboardScripts === 'function') {
                            initializeDashboardScripts();
                        }
                    }
                    document.body.classList.remove('loading-page');
                })
                .catch(error => {
                    console.error('Popstate AJAX failed:', error);
                    // Fallback to full page reload on error
                    window.location.reload(); // Hard reload on popstate error
                });
            currentPath = window.location.pathname + window.location.search; // Update currentPath after popstate
        }
    });

    // --- Dynamic Script Loader ---
    const loadedScripts = {};
    function loadScript(src, callback) {
        if (loadedScripts[src]) {
            if (callback) callback();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            console.log(`${src} loaded successfully.`);
            loadedScripts[src] = true;
            if (callback) callback();
        };
        script.onerror = () => console.error(`Error loading script: ${src}`);
        document.body.appendChild(script);
    }

    // --- AJAX Navigation Logic ---
    function handleNavigation(url) {
        document.body.classList.add('loading-page');
        const ajaxUrl = new URL(url);
        ajaxUrl.searchParams.set('ajax', 'true');

        fetch(ajaxUrl.toString())
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok.');
                return response.text();
            })
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newMain = doc.querySelector('main');
                const newTitle = doc.querySelector('title');

                if (newMain) document.querySelector('main').innerHTML = newMain.innerHTML;
                if (newTitle) document.title = newTitle.textContent;

                window.scrollTo(0, 0);
                initializePageScripts();

                if (url.includes('dashboard.php')) {
                    loadScript('src/js/dashboard.js', initializeDashboard);
                }

                document.body.classList.remove('loading-page');
            })
            .catch(error => {
                console.error('AJAX navigation failed:', error);
                window.location.href = url;
            });
    }

    // --- Main Click Handler for Navigation ---
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a');
        if (!target) return;

        const isNonNavigable = !target.href || !target.href.startsWith(window.location.origin) ||
                                target.target === '_blank' || target.hasAttribute('download') ||
                                target.classList.contains('logout-btn') || target.classList.contains('logout-btn-dashboard') ||
                                target.closest('#mini-cart-panel');

        const isSamePageAnchor = target.pathname === window.location.pathname &&
                                 target.search === window.location.search &&
                                 target.hash && target.getAttribute('href').startsWith('#');

        if (!isNonNavigable && !isSamePageAnchor) {
            e.preventDefault();
            const destinationUrl = target.href;
            if (destinationUrl !== window.location.href) {
                history.pushState({ path: destinationUrl }, '', destinationUrl);
                handleNavigation(destinationUrl);
            }
        }
    });

    // --- Browser Back/Forward Button Handler ---
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.path) {
            handleNavigation(e.state.path);
        }
    });

    // --- Initial Setup on First Page Load ---
    initializePageScripts();
    if (window.location.pathname.includes('dashboard.php')) {
        loadScript('src/js/dashboard.js', initializeDashboard);
    }
});