# Strategic Intelligence - File Manifest

All files created for the Strategic Intelligence system.

---

## Core Utilities (4 files, ~1,349 lines)

### 1. `src/lib/utils/bias-detector.ts` (266 lines)

**Purpose**: Detects cognitive biases in text
**Exports**:

- `detectBiases(text: string): BiasDetection[]`
- `getBiasSummary(detections: BiasDetection[]): Summary`

**Bias Types**: Sunk Cost, Confirmation, Anchoring, Availability, Optimism, Loss Aversion
**Severity Levels**: High, Medium, Low
**Dependencies**: None

---

### 2. `src/lib/utils/contrarian-agent.ts` (347 lines)

**Purpose**: Generates opposite perspective on decisions
**Exports**:

- `generateContrarianView(decision: string, reasoning: string): ContrarianView`
- `analyzeDecisions(text: string): Array<{decision, contrarian}>`

**Features**: Entity extraction, probability calculation (30-85%), challenging questions
**Dependencies**: None

---

### 3. `src/lib/utils/first-principles-challenger.ts` (360 lines)

**Purpose**: Challenges assumptions to find fundamental truths
**Exports**:

- `challengeAssumptions(text: string): FirstPrinciplesChallenge[]`
- `getChallengeSummary(challenges: FirstPrinciplesChallenge[]): Summary`

**Assumption Types**: Necessity, Social Proof, Constraint, Absolute, Obligation, Limitation, Causation
**Dependencies**: None

---

### 4. `src/lib/utils/roi-estimator.ts` (376 lines)

**Purpose**: Estimates value/cost for tasks and recommends prioritization
**Exports**:

- `estimateTaskROI(task: string, context?: string): ROIEstimate`
- `batchEstimateROI(tasks: string[], context?: string): ROIEstimate[]`
- `getROISummary(estimates: ROIEstimate[]): Summary`

**Recommendations**: Do Now, Do Later, Delegate, Drop
**Dependencies**: None

---

## UI Components (2 files, ~434 lines)

### 5. `src/lib/components/StrategicIntelligence.svelte` (289 lines)

**Purpose**: Main UI component with 4 tabs
**Props**:

```typescript
{
  text: string;
  decision?: string;
  reasoning?: string;
  tasks?: string[];
}
```

**Tabs**: Bias Alerts, Contrarian View, First Principles, ROI Estimator
**Dependencies**: All 4 utilities

---

### 6. `src/routes/intelligence/+page.svelte` (145 lines)

**Purpose**: Demo page with examples and usage guide
**Features**: Live editing, pre-loaded examples, interactive testing
**URL**: `/intelligence`
**Dependencies**: StrategicIntelligence.svelte

---

## Documentation (3 files, ~800 lines)

### 7. `STRATEGIC-INTELLIGENCE.md` (~500 lines)

**Purpose**: Complete reference guide
**Sections**:

- API documentation for all 4 utilities
- Usage examples
- Integration patterns (Voice Journal, Decision Journal, Weekly Planning)
- Real-world examples with expected output
- Success criteria
- Future enhancements

**Target Audience**: Developers integrating the tools

---

### 8. `STRATEGIC-INTELLIGENCE-SUMMARY.md` (~290 lines)

**Purpose**: High-level overview and quick start
**Sections**:

- What was built
- Quick start guide
- Example outputs
- Files created
- Next steps (integration ideas)
- Philosophy and trade-offs

**Target Audience**: Product managers, users

---

### 9. `STRATEGIC-INTELLIGENCE-ARCHITECTURE.md` (~500 lines)

**Purpose**: System architecture and design decisions
**Sections**:

- Data flow diagrams (ASCII art)
- Integration points
- Component architecture
- Performance characteristics (speed, accuracy, trade-offs)
- Future enhancements
- Design principles

**Target Audience**: Architects, technical leads

---

## Testing (2 files, ~395 lines)

### 10. `tests/strategic-intelligence.test.ts` (251 lines)

**Purpose**: Comprehensive test suite (Vitest)
**Test Suites**:

- Bias Detector (7 tests)
- Contrarian Agent (4 tests)
- First Principles Challenger (6 tests)
- ROI Estimator (6 tests)
- Integration Tests (2 tests)

**Total Tests**: 25
**Dependencies**: Vitest (not yet set up)

---

### 11. `test-strategic-intelligence.js` (144 lines)

**Purpose**: Manual test script (works without test runner)
**Tests**:

1. Bias Detector with real examples
2. Contrarian Agent with M&A decision
3. First Principles with exit assumptions
4. ROI Estimator with task list

**Run**: `node test-strategic-intelligence.js`
**Dependencies**: None (ES modules)

---

## Metadata (1 file)

### 12. `STRATEGIC-INTELLIGENCE-FILES.md` (this file)

**Purpose**: File manifest and quick reference
**Sections**: File list with purpose, exports, line counts

---

## Summary

**Total Files**: 12
**Total Lines**: ~2,778
**Core Code**: 1,349 lines (utilities)
**UI Code**: 434 lines (Svelte)
**Documentation**: 800+ lines (Markdown)
**Tests**: 395 lines (TS + JS)

**Dependencies**:

- Zero external npm packages (pure TypeScript/JavaScript)
- Svelte 5 (already in project)
- Vitest (for tests, not yet configured)

**File Locations**:

```
src/lib/utils/
├── bias-detector.ts
├── contrarian-agent.ts
├── first-principles-challenger.ts
└── roi-estimator.ts

src/lib/components/
└── StrategicIntelligence.svelte

src/routes/intelligence/
└── +page.svelte

tests/
└── strategic-intelligence.test.ts

./ (root)
├── STRATEGIC-INTELLIGENCE.md
├── STRATEGIC-INTELLIGENCE-SUMMARY.md
├── STRATEGIC-INTELLIGENCE-ARCHITECTURE.md
├── STRATEGIC-INTELLIGENCE-FILES.md
└── test-strategic-intelligence.js
```

---

## Quick Commands

```bash
# Run manual test
node test-strategic-intelligence.js

# Start dev server
npm run dev
# Then open: http://localhost:5173/intelligence

# Run automated tests (after Vitest setup)
npm test

# Import in code
import { detectBiases } from '$lib/utils/bias-detector';
import { generateContrarianView } from '$lib/utils/contrarian-agent';
import { challengeAssumptions } from '$lib/utils/first-principles-challenger';
import { estimateTaskROI } from '$lib/utils/roi-estimator';
```

---

Built: 2026-02-11
Philosophy: "Roughly right, instantly fast, zero dependencies"
