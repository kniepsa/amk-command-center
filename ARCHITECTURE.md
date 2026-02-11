# Command Center Architecture

## Overview

This application follows a **modular, API-first architecture** with clean separation of concerns. This design enables:

1. **Easy backend migration** (localStorage → Supabase → custom backend)
2. **Testability** (mock implementations for testing)
3. **Type safety** (TypeScript interfaces as contracts)
4. **Component simplicity** (presentational components, business logic in services)

## Architecture Pattern: Hexagonal Architecture (Ports & Adapters)

Based on industry best practices for frontend applications (validated via research):

- **Alex Kondov** ("Clean Architecture in React", 2024): "Most architectural effort in the front-end is focused on creating abstractions around the HTTP layer"
- **Evil Martians** ("SPA hexagon: Robust app architecture", 2021): Adapting hexagonal architecture to SPAs with TypeScript
- **SvelteKit** (Official docs, 2026): Remote Functions feature for type-safe server-client communication

### Core Principles

1. **Dependency Rule**: Business logic doesn't depend on UI or infrastructure
2. **Interface Segregation**: Small, focused API contracts
3. **Dependency Inversion**: Components depend on interfaces, not implementations

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  (Svelte Components - Dumb, presentational only)            │
│                                                              │
│  MorningTab.svelte   EveningTab.svelte   CRMTab.svelte     │
│  WeeklyTab.svelte    MetricsTab.svelte                      │
└──────────────────────────┬──────────────────────────────────┘
                           │ calls
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER (PORTS)                    │
│  (Business Logic - Domain services)                          │
│                                                              │
│  CRMAPI            ReviewsAPI         PlanningAPI           │
│  └─ getContacts()  └─ getMorningReview()  └─ getWeeklyPlan()│
│  └─ createContact()└─ saveEveningReview() └─ addTask()     │
│  └─ getStats()     └─ getHabitStreak()    └─ moveTask()    │
└──────────────────────────┬──────────────────────────────────┘
                           │ implements
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              INFRASTRUCTURE LAYER (ADAPTERS)                 │
│  (Data persistence implementations - swappable)              │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │ LocalStorageImpl │  │ SupabaseImpl     │  │ MockImpl   │ │
│  │ (current)        │  │ (future)         │  │ (testing)  │ │
│  └──────────────────┘  └──────────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
src/lib/
├── api/
│   ├── interfaces/              # API Contracts (Ports)
│   │   ├── storage.api.ts       # Generic storage interface
│   │   ├── crm.api.ts           # CRM domain API
│   │   ├── reviews.api.ts       # Morning/Evening reviews API
│   │   ├── planning.api.ts      # Weekly planning API
│   │   ├── learning.api.ts      # Training programs (sales, vibe coding, storytelling) ✨ NEW
│   │   ├── task-sync.api.ts     # PM tool integration (Notion, Asana, Linear) ✨ NEW
│   │   └── transcription.api.ts # AI voice input (Whisper) ✨ NEW
│   │
│   └── implementations/         # Concrete Implementations (Adapters)
│       ├── localStorage/
│       │   ├── storage.service.ts ✅
│       │   ├── crm.service.ts     ✅
│       │   ├── reviews.service.ts ✅
│       │   ├── planning.service.ts ✅
│       │   ├── learning.service.ts (pending)
│       │   └── task-sync.service.ts (pending)
│       │
│       ├── openai/              # AI services
│       │   └── transcription.service.ts (pending - Whisper API)
│       │
│       ├── notion/              # Notion integration
│       │   └── task-sync.service.ts (pending)
│       │
│       ├── asana/               # Asana integration
│       │   └── task-sync.service.ts (pending)
│       │
│       ├── supabase/            # Future backend
│       │   ├── crm.service.ts
│       │   ├── reviews.service.ts
│       │   └── planning.service.ts
│       │
│       └── mock/                # Testing
│           └── ...
│
├── services/                    # Domain Services (Business Logic)
│   ├── crm.service.ts          # CRM business logic
│   ├── reviews.service.ts      # Review analytics
│   └── metrics.service.ts      # Metrics calculations
│
├── components/                  # Presentational Components (UI only)
│   ├── MorningTab.svelte       # Renders morning review form
│   ├── EveningTab.svelte       # Renders evening review form
│   ├── WeeklyTab.svelte        # Renders weekly planning UI
│   ├── CRMTab.svelte           # Renders contact list & details
│   └── MetricsTab.svelte       # Renders charts & stats
│
└── utils/                       # Shared utilities
    ├── persistence.svelte.ts   # Reactive state with persistence
    ├── constants.ts            # App constants
    └── metrics.ts              # Calculation helpers
```

## Data Flow Example: Creating a Contact

### 1. **User Interaction** (Presentation Layer)

```svelte
<!-- CRMTab.svelte -->
<script>
  import { crmService } from '$lib/services/crm.service';

  async function handleCreateContact(data) {
    const result = await crmService.createContact(data);
    if (result.success) {
      // Update UI
    } else {
      // Show error
    }
  }
</script>
```

### 2. **Business Logic** (Service Layer)

```typescript
// crm.service.ts
export const crmService: CRMAPI = {
  async createContact(contact) {
    // Validation
    if (!contact.name) {
      return { success: false, error: "Name required" };
    }

    // Call infrastructure layer
    return await localStorageCRM.createContact(contact);
  },
};
```

### 3. **Data Persistence** (Infrastructure Layer)

```typescript
// implementations/localStorage/crm.service.ts
export const localStorageCRM: CRMAPI = {
  async createContact(contact) {
    const newContact = {
      ...contact,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };

    // Save to localStorage
    await storage.set(STORAGE_KEYS.CONTACTS, [...contacts, newContact]);

    return { success: true, data: newContact };
  },
};
```

## Migration Path: localStorage → Supabase

### Phase 1: Current (localStorage) ✅ COMPLETE

```typescript
// src/lib/services/crm.service.ts
import { localStorageCRM } from "$lib/api/implementations/localStorage/crm.service";
export const crmService = localStorageCRM;
```

**Implemented:**

- ✅ `localStorage/storage.service.ts` - Base storage wrapper
- ✅ `localStorage/crm.service.ts` - Contact & interaction management
- ✅ `localStorage/reviews.service.ts` - Morning/evening reviews + analytics
- ✅ `localStorage/planning.service.ts` - Weekly planning (Warren Buffett 25/5)

### Phase 2: Future (Supabase)

```typescript
import { supabaseCRM } from "$lib/api/implementations/supabase/crm.service";
export const crmService = supabaseCRM;
```

**Zero component changes required!** Components only depend on the `CRMAPI` interface.

### Phase 3: Hybrid (Offline-first)

```typescript
export const crmService = createHybridCRM({
  local: localStorageCRM,
  remote: supabaseCRM,
  syncStrategy: "optimistic-ui",
});
```

## Integration Capabilities

The architecture supports three major integrations via dedicated API interfaces:

### 1. **Learning API** - Training Programs

Manage structured learning curricula (sales, vibe coding, storytelling, etc.)

**Features**:

- 30-day training programs
- Daily lesson delivery
- Progress tracking with streaks
- Lesson notes and resources
- Completion analytics

**Implementation Status**: Interface defined ✅, localStorage implementation pending

### 2. **TaskSync API** - Project Management Integration

**Vision**: Personal tasks bidirectional, team tasks read-only

```typescript
// Example: Notion workspace configuration
const notionWorkspace: WorkspaceConfig = {
  name: "Personal Projects",
  type: "notion",
  syncDirection: "bidirectional", // Can write back
  isPersonal: true,
  filters: { assignedToMe: true },
};

const teamWorkspace: WorkspaceConfig = {
  name: "Team Board",
  type: "asana",
  syncDirection: "read-only", // Team uses Asana
  isPersonal: false,
  filters: { assignedToMe: true },
};
```

**Supported Integrations**:

- Notion (bidirectional for personal, read-only for team)
- Asana (read-only)
- Linear (read-only)
- Jira (read-only)
- Todoist (bidirectional)
- ClickUp (read-only)

**Key Features**:

- Workspace-level sync configuration
- Conflict resolution (local vs external)
- Task mapping (local ↔ external)
- Automatic status conversion
- Filter by assignee, tags, date range

**Implementation Path**:

1. Create Notion adapter (most common use case)
2. Create Asana adapter (team sync)
3. Add other providers as needed

### 3. **Transcription API** - AI Voice Input

**Best Practice**: OpenAI Whisper API (production-ready, accurate, cost-effective)

**Use Cases**:

- Voice input for morning/evening reviews
- Quick task creation via voice
- Meeting notes transcription
- Lesson notes capture

**Features**:

- Real-time streaming transcription
- Batch processing
- Multi-language support
- Structured data extraction (extract tasks/gratitude from voice)
- Cost estimation

**Alternative Providers**:

- `openai-whisper` (recommended - $0.006/minute)
- `local-whisper` (privacy-focused, slower)
- `google-speech` (good for streaming)
- `azure-speech` (enterprise)

**Smart Features**:

```typescript
// Extract structured data from voice input
const result = await transcriptionService.extractStructuredData(
  "I'm grateful for sunny weather and finishing the sales pitch.
   Need to follow up with John tomorrow.",
  'gratitude'  // Auto-extracts: [{thing: "sunny weather", why: "..."}, ...]
);
```

## Architecture Benefits for Integrations

### Why This Design Works

**1. Pluggable Adapters**

- Add new PM tool = implement `TaskSyncAPI` interface
- Add new transcription provider = implement `TranscriptionAPI` interface
- Zero changes to UI components

**2. Configuration Over Code**

```typescript
// Switch transcription provider via config, not code changes
const config: TranscriptionConfig = {
  provider: "openai-whisper", // Change to 'local-whisper' anytime
  apiKey: process.env.OPENAI_API_KEY,
  defaultLanguage: "en",
};
```

**3. Separation of Concerns**

- **UI Layer**: Voice recording, task display
- **Service Layer**: Orchestration, validation
- **Adapter Layer**: API calls to Whisper, Notion, etc.

**4. Future-Proof**

- New PM tool launched? Add adapter.
- Better AI model? Switch provider.
- Components stay untouched.

## Benefits of This Architecture

### 1. **Testability**

```typescript
// tests/crm.test.ts
import { mockCRM } from "$lib/api/implementations/mock/crm.service";

const crmService = mockCRM;
const result = await crmService.getContacts();
// Test without touching real database
```

### 2. **Type Safety**

TypeScript enforces the contract. If `CRMAPI` interface changes, all implementations must update.

### 3. **Separation of Concerns**

- **Components**: How data is displayed (UI logic)
- **Services**: What data means (business logic)
- **Implementations**: Where data is stored (infrastructure)

### 4. **Easy Backend Swapping**

Switching from localStorage to Supabase requires:

- ✅ Implement `SupabaseCRMService` (follows `CRMAPI` interface)
- ✅ Change 1 line in service export
- ❌ NO component changes
- ❌ NO business logic changes

### 5. **Scalability**

As app grows, add new APIs:

```
api/interfaces/
├── analytics.api.ts    # New domain
├── auth.api.ts         # New domain
└── sync.api.ts         # New domain
```

## Best Practices

### DO ✅

- Keep components dumb (presentational only)
- Put all business logic in services
- Use TypeScript interfaces as contracts
- Return `Result<T>` objects (success/error)
- Validate inputs in service layer
- Handle errors gracefully

### DON'T ❌

- Call localStorage directly from components
- Mix business logic with UI logic
- Use `any` type (defeats type safety)
- Skip error handling
- Hardcode storage keys

## Related Resources

- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Clean Architecture in React](https://alexkondov.com/full-stack-tao-clean-architecture-react/)
- [SPA Hexagon by Evil Martians](https://evilmartians.com/chronicles/spa-hexagon-robust-app-architecture-for-mobile-and-web)
- [SvelteKit Remote Functions](https://svelte.dev/docs/kit/remote-functions)

---

**Last Updated**: 2026-02-11
**Architecture Pattern**: Hexagonal (Ports & Adapters)
**Current Implementation**: localStorage
**Target Implementation**: Supabase (per CLAUDE.md)
