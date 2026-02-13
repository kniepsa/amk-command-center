/**
 * Bill Campbell Coaching Challenge Detection
 *
 * Analyzes transcription text for leadership keywords and returns
 * contextual coaching challenges based on Campbell principles.
 */

export interface CampbellChallenge {
  principle: string;
  question: string;
  icon: string;
  confidence: number; // 0-1
  category: "leadership" | "conflict" | "feedback" | "trust" | "team";
  campbellQuote?: string;
}

// Keyword patterns organized by category
const TRIGGER_PATTERNS = {
  leadership: {
    keywords: [
      "team",
      "manager",
      "employee",
      "report",
      "hire",
      "firing",
      "leader",
      "leadership",
      "managing",
      "delegation",
      "promote",
      "performance review",
      "1:1",
      "one-on-one",
    ],
    principle: "Your title makes you a manager. Your people make you a leader.",
    questions: [
      "Do your people feel valued beyond their work output?",
      "Are you building relationships first, then giving feedback?",
      "How can you make everyone around you better today?",
    ],
    quote: "Your job as a leader is to make everyone around you better.",
  },

  conflict: {
    keywords: [
      "conflict",
      "disagreement",
      "argument",
      "tension",
      "fight",
      "dispute",
      "clash",
      "problem with",
      "issue with",
      "frustrated with",
      "angry",
      "upset",
      "annoyed",
    ],
    principle: "Build trust by being vulnerable first.",
    questions: [
      "What would it look like to be vulnerable in this situation?",
      "Can you approach this from a place of curiosity, not judgment?",
      "What's the shared goal you both want?",
    ],
    quote:
      "Great coaches don't tell you what to do. They help you figure it out.",
  },

  feedback: {
    keywords: [
      "feedback",
      "review",
      "performance",
      "difficult conversation",
      "tell them",
      "confront",
      "address",
      "talk about",
      "bring up",
      "criticism",
      "critique",
      "evaluation",
    ],
    principle: "Tell the truth, but with compassion.",
    questions: [
      "Are you giving this feedback from a place of caring?",
      "Can you be specific and actionable, not vague?",
      "Have you praised publicly before criticizing privately?",
    ],
    quote: "Lob in public, kritisiere in private. Be specific, not vague.",
  },

  trust: {
    keywords: [
      "trust",
      "honest",
      "transparent",
      "vulnerable",
      "open",
      "confidential",
      "private",
      "secret",
      "reliable",
      "depend on",
    ],
    principle: "Listen with your full attention.",
    questions: [
      "Are you really listening, or just waiting to speak?",
      "Have you followed through on your commitments?",
      "Does this person feel truly heard right now?",
    ],
    quote:
      "The highest form of respect is to give someone your time and attention.",
  },

  team: {
    keywords: [
      "team decision",
      "team meeting",
      "collaboration",
      "together",
      "group",
      "collective",
      "everyone",
      "we need to",
      "us",
      "company culture",
      "alignment",
    ],
    principle: "Love people, not their work product.",
    questions: [
      "What's best for the company, not just for you?",
      "Can you take your ego out of this decision?",
      "Are you prioritizing team goals over individual wins?",
    ],
    quote: "What's best for the company? Not 'What's best for me?'",
  },
};

/**
 * Detects Campbell coaching triggers in text
 */
export function detectCampbellTriggers(text: string): CampbellChallenge | null {
  if (!text || text.trim().length === 0) return null;

  const lowerText = text.toLowerCase();

  // Score each category
  const categoryScores: Record<string, { score: number; matches: string[] }> =
    {};

  for (const [category, config] of Object.entries(TRIGGER_PATTERNS)) {
    let score = 0;
    const matches: string[] = [];

    for (const keyword of config.keywords) {
      // Count occurrences, weight by position (earlier = more relevant)
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const keywordMatches = text.match(regex);

      if (keywordMatches) {
        // More matches = higher score
        const count = keywordMatches.length;
        score += count;

        // Early mentions get bonus (first 100 chars)
        const firstIndex = lowerText.indexOf(keyword);
        if (firstIndex >= 0 && firstIndex < 100) {
          score += 0.5;
        }

        matches.push(keyword);
      }
    }

    if (score > 0) {
      categoryScores[category] = { score, matches };
    }
  }

  // Find highest scoring category
  const sortedCategories = Object.entries(categoryScores).sort(
    ([, a], [, b]) => b.score - a.score,
  );

  if (sortedCategories.length === 0) return null;

  const [topCategory, topScore] = sortedCategories[0];
  const config = TRIGGER_PATTERNS[topCategory as keyof typeof TRIGGER_PATTERNS];

  // Calculate confidence (normalize score to 0-1)
  // Max reasonable score = 5 mentions
  const confidence = Math.min(topScore.score / 5, 1);

  // Only trigger if confidence > 0.3 (at least 1-2 keyword matches)
  if (confidence < 0.3) return null;

  // Pick random question from category
  const question =
    config.questions[Math.floor(Math.random() * config.questions.length)];

  return {
    principle: config.principle,
    question,
    icon: "🏈", // Campbell's football icon
    confidence,
    category: topCategory as CampbellChallenge["category"],
    campbellQuote: config.quote,
  };
}

/**
 * Get all potential challenges for a text (for debugging/testing)
 */
export function getAllChallenges(
  text: string,
): Array<CampbellChallenge & { score: number }> {
  const lowerText = text.toLowerCase();
  const challenges: Array<CampbellChallenge & { score: number }> = [];

  for (const [category, config] of Object.entries(TRIGGER_PATTERNS)) {
    let score = 0;

    for (const keyword of config.keywords) {
      if (lowerText.includes(keyword)) {
        score++;
      }
    }

    if (score > 0) {
      const confidence = Math.min(score / 5, 1);
      challenges.push({
        principle: config.principle,
        question: config.questions[0], // Just show first question
        icon: "🏈",
        confidence,
        category: category as CampbellChallenge["category"],
        campbellQuote: config.quote,
        score,
      });
    }
  }

  return challenges.sort((a, b) => b.score - a.score);
}
