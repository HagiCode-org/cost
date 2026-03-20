import { describe, expect, it } from "vitest"

import { evaluate } from "./calculate-ai-risk"
import { evaluateSpecialTitles } from "./evaluate-special-titles"
import type { CalculationResult, EvaluationInput } from "./calculate-ai-risk"
import type { SpecialTitleInput } from "./title-types"

const baseEvaluationInput: EvaluationInput = {
  annualIncomeCny: 260000,
  cityTier: "tier1",
  modelId: "gpt-5",
  performanceMultiplier: 5,
  dailyTokenUsageM: 100,
}

function buildRawInput(overrides: Partial<SpecialTitleInput> = {}): SpecialTitleInput {
  return {
    annualIncomeCny: baseEvaluationInput.annualIncomeCny,
    cityTier: baseEvaluationInput.cityTier,
    modelId: baseEvaluationInput.modelId,
    performanceMultiplier: baseEvaluationInput.performanceMultiplier,
    dailyTokenUsageM: baseEvaluationInput.dailyTokenUsageM,
    ...overrides,
  }
}

function buildCalculationResult(overrides: Partial<CalculationResult> = {}): CalculationResult {
  return {
    ...evaluate(baseEvaluationInput),
    ...overrides,
  }
}

describe("evaluateSpecialTitles", () => {
  it("classifies matched titles into newly earned, earned, and locked states", () => {
    const evaluation = evaluateSpecialTitles({
      rawInput: buildRawInput({ performanceMultiplier: 6, dailyTokenUsageM: 5 }),
      calculationResult: null,
      earnedTitleIds: [],
    })

    expect(evaluation.matchedTitleIds).toEqual(["prompt-alchemist", "minimalist-runner"])
    expect(evaluation.newlyEarnedTitleIds).toEqual(["prompt-alchemist", "minimalist-runner"])
    expect(evaluation.earnedTitleIds).toEqual([])
    expect(evaluation.lockedTitleIds).toContain("craftsman-spirit")
    expect(evaluation.titles.find((title) => title.id === "prompt-alchemist")?.state).toBe("newly-earned")
    expect(evaluation.titles.find((title) => title.id === "minimalist-runner")?.state).toBe("newly-earned")
  })

  it("keeps previously earned titles out of the newly-earned bucket on repeat matches", () => {
    const evaluation = evaluateSpecialTitles({
      rawInput: buildRawInput({ performanceMultiplier: 6, dailyTokenUsageM: 20 }),
      calculationResult: null,
      earnedTitleIds: ["prompt-alchemist"],
    })

    expect(evaluation.matchedTitleIds).toEqual(["prompt-alchemist"])
    expect(evaluation.newlyEarnedTitleIds).toEqual([])
    expect(evaluation.earnedTitleIds).toEqual(["prompt-alchemist"])
    expect(evaluation.titles.find((title) => title.id === "prompt-alchemist")?.state).toBe("earned")
  })

  it("can preserve current-session newly-earned feedback while storage is already updated", () => {
    const evaluation = evaluateSpecialTitles({
      rawInput: buildRawInput({ performanceMultiplier: 6, dailyTokenUsageM: 20 }),
      calculationResult: null,
      earnedTitleIds: ["prompt-alchemist"],
      newlyEarnedTitleIds: ["prompt-alchemist"],
    })

    expect(evaluation.newlyEarnedTitleIds).toEqual(["prompt-alchemist"])
    expect(evaluation.titles.find((title) => title.id === "prompt-alchemist")?.state).toBe("newly-earned")
  })

  it("matches craftsman-spirit only for valid zero-token input", () => {
    const matched = evaluateSpecialTitles({
      rawInput: buildRawInput({ dailyTokenUsageM: 0 }),
      calculationResult: null,
      earnedTitleIds: [],
    })
    const blocked = evaluateSpecialTitles({
      rawInput: buildRawInput({ dailyTokenUsageM: 0, performanceMultiplier: null }),
      calculationResult: null,
      earnedTitleIds: [],
    })

    expect(matched.matchedTitleIds).toContain("craftsman-spirit")
    expect(blocked.matchedTitleIds).not.toContain("craftsman-spirit")
  })

  it("matches prompt-alchemist only at the exact efficiency and token boundaries", () => {
    const atLowerBound = evaluateSpecialTitles({
      rawInput: buildRawInput({ performanceMultiplier: 6, dailyTokenUsageM: 20 }),
      calculationResult: null,
      earnedTitleIds: [],
    })
    const belowMultiplier = evaluateSpecialTitles({
      rawInput: buildRawInput({ performanceMultiplier: 5.9, dailyTokenUsageM: 20 }),
      calculationResult: null,
      earnedTitleIds: [],
    })
    const aboveTokenCap = evaluateSpecialTitles({
      rawInput: buildRawInput({ performanceMultiplier: 6, dailyTokenUsageM: 20.1 }),
      calculationResult: null,
      earnedTitleIds: [],
    })

    expect(atLowerBound.matchedTitleIds).toContain("prompt-alchemist")
    expect(belowMultiplier.matchedTitleIds).not.toContain("prompt-alchemist")
    expect(aboveTokenCap.matchedTitleIds).not.toContain("prompt-alchemist")
  })

  it("matches all-in-operator only at the exact spend and multiplier boundaries", () => {
    const atLowerBound = evaluateSpecialTitles({
      rawInput: buildRawInput({ performanceMultiplier: 3, dailyTokenUsageM: 150 }),
      calculationResult: null,
      earnedTitleIds: [],
    })
    const belowTokenFloor = evaluateSpecialTitles({
      rawInput: buildRawInput({ performanceMultiplier: 3, dailyTokenUsageM: 149.9 }),
      calculationResult: null,
      earnedTitleIds: [],
    })
    const belowMultiplier = evaluateSpecialTitles({
      rawInput: buildRawInput({ performanceMultiplier: 2.9, dailyTokenUsageM: 150 }),
      calculationResult: null,
      earnedTitleIds: [],
    })

    expect(atLowerBound.matchedTitleIds).toContain("all-in-operator")
    expect(belowTokenFloor.matchedTitleIds).not.toContain("all-in-operator")
    expect(belowMultiplier.matchedTitleIds).not.toContain("all-in-operator")
  })

  it("matches minimalist-runner only at the exact small-budget and multiplier boundaries", () => {
    const atUpperBound = evaluateSpecialTitles({
      rawInput: buildRawInput({ performanceMultiplier: 2, dailyTokenUsageM: 5 }),
      calculationResult: null,
      earnedTitleIds: [],
    })
    const aboveTokenCap = evaluateSpecialTitles({
      rawInput: buildRawInput({ performanceMultiplier: 2, dailyTokenUsageM: 5.1 }),
      calculationResult: null,
      earnedTitleIds: [],
    })
    const belowMultiplier = evaluateSpecialTitles({
      rawInput: buildRawInput({ performanceMultiplier: 1.9, dailyTokenUsageM: 5 }),
      calculationResult: null,
      earnedTitleIds: [],
    })

    expect(atUpperBound.matchedTitleIds).toContain("minimalist-runner")
    expect(aboveTokenCap.matchedTitleIds).not.toContain("minimalist-runner")
    expect(belowMultiplier.matchedTitleIds).not.toContain("minimalist-runner")
  })

  it("matches cost-tamer only when both ROI thresholds are satisfied", () => {
    const matched = evaluateSpecialTitles({
      rawInput: buildRawInput(),
      calculationResult: buildCalculationResult({ costEffectivenessRatio: 2.5, aiCostShareOfSalary: 0.15 }),
      earnedTitleIds: [],
    })
    const lowRoi = evaluateSpecialTitles({
      rawInput: buildRawInput(),
      calculationResult: buildCalculationResult({ costEffectivenessRatio: 2.49, aiCostShareOfSalary: 0.15 }),
      earnedTitleIds: [],
    })
    const highCostShare = evaluateSpecialTitles({
      rawInput: buildRawInput(),
      calculationResult: buildCalculationResult({ costEffectivenessRatio: 2.5, aiCostShareOfSalary: 0.151 }),
      earnedTitleIds: [],
    })

    expect(matched.matchedTitleIds).toContain("cost-tamer")
    expect(lowRoi.matchedTitleIds).not.toContain("cost-tamer")
    expect(highCostShare.matchedTitleIds).not.toContain("cost-tamer")
  })

  it("matches danger-oracle for both the 2.5 people threshold and the high-risk band", () => {
    const peopleThreshold = evaluateSpecialTitles({
      rawInput: buildRawInput(),
      calculationResult: buildCalculationResult({ effectivePeopleEquivalent: 2.5 }),
      earnedTitleIds: [],
    })
    const highRiskBand = evaluateSpecialTitles({
      rawInput: buildRawInput(),
      calculationResult: buildCalculationResult({ effectivePeopleEquivalent: 2 }),
      earnedTitleIds: [],
    })
    const safeBand = evaluateSpecialTitles({
      rawInput: buildRawInput(),
      calculationResult: buildCalculationResult({ effectivePeopleEquivalent: 1.99 }),
      earnedTitleIds: [],
    })

    expect(peopleThreshold.matchedTitleIds).toContain("danger-oracle")
    expect(highRiskBand.matchedTitleIds).toContain("danger-oracle")
    expect(safeBand.matchedTitleIds).not.toContain("danger-oracle")
  })

  it("matches budget-coordinator only at the workflow-count threshold", () => {
    const matched = evaluateSpecialTitles({
      rawInput: buildRawInput(),
      calculationResult: buildCalculationResult({ affordableWorkflowCount: 8 }),
      earnedTitleIds: [],
    })
    const missed = evaluateSpecialTitles({
      rawInput: buildRawInput(),
      calculationResult: buildCalculationResult({ affordableWorkflowCount: 7.99 }),
      earnedTitleIds: [],
    })

    expect(matched.matchedTitleIds).toContain("budget-coordinator")
    expect(missed.matchedTitleIds).not.toContain("budget-coordinator")
  })
})
