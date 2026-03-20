import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { cn } from "@/lib/utils"
import { evaluate, type EvaluationInput } from "@/features/income-token/lib/calculate-ai-risk"
import { buildResultViewModel, type ResultViewModel } from "@/features/income-token/lib/build-result-view-model"
import { cityOptions, incomeOptions, modelOptions } from "@/features/income-token/content/form-options"
import { ResultSections } from "./ResultSections"
import type { CityTier } from "@/features/income-token/content/benchmark-data"

const defaultModelId = modelOptions[0]?.value ?? "gpt-5"
const questionOrder = ["01", "02", "03", "04", "05"] as const
const CUSTOM_INCOME_VALUE = "custom"
const DEFAULT_INCOME_PRESET = "26"
const validCityValues = new Set(cityOptions.map((option) => option.value))
const validModelValues = new Set(modelOptions.map((option) => option.value))
const validIncomePresetValues = new Set([
  ...incomeOptions.map((option) => option.value),
  CUSTOM_INCOME_VALUE,
])

function getSearchParams() {
  if (typeof window === "undefined") return new URLSearchParams()
  return new URLSearchParams(window.location.search)
}

function parsePositiveNumber(value: string | null, min: number) {
  if (!value) return null
  const parsed = Number.parseFloat(value)
  if (!Number.isFinite(parsed) || parsed < min) return null
  return value
}

function getInitialIncomePreset() {
  const params = getSearchParams()
  const preset = params.get("incomePreset")
  const income = params.get("income")

  if (preset && validIncomePresetValues.has(preset)) {
    return preset
  }

  if (income && incomeOptions.some((option) => option.value === income)) {
    return income
  }

  return DEFAULT_INCOME_PRESET
}

function getInitialIncomeAmount(incomePreset: string) {
  const params = getSearchParams()
  const income = parsePositiveNumber(params.get("income"), 0.000001)

  if (incomePreset === CUSTOM_INCOME_VALUE) {
    return income ?? ""
  }

  if (incomePreset && incomeOptions.some((option) => option.value === incomePreset)) {
    return incomePreset
  }

  return DEFAULT_INCOME_PRESET
}

function getInitialCityTier(): CityTier {
  const city = getSearchParams().get("city")
  if (city && validCityValues.has(city as CityTier)) {
    return city as CityTier
  }

  return "tier1"
}

function getInitialModelId() {
  const model = getSearchParams().get("model")
  if (model && validModelValues.has(model)) {
    return model
  }

  return defaultModelId
}

function getInitialMultiplier() {
  return parsePositiveNumber(getSearchParams().get("multiplier"), 1) ?? "5"
}

function getInitialDailyTokens() {
  return parsePositiveNumber(getSearchParams().get("dailyTokens"), 0.000001) ?? "100"
}

interface AssessmentLandingProps {
  onResultChange?: (result: ResultViewModel | null) => void
}

export function AssessmentLanding({ onResultChange }: AssessmentLandingProps) {
  const { t, i18n } = useTranslation()
  const [incomePreset, setIncomePreset] = useState(getInitialIncomePreset)
  const [incomeAmount, setIncomeAmount] = useState(() => getInitialIncomeAmount(getInitialIncomePreset()))
  const [cityTier, setCityTier] = useState<CityTier>(getInitialCityTier)
  const [modelId, setModelId] = useState(getInitialModelId)
  const [performanceMultiplier, setPerformanceMultiplier] = useState(getInitialMultiplier)
  const [dailyTokenUsage, setDailyTokenUsage] = useState(getInitialDailyTokens)

  const incomeValue = Number.parseFloat(incomeAmount)
  const multiplierValue = Number.parseFloat(performanceMultiplier)
  const tokenValue = Number.parseFloat(dailyTokenUsage)
  const language = (i18n.resolvedLanguage || "zh-CN") as "zh-CN" | "en-US"

  const isValid =
    incomeAmount !== "" &&
    performanceMultiplier !== "" &&
    dailyTokenUsage !== "" &&
    incomeValue > 0 &&
    multiplierValue >= 1 &&
    tokenValue > 0

  const evaluationInput: EvaluationInput | null = useMemo(() => {
    if (!isValid) return null

    return {
      annualIncomeCny: incomeValue * 10000,
      cityTier,
      modelId,
      performanceMultiplier: multiplierValue,
      dailyTokenUsageM: tokenValue,
    }
  }, [cityTier, incomeValue, isValid, modelId, multiplierValue, tokenValue])

  const result: ResultViewModel | null = useMemo(() => {
    if (!evaluationInput) return null

    return buildResultViewModel(evaluate(evaluationInput), language)
  }, [evaluationInput, language])

  useEffect(() => {
    onResultChange?.(result)
  }, [onResultChange, result])

  useEffect(() => {
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)

    params.set("incomePreset", incomePreset || DEFAULT_INCOME_PRESET)
    if (incomeAmount) {
      params.set("income", incomeAmount)
    } else {
      params.delete("income")
    }

    params.set("city", cityTier)
    params.set("model", modelId)
    params.set("multiplier", performanceMultiplier)
    params.set("dailyTokens", dailyTokenUsage)

    const nextSearch = params.toString()
    const currentSearch = window.location.search.replace(/^\?/, "")

    if (nextSearch !== currentSearch) {
      const nextUrl = `${window.location.pathname}?${nextSearch}${window.location.hash}`
      window.history.replaceState({}, "", nextUrl)
    }
  }, [cityTier, dailyTokenUsage, incomeAmount, incomePreset, modelId, performanceMultiplier])

  function handleIncomePresetSelect(value: string) {
    setIncomePreset(value)

    if (value === CUSTOM_INCOME_VALUE) {
      setIncomeAmount("")
      return
    }

    setIncomeAmount(value)
  }

  return (
    <div className="space-y-6 px-4 py-12 sm:px-6 sm:py-16">
      <div className="glass-panel surface-outline mx-auto max-w-5xl rounded-[2rem] p-5 sm:p-8 lg:p-10">
        <div className="mb-8 flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
            <AlertTriangle className="size-6" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h1 className="display-type text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              {t("assessment.hero.title")}
            </h1>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
              {t("assessment.hero.subtitle")}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.75rem] border bg-background/80 p-5 transition-shadow hover:shadow-xl">
            <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-primary/75">{questionOrder[0]}</p>
            <Label id="income-amount-label" className="block text-xl font-bold leading-tight sm:text-2xl">
              {t("assessment.form.incomeAmount")}
            </Label>
            <div
              className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
              role="radiogroup"
              aria-labelledby="income-amount-label"
            >
              {incomeOptions.map((option) => {
                const isActive = incomePreset === option.value

                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleIncomePresetSelect(option.value)}
                    role="radio"
                    aria-checked={isActive}
                    className={cn(
                      "h-16 rounded-2xl border-2 px-4 text-base font-bold sm:text-lg",
                      isActive
                        ? "border-primary shadow-lg shadow-primary/15"
                        : "bg-background/60 hover:border-primary/40 hover:bg-primary/5"
                    )}
                  >
                    {language === "zh-CN" ? option.label : option.labelEn}
                  </Button>
                )
              })}

              <Button
                type="button"
                variant={incomePreset === CUSTOM_INCOME_VALUE ? "default" : "outline"}
                size="lg"
                onClick={() => handleIncomePresetSelect(CUSTOM_INCOME_VALUE)}
                role="radio"
                aria-checked={incomePreset === CUSTOM_INCOME_VALUE}
                className={cn(
                  "h-16 rounded-2xl border-2 px-4 text-base font-bold sm:text-lg",
                  incomePreset === CUSTOM_INCOME_VALUE
                    ? "border-primary shadow-lg shadow-primary/15"
                    : "bg-background/60 hover:border-primary/40 hover:bg-primary/5"
                )}
              >
                {t("assessment.form.incomeCustom")}
              </Button>
            </div>

            {incomePreset === CUSTOM_INCOME_VALUE ? (
              <div className="mt-4 space-y-2">
                <Input
                  id="income-amount"
                  type="number"
                  min="1"
                  step="any"
                  placeholder={t("assessment.form.incomePlaceholder")}
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  className="h-14 rounded-2xl border-2 px-4 text-lg font-semibold"
                />
                <p className="text-sm text-muted-foreground">{t("assessment.form.incomeCustomHint")}</p>
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.75rem] border bg-background/80 p-5 transition-shadow hover:shadow-xl">
            <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-primary/75">{questionOrder[1]}</p>
            <Label htmlFor="city-tier" className="block text-xl font-bold leading-tight sm:text-2xl">
              {t("assessment.form.city")}
            </Label>
            <NativeSelect
              id="city-tier"
              size="lg"
              value={cityTier}
              onChange={(e) => setCityTier(e.target.value as CityTier)}
              className="mt-4 w-full"
            >
              {cityOptions.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {language === "zh-CN" ? option.label : option.labelEn}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div className="rounded-[1.75rem] border bg-background/80 p-5 transition-shadow hover:shadow-xl">
            <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-primary/75">{questionOrder[2]}</p>
            <Label htmlFor="model-id" className="block text-xl font-bold leading-tight sm:text-2xl">
              {t("assessment.form.model")}
            </Label>
            <NativeSelect
              id="model-id"
              size="lg"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="mt-4 w-full"
            >
              {modelOptions.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.providerName} · {option.label} · {option.description}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div className="rounded-[1.75rem] border bg-background/80 p-5 transition-shadow hover:shadow-xl">
            <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-primary/75">{questionOrder[3]}</p>
            <Label htmlFor="performance-multiplier" className="block text-xl font-bold leading-tight sm:text-2xl">
              {t("assessment.form.performanceMultiplier")}
            </Label>
            <Input
              id="performance-multiplier"
              type="number"
              min="1"
              step="0.1"
              placeholder={t("assessment.form.performanceMultiplierPlaceholder")}
              value={performanceMultiplier}
              onChange={(e) => setPerformanceMultiplier(e.target.value)}
              className="mt-4 h-14 rounded-2xl border-2 px-4 text-lg font-semibold"
            />
          </div>

          <div className="rounded-[1.75rem] border bg-background/80 p-5 transition-shadow hover:shadow-xl">
            <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-primary/75">{questionOrder[4]}</p>
            <Label htmlFor="daily-token-usage" className="block text-xl font-bold leading-tight sm:text-2xl">
              {t("assessment.form.dailyTokenUsage")}
            </Label>
            <Input
              id="daily-token-usage"
              type="number"
              min="0.1"
              step="0.1"
              placeholder={t("assessment.form.dailyTokenUsagePlaceholder")}
              value={dailyTokenUsage}
              onChange={(e) => setDailyTokenUsage(e.target.value)}
              className="mt-4 h-14 rounded-2xl border-2 px-4 text-lg font-semibold"
            />
          </div>
        </div>
      </div>

      {result && evaluationInput ? <ResultSections result={result} baseInput={evaluationInput} /> : null}
    </div>
  )
}
