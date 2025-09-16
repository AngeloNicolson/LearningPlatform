FROM node:18-alpine

WORKDIR /app

# Install PostgreSQL client for database connections
RUN apk add --no-cache postgresql-client

# Copy package files
COPY package.json ./

# Install dependencies (including dev for build)
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Start server
CMD ["npm", "run", "start"]