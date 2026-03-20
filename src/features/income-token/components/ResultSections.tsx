import type { ResultViewModel } from "@/features/income-token/lib/build-result-view-model"
import type { EvaluationInput } from "@/features/income-token/lib/calculate-ai-risk"
import { AgentVerdictSection } from "./AgentVerdictSection"
import { HagicodeBoostSection } from "./HagicodeBoostSection"
import { CostImpactSection } from "./CostImpactSection"
import { TokenCeilingListSection } from "./TokenCeilingListSection"
import { ComplianceFooterSection } from "./ComplianceFooterSection"

interface ResultSectionsProps {
  result: ResultViewModel
  baseInput: EvaluationInput
}

export function ResultSections({ result, baseInput }: ResultSectionsProps) {
  return (
    <div className="space-y-6 px-4 pt-8 sm:px-6">
      <AgentVerdictSection data={result.summarySection} />
      <HagicodeBoostSection baseInput={baseInput} />
      <CostImpactSection data={result.costSection} />
      <TokenCeilingListSection data={result.tokenListSection} />
      <ComplianceFooterSection data={result.dataDisclaimer} />
    </div>
  )
}
