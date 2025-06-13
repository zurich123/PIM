#!/bin/bash

echo "Testing C# ProductFlow API Implementation"
echo "========================================"

# Kill any existing dotnet processes
pkill -f "dotnet run" 2>/dev/null || true

cd csharp-api

# Build the project
echo "Building C# API..."
dotnet build --verbosity quiet

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

# Start the API server on port 6000
echo "Starting C# API server on port 6000..."
dotnet run --urls "http://0.0.0.0:6000" --verbosity quiet &
DOTNET_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 10

# Test health endpoint
echo "Testing health endpoint..."
curl -s http://localhost:6000/health
echo

# Test categories endpoint with API key
echo "Testing categories endpoint..."
curl -s -H "x-api-key: test-api-key-12345" http://localhost:6000/api/external/categories
echo

# Test products endpoint with API key
echo "Testing products endpoint..."
curl -s -H "x-api-key: test-api-key-12345" http://localhost:6000/api/external/products
echo

# Test without API key (should fail)
echo "Testing without API key (should return 401)..."
curl -s -w "\nHTTP Status: %{http_code}\n" http://localhost:6000/api/external/categories
echo

# Test Swagger endpoint
echo "Testing Swagger UI availability..."
curl -s -I http://localhost:6000/swagger | head -1

# Clean up
echo "Stopping server..."
kill $DOTNET_PID 2>/dev/null || true

echo "C# API test completed!"