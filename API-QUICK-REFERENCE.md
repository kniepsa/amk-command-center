# Voice Journal API - Quick Reference

## Endpoints

### 1. Extract Entry Data

```bash
POST /api/extract-entry
```

**Request:**

```json
{
  "date": "2026-02-11",
  "text": "Heute ins Bett um 23:00. Running gemacht. 90 minutes on printulu deal with @colin. #m&a"
}
```

**Response:**

```json
{
  "extracted": {
    "sleep": { "bedtime": "23:00" },
    "habits": { "running": true },
    "work_log": [{ "thread": "printulu-deal", "time_spent": "90min" }],
    "people": ["colin"],
    "tags": ["m&a"]
  },
  "confidence": 0.85
}
```

### 2. Save Journal Entry

```bash
POST /api/entries/[date]
```

**Request:**

```json
{
  "frontmatter": {
    "date": "2026-02-11",
    "energy": "high",
    "schema_version": 2,
    "tags": ["work", "health"]
  },
  "body": "## Morning\n\nGood energy today."
}
```

**Response:**

```json
{
  "success": true,
  "filePath": "/Users/amk/Projects/amk-journal/users/amk/entries/2026-02-11.md"
}
```

### 3. Read Journal Entry

```bash
GET /api/entries/[date]
```

**Response:**

```json
{
  "exists": true,
  "frontmatter": { "date": "2026-02-11", "energy": "high" },
  "body": "## Morning\n\nGood energy today."
}
```

---

## Extraction Patterns

| Input                    | Field          | Output                                        |
| ------------------------ | -------------- | --------------------------------------------- |
| `ins bett um 23:00`      | sleep.bedtime  | "23:00"                                       |
| `high energy`            | energy         | "high"                                        |
| `laufen`, `running`      | habits.running | true                                          |
| `dankbar für X - Y`      | gratitude      | [{ thing: "X", why: "Y" }]                    |
| `90 minutes on printulu` | work_log       | [{ thread: "printulu", time_spent: "90min" }] |
| `#tag`                   | tags           | ["tag"]                                       |
| `@handle`                | people         | ["handle"]                                    |
| `[[framework]]`          | frameworks     | ["framework"]                                 |

---

## Work Log Patterns

Match these patterns for thread linking:

- `90 minutes on printulu` → 90min on printulu
- `worked on leon deal 2h` → 2h on leon-deal
- `3h working on canvas partnership` → 3h on canvas-partnership
- `printulu for 45 minutes` → 45min on printulu

Thread names are normalized: spaces → hyphens, lowercase.

---

## Error Codes

| Code | Meaning                                        |
| ---- | ---------------------------------------------- |
| 400  | Missing required fields or invalid date format |
| 500  | Internal server error (check logs)             |

---

## Testing

```bash
# Start dev server
npm run dev

# Run test suite
chmod +x test-endpoints.sh
./test-endpoints.sh
```

---

## Files

| File                                       | Purpose               |
| ------------------------------------------ | --------------------- |
| `src/routes/api/extract-entry/+server.ts`  | Extraction endpoint   |
| `src/routes/api/entries/[date]/+server.ts` | Save/read endpoint    |
| `src/lib/types.ts`                         | TypeScript interfaces |
| `test-endpoints.sh`                        | Test suite            |
| `ENDPOINT-TEST-REPORT.md`                  | Full documentation    |
