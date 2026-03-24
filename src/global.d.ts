declare const __APP_VERSION__: string

declare module "react-syntax-highlighter" {
  import type { ComponentType, CSSProperties, ReactNode } from "react"

  export interface SyntaxHighlighterProps {
    language?: string
    style?: Record<string, CSSProperties>
    className?: string
    showLineNumbers?: boolean
    wrapLines?: boolean
    lineProps?: ((lineNumber: number) => Record<string, unknown>) | Record<string, unknown>
    children?: ReactNode
  }

  export const Prism: ComponentType<SyntaxHighlighterProps>
}

declare module "react-syntax-highlighter/dist/esm/styles/prism" {
  import type { CSSProperties } from "react"

  export const oneDark: Record<string, CSSProperties>
  export const oneLight: Record<string, CSSProperties>
}
