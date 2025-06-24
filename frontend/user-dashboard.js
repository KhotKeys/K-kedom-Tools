import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const DEFAULT_AVATAR = './images/africa_numbers_cover.jpg'; // Updated default image for all users

// Store user info in localStorage
function storeUserInfo(userData) {
    localStorage.setItem('sf_user', JSON.stringify(userData));
}

// Update the UI with user info
function updateUserInfoDisplay(userData) {
    if (!userData) return;
    const userNameEl = document.getElementById('user-name');
    const roleEl = document.getElementById('user-role');
    const avatarEl = document.querySelector('.user-profile .avatar');
    if (userNameEl) userNameEl.textContent = userData.fullName || userData.firstName || 'User';
    if (roleEl) roleEl.textContent = userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : '';
    if (avatarEl) avatarEl.src = userData.profilePicUrl || DEFAULT_AVATAR;
    const welcomeMsg = document.getElementById('welcome-message');
    if (welcomeMsg) welcomeMsg.textContent = `Welcome back, ${userData.fullName || userData.firstName || 'User'}!`;
    const badge = document.getElementById('role-badge');
    if (badge) {
        badge.textContent = userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : '';
        badge.className = 'badge ' + (userData.role || '');
    }
    if (document.getElementById('user-email')) document.getElementById('user-email').textContent = userData.email || '';
    if (document.getElementById('user-location')) document.getElementById('user-location').textContent = userData.location || '';
    if (document.getElementById('user-phone')) document.getElementById('user-phone').textContent = userData.phone || '';
    // Optionally show/hide admin section
    if (userData.role === 'admin' && document.getElementById('admin-section')) {
        document.getElementById('admin-section').style.display = 'block';
    } else if (document.getElementById('admin-section')) {
        document.getElementById('admin-section').style.display = 'none';
    }
}

// Logout handler
function setupLogout() {
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
}

// Fetch user info from Firestore or fallback to Auth info
async function fetchAndDisplayUserInfo(user) {
    if (!user) return;
    try {
        // Always fetch fresh data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        let userData;
        if (userDoc.exists()) {
            userData = userDoc.data();
            userData.email = user.email;
            userData.uid = user.uid;
        } else {
            // Fallback to Auth info if Firestore doc is missing
            userData = {
                fullName: user.displayName || 'User',
                email: user.email,
                uid: user.uid,
                role: 'farmer', // default role if missing
                profilePicUrl: user.photoURL || DEFAULT_AVATAR
            };
        }
        // Always overwrite localStorage with fresh data
        storeUserInfo(userData);
        updateUserInfoDisplay(userData);
    } catch (err) {
        console.error('Error fetching user info:', err);
        // Fallback to Auth info
        const userData = {
            fullName: user.displayName || 'User',
            email: user.email,
            uid: user.uid,
            role: 'farmer',
            profilePicUrl: user.photoURL || DEFAULT_AVATAR
        };
        storeUserInfo(userData);
        updateUserInfoDisplay(userData);
    }
}

// Main entry: only redirect if user is not authenticated
// Always fetch fresh user info on each login

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            fetchAndDisplayUserInfo(user);
        } else {
            window.location.href = 'login.html';
        }
    });
    setupLogout();
}); 