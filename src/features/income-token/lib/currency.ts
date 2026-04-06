import type { SupportedLanguage } from "@/i18n/config"
import type { SiteRegion } from "@/lib/region"
import { getDefaultCurrencyForRegion } from "@/lib/region"

import { pricingData, type PricingCurrency } from "../content/pricing-data"

export type SalaryCurrency = PricingCurrency

const salaryInputUnitMap: Record<SalaryCurrency, number> = {
  CNY: 10_000,
  USD: 1_000,
}

const currencyLocaleMap: Record<SalaryCurrency, string> = {
  CNY: "zh-CN",
  USD: "en-US",
}

const currencySymbolMap: Record<SalaryCurrency, string> = {
  CNY: "¥",
  USD: "$",
}

export function isSalaryCurrency(value: string | null | undefined): value is SalaryCurrency {
  return value === "CNY" || value === "USD"
}

export function getDefaultSalaryCurrency(region: SiteRegion): SalaryCurrency {
  return getDefaultCurrencyForRegion(region)
}

export function getCurrencySymbol(currency: SalaryCurrency) {
  return currencySymbolMap[currency]
}

export function getCurrencyLabel(currency: SalaryCurrency, language: SupportedLanguage) {
  if (language === "zh-CN") {
    return currency === "CNY" ? "人民币" : "美元"
  }

  return currency
}

export function getExchangeRateText(language: SupportedLanguage) {
  return language === "zh-CN"
    ? `1 USD = ${pricingData.exchangeRateUsdToCny} CNY`
    : `1 USD = ${pricingData.exchangeRateUsdToCny} CNY`
}

export function normalizeIncomeInputToAnnualCny(amount: number, currency: SalaryCurrency) {
  const annualAmount = amount * salaryInputUnitMap[currency]

  return currency === "USD"
    ? annualAmount * pricingData.exchangeRateUsdToCny
    : annualAmount
}

export function convertAnnualCnyToSalaryInput(annualIncomeCny: number, currency: SalaryCurrency) {
  const annualAmount = currency === "USD"
    ? annualIncomeCny / pricingData.exchangeRateUsdToCny
    : annualIncomeCny

  return annualAmount / salaryInputUnitMap[currency]
}

export function convertCnyAmountToCurrency(amountCny: number, currency: SalaryCurrency) {
  return currency === "USD"
    ? amountCny / pricingData.exchangeRateUsdToCny
    : amountCny
}

export function formatCurrencyAmount(
  amount: number,
  currency: SalaryCurrency,
  options: Intl.NumberFormatOptions = {},
) {
  const formatterOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }

  return `${currencySymbolMap[currency]}${amount.toLocaleString(currencyLocaleMap[currency], formatterOptions)}`
}

export function formatCurrencyAmountFromCny(
  amountCny: number,
  currency: SalaryCurrency,
  options: Intl.NumberFormatOptions = {},
) {
  return formatCurrencyAmount(convertCnyAmountToCurrency(amountCny, currency), currency, options)
}

export function formatSalaryInputValue(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}
