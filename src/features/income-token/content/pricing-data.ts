import type { SupportedLanguage } from "@/i18n/config"

export type PricingCurrency = "USD" | "CNY"
export type ModelAvailabilityStatus = "available" | "coming-soon" | "legacy-mapped"

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
  sourceLabel: string
  sourceLabelEn: string
  sourceUrl: string
  sourceNote: string
  sourceNoteEn: string
  sourceSyncedAt: string
  availabilityStatus: ModelAvailabilityStatus
  legacyIds?: string[]
  modelsDevId?: string
}

export interface PricingData {
  providers: PricingProvider[]
  models: ModelPricing[]
  inputOutputRatio: number // e.g. 3 = 3:1 input:output for code scenarios
  exchangeRateUsdToCny: number
  updatedAt: string
  catalogRefreshDate: string
  source: string
  sourceEn: string
}

const MODELS_DEV_SOURCE_URL = "https://models.dev/api.json"
const MODELS_DEV_SOURCE_LABEL = "models.dev API"

function createModelsDevSource(sourceNote: string, sourceNoteEn: string) {
  return {
    sourceLabel: MODELS_DEV_SOURCE_LABEL,
    sourceLabelEn: MODELS_DEV_SOURCE_LABEL,
    sourceUrl: MODELS_DEV_SOURCE_URL,
    sourceNote,
    sourceNoteEn,
  }
}

const GLM_SOURCE = {
  sourceLabel: "智谱开放平台定价页",
  sourceLabelEn: "Zhipu Open Platform Pricing",
  sourceUrl: "https://bigmodel.cn/pricing",
  sourceNote: "GLM 文本模型按上下文长度与输出长度分档，本页采用最常见基础档位并在备注中标明更高档位。",
  sourceNoteEn: "GLM text models are tiered by context and output length. This page uses the most common base tier and notes the higher tiers separately.",
  sourceSyncedAt: "2026-03-19",
  availabilityStatus: "available" as const,
}

const MINIMAX_SOURCE = {
  sourceLabel: "MiniMax Pay-as-you-go Pricing",
  sourceLabelEn: "MiniMax Pay-as-you-go Pricing",
  sourceUrl: "https://platform.minimaxi.com/docs/guides/pricing-paygo",
  sourceNote: "2026-03-19 页面内按 M2.7 / M2.7-highspeed 版本展示，价格字段沿用当前配置值。",
  sourceNoteEn: "As of 2026-03-19, the page lists M2.7 and M2.7-highspeed variants. The price fields here follow those published values.",
  sourceSyncedAt: "2026-03-19",
  availabilityStatus: "available" as const,
}

/*
 * models.dev field mapping for this static canonical catalog:
 * - Provider key + model key -> providerId, modelsDevId, and local canonical id.
 * - model.name -> name; cost.input/output/cache_read/cache_write -> per-1M token prices.
 * - last_updated -> sourceSyncedAt; release/availability notes -> availabilityStatus and pricingNote.
 * - Missing or model-family-specific pricing dimensions are normalized in pricingContext/pricingNote.
 */

export const pricingData: PricingData = {
  updatedAt: "2026-04-24",
  catalogRefreshDate: "2026-04-24",
  source: "models.dev API 静态快照（catalog refresh: 2026-04-24）",
  sourceEn: "Static snapshot from models.dev API (catalog refresh: 2026-04-24)",
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
      id: "gpt-5.4",
      providerId: "openai",
      name: "GPT-5.4",
      description: "旗舰代码主力",
      descriptionEn: "Flagship coding model",
      currency: "USD",
      inputCostPer1mToken: 2.5,
      outputCostPer1mToken: 15,
      cacheReadCostPer1mToken: 0.25,
      pricingContext: "标准 input / output，另记录 cached input",
      pricingContextEn: "Standard input / output with cached input recorded",
      pricingNote: "由 models.dev 的 openai/gpt-5.4 映射；200K+ 上下文档位另有更高价格，本页综合成本采用标准档。Legacy ID gpt-5 会解析到此模型。",
      pricingNoteEn: "Mapped from models.dev openai/gpt-5.4. The 200K+ context tier has higher prices; this page uses the standard tier for blended cost. Legacy ID gpt-5 resolves here.",
      ...createModelsDevSource(
        "models.dev cost.input/output/cache_read 映射为每 1M token 价格，context_over_200k 保留在备注中。",
        "models.dev cost.input/output/cache_read map to per-1M token prices; context_over_200k is retained in the note.",
      ),
      sourceSyncedAt: "2026-03-05",
      availabilityStatus: "available",
      legacyIds: ["gpt-5"],
      modelsDevId: "gpt-5.4",
    },
    {
      id: "gpt-5.5",
      providerId: "openai",
      name: "GPT-5.5",
      description: "下一代旗舰预览",
      descriptionEn: "Next flagship preview",
      currency: "USD",
      inputCostPer1mToken: 5,
      outputCostPer1mToken: 30,
      cacheReadCostPer1mToken: 0.5,
      pricingContext: "Coming soon，标准 input / output",
      pricingContextEn: "Coming soon, standard input / output",
      pricingNote: "models.dev 已列出价格，但本地目录标记为 coming soon，避免把未完全开放状态误读为可直接使用。",
      pricingNoteEn: "models.dev lists pricing, but this catalog marks it as coming soon so availability is not overstated.",
      ...createModelsDevSource(
        "models.dev cost.input/output/cache_read 映射为每 1M token 价格；可用性由本地目录显式标注。",
        "models.dev cost.input/output/cache_read map to per-1M token prices; availability is explicitly marked locally.",
      ),
      sourceSyncedAt: "2026-04-23",
      availabilityStatus: "coming-soon",
      modelsDevId: "gpt-5.5",
    },
    {
      id: "gpt-5.4-mini",
      providerId: "openai",
      name: "GPT-5.4 mini",
      description: "性价比代码首选",
      descriptionEn: "Best-value coding model",
      currency: "USD",
      inputCostPer1mToken: 0.75,
      outputCostPer1mToken: 4.5,
      cacheReadCostPer1mToken: 0.075,
      pricingContext: "标准 input / output，另记录 cached input",
      pricingContextEn: "Standard input / output with cached input recorded",
      pricingNote: "Legacy ID gpt-5-mini 会解析到此模型。",
      pricingNoteEn: "Legacy ID gpt-5-mini resolves here.",
      ...createModelsDevSource(
        "models.dev cost.input/output/cache_read 映射为每 1M token 价格。",
        "models.dev cost.input/output/cache_read map to per-1M token prices.",
      ),
      sourceSyncedAt: "2026-03-17",
      availabilityStatus: "available",
      legacyIds: ["gpt-5-mini"],
      modelsDevId: "gpt-5.4-mini",
    },
    {
      id: "gpt-5.4-nano",
      providerId: "openai",
      name: "GPT-5.4 nano",
      description: "轻量代码任务",
      descriptionEn: "Lightweight coding tasks",
      currency: "USD",
      inputCostPer1mToken: 0.2,
      outputCostPer1mToken: 1.25,
      cacheReadCostPer1mToken: 0.02,
      pricingContext: "标准 input / output，另记录 cached input",
      pricingContextEn: "Standard input / output with cached input recorded",
      pricingNote: "Legacy ID gpt-5-nano 会解析到此模型。",
      pricingNoteEn: "Legacy ID gpt-5-nano resolves here.",
      ...createModelsDevSource(
        "models.dev cost.input/output/cache_read 映射为每 1M token 价格。",
        "models.dev cost.input/output/cache_read map to per-1M token prices.",
      ),
      sourceSyncedAt: "2026-03-17",
      availabilityStatus: "available",
      legacyIds: ["gpt-5-nano"],
      modelsDevId: "gpt-5.4-nano",
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
      pricingContext: "标准 input / output，另记录 prompt cache",
      pricingContextEn: "Standard input / output with prompt cache recorded",
      ...createModelsDevSource(
        "models.dev cost.input/output/cache_read/cache_write 映射为每 1M token 价格。",
        "models.dev cost.input/output/cache_read/cache_write map to per-1M token prices.",
      ),
      sourceSyncedAt: "2026-03-13",
      availabilityStatus: "available",
      modelsDevId: "claude-sonnet-4-6",
    },
    {
      id: "claude-opus-4-7",
      providerId: "anthropic",
      name: "Claude Opus 4.7",
      description: "旗舰强推理",
      descriptionEn: "Flagship reasoning tier",
      currency: "USD",
      inputCostPer1mToken: 5,
      outputCostPer1mToken: 25,
      cacheReadCostPer1mToken: 0.5,
      cacheWriteCostPer1mToken: 6.25,
      pricingContext: "标准 input / output，另记录 prompt cache",
      pricingContextEn: "Standard input / output with prompt cache recorded",
      pricingNote: "Legacy ID claude-opus-4-6 会解析到 Claude Opus 4.7。",
      pricingNoteEn: "Legacy ID claude-opus-4-6 resolves to Claude Opus 4.7.",
      ...createModelsDevSource(
        "models.dev cost.input/output/cache_read/cache_write 映射为每 1M token 价格。",
        "models.dev cost.input/output/cache_read/cache_write map to per-1M token prices.",
      ),
      sourceSyncedAt: "2026-04-16",
      availabilityStatus: "available",
      legacyIds: ["claude-opus-4-6"],
      modelsDevId: "claude-opus-4-7",
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
      pricingContext: "标准 input / output，另记录 prompt cache",
      pricingContextEn: "Standard input / output with prompt cache recorded",
      ...createModelsDevSource(
        "models.dev cost.input/output/cache_read/cache_write 映射为每 1M token 价格。",
        "models.dev cost.input/output/cache_read/cache_write map to per-1M token prices.",
      ),
      sourceSyncedAt: "2025-10-15",
      availabilityStatus: "available",
      modelsDevId: "claude-haiku-4-5",
    },
    {
      id: "deepseek-v4-flash",
      providerId: "deepseek",
      name: "DeepSeek-V4-Flash",
      description: "通用代码主力",
      descriptionEn: "Mainline coding model",
      currency: "USD",
      inputCostPer1mToken: 0.28,
      outputCostPer1mToken: 0.42,
      cacheReadCostPer1mToken: 0.028,
      pricingContext: "缓存未命中",
      pricingContextEn: "Cache miss",
      pricingNote: "由 models.dev deepseek/deepseek-chat 规范化为 DeepSeek-V4-Flash；Legacy ID deepseek-v3 会解析到此 cache miss 档。",
      pricingNoteEn: "Normalized from models.dev deepseek/deepseek-chat as DeepSeek-V4-Flash. Legacy ID deepseek-v3 resolves to this cache-miss tier.",
      ...createModelsDevSource(
        "models.dev cost.input/output/cache_read 映射为标准、输出与 cache hit 输入价；本条使用 cache miss 输入价。",
        "models.dev cost.input/output/cache_read map to standard input, output, and cache-hit input; this entry uses cache-miss input.",
      ),
      sourceSyncedAt: "2026-02-28",
      availabilityStatus: "available",
      legacyIds: ["deepseek-v3"],
      modelsDevId: "deepseek-chat",
    },
    {
      id: "deepseek-v4-flash-cache-hit",
      providerId: "deepseek",
      name: "DeepSeek-V4-Flash",
      description: "缓存命中优惠",
      descriptionEn: "Discounted cache-hit tier",
      currency: "USD",
      inputCostPer1mToken: 0.028,
      outputCostPer1mToken: 0.42,
      cacheReadCostPer1mToken: 0.028,
      pricingContext: "缓存命中",
      pricingContextEn: "Cache hit",
      pricingNote: "由 models.dev deepseek/deepseek-chat 的 cache_read 字段拆分为可计算的 cache hit 目录条目。",
      pricingNoteEn: "Split from the models.dev deepseek/deepseek-chat cache_read field as a calculable cache-hit catalog entry.",
      ...createModelsDevSource(
        "models.dev cache_read 被规范化为本条输入价，输出价沿用 cost.output。",
        "models.dev cache_read is normalized as this entry's input price; output uses cost.output.",
      ),
      sourceSyncedAt: "2026-02-28",
      availabilityStatus: "available",
      legacyIds: ["deepseek-v3-cache-hit"],
      modelsDevId: "deepseek-chat",
    },
    {
      id: "deepseek-v4-pro",
      providerId: "deepseek",
      name: "DeepSeek-V4-Pro",
      description: "深度推理代码",
      descriptionEn: "Deep reasoning for code",
      currency: "USD",
      inputCostPer1mToken: 0.28,
      outputCostPer1mToken: 0.42,
      cacheReadCostPer1mToken: 0.028,
      pricingContext: "缓存未命中",
      pricingContextEn: "Cache miss",
      pricingNote: "由 models.dev deepseek/deepseek-reasoner 规范化为 DeepSeek-V4-Pro；Legacy ID deepseek-r1 会解析到此 cache miss 档。",
      pricingNoteEn: "Normalized from models.dev deepseek/deepseek-reasoner as DeepSeek-V4-Pro. Legacy ID deepseek-r1 resolves to this cache-miss tier.",
      ...createModelsDevSource(
        "models.dev cost.input/output/cache_read 映射为标准、输出与 cache hit 输入价；本条使用 cache miss 输入价。",
        "models.dev cost.input/output/cache_read map to standard input, output, and cache-hit input; this entry uses cache-miss input.",
      ),
      sourceSyncedAt: "2026-02-28",
      availabilityStatus: "available",
      legacyIds: ["deepseek-r1"],
      modelsDevId: "deepseek-reasoner",
    },
    {
      id: "deepseek-v4-pro-cache-hit",
      providerId: "deepseek",
      name: "DeepSeek-V4-Pro",
      description: "推理缓存命中优惠",
      descriptionEn: "Discounted reasoning cache-hit tier",
      currency: "USD",
      inputCostPer1mToken: 0.028,
      outputCostPer1mToken: 0.42,
      cacheReadCostPer1mToken: 0.028,
      pricingContext: "缓存命中",
      pricingContextEn: "Cache hit",
      pricingNote: "由 models.dev deepseek/deepseek-reasoner 的 cache_read 字段拆分为可计算的 cache hit 目录条目。",
      pricingNoteEn: "Split from the models.dev deepseek/deepseek-reasoner cache_read field as a calculable cache-hit catalog entry.",
      ...createModelsDevSource(
        "models.dev cache_read 被规范化为本条输入价，输出价沿用 cost.output。",
        "models.dev cache_read is normalized as this entry's input price; output uses cost.output.",
      ),
      sourceSyncedAt: "2026-02-28",
      availabilityStatus: "available",
      legacyIds: ["deepseek-r1-cache-hit"],
      modelsDevId: "deepseek-reasoner",
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
      ...GLM_SOURCE,
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
      ...GLM_SOURCE,
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
      ...GLM_SOURCE,
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
      ...MINIMAX_SOURCE,
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
      ...MINIMAX_SOURCE,
    },
  ],
}

export function getLocalizedModelCopy(
  model: Pick<ModelPricing, "description" | "descriptionEn" | "pricingContext" | "pricingContextEn" | "pricingNote" | "pricingNoteEn" | "sourceLabel" | "sourceLabelEn" | "sourceNote" | "sourceNoteEn">,
  language: SupportedLanguage,
) {
  return {
    description: language === "zh-CN" ? model.description : model.descriptionEn,
    pricingContext: language === "zh-CN" ? model.pricingContext : model.pricingContextEn,
    pricingNote: language === "zh-CN" ? model.pricingNote : model.pricingNoteEn,
    sourceLabel: language === "zh-CN" ? model.sourceLabel : model.sourceLabelEn,
    sourceNote: language === "zh-CN" ? model.sourceNote : model.sourceNoteEn,
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

export function resolveCanonicalModelId(modelId: string | null | undefined): string | null {
  if (!modelId) return null

  const normalizedModelId = modelId.trim()
  const directModel = pricingData.models.find((model) => model.id === normalizedModelId)
  if (directModel) return directModel.id

  const legacyModel = pricingData.models.find((model) => model.legacyIds?.includes(normalizedModelId))
  return legacyModel?.id ?? null
}

export function getModelById(modelId: string) {
  const canonicalModelId = resolveCanonicalModelId(modelId)
  return pricingData.models.find((model) => model.id === canonicalModelId) ?? pricingData.models[0]
}
