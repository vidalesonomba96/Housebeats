<?php
// Initialize the application
// 1. Start the session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
// 2. Connect to the database
require_once 'db_connect.php';

// Access Control: Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    $_SESSION['notification'] = "You must be logged in to access the producer dashboard.";
    $_SESSION['notification_type'] = "error";
    header("Location: auth.php?form=login");
    exit();
}

// Fetch user details to check 'is_producer' attribute
$user_id = $_SESSION['user_id'];
$stmt = $conn->prepare("SELECT username, is_producer FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

// Access Control: Check if the user is a producer
if (!$user || $user['is_producer'] != 1) {
    $_SESSION['notification'] = "Access denied. You do not have producer privileges.";
    $_SESSION['notification_type'] = "error";
    header("Location: index.php"); // Redirect non-producers
    exit();
}

// Check for AJAX request
if (isset($_GET['ajax']) && $_GET['ajax'] === 'true') {
    // For AJAX requests, only render the content that goes inside <main>
} else {
    // For full page loads, include the standard HTML start
    include 'src/components/main_content_start.php';
    echo '<title>Producer Dashboard - HouseBeats</title>';
}

$producer_name = $user['username'];

// Fetch beats uploaded by this producer
$producer_beats = [];
$beats_stmt = $conn->prepare("SELECT id, title, genre, bpm, `key`, price_mp3, price_wav, price_unlimited, artwork_url, upload_date, is_featured FROM beats WHERE producer_id = ? ORDER BY upload_date DESC");
$beats_stmt->bind_param("i", $user_id);
$beats_stmt->execute();
$beats_result = $beats_stmt->get_result();
while ($beat = $beats_result->fetch_assoc()) {
    $producer_beats[] = $beat;
}
$beats_stmt->close();
$conn->close();
?>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>

        <div class="dashboard-container container">
            <aside class="dashboard-sidebar">
                <div class="sidebar-header">
                    <h3><?php echo htmlspecialchars($producer_name); ?>'s Dashboard</h3>
                </div>
                <nav class="sidebar-nav">
                    <ul>
                        <li><a href="#overview" class="active"><i class="fas fa-home"></i> Overview</a></li>
                        <li><a href="#my-beats"><i class="fas fa-music"></i> My Beats</a></li>
                        <li><a href="#upload-beat-section"><i class="fas fa-upload"></i> Upload New Beat</a></li>
                        <li><a href="#sales"><i class="fas fa-chart-line"></i> Sales & Analytics</a></li>
                        <li><a href="#settings"><i class="fas fa-cog"></i> Settings</a></li>
                    </ul>
                </nav>
                <div class="sidebar-footer">
                    <a href="logout.php" class="logout-btn-dashboard"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </div>
            </aside>

            <section class="dashboard-content">
                <div id="overview" class="dashboard-section active">
                    <h2>Welcome, <?php echo htmlspecialchars($producer_name); ?>!</h2>
                    <p>Here's a quick overview of your activity.</p>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <i class="fas fa-headset"></i>
                            <h4>Total Beats</h4>
                            <p><?php echo count($producer_beats); ?></p>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-dollar-sign"></i>
                            <h4>Total Sales</h4>
                            <p>$0.00</p> </div>
                        <div class="stat-card">
                            <i class="fas fa-chart-bar"></i>
                            <h4>Total Streams</h4>
                            <p>0</p> </div>
                        <div class="stat-card">
                            <i class="fas fa-eye"></i>
                            <h4>Page Views</h4>
                            <p>0</p> </div>
                    </div>
                </div>

                <div id="my-beats" class="dashboard-section">
                    <h2>My Beats</h2>
                    <p>Manage your uploaded beats.</p>
                    <?php if (!empty($producer_beats)): ?>
                        <div class="beats-table-container">
                            <table class="beats-table">
                                <thead>
                                    <tr>
                                        <th>Artwork</th>
                                        <th>Title</th>
                                        <th>Genre</th>
                                        <th>BPM</th>
                                        <th>Key</th>
                                        <th>Uploaded On</th>
                                        <th>Featured</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($producer_beats as $beat): ?>
                                    <tr>
                                        <td><img src="<?php echo htmlspecialchars($beat['artwork_url']); ?>" alt="<?php echo htmlspecialchars($beat['title']); ?>" class="beat-artwork-thumb"></td>
                                        <td><?php echo htmlspecialchars($beat['title']); ?></td>
                                        <td><?php echo htmlspecialchars($beat['genre']); ?></td>
                                        <td><?php echo htmlspecialchars($beat['bpm']); ?></td>
                                        <td><?php echo htmlspecialchars($beat['key']); ?></td>
                                        <td><?php echo date('Y-m-d', strtotime($beat['upload_date'])); ?></td>
                                        <td><?php echo $beat['is_featured'] ? 'Yes' : 'No'; ?></td>
                                        <td>
                                            <button class="action-btn edit-beat-btn" data-beat-id="<?php echo $beat['id']; ?>"><i class="fas fa-edit"></i> Edit</button>
                                            <button class="action-btn delete-beat-btn" data-beat-id="<?php echo $beat['id']; ?>"><i class="fas fa-trash-alt"></i> Delete</button>
                                        </td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    <?php else: ?>
                        <p>You haven't uploaded any beats yet. <a href="#upload-beat-section">Upload your first beat!</a></p>
                    <?php endif; ?>
                </div>

                <div id="upload-beat-section" class="dashboard-section">
                    <h2>Upload New Beat</h2>
                    <p>Click the button below to proceed to the beat upload form.</p>
                    <a href="upload.php" class="dashboard-primary-btn">Go to Upload Form <i class="fas fa-arrow-right"></i></a>
                </div>

                <div id="sales" class="dashboard-section">
                    <h2>Sales & Analytics</h2>
                    <p>Detailed insights into your beat performance.</p>
                    <p>Coming Soon!</p>
                </div>

                <div id="settings" class="dashboard-section">
                    <h2>Settings</h2>
                    <p>Manage your profile and account settings.</p>
                    <p>Coming Soon!</p>
                </div>
            </section>
        </div>

<?php
// For full page loads, include the standard HTML end
if (!isset($_GET['ajax']) || $_GET['ajax'] !== 'true') {
    include 'src/components/main_content_end.php';
}
?>