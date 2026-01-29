// SKIPIT - Digital Queue Management System Frontend
// India Edition

// Global variables
let currentUser = null;
let currentLocation = null;
let selectedService = null;
let currentQueueId = null;
let travelTime = 0; // in minutes
let notificationShown = false;
let pendingRequest = null;
let isOrganizationView = false;
let currentServiceType = null;
let userPurpose = null;
let generatedQRData = null; // Store generated QR code data

// Indian Data
const INDIAN_CITIES = [
    { city: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025 },
    { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
    { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
    { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
    { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
    { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
    { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
    { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
    { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
    { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
    { city: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
    { city: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673 },
    { city: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882 },
    { city: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lng: 76.8277 },
    { city: 'Surat', state: 'Gujarat', lat: 21.1705, lng: 72.8311 }
];

const INDIAN_BANKS = [
    { name: 'State Bank of India (SBI)', services: ['Cash Withdrawal', 'Deposits', 'Account Services', 'Loans'] },
    { name: 'HDFC Bank', services: ['Cash Withdrawal', 'Deposits', 'Card Services', 'Investment'] },
    { name: 'ICICI Bank', services: ['Cash Withdrawal', 'Account Services', 'Loans', 'NRI Services'] },
    { name: 'Axis Bank', services: ['Cash Withdrawal', 'Deposits', 'Card Services', 'Travel Services'] },
    { name: 'Kotak Mahindra Bank', services: ['Account Services', 'Deposits', 'Loans', 'Insurance'] },
    { name: 'Bank of Baroda', services: ['Cash Withdrawal', 'Deposits', 'Government Services', 'Loans'] },
    { name: 'PNB (Punjab National Bank)', services: ['Cash Withdrawal', 'Account Services', 'Passport Services'] },
    { name: 'Union Bank of India', services: ['Cash Withdrawal', 'Deposits', 'Loans', 'Investment'] }
];

const INDIAN_HOSPITALS = [
    { name: 'Charitable Hospital Mohali', services: ['General Consultation', 'Lab Tests', 'Emergency', 'X-Ray'], city: 'Mohali' },
    { name: 'Apollo Hospitals', services: ['General Consultation', 'Lab Tests', 'Emergency', 'Surgery'] },
    { name: 'Max Healthcare', services: ['General Consultation', 'Pediatrics', 'Cardiology', 'Lab Tests'] },
    { name: 'Fortis Healthcare', services: ['General Consultation', 'Orthopedics', 'Cardiology', 'Lab Tests'] },
    { name: 'Government District Hospital', services: ['General Consultation', 'Emergency', 'Lab Tests', 'Government Scheme'] },
    { name: 'Manipal Hospitals', services: ['Consultation', 'Surgery', 'Lab Tests', 'Oncology'] },
    { name: 'City Medical Center', services: ['General Consultation', 'Lab Tests', 'Dental', 'Vaccination'] }
];

const GOVERNMENT_SERVICES = [
    { name: 'Passport Office', services: ['Passport Application', 'Passport Renewal', 'Visa Assistance'] },
    { city: 'Aadhaar Enrollment Center', services: ['Aadhaar Registration', 'Aadhaar Update', 'Aadhaar Reprint'] },
    { name: 'RTO (Driving License)', services: ['License Application', 'License Renewal', 'Vehicle Registration'] },
    { name: 'PAN Center', services: ['PAN Application', 'PAN Update', 'PAN Reprint'] },
    { name: 'Voter ID Center', services: ['Voter Registration', 'Voter ID Update', 'Election Services'] },
    { name: 'Income Tax Office', services: ['Income Tax Filing', 'Assessment', 'Refund Services'] }
];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    setupEventListeners();
    loadDemoData();
    checkAuthStatus();
    startAppointmentMonitor();
    loadTheme(); // Load saved theme
    
    // Ensure login button is properly set up
    setTimeout(() => {
        updateLoginButton();
    }, 100);
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavClick);
    });

    // Forms
    document.getElementById('customerLoginForm').addEventListener('submit', handleCustomerLogin);
    document.getElementById('providerLoginForm').addEventListener('submit', handleProviderLogin);
    document.getElementById('registerOrgForm').addEventListener('submit', handleRegisterOrg);
    document.getElementById('endQueueForm').addEventListener('submit', handleEndQueue);
    document.getElementById('purposeForm').addEventListener('submit', handlePurposeSubmit);

    // Location search
    document.getElementById('locationSearch').addEventListener('input', handleLocationSearch);

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Navigation handling
function handleNavClick(e) {
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    e.target.classList.add('active');
}

// Modal functions
function showAuthModal() {
    document.getElementById('authModal').style.display = 'block';
}

function showJoinQueueModal() {
    document.getElementById('joinQueueModal').style.display = 'block';
    loadNearbyServices();
}

function showProviderModal() {
    document.getElementById('providerModal').style.display = 'block';
}

function showRegisterOrgModal() {
    closeModal('providerModal');
    document.getElementById('registerOrgModal').style.display = 'block';
}

function showManageQueuesModal() {
    closeModal('providerModal');
    document.getElementById('manageQueuesModal').style.display = 'block';
    loadActiveQueues();
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    if (modalId === 'qrScanModal') {
        stopQRScanner();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Authentication functions
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + 'Tab').classList.add('active');
}

async function handleCustomerLogin(e) {
    e.preventDefault();
    const email = document.getElementById('customerEmail').value;
    const password = document.getElementById('customerPassword').value;

    if (!email || !password) {
        showNotification('Please enter both email and password', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Password should be at least 6 characters', 'error');
        return;
    }

    try {
        showNotification('Logging in...', 'info');
        
        // Mock authentication - simulate successful login
        setTimeout(() => {
            // Create mock user object
            const mockUser = {
                uid: 'user_' + Date.now(),
                email: email,
                displayName: email.split('@')[0]
            };
            
            // Set current user
            currentUser = mockUser;
            
            // Save to localStorage for persistence
            localStorage.setItem('skipitUser', JSON.stringify(mockUser));
            
            // Update UI
            updateLoginButton();
            updateProfileInfo(mockUser);
            
            closeModal('authModal');
            showNotification('Login successful!', 'success');
            
            console.log('User logged in:', email);
        }, 1000);
        
    } catch (error) {
        console.error('Error with login:', error);
        showNotification('Login failed. Please try again.', 'error');
    }
}

async function verifyOTP(otp) {
    if (!otp || otp.length !== 6) {
        showNotification('Please enter a valid 6-digit OTP', 'error');
        return;
    }

    try {
        const result = await window.confirmationResult.confirm(otp);
        const user = result.user;
        
        // Save user data to Firestore
        await db.collection('users').doc(user.uid).set({
            phone: user.phoneNumber,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        closeModal('otpModal');
        closeModal('authModal');
        showNotification('Login successful!', 'success');
        
        // Update UI for logged in user
        updateLoginButton();
        updateProfileInfo(user);
        
    } catch (error) {
        console.error('Error verifying OTP:', error);
        showNotification('Invalid OTP. Please try again.', 'error');
    }
}

function showOTPModal(phone) {
    const modal = document.createElement('div');
    modal.id = 'otpModal';
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Enter OTP</h3>
                <span class="modal-close" onclick="closeModal('otpModal')">&times;</span>
            </div>
            <div class="modal-body">
                <p>Enter the 6-digit OTP sent to +91${phone}</p>
                <div class="form-group">
                    <input type="text" id="otpInput" placeholder="Enter OTP" maxlength="6" style="text-align: center; font-size: 24px; letter-spacing: 8px; width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 12px;">
                </div>
                <button class="btn btn-primary btn-full" onclick="verifyOTP(document.getElementById('otpInput').value)">Verify OTP</button>
                <div id="recaptcha-container"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Focus on OTP input
    setTimeout(() => {
        document.getElementById('otpInput').focus();
    }, 100);
}

// Update login button text and functionality
function updateLoginButton() {
    const loginBtn = document.querySelector('.nav-links .btn-primary');
    if (loginBtn && currentUser) {
        loginBtn.textContent = 'My Account';
        loginBtn.onclick = (e) => {
            e.preventDefault();
            showProfile();
        };
    } else if (loginBtn) {
        loginBtn.textContent = 'Login';
        loginBtn.onclick = (e) => {
            e.preventDefault();
            showAuthModal();
        };
    }
}

// Update profile information in dropdown
function updateProfileInfo(user) {
    if (!user) return;
    
    const profileName = document.querySelector('.profile-name');
    const profileEmail = document.querySelector('.profile-email');
    const profileAvatar = document.querySelector('.profile-avatar');
    
    if (profileName) {
        profileName.textContent = user.displayName || 'User';
    }
    if (profileEmail) {
        profileEmail.textContent = user.phoneNumber || user.email || 'Phone verified';
    }
    if (profileAvatar) {
        const initials = (user.displayName || user.phoneNumber || 'U').substring(0, 2).toUpperCase();
        profileAvatar.textContent = initials;
    }
}

async function handleProviderLogin(e) {
    e.preventDefault();
    const email = document.getElementById('providerEmail').value;
    const password = document.getElementById('providerPassword').value;

    if (!email || !password) {
        showNotification('Please enter both email and password', 'error');
        return;
    }

    try {
        showNotification('Logging in...', 'info');
        
        // Mock provider authentication
        setTimeout(() => {
            const mockUser = {
                uid: 'provider_' + Date.now(),
                email: email,
                displayName: email.split('@')[0],
                type: 'provider'
            };
            
            currentUser = mockUser;
            isOrganizationView = true;
            
            localStorage.setItem('skipitUser', JSON.stringify(mockUser));
            
            updateLoginButton();
            updateProfileInfo(mockUser);
            
            closeModal('authModal');
            showNotification('Provider login successful!', 'success');
            
            console.log('Provider logged in:', email);
        }, 1000);
        
    } catch (error) {
        showNotification('Login failed. Please try again.', 'error');
    }
}

async function handleRegisterOrg(e) {
    e.preventDefault();

    const orgData = {
        name: document.getElementById('orgName').value,
        type: document.getElementById('orgType').value,
        address: document.getElementById('orgAddress').value,
        city: document.getElementById('orgCity').value,
        state: document.getElementById('orgState').value,
        country: document.getElementById('orgCountry').value,
        email: document.getElementById('orgEmail').value,
        phone: document.getElementById('orgPhone').value
    };

    try {
        // Simulate API call
        showNotification('Registering organization...', 'info');
        setTimeout(() => {
            showNotification('Organization registered successfully!', 'success');
            closeModal('registerOrgModal');
            // Redirect to provider dashboard
            showProviderDashboard();
        }, 1500);
    } catch (error) {
        showNotification('Registration failed. Please try again.', 'error');
    }
}

// Location services
async function getCurrentLocation() {
    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by this browser.', 'error');
        return;
    }

    showNotification('Getting your location...', 'info');

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            // Reverse geocode to get address
            try {
                const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${currentLocation.lat}&longitude=${currentLocation.lng}&localityLanguage=en`);
                const data = await response.json();
                document.getElementById('locationSearch').value = `${data.city}, ${data.principalSubdivision}, ${data.countryName}`;
                loadNearbyServices();
            } catch (error) {
                document.getElementById('locationSearch').value = `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`;
                loadNearbyServices();
            }
        },
        (error) => {
            showNotification('Unable to get your location. Please enter manually.', 'error');
        }
    );
}

function handleLocationSearch(e) {
    const query = e.target.value;
    if (query.length > 2) {
        // Debounce search
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            searchLocations(query);
        }, 500);
    }
}

async function searchLocations(query) {
    try {
        // Simulate location search
        loadNearbyServices();
    } catch (error) {
        console.error('Location search failed:', error);
    }
}

// Load nearby services
async function loadNearbyServices() {
    const servicesList = document.getElementById('servicesList');
    servicesList.innerHTML = '<div class="loading">Loading services from nearby locations...</div>';

    try {
        // Simulate API call to get nearby services
        setTimeout(() => {
            const services = generateIndianServices();
            renderServices(services);
        }, 1000);
    } catch (error) {
        servicesList.innerHTML = '<div class="error">Failed to load services. Please try again.</div>';
    }
}

function generateIndianServices() {
    // Get random city from Indian cities
    const randomCities = INDIAN_CITIES.sort(() => Math.random() - 0.5).slice(0, 3);
    const services = [];

    // Always add Charitable Hospital Mohali as first option
    const mohaliCity = INDIAN_CITIES.find(c => c.city === 'Chandigarh') || randomCities[0];
    const charitableHospital = INDIAN_HOSPITALS[0];
    services.push({
        id: 1,
        name: charitableHospital.name,
        type: 'hospital',
        address: 'Phase 7, Mohali, Punjab',
        distance: '0.8 km',
        queues: charitableHospital.services
    });

    randomCities.forEach((cityData, index) => {
        if (index === 0) {
            // Bank service
            const bank = INDIAN_BANKS[Math.floor(Math.random() * INDIAN_BANKS.length)];
            services.push({
                id: index + 2,
                name: bank.name + ' - ' + cityData.city + ' Branch',
                type: 'bank',
                address: 'Main Street, ' + cityData.city + ', ' + cityData.state,
                distance: (0.5 + Math.random() * 2).toFixed(1) + ' km',
                queues: bank.services
            });
        } else if (index === 1) {
            // Hospital service
            const hospital = INDIAN_HOSPITALS[Math.floor(Math.random() * (INDIAN_HOSPITALS.length - 1)) + 1];
            services.push({
                id: index + 2,
                name: hospital.name + ' - ' + cityData.city,
                type: 'hospital',
                address: 'Healthcare Complex, ' + cityData.city + ', ' + cityData.state,
                distance: (1 + Math.random() * 3).toFixed(1) + ' km',
                queues: hospital.services
            });
        } else {
            // Government service
            const govService = GOVERNMENT_SERVICES[Math.floor(Math.random() * GOVERNMENT_SERVICES.length)];
            services.push({
                id: index + 2,
                name: govService.name + ' - ' + cityData.city,
                type: 'government',
                address: 'Government Complex, ' + cityData.city + ', ' + cityData.state,
                distance: (1.5 + Math.random() * 2.5).toFixed(1) + ' km',
                queues: govService.services
            });
        }
    });

    return services;
}

function renderServices(services) {
    const servicesList = document.getElementById('servicesList');
    servicesList.innerHTML = '';

    services.forEach(service => {
        const serviceElement = document.createElement('div');
        serviceElement.className = 'service-item';
        serviceElement.innerHTML = `
            <div class="service-info">
                <h4>${service.name}</h4>
                <p><i class="fas fa-map-marker-alt"></i> ${service.address} • ${service.distance}</p>
                <div class="service-queues">
                    ${service.queues.map(queue => `<span class="queue-tag">${queue}</span>`).join('')}
                </div>
            </div>
            <button class="btn btn-primary" onclick="joinQueue(${service.id}, '${service.name}', '${service.type}')">
                Join Queue
            </button>
        `;
        servicesList.appendChild(serviceElement);
    });
}

function joinQueue(serviceId, serviceName, serviceType) {
    selectedService = { id: serviceId, name: serviceName, type: serviceType };
    currentQueueId = 'Q' + Date.now();
    currentServiceType = serviceType;

    closeModal('joinQueueModal');

    // Check if it's bank or government - show purpose modal
    if (serviceType === 'bank' || serviceType === 'government') {
        showPurposeModal(serviceType);
    } else {
        // For hospitals, directly send request
        proceedWithQueueRequest(serviceName);
    }
}

function showPurposeModal(serviceType) {
    const serviceTypeSelect = document.getElementById('serviceType');
    serviceTypeSelect.innerHTML = '<option value="">Choose service...</option>';

    if (serviceType === 'bank') {
        const bankServices = [
            'Cash Withdrawal',
            'Cash Deposit',
            'Account Opening',
            'Loan Application',
            'Card Services',
            'Cheque Book Request',
            'Account Statement',
            'Other'
        ];
        bankServices.forEach(service => {
            serviceTypeSelect.innerHTML += `<option value="${service}">${service}</option>`;
        });
    } else if (serviceType === 'government') {
        const govServices = [
            'Passport Application',
            'Passport Renewal',
            'Aadhaar Enrollment',
            'Aadhaar Update',
            'Driving License',
            'PAN Card',
            'Voter ID',
            'Other'
        ];
        govServices.forEach(service => {
            serviceTypeSelect.innerHTML += `<option value="${service}">${service}</option>`;
        });
    }

    document.getElementById('purposeModal').style.display = 'block';
}

function updatePurposeOptions() {
    // Can add dynamic fields based on service type if needed
}

function handlePurposeSubmit(e) {
    e.preventDefault();

    userPurpose = {
        serviceType: document.getElementById('serviceType').value,
        description: document.getElementById('purposeDescription').value,
        documents: document.getElementById('documents').value
    };

    closeModal('purposeModal');
    showNotification('Purpose saved! Sending request...', 'success');

    setTimeout(() => {
        proceedWithQueueRequest(selectedService.name);
    }, 500);
}

function proceedWithQueueRequest(serviceName) {
    showNotification(`Sending request to join ${serviceName}...`, 'info');

    setTimeout(() => {
        sendQueueRequest(serviceName);
        showNotification('Request sent! Waiting for organization approval...', 'info');
    }, 1000);
}

function sendQueueRequest(serviceName) {
    // Create request data
    const request = {
        userName: currentUser ? (currentUser.phone || 'Demo User') : 'Demo User',
        userPhone: currentUser ? currentUser.phone : '+91 9876543210',
        queueName: serviceName,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        purpose: userPurpose
    };
    
    pendingRequest = request;
    
    // If organization is logged in, show the request popup
    if (isOrganizationView) {
        setTimeout(() => {
            showQueueRequestToOrganization(request);
        }, 2000);
    } else {
        // Auto-accept for demo if no organization logged in
        setTimeout(() => {
            handleAutoAccept();
        }, 3000);
    }
}

function showQueueRequestToOrganization(request) {
    document.getElementById('requestUserName').textContent = request.userName;
    document.getElementById('requestUserPhone').textContent = request.userPhone;
    document.getElementById('requestQueueName').textContent = request.queueName;
    document.getElementById('requestTime').textContent = request.time;
    
    // Add purpose info if available
    const requestBody = document.querySelector('#queueRequestNotification .request-body');
    if (request.purpose) {
        const purposeInfo = `<p><strong>Purpose:</strong> ${request.purpose.serviceType}</p>`;
        if (!requestBody.querySelector('.purpose-info')) {
            requestBody.insertAdjacentHTML('beforeend', `<div class="purpose-info">${purposeInfo}</div>`);
        }
    }
    
    const popup = document.getElementById('queueRequestNotification');
    popup.style.display = 'flex';
    
    // Play notification sound effect (visual feedback)
    popup.classList.add('pulse-animation');
    setTimeout(() => popup.classList.remove('pulse-animation'), 600);
}

function handleQueueRequest(accepted) {
    const popup = document.getElementById('queueRequestNotification');
    popup.style.display = 'none';
    
    if (accepted) {
        showNotification('Queue request accepted!', 'success');
        notifyUser(true);
    } else {
        showNotification('Queue request rejected.', 'info');
        notifyUser(false);
    }
}

function notifyUser(accepted) {
    const modal = document.getElementById('userStatusModal');
    const icon = document.getElementById('statusIcon');
    const title = document.getElementById('statusTitle');
    const message = document.getElementById('statusMessage');
    
    if (accepted) {
        icon.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i>';
        title.textContent = 'Request Accepted!';
        title.style.color = '#10b981';
        message.textContent = 'Your queue request has been approved. You can now proceed to the location.';
        
        // Calculate travel time and show queue status after modal closes
        travelTime = Math.floor(Math.random() * 16) + 5;
        notificationShown = false;
    } else {
        icon.innerHTML = '<i class="fas fa-times-circle" style="color: #ef4444;"></i>';
        title.textContent = 'Request Rejected';
        title.style.color = '#ef4444';
        message.textContent = 'Unfortunately, your queue request was not approved. Please try again later or contact the organization.';
    }
    
    modal.style.display = 'block';
    
    // If accepted, show queue status after user closes modal
    if (accepted) {
        const okButton = modal.querySelector('.btn-primary');
        okButton.onclick = () => {
            closeModal('userStatusModal');
            setTimeout(() => showQueueStatus(), 500);
        };
    }
}

function handleAutoAccept() {
    // Auto-accept for demo when no organization is logged in
    notifyUser(true);
}

// QR Code Functions
function showQRScanModal() {
    // Generate a QR code for users to scan and join queue
    generateQRCodeForUser();
}

function startQRScanner() {
    // In a real app, this would use the device camera
    // For demo, we'll just show the video element
    const video = document.getElementById('qrVideo');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
                video.srcObject = stream;
            })
            .catch(err => {
                console.log('Camera access denied:', err);
                showNotification('Camera access required to scan QR code', 'error');
            });
    }
}

function stopQRScanner() {
    const video = document.getElementById('qrVideo');
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
}

function simulateQRScan() {
    // Simulate scanning a QR code
    showNotification('QR Code detected! Processing...', 'info');
    
    setTimeout(() => {
        // Use the generated QR data if available, otherwise use a random service
        let service;
        if (generatedQRData) {
            service = {
                id: generatedQRData.serviceId,
                name: generatedQRData.serviceName,
                type: generatedQRData.serviceType,
                address: generatedQRData.address,
                distance: generatedQRData.distance,
                queues: generatedQRData.queues
            };
        } else {
            const services = generateIndianServices();
            service = services[0];
        }
        
        // Close modal
        closeModal('qrScanModal');
        
        // Set selected service
        selectedService = { id: service.id, name: service.name, type: service.type };
        currentQueueId = 'Q' + Date.now();
        currentServiceType = service.type;
        
        // For bank or government services, show purpose modal
        if (service.type === 'bank' || service.type === 'government') {
            showPurposeModal(service.type);
        } else {
            // For hospitals, directly proceed with queue request
            proceedWithQueueRequest(service.name);
        }
        
        showNotification('Connected to ' + service.name + '!', 'success');
    }, 1000);
}

// Queue Management Functions
function loadActiveQueues() {
    const queuesList = document.getElementById('activeQueuesList');
    queuesList.innerHTML = '<div class="loading">Loading active queues...</div>';

    setTimeout(() => {
        const queues = [
            { id: 1, name: 'General Consultation - Charitable Hospital Mohali', active: 12, status: 'active' },
            { id: 2, name: 'Lab Tests - Charitable Hospital Mohali', active: 8, status: 'active' },
            { id: 3, name: 'Emergency - Charitable Hospital Mohali', active: 5, status: 'active' }
        ];

        queuesList.innerHTML = queues.map(queue => `
            <div class="queue-management-card">
                <div class="queue-info">
                    <h4>${queue.name}</h4>
                    <p><span class="badge badge-${queue.status}">${queue.status.toUpperCase()}</span></p>
                    <p style="color: #6b7280; margin-top: 5px;">${queue.active} people waiting</p>
                </div>
                <div class="queue-actions-btns">
                    <button class="btn btn-secondary" onclick="generateQRCode(${queue.id}, '${queue.name}')">
                        <i class="fas fa-qrcode"></i> QR Code
                    </button>
                    <button class="btn btn-primary" onclick="showEndQueueModal(${queue.id}, '${queue.name}')">
                        <i class="fas fa-stop-circle"></i> End Queue
                    </button>
                </div>
            </div>
        `).join('');
    }, 500);
}

function showEndQueueModal(queueId, queueName) {
    document.getElementById('endQueueName').value = queueName;
    document.getElementById('endQueueModal').setAttribute('data-queue-id', queueId);
    document.getElementById('manageQueuesModal').style.display = 'none';
    document.getElementById('endQueueModal').style.display = 'block';
}

function handleEndQueue(e) {
    e.preventDefault();
    
    const queueName = document.getElementById('endQueueName').value;
    const reason = document.getElementById('endQueueReason').value;
    const details = document.getElementById('endQueueDetails').value;
    const notifyUsers = document.getElementById('notifyUsers').checked;

    showNotification('Ending queue...', 'info');

    setTimeout(() => {
        closeModal('endQueueModal');
        
        const reasonText = document.getElementById('endQueueReason').selectedOptions[0].text;
        let message = `Queue "${queueName}" has been ended. Reason: ${reasonText}`;
        
        if (notifyUsers) {
            message += '. All users have been notified.';
        }
        
        showNotification(message, 'success');
        
        // Reset form
        document.getElementById('endQueueForm').reset();
        
        // Reload queues
        showManageQueuesModal();
    }, 1000);
}

function generateQRCode(queueId, queueName) {
    const qrContainer = document.getElementById('qrCodeContainer');
    qrContainer.innerHTML = '';
    
    // Generate QR code data
    const qrData = JSON.stringify({
        type: 'queue',
        queueId: queueId,
        queueName: queueName,
        timestamp: Date.now()
    });
    
    // Create QR code
    new QRCode(qrContainer, {
        text: qrData,
        width: 256,
        height: 256,
        colorDark: '#2563eb',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
    
    closeModal('manageQueuesModal');
    document.getElementById('generateQRModal').style.display = 'block';
}

function generateQRCodeForUser() {
    // Generate a QR code for users to scan and join a queue
    const qrContainer = document.getElementById('qrCodeContainer');
    qrContainer.innerHTML = '';
    
    // Get a random service to generate QR code for
    const services = generateIndianServices();
    const randomService = services[Math.floor(Math.random() * services.length)];
    
    // Generate QR code data with all service info
    const qrData = {
        type: 'user_queue',
        serviceId: randomService.id,
        serviceName: randomService.name,
        serviceType: randomService.type,
        address: randomService.address,
        distance: randomService.distance,
        queues: randomService.queues,
        timestamp: Date.now(),
        qrCode: 'SKIPIT_' + Date.now()
    };
    
    // Store the QR data globally so it can be used when scanned
    generatedQRData = qrData;
    
    // Create QR code with JSON string
    new QRCode(qrContainer, {
        text: JSON.stringify(qrData),
        width: 256,
        height: 256,
        colorDark: '#2563eb',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // Show success message
    showNotification('QR Code generated! Users can scan to join queue.', 'success');
    
    // Show the generate QR modal
    document.getElementById('generateQRModal').style.display = 'block';
}

function downloadQR() {
    const canvas = document.querySelector('#qrCodeContainer canvas');
    if (canvas) {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'queue-qr-code.png';
        link.href = url;
        link.click();
        showNotification('QR Code downloaded successfully!', 'success');
    }
}

// Queue status display
function showQueueStatus() {
    // Create queue status overlay
    const queueStatus = document.createElement('div');
    queueStatus.id = 'queueStatus';
    queueStatus.className = 'queue-status-overlay';
    queueStatus.innerHTML = `
        <div class="queue-status-card">
            <div class="queue-header">
                <h3>${selectedService.name}</h3>
                <button class="close-btn" onclick="closeQueueStatus()">&times;</button>
            </div>
            <div class="queue-info">
                <div class="queue-position">
                    <span class="label">Your Position:</span>
                    <span class="value" id="currentPosition">5</span>
                </div>
                <div class="queue-wait">
                    <span class="label">Estimated Wait:</span>
                    <span class="value" id="estimatedWait">15 minutes</span>
                </div>
                <div class="queue-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill" style="width: 60%"></div>
                    </div>
                    <div class="progress-text">4 people ahead</div>
                </div>
            </div>
            <div class="swap-section">
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
                    <i class="fas fa-info-circle"></i> Stuck in traffic? Swap with next person to keep counter busy
                </p>
                <button class="btn btn-secondary btn-full" onclick="requestSwap()" id="swapBtn">
                    <i class="fas fa-exchange-alt"></i> Request Swap Position
                </button>
            </div>
            <div class="delay-section">
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
                    <i class="fas fa-parking"></i> Can't find parking or need more time?
                </p>
                <button class="btn btn-secondary btn-full" onclick="requestDelay()" id="delayBtn">
                    <i class="fas fa-clock"></i> Push Me 1 Person Back
                </button>
            </div>
            <div class="queue-actions">
                <button class="btn btn-secondary" onclick="leaveQueue()">Leave Queue</button>
                <button class="btn btn-primary" onclick="refreshQueue()">Refresh</button>
            </div>
        </div>
    `;

    document.body.appendChild(queueStatus);

    // Start live updates
    startQueueUpdates();
}

function closeQueueStatus() {
    const queueStatus = document.getElementById('queueStatus');
    if (queueStatus) {
        queueStatus.remove();
    }
    stopQueueUpdates();
}

function leaveQueue() {
    showNotification('Left the queue successfully.', 'info');
    closeQueueStatus();
}

function refreshQueue() {
    // Simulate refresh
    showNotification('Refreshing queue status...', 'info');
    setTimeout(() => {
        showNotification('Queue status updated!', 'success');
    }, 500);
}

function requestSwap() {
    const swapBtn = document.getElementById('swapBtn');
    const currentPos = parseInt(document.getElementById('currentPosition').textContent);

    if (currentPos <= 2) {
        showNotification('Cannot swap - you are next in line!', 'error');
        return;
    }

    swapBtn.disabled = true;
    swapBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Requesting...';

    setTimeout(() => {
        const newPos = currentPos + 1;
        document.getElementById('currentPosition').textContent = newPos;
        
        const waitTime = newPos * 3;
        document.getElementById('estimatedWait').textContent = waitTime + ' minutes';
        
        const progress = ((5 - newPos) / 4) * 100;
        document.getElementById('progressFill').style.width = progress + '%';

        showNotification('✅ Swap successful! Position moved to ' + newPos + '. Counter stays busy!', 'success');
        
        swapBtn.innerHTML = '<i class="fas fa-check"></i> Swapped';
        swapBtn.style.background = '#10b981';
        swapBtn.style.color = 'white';
        
        setTimeout(() => {
            swapBtn.disabled = true;
            swapBtn.innerHTML = '<i class="fas fa-check"></i> Already Swapped';
        }, 2000);
    }, 1500);
}

function requestDelay() {
    const delayBtn = document.getElementById('delayBtn');
    const currentPos = parseInt(document.getElementById('currentPosition').textContent);

    if (currentPos === 1) {
        showNotification('You are next! Cannot delay further. Please arrive soon.', 'error');
        return;
    }

    delayBtn.disabled = true;
    delayBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    setTimeout(() => {
        const newPos = currentPos + 1;
        document.getElementById('currentPosition').textContent = newPos;
        
        const waitTime = newPos * 3;
        document.getElementById('estimatedWait').textContent = waitTime + ' minutes';
        
        const progress = ((5 - newPos) / 4) * 100;
        document.getElementById('progressFill').style.width = progress + '%';

        showNotification('✅ Position delayed! You are now at position ' + newPos + '. Take your time!', 'success');
        
        delayBtn.innerHTML = '<i class="fas fa-check"></i> Delayed';
        delayBtn.style.background = '#f59e0b';
        delayBtn.style.color = 'white';
        
        setTimeout(() => {
            delayBtn.disabled = false;
            delayBtn.innerHTML = '<i class="fas fa-clock"></i> Push Me 1 Person Back';
            delayBtn.style.background = '';
            delayBtn.style.color = '';
        }, 120000);
    }, 1500);
}

// Live queue updates simulation
let queueUpdateInterval;

function startQueueUpdates() {
    queueUpdateInterval = setInterval(() => {
        updateQueuePosition();
    }, 5000); // Update every 5 seconds
}

function stopQueueUpdates() {
    if (queueUpdateInterval) {
        clearInterval(queueUpdateInterval);
    }
}

function updateQueuePosition() {
    const positionElement = document.getElementById('currentPosition');
    const waitElement = document.getElementById('estimatedWait');
    const progressElement = document.getElementById('progressFill');

    if (!positionElement) return;

    let currentPos = parseInt(positionElement.textContent);

    // Simulate position change (80% chance to stay, 20% chance to move forward)
    if (Math.random() < 0.2 && currentPos > 1) {
        currentPos--;
        positionElement.textContent = currentPos;

        const progress = ((5 - currentPos) / 4) * 100;
        progressElement.style.width = progress + '%';

        const waitTime = currentPos * 3; // 3 minutes per person
        waitElement.textContent = waitTime + ' minutes';

        // Show "leave now" notification when wait time equals travel time
        if (waitTime <= travelTime && !notificationShown) {
            notificationShown = true;
            showArrivalNotification(waitTime);
        }

        if (currentPos <= 2) {
            showNotification('You\'re next in line! Please proceed to the counter.', 'success');
        }
    }
}

function showArrivalNotification(waitTime) {
    // Create a special notification for arrival time
    const notification = document.createElement('div');
    notification.className = 'notification arrival-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div style="display: flex; align-items: center; gap: 15px;">
                <i class="fas fa-clock" style="font-size: 24px; color: #f59e0b;"></i>
                <div>
                    <strong style="display: block; margin-bottom: 5px;">Time to Leave!</strong>
                    <span>Leave now to arrive exactly when your turn arrives (${waitTime} min)</span>
                </div>
            </div>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;

    document.body.appendChild(notification);

    // Play notification sound (optional)
    // new Audio('notification.mp3').play();

    // Auto remove after 10 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 10000);
}

// Provider dashboard
function showProviderDashboard() {
    const dashboard = document.createElement('div');
    dashboard.id = 'providerDashboard';
    dashboard.className = 'provider-dashboard';
    dashboard.innerHTML = `
        <div class="dashboard-header">
            <h2>Charitable Hospital Mohali - Dashboard</h2>
            <button class="btn btn-secondary" onclick="closeProviderDashboard()">Close</button>
        </div>
        <div class="dashboard-content">
            <div class="dashboard-stats">
                <div class="stat-card">
                    <h3>Active Queues</h3>
                    <div class="stat-value">3</div>
                </div>
                <div class="stat-card">
                    <h3>People Waiting</h3>
                    <div class="stat-value">25</div>
                </div>
                <div class="stat-card">
                    <h3>Avg Wait Time</h3>
                    <div class="stat-value">10 min</div>
                </div>
            </div>
            <div class="queue-management">
                <h3>Queue Management</h3>
                <div class="counters-grid">
                    <div class="counter-card">
                        <h4>General Consultation</h4>
                        <div class="counter-status active">Active</div>
                        <div class="current-customer">Serving: Patient #12</div>
                        <button class="btn btn-primary" onclick="callNext(1)">Call Next</button>
                        <button class="btn btn-secondary" onclick="completeService('Patient #12', 1)" style="margin-top: 10px;">Complete Service</button>
                    </div>
                    <div class="counter-card">
                        <h4>Lab Tests</h4>
                        <div class="counter-status active">Active</div>
                        <div class="current-customer">Serving: Patient #8</div>
                        <button class="btn btn-primary" onclick="callNext(2)">Call Next</button>
                    </div>
                    <div class="counter-card">
                        <h4>Emergency</h4>
                        <div class="counter-status busy">Busy</div>
                        <div class="current-customer">Serving: Patient #5</div>
                        <button class="btn btn-primary" onclick="callNext(3)">Call Next</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(dashboard);
}

function closeProviderDashboard() {
    const dashboard = document.getElementById('providerDashboard');
    if (dashboard) {
        dashboard.remove();
    }
}

function callNext(counterId) {
    showNotification(`Calling next customer to Counter ${counterId}`, 'success');
    // In real app, this would send notification to customer
}

// Service Completion & Handoff Functions
function completeService(patientName, counterId) {
    currentPatient = { name: patientName, counterId: counterId };
    document.getElementById('completePatientName').textContent = patientName;
    document.getElementById('completeServiceModal').style.display = 'block';
}

function showHandoffOptions() {
    document.getElementById('handoffOptions').style.display = 'block';
}

function completeWithoutHandoff() {
    closeModal('completeServiceModal');
    showNotification(`${currentPatient.name} service completed successfully!`, 'success');
    currentPatient = null;
}

function completeWithHandoff() {
    const nextService = document.getElementById('nextService').value;
    
    if (!nextService) {
        showNotification('Please select next service', 'error');
        return;
    }

    closeModal('completeServiceModal');
    
    // Show handoff process
    showNotification(`Completing service for ${currentPatient.name}...`, 'info');
    
    setTimeout(() => {
        showNotification(`✅ ${currentPatient.name} automatically added to ${nextService} queue!`, 'success');
        
        // Notify user about handoff
        setTimeout(() => {
            notifyUserHandoff(nextService);
        }, 1000);
        
        currentPatient = null;
        document.getElementById('nextService').value = '';
        document.getElementById('handoffOptions').style.display = 'none';
    }, 1500);
}

function notifyUserHandoff(nextService) {
    // Create handoff notification for user
    const notification = document.createElement('div');
    notification.className = 'notification handoff-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div style="display: flex; align-items: center; gap: 15px;">
                <i class="fas fa-arrow-right" style="font-size: 24px; color: #10b981;"></i>
                <div>
                    <strong style="display: block; margin-bottom: 5px; color: #10b981;">Service Completed!</strong>
                    <span>You've been automatically added to <strong>${nextService}</strong> queue. Position: 3</span>
                </div>
            </div>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;

    document.body.appendChild(notification);

    // Update queue status if open
    const queueStatus = document.getElementById('queueStatus');
    if (queueStatus) {
        const header = queueStatus.querySelector('.queue-header h3');
        if (header) {
            header.textContent = `${nextService} - Charitable Hospital Mohali`;
        }
        document.getElementById('currentPosition').textContent = '3';
        document.getElementById('estimatedWait').textContent = '9 minutes';
        document.getElementById('progressFill').style.width = '40%';
    }

    // Auto remove after 8 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 8000);
}

// UI updates
function updateUIForUser() {
    const loginBtn = document.querySelector('.btn-primary');
    if (currentUser) {
        if (currentUser.type === 'customer') {
            loginBtn.textContent = 'My Queue';
            loginBtn.onclick = () => showQueueStatus();
        } else {
            loginBtn.textContent = 'Dashboard';
            loginBtn.onclick = () => showProviderDashboard();
        }
    }
}

// Check authentication status on page load
function checkAuthStatus() {
    const savedUser = localStorage.getItem('skipitUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateLoginButton();
            updateProfileInfo(currentUser);
            console.log('User restored from localStorage:', currentUser.email);
        } catch (error) {
            localStorage.removeItem('skipitUser');
            currentUser = null;
            updateLoginButton();
        }
    } else {
        currentUser = null;
        updateLoginButton();
    }
    
    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage === 'hindi') {
        changeLanguageToHindi();
    }
}

// Demo data loading
function loadDemoData() {
    // Only run demo animation if demo elements exist
    const demoPos = document.getElementById('demo-position');
    const demoWait = document.getElementById('demo-wait');
    const progressFill = document.querySelector('.progress-fill');
    
    if (demoPos && demoWait) {
        // Animate demo position
        setInterval(() => {
            let pos = parseInt(demoPos.textContent);
            if (Math.random() < 0.3 && pos > 1) {
                pos--;
                demoPos.textContent = pos;
                const wait = pos * 3;
                demoWait.textContent = wait + ' mins';
                if (progressFill) {
                    const progress = ((5 - pos) / 4) * 100;
                    progressFill.style.width = progress + '%';
                }
            }
        }, 3000);
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Add notification styles dynamically
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 3000;
        min-width: 300px;
        animation: slideInRight 0.3s;
    }

    .notification-content {
        background: white;
        border-radius: 8px;
        padding: 16px 20px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .notification.success .notification-content {
        border-left: 4px solid #10b981;
    }

    .notification.error .notification-content {
        border-left: 4px solid #ef4444;
    }

    .notification.info .notification-content {
        border-left: 4px solid #3b82f6;
    }

    .notification-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #9ca3af;
        margin-left: 10px;
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .queue-status-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 2500;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .queue-status-card {
        background: white;
        border-radius: 16px;
        padding: 30px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
    }

    .queue-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
    }

    .queue-header h3 {
        color: #1f2937;
        font-size: 24px;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #9ca3af;
    }

    .queue-info {
        margin-bottom: 30px;
    }

    .queue-position, .queue-wait {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
        font-size: 18px;
    }

    .label {
        color: #6b7280;
    }

    .value {
        font-weight: 600;
        color: #1f2937;
    }

    .queue-progress {
        margin-top: 20px;
    }

    .progress-text {
        text-align: center;
        margin-top: 10px;
        color: #6b7280;
        font-size: 14px;
    }

    .queue-actions {
        display: flex;
        gap: 15px;
    }

    .provider-dashboard {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        z-index: 2000;
        overflow-y: auto;
    }

    .dashboard-header {
        background: #f8fafc;
        padding: 20px 30px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .dashboard-content {
        padding: 30px;
    }

    .dashboard-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
    }

    .stat-card {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        text-align: center;
    }

    .stat-card h3 {
        color: #6b7280;
        margin-bottom: 10px;
    }

    .stat-value {
        font-size: 32px;
        font-weight: bold;
        color: #2563eb;
    }

    .counters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
    }

    .counter-card {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .counter-card h4 {
        margin-bottom: 10px;
        color: #1f2937;
    }

    .counter-status {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        margin-bottom: 10px;
    }

    .counter-status.active {
        background: #dcfce7;
        color: #166534;
    }

    .counter-status.busy {
        background: #fef3c7;
        color: #92400e;
    }

    .current-customer {
        color: #6b7280;
        margin-bottom: 15px;
        font-size: 14px;
    }

    .queue-tag {
        display: inline-block;
        background: #eff6ff;
        color: #2563eb;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        margin-right: 8px;
        margin-bottom: 5px;
    }

    .loading, .error {
        text-align: center;
        padding: 40px;
        color: #6b7280;
    }

    .error {
        color: #ef4444;
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Firestore Database Functions
async function saveQueueRequest(queueData) {
    try {
        const docRef = await db.collection('queueRequests').add({
            userId: currentUser.uid,
            serviceName: queueData.serviceName,
            purpose: queueData.purpose,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending',
            position: null
        });
        
        currentQueueId = docRef.id;
        return docRef.id;
    } catch (error) {
        console.error('Error saving queue request:', error);
        throw error;
    }
}

async function getUserQueues() {
    try {
        const snapshot = await db.collection('queueRequests')
            .where('userId', '==', currentUser.uid)
            .where('status', 'in', ['pending', 'active'])
            .orderBy('timestamp', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching user queues:', error);
        return [];
    }
}

async function updateUserProfile(profileData) {
    try {
        await db.collection('users').doc(currentUser.uid).update({
            displayName: profileData.name,
            email: profileData.email,
            language: profileData.language,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return true;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}

// Real-time queue updates
function subscribeToQueueUpdates(queueId) {
    return db.collection('queueRequests').doc(queueId)
        .onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                updateQueueUI(data);
            }
        });
}

function updateQueueUI(queueData) {
    const positionElement = document.getElementById('currentPosition');
    const waitElement = document.getElementById('estimatedWait');
    
    if (positionElement && queueData.position) {
        positionElement.textContent = queueData.position;
        const waitTime = queueData.position * 3;
        waitElement.textContent = waitTime + ' minutes';
    }
}

// Theme Toggle Function
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
        showNotification('Light mode activated', 'info');
    } else {
        body.classList.add('dark-mode');
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
        showNotification('Dark mode activated', 'info');
    }
}

// Load saved theme on page load
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('themeIcon');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeIcon) themeIcon.className = 'fas fa-sun';
    }
}

// Notification and Profile Functions
function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    const profileDropdown = document.getElementById('profileDropdown');
    
    // Close profile dropdown if open
    profileDropdown.style.display = 'none';
    
    // Toggle notifications dropdown
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block';
        positionDropdown(dropdown, '.notification-icon');
    } else {
        dropdown.style.display = 'none';
    }
}

function toggleProfileMenu() {
    const dropdown = document.getElementById('profileDropdown');
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    
    // Close notifications dropdown if open
    notificationsDropdown.style.display = 'none';
    
    // Toggle profile dropdown
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block';
        positionDropdown(dropdown, '.profile-icon');
    } else {
        dropdown.style.display = 'none';
    }
}

function positionDropdown(dropdown, triggerSelector) {
    // Dropdowns are now positioned using CSS relative positioning
    // No need for manual positioning
}

function clearAllNotifications() {
    const notificationsList = document.querySelector('.notifications-list');
    notificationsList.innerHTML = '<div class="no-notifications">No notifications</div>';
    document.querySelector('.notification-badge').style.display = 'none';
    showNotification('All notifications cleared', 'success');
}

function viewAllNotifications() {
    showNotification('Opening full notifications view...', 'info');
    document.getElementById('notificationsDropdown').style.display = 'none';
}

function showMyQueues() {
    document.getElementById('profileDropdown').style.display = 'none';
    
    // Create and show My Queues modal
    const modal = document.createElement('div');
    modal.id = 'myQueuesModal';
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3>My Active Queues</h3>
                <span class="modal-close" onclick="closeModal('myQueuesModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="queue-list">
                    <div class="queue-item">
                        <div class="queue-info">
                            <h4>SBI Bank Mumbai</h4>
                            <p><i class="fas fa-map-marker-alt"></i> Andheri West, Mumbai</p>
                            <p><strong>Position:</strong> 12 | <strong>Wait Time:</strong> ~18 minutes</p>
                        </div>
                        <div class="queue-status active">Active</div>
                    </div>
                    <div class="queue-item">
                        <div class="queue-info">
                            <h4>Apollo Hospital</h4>
                            <p><i class="fas fa-map-marker-alt"></i> Bandra, Mumbai</p>
                            <p><strong>Position:</strong> 8 | <strong>Wait Time:</strong> ~12 minutes</p>
                        </div>
                        <div class="queue-status active">Active</div>
                    </div>
                    <div class="queue-item">
                        <div class="queue-info">
                            <h4>Passport Office Delhi</h4>
                            <p><i class="fas fa-map-marker-alt"></i> CP, New Delhi</p>
                            <p><strong>Position:</strong> 15 | <strong>Wait Time:</strong> ~25 minutes</p>
                        </div>
                        <div class="queue-status waiting">Waiting</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function showProfile() {
    document.getElementById('profileDropdown').style.display = 'none';
    
    const modal = document.createElement('div');
    modal.id = 'profileSettingsModal';
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Profile Settings</h3>
                <span class="modal-close" onclick="closeModal('profileSettingsModal')">&times;</span>
            </div>
            <div class="modal-body">
                <form>
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" placeholder="Enter your full name" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" placeholder="Enter your email address" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="tel" placeholder="Enter your phone number" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Preferred Language</label>
                        <select class="form-control">
                            <option>English</option>
                            <option>Hindi</option>
                        </select>
                    </div>
                    <button type="button" class="btn btn-primary btn-full" onclick="saveProfile()">Save Changes</button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function showNotificationSettings() {
    document.getElementById('profileDropdown').style.display = 'none';
    
    const modal = document.createElement('div');
    modal.id = 'notificationSettingsModal';
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Notification Settings</h3>
                <span class="modal-close" onclick="closeModal('notificationSettingsModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>SMS Notifications</h4>
                        <p>Receive SMS alerts for queue updates</p>
                    </div>
                    <label class="toggle">
                        <input type="checkbox" checked onchange="updateToggleState(this)">
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Email Notifications</h4>
                        <p>Get email updates about your queues</p>
                    </div>
                    <label class="toggle">
                        <input type="checkbox" checked onchange="updateToggleState(this)">
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Push Notifications</h4>
                        <p>Browser notifications for real-time updates</p>
                    </div>
                    <label class="toggle">
                        <input type="checkbox" onchange="updateToggleState(this)">
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="setting-item">
                    <div class="setting-info">
                        <h4>Queue Reminders</h4>
                        <p>Remind me when it's almost my turn</p>
                    </div>
                    <label class="toggle">
                        <input type="checkbox" checked onchange="updateToggleState(this)">
                        <span class="slider"></span>
                    </label>
                </div>
                <button type="button" class="btn btn-primary btn-full" onclick="saveNotificationSettings()">Save Settings</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Load saved settings after modal is created
    setTimeout(() => loadNotificationSettings(), 100);
}

function updateToggleState(toggle) {
    // Visual feedback when toggle is changed
    const settingItem = toggle.closest('.setting-item');
    settingItem.style.transform = 'scale(1.02)';
    setTimeout(() => {
        settingItem.style.transform = 'scale(1)';
    }, 150);
}

function showHelp() {
    document.getElementById('profileDropdown').style.display = 'none';
    
    const modal = document.createElement('div');
    modal.id = 'helpModal';
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3>Help & Support</h3>
                <span class="modal-close" onclick="closeModal('helpModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="help-section">
                    <h4><i class="fas fa-phone"></i> Contact Support</h4>
                    <p><strong>24/7 Customer Support</strong></p>
                    <p>Phone: <a href="tel:1800-XXX-XXXX">1800-XXX-XXXX</a></p>
                    <p>Email: <a href="mailto:support@skipit.in">support@skipit.in</a></p>
                    <p>WhatsApp: <a href="https://wa.me/91XXXXXXXXXX">+91-XXXX-XXXX-XXX</a></p>
                </div>
                <div class="help-section">
                    <h4><i class="fas fa-question-circle"></i> Frequently Asked Questions</h4>
                    <div class="faq-item">
                        <strong>How do I join a queue?</strong>
                        <p>Click 'Join Queue Now' and search for your location or scan the QR code at the venue.</p>
                    </div>
                    <div class="faq-item">
                        <strong>Can I leave and rejoin a queue?</strong>
                        <p>You can leave anytime, but you'll need to rejoin from the end if you want to come back.</p>
                    </div>
                    <div class="faq-item">
                        <strong>What if I'm running late?</strong>
                        <p>Use the 'Push Me Back' feature to delay your position by 1 person.</p>
                    </div>
                </div>
                <div class="help-section">
                    <h4><i class="fas fa-book"></i> Quick Actions</h4>
                    <button class="btn btn-secondary" onclick="startTutorial()">Take Tutorial</button>
                    <button class="btn btn-secondary" onclick="reportIssue()">Report Issue</button>
                    <button class="btn btn-secondary" onclick="provideFeedback()">Give Feedback</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function saveProfile() {
    const languageSelect = document.querySelector('#profileSettingsModal select');
    const selectedLanguage = languageSelect ? languageSelect.value : 'English';
    
    if (selectedLanguage === 'Hindi') {
        changeLanguageToHindi();
        localStorage.setItem('preferredLanguage', 'hindi');
        showNotification('प्रोफ़ाइल सफलतापूर्वक अपडेट हो गया!', 'success');
    } else {
        changeLanguageToEnglish();
        localStorage.setItem('preferredLanguage', 'english');
        showNotification('Profile updated successfully!', 'success');
    }
    
    closeModal('profileSettingsModal');
}

function changeLanguageToHindi() {
    // Update navigation
    const navLinks = document.querySelectorAll('.nav-link');
    if (navLinks[0]) navLinks[0].textContent = 'होम';
    if (navLinks[1]) navLinks[1].textContent = 'सेवाएं';
    if (navLinks[2]) navLinks[2].textContent = 'हमारे बारे में';
    
    // Update login button
    const loginBtn = document.querySelector('.nav-links .btn-primary');
    if (loginBtn && currentUser) {
        loginBtn.textContent = 'मेरा खाता';
    } else if (loginBtn) {
        loginBtn.textContent = 'लॉगिन';
    }
    
    // Update hero section
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) heroTitle.textContent = 'प्रतीक्षा छोड़ें, सेवा नहीं।';
    
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) heroSubtitle.textContent = 'भारत की अग्रणी डिजिटल कतार प्रबंधन प्लेटफॉर्म। बैंकों, अस्पतालों और सरकारी कार्यालयों में वर्चुअल कतारों में शामिल हों। रियल-टाइम ट्रैकिंग, तत्काल सूचनाएं, और शून्य भौतिक प्रतीक्षा।';
    
    // Update buttons
    const joinQueueBtn = document.querySelector('.hero-buttons .btn-primary');
    if (joinQueueBtn) joinQueueBtn.innerHTML = '<i class="fas fa-play-circle"></i> अभी कतार में शामिल हों';
    
    // Update white box content (queue interface mockup)
    const queueTitle = document.querySelector('.queue-interface h3');
    if (queueTitle) queueTitle.textContent = 'आपकी कतार की स्थिति';
    
    const queueSubtitle = document.querySelector('.queue-interface p');
    if (queueSubtitle) queueSubtitle.textContent = 'SBI बैंक - अंधेरी शाखा';
    
    const positionLabel = document.querySelector('.queue-position .label');
    if (positionLabel) positionLabel.textContent = 'आपकी स्थिति:';
    
    const waitLabel = document.querySelector('.queue-wait .label');
    if (waitLabel) waitLabel.textContent = 'अनुमानित प्रतीक्षा:';
    
    const progressText = document.querySelector('.progress-text');
    if (progressText) progressText.textContent = 'आपसे पहले 4 लोग';
    
    const queueButtons = document.querySelectorAll('.queue-actions .btn');
    if (queueButtons[0]) queueButtons[0].innerHTML = '<i class="fas fa-times"></i> कतार छोड़ें';
    if (queueButtons[1]) queueButtons[1].innerHTML = '<i class="fas fa-refresh"></i> रिफ्रेश करें';
    
    // Update feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    const hindiFeatures = [
        {
            title: 'रियल-टाइम ट्रैकिंग',
            description: 'अपनी कतार की स्थिति को लाइव देखें और सटीक प्रतीक्षा समय जानें।'
        },
        {
            title: 'तत्काल सूचनाएं',
            description: 'SMS और ऐप नोटिफिकेशन के माध्यम से अपडेट प्राप्त करें।'
        },
        {
            title: 'स्मार्ट शेड्यूलिंग',
            description: 'AI-संचालित समय अनुमान के साथ अपनी यात्रा की योजना बनाएं।'
        },
        {
            title: 'मल्टी-लोकेशन सपोर्ट',
            description: 'भारत भर के हजारों स्थानों पर उपलब्ध सेवाएं।'
        }
    ];
    
    featureCards.forEach((card, index) => {
        if (hindiFeatures[index]) {
            const title = card.querySelector('h4');
            const description = card.querySelector('p');
            if (title) title.textContent = hindiFeatures[index].title;
            if (description) description.textContent = hindiFeatures[index].description;
        }
    });
    
    // Update how it works steps
    const stepCards = document.querySelectorAll('.step-card');
    const hindiSteps = [
        {
            title: 'स्थान खोजें',
            description: 'अपने नजदीकी बैंक, अस्पताल या सरकारी कार्यालय खोजें।'
        },
        {
            title: 'कतार में शामिल हों',
            description: 'QR कोड स्कैन करें या ऐप के माध्यम से वर्चुअल कतार में शामिल हों।'
        },
        {
            title: 'ट्रैक करें',
            description: 'रियल-टाइम में अपनी स्थिति और प्रतीक्षा समय देखें।'
        },
        {
            title: 'सेवा प्राप्त करें',
            description: 'सही समय पर पहुंचें और तुरंत सेवा प्राप्त करें।'
        }
    ];
    
    stepCards.forEach((card, index) => {
        if (hindiSteps[index]) {
            const title = card.querySelector('h4');
            const description = card.querySelector('p');
            if (title) title.textContent = hindiSteps[index].title;
            if (description) description.textContent = hindiSteps[index].description;
        }
    });
    
    // Update benefits cards
    const benefitCards = document.querySelectorAll('.benefit-card');
    const hindiBenefits = [
        {
            title: 'समय की बचत',
            description: 'भौतिक कतारों में खड़े होने की आवश्यकता नहीं। अपना समय बचाएं।'
        },
        {
            title: 'सुविधा',
            description: 'कहीं से भी कतार में शामिल हों और अपनी स्थिति ट्रैक करें।'
        },
        {
            title: 'पारदर्शिता',
            description: 'वास्तविक समय की जानकारी और सटीक प्रतीक्षा समय अनुमान।'
        }
    ];
    
    benefitCards.forEach((card, index) => {
        if (hindiBenefits[index]) {
            const title = card.querySelector('h4');
            const description = card.querySelector('p');
            if (title) title.textContent = hindiBenefits[index].title;
            if (description) description.textContent = hindiBenefits[index].description;
        }
    });
    
    // Update section titles
    const sectionTitles = document.querySelectorAll('.section-title');
    const hindiTitles = [
        'भारत भर में उपलब्ध सेवाएं',
        '4 आसान चरणों में कैसे काम करता है',
        'SKIPIT क्यों चुनें?',
        'हर उद्योग के लिए समाधान',
        'ऑल-इन-वन कतार प्रबंधन समाधान',
        'अग्रणी संगठनों द्वारा भरोसेमंद',
        'एंटरप्राइज़-ग्रेड सुरक्षा और अनुपालन',
        'सरल, पारदर्शी मूल्य निर्धारण',
        'AI-संचालित व्यावसायिक बुद्धिमत्ता',
        'अपना ROI गणना करें',
        'प्रतीक्षा लाइनों को समाप्त करने के लिए तैयार?'
    ];
    
    sectionTitles.forEach((title, index) => {
        if (hindiTitles[index]) {
            title.textContent = hindiTitles[index];
        }
    });
    
    // Update footer
    const footerLinks = document.querySelectorAll('.footer-links a');
    if (footerLinks[0]) footerLinks[0].textContent = 'होम';
    if (footerLinks[1]) footerLinks[1].textContent = 'सेवाएं';
    if (footerLinks[2]) footerLinks[2].textContent = 'हमारे बारे में';
    if (footerLinks[3]) footerLinks[3].textContent = 'गोपनीयता';
    if (footerLinks[4]) footerLinks[4].textContent = 'नियम';
    
    const footerBottom = document.querySelector('.footer-bottom p');
    if (footerBottom) footerBottom.textContent = '©SKIPIT. सभी अधिकार सुरक्षित।';
    
    // Update CTA section
    const ctaTitle = document.querySelector('.cta-content h2');
    if (ctaTitle) ctaTitle.textContent = 'प्रतीक्षा लाइनों को समाप्त करने के लिए तैयार?';
    
    const ctaSubtitle = document.querySelector('.cta-content p');
    if (ctaSubtitle) ctaSubtitle.textContent = 'आज ही अपना निःशुल्क 14-दिन का परीक्षण शुरू करें। कोई क्रेडिट कार्ड आवश्यक नहीं।';
    
    const ctaButtons = document.querySelectorAll('.cta-buttons .btn');
    if (ctaButtons[0]) ctaButtons[0].innerHTML = '<i class="fas fa-play-circle"></i> निःशुल्क परीक्षण शुरू करें';
    if (ctaButtons[1]) ctaButtons[1].innerHTML = '<i class="fas fa-phone"></i> बिक्री से संपर्क करें';
}

function changeLanguageToEnglish() {
    // Update navigation
    const navLinks = document.querySelectorAll('.nav-link');
    if (navLinks[0]) navLinks[0].textContent = 'Home';
    if (navLinks[1]) navLinks[1].textContent = 'Services';
    if (navLinks[2]) navLinks[2].textContent = 'About';
    
    // Update login button
    const loginBtn = document.querySelector('.nav-links .btn-primary');
    if (loginBtn && currentUser) {
        loginBtn.textContent = 'My Account';
    } else if (loginBtn) {
        loginBtn.textContent = 'Login';
    }
    
    // Update hero section
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) heroTitle.textContent = 'Skip the Queue, Save Your Time';
    
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) heroSubtitle.textContent = 'Join digital queues at banks, hospitals, and government offices across India. Real-time tracking, instant notifications, and zero waiting hassle.';
    
    // Update buttons
    const joinQueueBtn = document.querySelector('.hero-buttons .btn-primary');
    if (joinQueueBtn) joinQueueBtn.innerHTML = '<i class="fas fa-play-circle"></i> Join Queue Now';
    
    const scanQRBtn = document.querySelector('.hero-buttons .btn-secondary');
    if (scanQRBtn) scanQRBtn.innerHTML = '<i class="fas fa-qrcode"></i> Scan QR Code';
}

function saveNotificationSettings() {
    // Get all toggle states
    const toggles = document.querySelectorAll('#notificationSettingsModal input[type="checkbox"]');
    const settings = {};
    
    toggles.forEach((toggle, index) => {
        const settingNames = ['sms', 'email', 'push', 'reminders'];
        settings[settingNames[index]] = toggle.checked;
    });
    
    // Save to localStorage
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    
    showNotification('Notification settings saved successfully!', 'success');
    closeModal('notificationSettingsModal');
}

function loadNotificationSettings() {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        const toggles = document.querySelectorAll('#notificationSettingsModal input[type="checkbox"]');
        const settingNames = ['sms', 'email', 'push', 'reminders'];
        
        toggles.forEach((toggle, index) => {
            if (settings[settingNames[index]] !== undefined) {
                toggle.checked = settings[settingNames[index]];
            }
        });
    }
}

function startTutorial() {
    closeModal('helpModal');
    showNotification('Tutorial started! Follow the highlighted areas.', 'info');
}

function reportIssue() {
    closeModal('helpModal');
    showNotification('Issue report form opened. Describe your problem.', 'info');
}

function provideFeedback() {
    closeModal('helpModal');
    showNotification('Feedback form opened. We value your input!', 'info');
}

async function logout() {
    document.getElementById('profileDropdown').style.display = 'none';
    
    try {
        // Clear local data
        currentUser = null;
        isOrganizationView = false;
        currentQueueId = null;
        selectedService = null;
        
        // Remove from localStorage
        localStorage.removeItem('skipitUser');
        
        // Reset UI
        const loginBtn = document.querySelector('.nav-links .btn-primary');
        if (loginBtn) {
            loginBtn.textContent = 'Login';
            loginBtn.onclick = () => showAuthModal();
        }
        
        // Update profile to guest
        const profileName = document.querySelector('.profile-name');
        const profileEmail = document.querySelector('.profile-email');
        const profileAvatar = document.querySelector('.profile-avatar');
        
        if (profileName) profileName.textContent = 'Guest User';
        if (profileEmail) profileEmail.textContent = 'Not logged in';
        if (profileAvatar) profileAvatar.textContent = 'GU';
        
        // Close modals
        ['queueStatus', 'providerDashboard'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.remove();
        });
        
        showNotification('Logged out successfully', 'success');
        console.log('User logged out');
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Error logging out', 'error');
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    const profileDropdown = document.getElementById('profileDropdown');
    const notificationIcon = document.querySelector('.notification-icon');
    const profileIcon = document.querySelector('.profile-icon');
    
    if (notificationsDropdown && !notificationIcon.contains(event.target) && !notificationsDropdown.contains(event.target)) {
        notificationsDropdown.style.display = 'none';
    }
    
    if (profileDropdown && !profileIcon.contains(event.target) && !profileDropdown.contains(event.target)) {
        profileDropdown.style.display = 'none';
    }
});

// Resource Functions
function showBestPracticesGuide() {
    const modal = document.createElement('div');
    modal.id = 'bestPracticesModal';
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3>📚 Best Practices Guide</h3>
                <span class="modal-close" onclick="closeModal('bestPracticesModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="guide-content">
                    <h4>Digital Queue Management Best Practices for Indian Businesses</h4>
                    <div class="guide-section">
                        <h5>1. Pre-Implementation Planning</h5>
                        <ul>
                            <li>Analyze current queue patterns and peak hours</li>
                            <li>Identify bottlenecks in your service delivery</li>
                            <li>Train staff on digital queue management</li>
                            <li>Set up proper signage and customer guidance</li>
                        </ul>
                    </div>
                    <div class="guide-section">
                        <h5>2. Customer Communication</h5>
                        <ul>
                            <li>Provide clear instructions in Hindi and English</li>
                            <li>Use SMS notifications for queue updates</li>
                            <li>Display estimated wait times prominently</li>
                            <li>Offer multiple ways to join queues (QR, phone, app)</li>
                        </ul>
                    </div>
                    <div class="guide-section">
                        <h5>3. Staff Training</h5>
                        <ul>
                            <li>Train staff on calling customers efficiently</li>
                            <li>Implement proper handoff procedures</li>
                            <li>Monitor queue performance daily</li>
                            <li>Handle customer complaints professionally</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function showIndustryReports() {
    const modal = document.createElement('div');
    modal.id = 'reportsModal';
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3>📊 Industry Reports</h3>
                <span class="modal-close" onclick="closeModal('reportsModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="reports-list">
                    <div class="report-item">
                        <h4>Queue Management in Indian Banking Sector 2024</h4>
                        <p>Comprehensive analysis of digital queue adoption in major Indian banks</p>
                        <div class="report-stats">
                            <span class="stat">📈 65% reduction in wait times</span>
                            <span class="stat">😊 89% customer satisfaction</span>
                            <span class="stat">💰 40% cost savings</span>
                        </div>
                    </div>
                    <div class="report-item">
                        <h4>Healthcare Queue Management Trends</h4>
                        <p>Digital transformation in Indian hospitals and clinics</p>
                        <div class="report-stats">
                            <span class="stat">🏥 500+ hospitals using digital queues</span>
                            <span class="stat">⏱️ 50% faster patient processing</span>
                            <span class="stat">📱 78% prefer mobile queue joining</span>
                        </div>
                    </div>
                    <div class="report-item">
                        <h4>Government Services Digital Adoption</h4>
                        <p>Queue management in passport offices, RTOs, and other government services</p>
                        <div class="report-stats">
                            <span class="stat">🏛️ 200+ government offices</span>
                            <span class="stat">👥 2M+ citizens served</span>
                            <span class="stat">⭐ 92% approval rating</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function showVideoTutorials() {
    const modal = document.createElement('div');
    modal.id = 'videosModal';
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3>🎥 Video Tutorials</h3>
                <span class="modal-close" onclick="closeModal('videosModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="videos-grid">
                    <div class="video-item">
                        <div class="video-thumbnail">
                            <i class="fas fa-play-circle"></i>
                            <span class="video-duration">5:30</span>
                        </div>
                        <h4>Getting Started with SKIPIT</h4>
                        <p>Complete setup guide for new organizations</p>
                    </div>
                    <div class="video-item">
                        <div class="video-thumbnail">
                            <i class="fas fa-play-circle"></i>
                            <span class="video-duration">8:15</span>
                        </div>
                        <h4>Managing Multiple Queues</h4>
                        <p>How to handle different service types efficiently</p>
                    </div>
                    <div class="video-item">
                        <div class="video-thumbnail">
                            <i class="fas fa-play-circle"></i>
                            <span class="video-duration">6:45</span>
                        </div>
                        <h4>Customer Communication Best Practices</h4>
                        <p>SMS notifications and customer engagement</p>
                    </div>
                    <div class="video-item">
                        <div class="video-thumbnail">
                            <i class="fas fa-play-circle"></i>
                            <span class="video-duration">4:20</span>
                        </div>
                        <h4>Analytics Dashboard Overview</h4>
                        <p>Understanding your queue performance metrics</p>
                    </div>
                </div>
                <div class="video-note">
                    <p>💡 <strong>Note:</strong> These are demo tutorials. Full video content will be available after registration.</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}
function startLiveDemo() {
    const modal = document.createElement('div');
    modal.id = 'liveDemoModal';
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3>🚀 SKIPIT Live Demo</h3>
                <span class="modal-close" onclick="closeModal('liveDemoModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="demo-tabs">
                    <button class="tab-btn active" onclick="switchDemoTab('customer')">Customer View</button>
                    <button class="tab-btn" onclick="switchDemoTab('admin')">Admin Dashboard</button>
                </div>
                <div id="customerDemo" class="demo-tab-content active">
                    <div class="demo-simulation">
                        <h4>🏥 Apollo Hospital - General Consultation</h4>
                        <div class="demo-status">
                            <div class="demo-position">
                                <span class="label">Your Position:</span>
                                <span class="value" id="demoPosition">5</span>
                            </div>
                            <div class="demo-wait">
                                <span class="label">Estimated Wait:</span>
                                <span class="value" id="demoWait">15 minutes</span>
                            </div>
                        </div>
                        <div class="demo-progress-section">
                            <div class="progress-bar">
                                <div class="progress-fill" id="demoProgressFill" style="width: 60%"></div>
                            </div>
                            <p class="progress-text">4 people ahead of you</p>
                        </div>
                        <div class="demo-actions">
                            <button class="btn btn-secondary" onclick="simulateSwap()">🔄 Request Swap</button>
                            <button class="btn btn-secondary" onclick="simulateDelay()">⏰ Delay Position</button>
                        </div>
                    </div>
                </div>
                <div id="adminDemo" class="demo-tab-content">
                    <div class="admin-simulation">
                        <h4>📊 Queue Management Dashboard</h4>
                        <div class="admin-stats">
                            <div class="admin-stat">
                                <span class="stat-number">25</span>
                                <span class="stat-label">Active Queues</span>
                            </div>
                            <div class="admin-stat">
                                <span class="stat-number">156</span>
                                <span class="stat-label">People Waiting</span>
                            </div>
                            <div class="admin-stat">
                                <span class="stat-number">8.5</span>
                                <span class="stat-label">Avg Wait (min)</span>
                            </div>
                        </div>
                        <div class="admin-queues">
                            <div class="admin-queue-item">
                                <span class="queue-name">General Consultation</span>
                                <span class="queue-count">12 waiting</span>
                                <button class="btn btn-primary btn-small" onclick="callNextDemo()">Call Next</button>
                            </div>
                            <div class="admin-queue-item">
                                <span class="queue-name">Lab Tests</span>
                                <span class="queue-count">8 waiting</span>
                                <button class="btn btn-primary btn-small" onclick="callNextDemo()">Call Next</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="demo-footer">
                    <p>💡 This is a live simulation. Try the buttons to see real-time updates!</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    startDemoAnimation();
}

function switchDemoTab(tab) {
    document.querySelectorAll('.demo-tab-content').forEach(content => content.classList.remove('active'));
    document.querySelectorAll('.demo-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tab + 'Demo').classList.add('active');
    event.target.classList.add('active');
}

function startDemoAnimation() {
    setInterval(() => {
        const position = document.getElementById('demoPosition');
        const wait = document.getElementById('demoWait');
        const progress = document.getElementById('demoProgressFill');
        
        if (position && Math.random() < 0.3) {
            let pos = parseInt(position.textContent);
            if (pos > 1) {
                pos--;
                position.textContent = pos;
                wait.textContent = (pos * 3) + ' minutes';
                progress.style.width = ((5 - pos) / 4 * 100) + '%';
            }
        }
    }, 2000);
}

function simulateSwap() {
    showNotification('✅ Position swapped! Moved back by 1 to keep counter busy', 'success');
    const position = document.getElementById('demoPosition');
    if (position) {
        position.textContent = parseInt(position.textContent) + 1;
    }
}

function simulateDelay() {
    showNotification('⏰ Position delayed! Take your time to arrive', 'info');
    const position = document.getElementById('demoPosition');
    if (position) {
        position.textContent = parseInt(position.textContent) + 1;
    }
}

function callNextDemo() {
    showNotification('📢 Next customer called to counter', 'success');
    event.target.textContent = 'Called!';
    setTimeout(() => {
        event.target.textContent = 'Call Next';
    }, 2000);
}
function showSignupModal() {
    alert('Welcome to SKIPIT! 🎉\n\nFree 14-day trial started.\n\nYou will receive an SMS shortly with your registration link.\n\nPhone: Your registered number\nValidity: 14 days\nAll features unlocked!');
    showAuthModal();
}

function contactSales() {
    alert('Contact Sales Team\n\nEmail: sales@skipit.in\nPhone: +91-XXXX-XXXX-XXX\nWhatsApp: +91-XXXX-XXXX-XXX\n\nOur team will get back to you within 2 hours.');
}

function showProviderModal() {
    alert('Provider Dashboard\n\nManage your organization:\n✓ Multiple locations\n✓ Staff management\n✓ Queue monitoring\n✓ Analytics & Reports\n✓ Customer communication\n\nRegister your organization now!');
    showAuthModal();
}

// Pricing CTA handlers
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to pricing buttons
    const pricingButtons = document.querySelectorAll('.pricing-card .btn');
    pricingButtons.forEach(button => {
        if (button.textContent.includes('Get Started') || button.textContent.includes('Contact Sales')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                if (this.textContent.includes('Get Started')) {
                    showSignupModal();
                } else {
                    contactSales();
                }
            });
        }
    });

    // Auto-update demo queue position
    updateDemoQueue();
    setInterval(updateDemoQueue, 5000);
});

function updateDemoQueue() {
    const positionElement = document.getElementById('demo-position');
    const waitElement = document.getElementById('demo-wait');
    const progressFill = document.querySelector('.progress-fill');
    
    if (!positionElement || !waitElement) return; // Exit if elements don't exist
    
    let position = parseInt(positionElement.textContent);
    if (position > 1) {
        position--;
        positionElement.textContent = position;
        
        let wait = parseInt(waitElement.textContent);
        if (wait > 3) wait -= 2;
        waitElement.textContent = wait + ' mins';
        
        if (progressFill) {
            let newWidth = 100 - (position * 15);
            if (newWidth > 100) newWidth = 100;
            progressFill.style.width = newWidth + '%';
        }
    }
}

// Sidebar Navigation Functions
function showDashboard() {
    console.log('Dashboard clicked');
    alert('📊 Dashboard View\n\nView all your active queues and real-time metrics at a glance. Track queue positions, wait times, and service availability across locations.');
}

function toggleQueuesDropdown() {
    const dropdown = document.getElementById('queuesDropdown');
    const analyticsDropdown = document.getElementById('analyticsDropdown');
    const settingsDropdown = document.getElementById('settingsDropdown');
    
    // Close other dropdowns
    if (analyticsDropdown) analyticsDropdown.style.display = 'none';
    if (settingsDropdown) settingsDropdown.style.display = 'none';
    
    // Toggle this dropdown
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

function toggleAnalyticsDropdown() {
    const dropdown = document.getElementById('analyticsDropdown');
    const queuesDropdown = document.getElementById('queuesDropdown');
    const settingsDropdown = document.getElementById('settingsDropdown');
    
    // Close other dropdowns
    if (queuesDropdown) queuesDropdown.style.display = 'none';
    if (settingsDropdown) settingsDropdown.style.display = 'none';
    
    // Toggle this dropdown
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

function toggleSettingsDropdown() {
    const dropdown = document.getElementById('settingsDropdown');
    const queuesDropdown = document.getElementById('queuesDropdown');
    const analyticsDropdown = document.getElementById('analyticsDropdown');
    
    // Close other dropdowns
    if (queuesDropdown) queuesDropdown.style.display = 'none';
    if (analyticsDropdown) analyticsDropdown.style.display = 'none';
    
    // Toggle this dropdown
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

function showQueuesModal() {
    toggleQueuesDropdown();
}

function showAnalyticsModal() {
    toggleAnalyticsDropdown();
}

function showSettingsModal() {
    toggleSettingsDropdown();
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

function saveSettings() {
    alert('Settings saved successfully!');
    closeModal('settingsModal');
}
// ROI Calculator Function
function calculateROI() {
    const dailyCustomers = parseInt(document.getElementById('dailyCustomers').value) || 100;
    const waitTime = parseInt(document.getElementById('waitTime').value) || 15;
    const staffCount = parseInt(document.getElementById('staffCount').value) || 5;
    
    // Calculate savings based on SKIPIT's efficiency improvements
    const timeReduction = 0.65; // 65% reduction in wait time
    const timeSavedPerCustomer = waitTime * timeReduction;
    const totalTimeSavedDaily = (dailyCustomers * timeSavedPerCustomer) / 60; // in hours
    
    // Cost calculations (Indian context)
    const avgHourlyWage = 200; // Average hourly wage in India (INR)
    const dailyCostSavings = totalTimeSavedDaily * avgHourlyWage;
    const monthlyCostSavings = dailyCostSavings * 30;
    const annualSavings = monthlyCostSavings * 12;
    
    // SKIPIT subscription cost (Professional plan)
    const monthlySubscription = 2999;
    const annualSubscription = monthlySubscription * 12;
    const netAnnualSavings = annualSavings - annualSubscription;
    const roiPercentage = ((netAnnualSavings / annualSubscription) * 100).toFixed(0);
    
    // Display results
    document.getElementById('timeSaved').textContent = totalTimeSavedDaily.toFixed(1) + ' hours';
    document.getElementById('costSavings').textContent = '₹' + monthlyCostSavings.toLocaleString('en-IN');
    document.getElementById('annualROI').textContent = roiPercentage + '%';
    
    document.getElementById('roiResults').style.display = 'block';
    
    // Show success notification
    showNotification('ROI calculated successfully! See your potential savings below.', 'success');
}
// Integration Details Function
function showIntegrationDetails(type) {
    const integrations = {
        teams: {
            title: 'Microsoft Teams Integration',
            icon: 'fab fa-microsoft',
            features: [
                'Real-time queue notifications in Teams channels',
                'Automated alerts when customers arrive',
                'Staff notifications for queue management',
                'Integration with Teams calendar',
                'Custom bot commands for queue status'
            ],
            setup: 'Connect your Teams workspace in 3 simple steps',
            pricing: 'Available in Professional and Enterprise plans'
        },
        slack: {
            title: 'Slack Integration',
            icon: 'fab fa-slack',
            features: [
                'Queue updates in dedicated Slack channels',
                'Custom slash commands for queue management',
                'Automated staff notifications',
                'Integration with Slack workflows',
                'Real-time customer status updates'
            ],
            setup: 'Install SKIPIT Slack app from Slack App Directory',
            pricing: 'Available in Professional and Enterprise plans'
        },
        calendar: {
            title: 'Google Calendar Integration',
            icon: 'fas fa-calendar',
            features: [
                'Sync appointments with Google Calendar',
                'Automatic calendar blocking for queue slots',
                'Meeting reminders and notifications',
                'Staff schedule management',
                'Customer appointment confirmations'
            ],
            setup: 'Connect your Google account with OAuth 2.0',
            pricing: 'Available in all plans'
        },
        email: {
            title: 'Email Systems Integration',
            icon: 'fas fa-envelope',
            features: [
                'Automated email confirmations',
                'Queue position update emails',
                'Appointment reminder emails',
                'Custom email templates',
                'SMTP server integration'
            ],
            setup: 'Configure SMTP settings in dashboard',
            pricing: 'Available in all plans'
        },
        sms: {
            title: 'SMS Gateway Integration',
            icon: 'fas fa-mobile-alt',
            features: [
                'Multi-provider SMS support (Twilio, MSG91, TextLocal)',
                'Automated SMS notifications in Hindi/English',
                'Queue position updates via SMS',
                'Appointment reminders',
                'Custom SMS templates'
            ],
            setup: 'Connect your preferred SMS provider',
            pricing: 'SMS charges apply as per provider rates'
        },
        analytics: {
            title: 'Analytics Tools Integration',
            icon: 'fas fa-chart-bar',
            features: [
                'Export data to Google Analytics',
                'Power BI dashboard integration',
                'Custom reporting APIs',
                'Real-time data streaming',
                'Advanced metrics and KPIs'
            ],
            setup: 'API keys and webhook configuration',
            pricing: 'Available in Professional and Enterprise plans'
        }
    };

    const integration = integrations[type];
    if (!integration) return;

    const modal = document.createElement('div');
    modal.id = 'integrationModal';
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <i class="${integration.icon}" style="font-size: 24px; color: #2563eb;"></i>
                    <h3>${integration.title}</h3>
                </div>
                <span class="modal-close" onclick="closeModal('integrationModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="integration-details">
                    <div class="features-section">
                        <h4>Features & Capabilities</h4>
                        <ul class="feature-list">
                            ${integration.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="setup-section">
                        <h4>Setup Process</h4>
                        <p><i class="fas fa-cog"></i> ${integration.setup}</p>
                    </div>
                    <div class="pricing-section">
                        <h4>Pricing & Availability</h4>
                        <p><i class="fas fa-tag"></i> ${integration.pricing}</p>
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="startIntegrationSetup('${type}')">
                            <i class="fas fa-rocket"></i> Start Integration
                        </button>
                        <button class="btn btn-secondary" onclick="viewIntegrationDocs('${type}')">
                            <i class="fas fa-book"></i> View Documentation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function startIntegrationSetup(type) {
    closeModal('integrationModal');
    showNotification(`Starting ${type} integration setup...`, 'info');
    
    setTimeout(() => {
        showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} integration configured successfully!`, 'success');
    }, 2000);
}

function viewIntegrationDocs(type) {
    showNotification(`Opening ${type} integration documentation...`, 'info');
    // In a real app, this would open documentation
}
// Fixed ROI Calculator Function
function calculateROI() {
    try {
        const dailyCustomers = parseInt(document.getElementById('dailyCustomers').value) || 100;
        const waitTime = parseInt(document.getElementById('waitTime').value) || 15;
        const staffCount = parseInt(document.getElementById('staffCount').value) || 5;
        
        if (dailyCustomers <= 0 || waitTime <= 0 || staffCount <= 0) {
            showNotification('Please enter valid positive numbers', 'error');
            return;
        }
        
        const timeReduction = 0.65;
        const timeSavedPerCustomer = waitTime * timeReduction;
        const totalTimeSavedDaily = (dailyCustomers * timeSavedPerCustomer) / 60;
        
        const avgHourlyWage = 200;
        const dailyCostSavings = totalTimeSavedDaily * avgHourlyWage;
        const monthlyCostSavings = dailyCostSavings * 30;
        const annualSavings = monthlyCostSavings * 12;
        
        const monthlySubscription = 2999;
        const annualSubscription = monthlySubscription * 12;
        const netAnnualSavings = annualSavings - annualSubscription;
        const roiPercentage = ((netAnnualSavings / annualSubscription) * 100).toFixed(0);
        
        document.getElementById('timeSaved').textContent = totalTimeSavedDaily.toFixed(1) + ' hours';
        document.getElementById('costSavings').textContent = '₹' + Math.round(monthlyCostSavings).toLocaleString('en-IN');
        document.getElementById('annualROI').textContent = roiPercentage + '%';
        
        const resultsDiv = document.getElementById('roiResults');
        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        showNotification('ROI calculated successfully!', 'success');
        
    } catch (error) {
        showNotification('Error calculating ROI. Please try again.', 'error');
    }
}
// Customer Journey Orchestration Details Function
function showJourneyDetails(type) {
    const journeyFeatures = {
        routing: {
            title: 'Smart Routing System',
            icon: 'fas fa-route',
            description: 'Intelligent customer direction based on service requirements and real-time availability',
            features: [
                'Automatic service type detection based on customer input',
                'Real-time counter availability checking',
                'Priority routing for VIP customers and special needs',
                'Load balancing across multiple service counters',
                'Integration with customer history and preferences'
            ],
            benefits: [
                'Reduce customer confusion by 80%',
                'Optimize counter utilization by 45%',
                'Decrease average service time by 25%'
            ]
        },
        analytics: {
            title: 'Predictive Analytics Engine',
            icon: 'fas fa-brain',
            description: 'AI-powered forecasting and demand prediction for optimal resource planning',
            features: [
                'Historical data analysis and pattern recognition',
                'Peak hour prediction with 95% accuracy',
                'Seasonal demand forecasting',
                'Staff requirement optimization',
                'Customer behavior analytics'
            ],
            benefits: [
                'Reduce overstaffing costs by 30%',
                'Improve customer satisfaction by 40%',
                'Optimize resource allocation efficiency'
            ]
        },
        personalized: {
            title: 'Personalized Customer Experience',
            icon: 'fas fa-user-cog',
            description: 'Tailored waiting experience based on individual customer preferences and history',
            features: [
                'Customer preference learning and adaptation',
                'Personalized wait time estimates',
                'Customized notification preferences',
                'Service history tracking and recommendations',
                'Multi-language support based on customer profile'
            ],
            benefits: [
                'Increase customer loyalty by 60%',
                'Reduce complaint rates by 50%',
                'Improve overall satisfaction scores'
            ]
        },
        optimization: {
            title: 'Real-time Queue Optimization',
            icon: 'fas fa-chart-network',
            description: 'Dynamic queue management with continuous flow optimization based on live data',
            features: [
                'Live queue performance monitoring',
                'Automatic bottleneck detection and resolution',
                'Dynamic priority adjustments',
                'Real-time staff reallocation suggestions',
                'Continuous feedback loop integration'
            ],
            benefits: [
                'Reduce wait times by 65%',
                'Improve operational efficiency by 35%',
                'Enhance staff productivity metrics'
            ]
        }
    };

    const journey = journeyFeatures[type];
    if (!journey) return;

    const modal = document.createElement('div');
    modal.id = 'journeyModal';
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <i class="${journey.icon}" style="font-size: 24px; color: #2563eb;"></i>
                    <h3>${journey.title}</h3>
                </div>
                <span class="modal-close" onclick="closeModal('journeyModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="journey-details">
                    <p class="journey-description">${journey.description}</p>
                    
                    <div class="features-section">
                        <h4>Key Features</h4>
                        <ul class="feature-list">
                            ${journey.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="benefits-section">
                        <h4>Business Benefits</h4>
                        <ul class="benefit-list">
                            ${journey.benefits.map(benefit => `<li><i class="fas fa-chart-line"></i> ${benefit}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="startJourneySetup('${type}')">
                            <i class="fas fa-rocket"></i> Enable Feature
                        </button>
                        <button class="btn btn-secondary" onclick="scheduleJourneyDemo('${type}')">
                            <i class="fas fa-calendar"></i> Schedule Demo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function startJourneySetup(type) {
    closeModal('journeyModal');
    showNotification(`Setting up ${type} feature...`, 'info');
    
    setTimeout(() => {
        showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} feature enabled successfully!`, 'success');
    }, 2000);
}

function scheduleJourneyDemo(type) {
    closeModal('journeyModal');
    showNotification(`Demo scheduled for ${type} feature. Our team will contact you soon.`, 'success');
}
// Fixed Integration Setup Function
function startIntegrationSetup(type) {
    closeModal('integrationModal');
    showNotification(`🔧 Starting ${type} integration setup...`, 'info');
    
    setTimeout(() => {
        showNotification(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} integration configured successfully!`, 'success');
    }, 2000);
}

function viewIntegrationDocs(type) {
    showNotification(`📖 Opening ${type} integration documentation...`, 'info');
}
// Mobile Menu Toggle Function
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu.style.display === 'block') {
        mobileMenu.style.display = 'none';
    } else {
        mobileMenu.style.display = 'block';
    }
}
// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    
    if (mobileMenu && menuToggle && !menuToggle.contains(event.target) && !mobileMenu.contains(event.target)) {
        mobileMenu.style.display = 'none';
    }
});