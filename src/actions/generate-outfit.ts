"use server";

import { signRequest } from "@/lib/volc-sign";

const JIMENG_ACCESS_KEY = process.env.JIMENG_ACCESS_KEY ?? process.env.VOLC_ACCESSKEY;
const JIMENG_SECRET_KEY = process.env.JIMENG_SECRET_KEY ?? process.env.VOLC_SECRETKEY;

const VISUAL_ENDPOINT = "https://visual.volcengineapi.com";
const EXTRACT_REQ_KEY = "jimeng_i2i_extract_tiled_images";
const REGION = "cn-north-1";
const SERVICE = "cv";

/** 预设提取类型对应的 edit_prompt（ API 文档要求） */
export const EXTRACT_PROMPTS = {
  full_body:
    "提取出图片中的衣服、帽子、鞋子和包，生成一张平铺图，背景为纯白色。",
  shoes: "提取出图片中的一双鞋子，生成一张正45度图，背景为纯白色。",
  bag: "提取出图片中的完整的包包和包带，正视图，背景为纯白色。",
  sofa: "提取出图片中的完整的沙发，生成一张正视图，背景为纯白色。",
  daily: "提取出图片中的日用品，生成一张正视图，背景为纯白色。",
  accessory: "提取出图片中的饰品，生成一张正视图，背景为纯白色。",
} as const;

export type ExtractType = keyof typeof EXTRACT_PROMPTS | "custom";

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
    return await generateDeconstructedOutfitInner(
      imageUrl,
      extractType,
      customItem
    );
  } catch (e) {
    console.error("generateDeconstructedOutfit unexpected error:", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Generation failed",
    };
  }
}

async function generateDeconstructedOutfitInner(
  imageUrl: string,
  extractType: ExtractType,
  customItem?: string
): Promise<GenerateResult> {
  if (!JIMENG_ACCESS_KEY || !JIMENG_SECRET_KEY) {
    return { ok: false, error: "Jimeng AK/SK 未配置 (JIMENG_ACCESS_KEY, JIMENG_SECRET_KEY)" };
  }

  const editPrompt = buildEditPrompt(extractType, customItem);

  try {
    // 1. 提交任务 - CVSync2AsyncSubmitTask
    const submitBody = {
      req_key: EXTRACT_REQ_KEY,
      image_urls: [imageUrl],
      edit_prompt: editPrompt,
      width: 2048,
      height: 2048,
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
