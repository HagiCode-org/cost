import { fireEvent, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import { HomePage } from "./HomePage"
import i18n from "@/i18n/config"
import { renderWithProviders } from "@/test/render"

beforeEach(() => {
  localStorage.clear()
  document.head.innerHTML = ""
  void i18n.changeLanguage("zh-CN")
})

describe("HomePage", () => {
  it("renders the launch homepage with hero and blueprint placeholders", () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByRole("heading", { level: 1, name: "我会被AI替代吗" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "查看首版结构" })).toBeDisabled()
    expect(screen.getByLabelText("岗位或角色")).toBeInTheDocument()
  })

  it("switches the page copy to English", async () => {
    renderWithProviders(<HomePage />)

    fireEvent.click(screen.getByRole("button", { name: /EN/i }))

    expect(await screen.findByRole("heading", { level: 1, name: "Will AI Replace Me?" })).toBeInTheDocument()
    expect(document.title).toContain("Will AI Replace Me?")
  })
})
