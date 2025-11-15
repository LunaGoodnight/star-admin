#!/bin/bash
# Local testing script

set -e

echo "🧪 Testing Docker image locally..."

# Check if image exists
if ! docker images | grep -q "star-admin"; then
    echo "❌ Image 'star-admin:latest' not found!"
    echo "Build it first: docker build -t star-admin:latest ."
    exit 1
fi

# Stop any existing container
echo "🛑 Stopping existing container..."
docker compose -f docker-compose.local.yml down 2>/dev/null || true

# Start container
echo "🚀 Starting container..."
docker compose -f docker-compose.local.yml up -d

# Wait for container to be ready
echo "⏳ Waiting for container to start..."
sleep 3

# Check container status
echo "✅ Container status:"
docker compose -f docker-compose.local.yml ps

# Show logs
echo ""
echo "📋 Recent logs:"
docker compose -f docker-compose.local.yml logs --tail=20

echo ""
echo "🎉 Container is running!"
echo "👉 Open http://localhost:3000 in your browser"
echo ""
echo "Useful commands:"
echo "  View logs:    docker compose -f docker-compose.local.yml logs -f"
echo "  Stop:         docker compose -f docker-compose.local.yml down"
echo "  Restart:      docker compose -f docker-compose.local.yml restart"
