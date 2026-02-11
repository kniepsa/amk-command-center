import type { Contact, Interaction } from "$lib/types";

// Real contacts from AMK journal
export const INITIAL_CONTACTS: Contact[] = [
  {
    handle: "@jonathan-hackner",
    name: "Jonathan Hackner",
    company: "Canvas and More, Netflorist",
    tags: ["potential-partner", "netflorist", "printulu-exit"],
    notes:
      "Co-founder Netflorist, Director Canvas and More. R50M revenue, in-house production. Strategic opportunity for software licensing.",
    created: "2026-02-10T00:00:00Z",
    updated: "2026-02-10T00:00:00Z",
  },
  {
    handle: "@leon-bsc",
    name: "Leon",
    company: "BSC Stationery, Peters Paper",
    tags: ["printulu-exit", "empire-builder", "vertical-integration"],
    notes:
      "Peters Paper R2B revenue. Vision: Vertical integration supply chain empire. Platform as backbone for entire operation.",
    created: "2026-01-28T00:00:00Z",
    updated: "2026-02-09T00:00:00Z",
  },
  {
    handle: "@merishe",
    name: "Merishe Ferreira",
    company: "Printulu",
    tags: ["printulu", "team", "md"],
    notes:
      "Geschäftsführerin Printulu. R65K/month salary, 5-10% equity (R1-2.5M at R20-25M exit). Independent leader, life-changing exit.",
    created: "2025-01-01T00:00:00Z",
    updated: "2026-01-21T00:00:00Z",
  },
  {
    handle: "@damian",
    name: "Damian von Dysart",
    company: "Renform",
    tags: ["printulu-exit", "printing", "renform"],
    notes:
      'Renform Group ~R1bn family business. R220M revenue (R50M commercial, R170M tenders). R20M asking price "nicht so krass".',
    created: "2026-01-27T00:00:00Z",
    updated: "2026-01-27T00:00:00Z",
  },
  {
    handle: "@robbie",
    name: "Robbie",
    company: "Print Tag",
    tags: ["printulu-exit", "print-manufacturing", "cape-town"],
    notes:
      'Print Tag owner. 30% capacity utilization, €12M invested. Considering €18-20M offer. "It would be a great coup."',
    created: "2026-02-06T00:00:00Z",
    updated: "2026-02-06T00:00:00Z",
  },
  {
    handle: "@hulisani",
    name: "Hulisani",
    company: "Standard Bank",
    tags: ["friend", "investor", "goldman-sachs", "m&a"],
    notes:
      "Standard Bank Debt Team. Ex-M&A Goldman Sachs. TechTulu + Printulu investor. M&A expertise.",
    created: "2025-01-01T00:00:00Z",
    updated: "2026-01-28T00:00:00Z",
  },
  {
    handle: "@kyla",
    name: "Kyla",
    company: undefined,
    tags: ["aupair", "family"],
    notes: "Au pair since December 2024. Boundary-setting conversation held.",
    created: "2024-12-01T00:00:00Z",
    updated: "2026-01-15T00:00:00Z",
  },
  {
    handle: "@colin",
    name: "Colin",
    company: "Lithotech",
    tags: ["printulu-exit", "lithotech", "bidvest"],
    notes:
      "Lithotech (R1bn business, 40-50 B2B sales reps). Potential Printulu platform buyer. Part of Bitwest Group.",
    created: "2026-01-20T00:00:00Z",
    updated: "2026-02-09T00:00:00Z",
  },
  {
    handle: "@peter-lawprint",
    name: "Peter",
    company: "Lawprint",
    tags: ["lawprint", "printing", "peter"],
    notes:
      "Buying 49% of Lawprint from Lesley. Shocked by €20M Printulu price. Meeting with agency to develop platform with AI.",
    created: "2026-01-28T00:00:00Z",
    updated: "2026-01-28T00:00:00Z",
  },
];

// Real interactions from AMK journal
export const INITIAL_INTERACTIONS: Interaction[] = [
  {
    id: "int-1",
    contact: "@leon-bsc",
    date: "2026-02-09",
    summary:
      "Call scheduled tomorrow 10:00. R25M hybrid deal discussion. Leon only had 15 minutes at 22:00, suggested 10:00 instead.",
    next_action:
      "Offer: Exclusive bundled R25-28M OR platform-only R12M (his choice)",
    tags: ["printulu-exit", "call"],
    created: "2026-02-09T00:00:00Z",
  },
  {
    id: "int-2",
    contact: "@merishe",
    date: "2026-02-09",
    summary:
      "Level 10 Meeting (Morning). Management meeting completed. Good session.",
    tags: ["meeting", "printulu"],
    created: "2026-02-09T00:00:00Z",
  },
  {
    id: "int-3",
    contact: "@merishe",
    date: "2026-02-09",
    summary:
      "Annual Financials Follow-up. Waiting on feedback with Nicolette (due today). BEE Express charges review with Emrah. Papercore update.",
    next_action: "Follow up if no feedback by EOD on financials",
    tags: ["printulu", "financials"],
    created: "2026-02-09T00:00:00Z",
  },
  {
    id: "int-4",
    contact: "@jonathan-hackner",
    date: "2026-02-10",
    summary:
      "WhatsApp sent - R3M platform-only licensing proposal. Canvas and More strategic partnership opportunity.",
    next_action: "Wait for response, schedule discovery call if interested",
    tags: ["printulu-exit", "whatsapp", "platform-licensing"],
    created: "2026-02-10T00:00:00Z",
  },
  {
    id: "int-5",
    contact: "@robbie",
    date: "2026-02-06",
    summary:
      'Printulu acquisition discussion. Presented €18M all cash OR €20M structured. "Let me think about it... I\'ll analyze if this is the direction we want to go."',
    next_action: "Follow up Monday 2026-02-10 for decision",
    tags: ["printulu-exit", "sales-call"],
    created: "2026-02-06T00:00:00Z",
  },
];
