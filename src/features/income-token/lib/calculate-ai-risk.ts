import { benchmarkData } from "../content/benchmark-data"
import type { CityTier } from "../content/benchmark-data"
import { pricingData } from "../content/pricing-data"
import type { SalaryCurrency } from "./currency"
import { normalizeIncomeInputToAnnualCny } from "./currency"

export const WORKING_DAYS_PER_YEAR = 22 * 12

export interface EvaluationInput {
  annualIncomeCny: number
  cityTier: CityTier
  modelId: string
  performanceMultiplier: number
  dailyTokenUsageM: number
}

export interface SalaryCurrencyInput {
  annualIncomeInput: number
  salaryCurrency: SalaryCurrency
}

export interface SelectedModelMeta {
  modelId: string
  providerId: string
  providerName: string
  modelName: string
  modelDescription: string
  currency: "USD" | "CNY"
  inputCostPer1mToken: number
  outputCostPer1mToken: number
  cacheReadCostPer1mToken?: number
  cacheWriteCostPer1mToken?: number
  pricingContext?: string
  pricingNote?: string
  sourceLabel: string
  sourceUrl: string
  sourceNote: string
}

export interface CalculationResult {
  annualIncomeCny: number
  annualTotalCostCny: number
  cityTier: CityTier
  performanceMultiplier: number
  efficiencyGainRatio: number
  dailyTokenUsageM: number
  annualTokenUsage: number
  dailyAiCostCny: number
  annualAiCostCny: number
  aiCostShareOfSalary: number
  costEffectivenessRatio: number
  isCostInefficient: boolean
  affordableWorkflowCount: number
  effectivePeopleEquivalent: number
  fullBudgetTotalTokens: number
  fullBudgetWorkdayTokens: number
  mixedCostPer1mTokenCny: number
  selectedModel: SelectedModelMeta
  tokenCeilings: TokenCeiling[]
}

export interface TokenCeiling {
  modelId: string
  providerId: string
  providerName: string
  modelName: string
  modelDescription: string
  pricingCurrency: "USD" | "CNY"
  inputCostPer1mToken: number
  outputCostPer1mToken: number
  cacheReadCostPer1mToken?: number
  cacheWriteCostPer1mToken?: number
  pricingContext?: string
  pricingNote?: string
  sourceLabel: string
  sourceUrl: string
  sourceNote: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  inputTokensInMix: number
  outputTokensInMix: number
}

function getSelectedModel(modelId: string): SelectedModelMeta {
  const model = pricingData.models.find((item) => item.id === modelId) ?? pricingData.models[0]
  const provider = pricingData.providers.find((item) => item.id === model.providerId)

  return {
    modelId: model.id,
    providerId: model.providerId,
    providerName: provider?.name ?? model.providerId,
    modelName: model.name,
    modelDescription: model.description,
    currency: model.currency,
    inputCostPer1mToken: model.inputCostPer1mToken,
    outputCostPer1mToken: model.outputCostPer1mToken,
    cacheReadCostPer1mToken: model.cacheReadCostPer1mToken,
    cacheWriteCostPer1mToken: model.cacheWriteCostPer1mToken,
    pricingContext: model.pricingContext,
    pricingNote: model.pricingNote,
    sourceLabel: provider?.sourceLabel ?? pricingData.source,
    sourceUrl: provider?.sourceUrl ?? "",
    sourceNote: provider?.sourceNote ?? pricingData.source,
  }
}

function getCityCoefficient(cityTier: CityTier): number {
  const city = benchmarkData.cityCoefficients.find((item) => item.tier === cityTier)
  return city?.coefficient ?? benchmarkData.cityCoefficients[3].coefficient
}

export function calculateAnnualTotalCost(input: Pick<EvaluationInput, "annualIncomeCny" | "cityTier">): number {
  const coefficient = getCityCoefficient(input.cityTier)
  return input.annualIncomeCny * (1 + coefficient) + input.annualIncomeCny / 12
}

export function normalizeAnnualIncomeCny(input: SalaryCurrencyInput) {
  return normalizeIncomeInputToAnnualCny(input.annualIncomeInput, input.salaryCurrency)
}

export function calculateMixedCostPer1mTokenCny(modelId: string): number {
  const model = getSelectedModel(modelId)
  const ratio = pricingData.inputOutputRatio
  const mixedCost =
    (ratio * model.inputCostPer1mToken + model.outputCostPer1mToken) / (ratio + 1)

  return model.currency === "USD"
    ? mixedCost * pricingData.exchangeRateUsdToCny
    : mixedCost
}

export function calculateAiCost(input: EvaluationInput) {
  const mixedCostPer1mTokenCny = calculateMixedCostPer1mTokenCny(input.modelId)
  const dailyAiCostCny = input.dailyTokenUsageM * mixedCostPer1mTokenCny
  const annualAiCostCny = dailyAiCostCny * WORKING_DAYS_PER_YEAR

  return {
    mixedCostPer1mTokenCny,
    dailyAiCostCny,
    annualAiCostCny,
  }
}

export function calculateEffectivePeopleEquivalent(input: EvaluationInput): number {
  const { annualAiCostCny } = calculateAiCost(input)
  if (annualAiCostCny <= 0) return 1

  const annualTotalCostCny = calculateAnnualTotalCost(input)
  const affordableWorkflowCount = annualTotalCostCny / annualAiCostCny
  const budgetRealizationRatio = Math.max(0, Math.min(affordableWorkflowCount, 1))

  return 1 + (input.performanceMultiplier - 1) * budgetRealizationRatio
}

export function calculateFullBudgetTokenCapacity(annualBudgetCny: number, modelId: string) {
  const mixedCostPer1mTokenCny = calculateMixedCostPer1mTokenCny(modelId)
  const fullBudgetTotalTokens = Math.floor((annualBudgetCny / mixedCostPer1mTokenCny) * 1_000_000)

  return {
    fullBudgetTotalTokens,
    fullBudgetWorkdayTokens: Math.floor(fullBudgetTotalTokens / WORKING_DAYS_PER_YEAR),
  }
}

export function calculateTokenCeilings(annualBudgetCny: number): TokenCeiling[] {
  const ratio = pricingData.inputOutputRatio

  return pricingData.models.map((model) => {
    const provider = pricingData.providers.find((item) => item.id === model.providerId)
    const budget =
      model.currency === "USD"
        ? annualBudgetCny / pricingData.exchangeRateUsdToCny
        : annualBudgetCny

    const inputTokens = Math.floor((budget / model.inputCostPer1mToken) * 1_000_000)
    const outputTokens = Math.floor((budget / model.outputCostPer1mToken) * 1_000_000)
    const outputMillionTokens = budget / (ratio * model.inputCostPer1mToken + model.outputCostPer1mToken)
    const inputMillionTokens = outputMillionTokens * ratio
    const inputTokensInMix = Math.floor(inputMillionTokens * 1_000_000)
    const outputTokensInMix = Math.floor(outputMillionTokens * 1_000_000)

    return {
      modelId: model.id,
      providerId: model.providerId,
      providerName: provider?.name ?? model.providerId,
      modelName: model.name,
      modelDescription: model.description,
      pricingCurrency: model.currency,
      inputCostPer1mToken: model.inputCostPer1mToken,
      outputCostPer1mToken: model.outputCostPer1mToken,
      cacheReadCostPer1mToken: model.cacheReadCostPer1mToken,
      cacheWriteCostPer1mToken: model.cacheWriteCostPer1mToken,
      pricingContext: model.pricingContext,
      pricingNote: model.pricingNote,
      sourceLabel: provider?.sourceLabel ?? pricingData.source,
      sourceUrl: provider?.sourceUrl ?? "",
      sourceNote: provider?.sourceNote ?? pricingData.source,
      inputTokens,
      outputTokens,
      totalTokens: inputTokensInMix + outputTokensInMix,
      inputTokensInMix,
      outputTokensInMix,
    }
  })
}

export function evaluate(input: EvaluationInput): CalculationResult {
  const annualTotalCostCny = calculateAnnualTotalCost(input)
  const selectedModel = getSelectedModel(input.modelId)
  const annualTokenUsage = Math.floor(input.dailyTokenUsageM * 1_000_000 * WORKING_DAYS_PER_YEAR)
  const { mixedCostPer1mTokenCny, dailyAiCostCny, annualAiCostCny } = calculateAiCost(input)
  const efficiencyGainRatio = Math.max(0, input.performanceMultiplier - 1)
  const aiCostShareOfSalary = annualTotalCostCny > 0 ? annualAiCostCny / annualTotalCostCny : 0
  const costEffectivenessRatio =
    aiCostShareOfSalary > 0
      ? efficiencyGainRatio / aiCostShareOfSalary
      : efficiencyGainRatio > 0
        ? Number.POSITIVE_INFINITY
        : 0
  const affordableWorkflowCount =
    annualAiCostCny > 0 ? annualTotalCostCny / annualAiCostCny : 0
  const effectivePeopleEquivalent = calculateEffectivePeopleEquivalent(input)
  const { fullBudgetTotalTokens, fullBudgetWorkdayTokens } = calculateFullBudgetTokenCapacity(
    annualTotalCostCny,
    input.modelId
  )
  const tokenCeilings = calculateTokenCeilings(annualTotalCostCny)

  return {
    annualIncomeCny: input.annualIncomeCny,
    annualTotalCostCny,
    cityTier: input.cityTier,
    performanceMultiplier: input.performanceMultiplier,
    efficiencyGainRatio,
    dailyTokenUsageM: input.dailyTokenUsageM,
    annualTokenUsage,
    dailyAiCostCny,
    annualAiCostCny,
    aiCostShareOfSalary,
    costEffectivenessRatio,
    isCostInefficient: annualAiCostCny > 0 && costEffectivenessRatio < 1,
    affordableWorkflowCount,
    effectivePeopleEquivalent,
    fullBudgetTotalTokens,
    fullBudgetWorkdayTokens,
    mixedCostPer1mTokenCny,
    selectedModel,
    tokenCeilings,
  }
}
