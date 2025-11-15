#!/bin/bash
# Deployment script for VPS - Run this on your VPS

set -e  # Exit on error

echo "🚀 Starting deployment of star-admin..."

# Step 1: Stop and remove old container
echo "📦 Stopping old container..."
docker compose -f docker-compose.prod.yml down || true

# Step 2: Pull latest image from Docker Hub
echo "⬇️  Pulling latest image from Docker Hub..."
docker compose -f docker-compose.prod.yml pull

# Step 3: Start the container
echo "🔄 Starting container..."
docker compose -f docker-compose.prod.yml up -d

# Step 4: Wait a moment for container to start
echo "⏳ Waiting for container to start..."
sleep 5

# Step 5: Check container status
echo "✅ Container status:"
docker compose -f docker-compose.prod.yml ps

# Step 6: Show recent logs
echo ""
echo "📋 Recent logs:"
docker compose -f docker-compose.prod.yml logs --tail=20

echo ""
echo "🎉 Deployment complete!"
echo "👉 Your app should be running on http://127.0.0.1:1025"
echo ""
echo "To view logs: docker compose -f docker-compose.prod.yml logs -f"
echo "To stop: docker compose -f docker-compose.prod.yml down"
