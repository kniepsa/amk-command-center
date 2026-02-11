# AMK Command Center

Personal productivity dashboard with Morning/Evening reviews, CRM, and Weekly planning (Warren Buffett 25/5 method).

## Features

### 📅 Morning Review Tab

- Sleep tracking (bedtime, duration, quality)
- Blue light blocker & screen curfew habits
- Energy level tracking
- Daily habit checklist
- Intention setting

### 🌙 Evening Review Tab

- Gratitude journaling
- Food logging
- Plan tomorrow checkbox
- Tomorrow's intentions

### 🎯 Weekly Planning Tab

- Brain dump → Priority selection (Warren Buffett 25/5)
- Max 7 priorities per week
- Parking lot for future tasks
- Drop list for eliminated items

### 👥 CRM Tab

- Contact management
- Interaction logging
- Follow-up alerts (>30 days)
- Quick search

### 📊 Metrics Tab

- CRM statistics
- Habit streaks
- Sleep & energy trends
- Weekly activity tracking

### 🎓 Learning Tab (Planned)

- 30-day training programs (Sales, Vibe Coding, Storytelling)
- Daily lesson delivery
- Progress tracking with streaks
- Lesson notes and resources

### 🔗 Integrations (Planned)

**Task Management Sync**:

- Personal workspace: Bidirectional sync (Notion, Todoist)
- Team workspace: Read-only (Asana, Linear, Jira, ClickUp)
- Conflict resolution and mapping

**AI Voice Input**:

- OpenAI Whisper integration
- Voice-to-text for reviews and tasks
- Smart extraction (tasks, gratitude, food from speech)
- Real-time streaming transcription

## Tech Stack

- **Framework**: SvelteKit with Svelte 5
- **Styling**: Tailwind CSS v4
- **Architecture**: Hexagonal (Ports & Adapters)
- **Storage**: localStorage (migration path to Supabase ready)
- **TypeScript**: Strict mode

## Architecture

This app follows **hexagonal architecture** (ports & adapters pattern) for easy backend migration:

```
Presentation (Components)
    ↓
Service Layer (Business Logic)
    ↓
API Interfaces (Ports)
    ↓
Implementations (Adapters: localStorage, Supabase, Mock)
```

**Key Benefits**:

- ✅ Easy backend swapping (localStorage → Supabase = 1 line change)
- ✅ Testable (mock implementations)
- ✅ Type-safe (TypeScript interfaces)
- ✅ Separation of concerns

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## Project Structure

```
src/lib/
├── api/
│   ├── interfaces/              # API Contracts (Ports)
│   │   ├── storage.api.ts       ✅
│   │   ├── crm.api.ts           ✅
│   │   ├── reviews.api.ts       ✅
│   │   ├── planning.api.ts      ✅
│   │   ├── learning.api.ts      ✅ NEW
│   │   ├── task-sync.api.ts     ✅ NEW
│   │   └── transcription.api.ts ✅ NEW
│   │
│   └── implementations/         # Concrete Implementations (Adapters)
│       ├── localStorage/
│       │   ├── storage.service.ts    ✅
│       │   ├── crm.service.ts        ✅
│       │   ├── reviews.service.ts    ✅
│       │   └── planning.service.ts   ✅
│       │
│       ├── openai/              # AI services (planned)
│       ├── notion/              # Notion integration (planned)
│       └── asana/               # Asana integration (planned)
│
├── services/                    # Service Layer (exports implementations)
│   ├── crm.service.ts           ✅
│   ├── reviews.service.ts       ✅
│   └── planning.service.ts      ✅
│
├── components/                  # Presentational Components
│   ├── MorningTab.svelte
│   ├── EveningTab.svelte
│   ├── WeeklyTab.svelte
│   ├── CRMTab.svelte
│   └── MetricsTab.svelte
│
└── utils/                       # Shared Utilities
    ├── persistence.svelte.ts    # Reactive localStorage wrapper
    ├── constants.ts             # App constants
    └── metrics.ts               # Calculation helpers
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Development

```bash
# Type check
pnpm check

# Lint
pnpm lint

# Format
pnpm format
```

## Data Storage

Currently uses **localStorage** for persistence. All data is stored in the browser.

### Storage Keys

- `amk-contacts` - Contact list
- `amk-interactions` - Interaction history
- `amk-morning-reviews` - Morning review entries
- `amk-evening-reviews` - Evening review entries
- `amk-weekly-plans` - Weekly planning data

### Export/Import

_Coming soon: JSON export/import for backups_

## Migration Path: localStorage → Supabase

The architecture is designed for easy backend migration:

**Phase 1: localStorage** ✅ (Current)

- All data stored in browser
- No authentication required
- Perfect for MVP/testing

**Phase 2: Supabase** (Future)

- Implement `SupabaseCRMService`, `SupabaseReviewsService`, `SupabasePlanningService`
- Update service exports (1 line change per service)
- Zero component changes required!

**Phase 3: Hybrid** (Advanced)

- Offline-first with sync
- Optimistic UI updates
- Conflict resolution

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed migration guide.

## Code Quality

- ✅ TypeScript strict mode
- ✅ No `any` types
- ✅ Explicit return types on all exported functions
- ✅ SSR-safe (browser environment checks)
- ✅ Error handling with `Result<T>` pattern
- ✅ Static Tailwind classes (no dynamic class generation)
- ✅ Zero magic numbers (constants file)

## Contributing

This is a personal productivity tool. Feel free to fork and adapt for your needs!

## License

MIT

---

**Built with**: SvelteKit + TypeScript + Tailwind CSS v4
**Architecture**: Hexagonal (Ports & Adapters)
**Last Updated**: 2026-02-11
