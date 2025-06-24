// Firebase Configuration for Smart Farm IoT Data
// This file demonstrates how to integrate Firebase for real-time IoT data

// Import the functions you need from the SDKs you need.
// We are using the CDN version of the Firebase SDK for compatibility with web browsers.
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBOJSo0b_AN4HB7wHVN8ERAAgGkilTnZWk",
    authDomain: "cmua-7957a.firebaseapp.com",
    databaseURL: "https://cmua-7957a-default-rtdb.firebaseio.com",
    projectId: "cmua-7957a",
    storageBucket: "cmua-7957a.appspot.com",
    messagingSenderId: "273566170303",
    appId: "1:273566170303:web:3d02105c5dd0e15e251a0a",
    measurementId: "G-0T0Q0TP91N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const realTimeDb = getDatabase(app);

// Export the necessary Firebase services for use in other scripts
export { app, auth, db, realTimeDb };

// IoT Data Collection Structure
const iotDataStructure = {
    sensors: {
        soil_ph: {
            value: 6.8,
            unit: "pH",
            timestamp: "2024-01-15T10:30:00Z",
            location: "field_001",
            status: "active"
        },
        soil_moisture: {
            value: 65,
            unit: "%",
            timestamp: "2024-01-15T10:30:00Z",
            location: "field_001",
            status: "active"
        },
        temperature: {
            value: 24,
            unit: "°C",
            timestamp: "2024-01-15T10:30:00Z",
            location: "field_001",
            status: "active"
        },
        humidity: {
            value: 75,
            unit: "%",
            timestamp: "2024-01-15T10:30:00Z",
            location: "field_001",
            status: "active"
        }
    },
    users: {
        user_001: {
            name: "John Doe",
            location: "Kiryandongo Camp",
            field_id: "field_001",
            join_date: "2024-01-15",
            status: "active"
        }
    },
    predictions: {
        field_001: {
            crop_type: "maize",
            predicted_yield: 2.8,
            unit: "tons/ha",
            confidence: 0.85,
            timestamp: "2024-01-15T10:30:00Z"
        }
    }
};

// Functions to fetch IoT data from Firebase
class SmartFarmDataService {
    constructor() {
        // Initialize Firebase connection
        // this.db = firebase.firestore();
    }

    // Fetch real-time sensor data
    async getSensorData(fieldId) {
        try {
            // Real Firebase implementation would be:
            // const doc = await this.db.collection('sensors').doc(fieldId).get();
            // return doc.data();
            
            // For demo purposes, return simulated data
            return {
                soil_ph: {
                    value: 6.0 + Math.random() * 1.5,
                    unit: "pH",
                    timestamp: new Date().toISOString(),
                    status: "active"
                },
                soil_moisture: {
                    value: 50 + Math.random() * 30,
                    unit: "%",
                    timestamp: new Date().toISOString(),
                    status: "active"
                },
                temperature: {
                    value: 20 + Math.random() * 15,
                    unit: "°C",
                    timestamp: new Date().toISOString(),
                    status: "active"
                },
                humidity: {
                    value: 60 + Math.random() * 30,
                    unit: "%",
                    timestamp: new Date().toISOString(),
                    status: "active"
                }
            };
        } catch (error) {
            console.error('Error fetching sensor data:', error);
            return null;
        }
    }

    // Fetch user data
    async getUserData(userId) {
        try {
            // Real Firebase implementation would be:
            // const doc = await this.db.collection('users').doc(userId).get();
            // return doc.data();
            
            // For demo purposes, return simulated data
            return {
                name: "John Doe",
                location: "Kiryandongo Camp",
                field_id: "field_001",
                join_date: "2024-01-15",
                status: "active"
            };
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    }

    // Fetch yield predictions
    async getYieldPrediction(fieldId) {
        try {
            // Real Firebase implementation would be:
            // const doc = await this.db.collection('predictions').doc(fieldId).get();
            // return doc.data();
            
            // For demo purposes, return simulated data
            return {
                crop_type: "maize",
                predicted_yield: 2.5 + Math.random() * 1.0,
                unit: "tons/ha",
                confidence: 0.8 + Math.random() * 0.15,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching yield prediction:', error);
            return null;
        }
    }

    // Update sensor data (for IoT devices)
    async updateSensorData(fieldId, sensorType, value) {
        try {
            // Real Firebase implementation would be:
            // await this.db.collection('sensors').doc(fieldId).update({
            //     [sensorType]: {
            //         value: value,
            //         timestamp: new Date().toISOString(),
            //         status: "active"
            //     }
            // });
            
            console.log(`Updated ${sensorType} for field ${fieldId}: ${value}`);
            return true;
        } catch (error) {
            console.error('Error updating sensor data:', error);
            return false;
        }
    }

    // Listen to real-time updates
    listenToSensorUpdates(fieldId, callback) {
        // Real Firebase implementation would be:
        // return this.db.collection('sensors').doc(fieldId)
        //     .onSnapshot((doc) => {
        //         callback(doc.data());
        //     });
        
        // For demo purposes, simulate real-time updates
        setInterval(() => {
            this.getSensorData(fieldId).then(callback);
        }, 30000); // Update every 30 seconds
    }

    // Get all users for admin dashboard
    async getAllUsers() {
        try {
            // Real Firebase implementation would be:
            // const snapshot = await this.db.collection('users').get();
            // return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // For demo purposes, return simulated data
            return [
                {
                    id: "user_001",
                    name: "John Doe",
                    location: "Kiryandongo Camp",
                    join_date: "2024-01-15",
                    status: "active"
                },
                {
                    id: "user_002",
                    name: "Jane Smith",
                    location: "Kiryandongo Camp",
                    join_date: "2024-01-10",
                    status: "active"
                },
                {
                    id: "user_003",
                    name: "Mike Johnson",
                    location: "Kiryandongo Camp",
                    join_date: "2024-01-08",
                    status: "inactive"
                }
            ];
        } catch (error) {
            console.error('Error fetching all users:', error);
            return [];
        }
    }

    // Get system statistics for admin dashboard
    async getSystemStats() {
        try {
            // Real Firebase implementation would be:
            // const usersSnapshot = await this.db.collection('users').get();
            // const sensorsSnapshot = await this.db.collection('sensors').get();
            // return {
            //     totalUsers: usersSnapshot.size,
            //     activeSensors: sensorsSnapshot.size,
            //     // ... other stats
            // };
            
            // For demo purposes, return simulated data
            return {
                totalUsers: 1247,
                activeSensors: 156,
                avgYield: 2.8,
                waterSaved: 45
            };
        } catch (error) {
            console.error('Error fetching system stats:', error);
            return null;
        }
    }
}

// Export the service for use in other files
// window.SmartFarmDataService = SmartFarmDataService;

// Example usage:
// const dataService = new SmartFarmDataService();
// dataService.getSensorData('field_001').then(data => {
//     console.log('Sensor data:', data);
// });

// Real-time listener example:
// dataService.listenToSensorUpdates('field_001', (data) => {
//     console.log('Real-time update:', data);
//     // Update UI with new data
//     updateDashboard(data);
// });

// Function to update dashboard with real data
function updateDashboard(sensorData) {
    if (sensorData) {
        // Update pH value
        const phElement = document.getElementById('phValue');
        if (phElement && sensorData.soil_ph) {
            phElement.textContent = sensorData.soil_ph.value.toFixed(1);
        }

        // Update moisture value
        const moistureElement = document.getElementById('moistureValue');
        if (moistureElement && sensorData.soil_moisture) {
            moistureElement.textContent = Math.floor(sensorData.soil_moisture.value) + '%';
        }

        // Update temperature value
        const tempElement = document.getElementById('tempValue');
        if (tempElement && sensorData.temperature) {
            tempElement.textContent = Math.floor(sensorData.temperature.value) + '°C';
        }
    }
}

// Initialize data service when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Create global instance
    window.smartFarmData = new SmartFarmDataService();
    
    // Start real-time updates if on dashboard page
    if (window.location.pathname.includes('user-dashboard.html')) {
        smartFarmData.listenToSensorUpdates('field_001', updateDashboard);
    }
}); 