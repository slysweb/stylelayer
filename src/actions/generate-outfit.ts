"use server";

import { Signer } from "@volcengine/openapi";

const JIMENG_ACCESS_KEY = process.env.JIMENG_ACCESS_KEY ?? process.env.VOLC_ACCESSKEY;
const JIMENG_SECRET_KEY = process.env.JIMENG_SECRET_KEY ?? process.env.VOLC_SECRETKEY;

const VISUAL_ENDPOINT = "https://visual.volcengineapi.com";
const REQ_KEY = "jimeng_t2i_v40";
const REGION = "cn-north-1";
const SERVICE = "cv";

const BASE_PROMPT =
  "Deconstruct the clothing of the main person in the image into jacket, inner wear, pants, and shoes. Arrange them in a knolling layout (OOTD style) on a clean minimalist background.";
const QUALITY_SUFFIX =
  " High quality fashion photography, soft shadows, studio lighting, highly detailed textures, realistic fabric, 4k resolution, clean edges, minimalist background.";

export type GenerateResult =
  | { ok: true; imageUrl: string }
  | { ok: false; error: string };

/**
 * Call Jimeng 4.0 (即梦) via Volcano Visual API - CVSync2AsyncSubmitTask + CVSync2AsyncGetResult.
 * Expects imageUrl to be a publicly accessible URL (e.g. from R2 public domain).
 * Uses AK/SK signing (not Bearer token).
 */
export async function generateDeconstructedOutfit(
  imageUrl: string,
  layoutStyle: "knolling" | "editorial" = "knolling"
): Promise<GenerateResult> {
  if (!JIMENG_ACCESS_KEY || !JIMENG_SECRET_KEY) {
    return { ok: false, error: "Jimeng AK/SK not configured (JIMENG_ACCESS_KEY, JIMENG_SECRET_KEY)" };
  }

  const styleHint =
    layoutStyle === "editorial"
      ? "Editorial magazine style layout."
      : "Knolling flat-lay style.";
  const prompt = `${BASE_PROMPT} ${styleHint}${QUALITY_SUFFIX}`;

  try {
    // 1. Submit task - CVSync2AsyncSubmitTask
    const submitBody = {
      req_key: REQ_KEY,
      image_urls: [imageUrl],
      prompt,
      size: 2048 * 2048, // 2K default
      force_single: true,
    };

    const submitRes = await signedFetch("CVSync2AsyncSubmitTask", submitBody);
    if (!submitRes.ok) {
      const text = await submitRes.text();
      return { ok: false, error: `API error ${submitRes.status}: ${text.slice(0, 300)}` };
    }

    const submitData = (await submitRes.json()) as {
      code?: number;
      data?: { task_id?: string };
      message?: string;
    };

    if (submitData.code !== 10000 || !submitData.data?.task_id) {
      return {
        ok: false,
        error: submitData.message ?? "No task_id in submit response",
      };
    }

    const taskId = submitData.data.task_id;

    // 2. Poll for result - CVSync2AsyncGetResult
    return await pollJimengTask(taskId);
  } catch (e) {
    console.error("Jimeng generate error:", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Generation failed",
    };
  }
}

async function signedFetch(
  action: string,
  body: Record<string, unknown>
): Promise<Response> {
  const bodyStr = JSON.stringify(body);
  const params = { Action: action, Version: "2022-08-31" };

  const requestObj = {
    region: REGION,
    method: "POST",
    params,
    pathname: "/",
    headers: {
      host: "visual.volcengineapi.com",
      "content-type": "application/json",
    },
    body: bodyStr,
  };

  const signer = new Signer(requestObj, SERVICE);
  signer.addAuthorization({
    accessKeyId: JIMENG_ACCESS_KEY!,
    secretKey: JIMENG_SECRET_KEY!,
  });

  const query = new URLSearchParams(params).toString();
  const url = `${VISUAL_ENDPOINT}/?${query}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Host: "visual.volcengineapi.com",
    ...(requestObj.headers as Record<string, string>),
  };

  return fetch(url, {
    method: "POST",
    headers,
    body: bodyStr,
  });
}

async function pollJimengTask(taskId: string): Promise<GenerateResult> {
  const maxAttempts = 60;
  const intervalMs = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, intervalMs));

    const body = {
      req_key: REQ_KEY,
      task_id: taskId,
      req_json: JSON.stringify({ return_url: true }),
    };

    const res = await signedFetch("CVSync2AsyncGetResult", body);
    if (!res.ok) {
      return { ok: false, error: `Poll error ${res.status}` };
    }

    const data = (await res.json()) as {
      code?: number;
      data?: {
        status?: string;
        image_urls?: string[];
        binary_data_base64?: string[];
      };
      message?: string;
    };

    if (data.code !== 10000) {
      return { ok: false, error: data.message ?? "Task failed" };
    }

    const status = data.data?.status;
    if (status === "done") {
      const urls = data.data?.image_urls;
      if (urls?.[0]) {
        return { ok: true, imageUrl: urls[0] };
      }
      const b64 = data.data?.binary_data_base64?.[0];
      if (b64) {
        return { ok: true, imageUrl: `data:image/png;base64,${b64}` };
      }
      return { ok: false, error: "No image in result" };
    }
    if (status === "not_found" || status === "expired") {
      return { ok: false, error: `Task ${status}` };
    }
  }

  return { ok: false, error: "Generation timed out" };
}
