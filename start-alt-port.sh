#!/bin/bash
# Start the server with an alternate port (5001)
echo "Starting server on port 5001..."
PORT=5001 NODE_ENV=development tsx server/index.ts