import type { CoachPromptTemplate } from "$lib/types/coach";
import { billCampbellCoach } from "./bill-campbell";
import { machiavelliCoach } from "./machiavelli";
import { peterDruckerCoach } from "./peter-drucker";
import { stoicAdvisorCoach } from "./stoic-advisor";
import { parentingGuruCoach } from "./parenting-guru";
import { salesCoachTemplate } from "./sales-coach";
import { maAdvisorCoach } from "./ma-advisor";

export const coaches: Record<string, CoachPromptTemplate> = {
  "bill-campbell": billCampbellCoach,
  machiavelli: machiavelliCoach,
  "peter-drucker": peterDruckerCoach,
  "stoic-advisor": stoicAdvisorCoach,
  "parenting-guru": parentingGuruCoach,
  "sales-coach": salesCoachTemplate,
  "ma-advisor": maAdvisorCoach,
};

export function getCoach(id: string): CoachPromptTemplate | undefined {
  return coaches[id];
}

export function getAllCoaches(): Array<{
  id: string;
  coach: CoachPromptTemplate;
}> {
  return Object.entries(coaches).map(([id, coach]) => ({ id, coach }));
}

export {
  billCampbellCoach,
  machiavelliCoach,
  peterDruckerCoach,
  stoicAdvisorCoach,
  parentingGuruCoach,
  salesCoachTemplate,
  maAdvisorCoach,
};
