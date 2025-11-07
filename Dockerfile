# Use a lightweight base image
FROM node:20-alpine

# Create a non-root user and group (with UID and GID 1001)
RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser

# Set working directory
WORKDIR /app

# Copy dependency files first for layer caching
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Build the Next.js application
RUN npm run build

# Change ownership of app files (good security!)
RUN chown -R appuser:appgroup /app

# Expose the app port (Next.js default is 3000)
EXPOSE 3000

# Switch to non-root user
USER appuser

# Start your Next.js app (confirm "start" exists in scripts)
CMD ["npm", "start"]