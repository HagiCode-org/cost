import { fireEvent, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import i18n from "@/i18n/config"
import { renderWithProviders } from "@/test/render"
import { AssessmentLanding } from "./AssessmentLanding"

describe("AssessmentLanding currency flow", () => {
  beforeEach(async () => {
    localStorage.clear()
    window.history.replaceState({}, "", "/")
    await i18n.changeLanguage("zh-CN")
  })

  it("switches between CNY and USD presets while syncing URL state", async () => {
    renderWithProviders(<AssessmentLanding />)

    const cnyButton = screen.getByRole("radio", { name: "人民币 CNY" })
    const usdButton = screen.getByRole("radio", { name: "美元 USD" })

    expect(cnyButton).toHaveAttribute("aria-checked", "true")
    expect(screen.getByText("13 万")).toBeInTheDocument()

    fireEvent.click(usdButton)

    expect(usdButton).toHaveAttribute("aria-checked", "true")
    expect(screen.getByText("$18k")).toBeInTheDocument()
    expect(screen.getByText(/当前输入单位：千美元/)).toBeInTheDocument()

    await waitFor(() => {
      expect(window.location.search).toContain("currency=USD")
    })
  })

  it("restores USD state from URL query parameters", () => {
    window.history.replaceState(
      {},
      "",
      "/?currency=USD&incomePreset=55&income=55&city=tier1&model=gpt-5&multiplier=5&dailyTokens=100",
    )

    renderWithProviders(<AssessmentLanding />)

    expect(screen.getByRole("radio", { name: "美元 USD" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByText("$55k")).toBeInTheDocument()
  })

  it("falls back to CNY when the currency query parameter is invalid", async () => {
    window.history.replaceState(
      {},
      "",
      "/?currency=EUR&incomePreset=55&income=55&city=tier1&model=gpt-5&multiplier=5&dailyTokens=100",
    )

    renderWithProviders(<AssessmentLanding />)

    expect(screen.getByRole("radio", { name: "人民币 CNY" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByText("13 万")).toBeInTheDocument()

    await waitFor(() => {
      expect(window.location.search).toContain("currency=CNY")
    })
  })
})
