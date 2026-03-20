import { fireEvent, screen, waitFor, within } from "@testing-library/react"
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"

import { HomeHeader } from "./HomeHeader"
import i18n from "@/i18n/config"
import { renderWithProviders } from "@/test/render"
import { installViewportMock, setViewportWidth } from "@/test/viewport"

beforeAll(() => {
  installViewportMock()
})

beforeEach(async () => {
  localStorage.clear()
  document.documentElement.className = ""
  document.body.innerHTML = ""
  window.history.replaceState({}, "", "/")
  setViewportWidth(375)

  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  })

  await i18n.changeLanguage("zh-CN")
})

describe("HomeHeader", () => {
  it("renders a compact mobile header with a navigation sheet that keeps share feedback visible", async () => {
    renderWithProviders(<HomeHeader />)

    const menuButton = await screen.findByRole("button", { name: "首页导航" })
    expect(screen.getByText("我会被AI替代吗")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^EN$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "切换主题" })).toBeInTheDocument()

    fireEvent.click(menuButton)

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText("我会被AI替代吗")).toBeInTheDocument()
    expect(within(dialog).getByText(/相关链接如下/)).toBeInTheDocument()
    expect(within(dialog).queryByRole("button", { name: /^EN$/i })).not.toBeInTheDocument()
    expect(within(dialog).queryByRole("button", { name: "切换主题" })).not.toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole("button", { name: "复制当前页面链接" }))

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining("lang=zh-CN"))
    })
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("keeps language and theme toggles in the mobile header instead of the sheet", async () => {
    renderWithProviders(<HomeHeader />)

    fireEvent.click(screen.getByRole("button", { name: /^EN$/i }))
    expect(await screen.findByText("Will AI Replace Me?")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }))
    expect(document.documentElement).toHaveClass("dark")

    fireEvent.click(screen.getByRole("button", { name: "Homepage navigation" }))
    const dialog = await screen.findByRole("dialog")

    expect(within(dialog).queryByRole("button", { name: /^EN$/i })).not.toBeInTheDocument()
    expect(within(dialog).queryByRole("button", { name: "Toggle theme" })).not.toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole("button", { name: "Copy the current page link" }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("supports overlay close, escape close, and viewport transitions back to desktop", async () => {
    renderWithProviders(<HomeHeader />)

    fireEvent.click(await screen.findByRole("button", { name: "首页导航" }))
    await screen.findByRole("dialog")

    const overlay = document.querySelector("[data-slot='sheet-overlay']")
    expect(overlay).not.toBeNull()
    fireEvent.pointerDown(overlay as Element)
    fireEvent.mouseDown(overlay as Element)
    fireEvent.click(overlay as Element)

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: "首页导航" }))
    await screen.findByRole("dialog")
    fireEvent.keyDown(document, { key: "Escape" })

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    setViewportWidth(1280)

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^EN$/i })).toBeInTheDocument()
    })
    expect(screen.queryByRole("button", { name: "首页导航" })).not.toBeInTheDocument()

    setViewportWidth(375)

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "首页导航" })).toBeInTheDocument()
    })
  })
})
