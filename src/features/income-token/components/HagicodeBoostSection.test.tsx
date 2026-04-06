import { screen } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import { HagicodeBoostSection } from "./HagicodeBoostSection"
import i18n from "@/i18n/config"
import { renderWithProviders } from "@/test/render"
import type { EvaluationInput } from "@/features/income-token/lib/calculate-ai-risk"

const baseInput: EvaluationInput = {
  annualIncomeCny: 300_000,
  cityTier: "tier1",
  modelId: "gpt-5",
  performanceMultiplier: 2.5,
  dailyTokenUsageM: 12,
}

describe("HagicodeBoostSection", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("zh-CN")
  })

  it("repeats the boosted final verdict inside the agent report panel and the standalone conclusion panel", () => {
    renderWithProviders(
      <HagicodeBoostSection
        baseInput={baseInput}
        selectedCurrency="CNY"
        region="cn-mainland"
      />,
    )

    expect(screen.getByText("套上 Hagicode 之后")).toBeInTheDocument()
  })
})
