#!/bin/bash
set -e
cd frontend
npm install
npm run build
echo "Build completed successfully!"
