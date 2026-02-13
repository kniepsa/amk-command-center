/**
 * Multi-Coach Detection System
 *
 * Detects contextual triggers for 6 different coaching personas:
 * 1. Bill Campbell (Leadership) - Blue
 * 2. Machiavelli (M&A Strategy, Power) - Purple
 * 3. Sales Coach (SPIN Selling) - Green
 * 4. M&A Advisor (Valuation, Deal Structure) - Yellow
 * 5. Stoic Advisor (Calm, Perspective) - Slate
 * 6. Parenting Guru (Montessori) - Pink
 */

export type CoachType =
  | "campbell"
  | "machiavelli"
  | "sales"
  | "ma_advisor"
  | "stoic"
  | "parenting";

export type CoachCategory =
  // Campbell
  | "leadership"
  | "conflict"
  | "feedback"
  | "trust"
  | "team"
  // Machiavelli
  | "power"
  | "negotiation"
  | "strategy"
  | "politics"
  // Sales
  | "discovery"
  | "objection"
  | "pitch"
  | "qualification"
  // M&A
  | "valuation"
  | "structure"
  | "exit"
  | "investor"
  // Stoic
  | "anxiety"
  | "frustration"
  | "perspective"
  | "acceptance"
  // Parenting
  | "tantrum"
  | "boundaries"
  | "learning"
  | "connection";

export interface CoachChallenge {
  type: CoachType;
  category: CoachCategory;
  icon: string;
  name: string;
  color: string;
  principle: string;
  question: string;
  quote?: string;
  confidence: number;
}

interface CoachConfig {
  type: CoachType;
  name: string;
  icon: string;
  color: string;
  triggers: {
    category: CoachCategory;
    keywords: string[];
    principle: string;
    questions: string[];
    quotes?: string[];
  }[];
}

const COACH_CONFIGS: CoachConfig[] = [
  {
    type: "campbell",
    name: "Bill Campbell",
    icon: "🏈",
    color: "blue",
    triggers: [
      {
        category: "leadership",
        keywords: [
          "team",
          "meeting",
          "führung",
          "leitung",
          "motivieren",
          "inspiration",
          "vision",
          "kultur",
          "values",
        ],
        principle: "Great leaders serve their team first",
        questions: [
          "What does YOUR team need from you right now?",
          "Are you removing obstacles or creating them?",
          "How can you make your team more successful?",
        ],
        quotes: [
          "Your title makes you a manager. Your people make you a leader.",
          "The team is paramount. You serve the team, not yourself.",
          "Love is at the heart of leadership.",
        ],
      },
      {
        category: "conflict",
        keywords: [
          "konflikt",
          "streit",
          "disagreement",
          "tension",
          "argument",
          "clash",
        ],
        principle: "Address conflict directly with care",
        questions: [
          "Have you talked to them face-to-face about this?",
          "What outcome do you want for the RELATIONSHIP?",
          "What would happen if you said 'I care about you AND we need to fix this'?",
        ],
        quotes: [
          "The hard conversations are the most important ones.",
          "Radical candor: Care personally, challenge directly.",
        ],
      },
      {
        category: "feedback",
        keywords: [
          "feedback",
          "kritik",
          "review",
          "beurteilung",
          "evaluation",
          "performance",
          "improvement",
        ],
        principle: "Feedback is an act of love",
        questions: [
          "Are you giving feedback to HELP them or to feel right?",
          "Have you told them what they do WELL first?",
          "Would you want to receive this feedback the way you're giving it?",
        ],
        quotes: [
          "People are not your most important asset. The right people are.",
          "Coaching is no longer a specialty; you cannot be a good manager without being a good coach.",
        ],
      },
      {
        category: "trust",
        keywords: [
          "vertrauen",
          "trust",
          "loyalty",
          "betrayed",
          "betrogen",
          "verlassen",
          "honesty",
          "ehrlichkeit",
        ],
        principle: "Trust is earned through vulnerability",
        questions: [
          "What have you shared about YOUR struggles?",
          "Do they know you care about them as people?",
          "When did you last admit you were wrong?",
        ],
        quotes: [
          "Vulnerability is the birthplace of trust.",
          "Be the person people want to work for, not have to work for.",
        ],
      },
      {
        category: "team",
        keywords: [
          "hire",
          "einstellen",
          "onboarding",
          "training",
          "entwicklung",
          "growth",
          "promotion",
          "beförderung",
        ],
        principle: "Build teams of people who make each other better",
        questions: [
          "Does this person make the people around them better?",
          "Are you hiring for skills or for heart?",
          "What will this person teach the team?",
        ],
        quotes: [
          "The best teams are made up of people who can disagree and commit.",
          "Your job is to run toward the problem, not away from it.",
        ],
      },
    ],
  },
  {
    type: "machiavelli",
    name: "Machiavelli",
    icon: "👑",
    color: "purple",
    triggers: [
      {
        category: "power",
        keywords: [
          "leverage",
          "power",
          "control",
          "influence",
          "advantage",
          "dominance",
          "position",
          "strength",
        ],
        principle: "Power unused is power wasted",
        questions: [
          "What leverage do you have that you're not using?",
          "Who needs you more than you need them?",
          "What would happen if you walked away tomorrow?",
        ],
        quotes: [
          "Never attempt to win by force what can be won by deception.",
          "It is better to be feared than loved, if you cannot be both.",
          "The promise given was a necessity of the past; the word broken is a necessity of the present.",
        ],
      },
      {
        category: "negotiation",
        keywords: [
          "negotiation",
          "deal",
          "offer",
          "counter",
          "price",
          "terms",
          "contract",
          "agreement",
          "verhandlung",
        ],
        principle: "He who appears weak gains advantage",
        questions: [
          "What do they THINK you want vs what you ACTUALLY want?",
          "How can you make them feel they're winning while you get what matters?",
          "What's your walk-away point that they don't know about?",
        ],
        quotes: [
          "Never show your hand until the last moment.",
          "Men judge generally more by the eye than by the hand.",
          "Everyone sees what you appear to be, few experience what you really are.",
        ],
      },
      {
        category: "strategy",
        keywords: [
          "strategy",
          "plan",
          "positioning",
          "competitive",
          "advantage",
          "move",
          "tactic",
          "exit",
          "buyer",
        ],
        principle: "The ends justify the means",
        questions: [
          "What's the move AFTER this move?",
          "Who are you making vulnerable by succeeding?",
          "What would your enemy do in your position?",
        ],
        quotes: [
          "The lion cannot protect himself from traps, and the fox cannot defend himself from wolves.",
          "Where the willingness is great, the difficulties cannot be great.",
          "Before all else, be armed.",
        ],
      },
      {
        category: "politics",
        keywords: [
          "political",
          "ally",
          "enemy",
          "faction",
          "internal",
          "politics",
          "coalition",
          "opposition",
        ],
        principle: "Keep your friends close and enemies closer",
        questions: [
          "Who benefits if you fail?",
          "Who can you turn into an ally by making them feel important?",
          "What information are you giving away without realizing it?",
        ],
        quotes: [
          "Men are so simple and so ready to obey present necessities.",
          "He who builds on the people, builds on mud.",
          "Princes must delegate to others the enactment of unpopular measures.",
        ],
      },
    ],
  },
  {
    type: "sales",
    name: "Sales Coach (SPIN)",
    icon: "💼",
    color: "green",
    triggers: [
      {
        category: "discovery",
        keywords: [
          "discovery",
          "call",
          "meeting",
          "prospect",
          "client",
          "customer",
          "pain",
          "problem",
          "need",
        ],
        principle: "Questions reveal pain, pain creates urgency",
        questions: [
          "What SITUATION questions uncover their context? (who/what/where/when)",
          "What PROBLEM questions expose their pain? (difficulties/dissatisfaction)",
          "What IMPLICATION questions amplify urgency? (consequences/impact/cost of inaction)",
        ],
        quotes: [
          "People don't buy because they understand. They buy because they feel understood.",
          "The quality of your questions determines the quality of your sale.",
          "Discovery is not interrogation. It's guided self-discovery for the buyer.",
        ],
      },
      {
        category: "objection",
        keywords: [
          "objection",
          "concern",
          "hesitation",
          "doubt",
          "worry",
          "risk",
          "expensive",
          "price",
          "budget",
        ],
        principle: "Objections are buying signals in disguise",
        questions: [
          'What\'s the REAL concern behind "too expensive"? (value gap or budget authority)',
          "Have you quantified the cost of NOT solving this problem?",
          "What would need to be true for this to be an obvious yes?",
        ],
        quotes: [
          "Price is only an issue in the absence of value.",
          'When buyers say "maybe," they mean "you haven\'t convinced me yet."',
          "The best response to an objection is a question that makes them answer it themselves.",
        ],
      },
      {
        category: "pitch",
        keywords: [
          "pitch",
          "presentation",
          "demo",
          "proposal",
          "deck",
          "present",
          "show",
          "explain",
          "roi",
        ],
        principle: "Sell outcomes, not features",
        questions: [
          "What RESULT does this buyer care about most? (not what YOU want to talk about)",
          "How does this solve the PAIN they admitted in discovery?",
          "What's the NEED-PAYOFF question that makes them sell themselves? (benefits/value)",
        ],
        quotes: [
          "Features tell. Benefits sell. Outcomes close.",
          "Your pitch should be 20% talking, 80% listening to their reaction.",
          "The best salespeople make buyers feel smart, not impressed.",
        ],
      },
      {
        category: "qualification",
        keywords: [
          "qualify",
          "bant",
          "budget",
          "authority",
          "timeline",
          "decision",
          "stakeholder",
          "champion",
        ],
        principle: "Disqualify fast, focus on winners",
        questions: [
          'Do they have BUDGET? (not "can afford" but "allocated money")',
          "Do they have AUTHORITY? (can say yes OR influence decision-maker)",
          "Is there a TIMELINE? (urgency/event forcing decision)",
        ],
        quotes: [
          "The best salespeople spend 80% of time with 20% of prospects.",
          'No decision is worse than a slow "yes" that becomes a "no."',
          "Qualify ruthlessly or waste months on tire-kickers.",
        ],
      },
    ],
  },
  {
    type: "ma_advisor",
    name: "M&A Advisor",
    icon: "💰",
    color: "yellow",
    triggers: [
      {
        category: "valuation",
        keywords: [
          "valuation",
          "price",
          "worth",
          "multiple",
          "ebitda",
          "revenue",
          "profit",
          "margin",
          "worth",
        ],
        principle:
          "Value is what the buyer will pay, not what you think it's worth",
        questions: [
          "What's your BATNA (best alternative to negotiated agreement)?",
          "What value drivers can you QUANTIFY for this specific buyer?",
          "What's the buyer's ROI at your asking price? (should be 2-4 year payback)",
        ],
        quotes: [
          "A business is worth what someone will pay for it, nothing more.",
          "Valuation is art + science. Comparable multiples anchor, strategic value justifies premium.",
          "In M&A, the seller's job is to create competition. Single buyer = price compression.",
        ],
      },
      {
        category: "structure",
        keywords: [
          "structure",
          "equity",
          "cash",
          "earnout",
          "royalty",
          "license",
          "terms",
          "deal",
          "hybrid",
        ],
        principle: "Structure can bridge valuation gaps",
        questions: [
          "What does the BUYER want? (control, growth, integration, technology)",
          "What do YOU want? (cash now, ongoing income, reduced risk, clean exit)",
          "What hybrid structure satisfies both? (platform sale + revenue share, equity + consulting)",
        ],
        quotes: [
          "Creative deal structure beats aggressive pricing every time.",
          "Earnouts align incentives but often fail in integration. Use sparingly.",
          "The best deals make both sides feel slightly uncomfortable but excited.",
        ],
      },
      {
        category: "exit",
        keywords: [
          "exit",
          "sell",
          "buyer",
          "acquire",
          "acquisition",
          "purchase",
          "offer",
          "bid",
        ],
        principle: "Exit timing beats exit pricing",
        questions: [
          "Are you selling from STRENGTH or DESPERATION? (buyers smell weakness)",
          "Have you built competitive tension? (3+ interested buyers)",
          "What's the post-exit plan? (stay involved, clean break, consulting)",
        ],
        quotes: [
          "The best time to sell is when you don't need to.",
          "Strategic buyers pay 2-5x more than financial buyers for the same asset.",
          "Most sellers leave 20-40% on the table by not running a proper process.",
        ],
      },
      {
        category: "investor",
        keywords: [
          "investor",
          "investment",
          "funding",
          "capital",
          "equity",
          "dilution",
          "control",
          "term sheet",
        ],
        principle: "Smart capital > cheap capital",
        questions: [
          "What does this investor bring BEYOND money? (network, expertise, credibility)",
          "How does this dilution affect future rounds? (pre-money valuation sets precedent)",
          "What control are you giving up? (board seats, veto rights, liquidation preference)",
        ],
        quotes: [
          "Take money from people you want to work with for 10 years.",
          "Every funding round is a test of your negotiation skills for the exit.",
          "Valuation is vanity, terms are sanity, control is reality.",
        ],
      },
    ],
  },
  {
    type: "stoic",
    name: "Stoic Advisor",
    icon: "🏛️",
    color: "slate",
    triggers: [
      {
        category: "anxiety",
        keywords: [
          "anxious",
          "worry",
          "stressed",
          "nervous",
          "overwhelmed",
          "panic",
          "fear",
          "scared",
          "angst",
        ],
        principle: "You can't control outcomes, only your response",
        questions: [
          "What part of this situation is ACTUALLY in your control?",
          "Will this matter in 5 years? 5 months? 5 days?",
          "What would you tell a friend in this situation?",
        ],
        quotes: [
          "We suffer more in imagination than in reality. — Seneca",
          "The obstacle is the way. — Marcus Aurelius",
          "It's not what happens to you, but how you react that matters. — Epictetus",
        ],
      },
      {
        category: "frustration",
        keywords: [
          "frustrat",
          "annoyed",
          "irritated",
          "angry",
          "mad",
          "pissed",
          "wütend",
          "sauer",
          "genervt",
        ],
        principle:
          "Anger is punishment you give yourself for someone else's mistake",
        questions: [
          "What EXPECTATION were you holding that wasn't met?",
          "Is this person trying to hurt you or just being themselves?",
          "What would acceptance look like right now?",
        ],
        quotes: [
          "Choose not to be harmed—and you won't feel harmed. — Marcus Aurelius",
          "The best revenge is not to be like your enemy. — Marcus Aurelius",
          "How much more grievous are the consequences of anger than the causes. — Marcus Aurelius",
        ],
      },
      {
        category: "perspective",
        keywords: [
          "perspective",
          "context",
          "zoom out",
          "big picture",
          "bedeutung",
          "wichtig",
          "priority",
        ],
        principle: "You are a speck in the cosmos; act accordingly",
        questions: [
          "If you were watching this situation from above, what would you see?",
          "What are you NOT seeing because you're too close?",
          "What would the older, wiser version of you say about this?",
        ],
        quotes: [
          "You have power over your mind—not outside events. — Marcus Aurelius",
          "Wealth consists not in having great possessions, but in having few wants. — Epictetus",
          "Life is long if you know how to use it. — Seneca",
        ],
      },
      {
        category: "acceptance",
        keywords: [
          "accept",
          "surrender",
          "let go",
          "release",
          "peace",
          "serenity",
          "loslassen",
          "akzeptieren",
        ],
        principle: "The universe is change; life is opinion",
        questions: [
          "What are you resisting that you could accept?",
          "What's the WORST that could happen? Could you survive it?",
          'What if this "problem" is actually preparing you for something better?',
        ],
        quotes: [
          "The impediment to action advances action. What stands in the way becomes the way. — Marcus Aurelius",
          "He who fears death will never do anything worthy of life. — Seneca",
          "Seek not that events should happen as you will, but let your will be that events should happen as they do. — Epictetus",
        ],
      },
    ],
  },
  {
    type: "parenting",
    name: "Parenting Guru (Montessori)",
    icon: "👨‍👩‍👧‍👦",
    color: "pink",
    triggers: [
      {
        category: "tantrum",
        keywords: [
          "tantrum",
          "meltdown",
          "crying",
          "screaming",
          "wutanfall",
          "schreien",
          "weinen",
          "hysterical",
        ],
        principle: "Connection before correction",
        questions: [
          "What NEED is driving this behavior? (tired, hungry, overwhelmed, need for autonomy)",
          "Have you acknowledged their feelings before trying to fix it?",
          "What would happen if you got down to their eye level and just listened?",
        ],
        quotes: [
          "The child is not empty; they are full of potential. — Maria Montessori",
          "Never help a child with a task at which they feel they can succeed. — Maria Montessori",
          'The greatest sign of success for a teacher is to be able to say, "The children are now working as if I did not exist." — Maria Montessori',
        ],
      },
      {
        category: "boundaries",
        keywords: [
          "boundaries",
          "limits",
          "rules",
          "discipline",
          "grenzen",
          "regeln",
          "disziplin",
          "consequence",
        ],
        principle: "Freedom within limits",
        questions: [
          "Is this boundary for THEIR safety/development or YOUR convenience?",
          "Have you explained WHY this limit exists in language they understand?",
          "Are you enforcing with calm consistency or frustrated reactivity?",
        ],
        quotes: [
          "Discipline must come through liberty. — Maria Montessori",
          'We cannot create observers by saying "observe," but by giving them the power to observe. — Maria Montessori',
          "The environment must be rich in motives which lend interest to activity. — Maria Montessori",
        ],
      },
      {
        category: "learning",
        keywords: [
          "learning",
          "teach",
          "education",
          "school",
          "development",
          "lernen",
          "lehren",
          "entwicklung",
        ],
        principle: "Follow the child",
        questions: [
          "What are THEY interested in right now vs what you want them to learn?",
          "Are you teaching or are you controlling?",
          "What would happen if you stepped back and observed instead of directing?",
        ],
        quotes: [
          "The child who has felt a strong love for his surroundings and for all living creatures still has a capacity for wonder. — Maria Montessori",
          "The hand is the instrument of the mind. — Maria Montessori",
          "Education is a natural process carried out by the child. — Maria Montessori",
        ],
      },
      {
        category: "connection",
        keywords: [
          "connection",
          "bonding",
          "quality time",
          "attention",
          "verbindung",
          "bindung",
          "zeit",
          "present",
        ],
        principle: "Presence over presents",
        questions: [
          "When did you last give them your FULL attention (no phone, no multitasking)?",
          "What did they say/do today that you really SAW and acknowledged?",
          "Are you WITH them or just near them?",
        ],
        quotes: [
          "The greatest gifts we can give our children are the roots of responsibility and the wings of independence. — Maria Montessori",
          "Respect all the reasonable forms of activity in which the child engages. — Maria Montessori",
          "The child is both a hope and a promise for mankind. — Maria Montessori",
        ],
      },
    ],
  },
];

/**
 * Detect coach triggers in text and return up to maxCoaches challenges
 */
export function detectCoachChallenges(
  text: string,
  maxCoaches: number = 2,
): CoachChallenge[] {
  const lowerText = text.toLowerCase();
  const challenges: CoachChallenge[] = [];

  // Track which coaches have been triggered to avoid duplicates
  const triggeredCoaches = new Set<CoachType>();

  for (const coach of COACH_CONFIGS) {
    // Skip if we've already triggered this coach type
    if (triggeredCoaches.has(coach.type)) continue;

    // Find best matching trigger for this coach
    let bestMatch: {
      category: CoachCategory;
      principle: string;
      question: string;
      quote?: string;
      confidence: number;
    } | null = null;

    for (const trigger of coach.triggers) {
      const matchedKeywords = trigger.keywords.filter((keyword) =>
        lowerText.includes(keyword.toLowerCase()),
      );

      if (matchedKeywords.length > 0) {
        const confidence = matchedKeywords.length / trigger.keywords.length;

        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = {
            category: trigger.category,
            principle: trigger.principle,
            question:
              trigger.questions[
                Math.floor(Math.random() * trigger.questions.length)
              ],
            quote: trigger.quotes
              ? trigger.quotes[
                  Math.floor(Math.random() * trigger.quotes.length)
                ]
              : undefined,
            confidence,
          };
        }
      }
    }

    // If we found a match, create challenge
    if (bestMatch && bestMatch.confidence > 0.1) {
      challenges.push({
        type: coach.type,
        category: bestMatch.category,
        icon: coach.icon,
        name: coach.name,
        color: coach.color,
        principle: bestMatch.principle,
        question: bestMatch.question,
        quote: bestMatch.quote,
        confidence: bestMatch.confidence,
      });

      triggeredCoaches.add(coach.type);

      // Stop if we've hit max coaches
      if (challenges.length >= maxCoaches) break;
    }
  }

  // Sort by confidence (highest first)
  return challenges.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Legacy function for backward compatibility
 * Returns only Campbell challenges
 */
export function detectCampbellTriggers(text: string): CoachChallenge | null {
  const challenges = detectCoachChallenges(text, 6);
  const campbellChallenge = challenges.find((c) => c.type === "campbell");
  return campbellChallenge || null;
}

// Export types for backward compatibility
export type CampbellChallenge = CoachChallenge;
