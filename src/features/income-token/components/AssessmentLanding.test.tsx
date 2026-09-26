import { fireEvent, screen, waitFor, within } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import i18n from "@/i18n/config"
import * as regionModule from "@/lib/region"
import { renderWithProviders } from "@/test/render"
import { pricingData } from "@/features/income-token/content/pricing-data"
import { AssessmentLanding } from "./AssessmentLanding"

describe("AssessmentLanding currency flow", () => {
  beforeEach(async () => {
    vi.restoreAllMocks()
    localStorage.clear()
    window.history.replaceState({}, "", "/")
    await i18n.changeLanguage("zh-CN")
    vi.spyOn(regionModule, "detectRegion").mockReturnValue("cn-mainland")
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
      expect(window.location.search).toContain("region=cn-mainland")
    })
  })

  it("restores USD state from URL query parameters", () => {
    window.history.replaceState(
      {},
      "",
      "/?region=cn-mainland&currency=USD&incomePreset=55&income=55&city=tier1&model=gpt-5&multiplier=5&dailyTokens=100",
    )

    renderWithProviders(<AssessmentLanding />)

    expect(screen.getByRole("radio", { name: "美元 USD" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByText("$55k")).toBeInTheDocument()
  })

  it("uses international defaults on first visit when region detection resolves international", async () => {
    vi.spyOn(regionModule, "detectRegion").mockReturnValue("international")

    renderWithProviders(<AssessmentLanding />)

    expect(screen.getByRole("radio", { name: "美元 USD" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByText("$18k")).toBeInTheDocument()
    expect(screen.getByText(/当前默认地区：国际场景/)).toBeInTheDocument()
    expect(screen.getByRole("option", { name: /国际一线都市/ })).toBeInTheDocument()

    await waitFor(() => {
      expect(window.location.search).toContain("region=international")
      expect(window.location.search).toContain("currency=USD")
    })
  })

  it("lets explicit region drive fallback defaults while preserving valid explicit form values", async () => {
    vi.restoreAllMocks()
    window.history.replaceState(
      {},
      "",
      "/?region=international&currency=EUR&incomePreset=55&income=55&city=tier1&model=gpt-5-mini&multiplier=5&dailyTokens=100",
    )

    renderWithProviders(<AssessmentLanding />)

    expect(screen.getByRole("radio", { name: "美元 USD" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByText("$55k")).toBeInTheDocument()
    expect(screen.getByLabelText(/你用的最多的模型是什么/)).toHaveValue("gpt-5-mini")

    await waitFor(() => {
      expect(window.location.search).toContain("region=international")
      expect(window.location.search).toContain("currency=USD")
    })
  })

  it("shows complete English model copy without falling back to Chinese descriptions", async () => {
    vi.spyOn(regionModule, "detectRegion").mockReturnValue("international")
    await i18n.changeLanguage("en-US")

    renderWithProviders(<AssessmentLanding />)

    expect(
      screen.getByRole("option", { name: /OpenAI · GPT-5.4 mini · Previous-generation lightweight coding model.*OpenAI API Pricing/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("option", { name: /DeepSeek · DeepSeek-V4.1-Flash · Off-peak, cache miss.*DeepSeek Models & Pricing/ }),
    ).toBeInTheDocument()
  })

  it("renders every catalog model in the English selector", async () => {
    vi.spyOn(regionModule, "detectRegion").mockReturnValue("international")
    await i18n.changeLanguage("en-US")
    renderWithProviders(<AssessmentLanding />)

    const modelSelector = screen.getByLabelText(/Which model do you use the most/i)
    const optionIds = within(modelSelector)
      .getAllByRole("option")
      .map((option) => (option as HTMLOptionElement).value)
    expect(optionIds).toEqual(pricingData.models.map((model) => model.id))
  })

  it("canonicalizes legacy model query parameters and writes back canonical IDs", async () => {
    window.history.replaceState(
      {},
      "",
      "/?region=cn-mainland&currency=CNY&incomePreset=26&income=26&city=tier1&model=deepseek-v4-flash&multiplier=5&dailyTokens=100",
    )

    renderWithProviders(<AssessmentLanding />)

    expect(screen.getByLabelText(/你用的最多的模型是什么/)).toHaveValue("deepseek-flash")

    await waitFor(() => {
      expect(new URLSearchParams(window.location.search).get("model")).toBe("deepseek-flash")
    })
  })

  it("keeps historical MiniMax links on their matching legacy model", async () => {
    window.history.replaceState(
      {},
      "",
      "/?region=cn-mainland&currency=CNY&incomePreset=26&income=26&city=tier1&model=minimax-m2-5&multiplier=5&dailyTokens=100",
    )

    renderWithProviders(<AssessmentLanding />)

    expect(screen.getByLabelText(/你用的最多的模型是什么/)).toHaveValue("MiniMax-M2.5")

    await waitFor(() => {
      expect(new URLSearchParams(window.location.search).get("model")).toBe("MiniMax-M2.5")
    })
  })
})
