#!/bin/bash

echo "Testing Melagri Backend API"
echo "============================"
echo ""

# Test root endpoint
echo "1. Testing root endpoint:"
curl -s http://localhost:5000/ | python3 -m json.tool
echo ""

# Test products
echo "2. Testing products endpoint:"
curl -s http://localhost:5000/api/products | python3 -m json.tool | head -n 40
echo ""

# Test single product
echo "3. Testing single product endpoint:"
curl -s http://localhost:5000/api/products/prod-001 | python3 -m json.tool
echo ""

# Test products by category
echo "4. Testing products by category (Animal Feeds):"
curl -s "http://localhost:5000/api/products?category=Animal%20Feeds" | python3 -m json.tool | head -n 30
echo ""

echo "✓ API tests completed"
