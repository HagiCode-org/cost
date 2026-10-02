# AI 应用成本评估

站点地址：[cost.hagicode.com](https://cost.hagicode.com)

## 技术结构

- Astro 管理 `/` 路由、HTML 文档、默认语言构建时元数据，以及输出到 `dist/` 的静态文件。
- `src/layouts/BaseLayout.astro` 渲染公共 head、分析脚本、全局样式、图标和 JSON-LD。
- `src/components/IncomeTokenExperienceIsland.tsx` 将计算器体验作为单个 React island 执行服务端渲染并在客户端 hydration。语言相关的页头、表单、结果、展示区和页脚保持在一起，避免语言切换失效或重复翻译内容。
- 浏览器语言、地区、主题和计算器 URL 偏好在 hydration 后应用；服务端及客户端初始渲染使用默认语言和确定性默认值。
- 部署目标仍为静态托管，无需应用服务器。
- `@hagicode/hagilight-core` 0.5.0 supplies shared components only; Cost does not enable an RSS-generating integration or publish RSS routes.

## 本地启动

需要 Node.js 22.12 或更高版本。

```bash
cd repos/cost
npm install
npm run dev
```

Astro 页面路由位于 `src/pages/`。用户可见文案继续使用生成的 locale 资源；`npm run dev`、`npm test` 和 `npm run build` 会在使用前准备这些资源。

## 构建与校验

```bash
npm run i18n:check
npm test
npm run lint
npm run typecheck
npm run build
npm run preview
```

生产构建会运行 Astro 和类型检查、生成 `dist/` 静态文件，并校验首页渲染内容、metadata、base path、`robots.txt` 和 `sitemap.xml`。

## 静态部署

- 权威工作流：`.github/workflows/cost-deploy-gh-pages.yml`
- 触发方式：向 `main` 推送，或手动触发 `workflow_dispatch`
- 生产 source of truth：`gh-pages` 分支，仅由 GitHub Actions 发布
- 发布 payload 契约：分支根目录保留 `esa.jsonc`，验证通过的静态站点产物统一位于 `dist/`
- 可选仓库变量：`COST_SITE_BASE_PATH` 与 `COST_SITE_URL`；未设置时默认 `/` 与 `https://cost.hagicode.com/`
- 本地构建对应变量为 `VITE_BASE_PATH`、`VITE_SITE_URL` 和可选 `VITE_APP_VERSION`
- `dist/robots.txt` 和 `dist/sitemap.xml` 会按站点 URL 与 base path 生成
- 所需托管设置：托管层应读取 `gh-pages/esa.jsonc`，并把 `gh-pages/dist/` 作为生产目录
- 回滚方式：回退源代码变更，或从较早提交重新运行部署，让 CI 重新发布之前的静态快照

## i18n 维护

- 维护说明：[`docs/i18n-hagi18n.md`](./docs/i18n-hagi18n.md)
- 常用校验：`npm run i18n:check`

---

Powered by [hagicode.com](https://hagicode.com)
