#!/bin/bash

# Check for processes using port 3000
pid=$(lsof -t -i:3000)

if [ ! -z "$pid" ]; then
    echo "Process found on port 3000. Attempting to kill..."
    kill $pid
    sleep 2  # Wait for 2 seconds to ensure the process is terminated
fi

# Start the development server
echo "Starting development server..."
npm run dev