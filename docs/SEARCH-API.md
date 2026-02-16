# Search API Documentation

**Endpoint:** `GET /api/v1/search`
**Purpose:** Unified search across buyers, tasks, people, and journal entries
**Backend:** amk-journal/.claude/api/routes/v1/search.ts

---

## Quick Reference

**Basic Search:**

```bash
GET /api/v1/search?q=leon&workspace=ma
```

**Filtered Search:**

```bash
GET /api/v1/search?q=leon&types=buyer,person&limit=5
```

**Voice Command Integration:**

```typescript
// User says: "Show me Leon"
const results = await client.search.search("leon", {
  types: ["buyer", "person"],
  limit: 10,
});
```

---

## Query Parameters

| Parameter   | Type   | Required | Description                          | Example                             |
| ----------- | ------ | -------- | ------------------------------------ | ----------------------------------- |
| `q`         | string | ✅ Yes   | Search query string                  | `leon`, `printulu`, `urgent`        |
| `workspace` | string | No       | Filter by workspace (`amk`, `ma`)    | `ma` (M&A Tracker), `amk` (Journal) |
| `types`     | string | No       | Comma-separated entity types         | `buyer,person,task,entry`           |
| `limit`     | number | No       | Maximum results (default: unlimited) | `10`, `20`                          |

---

## Response Format

### Success Response (200 OK)

```json
{
  "query": "leon",
  "workspace": "ma",
  "results": [
    {
      "type": "buyer",
      "id": "b123",
      "title": "Leon (Peters Paper)",
      "snippet": "...Interested in platform integration strategy with TechTulu partnership...",
      "relevance": 28,
      "metadata": {
        "company": "Peters Paper",
        "tier": "Tier 1",
        "status": "Active",
        "dealSize": "R25M"
      }
    },
    {
      "type": "person",
      "id": "p456",
      "title": "Leon",
      "snippet": "BSC Stationery Company, interested in Printulu",
      "relevance": 18,
      "metadata": {
        "handle": "@leon-bsc",
        "relationship": "Business Contact"
      }
    },
    {
      "type": "interaction",
      "id": "i789",
      "title": "Leon - Call (2026-02-09)",
      "snippet": "...Discussed three-way partnership with CTP and Peter...",
      "relevance": 13,
      "metadata": {
        "buyerId": "b123",
        "buyerName": "Leon",
        "type": "Call",
        "date": "2026-02-09",
        "sentiment": "Positive"
      }
    }
  ],
  "count": 3
}
```

### Error Response (400 Bad Request)

```json
{
  "error": "Query parameter 'q' is required"
}
```

### Error Response (500 Internal Server Error)

```json
{
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

---

## Entity Types

### 1. Buyer (M&A Workspace)

**Searched Fields:**

- `name` (e.g., "Leon")
- `company` (e.g., "Peters Paper")
- `notes` (full-text search)

**Result Format:**

```json
{
  "type": "buyer",
  "id": "b123",
  "title": "Leon (Peters Paper)",
  "snippet": "...R25M partnership opportunity...",
  "relevance": 28,
  "metadata": {
    "company": "Peters Paper",
    "tier": "Tier 1",
    "status": "Active",
    "dealSize": "R25M"
  }
}
```

---

### 2. Interaction (M&A Workspace)

**Searched Fields:**

- `outcome` (e.g., "Deal accelerating")
- `notes` (full-text search)
- `nextAction` (e.g., "Send proposal by Friday")

**Result Format:**

```json
{
  "type": "interaction",
  "id": "i789",
  "title": "Leon - Call (2026-02-09)",
  "snippet": "...Discussed platform integration...",
  "relevance": 13,
  "metadata": {
    "buyerId": "b123",
    "buyerName": "Leon",
    "type": "Call",
    "date": "2026-02-09",
    "sentiment": "Positive"
  }
}
```

---

### 3. Task (All Workspaces)

**Searched Fields:**

- `content` (task text)
- `area` (e.g., "#printulu", "#health")
- `context` (e.g., "@office", "@calls")

**Result Format:**

```json
{
  "type": "task",
  "id": "t456",
  "title": "Send Omar R8.6M proposal by Friday",
  "snippet": "...Partnership structure with TechTulu...",
  "relevance": 10,
  "metadata": {
    "area": "#printulu",
    "context": "@urgent",
    "status": "open",
    "reminderDate": "2026-02-21"
  }
}
```

---

### 4. Person (All Workspaces)

**Searched Fields:**

- `handle` (e.g., "@leon")
- `fullName` (e.g., "Leon Bsc")
- `relationship` (e.g., "Business Contact")

**Result Format:**

```json
{
  "type": "person",
  "id": "p456",
  "title": "Leon",
  "snippet": "BSC Stationery Company, interested in Printulu",
  "relevance": 18,
  "metadata": {
    "handle": "@leon-bsc",
    "relationship": "Business Contact"
  }
}
```

---

## Relevance Scoring Algorithm

### Scoring Rules

| Match Type        | Points | Example                                                |
| ----------------- | ------ | ------------------------------------------------------ |
| **Exact match**   | +20    | Query: "leon", Field: "leon"                           |
| **Name match**    | +10    | Query: "leon", Name: "Leon Bsc"                        |
| **Company match** | +8     | Query: "peters", Company: "Peters Paper"               |
| **Content match** | +5     | Query: "platform", Notes: "...platform integration..." |
| **Notes match**   | +5     | Query: "urgent", Notes: "...send proposal urgently..." |

### Example Calculation

**Query:** "leon"

**Buyer Result:**

- Name: "Leon" → Exact match (+20)
- Company: "Peters Paper" → No match (0)
- Notes: "...platform integration with Leon..." → Content match (+5)
- **Total:** 25 points

**Person Result:**

- Handle: "@leon-bsc" → Name match (+10)
- Full Name: "Leon" → Exact match (+20)
- **Total:** 30 points

**Final Ranking:**

1. Person (30 points)
2. Buyer (25 points)

---

## Snippet Truncation

Snippets show context around the match with 100 characters before/after.

**Example:**

**Full Text:**

```
We discussed the platform integration strategy with TechTulu
and the potential partnership structure. Leon is very interested
in the vertical integration opportunity with Peters Paper.
```

**Query:** "platform"

**Snippet:**

```
"...We discussed the platform integration strategy with TechTulu
and the potential partnership structure..."
```

**Rules:**

- Context length: 100 characters before/after match
- Ellipsis added when truncated (`...`)
- Entire text returned if <200 characters

---

## SDK Usage

### Basic Search

```typescript
import { CommandCenterClient } from "@amk/command-center-sdk";

const client = new CommandCenterClient({
  baseUrl: "http://localhost:3002/api/v1",
  workspace: "ma", // M&A Tracker
});

// Search all entities
const results = await client.search.search("leon");
// → Returns buyers, interactions, tasks, people matching "leon"
```

---

### Filtered Search

```typescript
// Only search buyers and people
const results = await client.search.search("leon", {
  types: ["buyer", "person"],
  limit: 5,
});

// Results sorted by relevance
results.results.forEach((result) => {
  console.log(`${result.type}: ${result.title} (score: ${result.relevance})`);
});
```

---

### Voice Command Integration

```typescript
import { parseShowCommand } from "$lib/utils/deep-link";

// User says: "Show me Leon"
const showCommand = parseShowCommand("Show me Leon");

if (showCommand) {
  const results = await client.search.search(showCommand.query, {
    types: [showCommand.type], // 'buyer'
    limit: 10,
  });

  // Navigate to first result
  if (results.results.length > 0) {
    const firstResult = results.results[0];
    await navigateToEntity(firstResult.url, firstResult.id, {
      highlight: true,
    });
  }
}
```

---

### React/Svelte Integration

```svelte
<script lang="ts">
  import { getApiClient } from '$lib/api-client';

  let query = $state('');
  let results = $state([]);
  let isSearching = $state(false);

  // Debounced search
  $effect(() => {
    if (query.length < 2) {
      results = [];
      return;
    }

    isSearching = true;

    const timeout = setTimeout(async () => {
      const api = getApiClient();
      const response = await api.search.search(query, { limit: 10 });
      results = response.results;
      isSearching = false;
    }, 300);

    return () => clearTimeout(timeout);
  });
</script>

<input bind:value={query} placeholder="Search buyers, tasks, people..." />

{#if isSearching}
  <p>Searching...</p>
{:else if results.length > 0}
  {#each results as result}
    <div>
      <h4>{result.title}</h4>
      <p>{result.snippet}</p>
      <span>{result.type} - Score: {result.relevance}</span>
    </div>
  {/each}
{/if}
```

---

## Performance

### Search Speed

| Dataset Size   | Search Time | Notes                          |
| -------------- | ----------- | ------------------------------ |
| 100 buyers     | <50ms       | SQLite LIKE query with indexes |
| 1,000 tasks    | <80ms       | Full-text search on content    |
| 10,000 entries | <200ms      | Needs optimization (future)    |

### Optimization Strategies

**Current (v1):**

- SQLite `LIKE` queries with `%query%` pattern
- Basic relevance scoring in JavaScript
- No caching

**Future (v2):**

- Full-text search indexes (FTS5)
- Pre-computed relevance scores
- Redis caching for frequent queries
- Elasticsearch for large datasets (10K+ entries)

---

## Example Use Cases

### 1. Global Search (Cmd+K)

**Scenario:** User presses Cmd+K and types "leon"

**Query:**

```bash
GET /api/v1/search?q=leon&workspace=ma&limit=10
```

**Result:**

- All buyers named Leon
- All interactions mentioning Leon
- All tasks with "leon" in content
- All people with handle @leon

**Action:** User arrows down, hits Enter → Navigate to selected result

---

### 2. Voice Command: "Show me Leon"

**Scenario:** User says "Show me Leon" in voice input

**Processing:**

```typescript
const command = parseShowCommand("Show me Leon");
// → { type: 'buyer', query: 'leon' }

const results = await client.search.search("leon", {
  types: ["buyer"],
  limit: 1,
});

// Navigate to first buyer
navigateToEntity(`/buyers/${results.results[0].id}`, results.results[0].id);
```

---

### 3. Smart Context Search

**Scenario:** User types "urgent printulu" in search

**Query:**

```bash
GET /api/v1/search?q=urgent%20printulu&workspace=amk&types=task
```

**Result:**

- All tasks with "urgent" OR "printulu" in content/area
- Sorted by relevance (tasks with both terms score higher)

**Use Case:** Quickly find all urgent Printulu-related tasks

---

## Error Handling

### Missing Query Parameter

**Request:**

```bash
GET /api/v1/search?workspace=ma
```

**Response (400):**

```json
{
  "error": "Query parameter 'q' is required"
}
```

---

### Database Error

**Request:**

```bash
GET /api/v1/search?q=leon&workspace=ma
```

**Response (500):**

```json
{
  "error": "Internal server error",
  "message": "SQLITE_ERROR: no such table: buyers"
}
```

**Frontend Handling:**

```typescript
try {
  const results = await client.search.search("leon");
} catch (error) {
  if (error.status === 500) {
    console.error("Backend database error:", error.message);
    // Show user-friendly error message
    showToast("Search unavailable. Please try again later.");
  }
}
```

---

## Future Enhancements

### Phase 2: Advanced Search

**TODO:**

- [ ] Fuzzy matching ("leom" → "leon")
- [ ] Synonym support ("call" = "meeting" = "conversation")
- [ ] Date range filters (`date:2026-02-01..2026-02-15`)
- [ ] Metadata filters (`tier:1`, `status:active`)

**Example:**

```bash
GET /api/v1/search?q=leon&tier=1&status=active&date=2026-02-01..2026-02-15
```

---

### Phase 3: Full-Text Search

**TODO:**

- [ ] SQLite FTS5 indexes
- [ ] Highlighting matched terms in snippets
- [ ] Ranking by TF-IDF (term frequency)
- [ ] Search autocomplete suggestions

**Example Response:**

```json
{
  "snippet": "...Discussed the <mark>platform</mark> integration strategy...",
  "highlighted": true
}
```

---

### Phase 4: AI-Powered Search

**TODO:**

- [ ] Semantic search ("deals closing soon" → buyers with near deadlines)
- [ ] Natural language queries ("Who should I follow up with today?")
- [ ] Intent detection ("show me" → navigation, "find" → list results)

**Example:**

```typescript
// User types: "Who should I call today?"
const results = await client.search.intelligentSearch(
  "Who should I call today?",
);
// → Returns buyers with follow-up actions due today
```

---

## Testing

### Manual Testing

```bash
# Start backend
cd /Users/amk/Projects/amk-journal/.claude/api
bun run dev

# Test search endpoint
curl "http://localhost:3002/api/v1/search?q=leon&workspace=ma" | jq

# Expected: List of buyers, interactions matching "leon"
```

### Automated Testing

```typescript
import { describe, it, expect } from "vitest";
import { CommandCenterClient } from "@amk/command-center-sdk";

describe("Search API", () => {
  const client = new CommandCenterClient({
    baseUrl: "http://localhost:3002/api/v1",
    workspace: "ma",
  });

  it("should search buyers by name", async () => {
    const results = await client.search.search("leon", {
      types: ["buyer"],
    });

    expect(results.results.length).toBeGreaterThan(0);
    expect(results.results[0].type).toBe("buyer");
    expect(results.results[0].title).toContain("Leon");
  });

  it("should sort by relevance", async () => {
    const results = await client.search.search("leon");

    // First result should have highest relevance
    expect(results.results[0].relevance).toBeGreaterThanOrEqual(
      results.results[1].relevance,
    );
  });
});
```

---

## References

- [Backend Implementation](../../../amk-journal/.claude/api/routes/v1/search.ts)
- [SDK Client](../../../amk-journal/packages/command-center-sdk/src/endpoints/search.ts)
- [Frontend Component](../src/lib/components/GlobalSearch.svelte)
- [Timeline MVP Documentation](../TIMELINE-MVP-IMPLEMENTATION.md)

---

**Last Updated:** 2026-02-16
**Maintained By:** Claude Sonnet 4.5 + AMK
**Version:** 1.0.0
