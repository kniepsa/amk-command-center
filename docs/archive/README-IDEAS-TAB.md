# Ideas Tab - Journal API Integration

## Overview

The Ideas tab pulls content ideas from your journal entries and displays them in an organized, filterable view.

## Setup

### 1. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

The default configuration should work for local development.

### 2. Start the Journal API Server

The Ideas tab requires the Journal API server to be running:

```bash
# Navigate to the Journal API directory
cd /Users/amk/Projects/amk-journal/.claude/api

# Set the API key (use the same key as in Command Center .env)
export JOURNAL_API_KEY="test-key-for-command-center-integration"

# Start the server with bun
bun run dev
```

The server will start on `http://localhost:3001`

### 3. Add Content Ideas to Journal Entries

Content ideas are automatically extracted from your daily journal entries. Use this format:

```markdown
Content idea: "Your Idea Title Here" for [ICP] - Your compelling hook here

Example:
Content idea: "Why Your First M&A Pitch Deck Will Fail" for B2B Founders - Buyers see 50+ decks. Yours needs to answer their real question in 30 seconds.
```

**Supported ICPs:**

- B2B Founders
- Expat RE Investors
- Print Shop Owners
- Technical Parents

**Auto-detected Categories:**

- Framework (mentions "framework" or "system")
- Case Study (mentions "case study" or "story")
- Tutorial (mentions "guide" or "how to")
- Lessons Learned (mentions "mistake" or "lesson")
- Tools (mentions "tool" or "software")
- Strategy (mentions "strategy" or "tactic")
- General (default)

## Features

- **Content Idea Cards**: Each idea displayed in a clean card layout
- **ICP Filtering**: Filter ideas by target audience
- **Category Filtering**: Filter by content category
- **Refresh Button**: Manually reload ideas from the API
- **Source Tracking**: See which journal entry each idea came from
- **FrontOffice Integration**: (Coming soon) Send ideas directly to FrontOffice OS

## Troubleshooting

### "Journal API Not Running" Error

If you see this error:

1. Make sure the Journal API server is running (see Setup step 2)
2. Check that the API key matches in both `.env` files
3. Verify the server is accessible: `curl http://localhost:3001/health`

### No Ideas Showing

1. Add content ideas to your journal entries using the format above
2. Click the Refresh button in the Ideas tab
3. Check the server logs for extraction errors

### CORS Errors

The Journal API is configured to allow requests from `http://localhost:5173` (Command Center dev server). If you're running on a different port, update the `ALLOWED_ORIGINS` environment variable in the Journal API.

## API Endpoint

The Ideas tab uses the following Journal API endpoint:

```
GET /content-ideas
Authorization: Bearer {API_KEY}

Response:
{
  "ideas": [
    {
      "id": "idea-1",
      "idea": "Your Idea Title",
      "icp": "B2B Founders",
      "hook": "Compelling hook text",
      "category": "Strategy",
      "source_date": "2026-02-12",
      "source_file": "2026-02-12.md"
    }
  ],
  "count": 1
}
```

## Next Steps

- [ ] Add FrontOffice OS integration for content pipeline
- [ ] Add bulk export functionality
- [ ] Add idea editing directly from Command Center
- [ ] Add AI-powered hook suggestions
- [ ] Add content calendar scheduling
