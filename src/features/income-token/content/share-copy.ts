export interface ShareCopyTemplate {
  id: string
  templateZh: string
  templateEn: string
}

export const shareCopyTemplates: ShareCopyTemplate[] = [
  {
    id: "countdown",
    templateZh: "我的 AI 淘汰倒计时还有 {{countdownDays}} 天。企业用我的年度全成本 ¥{{annualCost}}，能买到相当于我 {{efficiencyWeeks}} 周工作量的 AI Token。岗位替代率 {{replacementRate}}%，风险等级：{{riskLevel}}。你也来测测？",
    templateEn: "My AI replacement countdown is {{countdownDays}} days. With my total annual cost of ¥{{annualCost}}, my employer could buy AI tokens equivalent to {{efficiencyWeeks}} weeks of my work. Job replacement rate: {{replacementRate}}%, risk level: {{riskLevel}}. Try it yourself!",
  },
  {
    id: "cost-impact",
    templateZh: "算了一笔账：我的企业年度全用工成本 ¥{{annualCost}}，如果全部用来买 AI Token，DeepSeek 能买到 {{deepSeekTokens}} 万个，GPT 能买 {{gptTokens}} 万个。企业不是养不起我，是 AI 更划算。测测你的 →",
    templateEn: "Fun fact: my total annual employment cost is ¥{{annualCost}}. If spent entirely on AI tokens, that's {{deepSeekTokens}}M DeepSeek tokens or {{gptTokens}}M GPT tokens. It's not that companies can't afford me — AI is just cheaper. Check yours →",
  },
  {
    id: "challenge",
    templateZh: "AI 淘汰倒计时 {{countdownDays}} 天，风险等级 {{riskLevel}}。我反而觉得这是重新定义价值的机会——与其焦虑被替代，不如趁这段时间学会和 AI 协作。你的倒计时是多少？",
    templateEn: "AI replacement countdown: {{countdownDays}} days, risk level {{riskLevel}}. Honestly, I see it as an opportunity to redefine my value — instead of worrying about replacement, I'd rather learn to collaborate with AI. What's your countdown?",
  },
]
