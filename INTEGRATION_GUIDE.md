# 🔗 FRONTEND-BACKEND INTEGRATION GUIDE

## Connecting Your HTML/JS Frontend to Flask Backend

---

## 📋 Overview

**Current State:**
- ✅ Frontend: HTML/CSS/JS (uses localStorage)
- ✅ Backend: Flask API with SQLite + ML

**Goal:**
- 🎯 Replace localStorage with real API calls
- 🎯 Display real data from database
- 🎯 Show ML analysis results

---

## 🚀 Step-by-Step Integration

### **STEP 1: Start Both Servers**

#### Terminal 1 - Backend
```bash
cd backend
python app.py
```
Backend will run on: `http://localhost:5000`

#### Terminal 2 - Frontend
```bash
cd ..
python -m http.server 8000
```
Frontend will run on: `http://localhost:8000`

---

### **STEP 2: Update Student Dashboard JavaScript**

Open `student-dashboard.html` and update the form submission:

**REPLACE THIS SECTION** (around line 240-280):

```javascript
// OLD CODE - Uses localStorage
document.getElementById('symptomForm').addEventListener('submit', function(e) {
    e.preventDefault();
    // ... localStorage code ...
});
```

**WITH THIS NEW CODE:**

```javascript
// NEW CODE - Uses Backend API
document.getElementById('symptomForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Get selected symptoms
    const selectedSymptoms = Array.from(document.querySelectorAll('.symptom-card.selected'))
        .map(card => card.dataset.symptom);

    if (selectedSymptoms.length === 0) {
        alert('Please select at least one symptom');
        return;
    }

    if (!selectedSeverity) {
        alert('Please select symptom severity');
        return;
    }

    const location = document.getElementById('location').value;
    if (!location) {
        alert('Please select your location');
        return;
    }

    // Create report object
    const report = {
        symptoms: selectedSymptoms,
        additionalSymptoms: document.getElementById('additionalSymptoms').value,
        location: location,
        severity: selectedSeverity
    };

    try {
        // Send to backend API
        const response = await fetch('http://localhost:5000/api/student/submit-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(report)
        });

        const data = await response.json();

        if (data.success) {
            // Show success message
            const successMsg = document.getElementById('successMessage');
            successMsg.classList.add('show');
            setTimeout(() => {
                successMsg.classList.remove('show');
            }, 4000);

            // Reset form
            document.querySelectorAll('.symptom-card').forEach(card => card.classList.remove('selected'));
            document.querySelectorAll('.severity-btn').forEach(btn => btn.classList.remove('selected'));
            document.getElementById('additionalSymptoms').value = '';
            document.getElementById('location').value = '';
            selectedSeverity = null;

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            alert('Error submitting report: ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to submit report. Please check if backend is running.');
    }
});
```

---

### **STEP 3: Update Admin Dashboard JavaScript**

Open `admin-dashboard.html` and update the analytics loading:

**FIND THIS SECTION** (around line 300-350):

```javascript
function initDashboard() {
    // Generate mock data if none exists
    if (!localStorage.getItem('symptomReports')) {
        generateMockData();
    }
    // ...
}
```

**REPLACE WITH:**

```javascript
async function initDashboard() {
    try {
        // Fetch real data from backend
        const response = await fetch('http://localhost:5000/api/admin/analytics');
        const result = await response.json();

        if (result.success) {
            const data = result.data;
            
            // Update overview stats
            document.getElementById('totalReports').textContent = data.overview.total_reports;
            document.getElementById('activeSymptoms').textContent = data.overview.active_symptoms;
            document.getElementById('topSymptom').textContent = data.overview.most_common_symptom;
            document.getElementById('topLocation').textContent = data.overview.peak_location;

            // Create charts with real data
            createSymptomFrequencyChart(data.symptom_counts);
            createSeverityChart(data.severity_counts);
            createTrendChart(data.daily_counts);
            createWeeklyPatternChart(data.daily_counts);
            createHotspotChart(data.symptom_counts);
            createLocationChart(data.location_counts);
            loadLocationBreakdown(data.location_counts);
            loadReportsTable();
        } else {
            console.error('Failed to load analytics:', result.error);
            alert('Failed to load analytics. Please check backend connection.');
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        alert('Backend connection failed. Please ensure Flask server is running on port 5000.');
    }
}
```

**UPDATE Chart Functions:**

```javascript
function createSymptomFrequencyChart(symptomCounts) {
    const ctx = document.getElementById('symptomFrequencyChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(symptomCounts),
            datasets: [{
                label: 'Number of Reports',
                data: Object.values(symptomCounts),
                backgroundColor: [
                    'rgba(30, 64, 175, 0.8)',
                    'rgba(8, 145, 178, 0.8)',
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(217, 119, 6, 0.8)',
                    'rgba(5, 150, 105, 0.8)',
                    'rgba(30, 64, 175, 0.8)',
                    'rgba(8, 145, 178, 0.8)',
                    'rgba(99, 102, 241, 0.8)'
                ],
                borderColor: [
                    '#1e40af', '#0891b2', '#6366f1', '#d97706',
                    '#059669', '#1e40af', '#0891b2', '#6366f1'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function createSeverityChart(severityCounts) {
    const ctx = document.getElementById('severityChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(severityCounts),
            datasets: [{
                data: Object.values(severityCounts),
                backgroundColor: [
                    'rgba(5, 150, 105, 0.8)',   // Mild - Green
                    'rgba(217, 119, 6, 0.8)',   // Moderate - Orange
                    'rgba(220, 38, 38, 0.8)'    // Severe - Red
                ],
                borderColor: ['#059669', '#d97706', '#dc2626'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: { size: 14, weight: 600 }
                    }
                }
            }
        }
    });
}

function createTrendChart(dailyCounts) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    // Prepare data
    const sortedDates = Object.keys(dailyCounts).sort();
    const counts = sortedDates.map(date => dailyCounts[date]);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: [{
                label: 'Daily Reports',
                data: counts,
                borderColor: '#1e40af',
                backgroundColor: 'rgba(30, 64, 175, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#1e40af',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function createLocationChart(locationCounts) {
    const ctx = document.getElementById('locationChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(locationCounts),
            datasets: [{
                label: 'Number of Reports',
                data: Object.values(locationCounts),
                backgroundColor: 'rgba(8, 145, 178, 0.8)',
                borderColor: '#0891b2',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                y: { grid: { display: false } }
            }
        }
    });
}

function loadLocationBreakdown(locationCounts) {
    const total = Object.values(locationCounts).reduce((a, b) => a + b, 0);
    
    const html = Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([location, count]) => {
            const percentage = ((count / total) * 100).toFixed(1);
            return `
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-weight: 600; color: var(--text-primary);">
                            <i class="fas fa-building" style="color: #0891b2; margin-right: 8px;"></i>
                            ${location}
                        </span>
                        <span style="color: var(--text-secondary);">${count} reports (${percentage}%)</span>
                    </div>
                    <div style="background: #e2e8f0; height: 12px; border-radius: 6px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #0891b2, #06b6d4); height: 100%; width: ${percentage}%; 
                                    border-radius: 6px; transition: width 0.5s ease;"></div>
                    </div>
                </div>
            `;
        }).join('');
    
    document.getElementById('locationBreakdown').innerHTML = html;
}

async function loadReportsTable() {
    try {
        const response = await fetch('http://localhost:5000/api/admin/reports?limit=20');
        const result = await response.json();
        
        if (result.success) {
            const tbody = document.getElementById('reportsTableBody');
            const reports = result.data;
            
            if (reports.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                            <i class="fas fa-inbox" style="font-size: 48px; display: block; margin-bottom: 15px; opacity: 0.3;"></i>
                            No reports available yet
                        </td>
                    </tr>
                `;
                return;
            }
            
            tbody.innerHTML = reports.map(r => {
                const time = new Date(r.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                return `
                    <tr>
                        <td style="font-weight: 600;">${r.date}</td>
                        <td><i class="fas fa-map-marker-alt" style="color: #0891b2; margin-right: 5px;"></i> ${r.location}</td>
                        <td>${r.symptoms.join(', ')}</td>
                        <td><span class="badge badge-${r.severity.toLowerCase()}">${r.severity}</span></td>
                        <td style="color: var(--text-secondary);">${time}</td>
                    </tr>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading reports:', error);
    }
}
```

---

### **STEP 4: Testing the Integration**

#### 1. Test Backend First
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "ml_engine": "initialized"
}
```

#### 2. Seed Sample Data
```bash
curl -X POST http://localhost:5000/api/seed-database
```

#### 3. Test Student Submission
Open: `http://localhost:8000/student-login.html`
- Login with any credentials
- Select symptoms
- Submit report
- Check browser console for success

#### 4. Test Admin Analytics
Open: `http://localhost:8000/admin-login.html`
- Login with any credentials
- View dashboard
- Charts should load with real data
- Check ML analysis results

---

### **STEP 5: Verify CORS is Working**

If you see CORS errors in browser console:

1. Check `backend/config.py` - make sure your frontend URL is listed:
```python
CORS_ORIGINS = [
    'http://localhost:8000',
    'http://127.0.0.1:8000',
]
```

2. Restart Flask server

---

### **STEP 6: Add ML Analysis Display (Optional)**

Add this section to admin dashboard to show ML insights:

```html
<!-- ML Analysis Section -->
<section id="ml-analysis" style="margin-top: 40px;">
    <div class="card">
        <div class="card-header">
            <div class="card-title">
                <i class="fas fa-brain"></i>
                Machine Learning Insights
            </div>
        </div>
        <div id="mlInsights"></div>
    </div>
</section>
```

Add JavaScript to fetch and display ML analysis:

```javascript
async function displayMLInsights() {
    try {
        const response = await fetch('http://localhost:5000/api/admin/analytics');
        const result = await response.json();
        
        if (result.success && result.data.ml_analysis) {
            const ml = result.data.ml_analysis;
            
            let html = '<div style="padding: 20px;">';
            
            // Anomaly Detection
            if (ml.anomaly_detection.anomalies_detected) {
                html += `
                    <div style="background: rgba(220, 38, 38, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #dc2626;">
                        <h4 style="color: #dc2626; margin-bottom: 10px;">
                            <i class="fas fa-exclamation-triangle"></i> Anomalies Detected
                        </h4>
                        <p>Found ${ml.anomaly_detection.total_anomalies} unusual spike(s) in report submissions.</p>
                    </div>
                `;
            }
            
            // Trend Analysis
            html += `
                <div style="background: rgba(30, 64, 175, 0.05); padding: 20px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #1e40af;">
                    <h4 style="color: #1e40af; margin-bottom: 10px;">
                        <i class="fas fa-chart-line"></i> Trend Analysis
                    </h4>
                    <p>Trend: <strong>${ml.trend_analysis.trend}</strong> (${ml.trend_analysis.direction})</p>
                    <p>Change Rate: <strong>${ml.trend_analysis.change_rate_percent.toFixed(1)}%</strong></p>
                </div>
            `;
            
            // Severity Alert
            const alert = ml.severity_analysis;
            const alertColors = {
                'critical': '#dc2626',
                'warning': '#d97706',
                'normal': '#059669'
            };
            const alertColor = alertColors[alert.alert_level];
            
            html += `
                <div style="background: rgba(${alert.alert_level === 'critical' ? '220, 38, 38' : alert.alert_level === 'warning' ? '217, 119, 6' : '5, 150, 105'}, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid ${alertColor};">
                    <h4 style="color: ${alertColor}; margin-bottom: 10px;">
                        <i class="fas fa-heartbeat"></i> Severity Alert Level: ${alert.alert_level.toUpperCase()}
                    </h4>
                    <ul style="margin-top: 10px;">
                        ${alert.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            `;
            
            html += '</div>';
            document.getElementById('mlInsights').innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading ML insights:', error);
    }
}

// Call in initDashboard()
window.addEventListener('load', () => {
    initDashboard();
    displayMLInsights();
});
```

---

## 🎉 Integration Complete!

Your system now:
- ✅ Submits real data to backend
- ✅ Stores data in SQLite database
- ✅ Performs ML analysis
- ✅ Displays real analytics
- ✅ Shows ML insights

---

## 🐛 Troubleshooting

### Error: "Failed to fetch"
- Backend not running → Start Flask server
- Wrong port → Check backend is on port 5000
- CORS issue → Add your frontend URL to config.py

### Error: "No data available"
- Database empty → Run seed endpoint
- Check backend logs for errors

### Charts not showing
- Data format mismatch → Check console logs
- Chart.js not loaded → Check CDN link

---

## 📊 Testing Checklist

- [ ] Backend runs without errors
- [ ] Frontend can submit reports
- [ ] Admin sees real data in charts
- [ ] ML analysis shows up
- [ ] No CORS errors in console
- [ ] Database grows with submissions
- [ ] Export function works

---

**You now have a fully integrated, ML-powered health tracking system!** 🚀
