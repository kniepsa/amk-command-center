# Integration Test Guide

## Quick Test Checklist

### 1. Test Coaches API

```bash
# Test GET (load config)
curl http://localhost:5173/api/coaches/config

# Should return 7 coaches with settings
```

### 2. Test Weekly Priorities API

```bash
# Test current week priorities
curl http://localhost:5173/api/weekly/current

# Should return priorities array (may be empty if no weekly plan)
```

### 3. Test Extraction API

```bash
# Test with sample text
curl -X POST http://localhost:5173/api/extract-entry \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-11",
    "text": "Ins Bett um 22:00, aufgewacht um 06:00. 8h geschlafen, gute Qualität. High energy heute. Running, sauna, sales learning. Intention: Leon follow-up R25M hybrid. Dankbar für family time."
  }'

# Should return extracted data with sleep, energy, habits, intentions, gratitude
```

### 4. Test UI Flow

1. Start dev server: `npm run dev`
2. Navigate to "Today" tab
3. Paste voice transcript:
   ```
   Had a call with Leon about the R25M hybrid deal.
   Need to follow up on the valuation structure.
   Also planning sales pitch for Jerome tomorrow.
   ```
4. Click "Send"

**Expected Behavior**:

- ✅ Loading spinner appears
- ✅ Extraction preview updates on right sidebar
- ✅ Coach challenge card appears (Machiavelli or M&A Advisor)
- ✅ Weekly priorities visible on left sidebar

### 5. Test Coach Triggers

Try these phrases to trigger different coaches:

| Phrase                               | Expected Coach     |
| ------------------------------------ | ------------------ |
| "Leon hybrid structure R25M"         | Machiavelli        |
| "Sales pitch for Colin tomorrow"     | Sales Coach (SPIN) |
| "Exit valuation for Printulu"        | M&A Advisor        |
| "@linus struggling with homework"    | Parenting Guru     |
| "Feeling stressed about deadline"    | Stoic Advisor      |
| "Team conflict with @francis"        | Bill Campbell      |
| "Big decision on Germany investment" | Peter Drucker      |

### 6. Test Error Handling

1. Stop backend server (kill API routes)
2. Try submitting message
3. **Expected**: Red error toast appears, doesn't crash UI

### 7. Test Loading States

1. Submit long message
2. **Expected**:
   - Send button shows "Processing..."
   - Send button is disabled
   - Loading spinner in chat
   - Weekly priorities show spinner if first load

---

## Manual Test Results

Date: 2026-02-11
Tester: [Your name]

- [ ] Coaches API returns 7 coaches
- [ ] Weekly API returns priorities
- [ ] Extraction API parses text correctly
- [ ] Coach cards appear in chat
- [ ] Error handling works
- [ ] Loading states display correctly

---

## Known Issues

1. TypeScript warnings for Node.js types (non-blocking)
2. Save button not yet wired to journal persistence
3. Coach messages are templated (not dynamic from Claude API)

---

**Integration Status**: ✅ READY FOR QA
