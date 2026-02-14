import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ params, request }) => {
  const { habitId } = params;
  const { completed } = await request.json();

  // TODO: Update database
  console.log(`Habit ${habitId} toggled to ${completed}`);

  return json({ success: true, habitId, completed });
};
