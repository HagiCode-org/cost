export type CityTier = "tier1" | "new-tier1" | "tier2" | "other"

export type JobFamily =
  | "backend"
  | "frontend"
  | "qa"
  | "product"
  | "ui"
  | "operations"
  | "admin"
  | "other"

export interface CityCoefficient {
  tier: CityTier
  label: string
  coefficient: number
}

export interface JobBenchmark {
  family: JobFamily
  label: string
  replacementRate: number
  averageMonthlyCost: number
  aiAdoptionRate: number
  headcountReduction: number
}

export interface IndustryRanking {
  rank: number
  industry: string
  riskTrend: "red" | "black"
  description: string
}

export interface BenchmarkData {
  cityCoefficients: CityCoefficient[]
  jobBenchmarks: JobBenchmark[]
  industryRankings: IndustryRanking[]
  riskPercentileThresholds: {
    extreme: number
    high: number
    medium: number
  }
  minCountdownDays: number
  updatedAt: string
  source: string
}

export const benchmarkData: BenchmarkData = {
  cityCoefficients: [
    { tier: "tier1", label: "北京 / 上海 / 深圳 / 广州", coefficient: 0.4 },
    { tier: "new-tier1", label: "杭州 / 成都 / 苏州 / 南京", coefficient: 0.3 },
    { tier: "tier2", label: "武汉 / 西安 / 天津 / 郑州", coefficient: 0.2 },
    { tier: "other", label: "宜昌 / 洛阳 / 南充 / 上饶", coefficient: 0.1 },
  ],
  jobBenchmarks: [
    {
      family: "backend",
      label: "后端",
      replacementRate: 0.78,
      averageMonthlyCost: 25000,
      aiAdoptionRate: 0.65,
      headcountReduction: 0.3,
    },
    {
      family: "frontend",
      label: "前端",
      replacementRate: 0.72,
      averageMonthlyCost: 22000,
      aiAdoptionRate: 0.58,
      headcountReduction: 0.25,
    },
    {
      family: "qa",
      label: "测试",
      replacementRate: 0.82,
      averageMonthlyCost: 18000,
      aiAdoptionRate: 0.7,
      headcountReduction: 0.35,
    },
    {
      family: "product",
      label: "产品",
      replacementRate: 0.45,
      averageMonthlyCost: 28000,
      aiAdoptionRate: 0.3,
      headcountReduction: 0.15,
    },
    {
      family: "ui",
      label: "UI",
      replacementRate: 0.68,
      averageMonthlyCost: 20000,
      aiAdoptionRate: 0.55,
      headcountReduction: 0.2,
    },
    {
      family: "operations",
      label: "运营",
      replacementRate: 0.55,
      averageMonthlyCost: 15000,
      aiAdoptionRate: 0.4,
      headcountReduction: 0.18,
    },
    {
      family: "admin",
      label: "行政",
      replacementRate: 0.6,
      averageMonthlyCost: 12000,
      aiAdoptionRate: 0.45,
      headcountReduction: 0.2,
    },
    {
      family: "other",
      label: "其他",
      replacementRate: 0.5,
      averageMonthlyCost: 18000,
      aiAdoptionRate: 0.35,
      headcountReduction: 0.15,
    },
  ],
  industryRankings: [
    { rank: 1, industry: "软件测试", riskTrend: "red", description: "自动化测试覆盖率持续攀升，手工测试岗位缩减显著" },
    { rank: 2, industry: "基础编程", riskTrend: "red", description: "AI 编程助手已在代码补全、重构和调试场景广泛落地" },
    { rank: 3, industry: "初级前端", riskTrend: "red", description: "组件库和 AI 生成工具使页面搭建门槛大幅降低" },
    { rank: 4, industry: "数据录入", riskTrend: "red", description: "OCR 和 NLP 技术已基本替代手工数据录入流程" },
    { rank: 5, industry: "基础客服", riskTrend: "black", description: "智能客服在标准问答场景表现优异，复杂场景仍需人机协作" },
    { rank: 6, industry: "产品设计", riskTrend: "black", description: "AI 辅助设计工具快速发展，但创意决策和用户研究仍依赖人类" },
    { rank: 7, industry: "项目管理", riskTrend: "black", description: "AI 可辅助排期和资源预测，但跨团队沟通和风险管理仍需人工" },
    { rank: 8, industry: "心理咨询", riskTrend: "black", description: "共情、信任建立和复杂情感处理仍是人类独有的专业能力" },
  ],
  riskPercentileThresholds: {
    extreme: 0.7,
    high: 0.5,
    medium: 0.3,
  },
  minCountdownDays: 30,
  updatedAt: "2026-03-01",
  source: "综合行业报告与公开统计数据（2026 Q1）",
}
