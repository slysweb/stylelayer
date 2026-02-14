/** Preset extraction prompts per API doc */
export const EXTRACT_PROMPTS = {
  full_body:
    "提取出图片中的衣服、帽子、鞋子和包（如果存在），生成一张平铺图，背景为纯白色。",
  shoes: "提取出图片中的一双鞋子，生成一张正45度图，背景为纯白色。",
  bag: "提取出图片中的完整的包包和包带，正视图，背景为纯白色。",
  sofa: "提取出图片中的完整的沙发，生成一张正视图，背景为纯白色。",
  daily: "提取出图片中的日用品，生成一张正视图，背景为纯白色。",
  accessory: "提取出图片中的饰品，生成一张正视图，背景为纯白色。",
} as const;

export type ExtractType = keyof typeof EXTRACT_PROMPTS | "custom";
