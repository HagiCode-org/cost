import { getIncomeOptions } from "../content/form-options"
import type { SalaryCurrency } from "./currency"

export const INCOME_PRESET_CUSTOM = "custom"

export type IncomePresetKey = "starter" | "growth" | "senior" | "staff" | "principal" | "custom"
export type VerdictTone = "safe" | "warning" | "danger"

// A type alias, not an interface: only an alias is assignable to the `Record<string, unknown>` that captureSiteEvent takes.
export type AssessmentCompletedProperties = {
  currency: SalaryCurrency
  income_preset: IncomePresetKey
  verdict_tone: VerdictTone
}

const VERDICT_TONES: readonly VerdictTone[] = ["safe", "warning", "danger"]

/**
 * Maps the selected income preset value to its tier key (starter ... principal).
 * Any value that is not a preset (including "custom" and every typed amount) maps to "custom".
 */
export function resolveIncomePresetKey(currency: SalaryCurrency, incomePreset: string): IncomePresetKey {
  if (incomePreset === INCOME_PRESET_CUSTOM) return "custom"

  const option = getIncomeOptions(currency).find((item) => item.value === incomePreset)
  return option ? (option.id as IncomePresetKey) : "custom"
}

/** Narrows a verdict tone to the enumeration, or null for anything unexpected. */
export function resolveVerdictTone(tone: string): VerdictTone | null {
  return (VERDICT_TONES as readonly string[]).includes(tone) ? (tone as VerdictTone) : null
}

/**
 * Builds the assessment_completed payload. Returns null when the tone is unexpected,
 * so the caller drops the event instead of sending free text.
 */
export function buildAssessmentCompletedProperties({
  currency,
  incomePreset,
  verdictTone,
}: {
  currency: SalaryCurrency
  incomePreset: string
  verdictTone: string
}): AssessmentCompletedProperties | null {
  const tone = resolveVerdictTone(verdictTone)
  if (tone === null) return null

  return {
    currency,
    income_preset: resolveIncomePresetKey(currency, incomePreset),
    verdict_tone: tone,
  }
}
