import type { CityTier } from "./benchmark-data"
import { pricingData } from "./pricing-data"

export interface FormOption<T extends string = string> {
  value: T
  label: string
  labelEn: string
}

export interface IncomeOption {
  value: string
  label: string
  labelEn: string
}

export interface ModelOption {
  value: string
  providerId: string
  providerName: string
  label: string
  description: string
}

export const cityOptions: FormOption<CityTier>[] = [
  { value: "tier1", label: "北京 / 上海 / 深圳 / 广州", labelEn: "Beijing / Shanghai / Shenzhen / Guangzhou" },
  { value: "new-tier1", label: "杭州 / 成都 / 苏州 / 南京", labelEn: "Hangzhou / Chengdu / Suzhou / Nanjing" },
  { value: "tier2", label: "武汉 / 西安 / 天津 / 郑州", labelEn: "Wuhan / Xi'an / Tianjin / Zhengzhou" },
  { value: "other", label: "宜昌 / 洛阳 / 南充 / 上饶", labelEn: "Yichang / Luoyang / Nanchong / Shangrao" },
]

export const incomeOptions: IncomeOption[] = [
  { value: "13", label: "13 万", labelEn: "130k CNY" },
  { value: "26", label: "26 万", labelEn: "260k CNY" },
  { value: "40", label: "40 万", labelEn: "400k CNY" },
  { value: "60", label: "60 万", labelEn: "600k CNY" },
  { value: "100", label: "100 万", labelEn: "1M CNY" },
]

export const modelOptions: ModelOption[] = pricingData.models.map((model) => {
  const provider = pricingData.providers.find((item) => item.id === model.providerId)

  return {
    value: model.id,
    providerId: model.providerId,
    providerName: provider?.name ?? model.providerId,
    label: model.name,
    description: model.description,
  }
})
