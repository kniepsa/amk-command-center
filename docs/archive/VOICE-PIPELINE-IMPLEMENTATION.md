# Voice Recording Pipeline Implementation

## Summary

Successfully replaced mock implementations with real Replicate Whisper transcription and Claude Sonnet extraction.

## What Was Implemented

### 1. Transcribe API (`/api/transcribe`)

**File**: `/Users/amk/Projects/amk-command-center/src/routes/api/transcribe/+server.ts`

**Features**:

- Replicate Whisper Large V3 integration
- German language optimization (`language: "de"`)
- Audio file to base64 data URI conversion
- Async polling for transcription completion (60s timeout)
- Comprehensive error handling:
  - 401: Invalid API key
  - 429: Rate limit exceeded
  - 504: Transcription timeout
  - Network errors

**API Response**:

```typescript
{
  transcription: string,
  duration: number
}
```

### 2. Extract Entry API (`/api/extract-entry`)

**File**: `/Users/amk/Projects/amk-command-center/src/routes/api/extract-entry/+server.ts`

**Features**:

- Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)
- Prompt caching with `cache_control: ephemeral` (90% cost reduction)
- Extraction prompt copied from Journal API (lines 181-295)
- Confidence scoring (0-1 scale)
- Suggestion generation when confidence < 0.5
- Incremental data merging (appends to existing data)

**Extracted Data Types**:

- Energy level (high/medium/low/drained)
- Sleep (bedtime, wake_time, duration, quality)
- Habits (running, sauna, supplements, etc.)
- Intentions (2-3 focus areas)
- Gratitude (thing + why)
- Food (time, meal, portion_grams)
- People (@mentions with context)
- Tasks (content, area, context, status)
- Frameworks ([[framework-name]])
- Tags (#tag)
- Contexts (@calls, @office, etc.)

**Confidence Calculation**:

- Energy: 10%
- Intentions: 20%
- People: 20%
- Tasks/Work Log: 30%
- Tags: 20%

### 3. VoiceRecorder Component Updates

**File**: `/Users/amk/Projects/amk-command-center/src/lib/components/VoiceRecorder.svelte`

**New Features**:

- Offline detection (checks `navigator.onLine`)
- Specific microphone permission error messages
- Three loading states:
  - Recording (with timer)
  - Transcribing (Whisper Large V3)
  - Extracting (Claude Sonnet 4.5)
- Confidence badges:
  - < 50%: Yellow warning badge
  - 50-80%: Blue confidence badge
  - > 80%: No badge (high confidence)
- 60-second timeout for transcription
- Error recovery suggestions

**Error Messages**:

- Microphone access denied
- No microphone found
- Offline error
- Transcription timeout
- Rate limit warnings
- API key errors

### 4. Environment Variables

**File**: `/Users/amk/Projects/amk-command-center/.env`

**Added**:

```bash
REPLICATE_API_KEY=r8_your_replicate_api_key_here
ANTHROPIC_API_KEY=sk-ant-your_anthropic_api_key_here
```

**Note**: User needs to add their Replicate and Anthropic API keys.

## Testing Checklist

### Build Verification

- ✅ TypeScript compilation successful
- ✅ No build errors (only a11y warnings)
- ✅ All imports resolved correctly

### API Testing (Next Steps)

1. **Transcription API**:

   ```bash
   # Test with real audio file
   curl -X POST http://localhost:5173/api/transcribe \
     -F "audio=@recording.webm"
   ```

2. **Extraction API**:

   ```bash
   # Test with sample text
   curl -X POST http://localhost:5173/api/extract-entry \
     -H "Content-Type: application/json" \
     -d '{
       "date": "2026-02-13",
       "text": "Heute morgen 8h geschlafen, gute Qualität. High energy. Dankbar für Claude - helped me build fast."
     }'
   ```

3. **End-to-End Voice Recording**:
   - Open http://localhost:5173/voice
   - Click "Start Recording"
   - Speak in German: "Heute morgen 8h geschlafen, gute Qualität. High energy. Vampire shot genommen. Dankbar für Jani - sie unterstützt mich immer."
   - Click "Stop & Transcribe"
   - Verify transcription appears
   - Verify extraction confidence score
   - Check extracted data in browser console

## Cost Estimates

### Whisper Large V3 (Replicate)

- Cost: ~$0.001 per minute of audio
- 1 minute recording = $0.001
- 100 recordings/day = $0.10/day = $3/month

### Claude Sonnet 4.5 (with caching)

- Input: $3/MTok → **$0.30/MTok** with caching (90% off)
- Output: $15/MTok (no caching discount)
- Average extraction:
  - Input: ~2,500 tokens (prompt) = $0.00075
  - Output: ~500 tokens = $0.0075
  - **Total per extraction: ~$0.008**
- 100 extractions/day = $0.80/day = $24/month

**Total**: ~$27/month for 100 voice recordings/day

## Production Checklist

- [ ] Add Anthropic API key to `.env`
- [ ] Test microphone permissions in browser
- [ ] Test German transcription accuracy
- [ ] Test extraction confidence scoring
- [ ] Add auto-save after extraction completes
- [ ] Test offline error handling
- [ ] Test rate limiting (429 errors)
- [ ] Monitor API costs in production
- [ ] Set up error tracking (Sentry)

## Files Modified

1. `/Users/amk/Projects/amk-command-center/src/routes/api/transcribe/+server.ts` (38 → 132 lines)
2. `/Users/amk/Projects/amk-command-center/src/routes/api/extract-entry/+server.ts` (410 → 427 lines)
3. `/Users/amk/Projects/amk-command-center/src/lib/components/VoiceRecorder.svelte` (Updated)
4. `/Users/amk/Projects/amk-command-center/.env` (Added API keys)

## Reference Files

- Extraction prompt: `/Users/amk/Projects/amk-journal/.claude/api/services/llm-extraction.ts` (lines 181-295)
- Confidence calculation: Same file (lines 301-334)

## Next Steps

1. **Add ANTHROPIC_API_KEY** to `.env` file
2. **Run dev server**: `npm run dev`
3. **Test voice recording** at http://localhost:5173/voice
4. **Monitor logs** for API errors
5. **Verify extraction quality** with sample German text

## Architecture Decisions

### Why Replicate vs Groq?

- User explicitly requested Replicate Whisper Large V3
- German language optimization available
- Async polling pattern (standard for Replicate)

### Why Claude Sonnet 4.5 vs 3.5?

- Latest model with better German support
- Prompt caching reduces costs by 90%
- Temperature 0 for deterministic extraction

### Why Incremental Merging?

- User can record multiple voice notes per day
- Extraction appends to existing data (doesn't overwrite)
- Unique arrays (tags, people) prevent duplicates

### Why Confidence Scoring?

- Helps user identify when to re-record
- Triggers suggestions when < 0.5
- Based on data completeness, not AI certainty

---

**Implementation Date**: 2026-02-13
**Build Status**: ✅ Success
**TypeScript Errors**: 0
**Runtime Tested**: Pending (needs ANTHROPIC_API_KEY)
