import type { CityTier } from "../content/benchmark-data"
import type { CalculationResult } from "./calculate-ai-risk"

export const specialTitleIds = [
  "craftsman-spirit",
  "prompt-alchemist",
  "all-in-operator",
  "minimalist-runner",
  "cost-tamer",
  "danger-oracle",
  "budget-coordinator",
] as const

export const specialTitleTranslationKeys = [
  "craftsmanSpirit",
  "promptAlchemist",
  "allInOperator",
  "minimalistRunner",
  "costTamer",
  "dangerOracle",
  "budgetCoordinator",
] as const

export type SpecialTitleId = (typeof specialTitleIds)[number]
export type SpecialTitleTranslationKey = (typeof specialTitleTranslationKeys)[number]
export type SpecialTitleOrigin = "input" | "output"
export type SpecialTitleState = "newly-earned" | "earned" | "locked"

export interface SpecialTitleInput {
  annualIncomeCny: number | null
  cityTier: CityTier | null
  modelId: string | null
  performanceMultiplier: number | null
  dailyTokenUsageM: number | null
}

export interface SpecialTitleRuleContext {
  rawInput: SpecialTitleInput
  calculationResult: CalculationResult | null
}

export interface SpecialTitleDefinition {
  id: SpecialTitleId
  translationKey: SpecialTitleTranslationKey
  source: SpecialTitleOrigin
  matches: (context: SpecialTitleRuleContext) => boolean
}

export interface SpecialTitleViewModel {
  id: SpecialTitleId
  translationKey: SpecialTitleTranslationKey
  source: SpecialTitleOrigin
  state: SpecialTitleState
  isMatched: boolean
  isNewlyEarned: boolean
}

export interface EvaluatedSpecialTitles {
  titles: SpecialTitleViewModel[]
  matchedTitleIds: SpecialTitleId[]
  newlyEarnedTitleIds: SpecialTitleId[]
  earnedTitleIds: SpecialTitleId[]
  lockedTitleIds: SpecialTitleId[]
  matchedTitles: SpecialTitleViewModel[]
  newlyEarnedTitles: SpecialTitleViewModel[]
  earnedTitles: SpecialTitleViewModel[]
  lockedTitles: SpecialTitleViewModel[]
}
