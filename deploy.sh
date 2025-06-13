#!/bin/bash

# Production Deployment Script for Arda Project
echo "🚀 Starting production deployment..."

# Stop and remove existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images (optional - uncomment if you want to ensure fresh builds)
# echo "🧹 Cleaning up old images..."
# docker-compose down --rmi all

# Build and start services in production mode
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Show running containers
echo "📋 Running containers:"
docker-compose ps

# Show logs
echo "📝 Service logs (last 50 lines):"
docker-compose logs --tail=50

echo "✅ Deployment completed!"
echo "🌐 Frontend available at: http://localhost:5173"
echo "🔧 Backend API available at: http://localhost:5001"
echo ""
echo "📊 To monitor logs: docker-compose logs -f"
echo "🛑 To stop services: docker-compose down" 