import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  const { courseId } = await request.json();

  // TODO: Write to users/amk/learning/progress.md
  // Format:
  // ## Active Course
  // - Course: [courseId]
  // - Start Date: [today]
  // - Current Day: 1
  // - Last Session: [today]

  console.log(`Started course: ${courseId} on ${new Date().toISOString()}`);

  return json({
    success: true,
    courseId,
    currentDay: 1,
    startDate: new Date().toISOString().split("T")[0],
  });
};
