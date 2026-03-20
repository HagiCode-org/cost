import { fireEvent, screen, waitFor } from "@testing-library/react"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

import { AgentVerdictSection } from "./AgentVerdictSection"
import i18n from "@/i18n/config"
import type { ResultViewModel } from "@/features/income-token/lib/build-result-view-model"
import { renderWithProviders } from "@/test/render"
import { installViewportMock, setViewportWidth } from "@/test/viewport"

const summaryData = {
  selectedModelName: "Claude Sonnet",
  effectivePeopleEquivalentFormatted: "2.40x",
  selectedModelDescription: "A strong coding model for daily workflows.",
  annualIncomeFormatted: "300,000",
  cityLabel: "Shanghai",
  annualTotalCostFormatted: "420,000",
  annualTotalCostFormula: "annual-cost-formula",
  annualTotalCostExplanation: "annual-cost-explanation",
  performanceMultiplierFormatted: "2.50x",
  performanceMultiplierExplanation: "performance-multiplier-explanation",
  dailyTokenUsageFormatted: "12 M",
  dailyTokenUsageExplanation: "daily-token-usage-explanation",
  annualAiCostFormatted: "36,000",
  annualAiCostFormula: "annual-ai-cost-formula",
  annualAiCostExplanation: "annual-ai-cost-explanation",
  dailyAiCostFormatted: "120",
  dailyAiCostFormula: "daily-ai-cost-formula",
  dailyAiCostExplanation: "daily-ai-cost-explanation",
  aiCostShareFormatted: "12%",
  aiCostShareFormula: "salary-share-formula",
  aiCostShareExplanation: "salary-share-explanation",
  costEffectivenessFormatted: "3.8x",
  costEffectivenessFormula: "cost-effectiveness-formula",
  costEffectivenessExplanation: "cost-effectiveness-explanation",
  affordableWorkflowCountFormatted: "14",
  affordableWorkflowFormula: "affordable-workflow-formula",
  affordableWorkflowExplanation: "affordable-workflow-explanation",
  effectivePeopleEquivalentFormula: "people-equivalent-formula",
  effectivePeopleEquivalentExplanation: "people-equivalent-explanation",
} as ResultViewModel["summarySection"]

beforeAll(() => {
  installViewportMock()
})

beforeEach(async () => {
  localStorage.clear()
  document.documentElement.className = ""
  await i18n.changeLanguage("zh-CN")
})

describe("AgentVerdictSection", () => {
  it("uses a tap-to-toggle detail panel on mobile and closes when clicking outside", async () => {
    setViewportWidth(375)
    renderWithProviders(<AgentVerdictSection data={summaryData} />)

    const detailButton = await screen.findByRole("button", { name: /企业年度全用工成本/ })
    fireEvent.click(detailButton)

    const formula = await screen.findByText("annual-cost-formula")
    expect(formula).toHaveClass("text-xs")
    expect(formula).toHaveClass("md:text-[11px]")
    expect(screen.getByText("annual-cost-explanation")).toBeInTheDocument()

    fireEvent.click(document.body)

    await waitFor(() => {
      expect(screen.queryByText("annual-cost-formula")).not.toBeInTheDocument()
    })
  })

  it("keeps the desktop tooltip rendering path available outside mobile mode", async () => {
    setViewportWidth(1280)
    renderWithProviders(<AgentVerdictSection data={summaryData} />)

    const detailButton = await screen.findByRole("button", { name: /企业年度全用工成本/ })
    fireEvent.focus(detailButton)

    const desktopTooltipFormulas = await screen.findAllByText("annual-cost-formula")
    expect(desktopTooltipFormulas.length).toBeGreaterThan(0)

    fireEvent.blur(detailButton)

    await waitFor(() => {
      expect(screen.queryAllByText("annual-cost-formula")).toHaveLength(0)
    })
  })
})
