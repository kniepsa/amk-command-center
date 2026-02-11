#!/bin/bash

# API Test Script for Command Center V2
# Tests the extract-entry and weekly/current endpoints

BASE_URL="http://localhost:5173"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================================"
echo "AMK Command Center V2 - API Tests"
echo "================================================"
echo ""

# Function to test an endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4

  echo -e "${YELLOW}Testing:${NC} $description"
  echo "  Method: $method"
  echo "  Endpoint: $endpoint"

  if [ "$method" = "POST" ]; then
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  else
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "200" ]; then
    echo -e "  ${GREEN}✓ Status: $http_code OK${NC}"
    echo "  Response:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
  else
    echo -e "  ${RED}✗ Status: $http_code FAILED${NC}"
    echo "  Response: $body"
  fi

  echo ""
}

# Check if server is running
echo "Checking if dev server is running..."
if ! curl -s "$BASE_URL" > /dev/null 2>&1; then
  echo -e "${RED}✗ Server not running at $BASE_URL${NC}"
  echo "Please start the dev server with: npm run dev"
  exit 1
fi
echo -e "${GREEN}✓ Server is running${NC}"
echo ""

# Test 1: Extract Entry - German Text
test_endpoint \
  "POST" \
  "/api/extract-entry" \
  '{"date":"2026-02-11","text":"Ins Bett um 22:00, 8h geschlafen, gute Qualität. High energy heute. Dankbar für Jani - sie hat mir Zeit gegeben zu arbeiten. Gegessen um 12:00 300g Joghurt mit Beeren."}' \
  "Extract Entry - German voice transcript"

# Test 2: Extract Entry - English Text
test_endpoint \
  "POST" \
  "/api/extract-entry" \
  '{"date":"2026-02-11","text":"Went to bed at 22:00, slept 8 hours, good quality. High energy today. Grateful for Linus - he put on his shoes himself. Ate at 18:30 salmon with vegetables."}' \
  "Extract Entry - English voice transcript"

# Test 3: Extract Entry - Minimal Text
test_endpoint \
  "POST" \
  "/api/extract-entry" \
  '{"date":"2026-02-11","text":"8h geschlafen"}' \
  "Extract Entry - Minimal input"

# Test 4: Extract Entry - Error (Missing date)
test_endpoint \
  "POST" \
  "/api/extract-entry" \
  '{"text":"8h geschlafen"}' \
  "Extract Entry - Error case (missing date)"

# Test 5: Weekly Current
test_endpoint \
  "GET" \
  "/api/weekly/current" \
  "" \
  "Get current week's priorities"

echo "================================================"
echo "Tests Complete!"
echo "================================================"
echo ""
echo "Next Steps:"
echo "  1. Review API responses above"
echo "  2. Check API-CONTRACTS.md for full documentation"
echo "  3. Agent 1 can now consume these endpoints in the frontend"
echo ""
