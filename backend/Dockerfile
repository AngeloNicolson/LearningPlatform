FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (include devDependencies for development)
RUN npm install

# Copy source code
COPY . .

# Create directories for file storage
RUN mkdir -p /app/storage/topics
RUN mkdir -p /app/storage/uploads

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]