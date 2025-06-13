# Server Docker Setup

This document explains how to run the Node.js/TypeScript server using Docker with proper environment variable configuration.

## Required Environment Variables

The server requires the following environment variables:

### Server Configuration
- `PORT` - Server port (default: 5001)

### Database Configuration
- `MONGODB_URI` - MongoDB connection string

### JWT Configuration
- `JWT_SECRET` - Secret key for JWT token signing (use a strong, unique secret)

### Email Configuration (SMTP)
- `SMTP_HOST` - SMTP server hostname (e.g., smtp.gmail.com)
- `EMAIL_PORT` - SMTP server port (e.g., 587)
- `SMTP_ADMIN_EMAIL` - Admin email address for sending emails
- `SMTP_PASS` - SMTP password or app password

### Application Configuration
- `BASE_URL` - Base URL of the application (used for email verification links)

## Setup Instructions

### 1. Environment Variables Setup

Copy the example environment file:
```bash
cp env.example .env
```

Edit `.env` with your actual values:
```bash
# Server Configuration
PORT=5001

# Database Configuration
MONGODB_URI=mongodb://admin:password123@mongodb:27017/arda_odev?authSource=admin

# JWT Configuration (CHANGE THIS!)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-complex

# Email Configuration
SMTP_HOST=smtp.gmail.com
EMAIL_PORT=587
SMTP_ADMIN_EMAIL=your-admin@gmail.com
SMTP_PASS=your-app-specific-password

# Application Configuration
BASE_URL=http://localhost:5001
```

### 2. Docker Compose (Recommended)

The easiest way to run the application with all dependencies:

**For Production:**
```bash
docker-compose up -d
```

**For Development:**
```bash
docker-compose --profile dev up -d server-dev
```

**Stop services:**
```bash
docker-compose down
```

**View logs:**
```bash
docker-compose logs -f server
```

### 3. Docker Build Only

If you want to build and run just the server container:

**Build the image:**
```bash
# Production
docker build --target production -t server-prod .

# Development
docker build --target development -t server-dev .
```

**Run with environment variables:**
```bash
docker run -p 5001:5001 \
  -e MONGODB_URI="your-mongodb-uri" \
  -e JWT_SECRET="your-jwt-secret" \
  -e SMTP_HOST="smtp.gmail.com" \
  -e EMAIL_PORT="587" \
  -e SMTP_ADMIN_EMAIL="your-email@gmail.com" \
  -e SMTP_PASS="your-password" \
  -e BASE_URL="http://localhost:5001" \
  server-prod
```

**Or use an environment file:**
```bash
docker run -p 5001:5001 --env-file .env server-prod
```

## Email Configuration for Gmail

If using Gmail SMTP:

1. Enable 2-factor authentication on your Google account
2. Generate an "App Password" for this application
3. Use the app password (not your regular password) in `SMTP_PASS`

## Security Notes

- **Never commit your `.env` file to version control**
- Use strong, unique secrets for `JWT_SECRET` in production
- Use environment-specific configurations for different deployments
- Consider using Docker secrets or external secret management in production

## Troubleshooting

### Common Issues

1. **Database Connection Error:**
   - Ensure MongoDB is running and accessible
   - Check the `MONGODB_URI` format
   - Verify network connectivity between containers

2. **Email Sending Error:**
   - Verify SMTP credentials
   - Check if Gmail app password is correctly configured
   - Ensure firewall allows SMTP connections

3. **JWT Token Error:**
   - Ensure `JWT_SECRET` is set and consistent across restarts
   - Verify the secret is sufficiently complex

### Health Check

The application includes a health check endpoint. You can verify the service is running:

```bash
curl http://localhost:5001/api/users/all
```

### Container Logs

View detailed logs for debugging:

```bash
# Docker Compose
docker-compose logs -f server

# Direct Docker
docker logs -f server
```

## File Structure

```
server/
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Complete stack with MongoDB
├── .dockerignore           # Files to exclude from Docker build
├── env.example             # Example environment variables
├── package.json            # Node.js dependencies
├── src/                    # Source code
└── uploads/                # File upload directory (mounted as volume)
``` 