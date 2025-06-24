import { auth, db, realTimeDb } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {
    doc,
    setDoc,
    getDoc,
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const currentPath = window.location.pathname;

// Set Firebase Auth persistence globally
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("[Auth] Persistence set to browserLocalPersistence");
  })
  .catch((error) => {
    console.error("[Auth] Error setting persistence:", error);
  });

// Global logout functionality
function setupLogout() {
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                localStorage.clear(); // Clear user info and all local storage
                await signOut(auth);
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Error signing out:', error);
                alert('Failed to logout. Please try again.');
            }
        });
    }
}

// Utility: Store user info in localStorage
function storeUserInfo(userData) {
    localStorage.setItem('sf_user', JSON.stringify(userData));
}

// Utility: Get user info from localStorage
function getUserInfo() {
    const data = localStorage.getItem('sf_user');
    return data ? JSON.parse(data) : null;
}

// Utility: Update user info display on any dashboard page
function updateUserInfoDisplay() {
    const userData = getUserInfo();
    if (!userData) return;
    // Farmer/General
    const userNameEl = document.getElementById('user-name');
    const roleEl = document.getElementById('user-role');
    if (userNameEl) userNameEl.textContent = userData.fullName || userData.firstName || 'User';
    if (roleEl) roleEl.textContent = userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : '';
    // Admin
    const adminNameEl = document.getElementById('admin-name');
    const adminRoleEl = document.getElementById('admin-role');
    if (adminNameEl) adminNameEl.textContent = userData.fullName || userData.firstName || 'Admin';
    if (adminRoleEl) adminRoleEl.textContent = userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : '';
}

// --- Page Initializers ---

function initSignupPage() {
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
                console.log('[Signup] Firebase user:', user);
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
                console.log('[Signup] User document created in Firestore:', email, role);
                alert('Sign up successful! Please proceed to login.');
                window.location.href = 'login.html';
            } catch (error) {
                console.error('[Signup] Error:', error);
                alert(`Error: ${error.message}`);
            }
        });
    }
}

function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            console.log('[Login] Attempting login for:', email);
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                console.log('[Login] Firebase user:', user);
                const userDoc = await getDoc(doc(db, "users", user.uid));
                console.log('[Login] Firestore userDoc exists:', userDoc.exists());
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    console.log('[Login] Firestore userData:', userData);
                    storeUserInfo(userData); // Store in localStorage
                    const { role } = userData;
                    window.location.href = role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
                } else {
                    alert('User role not found!');
                    await signOut(auth);
                }
            } catch (error) {
                console.error('[Login] Error:', error);
                alert(`Error: ${error.message}`);
            }
        });
    }
}

function initUserDashboard() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        console.log('[UserDashboard] Auth state changed:', user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        console.log('[UserDashboard] Firestore userDoc exists:', userDoc.exists());
        const userData = userDoc.exists() ? userDoc.data() : null;
        if (userDoc.exists() && userData.role && userData.role.toLowerCase() === 'farmer') {
            console.log('[UserDashboard] Firestore userData:', userData);
            storeUserInfo(userData); // Store in localStorage
            displayUserData(userData);
            listenToSensorData();
            setupLogout();
        } else {
            console.warn('[UserDashboard] User not found or not a farmer. Redirecting to login.');
            window.location.href = 'login.html';
        }
    });

    const displayUserData = (userData) => {
        updateUserInfoDisplay();
        const welcomeEl = document.getElementById('welcome-message');
        if (welcomeEl) welcomeEl.textContent = `Welcome Back, ${userData.firstName}!`;
    };

    const listenToSensorData = () => {
        onValue(ref(realTimeDb, 'sensorData/latest'), (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const ph = document.getElementById('ph-value');
                const moisture = document.getElementById('moisture-value');
                const temp = document.getElementById('temperature-value');
                const humidity = document.getElementById('humidity-value');

                if (ph) ph.textContent = data.ph.toFixed(1);
                if (moisture) moisture.textContent = `${data.moisture}%`;
                if (temp) temp.textContent = `${data.temperature}°C`;
                if (humidity) humidity.textContent = `${data.humidity}%`;
            }
        });
    };
}

function initAdminDashboard() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        console.log('[AdminDashboard] Auth state changed:', user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        console.log('[AdminDashboard] Firestore userDoc exists:', userDoc.exists());
        const userData = userDoc.exists() ? userDoc.data() : null;
        if (userDoc.exists() && userData.role && userData.role.toLowerCase() === 'admin') {
            console.log('[AdminDashboard] Firestore userData:', userData);
            storeUserInfo(userData); // Store in localStorage
            displayAdminData(userData);
            fetchAllUsers();
            setupLogout();
        } else {
            console.warn('[AdminDashboard] User not found or not an admin. Redirecting to login.');
            window.location.href = 'login.html';
        }
    });

    const displayAdminData = (adminData) => {
        updateUserInfoDisplay();
    };

    const fetchAllUsers = () => {
        const usersTableBody = document.getElementById('users-table-body');
        const totalUsersCountEl = document.getElementById('total-users-count');

        if (!usersTableBody) return;

        onSnapshot(collection(db, 'users'), (snapshot) => {
            // Update total users count
            if (totalUsersCountEl) {
                totalUsersCountEl.textContent = snapshot.size;
            }
            
            usersTableBody.innerHTML = snapshot.docs.map(doc => {
                const user = doc.data();
                const regDate = user.createdAt.toDate().toLocaleDateString();
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
    };
}


// --- Main Execution ---

document.addEventListener('DOMContentLoaded', () => {
    if (currentPath.includes('signup.html')) {
        initSignupPage();
    } else if (currentPath.includes('login.html')) {
        initLoginPage();
    } else if (currentPath.includes('user-dashboard.html')) {
        initUserDashboard();
    } else if (currentPath.includes('admin-dashboard.html')) {
        initAdminDashboard();
    } else if (currentPath.includes('index.html') || currentPath === '/') {
        // Do nothing, allow landing page to load
    } else {
        // For all other dashboard/section pages, just update user info display and setup logout
        updateUserInfoDisplay();
        setupLogout();
    }
});

// Chart.js initialization logic for dashboards
document.addEventListener('DOMContentLoaded', () => {
    if (currentPath.includes('user-dashboard.html')) {
        // Initialize user charts here if needed
    }

    if (currentPath.includes('admin-dashboard.html')) {
        const userActivityCtx = document.getElementById('userActivityChart')?.getContext('2d');
        if(userActivityCtx) {
            new Chart(userActivityCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'User Signups',
                        data: [12, 19, 3, 5, 2, 3],
                        borderColor: '#4CAF50',
                        tension: 0.1
                    }]
                }
            });
        }

        const userRolesCtx = document.getElementById('userRolesChart')?.getContext('2d');
        if(userRolesCtx) {
            new Chart(userRolesCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Farmers', 'Admins'],
                    datasets: [{
                        label: 'User Roles',
                        data: [300, 50],
                        backgroundColor: ['#4CAF50', '#FFC107']
                    }]
                }
            });
        }
    }
});

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});

// Contact form handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const message = this.querySelector('textarea').value;
        
        // Simple validation
        if (!name || !email || !message) {
            alert('Please fill in all fields');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Simulate form submission
        alert('Thank you for your message! We will get back to you soon.');
        this.reset();
    });
}

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.feature-card, .impact-card, .about-text, .about-image');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Counter animation for impact numbers
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target + '%';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start) + '%';
        }
    }, 16);
}

// Trigger counter animation when impact section is visible
const impactObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.impact-number');
            counters.forEach(counter => {
                const target = parseInt(counter.textContent);
                animateCounter(counter, target);
            });
            impactObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const impactSection = document.querySelector('.impact');
if (impactSection) {
    impactObserver.observe(impactSection);
}

// Preloader
window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
});

// Back to top button
const backToTopBtn = document.createElement('button');
backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTopBtn.className = 'back-to-top';
backToTopBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background: var(--primary-green);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
    box-shadow: var(--shadow);
`;

document.body.appendChild(backToTopBtn);

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopBtn.style.opacity = '1';
        backToTopBtn.style.visibility = 'visible';
    } else {
        backToTopBtn.style.opacity = '0';
        backToTopBtn.style.visibility = 'hidden';
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Add hover effect to back to top button
backToTopBtn.addEventListener('mouseenter', () => {
    backToTopBtn.style.transform = 'translateY(-3px)';
    backToTopBtn.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.2)';
});

backToTopBtn.addEventListener('mouseleave', () => {
    backToTopBtn.style.transform = 'translateY(0)';
    backToTopBtn.style.boxShadow = 'var(--shadow)';
}); 