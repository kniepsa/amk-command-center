# Ideas Tab Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      User's Daily Journal                        │
│  /Users/amk/Projects/amk-journal/users/amk/entries/            │
│                                                                  │
│  2026-02-12.md:                                                 │
│  ───────────────────────────────────────────────────────────    │
│  Content idea: "Why Your Pitch Will Fail" for B2B Founders -   │
│  Buyers see 50+ decks. Answer their real question in 30s.      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Voice Input / Manual Edit
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Journal API Server                           │
│         http://localhost:3001/content-ideas                     │
│                                                                  │
│  server.js:                                                      │
│  ───────────────────────────────────────────────────────────    │
│  • extractContentIdeas(content)                                 │
│    - Pattern: /Content idea:\s*"?([^"]+?)"?\s+for\s+(.+?)\s*-  │
│    - Extracts: { idea, icp, hook, category }                   │
│  • inferCategory(title)                                         │
│    - Auto-detects: Framework, Tutorial, Strategy, etc.         │
│  • Returns: { ideas: [...], count: N }                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    HTTP GET (Bearer token auth)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Command Center Frontend                         │
│           http://localhost:5173 (SvelteKit)                     │
│                                                                  │
│  journal-client.ts:                                              │
│  ───────────────────────────────────────────────────────────    │
│  async function fetchContentIdeas()                             │
│    → fetch(JOURNAL_API_URL/content-ideas)                      │
│    → Parse response: data.ideas[]                              │
│    → Return ContentIdea[]                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Svelte Reactive State ($state)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      IdeasTab.svelte                             │
│                    (User Interface)                              │
│                                                                  │
│  ┌──────────┬──────────┬──────────┐                            │
│  │  Card 1  │  Card 2  │  Card 3  │  ← 3-column grid           │
│  ├──────────┼──────────┼──────────┤                            │
│  │  Card 4  │  Card 5  │  Card 6  │                            │
│  └──────────┴──────────┴──────────┘                            │
│                                                                  │
│  Each Card:                                                      │
│  ┌────────────────────────────────────┐                        │
│  │ Idea Title (Bold, Large)           │                        │
│  │ ┌──────────┐ ┌────────────┐       │                        │
│  │ │ B2B      │ │ Strategy   │       │ ← Badges               │
│  │ │ Founders │ │            │       │                        │
│  │ └──────────┘ └────────────┘       │                        │
│  │ "Hook text here..." (Italic)       │                        │
│  │ ──────────────────────────────────│                        │
│  │ Feb 12      [Send to FrontOffice] │ ← Footer               │
│  └────────────────────────────────────┘                        │
│                                                                  │
│  Filters:                                                        │
│  ┌────────┐ ┌──────────┐ ┌────────┐                           │
│  │ All    │ │ Tutorial │ │   🔄   │ ← ICP, Category, Refresh  │
│  └────────┘ └──────────┘ └────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Content Extraction (Journal → API)

```typescript
// Input: Markdown content
const content = `
Content idea: "Why Your Pitch Will Fail" for B2B Founders -
Buyers see 50+ decks. Answer their question in 30s.
`;

// Processing: Pattern matching
const pattern = /Content idea:\s*"?([^"]+?)"?\s+for\s+(.+?)\s*-\s*(.+?)(?:\n|$)/gi;

// Output: Structured data
{
  id: "idea-1",
  idea: "Why Your Pitch Will Fail",
  icp: "B2B Founders",
  hook: "Buyers see 50+ decks. Answer their question in 30s.",
  category: "Strategy",
  source_date: "2026-02-12",
  source_file: "2026-02-12.md"
}
```

### 2. API Response (Server → Client)

```json
GET /content-ideas
Authorization: Bearer test-key-for-command-center-integration

Response:
{
  "ideas": [
    {
      "id": "idea-1",
      "idea": "Why Your Pitch Will Fail",
      "icp": "B2B Founders",
      "hook": "Buyers see 50+ decks...",
      "category": "Strategy",
      "source_date": "2026-02-12",
      "source_file": "2026-02-12.md"
    },
    {
      "id": "idea-2",
      "idea": "German RE for SA Investors",
      "icp": "Expat RE Investors",
      "hook": "14-18% ZAR returns explained",
      "category": "Tutorial",
      "source_date": "2026-02-12",
      "source_file": "2026-02-12.md"
    }
  ],
  "count": 2
}
```

### 3. Frontend Rendering (Client → UI)

```svelte
<script lang="ts">
  // Load data
  let ideas = $state<ContentIdea[]>([]);

  onMount(async () => {
    ideas = await fetchContentIdeas();
  });

  // Filter
  const filteredIdeas = $derived(
    ideas.filter(idea =>
      (selectedIcp === 'all' || idea.icp === selectedIcp) &&
      (selectedCategory === 'all' || idea.category === selectedCategory)
    )
  );
</script>

<!-- Render cards -->
{#each filteredIdeas as idea}
  <div class="card">
    <h3>{idea.idea}</h3>
    <span class="badge {getIcpColor(idea.icp)}">{idea.icp}</span>
    <p>{idea.hook}</p>
  </div>
{/each}
```

## Component Structure

```
IdeasTab.svelte
├── State Management
│   ├── ideas: ContentIdea[]           (fetched from API)
│   ├── loading: boolean                (API request state)
│   ├── error: string | null            (error message)
│   ├── selectedIcp: string             (filter state)
│   └── selectedCategory: string        (filter state)
│
├── Derived State
│   ├── icpOptions                      (unique ICPs from ideas)
│   ├── categoryOptions                 (unique categories)
│   └── filteredIdeas                   (filtered + sorted)
│
├── Functions
│   ├── loadIdeas()                     (fetch from API)
│   ├── getIcpColor(icp)               (badge color mapping)
│   └── formatDate(dateStr)             (date formatting)
│
└── UI Sections
    ├── Header (title + refresh button)
    ├── Filters (ICP + Category dropdowns)
    ├── Loading State (spinner)
    ├── Error State (message + instructions)
    ├── Empty State (no ideas message)
    └── Ideas Grid (card layout)
```

## File Dependencies

```
IdeasTab.svelte
├── imports
│   ├── onMount (from 'svelte')
│   └── fetchContentIdeas, ContentIdea (from '$lib/api/journal-client')
│
journal-client.ts
├── exports
│   ├── fetchContentIdeas(): Promise<ContentIdea[]>
│   └── checkJournalApiHealth(): Promise<boolean>
│
└── dependencies
    ├── fetch (native)
    └── import.meta.env (Vite env vars)
```

## Environment Configuration

```bash
# .env (Command Center)
VITE_JOURNAL_API_URL=http://localhost:3001
VITE_JOURNAL_API_KEY=test-key-for-command-center-integration

# Journal API (exported in shell)
export JOURNAL_API_KEY="test-key-for-command-center-integration"
export ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
```

## ICP Badge Color Mapping

```typescript
function getIcpColor(icp: string): string {
  switch (icp) {
    case "B2B Founders":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "Expat RE Investors":
      return "bg-green-100 text-green-800 border-green-300";
    case "Print Shop Owners":
      return "bg-purple-100 text-purple-800 border-purple-300";
    case "Technical Parents":
      return "bg-orange-100 text-orange-800 border-orange-300";
    default:
      return "bg-slate-100 text-slate-800 border-slate-300";
  }
}
```

## Category Inference Logic

```typescript
function inferCategory(title: string): string {
  const lower = title.toLowerCase();

  if (lower.includes("framework") || lower.includes("system"))
    return "Framework";
  if (lower.includes("case study") || lower.includes("story"))
    return "Case Study";
  if (lower.includes("guide") || lower.includes("how to")) return "Tutorial";
  if (lower.includes("mistake") || lower.includes("lesson"))
    return "Lessons Learned";
  if (lower.includes("tool") || lower.includes("software")) return "Tools";
  if (lower.includes("strategy") || lower.includes("tactic")) return "Strategy";

  return "General";
}
```

## Error Handling Flow

```
User opens Ideas tab
    ↓
fetchContentIdeas() called
    ↓
Is API running?
├─ YES → Parse response
│         ├─ Valid data? → Display cards
│         └─ Invalid? → Show error
│
└─ NO → Show "API Not Running" message
        └─ Display setup instructions
            (code block with commands)
```

## Future Architecture Additions

```
┌─────────────────────────────────────────┐
│        FrontOffice OS (Future)          │
│   Content Pipeline & Publishing         │
│                                          │
│  • Draft → Review → Schedule → Publish  │
│  • AI hook enhancement                  │
│  • SEO optimization                     │
│  • Multi-platform distribution          │
└─────────────────────────────────────────┘
              ↑
         POST /sync (future)
              ↑
┌─────────────────────────────────────────┐
│      Ideas Tab - Send Button            │
│  (Currently disabled, future feature)   │
└─────────────────────────────────────────┘
```
