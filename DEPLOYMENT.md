# Arda Project - Production Deployment Guide

## Overview
This guide explains how to deploy the Arda project using Docker Compose with both frontend and backend services.

## Project Structure
```
arda-odev/
├── docker-compose.yml              # Main production compose file
├── docker-compose.production.yml   # Environment variables version
├── deploy.sh                       # Deployment script
├── Dockerfile                      # Frontend Dockerfile
├── server/
│   ├── Dockerfile                 # Backend Dockerfile
│   └── uploads/                   # File uploads directory
└── DEPLOYMENT.md                  # This file
```

## Quick Start

### Option 1: Direct Deployment (Hardcoded Values)
```bash
# Use the main docker-compose.yml with hardcoded values
docker-compose up --build -d

# Or use the deployment script
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Environment Variables (Recommended for Production)
```bash
# 1. Create a .env file with your values
cp .env.example .env  # Create this from the template below
nano .env             # Edit with your actual values

# 2. Use the production compose file
docker-compose -f docker-compose.production.yml up --build -d
```

## Environment Variables Template
Create a `.env` file in the root directory with these variables:

```env
# Server Configuration
PORT=5001
NODE_ENV=production

# Database Configuration (MongoDB Atlas)
MONGODB_URI=mongodb+srv://sahalarda1:99arda99@bitirme.pxjcx.mongodb.net/?retryWrites=true&w=majority&appName=bitirme

# JWT Configuration (CHANGE THIS!)
JWT_SECRET=your_super_secure_jwt_secret_here

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
EMAIL_PORT=587
SMTP_ADMIN_EMAIL=mdogruca@gmail.com
SMTP_PASS=okeg akbp mqwu azrt
SMTP_USER=mdogruca@gmail.com
SMTP_SENDER_NAME=arda-mail

# Application Configuration
BASE_URL=http://159.69.146.213:5001
# CRITICAL: Set VITE_API_URL to your production server's domain/IP
# Examples:
# VITE_API_URL=http://your-server-ip:5001
# VITE_API_URL=http://your-domain.com:5001
# VITE_API_URL=https://api.your-domain.com
VITE_API_URL=http://159.69.146.213:5001

# Additional configurations
ENABLE_ANONYMOUS_USERS=false
```

## IMPORTANT: Production URL Configuration

**CRITICAL**: For production deployment, you MUST set `VITE_API_URL` to your actual production server's domain or IP address. 

Examples of correct production URLs:
- `VITE_API_URL=http://159.69.146.213:5001` (using your production server IP)
- `VITE_API_URL=http://myserver.com:5001` (if using domain name)
- `VITE_API_URL=https://api.myserver.com` (if using reverse proxy with SSL)

**DO NOT** use `localhost` or `server` in production as these will not work when users access your application from their browsers.

## Services
- **Frontend**: React/Vite application running on port 5173
- **Backend**: Node.js API server running on port 5001
- **Database**: MongoDB Atlas (cloud-hosted)

## Deployment Commands

### Start Services
```bash
# With hardcoded values
docker-compose up -d

# With environment variables
docker-compose -f docker-compose.production.yml up -d

# Force rebuild
docker-compose up --build -d
```

### Monitor Services
```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f server

# Check service status
docker-compose ps
```

### Stop Services
```bash
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop and remove images
docker-compose down --rmi all
```

## Server Deployment

### Prerequisites on Server
1. Docker and Docker Compose installed
2. Port 5173 and 5001 open in firewall
3. Domain name pointed to server IP (optional)

### Steps
1. Clone repository to server
2. Navigate to project directory
3. Create `.env` file with production values
4. Run deployment:
   ```bash
   docker-compose -f docker-compose.production.yml up --build -d
   ```

### Reverse Proxy (Optional)
For production, consider using Nginx as reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Security Notes
- Change JWT_SECRET to a strong, unique value
- Use environment variables for sensitive data
- Consider using Docker secrets for production
- Keep email credentials secure
- Use HTTPS in production

## Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure ports 5173 and 5001 are available
2. **Build failures**: Check Dockerfile paths and dependencies
3. **Network issues**: Verify services can communicate via docker network
4. **Database connection**: Verify MongoDB Atlas connection string

### Debug Commands
```bash
# View container logs
docker logs arda-frontend
docker logs arda-server

# Access container shell
docker exec -it arda-frontend sh
docker exec -it arda-server sh

# Check network connectivity
docker network ls
docker network inspect arda-odev_app-network
```

## Support
For issues, check the logs and ensure all environment variables are properly set. 