import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"

const loadingSteps = [
  "loading.steps.cost",
  "loading.steps.pricing",
  "loading.steps.replacement",
  "loading.steps.timeline",
] as const

export function LoadingSequenceOverlay() {
  const { t } = useTranslation()
  const [stepIndex, setStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const stepDuration = 600
    const totalSteps = loadingSteps.length

    const interval = setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1
        if (next >= totalSteps) return prev
        return next
      })
    }, stepDuration)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const totalSteps = loadingSteps.length
    const stepDuration = 600
    const targetProgress = ((stepIndex + 1) / totalSteps) * 100

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= targetProgress) return prev
        return Math.min(prev + 2, targetProgress)
      })
    }, stepDuration / 50)

    return () => clearInterval(interval)
  }, [stepIndex])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="glass-panel surface-outline w-full max-w-md rounded-[2rem] p-8 text-center">
        <Loader2 className="mx-auto size-10 animate-spin text-primary" aria-hidden="true" />
        <h2 className="mt-4 text-lg font-semibold">{t("loading.title")}</h2>
        <div className="mt-6 space-y-3">
          {loadingSteps.map((stepKey, index) => (
            <p
              key={stepKey}
              className={`text-sm transition-all duration-300 ${
                index <= stepIndex
                  ? "text-foreground"
                  : "text-muted-foreground/40"
              }`}
            >
              {index <= stepIndex ? (
                <span className="mr-2 text-primary">{index < stepIndex ? "\u2713" : "\u25B6"}</span>
              ) : null}
              {t(stepKey)}
            </p>
          ))}
        </div>
        <Progress value={progress} className="mt-6 h-2" />
      </div>
    </div>
  )
}
