import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { REPLICATE_API_KEY } from "$env/static/private";

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Validate API key
    if (!REPLICATE_API_KEY) {
      throw error(500, "REPLICATE_API_KEY not configured");
    }

    // Parse multipart/form-data
    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof File)) {
      throw error(400, "Missing or invalid audio file");
    }

    // Convert audio file to base64 data URI
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString("base64");
    const dataUri = `data:${audioFile.type};base64,${base64Audio}`;

    // Call Replicate Whisper Large V3
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${REPLICATE_API_KEY}`,
      },
      body: JSON.stringify({
        version:
          "4d50797290df275329f202e48c76360b3f22b08d28c196cbc54600319435f8d2", // Whisper Large V3
        input: {
          audio: dataUri,
          language: "de", // German language optimization
          batch_size: 64,
          temperature: 0.0, // Deterministic for better accuracy
          word_timestamps: false,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle specific Replicate errors
      if (response.status === 401) {
        throw error(401, "Invalid Replicate API key");
      }
      if (response.status === 429) {
        throw error(429, "Rate limit exceeded. Please try again in a moment.");
      }

      throw error(
        response.status,
        errorData.detail || "Replicate API request failed",
      );
    }

    const prediction = await response.json();

    // Poll for completion (Replicate uses async processing)
    let result = prediction;
    const maxAttempts = 60; // 60 seconds timeout
    let attempts = 0;

    while (
      result.status !== "succeeded" &&
      result.status !== "failed" &&
      attempts < maxAttempts
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${result.id}`,
        {
          headers: {
            Authorization: `Token ${REPLICATE_API_KEY}`,
          },
        },
      );

      if (!pollResponse.ok) {
        throw error(500, "Failed to poll transcription status");
      }

      result = await pollResponse.json();
      attempts++;
    }

    // Handle timeout
    if (attempts >= maxAttempts) {
      throw error(504, "Transcription timeout. Audio may be too long.");
    }

    // Handle failure
    if (result.status === "failed") {
      throw error(500, result.error || "Transcription failed");
    }

    // Extract transcription from result
    const transcription = result.output?.transcription || result.output?.text;

    if (!transcription) {
      throw error(500, "No transcription returned from API");
    }

    // Calculate duration (from metadata if available)
    const duration = result.metrics?.predict_time || 0;

    return json({
      transcription,
      duration,
    });
  } catch (err) {
    console.error("Transcription error:", err);

    // Re-throw SvelteKit errors
    if (err && typeof err === "object" && "status" in err) {
      throw err;
    }

    // Wrap other errors
    throw error(500, {
      message:
        err instanceof Error ? err.message : "Failed to transcribe audio",
    });
  }
};
