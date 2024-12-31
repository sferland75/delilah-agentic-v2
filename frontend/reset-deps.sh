#!/bin/bash
# Remove existing dependencies
rm -rf node_modules
rm -f package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install

# Start development server
npm run dev