FROM node:20-alpine
# Create a non-root user and group (with UID and GID 1001)
RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
# If you use npm with lockfile
RUN npm install
COPY . .
RUN npm run build
# Copy .env file to standalone output
RUN cp .env .next/standalone/.env || echo ".env not found, skipping copy"
# Also copy public and static folders for standalone
RUN cp -r public .next/standalone/public || true
RUN cp -r .next/static .next/standalone/.next/static || true
# Change ownership of app files (good security!)
RUN chown -R appuser:appgroup /app
EXPOSE 3000
# Switch to non-root user
USER appuser
CMD ["node", ".next/standalone/server.js"]
# Make sure "start" is in your package.json scripts