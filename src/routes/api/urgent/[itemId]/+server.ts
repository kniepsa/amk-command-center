import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const PATCH: RequestHandler = async ({ params, request }) => {
  const { itemId } = params;
  const { status } = await request.json();

  // TODO: Update NEXT.md file with new status
  console.log(`Task ${itemId} updated to status: ${status}`);

  return json({ success: true, itemId, status });
};
