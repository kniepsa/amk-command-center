# Technical Debt

## Critical Priority (P0+ - Blockers from Phase 2 Validation)

### Phase 2 Integration Gap (Added 2026-02-14)

**CRITICAL**: Backend services built but ZERO frontend integration. Overall validation score: 3.5/10

- **Missing API Endpoints (4 hours)**: Backend has `deal-intelligence.ts` (361 lines) with fit scoring, red flags, recommendations but NO HTTP endpoints. Need:
  - `GET /api/v1/buyers/:id/fit-score`
  - `GET /api/v1/buyers/:id/red-flags`
  - `POST /api/v1/buyers/:id/recommendations`
  - `GET /api/v1/reviews/weekly` (M&A-specific, not generic GTD)

- **M&A UI Components Missing (6 hours)**: Frontend has NO components for Phase 2 features:
  - Fit score visualization (0-100 gauge)
  - Red flag alert cards with coaching
  - Recommendation cards with copy-paste scripts
  - M&A weekly review page (top 3 buyers, ROI, ghosting alerts)

- **Voice→CRM Pipeline Disconnected (2 hours)**: Voice page exists but doesn't call `VoiceCRMUpdater` service. No auto-update of buyer.offerAmount, tier, fitScore from voice input.

- **Telegram Bot Not Integrated (4 hours)**: Service exists (`telegram-bot.ts`, 360 lines) but not connected to weekly insights or scheduler.

**Impact**: 16 hours of backend work produces 0 user-facing features without integration layer.

## High Priority (P0 - Blockers)

### M&A Tracker Frontend Issues (Added 2026-02-15 - Post Pure Headless Migration)

**NOTE**: Fix AFTER Command Center is 100% working

- **No data in pipeline view**: Frontend displays empty state despite backend having buyer data
- **Can't select buyer in quick log**: Buyer selection dropdown not functioning
- **No UI to add new buyer**: Missing "Add Buyer" button/form in frontend
- **Root Cause**: Likely SDK client configuration mismatch or API endpoint changes during migration

**Effort**: 2-3 hours investigation + fixes
**Blocks**: M&A Tracker usability

### Phase 0 Critical Blockers (Added 2026-02-14 - Agent 6 Review)

- **Backend API Missing for Entry Undo**: `/api/entries/revert` endpoint required for action-history undo to work on entry saves. Without this, undo fails silently and breaks trust. (Effort: 30min, Blocks: Phase 0.2)
- **Sunday Notification setTimeout() Browser-Dependent**: Weekly review trigger uses setTimeout() which fails when browser closed. Must implement Service Worker persistent scheduling with IndexedDB. Breaks External Trigger (Nir Eyal). (Effort: 1h, Blocks: Phase 0.3)

### Existing P0 Blockers

- **API extraction endpoint fails**: `TypeError: Failed to fetch` at `/api/extract-entry` - Claude API integration exists but failing in production
- **Habit click navigation bug**: Clicking habit streaks navigates to wrong tabs (Joe Gebbia expert review found this)
- **No keyboard shortcut for voice**: Green circle requires mouse click - blocks hands-free usage while driving
- **No audio feedback**: Silent confirmations create distrust - need TTS "Habit marked", "Entry saved"

## Medium Priority (P1 - High Impact)

### Phase 2 Security Issues (from Phase 1 review - still apply)

- **XSS Vulnerability (10 min)**: Voice transcription can inject `<script>` tags if using `{@html}` without DOMPurify sanitization
- **No Rate Limiting (45 min)**: `/api/v1/transcribe` has no rate limit - DoS attack vector (10K requests/min)
- **Insufficient Input Validation (20 min)**: No max length check (5000 char limit needed), workspace ID needs regex validation

### Phase 0 Medium Priority (Added 2026-02-14 - Agent 6 Review)

- **VoiceInboxCategorizer Component Underspecified**: Only 45 lines example code for 2-hour component. Missing error states, unrecognized command fallback, keyboard shortcuts, audio feedback, driving optimizations. (Effort: 1h)
- **Fuzzy Matcher Tie-Breaker Missing**: When 2 candidates score within 0.05, system picks first alphabetically = 50% wrong. Need disambiguation dialog. (Effort: 30min)
- **No Integration Rollback Plan**: Wiring 5 agents without git tags, incremental testing, or feature flags = high risk. (Effort: 30min)
- **Batch Operation Fuzzy Matching Missing**: Batch parser doesn't integrate fuzzy matching - requires EXACT names, defeats purpose. (Effort: 45min)
- **Entry Save Undo Missing UndoToast Integration**: UndoToast component exists but not wired to new undo integrations. (Effort: 15min)

### Existing P1 Items

- **Voice commands for habits**: "Mark running complete" pattern not implemented
- **Missing external triggers**: No push notifications, email reminders, calendar integration (Nir Eyal Hook Model)
- **Missing variable rewards**: Streaks are predictable - need AI insights, unlockables, random coach appearances
- **GTD context filters missing**: No @calls, @office, @computer buttons for next actions
- **Too many urgent tasks**: 15 items = decision paralysis. Need Warren Buffett 25/5 enforcement (max 3)

## Medium Priority (P2 - Feature Debt)

- **Tag grouping UX**: 23 tag buttons in CRM tab might overwhelm users - consider grouping by category or collapsible sections
- **Coach system not implemented**: Coach challenges framework exists but auto-activation triggers and message generation need Claude API
- **Voice transcription API stub**: `/api/transcribe` endpoint created but needs Replicate Whisper Large V3 integration (requires REPLICATE_API_KEY in .env)
- **Learning course chat integration**: Courses exist but don't trigger automatically in chat when empty
- **Coach detection in chat**: Pattern matching to trigger relevant coaches not implemented
- **Collapsible Morning Ritual**: Progressive disclosure needed - ritual blocks access to other features

## Low Priority (P3 - Nice-to-Have, Improves UX)

### Phase 0 Low Priority Quick Wins (Added 2026-02-14 - Agent 6 Review)

- **Phonetic Matching for Names**: Levenshtein fails on phonetically similar names. Add Soundex/Metaphone for person entities. (Effort: 45min, Impact: Better voice CRM UX)
- **Dynamic Overlay Timing**: 3-second fixed auto-dismiss vs dynamic based on message length (60ms/char). (Effort: 15min, Impact: Better error readability)
- **Warm Audio Messages Throughout**: Replace robotic "Please review 3 fields" with warm "Quick check - I found 3 things that need your eyes". (Effort: 15min, Impact: +1.2 Joe Gebbia score)
- **Confidence Badges for Uncertain Fields**: Add green/yellow/red % badges to ClarifyModal uncertain fields. (Effort: 20min, Impact: +0.8 Joe Gebbia Trust score)
- **Voice Command Confirmation Feedback**: Add audio "Got it - saving your entry now" after "looks good" command. (Effort: 10min, Impact: Builds trust)
- **Expert Score Validation Rubric**: Create objective checklist for each expert framework vs subjective guessing. (Effort: 30min, Impact: Measurable success)

### Existing P3 Items

- **PWA capabilities**: Add offline functionality and cross-platform app install for true seamless experience
- **Keyboard shortcuts**: Missing keyboard navigation for power users (e.g., Cmd+Enter to submit chat)
- **ZenQuotes rate limiting**: No fallback when 100/day limit hit - should cache daily quote locally
- **Data validation on save**: Entry persistence API doesn't validate YAML schema before writing files

## Resolved This Session ✅

- ~~**Phase 1 Voice Everywhere Implementation**: 5 agents built floating voice button (⌘V), contextual buyer cards, backend transcription API, voice command parser (20 commands), phonetic name matching~~ → Completed 2026-02-14
- ~~**Phase 1 Code Review**: Validated against Context7 + Serper best practices. Score 8.3/10. Found 3 security issues (XSS, rate limiting, input validation)~~ → Completed 2026-02-14

## Archive (Previous Sessions)

- ~~**Weekly priorities API incomplete**: `/api/weekly/current` returns mock data~~ → Fixed: Now reads from amk-journal/users/amk/weekly-plans/ using gray-matter for frontmatter parsing (2026-02-13)
- ~~**Urgent items API incomplete**: `/api/urgent` returns mock data~~ → Fixed: Now reads from amk-journal/users/amk/next.md with GTD-style parsing (2026-02-13)
- ~~**Missing dependencies after npm --legacy-peer-deps**: gray-matter install removed tailwindcss, js-yaml~~ → Fixed: Reinstalled tailwindcss@4.1.18, @tailwindcss/postcss, js-yaml@4.1.1, @types/js-yaml (2026-02-13)
- ~~**Mobile responsiveness**: App not tested on mobile devices~~ → Fixed via Joe Gebbia Option 3 responsive layout (2026-02-11)
- ~~**Accessibility warnings**: Labels need controls, click handlers need keyboard events~~ → Fixed via unique IDs, proper for/id associations (2026-02-11)
- ~~**Error handling UI**: Generic error messages~~ → Fixed with specific recovery guidance (2026-02-11)
- ~~**Touch targets too small**: Interactive elements below 44px minimum~~ → Fixed all buttons, checkboxes, inputs to ≥44px (2026-02-11)

---

## Summary

**Phase 2 Critical Gap (2026-02-14)**:

- **Status**: Backend services 100% complete, Frontend integration 0% complete
- **Validation Score**: 3.5/10 (FAIL)
- **Fix Required**: 16 hours (4h API endpoints + 6h UI components + 2h voice pipeline + 4h Telegram)
- **Impact**: Without integration, 4 parallel agents built dead code

**Phase 0 Code Quality Review Impact (2026-02-14)**:

- **Items Added**: 13 (2 High, 5 Medium, 6 Low)
- **Total Effort**: High (1h 30min) + Medium (3h 45min) + Low Quick Wins (2h 5min) = **7h 20min**
- **Quality Impact**: Fixes improve expert scores 7.5/10 → 9.2/10 (+23% improvement)
- **ROI**: +44% time investment buys +23% quality - difference between "nice tool" and "entrepreneurs tell their EO Forum"

---

_Last updated: 2026-02-14 (Phase 2 Validation)_
