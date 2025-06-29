<?php
session_start();
// Check if this is an AJAX request
if (isset($_GET['ajax']) && $_GET['ajax'] === 'true') {
    // For AJAX requests, only render the content that goes inside <main>
    // No header, footer, or full HTML boilerplate needed
} else {
    // For full page loads, include the standard HTML start
    include 'src/components/main_content_start.php';
    echo '<title>About Us - HouseBeats</title>'; // Set specific title
}
?>

        <section class="testimonials-section">
            <div class="container">
                <div class="section-header">
                    <p class="section-subtitle">WHAT MAKES HOUSEBEATS SO GREAT?</p>
                    <h2 class="section-title">Don't just hear from us. <br> Hear from our community.</h2>
                </div>

                <div class="testimonials-slider">
                    <div class="slider-wrapper">
                        <div class="slider-container">
                            <div class="testimonial-card">
                                <div class="testimonial-image">
                                    <img src="src/assets/producer1.jpg" alt="Producer V. Esono">
                                </div>
                                <div class="testimonial-content">
                                    <blockquote>"My favorite part about HouseBeats is definitely the community aspect of it. Artists and producers can collab. Even producers can collab with each other."</blockquote>
                                    <div class="author-info">
                                        <button class="play-button"><i class="fas fa-play"></i></button>
                                        <div class="author-details">
                                            <p class="author-name">Vidal Esono</p>
                                            <p class="author-title">Producer at HouseBeats</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="testimonial-card">
                                <div class="testimonial-image">
                                    <img src="src/assets/producer2.jpg" alt="Producer Homeboy">
                                </div>
                                 <div class="testimonial-content">
                                    <blockquote>"The platform is super intuitive, and I was able to upload and sell my beats on day one. The support from the community is unmatched."</blockquote>
                                    <div class="author-info">
                                        <button class="play-button"><i class="fas fa-play"></i></button>
                                        <div class="author-details">
                                            <p class="author-name">Big Danny Homie.</p>
                                            <p class="author-title">Artist & Producer at HouseBeats</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                             <div class="testimonial-card">
                                <div class="testimonial-image">
                                    <img src="src/assets/producer3.jpg" alt="Producer El Chapo">
                                </div>
                                <div class="testimonial-content">
                                    <blockquote>"I've found some of the most unique sounds on HouseBeats. It's my go-to place for inspiration and finding hidden gems for my tracks."</blockquote>
                                   <div class="author-info">
                                        <button class="play-button"><i class="fas fa-play"></i></button>
                                        <div class="author-details">
                                            <p class="author-name">Junior Mikue</p>
                                            <p class="author-title">Artist & Producer</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="slider-nav">
                        <button class="nav-dot active" data-slide="0"></button>
                        <button class="nav-dot" data-slide="1"></button>
                        <button class="nav-dot" data-slide="2"></button>
                    </div>
                </div>
            </div>
        </section>

<?php
// For full page loads, include the standard HTML end
if (!isset($_GET['ajax']) || $_GET['ajax'] !== 'true') {
    include 'src/components/main_content_end.php';
}
?>