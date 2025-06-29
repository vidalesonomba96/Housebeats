<?php
// Initialize the application
// 1. Start the session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
// 2. Connect to the database
require_once 'db_connect.php';

// Check if this is an AJAX request for seamless navigation
if (isset($_GET['ajax']) && $_GET['ajax'] === 'true') {
    // For AJAX requests, only render the content that goes inside <main>
} else {
    // For full page loads, include the standard HTML start
    include 'src/components/main_content_start.php';
    echo '<title>HouseBeats - Modern Beat Marketplace</title>';
}

// --- DATABASE LOGIC: START ---
$featured_beats = [];
$latest_beats = [];

$featured_sql = "SELECT id, title, producer_name, genre, mood, bpm, `key`, artwork_url, audio_url, price_mp3, price_wav, price_unlimited FROM beats WHERE is_featured = 1 ORDER BY upload_date DESC";
$featured_result = $conn->query($featured_sql);
if ($featured_result && $featured_result->num_rows > 0) {
    $featured_beats = $featured_result->fetch_all(MYSQLI_ASSOC);
}

$latest_sql = "SELECT title, artwork_url FROM beats ORDER BY upload_date DESC LIMIT 15";
$latest_result = $conn->query($latest_sql);
if ($latest_result && $latest_result->num_rows > 0) {
    $latest_beats = $latest_result->fetch_all(MYSQLI_ASSOC);
}
// --- DATABASE LOGIC: END ---
?>

        <section class="hero">
            <video autoplay loop muted playsinline class="hero-video">
                <source src="src/assets/hero-video.mp4" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            <div class="hero-content">
                <h1>Discover Your Signature Sound</h1>
                <p>The ultimate platform for artists to buy and producers to sell high-quality beats.</p>
                <div class="search-bar">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" placeholder="Search for beats, genres, or artists...">
                </div>
            </div>
        </section>

        <section id="beats-section" class="beats-section">
            <div class="container">
                <div class="section-header">
                    <h2>Featured Beats</h2>
                    <a href="#" class="view-all-btn">View All <i class="fas fa-arrow-right"></i></a>
                </div>
                <div class="beat-grid">
                    <?php if (!empty($featured_beats)): ?>
                        <?php foreach ($featured_beats as $index => $beat): ?>
                            <div class="beat-card"
                                data-beat-id="<?php echo $beat['id']; ?>"
                                data-title="<?php echo htmlspecialchars($beat['title']); ?>"
                                data-producer="<?php echo htmlspecialchars($beat['producer_name']); ?>"
                                data-price-mp3="<?php echo htmlspecialchars($beat['price_mp3']); ?>"
                                data-price-wav="<?php echo htmlspecialchars($beat['price_wav']); ?>"
                                data-price-unlimited="<?php echo htmlspecialchars($beat['price_unlimited']); ?>"
                                data-artwork-src="<?php echo htmlspecialchars($beat['artwork_url']); ?>"
                                data-audio-src="<?php echo htmlspecialchars($beat['audio_url']); ?>"
                                data-genre="<?php echo htmlspecialchars($beat['genre']); ?>"
                                data-bpm="<?php echo htmlspecialchars($beat['bpm']); ?>"
                                data-key="<?php echo htmlspecialchars($beat['key']); ?>"
                                data-mood="<?php echo htmlspecialchars($beat['mood']); ?>"
                            >
                                <div class="artwork-container">
                                    <img src="<?php echo htmlspecialchars($beat['artwork_url']); ?>" alt="Artwork for <?php echo htmlspecialchars($beat['title']); ?>">
                                    <button class="wishlist-action-btn-hover" title="Add to Wishlist" data-beat-id="<?php echo $beat['id']; ?>"><i class="far fa-heart"></i></button>
                                    <div class="overlay">
                                        <button class="play-pause-btn-card"><i class="fas fa-play"></i></button>
                                    </div>
                                </div>
                                <div class="beat-info">
                                    <h3 class="beat-title"><?php echo htmlspecialchars($beat['title']); ?></h3>
                                    <p class="beat-producer"><?php echo htmlspecialchars($beat['producer_name']); ?></p>
                                </div>
                                <div class="beat-meta">
                                    <button class="cart-action-btn primary" data-beat-id="<?php echo $beat['id']; ?>">
                                        <i class="fas fa-shopping-cart"></i>
                                        <span>$<?php echo htmlspecialchars($beat['price_mp3']); ?></span>
                                    </button>
                                    <div class="beat-tags">
                                        <span class="beat-genre"><?php echo htmlspecialchars($beat['genre']); ?></span>
                                        <span class="beat-bpm"><?php echo htmlspecialchars($beat['bpm']); ?> BPM</span>
                                        <span class="beat-key"><?php echo htmlspecialchars($beat['key']); ?></span>
                                        <?php if (!empty($beat['mood'])): ?>
                                            <span class="beat-mood"><?php echo htmlspecialchars($beat['mood']); ?></span>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <p>No featured beats found.</p>
                    <?php endif; ?>
                </div>
            </div>
        </section>
        <section class="remake-section">
             <div class="container">
                <div class="remake-content">
                    <h2>Can't Find Your Vibe? Let's Create It.</h2>
                    <p>Heard a track you love? Drop the link below and our world-class producers can create a custom remake just for you.</p>
                    <form class="remake-form">
                        <input type="text" placeholder="Paste a YouTube, Spotify, or SoundCloud link here...">
                        <button type="submit" class="remake-btn">Request Remake</button>
                    </form>
                </div>
            </div>
        </section>

        <section class="showcase-section">
            <div class="container showcase-container">
                <div class="showcase-text">
                    <p class="showcase-subtitle">#MADEONBEATSTARS</p>
                    <h2 class="showcase-title">YES, THAT BEAT WAS BOUGHT ON BEATSTARS.</h2>
                    <p class="showcase-description">Millions of artists have found their perfect beat on our marketplace.</p>
                    <a href="#beats-section" class="showcase-btn">Your next hit is waiting <i class="fas fa-arrow-right"></i></a>
                </div>
                <div class="showcase-grid-wrapper">
                    <div class="showcase-grid">
                         <?php
                            $shuffled_beats_for_showcase = $featured_beats;
                            if (!empty($shuffled_beats_for_showcase)) {
                                shuffle($shuffled_beats_for_showcase);

                                $columns = [[], [], []];
                                $col_index = 0;
                                foreach ($shuffled_beats_for_showcase as $beat) {
                                    $columns[$col_index][] = $beat;
                                    $col_index = ($col_index + 1) % 3;
                                }
                                for ($i = 0; $i < 3; $i++): ?>
                                <div class="showcase-column">
                                    <?php foreach ($columns[$i] as $beat): ?>
                                    <div class="showcase-artwork"
                                         data-title="<?php echo htmlspecialchars($beat['title']); ?>"
                                         data-producer="<?php echo htmlspecialchars($beat['producer_name']); ?>">
                                        <img src="<?php echo htmlspecialchars($beat['artwork_url']); ?>" alt="<?php echo htmlspecialchars($beat['title']); ?>" loading="lazy" onerror="this.style.display='none'">
                                        <div class="showcase-artwork-overlay">
                                            <h3 class="showcase-overlay-title"></h3>
                                            <p class="showcase-overlay-producer"></p>
                                        </div>
                                    </div>
                                    <?php endforeach; ?>
                                </div>
                            <?php endfor;
                            }?>
                    </div>
                </div>
            </div>
        </section>

        <section class="kickstart-section">
             <div class="container kickstart-grid">
                <div class="kickstart-text">
                    <h2>Kickstart Your Music Career Today</h2>
                    <ul class="features-list">
                        <li><span class="feature-icon"><i class="fas fa-check"></i></span><div><h3>The Largest Marketplace for High-Quality Beats</h3><p>Access over 10,000 beats from our growing community of a producer around the world.</p></div></li>
                        <li><span class="feature-icon"><i class="fas fa-check"></i></span><div><h3>Seamless Purchasing Experience</h3><p>We keep it effortless. Browse your favorite genres and purchase with ease - all within one platform.</p></div></li>
                        <li><span class="feature-icon"><i class="fas fa-check"></i></span><div><h3>Simple Licensing Options</h3><p>Contracts don't have to be confusing. Spend less time scratching your head and more time recording your next hit.</p></div></li>
                    </ul>
                    <a href="#" class="kickstart-btn">Get Started</a>
                </div>
                <div class="kickstart-image">
                     <img src="src\assets\kickstart-video.jpg" alt="Music producer creating a beat" class="kickstart-img">
                </div>
            </div>
        </section>

<?php
// For full page loads, include the standard HTML end
if (!isset($_GET['ajax']) || $_GET['ajax'] !== 'true') {
    include 'src/components/main_content_end.php';
}
?>