#!/bin/bash
# Test script for voice journal API endpoints

set -e

BASE_URL="${BASE_URL:-http://localhost:5173}"

echo "=========================================="
echo "Testing Journal API Endpoints"
echo "=========================================="
echo ""

# Test 1: Extract Entry Endpoint
echo "Test 1: POST /api/extract-entry"
echo "----------------------------------------"
curl -s -X POST "${BASE_URL}/api/extract-entry" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-11",
    "text": "Heute ins Bett um 23:00, aufgewacht um 07:30. 8h geschlafen, gute Qualität. High energy. Running gemacht, Sauna. Dankbar für family time - quality moments with kids. Gegessen um 12:00 300g Joghurt mit Beeren. 90 minutes worked on printulu exit deal with Colin."
  }' | jq . || echo "FAILED"

echo ""
echo ""

# Test 2: Extract Entry with Existing Data
echo "Test 2: POST /api/extract-entry (with existing)"
echo "----------------------------------------"
curl -s -X POST "${BASE_URL}/api/extract-entry" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-11",
    "text": "Auch noch journaling gemacht heute.",
    "existing": {
      "energy": "high",
      "habits": {
        "running": true,
        "sauna": true
      }
    }
  }' | jq . || echo "FAILED"

echo ""
echo ""

# Test 3: Save Entry Endpoint
echo "Test 3: POST /api/entries/2026-02-11"
echo "----------------------------------------"
curl -s -X POST "${BASE_URL}/api/entries/2026-02-11" \
  -H "Content-Type: application/json" \
  -d '{
    "frontmatter": {
      "date": "2026-02-11",
      "energy": "high",
      "schema_version": 2,
      "habits": {
        "running": "✓",
        "sauna": "✓",
        "journaling": "✓"
      },
      "sleep": {
        "bedtime": "23:00",
        "wake_time": "07:30",
        "duration": "8h",
        "quality": "good"
      },
      "gratitude": [
        {
          "thing": "family time",
          "why": "quality moments with kids"
        }
      ],
      "food": [
        {
          "time": "12:00",
          "meal": "Joghurt mit Beeren",
          "portion_grams": [300]
        }
      ],
      "tags": ["parenting", "health"],
      "people": ["linus", "anton", "cari"]
    },
    "body": "## Morning\n\nStarted day with energy. Good sleep quality.\n\n## Afternoon\n\nFamily time with kids.\n\n## Work\n\n90 minutes on printulu exit deal discussion with Colin.\n"
  }' | jq . || echo "FAILED"

echo ""
echo ""

# Test 4: Get Entry Endpoint
echo "Test 4: GET /api/entries/2026-02-11"
echo "----------------------------------------"
curl -s "${BASE_URL}/api/entries/2026-02-11" | jq . || echo "FAILED"

echo ""
echo ""

# Test 5: Error Handling - Missing Fields
echo "Test 5: Error Handling - Missing Fields"
echo "----------------------------------------"
curl -s -X POST "${BASE_URL}/api/extract-entry" \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-02-11"}' | jq . || echo "EXPECTED: Should return 400 error"

echo ""
echo ""

# Test 6: Error Handling - Invalid Date Format
echo "Test 6: Error Handling - Invalid Date"
echo "----------------------------------------"
curl -s -X POST "${BASE_URL}/api/entries/2026-2-11" \
  -H "Content-Type: application/json" \
  -d '{"frontmatter": {}, "body": "test"}' | jq . || echo "EXPECTED: Should return 400 error"

echo ""
echo ""
echo "=========================================="
echo "All tests completed"
echo "=========================================="
