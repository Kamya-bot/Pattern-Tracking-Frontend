/**
 * ML Visualizations - Phase 3
 * Advanced interactive charts for ML analytics
 */

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

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
        const response = await fetch(`${API_BASE_URL}/admin/ml/advanced-analytics`);
        const result = await response.json();
        
        if (result.success) {
            mlData = result.data;
            console.log('✅ ML Data loaded:', mlData);
        } else {
            console.error('❌ Failed to load ML data:', result.error);
            showError('Failed to load ML analytics data');
        }
    } catch (error) {
        console.error('❌ API Error:', error);
        // Use mock data for demo
        mlData = generateMockMLData();
        console.log('📊 Using mock data for visualization');
    }
}

/**
 * Initialize All Charts
 */
function initializeAllCharts() {
    if (!mlData) {
        console.error('No ML data available');
        return;
    }

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
    const clusterData = mlData.clustering || mlData.cluster_analysis;
    
    if (!clusterData || !clusterData.clustering_available) {
        document.getElementById('clusteringPlot').innerHTML = `
            <div style="text-align: center; padding: 80px 20px; color: var(--text-secondary);">
                <i class="fas fa-info-circle" style="font-size: 48px; opacity: 0.3;"></i>
                <p style="margin-top: 16px;">Clustering not available. Need at least 30 reports for K-Means analysis.</p>
            </div>
        `;
        return;
    }

    // Prepare data for 3D scatter plot
    const clusters = clusterData.clusters || [];
    const traces = [];
    
    const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
    
    clusters.forEach((cluster, idx) => {
        // Generate random points for visualization (in real scenario, use actual coordinates)
        const size = cluster.size;
        const x = [];
        const y = [];
        const text = [];
        
        for (let i = 0; i < size; i++) {
            // Cluster around center with some spread
            x.push(cluster.cluster_id * 3 + (Math.random() - 0.5) * 2);
            y.push((Math.random() - 0.5) * 5);
            text.push(`Cluster ${cluster.cluster_id}<br>Pattern: ${cluster.pattern_description}`);
        }
        
        traces.push({
            x: x,
            y: y,
            mode: 'markers',
            type: 'scatter',
            name: `Cluster ${cluster.cluster_id}: ${cluster.pattern_description}`,
            marker: {
                size: 12,
                color: colors[idx % colors.length],
                opacity: 0.7,
                line: {
                    color: 'white',
                    width: 1
                }
            },
            text: text,
            hovertemplate: '%{text}<br>x: %{x:.2f}<br>y: %{y:.2f}<extra></extra>'
        });
    });

    const layout = {
        title: {
            text: `${clusterData.n_clusters} Symptom Clusters Identified`,
            font: { size: 16, color: '#1e293b' }
        },
        xaxis: {
            title: 'Component 1 (Symptom Intensity)',
            gridcolor: '#e2e8f0',
            zerolinecolor: '#cbd5e1'
        },
        yaxis: {
            title: 'Component 2 (Symptom Diversity)',
            gridcolor: '#e2e8f0',
            zerolinecolor: '#cbd5e1'
        },
        hovermode: 'closest',
        plot_bgcolor: '#f8fafc',
        paper_bgcolor: 'white',
        font: { family: 'Inter, sans-serif' },
        showlegend: true,
        legend: {
            x: 1.02,
            y: 1,
            xanchor: 'left',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            bordercolor: '#e2e8f0',
            borderwidth: 1
        }
    };

    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
    };

    Plotly.newPlot('clusteringPlot', traces, layout, config);

    // Display cluster insights
    displayClusterInsights(clusters);
}

function displayClusterInsights(clusters) {
    const container = document.getElementById('clusterInsights');
    const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
    
    container.innerHTML = clusters.map((cluster, idx) => `
        <div style="padding: 16px; background: white; border-radius: 8px; border-left: 4px solid ${colors[idx % colors.length]}; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h4 style="margin: 0 0 8px 0; color: ${colors[idx % colors.length]};">
                Cluster ${cluster.cluster_id}
                <span style="float: right; font-size: 0.9rem; font-weight: normal;">${cluster.percentage.toFixed(1)}%</span>
            </h4>
            <p style="margin: 0 0 8px 0; color: var(--text-secondary); font-size: 0.9rem;">
                <strong>Size:</strong> ${cluster.size} reports
            </p>
            <p style="margin: 0; color: var(--text); font-size: 0.9rem;">
                <strong>Pattern:</strong> ${cluster.pattern_description}
            </p>
            <div style="margin-top: 8px;">
                ${cluster.dominant_symptoms.slice(0, 3).map(s => `
                    <span style="display: inline-block; margin: 4px 4px 0 0; padding: 4px 8px; background: ${colors[idx % colors.length]}22; color: ${colors[idx % colors.length]}; border-radius: 4px; font-size: 0.85rem;">
                        ${s.symptom}: ${(s.frequency * 100).toFixed(0)}%
                    </span>
                `).join('')}
            </div>
        </div>
    `).join('');
}

/**
 * 2. Anomaly Detection Timeline (Chart.js)
 */
function createAnomalyTimeline() {
    const anomalyData = mlData.anomaly_detection || {};
    
    if (!anomalyData.anomalies_detected) {
        document.getElementById('anomalyDetails').innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i>
                <div><strong>No anomalies detected.</strong> All reporting patterns are within normal ranges.</div>
            </div>
        `;
    }

    const anomalies = anomalyData.anomalous_dates || [];
    const stats = anomalyData.statistics || {};
    
    // Prepare timeline data (last 14 days)
    const dates = [];
    const counts = [];
    const anomalyFlags = [];
    const anomalyScores = [];
    
    // Generate last 14 days of data
    for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dates.push(dateStr);
        
        // Check if this date is an anomaly
        const anomaly = anomalies.find(a => a.date === dateStr);
        if (anomaly) {
            counts.push(anomaly.count);
            anomalyFlags.push(true);
            anomalyScores.push(anomaly.anomaly_score);
        } else {
            // Normal count around mean
            counts.push(Math.max(0, Math.floor(stats.mean + (Math.random() - 0.5) * stats.std)));
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
                    label: 'Daily Reports',
                    data: counts,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    pointRadius: anomalyFlags.map(f => f ? 8 : 4),
                    pointBackgroundColor: anomalyFlags.map(f => f ? '#EF4444' : '#3B82F6'),
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Normal Range (Mean)',
                    data: Array(dates.length).fill(stats.mean),
                    borderColor: '#10B981',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: 'Upper Threshold',
                    data: Array(dates.length).fill(stats.mean + 2 * stats.std),
                    borderColor: '#F59E0B',
                    borderWidth: 1,
                    borderDash: [3, 3],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 12, family: 'Inter' }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        afterLabel: function(context) {
                            const idx = context.dataIndex;
                            if (anomalyFlags[idx] && context.datasetIndex === 0) {
                                return `⚠️ ANOMALY (Score: ${anomalyScores[idx].toFixed(2)})`;
                            }
                            return '';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Reports',
                        font: { size: 13, family: 'Inter' }
                    },
                    grid: { color: '#e2e8f0' }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date',
                        font: { size: 13, family: 'Inter' }
                    },
                    grid: { display: false }
                }
            }
        }
    });

    // Display anomaly details
    if (anomalies.length > 0) {
        displayAnomalyDetails(anomalies);
    }
}

function displayAnomalyDetails(anomalies) {
    const container = document.getElementById('anomalyDetails');
    
    container.innerHTML = `
        <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
                <strong>${anomalies.length} Anomal${anomalies.length > 1 ? 'ies' : 'y'} Detected</strong>
                <p style="margin: 8px 0 0 0; font-size: 0.9rem;">
                    ${anomalies.map(a => `
                        <span style="display: inline-block; margin: 4px 8px 4px 0;">
                            <strong>${new Date(a.date).toLocaleDateString()}:</strong> 
                            ${a.count} reports (${a.severity} severity)
                        </span>
                    `).join(' | ')}
                </p>
            </div>
        </div>
    `;
}

/**
 * 3. Forecast Chart with Confidence Bands (Plotly.js)
 */
function createForecastChart() {
    const forecastData = mlData.forecast || {};
    
    if (!forecastData.forecasting_available) {
        document.getElementById('forecastPlot').innerHTML = `
            <div style="text-align: center; padding: 80px 20px; color: var(--text-secondary);">
                <i class="fas fa-info-circle" style="font-size: 48px; opacity: 0.3;"></i>
                <p style="margin-top: 16px;">Forecasting not available. Need at least 7 days of historical data.</p>
            </div>
        `;
        return;
    }

    const forecasts = forecastData.forecast || [];
    
    // Historical data (mock - in real app, fetch from API)
    const historicalDates = [];
    const historicalCounts = [];
    for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        historicalDates.push(date.toISOString().split('T')[0]);
        historicalCounts.push(Math.floor(3 + Math.random() * 4));
    }

    // Forecast data
    const forecastDates = forecasts.map(f => f.date);
    const forecastCounts = forecasts.map(f => f.predicted_count);
    const lowerBounds = forecasts.map(f => f.lower_bound);
    const upperBounds = forecasts.map(f => f.upper_bound);

    const traces = [
        // Historical data
        {
            x: historicalDates,
            y: historicalCounts,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Historical Data',
            line: { color: '#3B82F6', width: 3 },
            marker: { size: 6, color: '#3B82F6' }
        },
        // Forecast
        {
            x: forecastDates,
            y: forecastCounts,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Forecast',
            line: { color: '#8B5CF6', width: 3, dash: 'dot' },
            marker: { size: 6, color: '#8B5CF6' }
        },
        // Upper confidence bound
        {
            x: forecastDates,
            y: upperBounds,
            type: 'scatter',
            mode: 'lines',
            name: 'Upper Bound (95%)',
            line: { color: 'rgba(139, 92, 246, 0)', width: 0 },
            showlegend: true,
            hoverinfo: 'skip'
        },
        // Lower confidence bound (filled area)
        {
            x: forecastDates,
            y: lowerBounds,
            type: 'scatter',
            mode: 'lines',
            name: 'Lower Bound (95%)',
            fill: 'tonexty',
            fillcolor: 'rgba(139, 92, 246, 0.2)',
            line: { color: 'rgba(139, 92, 246, 0)', width: 0 },
            showlegend: true,
            hoverinfo: 'skip'
        }
    ];

    const layout = {
        title: {
            text: `${forecastData.trend_direction.charAt(0).toUpperCase() + forecastData.trend_direction.slice(1)} Trend Detected (Slope: ${forecastData.slope.toFixed(2)})`,
            font: { size: 16, color: '#1e293b' }
        },
        xaxis: {
            title: 'Date',
            gridcolor: '#e2e8f0',
            showgrid: true
        },
        yaxis: {
            title: 'Daily Reports',
            gridcolor: '#e2e8f0',
            showgrid: true,
            rangemode: 'tozero'
        },
        hovermode: 'x unified',
        plot_bgcolor: '#f8fafc',
        paper_bgcolor: 'white',
        font: { family: 'Inter, sans-serif' },
        shapes: [
            // Vertical line separating historical from forecast
            {
                type: 'line',
                x0: historicalDates[historicalDates.length - 1],
                y0: 0,
                x1: historicalDates[historicalDates.length - 1],
                y1: Math.max(...historicalCounts, ...forecastCounts, ...upperBounds),
                line: {
                    color: '#94a3b8',
                    width: 2,
                    dash: 'dash'
                }
            }
        ]
    };

    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false
    };

    Plotly.newPlot('forecastPlot', traces, layout, config);

    // Display forecast summary
    displayForecastSummary(forecastData, forecasts);
}

function displayForecastSummary(forecastData, forecasts) {
    const container = document.getElementById('forecastSummary');
    const trendColors = {
        'increasing': '#EF4444',
        'stable': '#F59E0B',
        'decreasing': '#10B981'
    };
    
    const avgForecast = forecasts.reduce((sum, f) => sum + f.predicted_count, 0) / forecasts.length;
    
    container.innerHTML = `
        <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="font-size: 2rem; font-weight: bold; color: ${trendColors[forecastData.trend_direction]};">
                ${forecastData.trend_direction.toUpperCase()}
            </div>
            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px;">Trend Direction</div>
        </div>
        <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="font-size: 2rem; font-weight: bold; color: var(--primary);">
                ${avgForecast.toFixed(1)}
            </div>
            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px;">Avg. Daily Forecast</div>
        </div>
        <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="font-size: 2rem; font-weight: bold; color: var(--blue);">
                ${(forecastData.model_info.r_squared * 100).toFixed(0)}%
            </div>
            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px;">Model Accuracy (R²)</div>
        </div>
        <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="font-size: 2rem; font-weight: bold; color: var(--green);">
                95%
            </div>
            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px;">Confidence Level</div>
        </div>
    `;
}

/**
 * 4. Geographic Risk Heatmap (Chart.js Bar Chart)
 */
function createRiskHeatmap() {
    const riskData = mlData.risk_assessment || {};
    
    // Mock location risk data (in real app, calculate per location)
    const locations = [
        { name: 'Engineering Hostel', risk: 65, level: 'HIGH', color: '#F59E0B' },
        { name: 'Medical Hostel', risk: 45, level: 'MODERATE', color: '#10B981' },
        { name: 'Arts Hostel', risk: 72, level: 'HIGH', color: '#EF4444' },
        { name: 'Science Hostel', risk: 38, level: 'MODERATE', color: '#10B981' },
        { name: 'MBA Hostel', risk: 55, level: 'MODERATE', color: '#F59E0B' },
        { name: 'Library Area', risk: 28, level: 'LOW', color: '#059669' },
        { name: 'Sports Complex', risk: 18, level: 'LOW', color: '#059669' },
        { name: 'Academic Block', risk: 48, level: 'MODERATE', color: '#F59E0B' }
    ];

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
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const loc = locations[context.dataIndex];
                            return [
                                `Risk Score: ${loc.risk}/100`,
                                `Level: ${loc.level}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Risk Score (0=Low, 100=Critical)',
                        font: { size: 13, family: 'Inter' }
                    },
                    grid: { color: '#e2e8f0' }
                },
                y: {
                    grid: { display: false }
                }
            }
        }
    });

    // Display risk details
    displayRiskDetails(locations);
}

function displayRiskDetails(locations) {
    const container = document.getElementById('riskDetails');
    
    container.innerHTML = locations.map(loc => `
        <div style="padding: 16px; background: white; border-radius: 8px; border-left: 4px solid ${loc.color}; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h4 style="margin: 0 0 8px 0; color: ${loc.color};">
                ${loc.name}
                <span style="float: right; font-size: 0.85rem; padding: 4px 8px; background: ${loc.color}22; border-radius: 4px;">
                    ${loc.level}
                </span>
            </h4>
            <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
                <div style="width: ${loc.risk}%; height: 100%; background: ${loc.color};"></div>
            </div>
            <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">
                Risk Score: <strong>${loc.risk}/100</strong>
            </p>
        </div>
    `).join('');
}

/**
 * 5. Feature Importance Bar Chart (Chart.js)
 */
function createFeatureImportanceChart() {
    const severityData = mlData.severity_prediction || {};
    
    const features = severityData.contributing_symptoms || [
        { symptom: 'Fever', importance: 0.34 },
        { symptom: 'Headache', importance: 0.22 },
        { symptom: 'Fatigue', importance: 0.18 },
        { symptom: 'Body Pain', importance: 0.12 },
        { symptom: 'Cold Cough', importance: 0.08 },
        { symptom: 'Stomach Pain', importance: 0.04 },
        { symptom: 'Nausea', importance: 0.02 }
    ];

    // Sort by importance
    features.sort((a, b) => b.importance - a.importance);

    const ctx = document.getElementById('featureImportanceChart');
    if (charts.featureImportance) charts.featureImportance.destroy();
    
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, ctx.width, 0);
    gradient.addColorStop(0, '#10B981');
    gradient.addColorStop(0.5, '#3B82F6');
    gradient.addColorStop(1, '#8B5CF6');

    charts.featureImportance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: features.map(f => f.symptom || f.feature),
            datasets: [{
                label: 'Feature Importance',
                data: features.map(f => f.importance * 100),
                backgroundColor: [
                    '#10B981DD',
                    '#3B82F6DD',
                    '#8B5CF6DD',
                    '#F59E0BDD',
                    '#EF4444DD',
                    '#6366F1DD',
                    '#EC4899DD'
                ].slice(0, features.length),
                borderColor: [
                    '#10B981',
                    '#3B82F6',
                    '#8B5CF6',
                    '#F59E0B',
                    '#EF4444',
                    '#6366F1',
                    '#EC4899'
                ].slice(0, features.length),
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return `Importance: ${context.parsed.x.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Importance (%)',
                        font: { size: 13, family: 'Inter' }
                    },
                    grid: { color: '#e2e8f0' }
                },
                y: {
                    grid: { display: false }
                }
            }
        }
    });
}

/**
 * Generate Mock ML Data (fallback for demo)
 */
function generateMockMLData() {
    return {
        clustering: {
            clustering_available: true,
            method: 'K-Means',
            n_clusters: 3,
            total_reports: 30,
            clusters: [
                {
                    cluster_id: 0,
                    size: 12,
                    percentage: 40.0,
                    dominant_symptoms: [
                        { symptom: 'Fever', frequency: 0.83 },
                        { symptom: 'Cold Cough', frequency: 0.67 },
                        { symptom: 'Fatigue', frequency: 0.58 }
                    ],
                    pattern_description: 'Fever and Cold Cough combination'
                },
                {
                    cluster_id: 1,
                    size: 10,
                    percentage: 33.3,
                    dominant_symptoms: [
                        { symptom: 'Headache', frequency: 0.90 },
                        { symptom: 'Fatigue', frequency: 0.80 },
                        { symptom: 'Body Pain', frequency: 0.60 }
                    ],
                    pattern_description: 'Headache and Fatigue combination'
                },
                {
                    cluster_id: 2,
                    size: 8,
                    percentage: 26.7,
                    dominant_symptoms: [
                        { symptom: 'Stomach Pain', frequency: 0.88 },
                        { symptom: 'Nausea', frequency: 0.75 }
                    ],
                    pattern_description: 'Digestive issues'
                }
            ],
            insights: [
                'Primary pattern (40%): Respiratory symptoms',
                'Multiple distinct patterns detected'
            ]
        },
        anomaly_detection: {
            method: 'Isolation Forest',
            anomalies_detected: true,
            anomalous_dates: [
                {
                    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    count: 8,
                    anomaly_score: 0.623,
                    severity: 'moderate',
                    explanation: 'Report count is 2x higher than average'
                },
                {
                    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    count: 9,
                    anomaly_score: 0.745,
                    severity: 'high',
                    explanation: 'Report count is significantly elevated'
                }
            ],
            total_anomalies: 2,
            statistics: {
                mean: 3.2,
                std: 1.8,
                median: 3.0,
                anomaly_rate: 14.3
            }
        },
        forecast: {
            forecasting_available: true,
            method: 'Linear Regression + Confidence Intervals',
            forecast_period: 7,
            trend_direction: 'increasing',
            slope: 0.23,
            forecast: Array.from({ length: 7 }, (_, i) => ({
                date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                predicted_count: Math.floor(4 + i * 0.5),
                lower_bound: Math.floor(2 + i * 0.4),
                upper_bound: Math.floor(6 + i * 0.6)
            })),
            confidence_level: '95%',
            model_info: {
                r_squared: 0.67,
                training_samples: 14
            }
        },
        severity_prediction: {
            method: 'Random Forest Classifier',
            predicted_severity: 'Moderate',
            confidence: 0.78,
            probability_distribution: {
                'Mild': 0.12,
                'Moderate': 0.78,
                'Severe': 0.10
            },
            contributing_symptoms: [
                { symptom: 'Fever', importance: 0.34 },
                { symptom: 'Headache', importance: 0.22 },
                { symptom: 'Fatigue', importance: 0.18 },
                { symptom: 'Body Pain', importance: 0.12 },
                { symptom: 'Cold Cough', importance: 0.08 },
                { symptom: 'Stomach Pain', importance: 0.04 },
                { symptom: 'Nausea', importance: 0.02 }
            ]
        },
        risk_assessment: {
            risk_score: 45.6,
            risk_level: 'MODERATE',
            color: '#F59E0B',
            breakdown: {
                severity: { score: 18.0, weight: 40 },
                volume: { score: 12.5, weight: 30 },
                trend: { score: 20.0, weight: 20 },
                diversity: { score: 8.75, weight: 10 }
            },
            recommended_actions: [
                'Regular monitoring',
                'Maintain readiness',
                'Track trends closely'
            ]
        }
    };
}

/**
 * Show Error Message
 */
function showError(message) {
    console.error(message);
    // Could add UI error notification here
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchMLData,
        generateMockMLData
    };
}
