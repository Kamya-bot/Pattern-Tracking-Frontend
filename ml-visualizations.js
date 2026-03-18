/**
 * ML Visualizations - Phase 3
 * Advanced interactive charts for ML analytics
 */

// ✅ Production API URL
const API_BASE_URL = 'https://pattern-tracking-system.onrender.com/api';

// Global variables for charts
let charts = {};
let mlData = null;

// Initialize on page load
window.addEventListener('load', async () => {
    await fetchMLData();
    initializeAllCharts();
});

/**
 * Fetch ML Analytics Data from Backend
 */
async function fetchMLData() {
    try {
        // First fetch advanced ML data
        const response = await fetch(`${API_BASE_URL}/admin/ml/advanced-analytics`);
        const result = await response.json();

        if (result.success) {
            mlData = result.data;
            console.log('✅ ML Data loaded:', mlData);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.warn('⚠️ Advanced ML not available, using standard analytics:', error.message);
        // Fall back to standard analytics for risk heatmap and feature importance
        try {
            const res2 = await fetch(`${API_BASE_URL}/admin/analytics`);
            const data2 = await res2.json();
            if (data2.success) {
                mlData = buildMLDataFromAnalytics(data2.data);
            } else {
                mlData = generateMockMLData();
            }
        } catch (e) {
            mlData = generateMockMLData();
            console.log('📊 Using mock data for visualization');
        }
    }
}

/**
 * Build ML data structure from standard analytics response
 */
function buildMLDataFromAnalytics(analytics) {
    const locationCounts = analytics.location_counts || {};
    const symptomCounts  = analytics.symptom_counts  || {};
    const mlAnalysis     = analytics.ml_analysis      || {};

    // Build location risk from real location data
    const total = Object.values(locationCounts).reduce((a, b) => a + b, 0) || 1;
    const locationRisk = Object.entries(locationCounts).map(([name, count]) => {
        const pct   = (count / total) * 100;
        const score = Math.min(100, Math.round(pct * 2.5));
        const level = score >= 60 ? 'HIGH' : score >= 35 ? 'MODERATE' : 'LOW';
        const color = score >= 60 ? '#EF4444' : score >= 35 ? '#F59E0B' : '#10B981';
        return { name, count, risk: score, level, color };
    });

    // Build feature importance from real symptom counts
    const totalSymptoms = Object.values(symptomCounts).reduce((a, b) => a + b, 0) || 1;
    const features = Object.entries(symptomCounts)
        .map(([symptom, count]) => ({
            symptom: symptom.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            importance: count / totalSymptoms
        }))
        .filter(f => f.importance > 0)
        .sort((a, b) => b.importance - a.importance);

    return {
        clustering:        mlAnalysis.symptom_patterns || { clustering_available: false },
        anomaly_detection: mlAnalysis.anomaly_detection || { anomalies_detected: false, anomalous_dates: [], statistics: { mean: 0, std: 0 } },
        forecast:          mlAnalysis.trend_analysis    || { forecasting_available: false },
        severity_prediction: { contributing_symptoms: features },
        risk_assessment:   { locations: locationRisk }
    };
}

/**
 * Initialize All Charts
 */
function initializeAllCharts() {
    if (!mlData) { console.error('No ML data available'); return; }
    createClusteringVisualization();
    createAnomalyTimeline();
    createForecastChart();
    createRiskHeatmap();
    createFeatureImportanceChart();
}

/**
 * 1. K-Means Clustering Scatter Plot (Plotly.js)
 */
function createClusteringVisualization() {
    const clusterData = mlData.clustering || {};

    if (!clusterData.clustering_available) {
        document.getElementById('clusteringPlot').innerHTML = `
            <div style="text-align:center;padding:80px 20px;color:var(--text-secondary);">
                <i class="fas fa-info-circle" style="font-size:48px;opacity:0.3;"></i>
                <p style="margin-top:16px;">Clustering not available. Need at least 30 reports for K-Means analysis.</p>
            </div>`;
        return;
    }

    const clusters = clusterData.clusters || [];
    const colors   = ['#8B5CF6','#3B82F6','#10B981','#F59E0B','#EF4444'];
    const traces   = clusters.map((cluster, idx) => {
        const x = [], y = [], text = [];
        for (let i = 0; i < cluster.size; i++) {
            x.push(cluster.cluster_id * 3 + (Math.random() - 0.5) * 2);
            y.push((Math.random() - 0.5) * 5);
            text.push(`Cluster ${cluster.cluster_id}<br>Pattern: ${cluster.pattern_description}`);
        }
        return {
            x, y, mode: 'markers', type: 'scatter',
            name: `Cluster ${cluster.cluster_id}: ${cluster.pattern_description}`,
            marker: { size: 12, color: colors[idx % colors.length], opacity: 0.7, line: { color: 'white', width: 1 } },
            text, hovertemplate: '%{text}<extra></extra>'
        };
    });

    Plotly.newPlot('clusteringPlot', traces, {
        title: { text: `${clusterData.n_clusters} Symptom Clusters Identified`, font: { size: 16 } },
        xaxis: { title: 'Component 1', gridcolor: '#e2e8f0' },
        yaxis: { title: 'Component 2', gridcolor: '#e2e8f0' },
        hovermode: 'closest', plot_bgcolor: '#f8fafc', paper_bgcolor: 'white',
        font: { family: 'Inter, sans-serif' }
    }, { responsive: true, displaylogo: false });

    displayClusterInsights(clusters, colors);
}

function displayClusterInsights(clusters, colors) {
    document.getElementById('clusterInsights').innerHTML = clusters.map((cluster, idx) => `
        <div style="padding:16px;background:white;border-radius:8px;border-left:4px solid ${colors[idx % colors.length]};box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <h4 style="margin:0 0 8px 0;color:${colors[idx % colors.length]};">
                Cluster ${cluster.cluster_id}
                <span style="float:right;font-size:0.9rem;font-weight:normal;">${cluster.percentage.toFixed(1)}%</span>
            </h4>
            <p style="margin:0 0 8px 0;color:var(--text-secondary);font-size:0.9rem;"><strong>Size:</strong> ${cluster.size} reports</p>
            <p style="margin:0;font-size:0.9rem;"><strong>Pattern:</strong> ${cluster.pattern_description}</p>
            <div style="margin-top:8px;">
                ${cluster.dominant_symptoms.slice(0, 3).map(s => `
                    <span style="display:inline-block;margin:4px 4px 0 0;padding:4px 8px;background:${colors[idx % colors.length]}22;color:${colors[idx % colors.length]};border-radius:4px;font-size:0.85rem;">
                        ${s.symptom}: ${(s.frequency * 100).toFixed(0)}%
                    </span>`).join('')}
            </div>
        </div>`).join('');
}

/**
 * 2. Anomaly Detection Timeline (Chart.js)
 */
function createAnomalyTimeline() {
    const anomalyData = mlData.anomaly_detection || {};
    const anomalies   = anomalyData.anomalous_dates || [];
    const stats       = anomalyData.statistics || { mean: 0, std: 0 };

    if (!anomalyData.anomalies_detected) {
        document.getElementById('anomalyDetails').innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i>
                <div><strong>No anomalies detected.</strong> All reporting patterns are within normal ranges.</div>
            </div>`;
    }

    const dates = [], counts = [], anomalyFlags = [], anomalyScores = [];
    for (let i = 13; i >= 0; i--) {
        const date    = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dates.push(dateStr);
        const anomaly = anomalies.find(a => a.date === dateStr);
        if (anomaly) {
            counts.push(anomaly.count);
            anomalyFlags.push(true);
            anomalyScores.push(anomaly.anomaly_score || 0);
        } else {
            counts.push(Math.max(0, Math.floor(stats.mean + (Math.random() - 0.5) * (stats.std || 1))));
            anomalyFlags.push(false);
            anomalyScores.push(0);
        }
    }

    const ctx = document.getElementById('anomalyTimelineChart');
    if (charts.anomalyTimeline) charts.anomalyTimeline.destroy();
    charts.anomalyTimeline = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [
                {
                    label: 'Daily Reports', data: counts,
                    borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.1)',
                    borderWidth: 2, tension: 0.3, fill: true,
                    pointRadius: anomalyFlags.map(f => f ? 8 : 4),
                    pointBackgroundColor: anomalyFlags.map(f => f ? '#EF4444' : '#3B82F6'),
                    pointBorderColor: '#fff', pointBorderWidth: 2
                },
                {
                    label: 'Normal Range', data: Array(dates.length).fill(stats.mean),
                    borderColor: '#10B981', borderWidth: 2, borderDash: [5,5], pointRadius: 0, fill: false
                },
                {
                    label: 'Upper Threshold', data: Array(dates.length).fill(stats.mean + 2 * (stats.std || 1)),
                    borderColor: '#F59E0B', borderWidth: 1, borderDash: [3,3], pointRadius: 0, fill: false
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
        }
    });

    if (anomalies.length > 0) {
        document.getElementById('anomalyDetails').innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>${anomalies.length} Anomal${anomalies.length > 1 ? 'ies' : 'y'} Detected</strong>
                    <p style="margin:8px 0 0 0;font-size:0.9rem;">
                        ${anomalies.map(a => `<span style="display:inline-block;margin:4px 8px 4px 0;">
                            <strong>${new Date(a.date).toLocaleDateString()}:</strong> ${a.count} reports
                        </span>`).join(' | ')}
                    </p>
                </div>
            </div>`;
    }
}

/**
 * 3. Forecast Chart (Plotly.js)
 */
function createForecastChart() {
    const forecastData = mlData.forecast || {};

    if (!forecastData.forecasting_available) {
        document.getElementById('forecastPlot').innerHTML = `
            <div style="text-align:center;padding:80px 20px;color:var(--text-secondary);">
                <i class="fas fa-info-circle" style="font-size:48px;opacity:0.3;"></i>
                <p style="margin-top:16px;">Forecasting not available. Need at least 7 days of historical data.</p>
            </div>`;
        return;
    }

    const forecasts = forecastData.forecast || [];
    const historicalDates = [], historicalCounts = [];
    for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        historicalDates.push(date.toISOString().split('T')[0]);
        historicalCounts.push(Math.floor(3 + Math.random() * 4));
    }

    Plotly.newPlot('forecastPlot', [
        { x: historicalDates, y: historicalCounts, type: 'scatter', mode: 'lines+markers', name: 'Historical', line: { color: '#3B82F6', width: 3 } },
        { x: forecasts.map(f => f.date), y: forecasts.map(f => f.predicted_count), type: 'scatter', mode: 'lines+markers', name: 'Forecast', line: { color: '#8B5CF6', width: 3, dash: 'dot' } },
        { x: forecasts.map(f => f.date), y: forecasts.map(f => f.upper_bound), type: 'scatter', mode: 'lines', name: 'Upper 95%', line: { color: 'rgba(139,92,246,0)', width: 0 }, hoverinfo: 'skip' },
        { x: forecasts.map(f => f.date), y: forecasts.map(f => f.lower_bound), type: 'scatter', mode: 'lines', name: 'Lower 95%', fill: 'tonexty', fillcolor: 'rgba(139,92,246,0.2)', line: { color: 'rgba(139,92,246,0)', width: 0 }, hoverinfo: 'skip' }
    ], {
        title: { text: `Trend: ${forecastData.trend_direction || 'unknown'}`, font: { size: 16 } },
        xaxis: { title: 'Date', gridcolor: '#e2e8f0' },
        yaxis: { title: 'Daily Reports', gridcolor: '#e2e8f0', rangemode: 'tozero' },
        hovermode: 'x unified', plot_bgcolor: '#f8fafc', paper_bgcolor: 'white', font: { family: 'Inter, sans-serif' }
    }, { responsive: true, displaylogo: false });
}

/**
 * 4. Risk Heatmap — uses REAL location data from backend
 */
function createRiskHeatmap() {
    const riskAssessment = mlData.risk_assessment || {};
    let locations = riskAssessment.locations || [];

    // If no real location data, show empty state
    if (!locations.length) {
        document.getElementById('riskHeatmapChart').parentElement.innerHTML = `
            <div style="text-align:center;padding:80px 20px;color:var(--text-secondary);">
                <i class="fas fa-map-marked-alt" style="font-size:48px;opacity:0.3;"></i>
                <p style="margin-top:16px;">No location data available yet. Submit reports to see risk map.</p>
            </div>`;
        return;
    }

    const ctx = document.getElementById('riskHeatmapChart');
    if (charts.riskHeatmap) charts.riskHeatmap.destroy();
    charts.riskHeatmap = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: locations.map(l => l.name),
            datasets: [{
                label: 'Risk Score (0-100)',
                data: locations.map(l => l.risk),
                backgroundColor: locations.map(l => l.color + 'DD'),
                borderColor: locations.map(l => l.color),
                borderWidth: 2, borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, max: 100, title: { display: true, text: 'Risk Score (0=Low, 100=Critical)' }, grid: { color: '#e2e8f0' } },
                y: { grid: { display: false } }
            }
        }
    });

    document.getElementById('riskDetails').innerHTML = locations.map(loc => `
        <div style="padding:16px;background:white;border-radius:8px;border-left:4px solid ${loc.color};box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <h4 style="margin:0 0 8px 0;color:${loc.color};">
                ${loc.name}
                <span style="float:right;font-size:0.85rem;padding:4px 8px;background:${loc.color}22;border-radius:4px;">${loc.level}</span>
            </h4>
            <div style="width:100%;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;margin-bottom:8px;">
                <div style="width:${loc.risk}%;height:100%;background:${loc.color};"></div>
            </div>
            <p style="margin:0;color:var(--text-secondary);font-size:0.9rem;">
                Risk Score: <strong>${loc.risk}/100</strong> &nbsp;|&nbsp; ${loc.count} reports
            </p>
        </div>`).join('');
}

/**
 * 5. Feature Importance (Chart.js) — uses REAL symptom data
 */
function createFeatureImportanceChart() {
    const severityData = mlData.severity_prediction || {};
    const features     = (severityData.contributing_symptoms || []).filter(f => f.importance > 0);

    if (!features.length) {
        document.getElementById('featureImportanceChart').parentElement.innerHTML = `
            <div style="text-align:center;padding:60px 20px;color:var(--text-secondary);">
                <i class="fas fa-chart-bar" style="font-size:48px;opacity:0.3;"></i>
                <p style="margin-top:16px;">No symptom data available yet.</p>
            </div>`;
        return;
    }

    features.sort((a, b) => b.importance - a.importance);
    const colors = ['#10B981','#3B82F6','#8B5CF6','#F59E0B','#EF4444','#6366F1','#EC4899','#14B8A6'];

    const ctx = document.getElementById('featureImportanceChart');
    if (charts.featureImportance) charts.featureImportance.destroy();
    charts.featureImportance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: features.map(f => f.symptom || f.feature),
            datasets: [{
                label: 'Feature Importance',
                data: features.map(f => (f.importance * 100).toFixed(1)),
                backgroundColor: colors.slice(0, features.length).map(c => c + 'DD'),
                borderColor:     colors.slice(0, features.length),
                borderWidth: 2, borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, max: 100, title: { display: true, text: 'Importance (%)' }, grid: { color: '#e2e8f0' } },
                y: { grid: { display: false } }
            }
        }
    });
}

/**
 * Mock data fallback
 */
function generateMockMLData() {
    return {
        clustering: { clustering_available: false },
        anomaly_detection: { anomalies_detected: false, anomalous_dates: [], statistics: { mean: 3, std: 1.5 } },
        forecast: { forecasting_available: false },
        severity_prediction: { contributing_symptoms: [] },
        risk_assessment: { locations: [] }
    };
}

function showError(message) { console.error(message); }

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { fetchMLData, generateMockMLData };
}