"use server";

import { getPublicUrl } from "@/lib/s3";

const JIMENG_API_KEY = process.env.JIMENG_API_KEY;
const JIMENG_ENDPOINT =
  process.env.JIMENG_ENDPOINT ??
  "https://ark.cn-beijing.volces.com/api/v3/images/generations";

const BASE_PROMPT =
  "Deconstruct the clothing of the main person in the image into jacket, inner wear, pants, and shoes. Arrange them in a knolling layout (OOTD style) on a clean minimalist background.";
const QUALITY_SUFFIX =
  " High quality fashion photography, soft shadows, studio lighting, highly detailed textures, realistic fabric, 4k resolution, clean edges, minimalist background.";

export type GenerateResult =
  | { ok: true; imageUrl: string }
  | { ok: false; error: string };

/**
 * Call Jimeng (Volcano Engine) image generation API.
 * Expects imageUrl to be a publicly accessible URL (e.g. from R2 public domain).
 */
export async function generateDeconstructedOutfit(
  imageUrl: string,
  layoutStyle: "knolling" | "editorial" = "knolling"
): Promise<GenerateResult> {
  if (!JIMENG_API_KEY) {
    return { ok: false, error: "Jimeng API key not configured" };
  }

  const styleHint =
    layoutStyle === "editorial"
      ? "Editorial magazine style layout."
      : "Knolling flat-lay style.";
  const prompt = `${BASE_PROMPT} ${styleHint}${QUALITY_SUFFIX}`;

  try {
    // Volcano Ark image generation: many endpoints accept image URL + prompt.
    // Adjust body to match actual Jimeng API (e.g. model, image_url field name).
    const body: Record<string, unknown> = {
      model: "image-generation", // replace with actual model id from Jimeng docs
      prompt,
      image_url: imageUrl,
      n: 1,
      size: "1024x1024",
    };

    const res = await fetch(JIMENG_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JIMENG_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        ok: false,
        error: `API error ${res.status}: ${text.slice(0, 200)}`,
      };
    }

    const data = (await res.json()) as {
      data?: Array<{ url?: string; b64_json?: string }>;
      task_id?: string;
      status?: string;
    };

    // If async task, poll for result (implement per Jimeng docs).
    if (data.task_id) {
      const pollResult = await pollJimengTask(data.task_id);
      return pollResult;
    }

    const image = data.data?.[0];
    if (image?.url) {
      return { ok: true, imageUrl: image.url };
    }
    if (image?.b64_json) {
      return {
        ok: true,
        imageUrl: `data:image/png;base64,${image.b64_json}`,
      };
    }

    return {
      ok: false,
      error: "No image in API response",
    };
  } catch (e) {
    console.error("Jimeng generate error:", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Generation failed",
    };
  }
}

async function pollJimengTask(taskId: string): Promise<GenerateResult> {
  const pollUrl = JIMENG_ENDPOINT.replace(/\/generations$/, `/tasks/${taskId}`);
  const maxAttempts = 60;
  const intervalMs = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, intervalMs));

    const res = await fetch(pollUrl, {
      headers: {
        Authorization: `Bearer ${JIMENG_API_KEY}`,
      },
    });

    if (!res.ok) {
      return {
        ok: false,
        error: `Poll error ${res.status}`,
      };
    }

    const data = (await res.json()) as {
      status?: string;
      result?: { images?: Array<{ url?: string }> };
    };

    if (data.status === "Succeeded" && data.result?.images?.[0]?.url) {
      return { ok: true, imageUrl: data.result.images[0].url };
    }
    if (data.status === "Failed") {
      return {
        ok: false,
        error: "Generation task failed",
      };
    }
  }

  return { ok: false, error: "Generation timed out" };
}
