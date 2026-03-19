# AI Application Site (`repos/cost`)

`repos/cost` 是“我会被AI替代吗”站点的首版前端工程。当前变更聚焦三个目标：

1. 迁移 `repos/docker-compose-builder-web` 的 Vite + React + TypeScript + Tailwind + shadcn 工程基线
2. 落地一个可部署、可本地运行的静态首页
3. 为后续复杂表单、评估结果和行动建议模块预留稳定的 UI 与目录结构

## 本地开发

```bash
cd repos/cost
npm install
npm run dev
```

默认使用 `/` 作为 `base`。如果需要部署到子路径，可设置：

```bash
VITE_BASE_PATH=/custom-path/ npm run build
```

如果需要覆盖站点绝对地址（例如 canonical / OG URL），可设置：

```bash
VITE_SITE_URL=https://example.com npm run build
```

## 可用脚本

- `npm run dev`：启动 Vite 开发服务器
- `npm run build`：执行 TypeScript 构建并输出到 `dist/`
- `npm run lint`：运行 ESLint
- `npm run test`：运行 Vitest 测试
- `npm run test:ui`：打开 Vitest UI
- `npm run preview`：预览生产构建

## 首页结构

- `src/features/home/pages/HomePage.tsx`：首页总装配
- `src/features/home/components/HomeHeader.tsx`：品牌、语言和主题切换、锚点导航
- `src/features/home/components/HeroSection.tsx`：大标题、主副 CTA 与三张信息卡
- `src/features/home/components/MethodologySection.tsx`：方法论摘要与后续说明占位
- `src/features/home/components/FormBlueprintSection.tsx`：未来复杂表单的禁用态蓝图
- `src/features/home/components/FutureFeatureSection.tsx`：后续功能预告卡片
- `src/features/home/content/home-content.ts`：从翻译和站点状态组装首页内容

## 扩展方式

### 扩展真实评估流程

后续实现真实评估时，优先在以下位置追加：

- `src/features/home/content/`：题目定义、结果文案、方法论扩展内容
- `src/features/home/components/`：新的步骤流、结果卡片、建议模块
- `src/lib/store.ts`：扩展为真实流程状态管理
- `src/components/ui/`：复用已迁入的 shadcn primitives，而不是重新引入组件基线

### 调整 SEO / i18n

- `src/config/seo.ts`：首页标题、描述、关键词、canonical 和 OG 基线
- `src/i18n/locales/*.json`：中英文首页文案
- `public/robots.txt`、`public/sitemap.xml`、`public/og-image.svg`：静态资源与分享素材

## 当前范围与免责声明

- 当前只交付静态首页与方法论/功能占位
- 未实现真实表单提交流程、评分逻辑、结果页或后端接口
- 页面中的蓝图区块用于验证后续复杂表单的布局、视觉与可访问性基线
