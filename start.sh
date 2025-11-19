#!/bin/bash
set -e

echo "Installing dependencies..."
npm install --production

echo "Starting server..."
npm start

chmod +x start.sh
