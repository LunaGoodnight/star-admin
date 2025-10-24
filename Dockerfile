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
# Change ownership of app files (good security!)
RUN chown -R appuser:appgroup /app
EXPOSE 3000
# Switch to non-root user
USER appuser
CMD ["npm", "start"]
# Make sure "start" is in your package.json scripts