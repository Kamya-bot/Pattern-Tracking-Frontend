```markdown
# Deployment Guide - Pattern Tracking System

**Version:** 1.0.0  
**Last Updated:** 2024-03-14  
**Status:** Production Ready 🚀

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment Options](#production-deployment-options)
4. [Docker Deployment](#docker-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Database Migration](#database-migration)
7. [Environment Configuration](#environment-configuration)
8. [SSL/TLS Setup](#ssltls-setup)
9. [Monitoring & Logging](#monitoring--logging)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **OS:** Linux (Ubuntu 20.04+), macOS, or Windows 10/11
- **Python:** 3.8 or higher
- **RAM:** Minimum 2GB (4GB recommended for production)
- **Storage:** 1GB minimum (5GB recommended)
- **Network:** HTTP/HTTPS access for web server

### Software Requirements
```bash
# Check Python version
python3 --version  # Should be 3.8+

# Check pip
pip3 --version

# Check git
git --version
```

---

## Local Development Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd pattern-tracking-system
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python setup.py

# Generate sample data (optional)
python generate_sample_data.py

# Start development server
python app.py
```

**Expected Output:**
```
🚀 Pattern Tracking System API
================================
Environment: development
Debug Mode: True
Port: 5000
✅ Advanced ML Engine initialized successfully!
   - Isolation Forest: Ready
   - K-Means Clustering: Ready
   - Random Forest: Ready
   - Time-Series Forecasting: Ready
   - ML Risk Scoring: Ready
✅ Server running at http://127.0.0.1:5000
```

### 3. Frontend Setup

```bash
# In a new terminal, navigate to project root
cd pattern-tracking-system

# Start simple HTTP server
python3 -m http.server 8000

# Or use Node.js http-server (if installed)
npx http-server -p 8000
```

### 4. Access Application

- **Frontend:** http://localhost:8000
- **Backend API:** http://localhost:5000
- **Admin Login:** admin@university.edu / admin123
- **API Health Check:** http://localhost:5000/api/health

---

## Production Deployment Options

### Option 1: Linux Server (Ubuntu/Debian)

#### Step 1: Install System Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3 python3-pip python3-venv nginx -y

# Install supervisor for process management
sudo apt install supervisor -y
```

#### Step 2: Setup Application
```bash
# Create application user
sudo useradd -m -s /bin/bash patterntrack
sudo su - patterntrack

# Clone repository
git clone <repository-url> /home/patterntrack/app
cd /home/patterntrack/app

# Setup backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn  # Production WSGI server

# Initialize database
python setup.py
```

#### Step 3: Configure Gunicorn

Create `/home/patterntrack/app/backend/gunicorn_config.py`:
```python
bind = "127.0.0.1:5000"
workers = 4
threads = 2
worker_class = "sync"
worker_connections = 1000
keepalive = 5
timeout = 30
graceful_timeout = 30
max_requests = 1000
max_requests_jitter = 50
accesslog = "/var/log/patterntrack/gunicorn-access.log"
errorlog = "/var/log/patterntrack/gunicorn-error.log"
loglevel = "info"
```

#### Step 4: Configure Supervisor

Create `/etc/supervisor/conf.d/patterntrack.conf`:
```ini
[program:patterntrack]
directory=/home/patterntrack/app/backend
command=/home/patterntrack/app/backend/venv/bin/gunicorn -c gunicorn_config.py app:app
user=patterntrack
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stderr_logfile=/var/log/patterntrack/stderr.log
stdout_logfile=/var/log/patterntrack/stdout.log
```

```bash
# Create log directory
sudo mkdir -p /var/log/patterntrack
sudo chown patterntrack:patterntrack /var/log/patterntrack

# Reload supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start patterntrack
```

#### Step 5: Configure Nginx

Create `/etc/nginx/sites-available/patterntrack`:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Frontend
    location / {
        root /home/patterntrack/app;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    
    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/patterntrack /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Docker Deployment

### 1. Create Dockerfile

Create `backend/Dockerfile`:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create database directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# Run application
CMD ["gunicorn", "-b", "0.0.0.0:5000", "-w", "4", "app:app"]
```

### 2. Create docker-compose.yml

Create `docker-compose.yml` in project root:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: patterntrack-backend
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - DATABASE_PATH=/app/data/database.db
    volumes:
      - ./backend/data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: nginx:alpine
    container_name: patterntrack-frontend
    ports:
      - "80:80"
    volumes:
      - ./:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - backend
    restart: unless-stopped
```

### 3. Build and Run

```bash
# Build containers
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Cloud Deployment

### AWS (Amazon Web Services)

#### Option A: EC2 Instance

1. **Launch EC2 Instance**
   - AMI: Ubuntu Server 20.04 LTS
   - Instance Type: t2.medium (2 vCPU, 4GB RAM)
   - Security Group: Allow HTTP (80), HTTPS (443), SSH (22)

2. **Setup Application**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   # Follow "Linux Server" deployment steps above
   ```

3. **Configure Elastic IP**
   - Allocate Elastic IP
   - Associate with EC2 instance

#### Option B: Elastic Beanstalk

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB Application**
   ```bash
   cd backend
   eb init -p python-3.8 pattern-tracking-system
   ```

3. **Create Environment**
   ```bash
   eb create production-env
   ```

4. **Deploy**
   ```bash
   eb deploy
   ```

### Heroku

#### 1. Prepare Application

Create `backend/Procfile`:
```
web: gunicorn app:app
```

Create `backend/runtime.txt`:
```
python-3.9.16
```

#### 2. Deploy to Heroku
```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create pattern-tracking-system

# Set environment variables
heroku config:set FLASK_ENV=production

# Deploy
cd backend
git init
git add .
git commit -m "Initial deployment"
git push heroku master

# Open application
heroku open
```

### DigitalOcean

#### 1. Create Droplet
- Distribution: Ubuntu 20.04
- Plan: Basic ($12/month - 2GB RAM, 50GB SSD)
- Add SSH key

#### 2. Setup Application
```bash
ssh root@your-droplet-ip
# Follow "Linux Server" deployment steps
```

#### 3. Configure Firewall
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## Database Migration

### Backup Database
```bash
# SQLite backup
sqlite3 database.db ".backup 'backup-$(date +%Y%m%d).db'"

# Or use cp
cp database.db database-backup-$(date +%Y%m%d).db
```

### Restore Database
```bash
sqlite3 database.db ".restore 'backup-20240314.db'"
```

### Migrate to PostgreSQL (Production)

#### 1. Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
```

#### 2. Create Database
```bash
sudo -u postgres psql
CREATE DATABASE patterntrack;
CREATE USER patterntrack_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE patterntrack TO patterntrack_user;
\q
```

#### 3. Update Backend Configuration

Install psycopg2:
```bash
pip install psycopg2-binary
```

Update `config.py`:
```python
DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgresql://patterntrack_user:secure_password@localhost/patterntrack'
)
```

---

## Environment Configuration

### Environment Variables

Create `.env` file in backend directory:
```bash
# Flask Configuration
FLASK_ENV=production
FLASK_APP=app.py
SECRET_KEY=your-secret-key-here-change-in-production

# Database
DATABASE_PATH=./database.db

# Admin Credentials (change in production!)
ADMIN_EMAIL=admin@university.edu
ADMIN_PASSWORD=secure_admin_password_here

# ML Configuration
ML_MODEL_PATH=./models
CACHE_TIMEOUT=300

# Security
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/patterntrack/app.log
```

### Load Environment Variables

In `app.py`:
```python
from dotenv import load_dotenv
load_dotenv()

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key')
```

---

## SSL/TLS Setup

### Using Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Manual SSL Certificate

Update nginx configuration:
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/ssl/certs/your-cert.crt;
    ssl_certificate_key /etc/ssl/private/your-key.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Monitoring & Logging

### Application Monitoring

#### Setup Logging
```python
# In app.py
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    file_handler = RotatingFileHandler(
        'logs/app.log',
        maxBytes=10240000,
        backupCount=10
    )
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
```

#### Monitor with Supervisor
```bash
# Check status
sudo supervisorctl status patterntrack

# View logs
sudo tail -f /var/log/patterntrack/stdout.log
sudo tail -f /var/log/patterntrack/stderr.log
```

### System Monitoring

#### Install Monitoring Tools
```bash
# htop for process monitoring
sudo apt install htop -y

# netstat for network monitoring
sudo apt install net-tools -y
```

#### Basic Health Checks
```bash
# Check application status
curl http://localhost:5000/api/health

# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

#### 2. Database Locked
```bash
# Check database permissions
ls -l database.db

# Fix permissions
chmod 664 database.db
```

#### 3. Import Errors
```bash
# Verify virtual environment is activated
which python  # Should point to venv

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

#### 4. Nginx 502 Bad Gateway
```bash
# Check backend is running
sudo supervisorctl status patterntrack

# Check nginx error log
sudo tail -f /var/log/nginx/error.log

# Test nginx configuration
sudo nginx -t
```

#### 5. CORS Errors
```python
# In app.py, ensure CORS is configured
from flask_cors import CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})
```

### Debug Mode

Enable debug mode for development:
```python
# In app.py
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
```

---

## Performance Optimization

### 1. Enable Caching
```python
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'simple'})

@app.route('/api/analytics')
@cache.cached(timeout=300)
def get_analytics():
    # ... implementation
```

### 2. Database Indexes
```sql
CREATE INDEX idx_report_date ON symptom_reports(report_date);
CREATE INDEX idx_location ON symptom_reports(location);
CREATE INDEX idx_severity ON symptom_reports(severity);
```

### 3. Nginx Caching
```nginx
# Cache static assets
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Backup Strategy

### Automated Backup Script

Create `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/backup/patterntrack"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
cp /home/patterntrack/app/backend/database.db $BACKUP_DIR/db_$DATE.db

# Backup application code
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /home/patterntrack/app

# Keep only last 30 days of backups
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Schedule with Cron
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/patterntrack/backup.sh >> /var/log/patterntrack/backup.log 2>&1
```

---

## Security Checklist

- [ ] Change default admin credentials
- [ ] Generate strong SECRET_KEY
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (ufw/iptables)
- [ ] Disable debug mode in production
- [ ] Set up regular backups
- [ ] Enable rate limiting
- [ ] Configure security headers
- [ ] Use environment variables for secrets
- [ ] Keep dependencies updated
- [ ] Monitor logs for suspicious activity
- [ ] Implement input validation
- [ ] Enable CORS only for trusted domains

---

## Support & Resources

- **Documentation:** See README.md, API_REFERENCE.md, SYSTEM_ARCHITECTURE.md
- **Issues:** Report bugs and issues on GitHub
- **Updates:** Check for updates regularly

---

**Deployment Guide Version:** 1.0.0  
**Last Updated:** 2024-03-14  
**Status:** Production Ready ✅
```
