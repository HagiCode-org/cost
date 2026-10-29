import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest"

import {
  captureSiteEvent,
  sanitize,
  SITE_EVENT_STRING_MAX_LENGTH,
  SITE_POSTHOG_EVENTS,
  type SitePropertySpec,
} from "./posthog-events"

type CaptureFn = (event: string, properties?: Record<string, unknown>) => unknown

type FakePostHog = {
  __loaded?: boolean
  capture: Mock<CaptureFn>
  has_opted_out_capturing?: Mock<() => boolean>
}

function fakePostHog(overrides: Partial<FakePostHog> = {}): FakePostHog {
  return {
    __loaded: true,
    capture: vi.fn<CaptureFn>(),
    has_opted_out_capturing: vi.fn<() => boolean>(() => false),
    ...overrides,
  }
}

const SUPER_PROPERTY_KEYS = ["site_id", "site_framework", "hagilight_version", "locale", "page_type"] as const

// One valid value per allowlisted key, used to build a representative payload for every event.
const VALID_VALUES: Record<string, Record<string, string | boolean>> = {
  assessment_completed: { currency: "CNY", income_preset: "growth", verdict_tone: "warning" },
  assessment_shared: { has_result: true },
  boost_cta_clicked: {},
}

describe("captureSiteEvent", () => {
  beforeEach(() => {
    Reflect.deleteProperty(window, "posthog")
  })

  afterEach(() => {
    Reflect.deleteProperty(window, "posthog")
  })

  it("sends nothing for an event name that is not in the table", () => {
    const posthog = fakePostHog()
    captureSiteEvent("page_viewed", { has_result: true }, { posthog })
    expect(posthog.capture).not.toHaveBeenCalled()
  })

  it("drops keys that are not in the event allowlist and keeps the allowed ones", () => {
    const posthog = fakePostHog()
    captureSiteEvent("assessment_shared", { has_result: false, income: 300000, url: "https://x.test/?a=1" }, { posthog })
    expect(posthog.capture).toHaveBeenCalledWith("assessment_shared", { has_result: false })
  })

  it("drops non-primitive values for allowed keys", () => {
    const posthog = fakePostHog()
    captureSiteEvent("assessment_shared", { has_result: { nested: true } }, { posthog })
    captureSiteEvent("assessment_shared", { has_result: ["true"] }, { posthog })
    captureSiteEvent("assessment_shared", { has_result: null }, { posthog })
    expect(posthog.capture.mock.calls).toEqual([
      ["assessment_shared", {}],
      ["assessment_shared", {}],
      ["assessment_shared", {}],
    ])
  })

  it("drops enumerated values that are not in the enumeration", () => {
    const posthog = fakePostHog()
    captureSiteEvent(
      "assessment_completed",
      { currency: "EUR", income_preset: "45000", verdict_tone: "neutral" },
      { posthog },
    )
    expect(posthog.capture).toHaveBeenCalledWith("assessment_completed", {})
  })

  it("never sends the hagilight super-property keys, even when the caller supplies them", () => {
    const posthog = fakePostHog()
    captureSiteEvent(
      "assessment_completed",
      {
        currency: "USD",
        income_preset: "custom",
        verdict_tone: "safe",
        site_id: "cost",
        site_framework: "astro",
        hagilight_version: "0.18.0",
        locale: "en-US",
        page_type: "home",
      },
      { posthog },
    )
    const sent = posthog.capture.mock.calls[0]?.[1] as Record<string, unknown>
    for (const key of SUPER_PROPERTY_KEYS) {
      expect(sent).not.toHaveProperty(key)
    }
    expect(sent).toEqual({ currency: "USD", income_preset: "custom", verdict_tone: "safe" })
  })

  it("sends nothing and does not throw when window.posthog is undefined", () => {
    expect(() => captureSiteEvent("boost_cta_clicked")).not.toThrow()
  })

  it("reads window.posthog when no posthog option is passed", () => {
    const posthog = fakePostHog()
    ;(window as unknown as { posthog?: FakePostHog }).posthog = posthog
    captureSiteEvent("assessment_shared", { has_result: true })
    expect(posthog.capture).toHaveBeenCalledWith("assessment_shared", { has_result: true })
  })

  it("sends nothing when the posthog option is null", () => {
    expect(() => captureSiteEvent("boost_cta_clicked", {}, { posthog: null })).not.toThrow()
  })

  it("queues on the stub without asking opt-out state while __loaded is not true", () => {
    const posthog = fakePostHog({ __loaded: false, has_opted_out_capturing: vi.fn(() => true) })
    captureSiteEvent("assessment_shared", { has_result: true }, { posthog })
    expect(posthog.capture).toHaveBeenCalledWith("assessment_shared", { has_result: true })
    expect(posthog.has_opted_out_capturing).not.toHaveBeenCalled()
  })

  it("sends nothing once loaded when the visitor has opted out", () => {
    const posthog = fakePostHog({ __loaded: true, has_opted_out_capturing: vi.fn(() => true) })
    captureSiteEvent("assessment_shared", { has_result: true }, { posthog })
    expect(posthog.has_opted_out_capturing).toHaveBeenCalledTimes(1)
    expect(posthog.capture).not.toHaveBeenCalled()
  })

  it("sends when loaded and not opted out", () => {
    const posthog = fakePostHog()
    captureSiteEvent("boost_cta_clicked", {}, { posthog })
    expect(posthog.capture).toHaveBeenCalledWith("boost_cta_clicked", {})
  })

  it("sends nothing when the consent gate says no, and sends when it says yes", () => {
    const posthog = fakePostHog()
    captureSiteEvent("boost_cta_clicked", {}, { posthog, isAllowed: () => false })
    expect(posthog.capture).not.toHaveBeenCalled()
    captureSiteEvent("boost_cta_clicked", {}, { posthog, isAllowed: () => true })
    expect(posthog.capture).toHaveBeenCalledTimes(1)
  })

  it("returns normally when capture throws", () => {
    const posthog = fakePostHog({
      capture: vi.fn(() => {
        throw new Error("network down")
      }),
    })
    expect(() => captureSiteEvent("assessment_shared", { has_result: true }, { posthog })).not.toThrow()
  })

  it("returns normally when the consent gate throws", () => {
    const posthog = fakePostHog()
    expect(() =>
      captureSiteEvent("boost_cta_clicked", {}, {
        posthog,
        isAllowed: () => {
          throw new Error("consent store unavailable")
        },
      }),
    ).not.toThrow()
    expect(posthog.capture).not.toHaveBeenCalled()
  })
})

describe("sanitize", () => {
  it("caps string values at the maximum length", () => {
    const spec: Record<string, SitePropertySpec> = { label: { kind: "string" } }
    const out = sanitize(spec, { label: "x".repeat(SITE_EVENT_STRING_MAX_LENGTH + 72) })
    expect(out.label).toBe("x".repeat(SITE_EVENT_STRING_MAX_LENGTH))
  })

  it("keeps a string at exactly the maximum length unchanged", () => {
    const spec: Record<string, SitePropertySpec> = { label: { kind: "string" } }
    const value = "y".repeat(SITE_EVENT_STRING_MAX_LENGTH)
    expect(sanitize(spec, { label: value }).label).toBe(value)
  })

  it("keeps only non-negative integers for count keys", () => {
    const spec: Record<string, SitePropertySpec> = { n: { kind: "count" } }
    expect(sanitize(spec, { n: 3 })).toEqual({ n: 3 })
    expect(sanitize(spec, { n: -1 })).toEqual({})
    expect(sanitize(spec, { n: 1.5 })).toEqual({})
    expect(sanitize(spec, { n: Number.NaN })).toEqual({})
  })
})

describe("SITE_POSTHOG_EVENTS table", () => {
  it("names every event snake_case with the object first and forbids super-property keys", () => {
    for (const [name, allowed] of Object.entries(SITE_POSTHOG_EVENTS)) {
      expect(name).toMatch(/^[a-z]+(_[a-z]+)+$/)
      for (const key of Object.keys(allowed)) {
        expect(SUPER_PROPERTY_KEYS).not.toContain(key)
      }
    }
  })

  it("sends exactly the allowlisted set for a representative input containing URLs, free text and super properties", () => {
    const hostile = {
      url: "https://cost.hagicode.com/?income=123456&currency=CNY#result",
      note: "my salary is 250000 CNY and my API key is sk-secret",
      site_id: "cost",
      site_framework: "astro",
      hagilight_version: "0.18.0",
      locale: "zh-CN",
      page_type: "home",
      income: 250000,
    }

    for (const [name, allowed] of Object.entries(SITE_POSTHOG_EVENTS)) {
      const posthog = fakePostHog()
      captureSiteEvent(name, { ...VALID_VALUES[name], ...hostile }, { posthog })

      expect(posthog.capture).toHaveBeenCalledTimes(1)
      const [sentName, sent] = posthog.capture.mock.calls[0] as [string, Record<string, unknown>]
      expect(sentName).toBe(name)
      expect(Object.keys(sent).sort()).toEqual(Object.keys(allowed).sort())
      for (const key of Object.keys(allowed)) {
        expect(sent[key]).toEqual(VALID_VALUES[name][key])
      }
      expect(JSON.stringify(sent)).not.toMatch(/https?:|250000|123456|sk-secret|my salary/)
    }
  })
})
