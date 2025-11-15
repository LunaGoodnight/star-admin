# Deployment Guide - Solution 3: Pre-built Image

## Prerequisites

1. Docker Desktop installed and running on your local machine
2. Docker Hub account (free at https://hub.docker.com)
3. Local machine is faster than your VPS

## Step-by-Step Instructions

### Step 1: Start Docker Desktop

Make sure Docker Desktop is running on your local machine:

```bash
# Test if Docker is running
docker --version
```

### Step 2: Login to Docker Hub

```bash
# Login to Docker Hub (replace with your username)
docker login

# Enter your Docker Hub username and password when prompted
```

### Step 3: Build the Image Locally (On Your Fast Machine)

```bash
# Build the image (this will take 10-20 minutes on your local machine)
docker build -t star-admin:latest .

# You'll see output like:
# [+] Building 123.4s
# => [internal] load build definition
# => [stage-0 1/8] FROM docker.io/library/node:20-alpine
# => [stage-0 2/8] COPY package.json ./
# => [stage-0 3/8] RUN npm install
# => [stage-0 4/8] COPY . .
# => [stage-0 5/8] RUN npm run build
# ...
```

### Step 4: Tag the Image for Docker Hub

```bash
# Replace YOUR_DOCKERHUB_USERNAME with your actual username
docker tag star-admin:latest YOUR_DOCKERHUB_USERNAME/star-admin:latest

# Example:
# docker tag star-admin:latest johndoe/star-admin:latest
```

### Step 5: Push to Docker Hub

```bash
# Push to Docker Hub (replace with your username)
docker push YOUR_DOCKERHUB_USERNAME/star-admin:latest

# This uploads the pre-built image (takes 5-10 minutes depending on internet speed)
```

### Step 6: Update docker-compose.prod.yml

Edit `docker-compose.prod.yml` and replace `YOUR_DOCKERHUB_USERNAME` with your actual Docker Hub username:

```yaml
services:
  star-admin:
    container_name: star-admin
    image: YOUR_DOCKERHUB_USERNAME/star-admin:latest  # <- Update this line
    ports:
      - "127.0.0.1:1025:3000"
    env_file:
      - .env
    restart: always
```

### Step 7: Deploy to VPS

Upload `docker-compose.prod.yml` to your VPS, then run:

```bash
# On your VPS:

# Pull the pre-built image from Docker Hub (fast, 2-5 minutes)
docker compose -f docker-compose.prod.yml pull

# Start the container (instant!)
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

## Time Comparison

| Method | VPS Build Time | Local Build Time | Total Time |
|--------|----------------|------------------|------------|
| **Old way** (build on VPS) | 15-30 minutes | N/A | 15-30 min |
| **New way** (pre-built) | 2-5 minutes (pull only) | 10-20 minutes | 12-25 min |

**Advantage:** Your local machine builds faster, and subsequent deployments only need to pull (2-5 min)!

## Updating the Application

When you make changes to your code:

```bash
# 1. On local machine: rebuild and push
docker build -t YOUR_DOCKERHUB_USERNAME/star-admin:latest .
docker push YOUR_DOCKERHUB_USERNAME/star-admin:latest

# 2. On VPS: pull and restart
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### "Docker is not running"
Start Docker Desktop on your local machine.

### "denied: requested access to the resource is denied"
Run `docker login` and enter your credentials.

### "Cannot connect to Docker daemon on VPS"
Make sure Docker is installed on your VPS:
```bash
sudo apt update
sudo apt install docker.io docker-compose-v2
sudo systemctl start docker
sudo usermod -aG docker $USER
# Log out and back in for group changes to take effect
```

### Image is private/can't pull on VPS
Your Docker Hub repository is private. Either:
1. Make it public in Docker Hub settings, OR
2. Run `docker login` on your VPS before pulling

## Alternative: Use GitHub Container Registry (ghcr.io)

If you prefer GitHub over Docker Hub:

```bash
# 1. Create a Personal Access Token on GitHub with write:packages permission

# 2. Login to GitHub Container Registry
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# 3. Tag and push
docker tag star-admin:latest ghcr.io/YOUR_GITHUB_USERNAME/star-admin:latest
docker push ghcr.io/YOUR_GITHUB_USERNAME/star-admin:latest

# 4. Update docker-compose.prod.yml
# image: ghcr.io/YOUR_GITHUB_USERNAME/star-admin:latest
```

## Notes

- The pre-built image is ~500MB-1GB compressed
- First pull takes 2-5 minutes depending on VPS internet speed
- Subsequent deployments are much faster (only changed layers are pulled)
- You can also automate this with GitHub Actions (CI/CD)
