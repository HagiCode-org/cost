# AI 应用成本评估

[![license](https://img.shields.io/badge/license-MIT-ffd43b)](./LICENSE)
[![last commit](https://img.shields.io/github/last-commit/HagiCode-org/cost)](https://github.com/HagiCode-org/cost/commits/main)
[![website](https://img.shields.io/website?url=https%3A%2F%2Fcost.hagicode.com%2F&label=website)](https://cost.hagicode.com/)

站点地址：[cost.hagicode.com](https://cost.hagicode.com)

## 技术结构

- Astro 管理 `/` 路由、HTML 文档、默认语言构建时元数据，以及输出到 `dist/` 的静态文件。
- `src/layouts/BaseLayout.astro` 渲染公共 head、分析脚本、全局样式、图标和 JSON-LD。
- `src/components/IncomeTokenExperienceIsland.tsx` 将计算器体验作为单个 React island 执行服务端渲染并在客户端 hydration。语言相关的页头、表单、结果、展示区和页脚保持在一起，避免语言切换失效或重复翻译内容。
- 浏览器语言、地区、主题和计算器 URL 偏好在 hydration 后应用；服务端及客户端初始渲染使用默认语言和确定性默认值。
- 部署目标仍为静态托管，无需应用服务器。
- `@hagicode/hagilight` 与 `@hagicode/hagilight-core` 精确锁定为 0.9.5（同一版本，无版本范围）。`astro.config.mjs` 注册 `hagilight()`（默认配置）与 `hagilightFavicon()`，提供 sitemap、`robots.txt`、RSS、构建信息与共享 favicon；页脚、SEO head 与 51LA 均来自 Hagilight 组件。

## 本地启动

需要 Node.js 24 或更高版本。

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

生产构建会运行 Astro 和类型检查、生成 `dist/` 静态文件，并由 `scripts/check-built-site.mjs` 校验首页渲染内容、metadata、base path、`robots.txt`、`sitemap-index.xml`、`llms.txt` 和 `rss.xml`。

## 静态部署

- 权威工作流：`.github/workflows/cost-deploy-gh-pages.yml`
- 触发方式：向 `main` 推送，或手动触发 `workflow_dispatch`
- 生产 source of truth：`gh-pages` 分支，仅由 GitHub Actions 发布
- 发布 payload 契约：分支根目录保留 `esa.jsonc`，验证通过的静态站点产物统一位于 `dist/`
- 可选仓库变量：`COST_SITE_BASE_PATH` 与 `COST_SITE_URL`；未设置时默认 `/` 与 `https://cost.hagicode.com/`
- 本地构建对应变量为 `VITE_BASE_PATH`、`VITE_SITE_URL` 和可选 `VITE_APP_VERSION`
- `dist/robots.txt`、`dist/sitemap-index.xml`（及子 sitemap）和 `dist/rss.xml`、`dist/rss.en.xml` 由 Hagilight 按站点 URL 与 base path 生成；`robots.txt` 指向 `sitemap-index.xml`，不再发布 `sitemap.xml`
- 所需托管设置：托管层应读取 `gh-pages/esa.jsonc`，并把 `gh-pages/dist/` 作为生产目录
- 回滚方式：回退源代码变更，或从较早提交重新运行部署，让 CI 重新发布之前的静态快照

## 生成文件与手写文件

- 由 Hagilight 生成（不要在 `public/` 中手写同名文件）：`robots.txt`、`sitemap-index.xml`、`rss.xml`、`rss.en.xml` 与 favicon（`hagilightFavicon()` 注入的内联图标）。`scripts/sync-seo-assets.mjs` 已删除，`build` 不再执行它。
- 手写保留：`public/llms.txt`。锁定的 `@hagicode/hagilight` 0.9.5 不生成 `llms.txt`（该功能见后续版本），因此保留手写文件，并在版本升级后重新评估。
- 与基础路径相关：Hagilight 生成的 sitemap 与 feed 使用 `VITE_SITE_URL` 和 `VITE_BASE_PATH`；页脚中的站点地图链接由 Hagilight 页脚输出。

## i18n 维护

- 维护说明：[`docs/i18n-hagi18n.md`](./docs/i18n-hagi18n.md)
- 常用校验：`npm run i18n:check`

---

Powered by [hagicode.com](https://hagicode.com)
