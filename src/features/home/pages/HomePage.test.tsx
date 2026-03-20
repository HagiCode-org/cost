import { fireEvent, screen, within } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { HomePage } from "./HomePage"
import i18n from "@/i18n/config"
import { formatAppVersion, getAppVersion } from "@/lib/version"
import { renderWithProviders } from "@/test/render"

beforeEach(() => {
  localStorage.clear()
  document.head.innerHTML = ""
  window.history.replaceState({}, "", "/")
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  })
  void i18n.changeLanguage("zh-CN")
})

describe("HomePage", () => {
  it("renders the assessment landing form", () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByRole("heading", { level: 1, name: /Agent 时代，你会不会被淘汰/ })).toBeInTheDocument()
    expect(screen.getByLabelText(/你的年薪是/)).toBeInTheDocument()
    expect(screen.getByText(`版本 ${formatAppVersion(getAppVersion())}`)).toBeInTheDocument()
  })

  it("switches the page copy to English", async () => {
    renderWithProviders(<HomePage />)

    fireEvent.click(screen.getByRole("button", { name: /^EN$/i }))

    expect(await screen.findByRole("heading", { level: 1, name: /Calculate whether the Agent era makes you replaceable/i })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 3, name: "Smart" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 3, name: "Efficient" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 3, name: "Interesting" })).toBeInTheDocument()
  })

  it("hydrates the form from query parameters", () => {
    window.history.replaceState(
      {},
      "",
      "/?incomePreset=40&income=40&city=tier2&model=deepseek-v3&multiplier=3&dailyTokens=120"
    )

    renderWithProviders(<HomePage />)

    expect(screen.getByRole("radio", { name: "40 万" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByLabelText(/你的城市更接近哪座典型城市/)).toHaveValue("tier2")
    expect(screen.getByLabelText(/你用的最多的模型是什么/)).toHaveValue("deepseek-v3")
    expect(screen.getByLabelText(/用了这个模型，你的效率是以前的几倍/)).toHaveValue(3)
    expect(screen.getByLabelText(/这个模型你每天大概需要多少 M Token/)).toHaveValue(120)
  })

  it("writes the current selections into the query string", () => {
    renderWithProviders(<HomePage />)

    fireEvent.click(screen.getByRole("radio", { name: "60 万" }))
    fireEvent.change(screen.getByLabelText(/这个模型你每天大概需要多少 M Token/), {
      target: { value: "180" },
    })

    const params = new URLSearchParams(window.location.search)
    expect(params.get("incomePreset")).toBe("60")
    expect(params.get("income")).toBe("60")
    expect(params.get("dailyTokens")).toBe("180")
  })

  it("copies the current page link from the header share button", async () => {
    renderWithProviders(<HomePage />)

    fireEvent.click(screen.getByRole("button", { name: "复制当前页面链接" }))

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("lang=zh-CN")
    )
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("theme=light")
    )
    expect(await screen.findByRole("button", { name: "复制当前页面链接" })).toHaveTextContent("链接已复制")
  })

  it("renders share buttons for the agent report and Hagicode boost panels", () => {
    renderWithProviders(<HomePage />)

    expect(screen.getAllByRole("button", { name: "复制当前页面链接，并包含语言与主题设置" })).toHaveLength(2)
  })

  it("shows filing links sourced for the footer registration area", () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByRole("link", { name: "查看 ICP 备案信息" })).toHaveAttribute("href", "https://beian.miit.gov.cn/")
    expect(screen.getByRole("link", { name: "查看公安备案信息" })).toHaveAttribute(
      "href",
      "http://www.beian.gov.cn/portal/registerSystemInfo",
    )
  })

  it("renders the Hagicode feature showcase before the footer with all three panels", () => {
    renderWithProviders(<HomePage />)

    const showcaseTitle = screen.getByRole("heading", { level: 2, name: "HagiCode 三大核心能力" })
    const showcase = showcaseTitle.closest("section")
    const footer = screen.getByRole("contentinfo")

    expect(showcase).not.toBeNull()
    const showcaseElement = showcase as HTMLElement
    expect(
      showcaseElement.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()

    const showcaseScope = within(showcaseElement)
    expect(showcaseScope.getByRole("heading", { level: 3, name: "智能" })).toBeInTheDocument()
    expect(showcaseScope.getByRole("heading", { level: 3, name: "高效" })).toBeInTheDocument()
    expect(showcaseScope.getByRole("heading", { level: 3, name: "有趣" })).toBeInTheDocument()
  })
})
