# Docker Compose Troubleshooting Guide

## TL;DR - Build Takes Forever (10+ minutes or hangs)

**The build is SLOW because it's doing a lot of work inside the container:**
1. Installing 40+ npm packages from scratch (3-10 minutes)
2. Building Next.js production bundle (5-15 minutes)
3. All happening on a VPS with limited CPU/RAM

**Solutions to try (in order of effectiveness):**

### Option 1: Use Pre-built Image (Fastest - Recommended)
Build the image locally on your fast machine, push to Docker Hub, then pull on VPS.

```bash
# On your local machine:
docker build -t your-dockerhub-username/star-admin:latest .
docker push your-dockerhub-username/star-admin:latest

# On your VPS:
# Update docker-compose.yml to use: image: your-dockerhub-username/star-admin:latest
docker compose pull
docker compose up -d
```

### Option 2: Run Build in Foreground with Screen/Tmux
Don't use `-d` flag. Use `screen` or `tmux` so you can disconnect safely.

```bash
# Start a screen session
screen -S docker-build

# Run build in foreground (you can see progress)
docker compose up --build

# Detach: Press Ctrl+A, then D
# Reattach later: screen -r docker-build
```

### Option 3: Build Locally, Copy .next Folder (Hacky but Fast)
Build on your local machine, copy the `.next` folder to VPS, use a simpler Dockerfile.

---

## Common Issues When Running `docker compose up -d --build` on VPS

### Issue 1: Turbopack Build Flag (Most Common)

**Problem:** The build script uses `--turbopack` flag which is experimental and not recommended for production.

**Location:** `package.json:7`
```json
"build": "next build --turbopack"
```

**Solution:** Remove the `--turbopack` flag for production builds
```json
"build": "next build"
```

**Why it fails:**
- Turbopack is experimental and can hang indefinitely
- May crash silently during Docker builds
- Uses excessive memory on resource-limited VPS

---

### Issue 2: Missing .env File

**Problem:** `docker-compose.yml` references `.env` file that might not exist on VPS.

**Location:** `docker-compose.yml:7-8`
```yaml
env_file:
  - .env
```

**Solution:** Either:
1. Ensure `.env` file exists on VPS before running docker compose
2. Make it optional by removing the `env_file` section if not needed
3. Use `.env.example` as template to create `.env`

---

### Issue 3: Insufficient VPS Resources

**Problem:** Next.js build requires significant memory and disk space.

**Minimum Requirements:**
- 2GB RAM (4GB recommended)
- 2GB free disk space
- Swap space configured

**Debug Commands:**
```bash
# Check available memory
free -h

# Check disk space
df -h

# Check if swap is enabled
swapon --show
```

**Solution:** Add memory limits to prevent OOM kills
```yaml
services:
  star-admin:
    container_name: star-admin
    build: .
    ports:
      - "127.0.0.1:1025:3000"
    env_file:
      - .env
    restart: always
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

---

### Issue 4: Next.js 16 + React 19 Compatibility

**Problem:** Using bleeding-edge versions that may have stability issues.

**Current Versions:**
- Next.js: 16.0.0
- React: 19.2.0

**Note:** These are very new versions. Consider using stable LTS versions if issues persist.

---

## Why Does the Build Take So Long?

**Normal build time on a low-spec VPS: 15-30 minutes**

The Dockerfile does these expensive operations:
1. `npm install` - Downloads and installs 40+ packages (5-10 min)
2. `npm run build` - Next.js production build, optimizes all code (10-20 min)

**This is happening INSIDE the container on your VPS with limited resources.**

### How to Tell if It's Actually Working or Hung

```bash
# Option 1: Watch real-time logs
docker compose logs -f star-admin

# Option 2: Check if npm process is running
docker compose exec star-admin ps aux

# Option 3: Monitor CPU usage (if npm/node is using CPU, it's working)
docker stats

# Option 4: Build without -d to see live output
docker compose up --build
```

**If you see CPU usage and logs updating, it's working - just SLOW.**

---

## Debugging Steps

### 1. Check if Build is Actually Hung or Just Slow
```bash
# Watch build logs in real-time
docker compose logs -f

# In another terminal, check CPU usage
docker stats

# If CPU is at 0% for 5+ minutes = hung
# If CPU is 50-100% = working (just slow)
```

### 2. Use Screen/Tmux to Keep Build Running When You Disconnect
```bash
# Install screen (if not installed)
sudo apt install screen  # Debian/Ubuntu
sudo yum install screen  # CentOS/RHEL

# Start a screen session
screen -S docker-build

# Run your docker compose command
docker compose up --build

# Detach from screen: Ctrl+A, then press D
# Now you can disconnect from VPS

# Later, reconnect to VPS and reattach
screen -r docker-build
```

### 3. Check VPS Resources
```bash
# Check available memory
free -h

# Check disk space
df -h

# Check if swap is enabled (important for low-memory VPS)
swapon --show

# If no swap, add some:
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 4. Clean Build (Fresh Start)
```bash
# Remove all containers and images
docker compose down --rmi all --volumes

# Clear Docker cache
docker system prune -a

# Rebuild from scratch
docker compose up -d --build
```

---

## Quick Fixes Checklist

- [ ] Remove `--turbopack` flag from `package.json` build script
- [ ] Ensure `.env` file exists on VPS
- [ ] Verify VPS has at least 2GB RAM available
- [ ] Check VPS has sufficient disk space (2GB+)
- [ ] Add `.dockerignore` file to reduce build context
- [ ] Add memory limits to `docker-compose.yml`
- [ ] Consider using stable Next.js version instead of 16.0.0

---

## Recommended .dockerignore

Create this file to reduce build context and speed up builds:

```
node_modules
.next
.git
.env.local
.env.*.local
*.log
.DS_Store
README.md
.vscode
.idea
```

---

## Additional Resources

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Turbopack Status](https://nextjs.org/docs/architecture/turbopack)
