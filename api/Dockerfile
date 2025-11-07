FROM node:18-alpine

# Install openssl for certificate generation
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies (including dev for build)
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create upload directories and certs directory
RUN mkdir -p /app/uploads/worksheets /app/uploads/images /app/certs

# Copy and set up entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port
EXPOSE 3001

# Use entrypoint script to check/generate certificates before starting
ENTRYPOINT ["/entrypoint.sh"]

# Start server (passed to entrypoint)
CMD ["npm", "start"]