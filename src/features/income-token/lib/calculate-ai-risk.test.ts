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
} from "./calculate-ai-risk"

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

describe("calculateMixedCostPer1mTokenCny", () => {
  it("uses CNY prices directly for domestic models", () => {
    const cost = calculateMixedCostPer1mTokenCny("deepseek-v3")
    expect(cost).toBe(3.5)
  })

  it("converts USD-priced models to CNY", () => {
    const cost = calculateMixedCostPer1mTokenCny("claude-sonnet-4-6")
    expect(cost).toBeCloseTo(43.5, 4)
  })
})

describe("calculateAiCost", () => {
  it("calculates daily and annual AI cost from daily token usage", () => {
    const result = calculateAiCost(baseInput)

    expect(result.mixedCostPer1mTokenCny).toBe(3.5)
    expect(result.dailyAiCostCny).toBe(35)
    expect(result.annualAiCostCny).toBe(35 * WORKING_DAYS_PER_YEAR)
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

    expect(result.fullBudgetTotalTokens).toBe(127_142_857_142)
    expect(result.fullBudgetWorkdayTokens).toBe(Math.floor(127_142_857_142 / WORKING_DAYS_PER_YEAR))
  })
})

describe("calculateTokenCeilings", () => {
  it("keeps the original detailed token list for all configured models", () => {
    const ceilings = calculateTokenCeilings(445000)
    expect(ceilings).toHaveLength(14)
    expect(ceilings.some((item) => item.modelId === "deepseek-v3")).toBe(true)
    expect(ceilings.some((item) => item.modelId === "claude-sonnet-4-6")).toBe(true)
  })
})

describe("evaluate", () => {
  it("returns a complete agent-era result payload", () => {
    const result = evaluate(baseInput)

    expect(result.selectedModel.modelId).toBe("deepseek-v3")
    expect(result.annualTotalCostCny).toBe(445000)
    expect(result.annualTokenUsage).toBe(10 * 1_000_000 * WORKING_DAYS_PER_YEAR)
    expect(result.dailyAiCostCny).toBe(35)
    expect(result.efficiencyGainRatio).toBe(1.5)
    expect(result.aiCostShareOfSalary).toBeCloseTo((35 * WORKING_DAYS_PER_YEAR) / 445000, 6)
    expect(result.costEffectivenessRatio).toBeGreaterThan(1)
    expect(result.isCostInefficient).toBe(false)
    expect(result.affordableWorkflowCount).toBeCloseTo(445000 / (35 * WORKING_DAYS_PER_YEAR), 6)
    expect(result.effectivePeopleEquivalent).toBe(2.5)
    expect(result.fullBudgetTotalTokens).toBeGreaterThan(0)
    expect(result.fullBudgetWorkdayTokens).toBeGreaterThan(0)
    expect(result.tokenCeilings).toHaveLength(14)
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
