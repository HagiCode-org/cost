import { describe, expect, it } from "vitest"

import { getIncomeOptions } from "../content/form-options"
import { SITE_POSTHOG_EVENTS } from "@/lib/posthog-events"
import {
  buildAssessmentCompletedProperties,
  resolveIncomePresetKey,
  resolveVerdictTone,
} from "./analytics-properties"

const PRESET_KEYS = ["starter", "growth", "senior", "staff", "principal"]

describe("resolveIncomePresetKey", () => {
  it.each(["CNY", "USD"] as const)("maps every %s preset value to its tier key", (currency) => {
    const options = getIncomeOptions(currency)
    expect(options.map((option) => option.id)).toEqual(PRESET_KEYS)
    for (const option of options) {
      expect(resolveIncomePresetKey(currency, option.value)).toBe(option.id)
    }
  })

  it.each(["CNY", "USD"] as const)("maps custom income to the literal custom for %s at several magnitudes", (currency) => {
    for (const amount of ["1", "45", "1234567", "250000000"]) {
      expect(resolveIncomePresetKey(currency, amount)).toBe("custom")
    }
    expect(resolveIncomePresetKey(currency, "custom")).toBe("custom")
  })

  it("scopes preset values to the currency they belong to", () => {
    // "13" is a CNY preset and "18" a USD preset; each is a custom amount in the other currency.
    expect(resolveIncomePresetKey("USD", "13")).toBe("custom")
    expect(resolveIncomePresetKey("CNY", "18")).toBe("custom")
  })
})

describe("resolveVerdictTone", () => {
  it.each(["safe", "warning", "danger"])("accepts %s", (tone) => {
    expect(resolveVerdictTone(tone)).toBe(tone)
  })

  it.each(["neutral", "", "DANGER", "<script>", "250000"])("returns null for unexpected tone %j", (tone) => {
    expect(resolveVerdictTone(tone)).toBeNull()
  })
})

describe("buildAssessmentCompletedProperties", () => {
  it("builds the three enumerated properties", () => {
    expect(
      buildAssessmentCompletedProperties({ currency: "CNY", incomePreset: "26", verdictTone: "warning" }),
    ).toEqual({ currency: "CNY", income_preset: "growth", verdict_tone: "warning" })
  })

  it("drops the event (returns null) for an unknown tone", () => {
    expect(
      buildAssessmentCompletedProperties({ currency: "USD", incomePreset: "custom", verdictTone: "neutral" }),
    ).toBeNull()
  })

  it("only ever produces values that the event table allows", () => {
    const table = SITE_POSTHOG_EVENTS.assessment_completed as Record<string, { values?: readonly string[] }>
    const allowed = Object.fromEntries(Object.entries(table).map(([key, spec]) => [key, spec.values ?? []]))
    const samples = [
      ...getIncomeOptions("CNY").map((option) => option.value),
      ...getIncomeOptions("USD").map((option) => option.value),
      "custom",
      "999",
    ]
    for (const currency of ["CNY", "USD"] as const) {
      for (const incomePreset of samples) {
        for (const verdictTone of ["safe", "warning", "danger"]) {
          const props = buildAssessmentCompletedProperties({ currency, incomePreset, verdictTone })
          expect(props).not.toBeNull()
          for (const [key, value] of Object.entries(props ?? {})) {
            expect(allowed[key]).toContain(value)
          }
        }
      }
    }
  })
})
