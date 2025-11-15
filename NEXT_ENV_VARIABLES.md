# Next.js Environment Variables Guide

**Your question:** "Please write a markdown for me. I want to learn this to avoid making the same mistake again."

## The Problem I Encountered

My production website was calling APIs to `localhost` instead of my production API URL, even though my `.env` file on the VPS had the correct production URL.

**Root Cause:** Next.js `NEXT_PUBLIC_*` environment variables are embedded at **BUILD TIME**, not runtime. The Docker image was built with my local development `.env.local` file, which hardcoded `http://localhost:5002` into the JavaScript bundle.

---

## How Next.js Environment Variables Work

### 1. **Two Types of Environment Variables**

| Type | Prefix | When It's Used | Where It Works |
|------|--------|----------------|----------------|
| **Public (Client-side)** | `NEXT_PUBLIC_*` | **Build time** | Browser + Server |
| **Private (Server-side)** | No prefix | Runtime | Server only |

### 2. **The Critical Difference**

#### `NEXT_PUBLIC_*` Variables (Build-time):
```typescript
// app/page.tsx
const apiUrl = process.env.NEXT_PUBLIC_API_URL; // ⚠️ EMBEDDED AT BUILD TIME
```

**What happens:**
1. During `npm run build`, Next.js reads `.env` files
2. Replaces `process.env.NEXT_PUBLIC_API_URL` with the actual value (e.g., `"http://localhost:5002"`)
3. **Hardcodes** this value into the JavaScript bundle
4. The built bundle is sent to the browser

**Result:** Changing `.env` on the VPS does nothing because the value is already baked into the code!

#### Non-prefixed Variables (Runtime):
```typescript
// app/api/route.ts (Server Component or API Route)
const apiKey = process.env.API_KEY; // ✅ READ AT RUNTIME
```

**What happens:**
1. Value is read from environment when the server runs
2. Can be changed by updating `.env` and restarting the server
3. **Never exposed to the browser**

---

## The Docker Build Problem

### What I Did Wrong ❌

```dockerfile
# Dockerfile (OLD - WRONG)
COPY . .                    # Copied .env.local with localhost
RUN npm run build           # Built with localhost hardcoded
```

When building on my local machine:
- `.env.local` had `NEXT_PUBLIC_API_URL=http://localhost:5002`
- This got hardcoded into the JavaScript bundle
- Pushed to Docker Hub with localhost embedded
- VPS pulled the image → still using localhost!

### The Correct Way ✅

```dockerfile
# Dockerfile (NEW - CORRECT)
COPY . .

# Set production environment variables for build
ARG NEXT_PUBLIC_API_URL=https://api.star.vividcats.org
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build           # Now builds with production URL
```

Now the build uses the production URL by default!

---

## Complete Workflow Guide

### Scenario 1: Building Locally, Deploying to VPS

#### Step 1: Build with Production ENV
```bash
# Option A: Set default in Dockerfile (recommended)
ARG NEXT_PUBLIC_API_URL=https://api.star.vividcats.org
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Option B: Pass at build time
docker build --build-arg NEXT_PUBLIC_API_URL=https://api.star.vividcats.org -t myapp .
```

#### Step 2: Push to Docker Hub
```bash
docker push myusername/myapp:latest
```

#### Step 3: Deploy on VPS
```bash
docker compose pull
docker compose up -d
```

### Scenario 2: Different Environments (Dev, Staging, Prod)

Use build arguments for flexibility:

```dockerfile
# Dockerfile
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build
```

Build different images:
```bash
# Development image
docker build --build-arg NEXT_PUBLIC_API_URL=http://localhost:5002 -t myapp:dev .

# Staging image
docker build --build-arg NEXT_PUBLIC_API_URL=https://staging-api.example.com -t myapp:staging .

# Production image
docker build --build-arg NEXT_PUBLIC_API_URL=https://api.example.com -t myapp:prod .
```

---

## Environment Variable Priority

Next.js reads environment variables in this order (highest to lowest priority):

1. `process.env` (system environment variables)
2. `.env.$(NODE_ENV).local` (e.g., `.env.production.local`)
3. `.env.local` ⚠️ **Not loaded when NODE_ENV=production**
4. `.env.$(NODE_ENV)` (e.g., `.env.production`)
5. `.env`

**During Docker build:**
- By default, `NODE_ENV=production`
- `.env.local` is **ignored**
- `.env.production` or `.env` is used (if exists)

---

## Best Practices

### ✅ DO

1. **Set production values as defaults in Dockerfile**
   ```dockerfile
   ARG NEXT_PUBLIC_API_URL=https://api.production.com
   ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
   ```

2. **Use different .env files for different environments**
   ```
   .env.local          # Local development (git-ignored)
   .env.production     # Production defaults (committed)
   .env.example        # Template for teammates (committed)
   ```

3. **Document all required environment variables**
   ```bash
   # .env.example
   NEXT_PUBLIC_API_URL=https://api.example.com
   ```

4. **Use CI/CD to build images with correct env vars**
   ```yaml
   # GitHub Actions
   - name: Build Docker Image
     run: |
       docker build \
         --build-arg NEXT_PUBLIC_API_URL=${{ secrets.PRODUCTION_API_URL }} \
         -t myapp:latest .
   ```

### ❌ DON'T

1. **Don't rely on runtime .env for NEXT_PUBLIC_* variables**
   ```bash
   # This WON'T work for NEXT_PUBLIC_* vars
   docker run -e NEXT_PUBLIC_API_URL=https://new-url.com myapp
   ```

2. **Don't commit .env.local to git**
   ```gitignore
   # .gitignore
   .env*.local
   ```

3. **Don't use NEXT_PUBLIC_* for secrets**
   ```typescript
   // ❌ WRONG - This will be exposed to browser!
   const apiKey = process.env.NEXT_PUBLIC_API_KEY;

   // ✅ CORRECT - Server-side only
   const apiKey = process.env.API_KEY;
   ```

---

## Debugging Checklist

When your environment variables don't work in production:

- [ ] Is it a `NEXT_PUBLIC_*` variable? → Must be set at **build time**
- [ ] Did you rebuild the Docker image after changing the variable?
- [ ] Did you push the new image to Docker Hub?
- [ ] Did you pull the latest image on your VPS?
- [ ] Check the built JavaScript bundle:
  ```bash
  # Inside the container
  docker exec -it myapp sh
  grep -r "localhost" .next/
  ```
- [ ] Verify environment during build:
  ```dockerfile
  RUN echo "Building with API URL: $NEXT_PUBLIC_API_URL"
  RUN npm run build
  ```

---

## Quick Reference

### For Client-Side Variables (Browser):
```typescript
// Must use NEXT_PUBLIC_ prefix
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```
**Set in:** Dockerfile ARG/ENV (build time)

### For Server-Side Variables:
```typescript
// No prefix needed (Server Components, API Routes, Server Actions)
const secret = process.env.API_SECRET;
```
**Set in:** docker-compose.yml env_file or environment (runtime)

---

## My Fix Summary

**Before:**
- Built Docker image on local machine with `.env.local` (localhost)
- Production got hardcoded localhost in JavaScript bundle
- Changing `.env` on VPS did nothing

**After:**
- Updated Dockerfile to set `NEXT_PUBLIC_API_URL=https://api.star.vividcats.org` during build
- Rebuilt and pushed new image
- Production now correctly uses production API URL

**Command to rebuild:**
```bash
cd D:\side-project\star-admin
docker build -t catsheue/star-admin:latest .
docker push catsheue/star-admin:latest
```

**On VPS:**
```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

---

## Additional Resources

- [Next.js Environment Variables Docs](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Docker ARG vs ENV](https://docs.docker.com/engine/reference/builder/#arg)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)

---

**Remember:** `NEXT_PUBLIC_*` = Build-time. If you change it, you must rebuild!
