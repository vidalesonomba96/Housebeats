</main>

<?php include 'src/components/footer.php'; ?>

<div id="license-modal-overlay" class="license-modal-overlay"></div>
<div id="license-modal" class="license-modal">
    <div class="license-modal-header">
        <h2>Select License</h2>
        <button id="license-modal-close-btn" class="close-btn">&times;</button>
    </div>
    <div class="license-modal-body">
        <div class="license-options">
            </div>
        <div class="usage-terms">
            <h3>Usage Terms</h3>
            <div id="usage-terms-content">
                </div>
        </div>
    </div>
    <div class="license-modal-footer">
        <div class="total-price">
            <span>TOTAL:</span>
            <strong id="license-total-price">$0.00</strong>
        </div>
        <button id="modal-add-to-cart-btn" class="checkout-btn">Add to Cart</button>
    </div>
</div>

<div id="global-player" class="global-player">
    <audio id="global-audio" src="" preload="auto"></audio>
    <div class="player-left">
        <div id="player-artwork-container">
            <img id="player-artwork" src="https://placehold.co/56" alt="Beat Artwork">
            <div class="artwork-preview-name" style="display:none;"></div>
        </div>
        <div class="player-track-info">
            <div id="player-title">Track Title</div>
            <div id="player-producer">Producer Name</div>
            <div class="player-beat-meta">
                <span id="player-genre"></span>
                <span id="player-bpm"></span>
                <span id="player-key"></span>
                <span id="player-mood"></span>
            </div>
        </div>
    </div>
    <div class="player-center">
        <div class="player-controls">
            <button id="shuffle-btn" class="control-btn" title="Shuffle"><i class="fas fa-random"></i></button>
            <button id="prev-btn" class="control-btn" title="Previous"><i class="fas fa-step-backward"></i></button>
            <button id="play-pause-btn-global" title="Play/Pause"><i class="fas fa-play"></i></button>
            <button id="next-btn" class="control-btn" title="Next"><i class="fas fa-step-forward"></i></button>
            <button id="repeat-btn" class="control-btn" title="Repeat"><i class="fas fa-redo"></i></button>
        </div>
        <div class="player-progress-container">
            <span id="current-time">0:00</span>
            <div id="progress-bar-global" class="progress-bar">
                <div id="progress-global" class="progress"></div>
            </div>
            <span id="total-time">0:00</span>
        </div>
    </div>
    <div class="player-right">
        <i class="fas fa-volume-down"></i>
        <input type="range" id="volume-slider" min="0" max="1" step="0.01" value="0.75">
        <i class="fas fa-volume-up"></i>
    </div>
</div>

<script src="src/js/main.js"></script>
<?php if (basename($_SERVER['PHP_SELF']) == 'dashboard.php'): ?>
<script src="src/js/dashboard.js"></script>
<?php endif; ?>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const notification = document.getElementById('auto-dismiss-notification');

    // Check if the notification element exists on the page
    if (notification) {
        // Wait for 5 seconds before starting the fade-out process
        setTimeout(() => {
            // Add the fade-out class to trigger the CSS animation
            notification.classList.add('fade-out');
            
            // After the animation is complete (1s total), remove the element from the DOM
            setTimeout(() => {
                notification.remove();
            }, 1000); // Animation is 0.5s + 0.5s delay = 1000ms

        }, 5000); // 5000 milliseconds = 5 seconds
    }
});
</script>

</body>
</html>