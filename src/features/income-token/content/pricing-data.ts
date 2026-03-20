export type PricingCurrency = "USD" | "CNY"

export interface PricingProvider {
  id: string
  name: string
  sourceLabel: string
  sourceUrl: string
  sourceNote: string
}

export interface ModelPricing {
  id: string
  providerId: string
  name: string
  description: string
  currency: PricingCurrency
  inputCostPer1mToken: number
  outputCostPer1mToken: number
  cacheReadCostPer1mToken?: number
  cacheWriteCostPer1mToken?: number
  pricingContext?: string
  pricingNote?: string
}

export interface PricingData {
  providers: PricingProvider[]
  models: ModelPricing[]
  inputOutputRatio: number // e.g. 3 = 3:1 input:output for code scenarios
  exchangeRateUsdToCny: number
  updatedAt: string
  source: string
}

export const pricingData: PricingData = {
  updatedAt: "2026-03-19",
  source: "多家官方 API 定价页快照（2026-03-19）",
  inputOutputRatio: 3,
  exchangeRateUsdToCny: 7.25,
  providers: [
    {
      id: "openai",
      name: "OpenAI",
      sourceLabel: "OpenAI API Pricing",
      sourceUrl: "https://openai.com/api/pricing/",
      sourceNote: "按官方标准 input / output 口径估算，未将 cached input 单独计入综合 Token 上限。",
    },
    {
      id: "anthropic",
      name: "Anthropic Claude",
      sourceLabel: "Anthropic Claude Pricing",
      sourceUrl: "https://docs.anthropic.com/en/docs/about-claude/pricing",
      sourceNote: "官方页同时列出 batch、cache write、cache hit，本页主展示标准 input / output 价格。",
    },
    {
      id: "deepseek",
      name: "DeepSeek",
      sourceLabel: "DeepSeek CNY Pricing",
      sourceUrl: "https://api-docs.deepseek.com/quick_start/pricing-details-cny",
      sourceNote: "官方人民币计价页区分 cache hit / miss，本页分别列为两个参考档位。",
    },
    {
      id: "glm",
      name: "Zhipu GLM",
      sourceLabel: "智谱开放平台定价页",
      sourceUrl: "https://bigmodel.cn/pricing",
      sourceNote: "GLM 文本模型按上下文长度与输出长度分档，本页采用最常见基础档位并在备注中标明更高档位。",
    },
    {
      id: "minimax",
      name: "MiniMax",
      sourceLabel: "MiniMax Pay-as-you-go Pricing",
      sourceUrl: "https://platform.minimaxi.com/docs/guides/pricing-paygo",
      sourceNote: "2026-03-19 页面内按 M2.7 / M2.7-highspeed 版本展示，价格字段沿用当前配置值。",
    },
  ],
  models: [
    {
      id: "gpt-5",
      providerId: "openai",
      name: "GPT-5",
      description: "旗舰代码主力",
      currency: "USD",
      inputCostPer1mToken: 2.5,
      outputCostPer1mToken: 15,
    },
    {
      id: "gpt-5-mini",
      providerId: "openai",
      name: "GPT-5 mini",
      description: "性价比代码首选",
      currency: "USD",
      inputCostPer1mToken: 0.25,
      outputCostPer1mToken: 2,
    },
    {
      id: "gpt-5-nano",
      providerId: "openai",
      name: "GPT-5 nano",
      description: "轻量代码任务",
      currency: "USD",
      inputCostPer1mToken: 0.05,
      outputCostPer1mToken: 0.4,
    },
    {
      id: "claude-sonnet-4-6",
      providerId: "anthropic",
      name: "Claude Sonnet 4.6",
      description: "编程首选",
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
      currency: "CNY",
      inputCostPer1mToken: 2,
      outputCostPer1mToken: 8,
      pricingContext: "缓存未命中",
    },
    {
      id: "deepseek-v3-cache-hit",
      providerId: "deepseek",
      name: "DeepSeek-V3",
      description: "缓存命中优惠",
      currency: "CNY",
      inputCostPer1mToken: 0.5,
      outputCostPer1mToken: 8,
      pricingContext: "缓存命中",
    },
    {
      id: "deepseek-r1",
      providerId: "deepseek",
      name: "DeepSeek-R1",
      description: "深度推理代码",
      currency: "CNY",
      inputCostPer1mToken: 4,
      outputCostPer1mToken: 16,
      pricingContext: "缓存未命中",
    },
    {
      id: "glm-5-turbo-base",
      providerId: "glm",
      name: "GLM-5-Turbo",
      description: "长流程 Agent / 代码自动化",
      currency: "CNY",
      inputCostPer1mToken: 5,
      outputCostPer1mToken: 22,
      pricingContext: "输入长度 [0, 32K)",
      pricingNote: "32K+ 输入档位升至输入 ¥7、输出 ¥26。",
    },
    {
      id: "glm-5-base",
      providerId: "glm",
      name: "GLM-5",
      description: "通用推理代码",
      currency: "CNY",
      inputCostPer1mToken: 4,
      outputCostPer1mToken: 18,
      pricingContext: "输入长度 [0, 32K)",
      pricingNote: "32K+ 输入档位升至输入 ¥6、输出 ¥22。",
    },
    {
      id: "glm-4-7-base",
      providerId: "glm",
      name: "GLM-4.7",
      description: "老牌通用文本基线",
      currency: "CNY",
      inputCostPer1mToken: 2,
      outputCostPer1mToken: 8,
      pricingContext: "输入长度 [0, 32K)，输出长度 [0, 0.2K)",
      pricingNote: "更高输出/上下文档位可升至输入 ¥3 / 输出 ¥14 或输入 ¥4 / 输出 ¥16。",
    },
    {
      id: "minimax-m2-5",
      providerId: "minimax",
      name: "MiniMax-M2.7",
      description: "通用代码与 Agent",
      currency: "CNY",
      inputCostPer1mToken: 2.1,
      outputCostPer1mToken: 8.4,
      cacheReadCostPer1mToken: 0.21,
      cacheWriteCostPer1mToken: 2.625,
      pricingContext: "Pay-as-you-go",
    },
    {
      id: "minimax-m2-5-highspeed",
      providerId: "minimax",
      name: "MiniMax-M2.7-highspeed",
      description: "高吞吐响应优先",
      currency: "CNY",
      inputCostPer1mToken: 4.2,
      outputCostPer1mToken: 16.8,
      cacheReadCostPer1mToken: 0.21,
      cacheWriteCostPer1mToken: 2.625,
      pricingContext: "Pay-as-you-go",
    },
  ],
}
