import { isHighRiskDangerBand } from "./build-result-view-model"
import type { SpecialTitleDefinition, SpecialTitleInput, SpecialTitleRuleContext } from "./title-types"

function hasPositiveNumber(value: number | null) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
}

function hasMinimumNumber(value: number | null, min: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= min
}

function hasRequiredBaseInput(rawInput: SpecialTitleInput) {
  return (
    hasPositiveNumber(rawInput.annualIncomeCny) &&
    typeof rawInput.cityTier === "string" &&
    rawInput.cityTier.length > 0 &&
    typeof rawInput.modelId === "string" &&
    rawInput.modelId.length > 0 &&
    hasMinimumNumber(rawInput.performanceMultiplier, 1)
  )
}

function hasValidPositiveTokenInput(rawInput: SpecialTitleInput) {
  return hasRequiredBaseInput(rawInput) && hasPositiveNumber(rawInput.dailyTokenUsageM)
}

function hasExactZeroTokenInput(rawInput: SpecialTitleInput) {
  return hasRequiredBaseInput(rawInput) && rawInput.dailyTokenUsageM === 0
}

function matchesPromptAlchemist({ rawInput }: SpecialTitleRuleContext) {
  return (
    hasValidPositiveTokenInput(rawInput) &&
    (rawInput.performanceMultiplier ?? 0) >= 6 &&
    (rawInput.dailyTokenUsageM ?? 0) <= 20
  )
}

function matchesAllInOperator({ rawInput }: SpecialTitleRuleContext) {
  return (
    hasValidPositiveTokenInput(rawInput) &&
    (rawInput.dailyTokenUsageM ?? 0) >= 150 &&
    (rawInput.performanceMultiplier ?? 0) >= 3
  )
}

function matchesMinimalistRunner({ rawInput }: SpecialTitleRuleContext) {
  return (
    hasValidPositiveTokenInput(rawInput) &&
    (rawInput.dailyTokenUsageM ?? 0) <= 5 &&
    (rawInput.performanceMultiplier ?? 0) >= 2
  )
}

export const specialTitleCatalog: SpecialTitleDefinition[] = [
  {
    id: "craftsman-spirit",
    translationKey: "craftsmanSpirit",
    source: "input",
    matches: ({ rawInput }) => hasExactZeroTokenInput(rawInput),
  },
  {
    id: "prompt-alchemist",
    translationKey: "promptAlchemist",
    source: "input",
    matches: matchesPromptAlchemist,
  },
  {
    id: "all-in-operator",
    translationKey: "allInOperator",
    source: "input",
    matches: matchesAllInOperator,
  },
  {
    id: "minimalist-runner",
    translationKey: "minimalistRunner",
    source: "input",
    matches: matchesMinimalistRunner,
  },
  {
    id: "cost-tamer",
    translationKey: "costTamer",
    source: "output",
    matches: ({ calculationResult }) =>
      calculationResult !== null &&
      calculationResult.costEffectivenessRatio >= 2.5 &&
      calculationResult.aiCostShareOfSalary <= 0.15,
  },
  {
    id: "danger-oracle",
    translationKey: "dangerOracle",
    source: "output",
    matches: ({ calculationResult }) =>
      calculationResult !== null &&
      (calculationResult.effectivePeopleEquivalent >= 2.5 || isHighRiskDangerBand(calculationResult)),
  },
  {
    id: "budget-coordinator",
    translationKey: "budgetCoordinator",
    source: "output",
    matches: ({ calculationResult }) =>
      calculationResult !== null && calculationResult.affordableWorkflowCount >= 8,
  },
]
