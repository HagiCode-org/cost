import { fireEvent, screen, waitFor, within } from "@testing-library/react"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

import type { ResultViewModel } from "@/features/income-token/lib/build-result-view-model"
import i18n from "@/i18n/config"
import { renderWithProviders } from "@/test/render"
import { installViewportMock, setViewportWidth } from "@/test/viewport"
import { AgentVerdictSection } from "./AgentVerdictSection"

const summaryData = {
  selectedModelName: "Claude Sonnet",
  effectivePeopleEquivalentFormatted: "2.40 人",
  selectedModelDescription: "A strong coding model for daily workflows.",
  annualIncomeFormatted: "¥300,000",
  cityLabel: "Shanghai",
  annualTotalCostFormatted: "¥420,000",
  annualTotalCostFormula: "annual-cost-formula",
  annualTotalCostExplanation: "annual-cost-explanation",
  performanceMultiplierFormatted: "2.50x",
  performanceMultiplierExplanation: "performance-multiplier-explanation",
  dailyTokenUsageFormatted: "12 M",
  dailyTokenUsageExplanation: "daily-token-usage-explanation",
  annualAiCostFormatted: "¥36,000",
  annualAiCostFormula: "annual-ai-cost-formula",
  annualAiCostExplanation: "annual-ai-cost-explanation",
  dailyAiCostFormatted: "¥120",
  dailyAiCostFormula: "daily-ai-cost-formula",
  dailyAiCostExplanation: "daily-ai-cost-explanation",
  aiCostShareFormatted: "12%",
  aiCostShareFormula: "salary-share-formula",
  aiCostShareExplanation: "salary-share-explanation",
  costEffectivenessFormatted: "3.8x",
  costEffectivenessFormula: "cost-effectiveness-formula",
  costEffectivenessExplanation: "cost-effectiveness-explanation",
  affordableWorkflowCountFormatted: "14.00 份",
  affordableWorkflowFormula: "affordable-workflow-formula",
  affordableWorkflowExplanation: "affordable-workflow-explanation",
  effectivePeopleEquivalentFormula: "people-equivalent-formula",
  effectivePeopleEquivalentExplanation: "people-equivalent-explanation",
  dangerScalePosition: 80,
  dangerScaleLabel: "高危区",
  dangerScaleSummary: "danger-summary",
  costEffectivenessScalePosition: 72,
  costEffectivenessScaleLabel: "很划算",
  costEffectivenessScaleSummary: "roi-summary",
  verdictHeadline: "verdict-headline",
  verdictBody: "verdict-body",
  verdictTone: "danger",
  shareCopy: "share-copy",
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

    const detailButton = await screen.findByRole("button", { name: "查看企业年度全用工成本的计算详情" })
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

    const detailButton = await screen.findByRole("button", { name: "查看企业年度全用工成本的计算详情" })
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

    const detailButton = await screen.findByRole("button", { name: "查看企业年度全用工成本的计算详情" })
    fireEvent.focus(detailButton)

    const desktopTooltipFormulas = await screen.findAllByText("annual-cost-formula")
    expect(desktopTooltipFormulas.length).toBeGreaterThan(0)

    fireEvent.blur(detailButton)

    await waitFor(() => {
      expect(screen.queryAllByText("annual-cost-formula")).toHaveLength(0)
    })
  })

  it("renders currency-formatted summary amounts without hardcoded CNY prefixes", async () => {
    setViewportWidth(1280)
    renderWithProviders(
      <AgentVerdictSection
        data={{
          ...summaryData,
          annualIncomeFormatted: "$41,379",
          annualTotalCostFormatted: "$58,276",
          annualAiCostFormatted: "$4,831",
          dailyAiCostFormatted: "$18.30",
          affordableWorkflowCountFormatted: "12.00 workflows",
          effectivePeopleEquivalentFormatted: "2.40 workers",
        }}
      />,
    )
    await openSummaryDetails()

    expect(screen.getByText("$41,379")).toBeInTheDocument()
    expect(screen.getByText("$58,276")).toBeInTheDocument()
    expect(screen.getByText("$4,831")).toBeInTheDocument()
    expect(screen.getByText("$18.30")).toBeInTheDocument()
    expect(screen.getByText("12.00 workflows")).toBeInTheDocument()
    expect(screen.getAllByText("2.40 workers").length).toBeGreaterThan(0)
  })
})
