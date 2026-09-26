import { fireEvent, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { CostImpactSection } from "./CostImpactSection"
import { TokenCeilingListSection } from "./TokenCeilingListSection"
import type { ResultViewModel } from "@/features/income-token/lib/build-result-view-model"
import { buildResultViewModel } from "@/features/income-token/lib/build-result-view-model"
import { evaluate } from "@/features/income-token/lib/calculate-ai-risk"
import { pricingData } from "@/features/income-token/content/pricing-data"
import i18n from "@/i18n/config"
import { renderWithProviders } from "@/test/render"

const costSectionData = {
  annualTotalCostFormatted: "¥420,000",
  providerName: "Anthropic",
  modelName: "Claude Sonnet",
  modelDescription: "General purpose coding model",
  pricingContext: "Standard pricing",
  pricingNote: "No cache discount",
  sourceLabel: "Anthropic Pricing",
  sourceUrl: "https://example.com/pricing",
  sourceNote: "Updated today",
  inputPriceFormatted: "$3",
  outputPriceFormatted: "$15",
  cacheReadPriceFormatted: "$0.003",
  mixedPriceFormatted: "$6",
  mixedPriceFormula: "mixed-price-formula",
  mixedPriceExplanation: "mixed-price-explanation",
  dailyTokenUsageFormatted: "12 M",
  annualTokenUsageFormatted: "2.88 B",
  dailyAiCostFormatted: "¥120",
  annualAiCostFormatted: "¥36,000",
  dailyAiCostFormula: "daily-ai-cost-formula",
  dailyAiCostExplanation: "daily-ai-cost-explanation",
  annualAiCostFormula: "annual-ai-cost-formula",
  annualAiCostExplanation: "annual-ai-cost-explanation",
  fullBudgetTotalTokensFormatted: "8.40 B",
  fullBudgetWorkdayTokensFormatted: "35 M",
  workdayAverageFormula: "workday-average-formula",
  exchangeRateDisclosure: "exchange-rate-disclosure",
} as ResultViewModel["costSection"]

const tokenListData = {
  annualTotalCostFormatted: "¥420,000",
  inputOutputRatio: 3,
  workingDaysPerYear: 240,
  pricingProviders: [
    {
      providerId: "anthropic",
      providerName: "Anthropic",
      sourceLabel: "Anthropic Pricing",
      sourceUrl: "https://example.com/pricing",
      sourceNote: "Updated today",
      models: [
        {
          modelId: "claude-sonnet",
          providerId: "anthropic",
          providerName: "Anthropic",
          modelName: "Claude Sonnet",
          modelDescription: "General purpose coding model",
          averageWorkdayTokensFormatted: "35 M",
          mixInputFormula: "mix-input-formula",
          mixOutputFormula: "mix-output-formula",
          inputPriceFormatted: "$3",
          outputPriceFormatted: "$15",
          cacheReadPriceFormatted: "$0.003",
          pricingContext: "Standard pricing",
          pricingNote: "No cache discount",
          sourceLabel: "Anthropic Pricing",
          sourceUrl: "https://example.com/pricing",
          inputTokensFormatted: "2.4 B",
          outputTokensFormatted: "0.8 B",
          totalTokensFormatted: "3.2 B",
          inputTokensInMixFormatted: "2.4 B",
          outputTokensInMixFormatted: "0.8 B",
        },
      ],
    },
  ],
} as ResultViewModel["tokenListSection"]

describe("responsive formula copy", () => {
  it("keeps cost formulas at text-xs on mobile with desktop overrides", () => {
    renderWithProviders(<CostImpactSection data={costSectionData} />)

    fireEvent.click(screen.getByRole("button", { name: /Expand to view model cost and token budget details/i }))

    expect(screen.getByText("mixed-price-formula")).toHaveClass("text-xs")
    expect(screen.getByText("mixed-price-formula")).toHaveClass("max-md:text-xs")
    expect(screen.getByText("mixed-price-formula")).toHaveClass("md:text-[11px]")
    expect(screen.getByText("daily-ai-cost-formula")).toHaveClass("md:text-[11px]")
    expect(screen.getByText("annual-ai-cost-formula")).toHaveClass("md:text-[11px]")
    expect(screen.getByText("workday-average-formula")).toHaveClass("md:text-[11px]")
  })

  it("shows a standalone cache-read rate without requiring a cache-write price", async () => {
    await i18n.changeLanguage("en-US")
    renderWithProviders(<CostImpactSection data={costSectionData} />)

    fireEvent.click(screen.getByRole("button", { name: /Expand to view model cost and token budget details/i }))

    expect(screen.getByText("Cache read / 1M tokens")).toBeInTheDocument()
    expect(screen.getByText("$0.003")).toBeInTheDocument()
    expect(screen.queryByText("Cache write / 1M tokens")).not.toBeInTheDocument()
  })

  it("upgrades token ceiling copy to text-xs on mobile while preserving desktop sizes", async () => {
    await i18n.changeLanguage("en-US")
    renderWithProviders(<TokenCeilingListSection data={tokenListData} />)

    expect(screen.queryByText(/Standard pricing/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Full Token Purchasing Power List/i }))

    expect(screen.getByText(/Standard pricing/)).toHaveClass("text-xs")
    expect(screen.getByText(/Standard pricing/)).toHaveClass("md:text-[11px]")
    expect(screen.getByText(/Average across 240 workdays/)).toHaveClass("md:text-[11px]")
    expect(screen.getByText("Cache read / 1M tokens")).toBeInTheDocument()
    expect(screen.getByText("$0.003")).toBeInTheDocument()
    expect(screen.queryByText("Cache write / 1M tokens")).not.toBeInTheDocument()
    expect(screen.getByText("mix-input-formula")).toHaveClass("text-xs")
    expect(screen.getByText("mix-input-formula")).toHaveClass("md:text-[10px]")
    expect(screen.getByText("mix-output-formula")).toHaveClass("md:text-[10px]")
  })

  it("renders one token-disclosure card for every configured model tier", async () => {
    await i18n.changeLanguage("en-US")
    const result = evaluate({
      annualIncomeCny: 300_000,
      cityTier: "tier1",
      modelId: "gpt-6-sol",
      performanceMultiplier: 2.5,
      dailyTokenUsageM: 10,
    })
    const viewModel = buildResultViewModel(result, "en-US", "USD", "international")

    renderWithProviders(<TokenCeilingListSection data={viewModel.tokenListSection} />)
    fireEvent.click(screen.getByRole("button", { name: /Full Token Purchasing Power List/i }))

    const cards = document.querySelectorAll("#token-ceiling-list-content > div > div.grid > div")
    expect(cards).toHaveLength(pricingData.models.length)
  })
})
