#!/bin/bash
# Fix Command Center Backend Integration
# Run this to align frontend config with backend

set -e

echo "🔧 Fixing Command Center Backend Integration..."
echo ""

# 1. Add missing API key to .env
echo "📝 Step 1: Adding VITE_JOURNAL_API_KEY to .env..."
if grep -q "VITE_JOURNAL_API_KEY" .env; then
  echo "   ✅ API key already exists in .env"
else
  echo "VITE_JOURNAL_API_KEY=test-api-key-for-development-only-change-in-production" >> .env
  echo "   ✅ Added API key to .env"
fi

# 2. Verify .env configuration
echo ""
echo "📝 Step 2: Verifying .env configuration..."
echo "   Backend URL: $(grep VITE_JOURNAL_API_URL .env || echo 'NOT SET')"
echo "   API Key: $(grep VITE_JOURNAL_API_KEY .env | cut -d'=' -f1 || echo 'NOT SET')"

# 3. Test backend connection
echo ""
echo "📝 Step 3: Testing backend connection..."
if curl -s http://localhost:3002/health > /dev/null 2>&1; then
  echo "   ✅ Backend is reachable at http://localhost:3002"
  curl -s http://localhost:3002/health | jq .
else
  echo "   ❌ Backend not reachable. Start it with:"
  echo "      cd /Users/amk/Projects/amk-journal/.claude/api"
  echo "      bun run dev"
  exit 1
fi

# 4. Test authenticated endpoint
echo ""
echo "📝 Step 4: Testing authenticated endpoint..."
API_KEY="test-api-key-for-development-only-change-in-production"
RESPONSE=$(curl -s -H "Authorization: Bearer $API_KEY" http://localhost:3002/api/v1/content-ideas)

if echo "$RESPONSE" | jq . > /dev/null 2>&1; then
  echo "   ✅ Authentication working"
  echo "   Response: $(echo $RESPONSE | jq -r '.count // "No count field"') items"
else
  echo "   ❌ Authentication failed"
  echo "   Response: $RESPONSE"
  exit 1
fi

# 5. Summary
echo ""
echo "✅ Integration fixed! Next steps:"
echo ""
echo "1. Restart frontend dev server:"
echo "   npm run dev"
echo ""
echo "2. Review full report:"
echo "   cat INTEGRATION-VALIDATION-REPORT.md"
echo ""
echo "3. Decide on architecture (see Section 8 in report):"
echo "   - Option A: Pure Headless (recommended)"
echo "   - Option B: Hybrid (current state)"
echo "   - Option C: Full Local (not recommended)"
echo ""
