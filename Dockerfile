# Use Node 20 Alpine as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Set environment variables
ENV MAIN_APP_URL=http://ecommerce-app:3000
ENV CHECKOUT_APP_URL=http://checkout-app:3001/checkout

# Expose port
EXPOSE 8080

# Start command
CMD ["npm", "start"]