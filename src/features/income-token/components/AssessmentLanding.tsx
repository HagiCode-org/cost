import { useEffect, useMemo, useRef, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  defaultIncomePresetByCurrency,
  getCityOptions,
  getIncomeOptions,
  getModelOptions,
  salaryCurrencyOptions,
} from "@/features/income-token/content/form-options"
import { benchmarkData, type CityTier } from "@/features/income-token/content/benchmark-data"
import { pricingData } from "@/features/income-token/content/pricing-data"
import { buildResultViewModel, type ResultViewModel } from "@/features/income-token/lib/build-result-view-model"
import {
  convertAnnualCnyToSalaryInput,
  formatSalaryInputValue,
  getDefaultSalaryCurrency,
  isSalaryCurrency,
  type SalaryCurrency,
} from "@/features/income-token/lib/currency"
import { evaluate, normalizeAnnualIncomeCny, type EvaluationInput } from "@/features/income-token/lib/calculate-ai-risk"
import { evaluateSpecialTitles } from "@/features/income-token/lib/evaluate-special-titles"
import { mergeEarnedTitleIds, readEarnedTitleIds, writeEarnedTitleIds } from "@/features/income-token/lib/title-storage"
import type { SpecialTitleId } from "@/features/income-token/lib/title-types"
import { getResolvedExperienceContext, getResolvedLanguage } from "@/i18n/config"
import {
  getDefaultCityTierForRegion,
  syncRegionPreferenceFromUrl,
  type SiteRegion,
} from "@/lib/region"
import { cn } from "@/lib/utils"
import { ResultSections } from "./ResultSections"

const defaultModelId = pricingData.models[0]?.id ?? "gpt-5"
const questionOrder = ["01", "02", "03", "04", "05", "06"] as const
const CUSTOM_INCOME_VALUE = "custom"
const validCityValues = new Set(benchmarkData.cityCoefficients.map((option) => option.tier))
const validModelValues = new Set(pricingData.models.map((option) => option.id))

function getSearchParams() {
  if (typeof window === "undefined") return new URLSearchParams()
  return new URLSearchParams(window.location.search)
}

function parseNumberString(value: string | null, min: number) {
  if (!value) return null
  const parsed = Number.parseFloat(value)
  if (!Number.isFinite(parsed) || parsed < min) return null
  return value
}

function getInitialSelectedCurrency(params: URLSearchParams, region: SiteRegion): SalaryCurrency {
  const currency = params.get("currency")
  return isSalaryCurrency(currency) ? currency : getDefaultSalaryCurrency(region)
}

function getValidIncomePresetValues(currency: SalaryCurrency) {
  return new Set([
    ...getIncomeOptions(currency).map((option) => option.value),
    CUSTOM_INCOME_VALUE,
  ])
}

function getInitialIncomePreset(params: URLSearchParams, currency: SalaryCurrency) {
  const preset = params.get("incomePreset")
  const income = params.get("income")

  if (preset && getValidIncomePresetValues(currency).has(preset)) {
    return preset
  }

  if (income && getIncomeOptions(currency).some((option) => option.value === income)) {
    return income
  }

  return defaultIncomePresetByCurrency[currency]
}

function getInitialIncomeAmount(params: URLSearchParams, currency: SalaryCurrency, incomePreset: string) {
  const income = parseNumberString(params.get("income"), 0.000001)

  if (incomePreset === CUSTOM_INCOME_VALUE) {
    return income ?? ""
  }

  if (incomePreset && getIncomeOptions(currency).some((option) => option.value === incomePreset)) {
    return incomePreset
  }

  return defaultIncomePresetByCurrency[currency]
}

function getInitialCityTier(params: URLSearchParams, region: SiteRegion): CityTier {
  const city = params.get("city")
  if (city && validCityValues.has(city as CityTier)) {
    return city as CityTier
  }

  return getDefaultCityTierForRegion(region)
}

function getInitialModelId(params: URLSearchParams) {
  const model = params.get("model")
  if (model && validModelValues.has(model)) {
    return model
  }

  return defaultModelId
}

function getInitialMultiplier() {
  return parseNumberString(getSearchParams().get("multiplier"), 1) ?? "5"
}

function getInitialDailyTokens() {
  return parseNumberString(getSearchParams().get("dailyTokens"), 0) ?? "100"
}

function getInitialAssessmentState() {
  syncRegionPreferenceFromUrl()

  const params = getSearchParams()
  const { region } = getResolvedExperienceContext()
  const selectedCurrency = getInitialSelectedCurrency(params, region)
  const incomePreset = getInitialIncomePreset(params, selectedCurrency)

  return {
    region,
    selectedCurrency,
    incomePreset,
    incomeAmount: getInitialIncomeAmount(params, selectedCurrency, incomePreset),
    cityTier: getInitialCityTier(params, region),
    modelId: getInitialModelId(params),
    performanceMultiplier: getInitialMultiplier(),
    dailyTokenUsage: getInitialDailyTokens(),
  }
}

interface AssessmentLandingProps {
  onResultChange?: (result: ResultViewModel | null) => void
}

export function AssessmentLanding({ onResultChange }: AssessmentLandingProps) {
  const { t } = useTranslation()
  const initialState = useMemo(() => getInitialAssessmentState(), [])
  const [region] = useState<SiteRegion>(initialState.region)
  const [selectedCurrency, setSelectedCurrency] = useState<SalaryCurrency>(initialState.selectedCurrency)
  const [incomePreset, setIncomePreset] = useState(initialState.incomePreset)
  const [incomeAmount, setIncomeAmount] = useState(initialState.incomeAmount)
  const [cityTier, setCityTier] = useState<CityTier>(initialState.cityTier)
  const [modelId, setModelId] = useState(initialState.modelId)
  const [performanceMultiplier, setPerformanceMultiplier] = useState(initialState.performanceMultiplier)
  const [dailyTokenUsage, setDailyTokenUsage] = useState(initialState.dailyTokenUsage)
  const [earnedTitleIds, setEarnedTitleIds] = useState<SpecialTitleId[]>(() => readEarnedTitleIds())
  const [hasInteracted, setHasInteracted] = useState(false)
  const previousMatchedTitleSignatureRef = useRef("")

  const incomeOptions = useMemo(() => getIncomeOptions(selectedCurrency), [selectedCurrency])
  const language = getResolvedLanguage()
  const cityOptions = useMemo(() => getCityOptions(region, language), [language, region])
  const modelOptions = useMemo(() => getModelOptions(language), [language])
  const incomeValue = Number.parseFloat(incomeAmount)
  const multiplierValue = Number.parseFloat(performanceMultiplier)
  const tokenValue = Number.parseFloat(dailyTokenUsage)

  const hasValidIncome = incomeAmount !== "" && Number.isFinite(incomeValue) && incomeValue > 0
  const normalizedAnnualIncomeCny = hasValidIncome
    ? normalizeAnnualIncomeCny({
        annualIncomeInput: incomeValue,
        salaryCurrency: selectedCurrency,
      })
    : null
  const hasValidMultiplier =
    performanceMultiplier !== "" && Number.isFinite(multiplierValue) && multiplierValue >= 1
  const hasValidDailyTokens =
    dailyTokenUsage !== "" && Number.isFinite(tokenValue) && tokenValue >= 0
  const isZeroTokenSpecialPath = hasValidIncome && hasValidMultiplier && hasValidDailyTokens && tokenValue === 0
  const isValid = hasValidIncome && hasValidMultiplier && hasValidDailyTokens && tokenValue > 0
  const incomeUnitKey = selectedCurrency === "CNY" ? "assessment.form.units.cny" : "assessment.form.units.usd"

  const evaluationInput: EvaluationInput | null = useMemo(() => {
    if (!isValid || normalizedAnnualIncomeCny === null) return null

    return {
      annualIncomeCny: normalizedAnnualIncomeCny,
      cityTier,
      modelId,
      performanceMultiplier: multiplierValue,
      dailyTokenUsageM: tokenValue,
    }
  }, [cityTier, isValid, modelId, multiplierValue, normalizedAnnualIncomeCny, tokenValue])

  const calculationResult = useMemo(() => {
    if (!evaluationInput) return null

    return evaluate(evaluationInput)
  }, [evaluationInput])

  const result: ResultViewModel | null = useMemo(() => {
    if (!calculationResult) return null

    return buildResultViewModel(calculationResult, language, selectedCurrency, region)
  }, [calculationResult, language, region, selectedCurrency])

  const rawTitleEvaluation = useMemo(() => {
    if (!isZeroTokenSpecialPath && !calculationResult) return null

    return evaluateSpecialTitles({
      rawInput: {
        annualIncomeCny: normalizedAnnualIncomeCny,
        cityTier,
        modelId,
        performanceMultiplier: hasValidMultiplier ? multiplierValue : null,
        dailyTokenUsageM: hasValidDailyTokens ? tokenValue : null,
      },
      calculationResult,
      earnedTitleIds,
    })
  }, [
    calculationResult,
    cityTier,
    earnedTitleIds,
    hasValidDailyTokens,
    hasValidMultiplier,
    isZeroTokenSpecialPath,
    modelId,
    multiplierValue,
    normalizedAnnualIncomeCny,
    tokenValue,
  ])

  useEffect(() => {
    onResultChange?.(result)
  }, [onResultChange, result])

  useEffect(() => {
    if (!hasInteracted) {
      previousMatchedTitleSignatureRef.current = ""
      return
    }

    if (!rawTitleEvaluation) {
      previousMatchedTitleSignatureRef.current = ""
      return
    }

    const matchedTitleSignature = rawTitleEvaluation.matchedTitleIds.join(",")
    if (matchedTitleSignature !== previousMatchedTitleSignatureRef.current) {
      previousMatchedTitleSignatureRef.current = matchedTitleSignature
      if (rawTitleEvaluation.newlyEarnedTitles.length > 0) {
        const titleNames = rawTitleEvaluation.newlyEarnedTitles
          .map((title) => t(`assessment.titles.catalog.${title.translationKey}.name`))
          .join(" / ")

        toast.success(t("assessment.titles.toast.title"), {
          description: t("assessment.titles.toast.description", { titles: titleNames }),
        })
      }
    } else if (rawTitleEvaluation.newlyEarnedTitleIds.length === 0) {
      return
    }

    const mergedTitleIds = mergeEarnedTitleIds(earnedTitleIds, rawTitleEvaluation.matchedTitleIds)
    if (
      mergedTitleIds.length === earnedTitleIds.length &&
      mergedTitleIds.every((titleId, index) => titleId === earnedTitleIds[index])
    ) {
      return
    }

    setEarnedTitleIds(mergedTitleIds)
    writeEarnedTitleIds(mergedTitleIds)
  }, [earnedTitleIds, hasInteracted, rawTitleEvaluation, t])

  useEffect(() => {
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)

    params.set("region", region)
    params.set("currency", selectedCurrency)
    params.set("incomePreset", incomePreset || defaultIncomePresetByCurrency[selectedCurrency])
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
  }, [
    cityTier,
    dailyTokenUsage,
    incomeAmount,
    incomePreset,
    modelId,
    performanceMultiplier,
    region,
    selectedCurrency,
  ])

  function handleCurrencySelect(nextCurrency: SalaryCurrency) {
    if (nextCurrency === selectedCurrency) return

    setHasInteracted(true)

    if (incomePreset === CUSTOM_INCOME_VALUE) {
      if (normalizedAnnualIncomeCny !== null) {
        setIncomeAmount(
          formatSalaryInputValue(convertAnnualCnyToSalaryInput(normalizedAnnualIncomeCny, nextCurrency)),
        )
      }
    } else {
      const currentPreset = getIncomeOptions(selectedCurrency).find((option) => option.value === incomePreset)
      const nextPreset =
        (currentPreset
          ? getIncomeOptions(nextCurrency).find((option) => option.id === currentPreset.id)?.value
          : undefined) ?? defaultIncomePresetByCurrency[nextCurrency]

      setIncomePreset(nextPreset)
      setIncomeAmount(nextPreset)
    }

    setSelectedCurrency(nextCurrency)
  }

  function handleIncomePresetSelect(value: string) {
    setHasInteracted(true)
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
            <Label id="currency-label" className="block text-xl font-bold leading-tight sm:text-2xl">
              {t("assessment.form.currency")}
            </Label>
            <div
              className="mt-4 grid gap-3 sm:grid-cols-2"
              role="radiogroup"
              aria-labelledby="currency-label"
            >
              {salaryCurrencyOptions.map((option) => {
                const isActive = selectedCurrency === option.value

                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleCurrencySelect(option.value)}
                    role="radio"
                    aria-checked={isActive}
                    className={cn(
                      "h-16 rounded-2xl border-2 px-4 text-base font-bold sm:text-lg",
                      isActive
                        ? "border-primary shadow-lg shadow-primary/15"
                        : "bg-background/60 hover:border-primary/40 hover:bg-primary/5",
                    )}
                  >
                    {language === "zh-CN" ? option.label : option.labelEn}
                  </Button>
                )
              })}
            </div>
            <div className="mt-4 space-y-1 text-sm text-muted-foreground">
              <p>{t("assessment.form.regionHint", { region: t(`assessment.regions.${region}`) })}</p>
              <p>{t("assessment.form.currencyHint", { unit: t(incomeUnitKey) })}</p>
              <p>{t("assessment.form.exchangeRateHint", { rate: pricingData.exchangeRateUsdToCny })}</p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border bg-background/80 p-5 transition-shadow hover:shadow-xl">
            <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-primary/75">{questionOrder[1]}</p>
            <Label id="income-amount-label" className="block text-xl font-bold leading-tight sm:text-2xl">
              {t("assessment.form.incomeAmount", { unit: t(incomeUnitKey) })}
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
                    key={option.id}
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
                        : "bg-background/60 hover:border-primary/40 hover:bg-primary/5",
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
                    : "bg-background/60 hover:border-primary/40 hover:bg-primary/5",
                )}
              >
                {t("assessment.form.incomeCustom")}
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              {t("assessment.form.presetHint", { unit: t(incomeUnitKey) })}
            </p>

            {incomePreset === CUSTOM_INCOME_VALUE ? (
              <div className="mt-4 space-y-2">
                <Input
                  id="income-amount"
                  type="number"
                  min="1"
                  step="any"
                  placeholder={t("assessment.form.incomePlaceholder", { example: selectedCurrency === "USD" ? "45" : "30" })}
                  value={incomeAmount}
                  onChange={(e) => {
                    setHasInteracted(true)
                    setIncomeAmount(e.target.value)
                  }}
                  className="h-14 rounded-2xl border-2 px-4 text-lg font-semibold"
                />
                <p className="text-sm text-muted-foreground">
                  {t("assessment.form.incomeCustomHint", { unit: t(incomeUnitKey) })}
                </p>
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.75rem] border bg-background/80 p-5 transition-shadow hover:shadow-xl">
            <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-primary/75">{questionOrder[2]}</p>
            <Label htmlFor="city-tier" className="block text-xl font-bold leading-tight sm:text-2xl">
              {t("assessment.form.city")}
            </Label>
            <NativeSelect
              id="city-tier"
              size="lg"
              value={cityTier}
              onChange={(e) => {
                setHasInteracted(true)
                setCityTier(e.target.value as CityTier)
              }}
              className="mt-4 w-full"
            >
              {cityOptions.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div className="rounded-[1.75rem] border bg-background/80 p-5 transition-shadow hover:shadow-xl">
            <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-primary/75">{questionOrder[3]}</p>
            <Label htmlFor="model-id" className="block text-xl font-bold leading-tight sm:text-2xl">
              {t("assessment.form.model")}
            </Label>
            <NativeSelect
              id="model-id"
              size="lg"
              value={modelId}
              onChange={(e) => {
                setHasInteracted(true)
                setModelId(e.target.value)
              }}
              className="mt-4 w-full"
            >
              {modelOptions.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.providerName} · {option.label} · {option.description}
                  {option.pricingContext ? ` · ${option.pricingContext}` : ""}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div className="rounded-[1.75rem] border bg-background/80 p-5 transition-shadow hover:shadow-xl">
            <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-primary/75">{questionOrder[4]}</p>
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
              onChange={(e) => {
                setHasInteracted(true)
                setPerformanceMultiplier(e.target.value)
              }}
              className="mt-4 h-14 rounded-2xl border-2 px-4 text-lg font-semibold"
            />
          </div>

          <div className="rounded-[1.75rem] border bg-background/80 p-5 transition-shadow hover:shadow-xl">
            <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-primary/75">{questionOrder[5]}</p>
            <Label htmlFor="daily-token-usage" className="block text-xl font-bold leading-tight sm:text-2xl">
              {t("assessment.form.dailyTokenUsage")}
            </Label>
            <Input
              id="daily-token-usage"
              type="number"
              min="0"
              step="0.1"
              placeholder={t("assessment.form.dailyTokenUsagePlaceholder")}
              value={dailyTokenUsage}
              onChange={(e) => {
                setHasInteracted(true)
                setDailyTokenUsage(e.target.value)
              }}
              className="mt-4 h-14 rounded-2xl border-2 px-4 text-lg font-semibold"
            />
          </div>
        </div>
      </div>

      {result && evaluationInput ? (
        <ResultSections
          result={result}
          baseInput={evaluationInput}
          selectedCurrency={selectedCurrency}
          region={region}
        />
      ) : null}
    </div>
  )
}
