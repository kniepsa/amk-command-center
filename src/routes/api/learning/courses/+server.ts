import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  const courses = [
    {
      id: "sales",
      name: "Sales Mastery",
      icon: "💰",
      description: "Customer psychology, SPIN selling, discovery, pitching",
      duration: "30 days",
      frameworks: [
        "SPIN Selling",
        "Challenger Sale",
        "Value Selling",
        "MEDDIC",
      ],
      topics: [
        "Customer psychology & buying behavior",
        "Discovery call frameworks (SPIN)",
        "Pain amplification techniques",
        "Value proposition design",
        "Objection handling",
        "Closing techniques",
        "Enterprise sales cycles",
      ],
    },
    {
      id: "brand-building",
      name: "Brand Building",
      icon: "🎨",
      description: "P&G vs Branson style - B2B vs B2C emotional bonds",
      duration: "30 days",
      frameworks: [
        "Brand Architecture",
        "Jobs-to-be-Done",
        "Brand Equity",
        "Challenger Brand",
      ],
      topics: [
        "P&G brand architecture (House of Brands)",
        "Richard Branson personal brand power",
        "B2B vs B2C brand differences",
        "Emotional bond creation (Simon Sinek)",
        "Brand positioning frameworks",
        "Category creation vs competition",
        "Brand storytelling techniques",
        "Consumer psychology (Daniel Kahneman)",
      ],
    },
    {
      id: "storytelling",
      name: "Storytelling & Communications",
      icon: "🎤",
      description: "Public speaking, delivery, storytelling frameworks",
      duration: "30 days",
      frameworks: [
        "Hero's Journey",
        "Pixar Storytelling",
        "TED Talk Formula",
        "Rhetoric Triangle",
      ],
      topics: [
        "Story structure (Hero's Journey)",
        "Pixar 22 rules of storytelling",
        "TED talk frameworks",
        "Vocal delivery & presence",
        "Visual storytelling",
        "Executive communication",
        "Persuasion psychology",
      ],
    },
    {
      id: "fundraising",
      name: "Fundraising & Financing",
      icon: "💼",
      description: "Investor relations, pitch decks, term sheets",
      duration: "30 days",
      frameworks: [
        "VC Economics",
        "Sequoia Pitch Format",
        "Cap Table Math",
        "Term Sheet Anatomy",
      ],
      topics: [
        "VC fund economics & incentives",
        "Pitch deck structure (Sequoia)",
        "Financial modeling for startups",
        "Term sheet negotiation",
        "Cap table management",
        "Investor psychology",
        "Due diligence preparation",
      ],
    },
    {
      id: "vibe-coding",
      name: "Vibe Coding",
      icon: "🤖",
      description: "AI pair programming, architecture, rapid prototyping",
      duration: "30 days",
      frameworks: [
        "Clean Architecture",
        "Domain-Driven Design",
        "API Design",
        "Testing Patterns",
      ],
      topics: [
        "AI-assisted development workflow",
        "Prompt engineering for code",
        "Architecture decision records",
        "API design patterns",
        "Testing strategies",
        "Code review with AI",
        "Rapid prototyping techniques",
      ],
    },
  ];

  return json({ courses });
};
