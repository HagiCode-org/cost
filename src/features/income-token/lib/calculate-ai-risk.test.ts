import { describe, expect, it } from "vitest"

import {
  WORKING_DAYS_PER_YEAR,
  calculateAnnualTotalCost,
  calculateAiCost,
  calculateEffectivePeopleEquivalent,
  calculateFullBudgetTokenCapacity,
  calculateMixedCostPer1mTokenCny,
  calculateTokenCeilings,
  evaluate,
  normalizeAnnualIncomeCny,
} from "./calculate-ai-risk"
import { pricingData, resolveCanonicalModelId } from "../content/pricing-data"

const baseInput = {
  annualIncomeCny: 300000,
  cityTier: "tier1" as const,
  modelId: "deepseek-v3",
  performanceMultiplier: 2.5,
  dailyTokenUsageM: 10,
}

describe("calculateAnnualTotalCost", () => {
  it("converts salary to full employment cost with city coefficient", () => {
    expect(calculateAnnualTotalCost(baseInput)).toBe(445000)
  })
})

describe("normalizeAnnualIncomeCny", () => {
  it("keeps CNY salary input on the CNY baseline", () => {
    expect(normalizeAnnualIncomeCny({ annualIncomeInput: 30, salaryCurrency: "CNY" })).toBe(300000)
  })

  it("converts USD salary input to the shared CNY baseline", () => {
    expect(normalizeAnnualIncomeCny({ annualIncomeInput: 40, salaryCurrency: "USD" })).toBe(290000)
  })
})

describe("calculateMixedCostPer1mTokenCny", () => {
  it("resolves legacy DeepSeek IDs to canonical models before calculating", () => {
    const cost = calculateMixedCostPer1mTokenCny("deepseek-v3")
    expect(resolveCanonicalModelId("deepseek-v3")).toBe("deepseek-v4-flash")
    expect(cost).toBeCloseTo(2.28375, 5)
  })

  it("converts USD-priced models to CNY", () => {
    const cost = calculateMixedCostPer1mTokenCny("claude-sonnet-4-6")
    expect(cost).toBeCloseTo(43.5, 4)
  })
})

describe("calculateAiCost", () => {
  it("calculates daily and annual AI cost from daily token usage", () => {
    const result = calculateAiCost(baseInput)

    expect(result.mixedCostPer1mTokenCny).toBeCloseTo(2.28375, 5)
    expect(result.dailyAiCostCny).toBeCloseTo(22.8375, 5)
    expect(result.annualAiCostCny).toBeCloseTo(22.8375 * WORKING_DAYS_PER_YEAR, 5)
  })
})

describe("calculateEffectivePeopleEquivalent", () => {
  it("realizes the full multiplier when salary fully covers the workflow", () => {
    const people = calculateEffectivePeopleEquivalent(baseInput)
    expect(people).toBe(2.5)
  })

  it("caps realization when AI usage is more expensive than salary", () => {
    const people = calculateEffectivePeopleEquivalent({
      ...baseInput,
      annualIncomeCny: 1000,
      dailyTokenUsageM: 20,
    })

    expect(people).toBeGreaterThan(1)
    expect(people).toBeLessThan(2.5)
  })
})

describe("calculateFullBudgetTokenCapacity", () => {
  it("returns annual and workday token budget capacity", () => {
    const result = calculateFullBudgetTokenCapacity(445000, "deepseek-v3")

    expect(result.fullBudgetTotalTokens).toBe(194_854_953_475)
    expect(result.fullBudgetWorkdayTokens).toBe(Math.floor(194_854_953_475 / WORKING_DAYS_PER_YEAR))
  })
})

describe("calculateTokenCeilings", () => {
  it("keeps the original detailed token list for all configured models", () => {
    const ceilings = calculateTokenCeilings(445000)
    expect(ceilings).toHaveLength(pricingData.models.length)
    expect(ceilings.some((item) => item.modelId === "deepseek-v4-flash")).toBe(true)
    expect(ceilings.some((item) => item.modelId === "claude-sonnet-4-6")).toBe(true)
    expect(ceilings.some((item) => item.sourceLabel === "models.dev API")).toBe(true)
  })
})

describe("evaluate", () => {
  it("returns a complete agent-era result payload", () => {
    const result = evaluate(baseInput)

    expect(result.selectedModel.modelId).toBe("deepseek-v4-flash")
    expect(result.selectedModel.sourceLabel).toBe("models.dev API")
    expect(result.selectedModel.sourceSyncedAt).toBe("2026-02-28")
    expect(result.annualTotalCostCny).toBe(445000)
    expect(result.annualTokenUsage).toBe(10 * 1_000_000 * WORKING_DAYS_PER_YEAR)
    expect(result.dailyAiCostCny).toBeCloseTo(22.8375, 5)
    expect(result.efficiencyGainRatio).toBe(1.5)
    expect(result.aiCostShareOfSalary).toBeCloseTo((22.8375 * WORKING_DAYS_PER_YEAR) / 445000, 6)
    expect(result.costEffectivenessRatio).toBeGreaterThan(1)
    expect(result.isCostInefficient).toBe(false)
    expect(result.affordableWorkflowCount).toBeCloseTo(445000 / (22.8375 * WORKING_DAYS_PER_YEAR), 6)
    expect(result.effectivePeopleEquivalent).toBe(2.5)
    expect(result.fullBudgetTotalTokens).toBeGreaterThan(0)
    expect(result.fullBudgetWorkdayTokens).toBeGreaterThan(0)
    expect(result.tokenCeilings).toHaveLength(pricingData.models.length)
  })

  it("flags wasteful usage when AI cost share exceeds efficiency gain", () => {
    const result = evaluate({
      ...baseInput,
      annualIncomeCny: 120000,
      performanceMultiplier: 1.2,
      dailyTokenUsageM: 120,
      modelId: "claude-sonnet-4-6",
    })

    expect(result.efficiencyGainRatio).toBeCloseTo(0.2, 6)
    expect(result.aiCostShareOfSalary).toBeGreaterThan(0.2)
    expect(result.costEffectivenessRatio).toBeLessThan(1)
    expect(result.isCostInefficient).toBe(true)
  })
})
