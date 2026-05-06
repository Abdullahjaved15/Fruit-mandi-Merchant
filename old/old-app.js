document.addEventListener('DOMContentLoaded', () => {
    // Initialize icons
    lucide.createIcons();

    // Check auth state (Mock)
    let auth = JSON.parse(localStorage.getItem('auth_data'));

    // Hide sidebar by default
    document.getElementById('main-sidebar').style.display = 'none';

    if (!auth) {
        showPage('landing');
    } else {
        if (auth.role === 'admin') {
            document.getElementById('main-sidebar').style.display = 'flex';
            showPage('dashboard');
        } else {
            showPage('store');
        }
    }

    // Handle Login Form
    document.body.addEventListener('submit', (e) => {
        if (e.target.id === 'login-form') {
            e.preventDefault();
            const emailInput = document.getElementById('auth-email');
            const roleSelect = document.getElementById('auth-role');
            const nameField = document.getElementById('name-field');

            const email = emailInput ? emailInput.value : e.target.querySelector('input[type="email"]').value;
            const role = roleSelect ? roleSelect.value : (email.includes('admin') ? 'admin' : 'user');
            const isRegister = nameField && nameField.style.display !== 'none';

            if (isRegister) {
                alert('Account successfully created! Logging you in...');
            }

            const authData = { token: 'm0ck_123', role: role, name: email.split('@')[0] };
            localStorage.setItem('auth_data', JSON.stringify(authData));

            if (role === 'admin') {
                document.getElementById('main-sidebar').style.display = 'flex';
                showPage('dashboard');
            } else {
                showPage('store');
            }
        }
    });

    // Navigation Logic
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    const sidebar = document.getElementById('main-sidebar');
    const navToggle = document.getElementById('nav-toggle');

    if (navToggle) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = sidebar.classList.toggle('open');
            document.body.classList.toggle('sidebar-open', isOpen);
            if (isOpen) {
                sidebar.style.display = 'flex';
            } else {
                // Return to router-controlled state if necessary
                const activePageId = document.querySelector('.nav-link.active')?.getAttribute('data-page') || 'store';
                const isStorePage = activePageId.startsWith('store');
                const auth = JSON.parse(localStorage.getItem('auth_data'));
                if (auth?.role !== 'admin' || isStorePage) {
                    sidebar.style.display = 'none';
                }
            }
        });
    }

    // Close sidebar on body click if open
    document.body.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !navToggle.contains(e.target)) {
            sidebar.classList.remove('open');
            document.body.classList.remove('sidebar-open');
            const activePageId = document.querySelector('.nav-link.active')?.getAttribute('data-page') || 'store';
            const auth = JSON.parse(localStorage.getItem('auth_data'));
            if (auth?.role !== 'admin' || activePageId.startsWith('store')) {
                sidebar.style.display = 'none';
            }
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            const auth = JSON.parse(localStorage.getItem('auth_data'));

            // Access Control: Non-admins can't leave the store/landing
            const isStorePage = pageId.startsWith('store');
            if (auth?.role !== 'admin' && !['landing', 'login'].includes(pageId) && !isStorePage) {
                alert('Access Denied: Admin privileges required.');
                return;
            }

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Close sidebar when a link is clicked
            sidebar.classList.remove('open');
            document.body.classList.remove('sidebar-open');
            showPage(pageId);
        });
    });
});

// Toggle between Login and Register modes
window.toggleAuth = function (mode) {
    const isLogin = mode === 'login';
    const nameField = document.getElementById('name-field');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const submitBtn = document.getElementById('auth-submit-btn');

    if (nameField) nameField.style.display = isLogin ? 'none' : 'block';
    if (authTitle) authTitle.innerText = isLogin ? 'Welcome Back' : 'Create Account';
    if (authSubtitle) authSubtitle.innerText = isLogin ? 'Secure Login to Javed & Sons Suite' : 'Join the leading agricultural platform';

    if (tabLogin) {
        tabLogin.classList.toggle('active', isLogin);
        tabLogin.style.background = isLogin ? 'var(--primary)' : 'var(--clay-bg)';
        tabLogin.style.color = isLogin ? 'white' : 'var(--text-main)';
    }

    if (tabRegister) {
        tabRegister.classList.toggle('active', !isLogin);
        tabRegister.style.background = !isLogin ? 'var(--primary)' : 'var(--clay-bg)';
        tabRegister.style.color = !isLogin ? 'white' : 'var(--text-main)';
    }

    if (submitBtn) submitBtn.innerHTML = isLogin ? '<i data-lucide="shield-check"></i> Sign In' : '<i data-lucide="user-plus"></i> Register';

    lucide.createIcons();
};

// Function to handle logout
window.logout = function () {
    localStorage.removeItem('auth_data');
    document.getElementById('main-sidebar').style.display = 'none';
    document.getElementById('main-sidebar').classList.remove('open');
    if (document.getElementById('nav-toggle')) {
        document.getElementById('nav-toggle').style.display = 'none';
    }
    showPage('landing');
};

// Simple router to show pages
window.showPage = function (pageId) {
    const mainContentArea = document.getElementById('content-area');
    const sidebar = document.getElementById('main-sidebar');
    const template = document.getElementById(`tpl-${pageId}`);
    const auth = JSON.parse(localStorage.getItem('auth_data'));

    // Manage sidebar visibility: Only Admins see sidebar, and only on non-public pages
    const publicPages = ['landing', 'login'];
    const navToggle = document.getElementById('nav-toggle');
    const isStorePage = pageId.startsWith('store');

    const appContainer = document.getElementById('app');

    if (publicPages.includes(pageId)) {
        sidebar.style.display = 'none';
        if (appContainer) appContainer.classList.add('sidebar-hidden');
        if (navToggle) navToggle.style.display = 'none';
        document.body.style.background = (pageId === 'landing') ? 'radial-gradient(circle at center, #ffffff 0%, #f3f4f6 100%)' : 'var(--bg-main)';
    } else if (isStorePage || (auth?.role !== 'admin')) {
        // Show hamburger for anyone in store or non-admin areas
        sidebar.style.display = 'none';
        if (appContainer) appContainer.classList.add('sidebar-hidden');
        if (navToggle) {
            navToggle.style.display = 'flex';
            // Ensure hamburger icon is contrasting
            navToggle.style.color = 'var(--primary-dark)';
            navToggle.style.background = 'white';
        }
        document.body.style.background = 'var(--bg-main)';
    } else {
        // Logged-in admin on dashboard pages
        sidebar.style.display = 'flex';
        if (appContainer) appContainer.classList.remove('sidebar-hidden');
        if (navToggle) navToggle.style.display = 'flex';
        document.body.style.background = 'var(--bg-main)';
    }

    // Clear and Render
    mainContentArea.innerHTML = '';

    if (template) {
        // Clone the content of the template
        const clone = template.content.cloneNode(true);
        mainContentArea.appendChild(clone);

        // Scroll to top on page change
        window.scrollTo(0, 0);

        // Re-initialize any icons in the new injected content
        lucide.createIcons();
    } else {
        mainContentArea.innerHTML = `
            <div class="page-content" style="display:flex; height:100%; align-items:center; justify-content:center; flex-direction:column; gap:1rem;">
                <div class="clay-card">
                    <div class="logo-icon" style="background:var(--accent); margin-bottom: 1rem;">
                        <i data-lucide="alert-triangle" style="color:white;"></i>
                    </div>
                    <h2>Under Construction</h2>
                    <p style="color:var(--text-muted);">The <b>${pageId}</b> module is currently being built.</p>
                    <button class="clay-button" style="margin-top:1rem;" onclick="showPage('store')">Back to Store</button>
                </div>
            </div>
        `;
        lucide.createIcons();
    }
}

// Global Notification Helpers
window.showNotificationPanel = function () {
    const panel = document.getElementById('notification-panel');
    if (panel) panel.classList.add('open');
};

window.hideNotificationPanel = function () {
    const panel = document.getElementById('notification-panel');
    if (panel) panel.classList.remove('open');
};

