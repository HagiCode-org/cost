import type { CalculationResult, TokenCeiling } from "./calculate-ai-risk"
import { WORKING_DAYS_PER_YEAR } from "./calculate-ai-risk"
import { pricingData } from "../content/pricing-data"
import type { SupportedLanguage } from "@/i18n/config"
import { benchmarkData } from "../content/benchmark-data"

export interface AgentSummaryViewModel {
  annualIncomeFormatted: string
  annualTotalCostFormatted: string
  annualTotalCostFormula: string
  annualTotalCostExplanation: string
  cityLabel: string
  selectedModelName: string
  selectedModelDescription: string
  performanceMultiplierFormatted: string
  performanceMultiplierExplanation: string
  dailyTokenUsageFormatted: string
  dailyTokenUsageExplanation: string
  annualAiCostFormatted: string
  annualAiCostFormula: string
  annualAiCostExplanation: string
  dailyAiCostFormatted: string
  dailyAiCostFormula: string
  dailyAiCostExplanation: string
  aiCostShareFormatted: string
  aiCostShareFormula: string
  aiCostShareExplanation: string
  costEffectivenessFormatted: string
  costEffectivenessFormula: string
  costEffectivenessExplanation: string
  costEffectivenessScalePosition: number
  costEffectivenessScaleLabel: string
  costEffectivenessScaleSummary: string
  affordableWorkflowCountFormatted: string
  affordableWorkflowFormula: string
  affordableWorkflowExplanation: string
  effectivePeopleEquivalentFormatted: string
  effectivePeopleEquivalentFormula: string
  effectivePeopleEquivalentExplanation: string
  dangerScalePosition: number
  dangerScaleLabel: string
  dangerScaleSummary: string
  verdictHeadline: string
  verdictBody: string
  verdictTone: "danger" | "warning" | "safe"
}

export interface ModelCostViewModel {
  annualTotalCostFormatted: string
  providerName: string
  modelName: string
  modelDescription: string
  pricingContext?: string
  pricingNote?: string
  sourceLabel: string
  sourceUrl: string
  sourceNote: string
  inputPriceFormatted: string
  outputPriceFormatted: string
  mixedPriceFormatted: string
  mixedPriceFormula: string
  mixedPriceExplanation: string
  dailyTokenUsageFormatted: string
  annualTokenUsageFormatted: string
  dailyAiCostFormatted: string
  annualAiCostFormatted: string
  dailyAiCostFormula: string
  dailyAiCostExplanation: string
  annualAiCostFormula: string
  annualAiCostExplanation: string
  fullBudgetTotalTokensFormatted: string
  fullBudgetWorkdayTokensFormatted: string
  workdayAverageFormula: string
}

export interface TokenCeilingDisplay {
  modelId: string
  providerId: string
  providerName: string
  modelName: string
  modelDescription: string
  averageWorkdayTokensFormatted: string
  mixInputFormula: string
  mixOutputFormula: string
  inputPriceFormatted: string
  outputPriceFormatted: string
  cacheReadPriceFormatted?: string
  cacheWritePriceFormatted?: string
  pricingContext?: string
  pricingNote?: string
  sourceLabel: string
  sourceUrl: string
  inputTokensFormatted: string
  outputTokensFormatted: string
  totalTokensFormatted: string
  inputTokensInMixFormatted: string
  outputTokensInMixFormatted: string
}

export interface PricingProviderDisplay {
  providerId: string
  providerName: string
  sourceLabel: string
  sourceUrl: string
  sourceNote: string
  models: TokenCeilingDisplay[]
}

export interface ResultViewModel {
  summarySection: AgentSummaryViewModel
  costSection: ModelCostViewModel
  tokenListSection: {
    annualTotalCostFormatted: string
    inputOutputRatio: number
    workingDaysPerYear: number
    pricingProviders: PricingProviderDisplay[]
  }
  dataDisclaimer: {
    pricingUpdatedAt: string
    pricingSource: string
    pricingReferences: Array<{
      providerId: string
      providerName: string
      sourceLabel: string
      sourceUrl: string
      sourceNote: string
    }>
  }
}

function formatCny(value: number): string {
  return value.toLocaleString("zh-CN", { maximumFractionDigits: 0 })
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function formatMultiplier(value: number): string {
  return `${value.toFixed(2)}x`
}

function formatRatio(value: number): string {
  if (!Number.isFinite(value)) return "∞"
  return `${value.toFixed(2)}x`
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function formatTokens(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)} B`
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)} M`
  }
  return value.toLocaleString("zh-CN")
}

function formatPriceNumber(value: number): string {
  if (Number.isInteger(value)) return value.toFixed(0)
  return value.toLocaleString("en-US", { maximumFractionDigits: 3 })
}

function formatCurrencyPrice(currency: "USD" | "CNY", value: number): string {
  const symbol = currency === "USD" ? "$" : "¥"
  return `${symbol}${formatPriceNumber(value)}`
}

function formatBudgetByCurrency(currency: "USD" | "CNY", annualCostCny: number): string {
  const budget = currency === "USD" ? annualCostCny / pricingData.exchangeRateUsdToCny : annualCostCny
  return formatCurrencyPrice(currency, budget)
}

function getCityLabel(cityTier: CalculationResult["cityTier"], language: SupportedLanguage): string {
  const city = benchmarkData.cityCoefficients.find((item) => item.tier === cityTier)
  if (!city) return cityTier
  if (language === "zh-CN") return city.label

  const labels: Record<CalculationResult["cityTier"], string> = {
    tier1: "Beijing / Shanghai / Shenzhen / Guangzhou",
    "new-tier1": "Hangzhou / Chengdu / Suzhou / Nanjing",
    tier2: "Wuhan / Xi'an / Tianjin / Zhengzhou",
    other: "Yichang / Luoyang / Nanchong / Shangrao",
  }
  return labels[cityTier]
}

function buildCoworkerLead(result: CalculationResult, language: SupportedLanguage): string {
  if (language === "zh-CN") {
    return `如果你的同事和你拿着差不多的薪资，也会使用 ${result.selectedModel.modelName}，并且具备同样的效率倍数与 Token 强度，那么他大约能把自己放大成过去的 ${result.effectivePeopleEquivalent.toFixed(2)} 个人。下面看到的，就是这对你的危险程度。`
  }

  return `If a coworker earns about what you earn, uses ${result.selectedModel.modelName}, and reaches the same efficiency multiplier and token intensity, they could scale themselves into roughly ${result.effectivePeopleEquivalent.toFixed(2)} old workers. The panel below shows how dangerous that becomes for you.`
}

function buildVerdict(
  result: CalculationResult,
  language: SupportedLanguage
): AgentSummaryViewModel["verdictHeadline"] {
  if (result.isCostInefficient) {
    return language === "zh-CN"
      ? "如果同事也照这个打法来做，他暂时未必会碾压你，但这套打法本身偏浪费。"
      : "If a coworker follows the same setup, they may not crush you yet, but the workflow itself looks wasteful."
  }
  if (result.effectivePeopleEquivalent >= 2) {
    return language === "zh-CN"
      ? "如果你的同事也具备这组条件，他对你的威胁已经很高。"
      : "If your coworker has the same setup, the threat to you is already high."
  }
  if (result.effectivePeopleEquivalent >= 1.5) {
    return language === "zh-CN"
      ? "如果你的同事也具备这组条件，他已经开始对你形成明显压力。"
      : "If your coworker has the same setup, they are already creating real pressure on you."
  }
  return language === "zh-CN"
    ? "如果你的同事也具备这组条件，他暂时还不能立刻拉开你们的差距。"
    : "If your coworker has the same setup, they may not pull away from you immediately yet."
}

function buildVerdictBody(result: CalculationResult, language: SupportedLanguage): string {
  if (result.isCostInefficient) {
    return language === "zh-CN"
      ? `假设你的同事和你拥有接近的薪资，也按这组模型、效率倍数与 Token 强度来使用 Agent，那么他的 AI 年成本会吃掉企业用工成本的 ${formatPercent(result.aiCostShareOfSalary)}，但产出只多出 ${formatPercent(result.efficiencyGainRatio)}。这意味着他对你的直接替代威胁暂时不大，但如果团队里有人这样使用 Agent，组织也会开始质疑这套高耗低效的投入方式。`
      : `Assume your coworker earns about what you earn and uses the same model, multiplier, and token intensity. Their yearly AI cost would consume ${formatPercent(result.aiCostShareOfSalary)} of employment cost, while output only grows by ${formatPercent(result.efficiencyGainRatio)}. That means the direct replacement threat to you is limited for now, but a team using Agents this way would still raise concerns about wasteful spend.`
  }
  if (result.effectivePeopleEquivalent >= 2) {
    return language === "zh-CN"
      ? `假设你的同事和你薪资差不多，也同样会用 ${result.selectedModel.modelName}，并能把效率放大到 ${result.performanceMultiplier.toFixed(2)} 倍，同时维持这组 Token 强度，那么他就可能把自己放大成过去的 ${result.effectivePeopleEquivalent.toFixed(2)} 个人。对你的危险在于：组织会更愿意保留那个能稳定做出两个人以上产能的人。`
      : `Assume your coworker is paid about the same as you, uses ${result.selectedModel.modelName}, reaches a ${result.performanceMultiplier.toFixed(2)}x multiplier, and sustains this token intensity. They could turn themselves into roughly ${result.effectivePeopleEquivalent.toFixed(2)} old workers. The danger to you is that organizations will prefer the person who can consistently deliver the output of two or more people.`
  }
  if (result.effectivePeopleEquivalent >= 1.5) {
    return language === "zh-CN"
      ? `假设你的同事也拥有和你差不多的薪资，并且同样掌握这套 Agent 用法，那么他就可能达到过去 ${result.effectivePeopleEquivalent.toFixed(2)} 个人的产能。虽然还没到一人顶两人，但他已经有能力在交付速度、响应密度和可承接任务量上逐步拉开和你的差距。`
      : `Assume your coworker has a salary similar to yours and masters the same Agent workflow. They could reach the output of about ${result.effectivePeopleEquivalent.toFixed(2)} old workers. It is not two-for-one yet, but they would already begin to separate from you on speed, task throughput, and delivery density.`
  }
  return language === "zh-CN"
    ? `假设你的同事也拥有和你接近的薪资，并且开始按这组方式使用 Agent，那么他大约会达到过去 ${result.effectivePeopleEquivalent.toFixed(2)} 个人的水平。现在还不至于立刻把你甩开，但只要他持续打磨工作流，优势就会慢慢朝他那边倾斜。`
    : `Assume your coworker has a salary close to yours and starts using Agents with this setup. They would reach about ${result.effectivePeopleEquivalent.toFixed(2)} old workers of output. The gap may not explode immediately, but the advantage will gradually shift toward them if they keep refining the workflow.`
}

function buildVerdictTone(result: CalculationResult): AgentSummaryViewModel["verdictTone"] {
  if (result.isCostInefficient) return "warning"
  if (result.effectivePeopleEquivalent >= 2) return "danger"
  if (result.effectivePeopleEquivalent >= 1.5) return "warning"
  return "safe"
}

function buildAnnualTotalCostExplanation(language: SupportedLanguage): string {
  return language === "zh-CN"
    ? `我们先把你的税前年薪换算成企业真实承担的年度全用工成本。这里会叠加城市档位系数，以及 1 个月左右的附加雇佣成本，所以判断基准不是你的到手收入，而是公司真正为你付出的总预算。`
    : `We first convert your stated salary into the employer's real annual employment cost. This adds a city-tier coefficient plus roughly one extra month of employment overhead, so the benchmark is not your take-home pay but the company's true yearly budget for you.`
}

function buildPerformanceExplanation(language: SupportedLanguage): string {
  return language === "zh-CN"
    ? `这个倍数是你主观判断“用了这个模型后，自己比过去快了多少”。它本身不直接等于淘汰风险，而是用来衡量你把 AI 变成生产力之后，理论上能放大多少产能。`
    : `This multiplier is your own estimate of how much faster you become with the model. It is not replacement risk by itself; it measures how much output you could theoretically amplify once AI becomes part of your workflow.`
}

function buildDailyTokenUsageExplanation(language: SupportedLanguage): string {
  return language === "zh-CN"
    ? `这是你在正常工作日里大概要消耗的 Token 规模。它决定了你每天要为这套 Agent 工作流支付多少成本，也决定了这套流程能否被公司持续负担。`
    : `This is the amount of tokens you expect to consume on a normal workday. It determines the daily cost of your Agent workflow and whether that workflow is economically sustainable for the company.`
}

function buildDailyAiCostExplanation(language: SupportedLanguage): string {
  return language === "zh-CN"
    ? `日均 AI 成本 = 你每天的 Token 需求 × 当前模型的综合单价。它告诉你，想维持这样的 Agent 工作强度，公司每天大概要额外花多少钱。`
    : `Daily AI cost equals your daily token demand multiplied by the blended unit price of the selected model. It shows how much extra money the company would spend each workday to sustain this Agent-assisted intensity.`
}

function buildAnnualAiCostExplanation(language: SupportedLanguage): string {
  return language === "zh-CN"
    ? `年均 AI 成本 = 日均 AI 成本 × 264 个工作日。它表示如果你全年都按这个强度使用 Agent，公司为这套 AI 流程支付的总成本。`
    : `Annual AI cost equals daily AI cost multiplied by 264 workdays. It estimates how much the company would spend over a full year if you used this Agent workflow at the same intensity throughout the year.`
}

function buildAiCostShareExplanation(language: SupportedLanguage): string {
  return language === "zh-CN"
    ? `这个比例表示：维持你的 Agent 工作流，一年大概要吃掉你对应企业用工成本的多少百分比。比例越低，说明“给你配 AI”这件事越容易被公司接受。`
    : `This percentage shows how much of your total employment cost would be consumed by sustaining your Agent workflow for a year. The lower it is, the easier it is for a company to justify funding AI on top of you.`
}

function buildCostEffectivenessExplanation(language: SupportedLanguage): string {
  return language === "zh-CN"
    ? `AI 投入产出比 = 效率增幅 ÷ AI 成本占比。如果这个值小于 1，说明你额外投入的 AI 成本比例，比换回来的效率增幅还大，这通常意味着当前的 Token 消耗强度偏高，或者模型选择过贵。`
    : `AI cost effectiveness = productivity gain divided by AI cost share. If this value is below 1, the extra percentage of AI cost is larger than the percentage of productivity gained, which usually means token usage is too heavy or the chosen model is too expensive.`
}

export function isHighRiskDangerBand(result: Pick<CalculationResult, "effectivePeopleEquivalent">): boolean {
  return result.effectivePeopleEquivalent >= 2
}

function getDangerScaleLabel(result: CalculationResult, language: SupportedLanguage): string {
  if (isHighRiskDangerBand(result)) {
    return language === "zh-CN" ? "高危区" : "High risk"
  }
  if (result.effectivePeopleEquivalent >= 1.5) {
    return language === "zh-CN" ? "拉开差距" : "Gap opening"
  }
  return language === "zh-CN" ? "暂时安全" : "Relatively safe"
}

function getDangerScaleSummary(result: CalculationResult, language: SupportedLanguage): string {
  if (isHighRiskDangerBand(result)) {
    return language === "zh-CN"
      ? `同事一旦把自己稳定放大到 ${result.effectivePeopleEquivalent.toFixed(2)} 人产能，你就已经处在高危位置。`
      : `Once a coworker consistently scales to ${result.effectivePeopleEquivalent.toFixed(2)} workers of output, your position becomes high risk.`
  }
  if (result.effectivePeopleEquivalent >= 1.5) {
    return language === "zh-CN"
      ? `同事已经开始形成明显效率优势，只是还没到彻底碾压。`
      : `Your coworker is already building a visible efficiency advantage, just not a total blowout yet.`
  }
  return language === "zh-CN"
    ? `同事暂时还没有把差距完全拉开，但已经开始积累结构性优势。`
    : `Your coworker has not fully pulled away yet, but is starting to accumulate structural advantage.`
}

function getCostEffectivenessScaleLabel(result: CalculationResult, language: SupportedLanguage): string {
  if (result.costEffectivenessRatio < 1) {
    return language === "zh-CN" ? "偏浪费" : "Wasteful"
  }
  if (result.costEffectivenessRatio < 2) {
    return language === "zh-CN" ? "刚好划算" : "Worth it"
  }
  return language === "zh-CN" ? "很划算" : "High ROI"
}

function getCostEffectivenessScaleSummary(result: CalculationResult, language: SupportedLanguage): string {
  if (result.costEffectivenessRatio < 1) {
    return language === "zh-CN"
      ? `这套 Agent 用法消耗掉的预算，占比已经高于换回来的效率增幅。`
      : `This Agent workflow consumes a larger share of budget than the productivity gain it returns.`
  }
  if (result.costEffectivenessRatio < 2) {
    return language === "zh-CN"
      ? `这套 Agent 用法已经开始值回票价，但还没有形成特别夸张的收益。`
      : `This Agent workflow is paying for itself, but the upside is not dramatic yet.`
  }
  return language === "zh-CN"
    ? `这套 Agent 用法的收益明显跑赢成本，组织更容易接受这样的投入。`
    : `This Agent workflow is clearly outperforming its cost, making the spend easier to justify.`
}

function buildAffordableWorkflowExplanation(language: SupportedLanguage): string {
  return language === "zh-CN"
    ? `可负担工作流份数 = 企业年度全用工成本 ÷ 年均 AI 成本。它表示“公司为你付出的总预算”，理论上可以覆盖多少套同等强度的 Agent 流程。这个值越高，你的效率倍数越容易被真正兑现。`
    : `Affordable workflow count equals total annual employment cost divided by annual AI cost. It tells you how many equally intense Agent workflows could theoretically be funded by the budget currently spent on you. The higher it is, the easier it is to realize your efficiency multiplier in practice.`
}

function buildPeopleEquivalentExplanation(language: SupportedLanguage): string {
  return language === "zh-CN"
    ? `等效人力 = 1 + (效率倍数 - 1) × 可负担比例。也就是说，我们不是直接把“效率提升几倍”照单全收，而是先看公司能不能负担这套 AI 流程，再折算成你 + AI 到底相当于过去几个人。`
    : `People equivalent = 1 + (efficiency multiplier - 1) × affordability ratio. In other words, we do not blindly accept your multiplier at face value; we first ask whether the company can actually afford the AI workflow, then convert that into how many old-style workers you plus AI really equal.`
}

export function buildResultViewModel(
  result: CalculationResult,
  language: SupportedLanguage
): ResultViewModel {
  const cityCoefficient =
    benchmarkData.cityCoefficients.find((item) => item.tier === result.cityTier)?.coefficient ??
    benchmarkData.cityCoefficients[3].coefficient
  const dangerScalePosition = clamp(((result.effectivePeopleEquivalent - 1) / 2) * 100, 0, 100)
  const costEffectivenessScalePosition = Number.isFinite(result.costEffectivenessRatio)
    ? clamp((result.costEffectivenessRatio / 3) * 100, 0, 100)
    : 100

  const summarySection: AgentSummaryViewModel = {
    annualIncomeFormatted: formatCny(result.annualIncomeCny),
    annualTotalCostFormatted: formatCny(result.annualTotalCostCny),
    annualTotalCostFormula: `¥${formatCny(result.annualIncomeCny)} × (1 + ${cityCoefficient.toFixed(1)}) + ¥${formatCny(result.annualIncomeCny / 12)} = ¥${formatCny(result.annualTotalCostCny)}`,
    annualTotalCostExplanation: buildAnnualTotalCostExplanation(language),
    cityLabel: getCityLabel(result.cityTier, language),
    selectedModelName: result.selectedModel.modelName,
    selectedModelDescription: buildCoworkerLead(result, language),
    performanceMultiplierFormatted: formatMultiplier(result.performanceMultiplier),
    performanceMultiplierExplanation: buildPerformanceExplanation(language),
    dailyTokenUsageFormatted: `${result.dailyTokenUsageM.toFixed(2)} M`,
    dailyTokenUsageExplanation: buildDailyTokenUsageExplanation(language),
    annualAiCostFormatted: formatCny(result.annualAiCostCny),
    annualAiCostFormula: `¥${formatCny(result.dailyAiCostCny)} × ${WORKING_DAYS_PER_YEAR} = ¥${formatCny(result.annualAiCostCny)}`,
    annualAiCostExplanation: buildAnnualAiCostExplanation(language),
    dailyAiCostFormatted: formatCny(result.dailyAiCostCny),
    dailyAiCostFormula: `${result.dailyTokenUsageM.toFixed(2)} × ¥${formatPriceNumber(result.mixedCostPer1mTokenCny)} = ¥${formatCny(result.dailyAiCostCny)}`,
    dailyAiCostExplanation: buildDailyAiCostExplanation(language),
    aiCostShareFormatted: formatPercent(result.aiCostShareOfSalary),
    aiCostShareFormula: `¥${formatCny(result.annualAiCostCny)} ÷ ¥${formatCny(result.annualTotalCostCny)} = ${formatPercent(result.aiCostShareOfSalary)}`,
    aiCostShareExplanation: buildAiCostShareExplanation(language),
    costEffectivenessFormatted: formatRatio(result.costEffectivenessRatio),
    costEffectivenessFormula: `${formatPercent(result.efficiencyGainRatio)} ÷ ${formatPercent(result.aiCostShareOfSalary)} = ${formatRatio(result.costEffectivenessRatio)}`,
    costEffectivenessExplanation: buildCostEffectivenessExplanation(language),
    costEffectivenessScalePosition,
    costEffectivenessScaleLabel: getCostEffectivenessScaleLabel(result, language),
    costEffectivenessScaleSummary: getCostEffectivenessScaleSummary(result, language),
    affordableWorkflowCountFormatted: `${result.affordableWorkflowCount.toFixed(2)} 份`,
    affordableWorkflowFormula: `¥${formatCny(result.annualTotalCostCny)} ÷ ¥${formatCny(result.annualAiCostCny)} = ${result.affordableWorkflowCount.toFixed(2)} 份`,
    affordableWorkflowExplanation: buildAffordableWorkflowExplanation(language),
    effectivePeopleEquivalentFormatted: `${result.effectivePeopleEquivalent.toFixed(2)} 人`,
    effectivePeopleEquivalentFormula: `1 + (${result.performanceMultiplier.toFixed(2)} - 1) × min(${result.affordableWorkflowCount.toFixed(2)}, 1) = ${result.effectivePeopleEquivalent.toFixed(2)} 人`,
    effectivePeopleEquivalentExplanation: buildPeopleEquivalentExplanation(language),
    dangerScalePosition,
    dangerScaleLabel: getDangerScaleLabel(result, language),
    dangerScaleSummary: getDangerScaleSummary(result, language),
    verdictHeadline: buildVerdict(result, language),
    verdictBody: buildVerdictBody(result, language),
    verdictTone: buildVerdictTone(result),
  }

  const selectedModel = result.selectedModel
  const ratio = pricingData.inputOutputRatio

  const costSection: ModelCostViewModel = {
    annualTotalCostFormatted: formatCny(result.annualTotalCostCny),
    providerName: selectedModel.providerName,
    modelName: selectedModel.modelName,
    modelDescription: selectedModel.modelDescription,
    pricingContext: selectedModel.pricingContext,
    pricingNote: selectedModel.pricingNote,
    sourceLabel: selectedModel.sourceLabel,
    sourceUrl: selectedModel.sourceUrl,
    sourceNote: selectedModel.sourceNote,
    inputPriceFormatted: formatCurrencyPrice(selectedModel.currency, selectedModel.inputCostPer1mToken),
    outputPriceFormatted: formatCurrencyPrice(selectedModel.currency, selectedModel.outputCostPer1mToken),
    mixedPriceFormatted: `¥${formatPriceNumber(result.mixedCostPer1mTokenCny)} / 1M`,
    mixedPriceFormula:
      selectedModel.currency === "USD"
        ? `((${ratio} × ${formatCurrencyPrice(selectedModel.currency, selectedModel.inputCostPer1mToken)} + ${formatCurrencyPrice(selectedModel.currency, selectedModel.outputCostPer1mToken)}) ÷ ${ratio + 1}) × ${pricingData.exchangeRateUsdToCny} = ¥${formatPriceNumber(result.mixedCostPer1mTokenCny)} / 1M`
        : `(${ratio} × ${formatCurrencyPrice(selectedModel.currency, selectedModel.inputCostPer1mToken)} + ${formatCurrencyPrice(selectedModel.currency, selectedModel.outputCostPer1mToken)}) ÷ ${ratio + 1} = ¥${formatPriceNumber(result.mixedCostPer1mTokenCny)} / 1M`,
    mixedPriceExplanation:
      language === "zh-CN"
        ? `综合单价按输入:输出 = ${ratio}:1 来折算，先求出每 1M 总 Token 的平均成本；如果模型是美元定价，再按汇率 ${pricingData.exchangeRateUsdToCny} 折成人民币。`
        : `The blended price assumes an input:output mix of ${ratio}:1, first averaging the cost per 1M total tokens. If the model is priced in USD, it is then converted to CNY using the ${pricingData.exchangeRateUsdToCny} exchange rate.`,
    dailyTokenUsageFormatted: `${result.dailyTokenUsageM.toFixed(2)} M / day`,
    annualTokenUsageFormatted: formatTokens(result.annualTokenUsage),
    dailyAiCostFormatted: `¥${formatCny(result.dailyAiCostCny)}`,
    annualAiCostFormatted: `¥${formatCny(result.annualAiCostCny)}`,
    dailyAiCostFormula:
      selectedModel.currency === "USD"
        ? `${result.dailyTokenUsageM.toFixed(2)} × (((${ratio} × ${formatCurrencyPrice(selectedModel.currency, selectedModel.inputCostPer1mToken)} + ${formatCurrencyPrice(selectedModel.currency, selectedModel.outputCostPer1mToken)}) ÷ ${ratio + 1}) × ${pricingData.exchangeRateUsdToCny}) = ¥${formatCny(result.dailyAiCostCny)}`
        : `${result.dailyTokenUsageM.toFixed(2)} × ((${ratio} × ${formatCurrencyPrice(selectedModel.currency, selectedModel.inputCostPer1mToken)} + ${formatCurrencyPrice(selectedModel.currency, selectedModel.outputCostPer1mToken)}) ÷ ${ratio + 1}) = ¥${formatCny(result.dailyAiCostCny)}`,
    dailyAiCostExplanation: buildDailyAiCostExplanation(language),
    annualAiCostFormula: `¥${formatCny(result.dailyAiCostCny)} × ${WORKING_DAYS_PER_YEAR} = ¥${formatCny(result.annualAiCostCny)}`,
    annualAiCostExplanation: buildAnnualAiCostExplanation(language),
    fullBudgetTotalTokensFormatted: formatTokens(result.fullBudgetTotalTokens),
    fullBudgetWorkdayTokensFormatted: formatTokens(result.fullBudgetWorkdayTokens),
    workdayAverageFormula: `¥${formatCny(result.annualTotalCostCny)} ÷ ¥${formatPriceNumber(result.mixedCostPer1mTokenCny)} ÷ ${WORKING_DAYS_PER_YEAR} = ${formatTokens(result.fullBudgetWorkdayTokens)}`,
  }

  const tokenCeilings: TokenCeilingDisplay[] = result.tokenCeilings.map((tc: TokenCeiling) => ({
    modelId: tc.modelId,
    providerId: tc.providerId,
    providerName: tc.providerName,
    modelName: tc.modelName,
    modelDescription: tc.modelDescription,
    averageWorkdayTokensFormatted: formatTokens(tc.totalTokens / WORKING_DAYS_PER_YEAR),
    mixInputFormula: `${formatBudgetByCurrency(tc.pricingCurrency, result.annualTotalCostCny)} ÷ (${pricingData.inputOutputRatio} × ${formatCurrencyPrice(tc.pricingCurrency, tc.inputCostPer1mToken)} + ${formatCurrencyPrice(tc.pricingCurrency, tc.outputCostPer1mToken)}) × ${pricingData.inputOutputRatio} = ${formatTokens(tc.inputTokensInMix)}`,
    mixOutputFormula: `${formatBudgetByCurrency(tc.pricingCurrency, result.annualTotalCostCny)} ÷ (${pricingData.inputOutputRatio} × ${formatCurrencyPrice(tc.pricingCurrency, tc.inputCostPer1mToken)} + ${formatCurrencyPrice(tc.pricingCurrency, tc.outputCostPer1mToken)}) = ${formatTokens(tc.outputTokensInMix)}`,
    inputPriceFormatted: formatCurrencyPrice(tc.pricingCurrency, tc.inputCostPer1mToken),
    outputPriceFormatted: formatCurrencyPrice(tc.pricingCurrency, tc.outputCostPer1mToken),
    cacheReadPriceFormatted:
      tc.cacheReadCostPer1mToken !== undefined
        ? formatCurrencyPrice(tc.pricingCurrency, tc.cacheReadCostPer1mToken)
        : undefined,
    cacheWritePriceFormatted:
      tc.cacheWriteCostPer1mToken !== undefined
        ? formatCurrencyPrice(tc.pricingCurrency, tc.cacheWriteCostPer1mToken)
        : undefined,
    pricingContext: tc.pricingContext,
    pricingNote: tc.pricingNote,
    sourceLabel: tc.sourceLabel,
    sourceUrl: tc.sourceUrl,
    inputTokensFormatted: formatTokens(tc.inputTokens),
    outputTokensFormatted: formatTokens(tc.outputTokens),
    totalTokensFormatted: formatTokens(tc.totalTokens),
    inputTokensInMixFormatted: formatTokens(tc.inputTokensInMix),
    outputTokensInMixFormatted: formatTokens(tc.outputTokensInMix),
  }))

  const pricingProviders: PricingProviderDisplay[] = pricingData.providers
    .map((provider) => ({
      providerId: provider.id,
      providerName: provider.name,
      sourceLabel: provider.sourceLabel,
      sourceUrl: provider.sourceUrl,
      sourceNote: provider.sourceNote,
      models: tokenCeilings.filter((item) => item.providerId === provider.id),
    }))
    .filter((provider) => provider.models.length > 0)

  return {
    summarySection,
    costSection,
    tokenListSection: {
      annualTotalCostFormatted: formatCny(result.annualTotalCostCny),
      inputOutputRatio: pricingData.inputOutputRatio,
      workingDaysPerYear: WORKING_DAYS_PER_YEAR,
      pricingProviders,
    },
    dataDisclaimer: {
      pricingUpdatedAt: pricingData.updatedAt,
      pricingSource: pricingData.source,
      pricingReferences: pricingData.providers.map((provider) => ({
        providerId: provider.id,
        providerName: provider.name,
        sourceLabel: provider.sourceLabel,
        sourceUrl: provider.sourceUrl,
        sourceNote: provider.sourceNote,
      })),
    },
  }
}
