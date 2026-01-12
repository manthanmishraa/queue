// Analytics Dashboard & Appointment Integration

let currentPatient = null;
let scheduledAppointments = [
    { name: 'Rajesh Kumar', phone: '+91 9876543210', time: '14:00', service: 'General Consultation', inserted: false },
    { name: 'Priya Sharma', phone: '+91 9988776655', time: '14:30', service: 'Lab Tests', inserted: false },
    { name: 'Amit Singh', phone: '+91 9123456789', time: '15:00', service: 'X-Ray', inserted: false }
];

// Initialize appointment monitor
function startAppointmentMonitor() {
    setInterval(() => {
        const now = new Date();
        const currentTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        scheduledAppointments.forEach(apt => {
            if (!apt.inserted) {
                const insertTime = calculateInsertTime(apt.time);
                if (currentTime === insertTime) {
                    insertAppointmentIntoQueue(apt);
                }
            }
        });
    }, 30000);
}

function calculateInsertTime(appointmentTime) {
    const [hours, minutes] = appointmentTime.split(':');
    const insertMinutes = parseInt(minutes) - 5;
    const insertHours = insertMinutes < 0 ? parseInt(hours) - 1 : hours;
    const finalMinutes = insertMinutes < 0 ? 60 + insertMinutes : insertMinutes;
    return `${insertHours}:${finalMinutes.toString().padStart(2, '0')}`;
}

function insertAppointmentIntoQueue(appointment) {
    appointment.inserted = true;
    if (isOrganizationView) {
        showNotification(
            `📅 Scheduled: ${appointment.name} auto-inserted into ${appointment.service} queue`,
            'info'
        );
    }
    loadAppointmentsTable();
}

function showAnalyticsDashboard() {
    closeModal('providerModal');
    
    const dashboard = document.createElement('div');
    dashboard.id = 'analyticsDashboard';
    dashboard.className = 'analytics-dashboard';
    dashboard.innerHTML = `
        <div class="dashboard-header">
            <h2>📊 Analytics Dashboard - Charitable Hospital Mohali</h2>
            <button class="btn btn-secondary" onclick="closeAnalyticsDashboard()">Close</button>
        </div>
        <div class="dashboard-content">
            <div class="analytics-section">
                <h3>Staff Performance</h3>
                <div class="staff-grid">
                    <div class="staff-card">
                        <div class="staff-info">
                            <h4>Dr. Sharma</h4>
                            <p>General Consultation</p>
                        </div>
                        <div class="staff-stats">
                            <div class="stat-item">
                                <span class="stat-label">Avg Service Time</span>
                                <span class="stat-value">8.5 min</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Patients Served</span>
                                <span class="stat-value">45</span>
                            </div>
                            <div class="performance-badge good">Excellent</div>
                        </div>
                    </div>
                    <div class="staff-card">
                        <div class="staff-info">
                            <h4>Lab Tech - Ravi</h4>
                            <p>Lab Tests</p>
                        </div>
                        <div class="staff-stats">
                            <div class="stat-item">
                                <span class="stat-label">Avg Service Time</span>
                                <span class="stat-value">12.3 min</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Patients Served</span>
                                <span class="stat-value">32</span>
                            </div>
                            <div class="performance-badge average">Good</div>
                        </div>
                    </div>
                    <div class="staff-card">
                        <div class="staff-info">
                            <h4>X-Ray Tech - Neha</h4>
                            <p>X-Ray Department</p>
                        </div>
                        <div class="staff-stats">
                            <div class="stat-item">
                                <span class="stat-label">Avg Service Time</span>
                                <span class="stat-value">15.7 min</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Patients Served</span>
                                <span class="stat-value">28</span>
                            </div>
                            <div class="performance-badge average">Good</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="analytics-section">
                <h3>Queue Abandonment Rate</h3>
                <div class="abandonment-grid">
                    <div class="abandonment-card">
                        <div class="abandonment-stat">
                            <div class="big-number">8.5%</div>
                            <div class="stat-label">Overall Abandonment Rate</div>
                        </div>
                        <div class="trend-indicator down">
                            <i class="fas fa-arrow-down"></i> 2.3% from last week
                        </div>
                    </div>
                    <div class="abandonment-card">
                        <div class="abandonment-stat">
                            <div class="big-number">23</div>
                            <div class="stat-label">People Left Today</div>
                        </div>
                        <div class="reason-list">
                            <div>Long wait: 12</div>
                            <div>Emergency: 6</div>
                            <div>Other: 5</div>
                        </div>
                    </div>
                    <div class="abandonment-card">
                        <div class="abandonment-stat">
                            <div class="big-number">18 min</div>
                            <div class="stat-label">Avg Wait Before Leaving</div>
                        </div>
                        <div class="insight">💡 Most leave after 15-20 min wait</div>
                    </div>
                </div>
            </div>

            <div class="analytics-section">
                <h3>Scheduled Appointments Integration</h3>
                <div class="appointments-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Appointment Time</th>
                                <th>Service</th>
                                <th>Status</th>
                                <th>Auto-Insert Time</th>
                            </tr>
                        </thead>
                        <tbody id="appointmentsTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(dashboard);
    loadAppointmentsTable();
}

function closeAnalyticsDashboard() {
    const dashboard = document.getElementById('analyticsDashboard');
    if (dashboard) dashboard.remove();
}

function loadAppointmentsTable() {
    const tbody = document.getElementById('appointmentsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = scheduledAppointments.map(apt => {
        const status = apt.inserted ? 
            '<span class="status-badge inserted">✓ In Queue</span>' : 
            '<span class="status-badge pending">⏳ Scheduled</span>';
        
        const insertTime = apt.inserted ? 'Inserted' : calculateInsertTime(apt.time);
        
        return `
            <tr>
                <td>${apt.name}</td>
                <td>${apt.time}</td>
                <td>${apt.service}</td>
                <td>${status}</td>
                <td>${insertTime}</td>
            </tr>
        `;
    }).join('');
}

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
    showNotification(`${currentPatient.name} service completed!`, 'success');
    currentPatient = null;
}

function completeWithHandoff() {
    const nextService = document.getElementById('nextService').value;
    if (!nextService) {
        showNotification('Please select next service', 'error');
        return;
    }

    closeModal('completeServiceModal');
    showNotification(`Completing service for ${currentPatient.name}...`, 'info');
    
    setTimeout(() => {
        showNotification(`✅ ${currentPatient.name} added to ${nextService} queue!`, 'success');
        setTimeout(() => notifyUserHandoff(nextService), 1000);
        currentPatient = null;
        document.getElementById('nextService').value = '';
        document.getElementById('handoffOptions').style.display = 'none';
    }, 1500);
}

function notifyUserHandoff(nextService) {
    const notification = document.createElement('div');
    notification.className = 'notification handoff-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div style="display: flex; align-items: center; gap: 15px;">
                <i class="fas fa-arrow-right" style="font-size: 24px; color: #10b981;"></i>
                <div>
                    <strong style="display: block; margin-bottom: 5px; color: #10b981;">Service Completed!</strong>
                    <span>You've been added to <strong>${nextService}</strong> queue. Position: 3</span>
                </div>
            </div>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    document.body.appendChild(notification);

    const queueStatus = document.getElementById('queueStatus');
    if (queueStatus) {
        const header = queueStatus.querySelector('.queue-header h3');
        if (header) header.textContent = `${nextService} - Charitable Hospital Mohali`;
        document.getElementById('currentPosition').textContent = '3';
        document.getElementById('estimatedWait').textContent = '9 minutes';
        document.getElementById('progressFill').style.width = '40%';
    }

    setTimeout(() => { if (notification.parentElement) notification.remove(); }, 8000);
}
