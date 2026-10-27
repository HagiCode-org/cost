import { act, cleanup, fireEvent, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import i18n from "@/i18n/config"
import { renderWithProviders } from "@/test/render"
import type { EvaluationInput } from "@/features/income-token/lib/calculate-ai-risk"
import { HagicodeBoostSection } from "./HagicodeBoostSection"

type FakePostHog = {
  __loaded: boolean
  capture: ReturnType<typeof vi.fn>
  has_opted_out_capturing: ReturnType<typeof vi.fn>
}

const baseInput: EvaluationInput = {
  annualIncomeCny: 300_000,
  cityTier: "tier1",
  modelId: "gpt-5",
  performanceMultiplier: 2.5,
  dailyTokenUsageM: 12,
}

function setClipboard(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  })
}

describe("HagicodeBoostSection boost_cta_clicked", () => {
  let fake: FakePostHog

  beforeEach(async () => {
    await i18n.changeLanguage("zh-CN")
    fake = {
      __loaded: true,
      capture: vi.fn(),
      has_opted_out_capturing: vi.fn(() => false),
    }
    ;(window as unknown as { posthog?: FakePostHog }).posthog = fake
  })

  afterEach(() => {
    cleanup()
    Reflect.deleteProperty(window, "posthog")
    Reflect.deleteProperty(navigator, "clipboard")
  })

  function shareButton() {
    return screen.getByRole("button", { name: i18n.t("share.currentSiteAria") })
  }

  it("sends nothing on render", () => {
    setClipboard(vi.fn(async () => undefined))
    renderWithProviders(<HagicodeBoostSection baseInput={baseInput} selectedCurrency="CNY" region="cn-mainland" />)

    expect(fake.capture).not.toHaveBeenCalled()
  })

  it("sends boost_cta_clicked with no properties and assessment_shared with has_result true when the share succeeds", async () => {
    setClipboard(vi.fn(async () => undefined))
    renderWithProviders(<HagicodeBoostSection baseInput={baseInput} selectedCurrency="CNY" region="cn-mainland" />)

    await act(async () => {
      fireEvent.click(shareButton())
    })

    const boostCalls = fake.capture.mock.calls.filter(([name]) => name === "boost_cta_clicked")
    expect(boostCalls).toEqual([["boost_cta_clicked", {}]])
    expect(fake.capture).toHaveBeenCalledWith("assessment_shared", { has_result: true })
    expect(fake.capture).toHaveBeenCalledTimes(2)
  })

  it("still sends boost_cta_clicked when the share fails, but sends no assessment_shared", async () => {
    setClipboard(vi.fn(async () => {
      throw new Error("permission denied")
    }))
    renderWithProviders(<HagicodeBoostSection baseInput={baseInput} selectedCurrency="CNY" region="cn-mainland" />)

    await act(async () => {
      fireEvent.click(shareButton())
    })

    expect(fake.capture.mock.calls).toEqual([["boost_cta_clicked", {}]])
  })
})
