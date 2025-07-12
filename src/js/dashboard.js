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

    const switchView = (hash) => {
        const targetId = (hash && hash !== '#') ? hash.substring(1) : 'overview';
        let sectionFound = false;

        sections.forEach(section => {
            if (section.id === targetId) {
                section.classList.add('active');
                sectionFound = true;
            } else {
                section.classList.remove('active');
            }
        });

        if (!sectionFound) {
            const overviewSection = document.getElementById('overview');
            if (overviewSection) {
                overviewSection.classList.add('active');
            }
        }

        sidebarLinks.forEach(link => {
            const linkTargetId = link.getAttribute('href').substring(1);
            if (sectionFound) {
                link.classList.toggle('active', linkTargetId === targetId);
            } else {
                link.classList.toggle('active', linkTargetId === 'overview');
            }
        });
    };

    sidebarNav.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;

        e.preventDefault();
        const newHash = link.getAttribute('href');

        if (window.location.hash !== newHash) {
            history.pushState(null, '', window.location.pathname + window.location.search + newHash);
        }

        switchView(newHash);
    });

    window.addEventListener('popstate', () => {
        switchView(window.location.hash);
    });

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
                const beatRow = document.querySelector(`tr:has(button[data-beat-id="${beatId}"])`);
                if (beatRow) {
                    beatRow.remove();
                }

                if (typeof createToast === 'function') {
                    createToast(data.message, 'success');
                } else {
                    alert(data.message);
                }

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

    document.addEventListener('click', function(e) {
        const editBtn = e.target.closest('.edit-beat-btn');
        if (editBtn) {
            e.preventDefault();
            const beatId = editBtn.dataset.beatId;
            if (beatId) {
                if (typeof createToast === 'function') {
                    createToast('Edit functionality coming soon!', 'info');
                } else {
                    alert('Edit functionality coming soon!');
                }
            }
        }
    });

    switchView(window.location.hash);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    initializeDashboard();
}

window.initializeDashboard = initializeDashboard;