"use server";

import { signRequest } from "@/lib/volc-sign";
import { EXTRACT_PROMPTS, type ExtractType } from "@/lib/extract-types";
import { getSession } from "@/lib/auth";
import { getOrCreateUser } from "@/lib/users";
import {
  createGenerationAndDeductCredits,
  completeGeneration,
  failAndRefundGeneration,
} from "@/lib/generations";

const JIMENG_ACCESS_KEY = process.env.JIMENG_ACCESS_KEY ?? process.env.VOLC_ACCESSKEY;
const JIMENG_SECRET_KEY = process.env.JIMENG_SECRET_KEY ?? process.env.VOLC_SECRETKEY;

const VISUAL_ENDPOINT = "https://visual.volcengineapi.com";
const EXTRACT_REQ_KEY = "jimeng_i2i_extract_tiled_images";
const REGION = "cn-north-1";
const SERVICE = "cv";


export type GenerateResult =
  | { ok: true; imageUrl: string }
  | { ok: false; error: string };

/**
 * 根据提取类型和自定义内容生成 edit_prompt
 */
function buildEditPrompt(
  extractType: ExtractType,
  customItem?: string
): string {
  if (extractType === "custom" && customItem?.trim()) {
    return `提取出图片中的${customItem.trim()}，生成一张正视图，背景为纯白色。`;
  }
  if (extractType in EXTRACT_PROMPTS) {
    return EXTRACT_PROMPTS[extractType as keyof typeof EXTRACT_PROMPTS];
  }
  return EXTRACT_PROMPTS.full_body;
}

/**
 * Call 即梦商品提取 API (jimeng_i2i_extract_tiled_images) via Volcano Visual API.
 * Expects imageUrl to be a publicly accessible URL (e.g. from R2 public domain).
 */
export async function generateDeconstructedOutfit(
  imageUrl: string,
  extractType: ExtractType = "full_body",
  customItem?: string
): Promise<GenerateResult> {
  try {
    const result = await generateDeconstructedOutfitInner(
      imageUrl,
      extractType,
      customItem
    );
    return result;
  } catch (e) {
    console.error("generateDeconstructedOutfit error:", e);
    const errMsg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: errMsg || "Generation failed" };
  }
}

async function generateDeconstructedOutfitInner(
  imageUrl: string,
  extractType: ExtractType,
  customItem?: string
): Promise<GenerateResult> {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return { ok: false, error: "Please sign in to generate" };
  }

  const dbUser = await getOrCreateUser(sessionUser.id, sessionUser.email);
  if (!dbUser) {
    return { ok: false, error: "Database unavailable" };
  }

  const editPrompt = buildEditPrompt(extractType, customItem);

  const genResult = await createGenerationAndDeductCredits(
    sessionUser.id,
    imageUrl,
    editPrompt
  );

  if ("error" in genResult) {
    return { ok: false, error: genResult.error };
  }

  const { generationId } = genResult;

  if (!JIMENG_ACCESS_KEY || !JIMENG_SECRET_KEY) {
    await failAndRefundGeneration(generationId, sessionUser.id);
    return { ok: false, error: "Jimeng AK/SK not configured (JIMENG_ACCESS_KEY, JIMENG_SECRET_KEY)" };
  }

  try {
    // 1. 提交任务 - CVSync2AsyncSubmitTask
    // 文档示例用 image_edit_prompt，参数表用 edit_prompt，两参数都传以兼容
    const submitBody = {
      req_key: EXTRACT_REQ_KEY,
      image_urls: [imageUrl],
      edit_prompt: editPrompt,
      image_edit_prompt: editPrompt,
      width: 2048,
      height: 2048,
    };

    const submitRes = await signedFetch("CVSync2AsyncSubmitTask", submitBody);
    const submitText = await submitRes.text();
    if (!submitRes.ok) {
      await failAndRefundGeneration(generationId, sessionUser.id);
      return { ok: false, error: `API error ${submitRes.status}: ${submitText.slice(0, 300)}` };
    }

    let submitData: { code?: number; data?: { task_id?: string }; message?: string };
    try {
      submitData = JSON.parse(submitText) as typeof submitData;
    } catch {
      await failAndRefundGeneration(generationId, sessionUser.id);
      return { ok: false, error: "Invalid API response" };
    }

    if (submitData.code !== 10000 || !submitData.data?.task_id) {
      await failAndRefundGeneration(generationId, sessionUser.id);
      return {
        ok: false,
        error: submitData.message ?? "No task_id in submit response",
      };
    }

    const taskId = submitData.data.task_id;

    // 2. Poll for result - CVSync2AsyncGetResult
    const result = await pollJimengTask(taskId);

    if (result.ok) {
      await completeGeneration(generationId, result.imageUrl);
      return result;
    }

    await failAndRefundGeneration(generationId, sessionUser.id);
    return result;
  } catch (e) {
    console.error("Jimeng generate error:", e);
    await failAndRefundGeneration(generationId, sessionUser.id);
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
  const params: Record<string, string> = {
    Action: action,
    Version: "2022-08-31",
  };

  const headers = signRequest(
    {
      method: "POST",
      pathname: "/",
      region: REGION,
      service: SERVICE,
      params,
      headers: {
        Host: "visual.volcengineapi.com",
        "Content-Type": "application/json",
      },
      body: bodyStr,
    },
    {
      accessKeyId: JIMENG_ACCESS_KEY!,
      secretKey: JIMENG_SECRET_KEY!,
    }
  );

  const query = new URLSearchParams(params).toString();
  const url = `${VISUAL_ENDPOINT}/?${query}`;

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
      req_key: EXTRACT_REQ_KEY,
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
        if (b64.length > 8 * 1024 * 1024) {
          return { ok: false, error: "Generated image too large, please try again" };
        }
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
