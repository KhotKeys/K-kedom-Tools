import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, getDoc, collection, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

const DEFAULT_AVATAR = './images/africa_numbers_cover.jpg'; // Updated default image for all admins

// Store user info in localStorage
function storeUserInfo(userData) {
    localStorage.setItem('sf_user', JSON.stringify(userData));
}

// Update the UI with admin info
function updateUserInfoDisplay(userData) {
    if (!userData) return;
    const adminNameEl = document.getElementById('admin-name');
    const adminRoleEl = document.getElementById('admin-role');
    const avatarEl = document.querySelector('.user-profile .avatar');
    if (adminNameEl) adminNameEl.textContent = userData.fullName || userData.firstName || 'Admin';
    if (adminRoleEl) adminRoleEl.textContent = userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : '';
    if (avatarEl) avatarEl.src = userData.profilePicUrl || DEFAULT_AVATAR;
}

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

function fetchAllUsers() {
    const usersTableBody = document.getElementById('users-table-body');
    const totalUsersCountEl = document.getElementById('total-users-count');
    if (!usersTableBody) return;
    onSnapshot(collection(db, 'users'), (snapshot) => {
        if (totalUsersCountEl) {
            totalUsersCountEl.textContent = snapshot.size;
        }
        usersTableBody.innerHTML = snapshot.docs.map(doc => {
            const user = doc.data();
            const regDate = user.createdAt && user.createdAt.toDate ? user.createdAt.toDate().toLocaleDateString() : '';
            return `
                <tr>
                    <td>${user.fullName}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>${regDate}</td>
                    <td><span class="status-active">Active</span></td>
                </tr>
            `;
        }).join('');
    });
}

// Fetch admin info from Firestore or fallback to Auth info
async function fetchAndDisplayAdminInfo(user) {
    if (!user) return;
    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        let userData;
        if (userDoc.exists()) {
            userData = userDoc.data();
            userData.email = user.email;
            userData.uid = user.uid;
        } else {
            userData = {
                fullName: user.displayName || 'Admin',
                email: user.email,
                uid: user.uid,
                role: 'admin',
                profilePicUrl: user.photoURL || DEFAULT_AVATAR
            };
        }
        storeUserInfo(userData);
        updateUserInfoDisplay(userData);
    } catch (err) {
        console.error('Error fetching admin info:', err);
        const userData = {
            fullName: user.displayName || 'Admin',
            email: user.email,
            uid: user.uid,
            role: 'admin',
            profilePicUrl: user.photoURL || DEFAULT_AVATAR
        };
        storeUserInfo(userData);
        updateUserInfoDisplay(userData);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            fetchAndDisplayAdminInfo(user);
        } else {
            window.location.href = 'login.html';
        }
    });
    setupLogout();
});

const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const location = document.getElementById('location').value;
        const role = document.getElementById('role').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) return alert("Passwords do not match.");
        if (!role) return alert('Please select a role.');
        if (password.length < 6) return alert("Password must be at least 6 characters long.");

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('About to write user to Firestore:', { firstName, lastName, email, phone, location, role });
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                firstName,
                lastName,
                fullName: `${firstName} ${lastName}`,
                email,
                phone,
                location,
                role,
                createdAt: new Date()
            });
            console.log('User written to Firestore!');
            alert('Sign up successful! Please proceed to login.');
            window.location.href = 'login.html';
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });
} 