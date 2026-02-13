# Technical Debt

## Medium Priority

- **Tag grouping UX**: 23 tag buttons in CRM tab might overwhelm users - consider grouping by category or collapsible sections
- **Entry extraction API missing real backend**: `/api/extract-entry` currently returns mock data - needs Claude API integration for real extraction from voice transcripts
- **Coach system not implemented**: Coach challenges framework exists but auto-activation triggers and message generation need Claude API

## Low Priority

- **PWA capabilities**: Add offline functionality and cross-platform app install for true seamless experience
- **Keyboard shortcuts**: Missing keyboard navigation for power users (e.g., Cmd+Enter to submit chat)
- **ZenQuotes rate limiting**: No fallback when 100/day limit hit - should cache daily quote locally
- **Data validation on save**: Entry persistence API doesn't validate YAML schema before writing files

## Resolved This Session ✅

- ~~**Weekly priorities API incomplete**: `/api/weekly/current` returns mock data~~ → Fixed: Now reads from amk-journal/users/amk/weekly-plans/ using gray-matter for frontmatter parsing (2026-02-13)
- ~~**Urgent items API incomplete**: `/api/urgent` returns mock data~~ → Fixed: Now reads from amk-journal/users/amk/next.md with GTD-style parsing (2026-02-13)
- ~~**Missing dependencies after npm --legacy-peer-deps**: gray-matter install removed tailwindcss, js-yaml~~ → Fixed: Reinstalled tailwindcss@4.1.18, @tailwindcss/postcss, js-yaml@4.1.1, @types/js-yaml (2026-02-13)

## Archive (Previous Sessions)

- ~~**Mobile responsiveness**: App not tested on mobile devices~~ → Fixed via Joe Gebbia Option 3 responsive layout (2026-02-11)
- ~~**Accessibility warnings**: Labels need controls, click handlers need keyboard events~~ → Fixed via unique IDs, proper for/id associations (2026-02-11)
- ~~**Error handling UI**: Generic error messages~~ → Fixed with specific recovery guidance (2026-02-11)
- ~~**Touch targets too small**: Interactive elements below 44px minimum~~ → Fixed all buttons, checkboxes, inputs to ≥44px (2026-02-11)

---

_Last updated: 2026-02-13_
