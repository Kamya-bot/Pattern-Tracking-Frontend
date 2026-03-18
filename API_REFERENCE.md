# 📡 API Reference Documentation

## Health Pattern Tracking System - REST API

**Base URL:** `http://localhost:5000/api`  
**Version:** 1.0  
**Last Updated:** March 8, 2024  
**Authentication:** Session-based

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Student Endpoints](#student-endpoints)
3. [Admin Endpoints](#admin-endpoints)
4. [Error Handling](#error-handling)
5. [Response Codes](#response-codes)
6. [Rate Limiting](#rate-limiting)

---

## 🔐 Authentication

### Session-Based Authentication

The API uses session-based authentication with secure cookies.

**Login Flow:**
1. POST to `/api/admin/login` with credentials
2. Server creates session and returns success
3. Include session cookie in subsequent requests
4. POST to `/api/admin/logout` to end session

**Session Duration:** 30 minutes (configurable)

---

## 👨‍🎓 Student Endpoints

### 1. Submit Symptom Report

**Endpoint:** `POST /api/student/submit-report`

**Description:** Submit a new symptom report

**Authentication:** Optional (session-based for tracking)

**Request Body:**
```json
{
  "student_id": "anonymous_123",
  "fever": 1,
  "cold_cough": 1,
  "headache": 0,
  "stomach_pain": 0,
  "nausea": 0,
  "skin_allergy": 0,
  "fatigue": 1,
  "body_pain": 0,
  "other_symptoms": "Sore throat",
  "location": "Engineering Hostel",
  "severity": "Moderate"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `student_id` | string | No | Anonymous identifier |
| `fever` | integer (0/1) | Yes | Fever symptom |
| `cold_cough` | integer (0/1) | Yes | Cold/cough symptom |
| `headache` | integer (0/1) | Yes | Headache |
| `stomach_pain` | integer (0/1) | Yes | Abdominal pain |
| `nausea` | integer (0/1) | Yes | Nausea |
| `skin_allergy` | integer (0/1) | Yes | Skin reaction |
| `fatigue` | integer (0/1) | Yes | Tiredness |
| `body_pain` | integer (0/1) | Yes | Muscle/joint pain |
| `other_symptoms` | string | No | Free text |
| `location` | string | Yes | Building/hostel name |
| `severity` | string | No | Mild/Moderate/Severe |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Report submitted successfully",
  "report_id": 42,
  "submitted_at": "2024-03-08T14:30:00Z"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Missing required field: location"
}
```

**Example (cURL):**
```bash
curl -X POST http://localhost:5000/api/student/submit-report \
  -H "Content-Type: application/json" \
  -d '{
    "fever": 1,
    "cold_cough": 1,
    "headache": 0,
    "stomach_pain": 0,
    "nausea": 0,
    "skin_allergy": 0,
    "fatigue": 1,
    "body_pain": 0,
    "location": "Engineering Hostel"
  }'
```

**Example (JavaScript):**
```javascript
const response = await fetch('/api/student/submit-report', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fever: 1,
    cold_cough: 1,
    headache: 0,
    stomach_pain: 0,
    nausea: 0,
    skin_allergy: 0,
    fatigue: 1,
    body_pain: 0,
    location: 'Engineering Hostel'
  })
});
const data = await response.json();
```

---

### 2. Student Health Check

**Endpoint:** `GET /api/student/health`

**Description:** Check API health status

**Authentication:** None

**Success Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "student-api",
  "timestamp": "2024-03-08T14:30:00Z"
}
```

---

## 👨‍💼 Admin Endpoints

### 1. Admin Login

**Endpoint:** `POST /api/admin/login`

**Description:** Authenticate as administrator

**Authentication:** None (this creates the session)

**Request Body:**
```json
{
  "email": "admin@university.edu",
  "password": "admin123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "email": "admin@university.edu"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Example (cURL):**
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@university.edu",
    "password": "admin123"
  }'
```

---

### 2. Admin Logout

**Endpoint:** `POST /api/admin/logout`

**Description:** End admin session

**Authentication:** Required (admin session)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 3. Get Basic Analytics

**Endpoint:** `GET /api/admin/analytics`

**Description:** Retrieve comprehensive analytics data

**Authentication:** Required (admin session)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_reports": 142,
    "active_symptoms": 7,
    "most_common_symptom": "fever",
    "top_location": "Engineering Hostel",
    "symptom_counts": {
      "fever": 45,
      "cold_cough": 38,
      "headache": 32,
      "stomach_pain": 15,
      "nausea": 12,
      "skin_allergy": 8,
      "fatigue": 40,
      "body_pain": 25
    },
    "location_counts": {
      "Engineering Hostel": 35,
      "Medical Hostel": 28,
      "Arts Hostel": 22
    },
    "severity_counts": {
      "Mild": 58,
      "Moderate": 65,
      "Severe": 19
    },
    "daily_counts": {
      "2024-03-01": 8,
      "2024-03-02": 6,
      "2024-03-03": 10
    },
    "ml_analysis": {
      "anomalies_detected": true,
      "trend": "increasing",
      "risk_level": "moderate"
    }
  }
}
```

**Example (JavaScript with fetch):**
```javascript
const response = await fetch('/api/admin/analytics', {
  credentials: 'include'  // Include session cookie
});
const data = await response.json();
```

---

### 4. Get Advanced ML Analytics

**Endpoint:** `GET /api/admin/ml/advanced-analytics`

**Description:** Get comprehensive ML model outputs

**Authentication:** Required (admin session)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "anomaly_detection": {
      "method": "Isolation Forest",
      "anomalies_detected": true,
      "anomalous_dates": [
        {
          "date": "2024-03-05",
          "count": 8,
          "anomaly_score": 0.623,
          "severity": "moderate",
          "explanation": "Report count is 2x higher than average"
        }
      ],
      "total_anomalies": 2,
      "statistics": {
        "mean": 3.2,
        "std": 1.8,
        "median": 3.0,
        "anomaly_rate": 14.3
      }
    },
    "clustering": {
      "clustering_available": true,
      "method": "K-Means",
      "n_clusters": 3,
      "total_reports": 30,
      "clusters": [
        {
          "cluster_id": 0,
          "size": 12,
          "percentage": 40.0,
          "dominant_symptoms": [
            {"symptom": "Fever", "frequency": 0.83},
            {"symptom": "Cold Cough", "frequency": 0.67}
          ],
          "pattern_description": "Fever and Cold Cough combination"
        }
      ],
      "insights": [
        "Primary pattern (40%): Respiratory symptoms"
      ]
    },
    "severity_prediction": {
      "method": "Random Forest Classifier",
      "predicted_severity": "Moderate",
      "confidence": 0.78,
      "probability_distribution": {
        "Mild": 0.12,
        "Moderate": 0.78,
        "Severe": 0.10
      },
      "contributing_symptoms": [
        {"symptom": "Fever", "importance": 0.34},
        {"symptom": "Headache", "importance": 0.22}
      ]
    },
    "forecast": {
      "forecasting_available": true,
      "method": "Linear Regression + Confidence Intervals",
      "forecast_period": 7,
      "trend_direction": "increasing",
      "slope": 0.23,
      "forecast": [
        {
          "date": "2024-03-09",
          "predicted_count": 4,
          "lower_bound": 2,
          "upper_bound": 6
        }
      ],
      "confidence_level": "95%"
    },
    "risk_assessment": {
      "risk_score": 45.6,
      "risk_level": "MODERATE",
      "color": "#F59E0B",
      "breakdown": {
        "severity": {"score": 18.0, "weight": 40},
        "volume": {"score": 12.5, "weight": 30},
        "trend": {"score": 20.0, "weight": 20},
        "diversity": {"score": 8.75, "weight": 10}
      },
      "recommended_actions": [
        "Regular monitoring",
        "Maintain readiness",
        "Track trends closely"
      ]
    }
  }
}
```

**Example (cURL):**
```bash
curl http://localhost:5000/api/admin/ml/advanced-analytics \
  -H "Cookie: session=abc123..." \
  -H "Accept: application/json"
```

---

### 5. Get All Reports

**Endpoint:** `GET /api/admin/reports`

**Description:** Retrieve all symptom reports

**Authentication:** Required (admin session)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 100 | Max number of records |
| `offset` | integer | 0 | Pagination offset |
| `sort` | string | 'timestamp' | Sort field |
| `order` | string | 'DESC' | ASC or DESC |

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": 1,
        "date": "2024-03-08",
        "timestamp": "2024-03-08T14:30:00Z",
        "fever": 1,
        "cold_cough": 1,
        "headache": 0,
        "stomach_pain": 0,
        "nausea": 0,
        "skin_allergy": 0,
        "fatigue": 1,
        "body_pain": 0,
        "other_symptoms": "Sore throat",
        "location": "Engineering Hostel",
        "severity": "Moderate"
      }
    ],
    "total": 142,
    "page": 1,
    "per_page": 100
  }
}
```

**Example with Pagination:**
```bash
curl "http://localhost:5000/api/admin/reports?limit=20&offset=0"
```

---

### 6. Get Quick Statistics

**Endpoint:** `GET /api/admin/stats`

**Description:** Get quick summary statistics

**Authentication:** Required (admin session)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_reports": 142,
    "today_reports": 8,
    "active_symptoms": 7,
    "top_symptom": "fever",
    "top_location": "Engineering Hostel",
    "avg_symptom_count": 2.8,
    "severe_cases": 19
  }
}
```

---

### 7. Admin Health Check

**Endpoint:** `GET /api/admin/health`

**Description:** Check admin API health

**Authentication:** None

**Success Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "admin-api",
  "database": "connected",
  "ml_engine": "initialized",
  "timestamp": "2024-03-08T14:30:00Z"
}
```

---

### 8. Seed Database (Development Only)

**Endpoint:** `POST /api/seed-database`

**Description:** Generate sample data for testing

**Authentication:** None (only available in DEBUG mode)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Database seeded with 30 sample reports"
}
```

**Error Response (403 Forbidden - Production):**
```json
{
  "success": false,
  "error": "This endpoint is only available in debug mode"
}
```

---

## ⚠️ Error Handling

### Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE",
  "timestamp": "2024-03-08T14:30:00Z"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `MISSING_FIELD` | 400 | Required field not provided |
| `INVALID_FORMAT` | 400 | Data format incorrect |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |
| `ML_ERROR` | 500 | ML model inference failed |
| `DB_ERROR` | 500 | Database operation failed |

---

## 📊 Response Codes

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error occurred |
| 503 | Service Unavailable | Server temporarily down |

---

## 🚦 Rate Limiting

**Current Limits (Development):**
- No rate limiting

**Production Limits (Recommended):**
- General API: 100 requests/minute per IP
- Login endpoint: 5 attempts/minute per IP
- ML analytics: 10 requests/minute per session

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1678345678
```

---

## 🔒 Security Best Practices

### 1. Use HTTPS in Production
```
https://yourdomain.com/api/...
```

### 2. Include CORS Headers
```
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Credentials: true
```

### 3. Validate All Inputs
```python
# Server-side validation
if not data.get('location'):
    return {"error": "Location required"}, 400
```

### 4. Sanitize User Input
```python
import bleach
safe_text = bleach.clean(user_input)
```

### 5. Use Environment Variables
```python
# Don't hardcode credentials
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL')
```

---

## 📝 Changelog

### Version 1.0 (March 8, 2024)
- Initial API release
- 8 endpoints implemented
- Session-based authentication
- ML analytics integration

---

## 🔧 Development Tools

### Postman Collection

Import this JSON to test all endpoints:

```json
{
  "info": {
    "name": "Health Pattern Tracking API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/"
  },
  "item": [
    {
      "name": "Admin Login",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "http://localhost:5000/api/admin/login",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"admin@university.edu\",\"password\":\"admin123\"}"
        }
      }
    }
  ]
}
```

---

## 📚 Additional Resources

- **System Architecture:** See `SYSTEM_ARCHITECTURE.md`
- **Dataset Documentation:** See `DATASET_DESCRIPTION.md`
- **Deployment Guide:** See `DEPLOYMENT_GUIDE.md`
- **Source Code:** Check `backend/routes/` directory

---

## 📞 Support

For API questions or issues:
- **Documentation:** This file
- **Code:** `backend/routes/admin.py`, `backend/routes/student.py`
- **Issues:** Check GitHub repository

---

**API Version:** 1.0  
**Last Updated:** March 8, 2024  
**Base URL:** http://localhost:5000/api  
**Authentication:** Session-based  
**Format:** JSON
