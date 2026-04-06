import type { SupportedLanguage } from "@/i18n/config"

export type PricingCurrency = "USD" | "CNY"

export interface PricingProvider {
  id: string
  name: string
  sourceLabel: string
  sourceLabelEn: string
  sourceUrl: string
  sourceNote: string
  sourceNoteEn: string
}

export interface ModelPricing {
  id: string
  providerId: string
  name: string
  description: string
  descriptionEn: string
  currency: PricingCurrency
  inputCostPer1mToken: number
  outputCostPer1mToken: number
  cacheReadCostPer1mToken?: number
  cacheWriteCostPer1mToken?: number
  pricingContext?: string
  pricingContextEn?: string
  pricingNote?: string
  pricingNoteEn?: string
}

export interface PricingData {
  providers: PricingProvider[]
  models: ModelPricing[]
  inputOutputRatio: number // e.g. 3 = 3:1 input:output for code scenarios
  exchangeRateUsdToCny: number
  updatedAt: string
  source: string
  sourceEn: string
}

export const pricingData: PricingData = {
  updatedAt: "2026-03-19",
  source: "多家官方 API 定价页快照（2026-03-19）",
  sourceEn: "Snapshots from multiple official API pricing pages (2026-03-19)",
  inputOutputRatio: 3,
  exchangeRateUsdToCny: 7.25,
  providers: [
    {
      id: "openai",
      name: "OpenAI",
      sourceLabel: "OpenAI API Pricing",
      sourceLabelEn: "OpenAI API Pricing",
      sourceUrl: "https://openai.com/api/pricing/",
      sourceNote: "按官方标准 input / output 口径估算，未将 cached input 单独计入综合 Token 上限。",
      sourceNoteEn: "Estimated with the standard official input / output pricing. Cached input is not broken out into the blended token ceiling.",
    },
    {
      id: "anthropic",
      name: "Anthropic Claude",
      sourceLabel: "Anthropic Claude Pricing",
      sourceLabelEn: "Anthropic Claude Pricing",
      sourceUrl: "https://docs.anthropic.com/en/docs/about-claude/pricing",
      sourceNote: "官方页同时列出 batch、cache write、cache hit，本页主展示标准 input / output 价格。",
      sourceNoteEn: "The official page also lists batch, cache write, and cache hit pricing. This page focuses on the standard input / output rates.",
    },
    {
      id: "deepseek",
      name: "DeepSeek",
      sourceLabel: "DeepSeek CNY Pricing",
      sourceLabelEn: "DeepSeek CNY Pricing",
      sourceUrl: "https://api-docs.deepseek.com/quick_start/pricing-details-cny",
      sourceNote: "官方人民币计价页区分 cache hit / miss，本页分别列为两个参考档位。",
      sourceNoteEn: "The official RMB pricing page separates cache hit and miss. This page lists them as two reference tiers.",
    },
    {
      id: "glm",
      name: "Zhipu GLM",
      sourceLabel: "智谱开放平台定价页",
      sourceLabelEn: "Zhipu Open Platform Pricing",
      sourceUrl: "https://bigmodel.cn/pricing",
      sourceNote: "GLM 文本模型按上下文长度与输出长度分档，本页采用最常见基础档位并在备注中标明更高档位。",
      sourceNoteEn: "GLM text models are tiered by context and output length. This page uses the most common base tier and notes the higher tiers separately.",
    },
    {
      id: "minimax",
      name: "MiniMax",
      sourceLabel: "MiniMax Pay-as-you-go Pricing",
      sourceLabelEn: "MiniMax Pay-as-you-go Pricing",
      sourceUrl: "https://platform.minimaxi.com/docs/guides/pricing-paygo",
      sourceNote: "2026-03-19 页面内按 M2.7 / M2.7-highspeed 版本展示，价格字段沿用当前配置值。",
      sourceNoteEn: "As of 2026-03-19, the page lists M2.7 and M2.7-highspeed variants. The price fields here follow those published values.",
    },
  ],
  models: [
    {
      id: "gpt-5",
      providerId: "openai",
      name: "GPT-5",
      description: "旗舰代码主力",
      descriptionEn: "Flagship coding model",
      currency: "USD",
      inputCostPer1mToken: 2.5,
      outputCostPer1mToken: 15,
    },
    {
      id: "gpt-5-mini",
      providerId: "openai",
      name: "GPT-5 mini",
      description: "性价比代码首选",
      descriptionEn: "Best-value coding model",
      currency: "USD",
      inputCostPer1mToken: 0.25,
      outputCostPer1mToken: 2,
    },
    {
      id: "gpt-5-nano",
      providerId: "openai",
      name: "GPT-5 nano",
      description: "轻量代码任务",
      descriptionEn: "Lightweight coding tasks",
      currency: "USD",
      inputCostPer1mToken: 0.05,
      outputCostPer1mToken: 0.4,
    },
    {
      id: "claude-sonnet-4-6",
      providerId: "anthropic",
      name: "Claude Sonnet 4.6",
      description: "编程首选",
      descriptionEn: "Top coding pick",
      currency: "USD",
      inputCostPer1mToken: 3,
      outputCostPer1mToken: 15,
      cacheReadCostPer1mToken: 0.3,
      cacheWriteCostPer1mToken: 3.75,
    },
    {
      id: "claude-opus-4-6",
      providerId: "anthropic",
      name: "Claude Opus 4.6",
      description: "旗舰强推理",
      descriptionEn: "Flagship reasoning tier",
      currency: "USD",
      inputCostPer1mToken: 5,
      outputCostPer1mToken: 25,
      cacheReadCostPer1mToken: 0.5,
      cacheWriteCostPer1mToken: 6.25,
    },
    {
      id: "claude-haiku-4-5",
      providerId: "anthropic",
      name: "Claude Haiku 4.5",
      description: "轻量快速代码",
      descriptionEn: "Fast lightweight coding",
      currency: "USD",
      inputCostPer1mToken: 1,
      outputCostPer1mToken: 5,
      cacheReadCostPer1mToken: 0.1,
      cacheWriteCostPer1mToken: 1.25,
    },
    {
      id: "deepseek-v3",
      providerId: "deepseek",
      name: "DeepSeek-V3",
      description: "通用代码主力",
      descriptionEn: "Mainline coding model",
      currency: "CNY",
      inputCostPer1mToken: 2,
      outputCostPer1mToken: 8,
      pricingContext: "缓存未命中",
      pricingContextEn: "Cache miss",
    },
    {
      id: "deepseek-v3-cache-hit",
      providerId: "deepseek",
      name: "DeepSeek-V3",
      description: "缓存命中优惠",
      descriptionEn: "Discounted cache-hit tier",
      currency: "CNY",
      inputCostPer1mToken: 0.5,
      outputCostPer1mToken: 8,
      pricingContext: "缓存命中",
      pricingContextEn: "Cache hit",
    },
    {
      id: "deepseek-r1",
      providerId: "deepseek",
      name: "DeepSeek-R1",
      description: "深度推理代码",
      descriptionEn: "Deep reasoning for code",
      currency: "CNY",
      inputCostPer1mToken: 4,
      outputCostPer1mToken: 16,
      pricingContext: "缓存未命中",
      pricingContextEn: "Cache miss",
    },
    {
      id: "glm-5-turbo-base",
      providerId: "glm",
      name: "GLM-5-Turbo",
      description: "长流程 Agent / 代码自动化",
      descriptionEn: "Long-running agents / code automation",
      currency: "CNY",
      inputCostPer1mToken: 5,
      outputCostPer1mToken: 22,
      pricingContext: "输入长度 [0, 32K)",
      pricingContextEn: "Input length [0, 32K)",
      pricingNote: "32K+ 输入档位升至输入 ¥7、输出 ¥26。",
      pricingNoteEn: "The 32K+ input tier rises to input ¥7 and output ¥26.",
    },
    {
      id: "glm-5-base",
      providerId: "glm",
      name: "GLM-5",
      description: "通用推理代码",
      descriptionEn: "General reasoning for code",
      currency: "CNY",
      inputCostPer1mToken: 4,
      outputCostPer1mToken: 18,
      pricingContext: "输入长度 [0, 32K)",
      pricingContextEn: "Input length [0, 32K)",
      pricingNote: "32K+ 输入档位升至输入 ¥6、输出 ¥22。",
      pricingNoteEn: "The 32K+ input tier rises to input ¥6 and output ¥22.",
    },
    {
      id: "glm-4-7-base",
      providerId: "glm",
      name: "GLM-4.7",
      description: "老牌通用文本基线",
      descriptionEn: "Established general text baseline",
      currency: "CNY",
      inputCostPer1mToken: 2,
      outputCostPer1mToken: 8,
      pricingContext: "输入长度 [0, 32K)，输出长度 [0, 0.2K)",
      pricingContextEn: "Input length [0, 32K), output length [0, 0.2K)",
      pricingNote: "更高输出/上下文档位可升至输入 ¥3 / 输出 ¥14 或输入 ¥4 / 输出 ¥16。",
      pricingNoteEn: "Higher output or context tiers can rise to input ¥3 / output ¥14 or input ¥4 / output ¥16.",
    },
    {
      id: "minimax-m2-5",
      providerId: "minimax",
      name: "MiniMax-M2.7",
      description: "通用代码与 Agent",
      descriptionEn: "General coding and agent work",
      currency: "CNY",
      inputCostPer1mToken: 2.1,
      outputCostPer1mToken: 8.4,
      cacheReadCostPer1mToken: 0.21,
      cacheWriteCostPer1mToken: 2.625,
      pricingContext: "Pay-as-you-go",
      pricingContextEn: "Pay-as-you-go",
    },
    {
      id: "minimax-m2-5-highspeed",
      providerId: "minimax",
      name: "MiniMax-M2.7-highspeed",
      description: "高吞吐响应优先",
      descriptionEn: "Prioritizes high-throughput response",
      currency: "CNY",
      inputCostPer1mToken: 4.2,
      outputCostPer1mToken: 16.8,
      cacheReadCostPer1mToken: 0.21,
      cacheWriteCostPer1mToken: 2.625,
      pricingContext: "Pay-as-you-go",
      pricingContextEn: "Pay-as-you-go",
    },
  ],
}

export function getLocalizedModelCopy(
  model: Pick<ModelPricing, "description" | "descriptionEn" | "pricingContext" | "pricingContextEn" | "pricingNote" | "pricingNoteEn">,
  language: SupportedLanguage,
) {
  return {
    description: language === "zh-CN" ? model.description : model.descriptionEn,
    pricingContext: language === "zh-CN" ? model.pricingContext : model.pricingContextEn,
    pricingNote: language === "zh-CN" ? model.pricingNote : model.pricingNoteEn,
  }
}

export function getProviderById(providerId: string) {
  return pricingData.providers.find((provider) => provider.id === providerId)
}

export function getLocalizedProviderCopy(
  provider: Pick<PricingProvider, "sourceLabel" | "sourceLabelEn" | "sourceNote" | "sourceNoteEn">,
  language: SupportedLanguage,
) {
  return {
    sourceLabel: language === "zh-CN" ? provider.sourceLabel : provider.sourceLabelEn,
    sourceNote: language === "zh-CN" ? provider.sourceNote : provider.sourceNoteEn,
  }
}

export function getLocalizedPricingSource(language: SupportedLanguage) {
  return language === "zh-CN" ? pricingData.source : pricingData.sourceEn
}

export function getModelById(modelId: string) {
  return pricingData.models.find((model) => model.id === modelId) ?? pricingData.models[0]
}
