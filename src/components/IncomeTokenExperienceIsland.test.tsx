import { act } from "react"
import { waitFor } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { hydrateRoot, type Root } from "react-dom/client"
import { beforeEach, describe, expect, it, vi } from "vitest"

import IncomeTokenExperienceIsland from "@/components/IncomeTokenExperienceIsland"
import i18n, { defaultLanguage } from "@/i18n/config"

describe("IncomeTokenExperienceIsland SSR", () => {
  beforeEach(async () => {
    localStorage.clear()
    localStorage.setItem("cost-language", "en-US")
    localStorage.setItem("theme", "dark")
    window.history.replaceState({}, "", "/?lang=fr-FR&theme=dark&region=cn-mainland&currency=USD")
    await i18n.changeLanguage(defaultLanguage)
  })

  it("renders the default locale and deterministic form before applying browser preferences", () => {
    const html = renderToString(<IncomeTokenExperienceIsland />)

    expect(html).toContain("Agent 时代，你会不会被淘汰")
    expect(html).toContain("你的年薪是")
    expect(html).not.toContain("Will AI Replace Me?")
    expect(i18n.resolvedLanguage).toBe(defaultLanguage)
  })

  it("hydrates without mismatches before applying query locale and theme preferences", async () => {
    const container = document.createElement("div")
    container.innerHTML = renderToString(<IncomeTokenExperienceIsland />)
    const onRecoverableError = vi.fn()
    let root: Root | null = null

    await act(async () => {
      root = hydrateRoot(container, <IncomeTokenExperienceIsland />, { onRecoverableError })
    })

    await waitFor(() => {
      expect(i18n.resolvedLanguage).toBe("fr-FR")
      expect(document.documentElement).toHaveClass("dark")
    })

    expect(localStorage.getItem("cost-language")).toBe("fr-FR")
    expect(onRecoverableError).not.toHaveBeenCalled()

    await act(async () => {
      root?.unmount()
    })
  })
})
