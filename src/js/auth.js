document.addEventListener('DOMContentLoaded', function() {
    const authHeaderLinks = document.querySelectorAll('.auth-header-link');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // Function to handle form switching
    function switchForm(formToShow) {
        // Update active link
        authHeaderLinks.forEach(link => {
            if (link.getAttribute('href').includes(formToShow)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Show/hide forms
        if (formToShow === 'login') {
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
        } else {
            loginForm.classList.remove('active');
            signupForm.classList.add('active');
        }
    }

    // Add click listeners to links
    authHeaderLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent page reload

            const formToShow = this.getAttribute('href').split('=')[1];
            switchForm(formToShow);

            // Update URL without reloading the page
            history.pushState(null, '', `?form=${formToShow}`);
        });
    });

    // Handle back/forward browser navigation
    window.addEventListener('popstate', function() {
        const params = new URLSearchParams(window.location.search);
        const form = params.get('form') || 'login'; // Default to login
        switchForm(form);
    });
});