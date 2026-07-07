#!/bin/bash

# NGO Website VPS Final Setup Script
echo "🚀 Starting NGO Website VPS Final Setup..."

# Navigate to project directory
cd /var/www/ngo-website

# Stop any existing PM2 processes for this specific app
echo "Stopping existing PM2 processes..."
pm2 stop ngo-website 2>/dev/null || true
pm2 delete ngo-website 2>/dev/null || true
pm2 stop iskcon-juhu 2>/dev/null || true
pm2 delete iskcon-juhu 2>/dev/null || true


# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building project..."
npm run build

# Start with PM2 using the correct config
echo "Starting application with PM2..."
pm2 start ecosystem.config.cjs

# Wait for startup
sleep 5

# Check status
echo "Checking PM2 status..."
pm2 status

# Test the application
echo "Testing application..."
curl -I http://localhost:3000

# Show final status
echo "🎉 Setup complete!"
echo "Your NGO Website system should now be running on port 3000"
echo "Access it at: http://YOUR_VPS_IP:3000"
echo "Admin panel: http://YOUR_VPS_IP:3000/admin"