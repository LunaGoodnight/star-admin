FROM node:18
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
# If you use npm with lockfile
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
# Make sure "start" is in your package.json scripts