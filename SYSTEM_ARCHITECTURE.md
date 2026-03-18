# 🏗️ System Architecture Documentation

## Health Pattern Tracking System - Technical Architecture

**Version:** 2.0  
**Last Updated:** March 8, 2024  
**Architecture Style:** Client-Server with ML Backend

---

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Students   │  │    Admins    │  │  Researchers │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Web Browser (HTML5/CSS3/JS)                 │  │
│  │  • Landing Page        • Student Dashboard               │  │
│  │  • Login Pages         • Admin Dashboard                 │  │
│  │  • ML Analytics Page   • Chart.js + Plotly.js           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Flask REST API (Python 3.8+)                │  │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────────┐       │  │
│  │  │  Student   │  │   Admin    │  │    Core     │       │  │
│  │  │  Routes    │  │   Routes   │  │   Routes    │       │  │
│  │  └────────────┘  └────────────┘  └─────────────┘       │  │
│  │                                                           │  │
│  │  • Authentication    • Input Validation                  │  │
│  │  • Session Management • Error Handling                   │  │
│  │  • CORS Configuration • Rate Limiting                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                       │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────┐       │
│  │   ML Engine   │  │  Preprocessing│  │   Analytics  │       │
│  │   (5 Models)  │  │    Pipeline   │  │    Engine    │       │
│  └───────────────┘  └───────────────┘  └──────────────┘       │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐                         │
│  │     Model     │  │   Evaluation  │                         │
│  │  Persistence  │  │    Manager    │                         │
│  └───────────────┘  └───────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              SQLite Database Engine                      │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │  │
│  │  │ reports │  │  users  │  │  logs   │  │  cache  │   │  │
│  │  │  table  │  │  table  │  │  table  │  │  table  │   │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Trained ML Models (Joblib Pickle)              │  │
│  │  • severity_classifier_v*.pkl                            │  │
│  │  • clustering_model_v*.pkl                               │  │
│  │  • anomaly_detector_v*.pkl                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Component Breakdown

### 1. Frontend Layer (Presentation)

#### **Technology Stack**
- HTML5, CSS3, JavaScript ES6+
- Chart.js 4.4.0 (basic charts)
- Plotly.js 2.26.0 (advanced ML visualizations)
- Font Awesome 6.4.0 (icons)

#### **Components**
```
frontend/
├── index.html                    # Landing page
├── student-login.html            # Student authentication
├── admin-login.html              # Admin authentication
├── student-dashboard.html        # Symptom reporting interface
├── admin-dashboard.html          # Basic analytics (6 charts)
├── ml-analytics.html             # Advanced ML visualizations (5 charts)
├── style.css                     # Global styling
├── auth.js                       # Authentication logic
├── student-dashboard.js          # Student functionality
├── admin-dashboard.js            # Basic charts
└── ml-visualizations.js          # Advanced ML charts
```

#### **Responsibilities**
- User interface rendering
- Form validation (client-side)
- API communication (fetch/axios)
- Data visualization (charts)
- Session management (localStorage)

---

### 2. API Layer (Application)

#### **Technology Stack**
- Python 3.8+
- Flask 3.0.0 (web framework)
- Flask-CORS 4.0.0 (cross-origin requests)

#### **Endpoints (8 Total)**

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/student/submit-report` | POST | Submit symptoms | Session |
| `/api/student/health` | GET | Health check | No |
| `/api/admin/login` | POST | Admin auth | No |
| `/api/admin/logout` | POST | Logout | Session |
| `/api/admin/analytics` | GET | Basic analytics | Session |
| `/api/admin/ml/advanced-analytics` | GET | ML insights | Session |
| `/api/admin/reports` | GET | All reports | Session |
| `/api/admin/stats` | GET | Quick stats | Session |

#### **Architecture Pattern**
```python
# Flask Application Factory
app = Flask(__name__)

# Blueprints (Modular Routes)
├── student_bp (Student routes)
├── admin_bp   (Admin routes)
└── core_bp    (Core utilities)

# Middleware
├── CORS (Cross-Origin Resource Sharing)
├── Session Management
├── Error Handlers
└── Request Logging
```

---

### 3. ML Engine Layer (Business Logic)

#### **5 ML Models**

```
┌─────────────────────────────────────────────────────────┐
│              ADVANCED ML ENGINE                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. ISOLATION FOREST (Unsupervised)                    │
│     Purpose: Anomaly detection                         │
│     Input: Daily report counts (time series)          │
│     Output: Anomaly dates, severity scores            │
│     Library: sklearn.ensemble.IsolationForest         │
│                                                         │
│  2. K-MEANS CLUSTERING (Unsupervised)                  │
│     Purpose: Symptom pattern grouping                 │
│     Input: 8D symptom vectors                         │
│     Output: 3-5 clusters with dominant symptoms       │
│     Library: sklearn.cluster.KMeans                   │
│                                                         │
│  3. RANDOM FOREST CLASSIFIER (Supervised)              │
│     Purpose: Severity prediction                      │
│     Input: Symptom combinations                       │
│     Output: Mild/Moderate/Severe + confidence         │
│     Library: sklearn.ensemble.RandomForestClassifier  │
│                                                         │
│  4. LINEAR REGRESSION (Supervised)                     │
│     Purpose: 7-day outbreak forecasting               │
│     Input: Historical daily counts                    │
│     Output: Future predictions + confidence bands     │
│     Library: sklearn.linear_model.LinearRegression    │
│                                                         │
│  5. ML RISK SCORING (Ensemble)                         │
│     Purpose: Multi-factor risk assessment             │
│     Components: Severity(40%) + Volume(30%) +         │
│                Trend(20%) + Diversity(10%)            │
│     Output: 0-100 risk score + recommendations        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### **Data Flow**

```
Raw Data → Preprocessing → Feature Engineering → Model Input
   ↓            ↓                  ↓                  ↓
SQLite → DataPreprocessor → engineer_features() → predict()
            (normalize,          (counts,              ↓
             impute,             scores,          Predictions
             encode)             flags)                ↓
                                                  Dashboard
```

---

### 4. Data Layer

#### **SQLite Database Schema**

```sql
-- Reports Table (Core Data)
CREATE TABLE reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    date DATE NOT NULL,
    
    -- Symptoms (Binary)
    fever INTEGER DEFAULT 0,
    cold_cough INTEGER DEFAULT 0,
    headache INTEGER DEFAULT 0,
    stomach_pain INTEGER DEFAULT 0,
    nausea INTEGER DEFAULT 0,
    skin_allergy INTEGER DEFAULT 0,
    fatigue INTEGER DEFAULT 0,
    body_pain INTEGER DEFAULT 0,
    
    -- Metadata
    other_symptoms TEXT,
    location TEXT NOT NULL,
    severity TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_reports_date ON reports(date);
CREATE INDEX idx_reports_location ON reports(location);
CREATE INDEX idx_reports_timestamp ON reports(timestamp);
```

#### **Model Storage**

```
models/
├── severity_classifier_v20240308_143000.pkl    (Random Forest)
├── clustering_model_v20240308_143500.pkl       (K-Means)
├── anomaly_detector_v20240308_144000.pkl       (Isolation Forest)
├── forecasting_model_v20240308_144500.pkl      (Linear Regression)
└── model_registry.json                          (Metadata)
```

---

## 🔄 Data Flow Diagrams

### Student Symptom Submission Flow

```
┌─────────────┐
│   Student   │
│   Browser   │
└──────┬──────┘
       │ 1. Fill form
       ↓
┌─────────────────┐
│ student-        │
│ dashboard.html  │
└──────┬──────────┘
       │ 2. POST /api/student/submit-report
       │    { fever: 1, cough: 1, location: "Hostel A" }
       ↓
┌─────────────────┐
│  Flask API      │
│  (Validation)   │
└──────┬──────────┘
       │ 3. Validate input
       │    Check required fields
       ↓
┌─────────────────┐
│ Data            │
│ Preprocessing   │
└──────┬──────────┘
       │ 4. Clean & transform
       │    Add timestamp, normalize
       ↓
┌─────────────────┐
│   SQLite DB     │
│ INSERT report   │
└──────┬──────────┘
       │ 5. Store data
       ↓
┌─────────────────┐
│ Response        │
│ { success: true }│
└─────────────────┘
```

### ML Analytics Generation Flow

```
┌─────────────┐
│    Admin    │
│   Browser   │
└──────┬──────┘
       │ 1. Request analytics
       ↓
┌─────────────────┐
│ ml-analytics.   │
│ html loads      │
└──────┬──────────┘
       │ 2. GET /api/admin/ml/advanced-analytics
       ↓
┌─────────────────┐
│  Flask API      │
│  (Admin Route)  │
└──────┬──────────┘
       │ 3. Fetch data
       ↓
┌─────────────────┐
│   SQLite DB     │
│ SELECT reports  │
└──────┬──────────┘
       │ 4. Raw data
       ↓
┌─────────────────┐
│ ML Engine       │
│ (5 Models)      │
└──────┬──────────┘
       │ 5. Run all models:
       │    - Isolation Forest → anomalies
       │    - K-Means → clusters
       │    - Random Forest → severity
       │    - Linear Reg → forecast
       │    - Risk Scoring → risk level
       ↓
┌─────────────────┐
│ JSON Response   │
│ { clustering,   │
│   anomalies,    │
│   forecast,     │
│   risk }        │
└──────┬──────────┘
       │ 6. Return to frontend
       ↓
┌─────────────────┐
│ ml-             │
│ visualizations.js│
│ renders charts  │
└─────────────────┘
```

---

## 🔐 Security Architecture

### Authentication Flow

```
┌────────────┐
│   Admin    │
└─────┬──────┘
      │ 1. Enter credentials
      ↓
┌──────────────┐
│ POST /login  │
└─────┬────────┘
      │ 2. { email, password }
      ↓
┌──────────────┐
│ Validate     │
│ Credentials  │
└─────┬────────┘
      │ 3. Check against config
      │    (In production: DB hash check)
      ↓
┌──────────────┐
│ Create       │
│ Session      │
└─────┬────────┘
      │ 4. session['admin_logged_in'] = True
      ↓
┌──────────────┐
│ Return Token │
│ (Session ID) │
└──────────────┘
```

### Security Layers

1. **Transport Security**
   - HTTPS in production
   - CORS configured for specific origins
   - Secure session cookies

2. **Authentication**
   - Session-based authentication
   - Password hashing (production: bcrypt)
   - Session timeout (30 minutes)

3. **Authorization**
   - Role-based access (Student vs Admin)
   - Route-level protection
   - API endpoint guards

4. **Input Validation**
   - Client-side validation (JavaScript)
   - Server-side validation (Flask)
   - SQL injection prevention (parameterized queries)
   - XSS prevention (escaped output)

5. **Data Privacy**
   - Student IDs anonymized
   - No PII stored
   - Location limited to building level

---

## ⚡ Performance Optimizations

### 1. Database Optimization

```python
# Indexed Queries
CREATE INDEX idx_reports_date ON reports(date);
CREATE INDEX idx_reports_location ON reports(location);

# Query Optimization
# Bad:  SELECT * FROM reports
# Good: SELECT id, date, location FROM reports WHERE date >= ?
```

### 2. ML Model Optimization

```python
# Instead of retraining every request:
# Load pre-trained models on startup

@app.before_first_request
def load_ml_models():
    app.config['SEVERITY_MODEL'] = load_model('severity_classifier')
    app.config['CLUSTERING_MODEL'] = load_model('clustering_model')
    # Models cached in memory
```

### 3. Response Caching

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def get_daily_counts(days=14):
    # Cache result for repeated calls
    return db.get_daily_counts(days)
```

### 4. Lazy Loading

```python
# Load ML models only when needed
def get_ml_engine():
    if 'ml_engine' not in g:
        g.ml_engine = AdvancedMLEngine()
    return g.ml_engine
```

---

## 📊 Scalability Considerations

### Current Architecture (Single Server)

```
┌─────────────────────────────────────┐
│        Single EC2 Instance          │
│  ┌───────────┐    ┌──────────────┐ │
│  │  Flask    │    │   SQLite     │ │
│  │  (WSGI)   │───▶│   Database   │ │
│  └───────────┘    └──────────────┘ │
└─────────────────────────────────────┘
          ↑
    HTTP Requests
          │
    ┌──────────┐
    │ Browsers │
    └──────────┘
```

**Capacity:** ~100 concurrent users

### Scalable Architecture (Future)

```
┌──────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
│                  (AWS ALB / Nginx)                       │
└─────────────┬────────────────────────────┬───────────────┘
              │                            │
    ┌─────────▼────────┐        ┌────────▼─────────┐
    │  Flask Server 1  │        │  Flask Server 2  │
    │  (Gunicorn)      │        │  (Gunicorn)      │
    └─────────┬────────┘        └────────┬─────────┘
              │                            │
              └────────────┬───────────────┘
                           ↓
              ┌──────────────────────┐
              │  PostgreSQL Database │
              │     (RDS / Cloud)    │
              └──────────────────────┘
                           ↓
              ┌──────────────────────┐
              │   Redis Cache        │
              │  (Session + Data)    │
              └──────────────────────┘
                           ↓
              ┌──────────────────────┐
              │   S3 Bucket          │
              │  (Model Storage)     │
              └──────────────────────┘
```

**Capacity:** 10,000+ concurrent users

---

## 🔧 Technology Stack Summary

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| HTML5 | - | Structure |
| CSS3 | - | Styling |
| JavaScript | ES6+ | Interactivity |
| Chart.js | 4.4.0 | Basic charts |
| Plotly.js | 2.26.0 | Advanced visualizations |
| Font Awesome | 6.4.0 | Icons |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.8+ | Language |
| Flask | 3.0.0 | Web framework |
| Flask-CORS | 4.0.0 | CORS handling |
| SQLite3 | - | Database |
| scikit-learn | 1.3.0 | ML library |
| NumPy | 1.24.3 | Numerical computing |
| Pandas | 2.0.3 | Data manipulation |
| Joblib | 1.3.0 | Model persistence |

### Development
| Technology | Purpose |
|------------|---------|
| Git | Version control |
| VS Code | IDE |
| Postman | API testing |
| Chrome DevTools | Frontend debugging |

---

## 📁 File Structure

```
project-root/
│
├── frontend/
│   ├── index.html
│   ├── *-login.html (2 files)
│   ├── *-dashboard.html (3 files)
│   ├── style.css
│   └── *.js (4 files)
│
├── backend/
│   ├── app.py                    # Main application
│   ├── config.py                 # Configuration
│   ├── models.py                 # Database models
│   ├── ml_engine.py              # Basic ML
│   ├── advanced_ml.py            # 5 advanced ML models
│   ├── ml_evaluation.py          # Model evaluation
│   ├── model_persistence.py      # Save/load models
│   │
│   ├── routes/
│   │   ├── student.py
│   │   └── admin.py
│   │
│   ├── ml/
│   │   └── preprocessing.py      # Data pipeline
│   │
│   ├── utils/
│   │   └── logger.py             # Logging (next)
│   │
│   ├── models/
│   │   ├── *.pkl (saved models)
│   │   └── model_registry.json
│   │
│   └── data/
│       └── pattern_tracking.db
│
├── tests/
│   ├── test_ml_models.py
│   └── test_api.sh
│
└── docs/
    ├── README.md
    ├── ARCHITECTURE.md (this file)
    ├── API_REFERENCE.md (next)
    ├── DATASET_DESCRIPTION.md
    ├── DEPLOYMENT_GUIDE.md (next)
    └── *.md (various docs)
```

---

## 🔄 Deployment Architecture

### Development Environment
```
Laptop/Desktop
├── Python 3.8+ (local)
├── Flask dev server (port 5000)
├── Static file server (port 8000)
└── SQLite (file-based)
```

### Production Environment (Recommended)
```
Cloud Provider (AWS/Heroku/Azure)
├── Gunicorn (WSGI server)
├── Nginx (reverse proxy)
├── PostgreSQL (database)
├── Redis (caching)
└── Cloudflare (CDN for static files)
```

---

## 📈 Monitoring & Logging

### Logging Levels
```
DEBUG   → Development troubleshooting
INFO    → API requests, ML predictions
WARNING → Unusual patterns, low confidence
ERROR   → Exceptions, failed requests
CRITICAL→ System failures
```

### Metrics to Monitor
- Request rate (requests/second)
- Response time (average, p95, p99)
- Error rate (%)
- ML model accuracy over time
- Database query performance

---

## 🎯 Design Principles

1. **Separation of Concerns**
   - Frontend: Presentation only
   - API: Business logic
   - ML Engine: Model inference
   - Database: Data persistence

2. **Modularity**
   - Blueprints for routes
   - Separate ML modules
   - Reusable components

3. **Scalability**
   - Stateless API design
   - Model caching
   - Database indexing

4. **Security**
   - Input validation
   - Authentication/authorization
   - Data anonymization

5. **Maintainability**
   - Clear documentation
   - Consistent naming
   - Type hints (Python)
   - Comments for complex logic

---

## 📚 References

- **Flask Documentation:** https://flask.palletsprojects.com/
- **scikit-learn User Guide:** https://scikit-learn.org/stable/user_guide.html
- **Chart.js Docs:** https://www.chartjs.org/docs/
- **REST API Best Practices:** https://restfulapi.net/

---

**Version:** 2.0  
**Last Updated:** March 8, 2024  
**Maintained By:** Development Team  
**Status:** Production-Ready
