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
    const phone = document.getElementById('customerPhone').value;

    // Validate Indian phone number (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
        showNotification('Please enter a valid 10-digit Indian phone number', 'error');
        return;
    }

    try {
        // Simulate API call
        showNotification('OTP sent to +91' + phone, 'success');
        // In real app, this would send OTP and show verification input
        setTimeout(() => {
            currentUser = { type: 'customer', phone: '+91' + phone };
            closeModal('authModal');
            showNotification('Login successful!', 'success');
            updateUIForUser();
        }, 1000);
    } catch (error) {
        showNotification('Login failed. Please try again.', 'error');
    }
}

async function handleProviderLogin(e) {
    e.preventDefault();
    const email = document.getElementById('providerEmail').value;
    const password = document.getElementById('providerPassword').value;

    try {
        // Simulate API call
        showNotification('Logging in...', 'info');
        setTimeout(() => {
            currentUser = { type: 'provider', email: email };
            isOrganizationView = true;
            closeModal('authModal');
            showNotification('Provider login successful! Waiting for queue requests...', 'success');
            updateUIForUser();
        }, 1000);
    } catch (error) {
        showNotification('Login failed. Please check your credentials.', 'error');
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
    document.getElementById('qrScanModal').style.display = 'block';
    startQRScanner();
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
    showNotification('QR Code detected! Sending request...', 'info');
    
    setTimeout(() => {
        const randomService = generateIndianServices()[0];
        closeModal('qrScanModal');
        selectedService = { id: randomService.id, name: randomService.name };
        currentQueueId = 'Q' + Date.now();
        sendQueueRequest(randomService.name);
        showNotification('Request sent! Waiting for approval...', 'info');
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
        // Simulate swap - move position back by 1
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
        
        // Disable swap button after use
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
        // Move position back by 1
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
        
        // Re-enable after 2 minutes for another delay if needed
        setTimeout(() => {
            delayBtn.disabled = false;
            delayBtn.innerHTML = '<i class="fas fa-clock"></i> Push Me 1 Person Back';
            delayBtn.style.background = '';
            delayBtn.style.color = '';
        }, 120000); // 2 minutes
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

function checkAuthStatus() {
    // Check if user is logged in (from localStorage in real app)
    // For demo purposes, we'll keep it simple
}

// Demo data loading
function loadDemoData() {
    // Animate demo position
    setInterval(() => {
        const demoPos = document.getElementById('demo-position');
        const demoWait = document.getElementById('demo-wait');
        const progressFill = document.querySelector('.progress-fill');

        let pos = parseInt(demoPos.textContent);
        if (Math.random() < 0.3 && pos > 1) {
            pos--;
            demoPos.textContent = pos;
            const wait = pos * 3;
            demoWait.textContent = wait + ' mins';
            const progress = ((5 - pos) / 4) * 100;
            progressFill.style.width = progress + '%';
        }
    }, 3000);
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