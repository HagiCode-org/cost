import type { SupportedLanguage } from "@/i18n/config"
import type { SiteRegion } from "@/lib/region"

import type { CityTier } from "./benchmark-data"
import { benchmarkData, getCityTierLabel } from "./benchmark-data"
import { getLocalizedModelCopy, pricingData } from "./pricing-data"
import type { SalaryCurrency } from "../lib/currency"

export interface FormOption<T extends string = string> {
  value: T
  label: string
  labelEn: string
}

export interface IncomeOption {
  id: string
  value: string
  label: string
  labelEn: string
}

export interface ModelOption {
  value: string
  providerId: string
  providerName: string
  label: string
  description: string
  pricingContext?: string
  availabilityStatus: string
  sourceLabel: string
}

export const salaryCurrencyOptions: FormOption<SalaryCurrency>[] = [
  { value: "CNY", label: "人民币 CNY", labelEn: "CNY" },
  { value: "USD", label: "美元 USD", labelEn: "USD" },
]

const incomeOptionConfig: Record<SalaryCurrency, IncomeOption[]> = {
  CNY: [
    { id: "starter", value: "13", label: "13 万", labelEn: "130k CNY" },
    { id: "growth", value: "26", label: "26 万", labelEn: "260k CNY" },
    { id: "senior", value: "40", label: "40 万", labelEn: "400k CNY" },
    { id: "staff", value: "60", label: "60 万", labelEn: "600k CNY" },
    { id: "principal", value: "100", label: "100 万", labelEn: "1M CNY" },
  ],
  USD: [
    { id: "starter", value: "18", label: "$18k", labelEn: "$18k" },
    { id: "growth", value: "36", label: "$36k", labelEn: "$36k" },
    { id: "senior", value: "55", label: "$55k", labelEn: "$55k" },
    { id: "staff", value: "83", label: "$83k", labelEn: "$83k" },
    { id: "principal", value: "138", label: "$138k", labelEn: "$138k" },
  ],
}

export const defaultIncomePresetByCurrency: Record<SalaryCurrency, string> = {
  CNY: incomeOptionConfig.CNY[1].value,
  USD: incomeOptionConfig.USD[1].value,
}

export function getIncomeOptions(currency: SalaryCurrency): IncomeOption[] {
  return incomeOptionConfig[currency]
}

export function getCityOptions(
  region: SiteRegion,
  language: SupportedLanguage,
): Array<{ value: CityTier, label: string }> {
  return benchmarkData.cityCoefficients.map((city) => ({
    value: city.tier,
    label: getCityTierLabel(city.tier, region, language),
  }))
}

export function getModelOptions(language: SupportedLanguage): ModelOption[] {
  return pricingData.models.map((model) => {
    const provider = pricingData.providers.find((item) => item.id === model.providerId)
    const copy = getLocalizedModelCopy(model, language)

    return {
      value: model.id,
      providerId: model.providerId,
      providerName: provider?.name ?? model.providerId,
      label: model.name,
      description: copy.description,
      pricingContext: [copy.pricingContext, copy.sourceLabel, getAvailabilityLabel(model.availabilityStatus, language)]
        .filter(Boolean)
        .join(" · "),
      availabilityStatus: model.availabilityStatus,
      sourceLabel: copy.sourceLabel,
    }
  })
}

function getAvailabilityLabel(status: string, language: SupportedLanguage) {
  if (status === "coming-soon") return language === "zh-CN" ? "即将开放" : "Coming soon"
  if (status === "legacy-mapped") return language === "zh-CN" ? "旧 ID 已映射" : "Legacy ID mapped"
  return undefined
}
