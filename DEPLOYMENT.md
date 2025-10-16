# Docker Deployment Guide for Star Admin

This guide covers deploying the Star Admin Next.js application using Docker on your VPS.

## Prerequisites

- Docker installed on your VPS
- Docker Compose installed on your VPS
- Git (to clone the repository)

## Quick Start

### 1. Build and Run with Docker Compose

```bash
# Build and start the container
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at `http://your-vps-ip:1025`

### 2. Build and Run with Docker Only

```bash
# Build the image
docker build -t star-admin .

# Run the container
docker run -d \
  --name star-admin \
  -p 1025:3000 \
  --restart unless-stopped \
  star-admin

# View logs
docker logs -f star-admin

# Stop and remove
docker stop star-admin
docker rm star-admin
```

## Deployment on VPS

### Step-by-Step Deployment

1. **Connect to your VPS**
   ```bash
   ssh user@your-vps-ip
   ```

2. **Install Docker and Docker Compose** (if not already installed)
   ```bash
   # Update packages
   sudo apt update
   sudo apt upgrade -y

   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh

   # Add your user to docker group
   sudo usermod -aG docker $USER

   # Install Docker Compose
   sudo apt install docker-compose -y

   # Verify installation
   docker --version
   docker-compose --version
   ```

3. **Clone or Upload Your Repository**
   ```bash
   # Option 1: Clone from git
   git clone <your-repo-url> star-admin
   cd star-admin

   # Option 2: Upload files via SCP from your local machine
   # scp -r /path/to/star-admin user@your-vps-ip:/home/user/
   ```

4. **Build and Start the Application**
   ```bash
   cd star-admin
   docker-compose up -d --build
   ```

5. **Verify the Application is Running**
   ```bash
   # Check container status
   docker-compose ps

   # Check logs
   docker-compose logs -f

   # Test the application
   curl http://localhost:1025
   ```

## Custom Port Configuration

To change the port, edit `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"  # Change 8080 to your desired port
```

Or when using docker run:
```bash
docker run -d -p 8080:3000 --name star-admin star-admin
```

## Using a Reverse Proxy (Nginx)

For production, it's recommended to use Nginx as a reverse proxy with SSL:

### Install Nginx

```bash
sudo apt install nginx -y
```

### Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/star-admin
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:1025;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Enable the Configuration

```bash
sudo ln -s /etc/nginx/sites-available/star-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Add SSL with Let's Encrypt (Optional but Recommended)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Environment Variables

If you need environment variables, create a `.env.production` file:

```env
NODE_ENV=production
PORT=3000
# Add other environment variables here
```

Then uncomment the `env_file` section in `docker-compose.yml`:

```yaml
env_file:
  - .env.production
```

## Updating the Application

```bash
# Pull latest changes (if using git)
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Or without downtime
docker-compose up -d --build --force-recreate
```

## Useful Docker Commands

```bash
# View running containers
docker ps

# View all containers
docker ps -a

# View logs
docker-compose logs -f

# Restart the application
docker-compose restart

# Stop the application
docker-compose down

# Remove all containers and images
docker-compose down --rmi all

# Execute commands in the container
docker exec -it star-admin sh

# View container resource usage
docker stats star-admin
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs

# Check container status
docker-compose ps
```

### Port already in use
```bash
# Find what's using the port
sudo lsof -i :1025

# Change the port in docker-compose.yml
```

### Build fails
```bash
# Clean build
docker-compose down --rmi all
docker system prune -a
docker-compose up -d --build
```

### Memory issues
```bash
# Limit container memory in docker-compose.yml
services:
  star-admin:
    deploy:
      resources:
        limits:
          memory: 512M
```

## Security Best Practices

1. **Use a reverse proxy** (Nginx) with SSL
2. **Keep Docker updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
3. **Use environment variables** for sensitive data
4. **Enable firewall**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 1025/tcp
   sudo ufw enable
   ```
5. **Regular backups** of your application data

## Monitoring

### Check Application Health

```bash
# Manual health check
curl http://localhost:1025

# Container health status
docker inspect --format='{{.State.Health.Status}}' star-admin
```

### Auto-restart Configuration

The Docker Compose file includes `restart: unless-stopped`, which ensures the container automatically restarts if it crashes or the server reboots.

## Production Checklist

- [ ] Docker and Docker Compose installed
- [ ] Application builds successfully
- [ ] Container runs without errors
- [ ] Application accessible on the correct port
- [ ] Nginx reverse proxy configured (if applicable)
- [ ] SSL certificate installed (if using domain)
- [ ] Firewall configured properly
- [ ] Auto-restart enabled
- [ ] Monitoring/logging set up
- [ ] Backup strategy in place

## Support

For issues related to:
- **Next.js**: https://nextjs.org/docs
- **Docker**: https://docs.docker.com
- **Nginx**: https://nginx.org/en/docs

## License

Same as the main project.
