<!-- License Selection Modal -->
<div id="license-modal" class="license-modal">
    <div class="license-modal-content">
        <div class="license-modal-header">
            <h2>Choose Your License</h2>
            <button id="license-modal-close-btn" class="close-btn">&times;</button>
        </div>
        <div class="license-modal-body">
            <div class="beat-preview">
                <img id="modal-beat-artwork" src="" alt="Beat Artwork">
                <div class="beat-info">
                    <h3 id="modal-beat-title">Beat Title</h3>
                    <p id="modal-beat-producer">Producer Name</p>
                </div>
            </div>
            
            <div class="license-options">
                <!-- License options will be populated by JavaScript -->
            </div>
            
            <div class="usage-terms">
                <h3>Usage Terms</h3>
                <div id="usage-terms-content">
                    <!-- Terms will be populated by JavaScript -->
                </div>
            </div>
            
            <div class="license-modal-footer">
                <div class="total-price">
                    <span>Total: </span>
                    <span id="license-total-price">$0.00</span>
                </div>
                <button id="modal-add-to-cart-btn" class="add-to-cart-btn">
                    <i class="fas fa-shopping-cart"></i>
                    Add to Cart
                </button>
            </div>
        </div>
    </div>
</div>
<div id="license-modal-overlay" class="license-modal-overlay"></div>