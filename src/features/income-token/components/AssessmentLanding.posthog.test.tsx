import { cleanup, fireEvent, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ThemeProvider } from "@/contexts/theme-context"
import i18n from "@/i18n/config"
import * as regionModule from "@/lib/region"
import { store } from "@/lib/store"
import { renderWithProviders } from "@/test/render"
import { AssessmentLanding } from "./AssessmentLanding"

type FakePostHog = {
  __loaded: boolean
  capture: ReturnType<typeof vi.fn>
  has_opted_out_capturing: ReturnType<typeof vi.fn>
}

function installFakePostHog(): FakePostHog {
  const fake: FakePostHog = {
    __loaded: true,
    capture: vi.fn(),
    has_opted_out_capturing: vi.fn(() => false),
  }
  ;(window as unknown as { posthog?: FakePostHog }).posthog = fake
  return fake
}

function completedCalls(fake: FakePostHog) {
  return fake.capture.mock.calls.filter(([name]) => name === "assessment_completed")
}

function setUrl(query: string) {
  window.history.replaceState({}, "", `/${query}`)
}

// Zero daily tokens produces no result. The first valid value typed after that is the first
// produced result after an interaction, which is the event trigger.
const INVALID_START = "?region=cn-mainland&currency=CNY&incomePreset=26&income=26&city=tier1&model=gpt-5&multiplier=5&dailyTokens=0"
// Daily tokens above zero already shows a result on the initial render, so no event is expected until an input changes.
const VALID_START = "?region=cn-mainland&currency=CNY&incomePreset=26&income=26&city=tier1&model=gpt-5&multiplier=5&dailyTokens=100"

function typeDailyTokens(value: string) {
  const input = document.getElementById("daily-token-usage") as HTMLInputElement
  fireEvent.change(input, { target: { value } })
}

function changeModelToAnotherOption() {
  const select = document.getElementById("model-id") as HTMLSelectElement
  const other = Array.from(select.options).find((option) => option.value !== select.value)
  if (!other) throw new Error("expected a second model option")
  fireEvent.change(select, { target: { value: other.value } })
}

describe("AssessmentLanding assessment_completed", () => {
  let fake: FakePostHog

  beforeEach(async () => {
    vi.restoreAllMocks()
    localStorage.clear()
    setUrl("")
    await i18n.changeLanguage("zh-CN")
    vi.spyOn(regionModule, "detectRegion").mockReturnValue("cn-mainland")
    fake = installFakePostHog()
  })

  afterEach(() => {
    cleanup()
    Reflect.deleteProperty(window, "posthog")
  })

  it("sends nothing on the initial default render", () => {
    setUrl("")
    renderWithProviders(<AssessmentLanding />)

    expect(completedCalls(fake)).toHaveLength(0)
  })

  it("sends one event with the preset key and no amount on the first completion", () => {
    setUrl(INVALID_START)
    renderWithProviders(<AssessmentLanding />)

    expect(completedCalls(fake)).toHaveLength(0)

    typeDailyTokens("100")

    expect(completedCalls(fake)).toHaveLength(1)
    const [, properties] = completedCalls(fake)[0] as [string, Record<string, unknown>]
    expect(Object.keys(properties).sort()).toEqual(["currency", "income_preset", "verdict_tone"])
    expect(properties).toMatchObject({ currency: "CNY", income_preset: "growth" })
    expect(["safe", "warning", "danger"]).toContain(properties.verdict_tone)
  })

  it("sends one event on the first edit of a page that already shows a result", () => {
    setUrl(VALID_START)
    renderWithProviders(<AssessmentLanding />)
    expect(completedCalls(fake)).toHaveLength(0)

    typeDailyTokens("250")

    expect(completedCalls(fake)).toHaveLength(1)
  })

  it("sends nothing when the result re-renders without a new completion", () => {
    setUrl(INVALID_START)
    const view = renderWithProviders(<AssessmentLanding />)
    typeDailyTokens("100")
    expect(completedCalls(fake)).toHaveLength(1)

    view.rerender(
      <Provider store={store}>
        <ThemeProvider defaultTheme="light">
          <AssessmentLanding />
        </ThemeProvider>
      </Provider>,
    )
    fireEvent.click(screen.getByRole("radio", { name: "人民币 CNY" }))

    expect(completedCalls(fake)).toHaveLength(1)
  })

  it("sends nothing when a second distinct result appears in the same page session", () => {
    setUrl(VALID_START)
    renderWithProviders(<AssessmentLanding />)

    typeDailyTokens("250")
    expect(completedCalls(fake)).toHaveLength(1)

    typeDailyTokens("80")
    changeModelToAnotherOption()

    expect(completedCalls(fake)).toHaveLength(1)
  })

  it("sends nothing for a rejected or absent result, and the first produced result afterwards still sends once", () => {
    setUrl(INVALID_START)
    renderWithProviders(<AssessmentLanding />)

    typeDailyTokens("0")
    typeDailyTokens("-5")
    typeDailyTokens("")

    expect(completedCalls(fake)).toHaveLength(0)

    typeDailyTokens("100")

    expect(completedCalls(fake)).toHaveLength(1)
  })

  it("sends nothing when the page opens on an already completed result, including when it is opened again", () => {
    setUrl(VALID_START)
    const first = renderWithProviders(<AssessmentLanding />)
    first.unmount()

    renderWithProviders(<AssessmentLanding />)

    expect(completedCalls(fake)).toHaveLength(0)
  })

  it("sends nothing on a returning visit whose result was already produced before this mount", () => {
    setUrl(INVALID_START)
    const first = renderWithProviders(<AssessmentLanding />)
    typeDailyTokens("100")
    expect(completedCalls(fake)).toHaveLength(1)
    first.unmount()

    setUrl(VALID_START)
    renderWithProviders(<AssessmentLanding />)

    expect(completedCalls(fake)).toHaveLength(1)
  })

  it.each(["1", "45", "1234567", "250000000"])(
    "reports a typed custom income of %s only as the literal custom",
    (amount) => {
      cleanup()
      fake.capture.mockClear()
      setUrl(`?region=cn-mainland&currency=CNY&incomePreset=custom&income=${amount}&city=tier1&model=gpt-5&multiplier=5&dailyTokens=0`)
      renderWithProviders(<AssessmentLanding />)

      typeDailyTokens("100")

      const calls = completedCalls(fake)
      expect(calls).toHaveLength(1)
      const [, properties] = calls[0] as [string, Record<string, unknown>]
      expect(properties).toMatchObject({ currency: "CNY", income_preset: "custom" })
      expect(JSON.stringify(fake.capture.mock.calls)).not.toContain(amount)
    },
  )

  it("never includes a numeric income in any captured payload, including after later edits", () => {
    setUrl(INVALID_START)
    renderWithProviders(<AssessmentLanding />)
    typeDailyTokens("100")
    typeDailyTokens("250")
    typeDailyTokens("0")
    typeDailyTokens("80")

    expect(completedCalls(fake)).toHaveLength(1)
    for (const [, payload] of fake.capture.mock.calls) {
      expect(JSON.stringify(payload)).not.toMatch(/\d{2,}/)
    }
  })
})
