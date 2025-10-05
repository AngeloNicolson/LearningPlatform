FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies (including dev for build)
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create upload directories
RUN mkdir -p /app/uploads/worksheets /app/uploads/images

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start"]