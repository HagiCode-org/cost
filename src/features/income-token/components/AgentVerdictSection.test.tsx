import { fireEvent, screen, waitFor, within } from "@testing-library/react"
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

async function openSummaryDetails() {
  const collapseTrigger = await screen.findByRole("button", { name: /展开查看年薪、效率倍数、Token 用量和成本等详细数据/ })
  fireEvent.click(collapseTrigger)
}

beforeAll(() => {
  installViewportMock()
})

beforeEach(async () => {
  localStorage.clear()
  document.documentElement.className = ""
  await i18n.changeLanguage("zh-CN")
})

describe("AgentVerdictSection", () => {
  it("opens a fullscreen mobile help overlay with the metric heading and detail content", async () => {
    setViewportWidth(375)
    renderWithProviders(<AgentVerdictSection data={summaryData} />)
    await openSummaryDetails()

    const detailButton = await screen.findByRole("button", { name: /企业年度全用工成本/ })
    fireEvent.click(detailButton)

    const dialog = await screen.findByRole("dialog", { name: "企业年度全用工成本" })
    expect(dialog).toHaveClass("!inset-2")
    expect(dialog).toHaveClass("!h-[calc(100dvh-1rem)]")
    expect(dialog).not.toHaveClass("rounded-t-2xl")

    const formula = within(dialog).getByText("annual-cost-formula")
    expect(formula).toHaveClass("text-xs")
    expect(within(dialog).getByText("annual-cost-explanation")).toBeInTheDocument()
    expect(within(dialog).getByRole("button", { name: "关闭" })).toBeInTheDocument()
  })

  it("supports overlay tap close and explicit close actions on mobile", async () => {
    setViewportWidth(375)
    renderWithProviders(<AgentVerdictSection data={summaryData} />)
    await openSummaryDetails()

    const detailButton = await screen.findByRole("button", { name: /企业年度全用工成本/ })
    fireEvent.click(detailButton)
    await screen.findByRole("dialog", { name: "企业年度全用工成本" })

    const overlay = document.querySelector("[data-slot='dialog-overlay']")
    expect(overlay).not.toBeNull()
    fireEvent.pointerDown(overlay as Element)
    fireEvent.mouseDown(overlay as Element)
    fireEvent.click(overlay as Element)

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      expect(detailButton).toHaveFocus()
    })

    fireEvent.click(detailButton)

    const reopenedDialog = await screen.findByRole("dialog", { name: "企业年度全用工成本" })
    fireEvent.click(within(reopenedDialog).getByRole("button", { name: "关闭" }))

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      expect(detailButton).toHaveFocus()
    })
  })

  it("keeps the desktop tooltip rendering path available outside mobile mode", async () => {
    setViewportWidth(1280)
    renderWithProviders(<AgentVerdictSection data={summaryData} />)
    await openSummaryDetails()

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
