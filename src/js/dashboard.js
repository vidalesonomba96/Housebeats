// Housebeats/src/js/dashboard.js

function initializeDashboard() {
    console.log("Initializing dashboard scripts...");

    const sidebarNav = document.querySelector('.dashboard-sidebar .sidebar-nav');
    const sections = document.querySelectorAll('.dashboard-content .dashboard-section');
    const sidebarLinks = document.querySelectorAll('.dashboard-sidebar .sidebar-nav a');

    if (!sidebarNav || !sections.length || !sidebarLinks.length) {
        console.error("Dashboard elements not found, aborting initialization.");
        return;
    }

    // Function to switch to the correct view based on a hash
    const switchView = (hash) => {
        const targetId = (hash && hash !== '#') ? hash.substring(1) : 'overview';
        let sectionFound = false;

        // Activate the correct section
        sections.forEach(section => {
            if (section.id === targetId) {
                section.classList.add('active');
                sectionFound = true;
            } else {
                section.classList.remove('active');
            }
        });

        // If the targetId from the hash does not exist, default to the overview section
        if (!sectionFound) {
            const overviewSection = document.getElementById('overview');
            if (overviewSection) {
                overviewSection.classList.add('active');
            }
        }

        // Update the active state of the sidebar links
        sidebarLinks.forEach(link => {
            const linkTargetId = link.getAttribute('href').substring(1);
            if (sectionFound) {
                link.classList.toggle('active', linkTargetId === targetId);
            } else {
                link.classList.toggle('active', linkTargetId === 'overview');
            }
        });
    };

    // Use event delegation for sidebar link clicks
    sidebarNav.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;

        e.preventDefault();
        const newHash = link.getAttribute('href');

        // Update the URL hash in the address bar if it's different
        if (window.location.hash !== newHash) {
            history.pushState(null, '', window.location.pathname + window.location.search + newHash);
        }

        // Switch the view to the new hash
        switchView(newHash);
    });

    // Handle browser back/forward navigation
    window.addEventListener('popstate', () => {
        switchView(window.location.hash);
    });

    // Handle delete beat functionality
    const handleDeleteBeat = async (beatId) => {
        if (!confirm('Are you sure you want to delete this beat? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch('handle_dashboard.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'delete_beat',
                    beat_id: beatId
                })
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                // Remove the beat row from the table
                const beatRow = document.querySelector(`tr:has(button[data-beat-id="${beatId}"])`);
                if (beatRow) {
                    beatRow.remove();
                }
                
                // Show success message
                if (typeof createToast === 'function') {
                    createToast(data.message, 'success');
                } else {
                    alert(data.message);
                }
                
                // Update the total beats count
                const totalBeatsElement = document.querySelector('.stat-card:first-child p');
                if (totalBeatsElement) {
                    const currentCount = parseInt(totalBeatsElement.textContent);
                    totalBeatsElement.textContent = Math.max(0, currentCount - 1);
                }
            } else {
                if (typeof createToast === 'function') {
                    createToast(data.message, 'error');
                } else {
                    alert(data.message);
                }
            }
        } catch (error) {
            console.error('Error deleting beat:', error);
            if (typeof createToast === 'function') {
                createToast('An error occurred while deleting the beat.', 'error');
            } else {
                alert('An error occurred while deleting the beat.');
            }
        }
    };

    // Event delegation for delete buttons
    document.addEventListener('click', function(e) {
        const deleteBtn = e.target.closest('.delete-beat-btn');
        if (deleteBtn) {
            e.preventDefault();
            const beatId = deleteBtn.dataset.beatId;
            if (beatId) {
                handleDeleteBeat(beatId);
            }
        }
    });

    // Event delegation for edit buttons (placeholder for future functionality)
    document.addEventListener('click', function(e) {
        const editBtn = e.target.closest('.edit-beat-btn');
        if (editBtn) {
            e.preventDefault();
            const beatId = editBtn.dataset.beatId;
            if (beatId) {
                // Placeholder for edit functionality
                if (typeof createToast === 'function') {
                    createToast('Edit functionality coming soon!', 'info');
                } else {
                    alert('Edit functionality coming soon!');
                }
            }
        }
    });

    // Set the initial view based on the URL hash when the page loads
    switchView(window.location.hash);
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    initializeDashboard();
}

// Make function globally available for main.js
window.initializeDashboard = initializeDashboard;