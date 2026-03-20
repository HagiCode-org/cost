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
VITE_SITE_URL=https://cost-preview.hagicode.com npm run build
```

如果需要覆盖站点展示版本号，可设置：

```bash
VITE_APP_VERSION=0.2.0 npm run build
```

版本号优先级如下：

- `VITE_APP_VERSION`
- npm 自动注入的 `npm_package_version`
- `package.json` 的 `version`

默认生产域名为 `https://cost.hagicode.com/`；运行时 canonical、alternate、Open Graph、Twitter 和 JSON-LD 都会基于该域名生成。`public/robots.txt` 与 `public/sitemap.xml` 当前也按正式域名提交，便于直接部署静态产物。

## 可用脚本

- `npm run dev`：启动 Vite 开发服务器
- `npm run build`：执行 TypeScript 构建并输出到 `dist/`
- `npm run lint`：运行 ESLint
- `npm run release:align-version -- apply --version 1.2.3 --stateFile /tmp/cost-release.json`：临时把 release 版本写入 `package.json` 并导出构建所需环境变量
- `npm run release:manifest -- --archive ./artifacts/cost-site-v1.2.3.tar.gz --version 1.2.3 --commitSha <sha>`：为已打包产物生成 `release-manifest.json`
- `npm run release:package -- --version 1.2.3 --distDir ./dist --outputDir ./artifacts --commitSha <sha>`：把 `dist/` 打成冻结 release 资产并同步生成 manifest
- `npm run test`：运行 Vitest 测试
- `npm run test:ui`：打开 Vitest UI
- `npm run preview`：预览生产构建
- `npm run deploy:validate-release -- --archive <archive> --manifest <manifest> --expectedTag v1.2.3 --storageAccount <account>`：在不上传 Azure 的情况下校验冻结产物
- `npm run deploy:upload-static-website -- --archive <archive> --manifest <manifest> --expectedTag v1.2.3 --storageAccount <account>`：把冻结产物上传到 Azure Storage Static Website `$web` 容器

## Release Draft 与 Azure Static Website

`repos/cost` 现在使用“先准备 GitHub Draft Release，再发布到生产”的发布模型：

- `main` 分支只做日常开发校验，不直接触发生产发布
- `repos/cost/.github/workflows/release-draft.yml` 负责准备或更新某个版本的 GitHub Draft Release
- `repos/cost/.github/workflows/deploy-azure-static-website.yml` 只在 release 从 draft 变为 published，或手动指定已发布 tag 重部署时运行
- 这里的 “draft” 指 GitHub Draft Release 语义，与桌面端现有 release draft 能力对齐，不是仓库内额外维护的一套自定义阶段

### Draft Release 工作流

由于 GitHub 不会为 draft release 的 `created` / `edited` 事件触发 workflow，Cost 仓库把 `release-draft.yml` 实现为手动触发的“创建/更新草稿 release”入口：维护者输入目标版本后，workflow 会安装依赖、运行 `lint` / `test` / `build`，然后生成冻结资产。

冻结资产包含：

- 版本化站点归档，例如 `cost-site-v1.2.3.tar.gz`
- `release-manifest.json`

manifest 至少记录以下元数据：

- release `version` 与标准化 `tag`
- 构建所用 `commitSha`
- `artifactName` 与 `artifactSha256`
- `builtAt`
- `basePath`
- `siteUrl`

如果版本解析、依赖安装、测试或构建失败，workflow 会在接触 GitHub Draft Release 之前停止，因此不会产生未校验的草稿资产。

### Release 版本临时对齐

release 构建时会临时对齐两个版本来源：

1. `VITE_APP_VERSION`
2. `package.json` 的 `version`

`scripts/release/align-release-version.mjs` 会先把 release 版本写入 `package.json`，再导出：

- `COST_RELEASE_VERSION`
- `COST_RELEASE_TAG`
- `VITE_APP_VERSION`
- `npm_package_version`

构建结束后，workflow 会恢复原始 `package.json` 版本，避免污染仓库工作树。这样可以确保站点显示版本、release asset 命名和 manifest 元数据一致。

### Azure Static Website 部署

正式部署只消费已发布 GitHub Release 上的冻结资产，不重新构建站点：

1. 下载 release 上的站点归档与 `release-manifest.json`
2. 校验 tag、归档文件名与 SHA-256 是否匹配
3. 登录 Azure
4. 上传文件到 Storage Static Website 的 `$web` 容器
5. 按配置决定是否执行 CDN purge

缓存策略由 `scripts/deploy/upload-static-website.mjs` 显式控制：

- `index.html` 等 HTML：`no-cache, no-store, must-revalidate`
- `robots.txt`、`sitemap.xml`、`favicon.svg` 等根级元数据文件：`public, max-age=300, must-revalidate`
- `assets/` 下的 Vite 指纹文件：`public, max-age=31536000, immutable`

### GitHub / Azure 配置

`release-draft.yml` 需要：

- `contents: write` 权限，用于创建或更新 GitHub Draft Release
- 可选变量：`COST_SITE_BASE_PATH`、`COST_SITE_URL`

`deploy-azure-static-website.yml` 需要：

- GitHub secrets：`AZURE_CLIENT_ID`、`AZURE_TENANT_ID`、`AZURE_SUBSCRIPTION_ID`
- GitHub variables：`AZURE_STORAGE_ACCOUNT`
- 可选 GitHub variables：`AZURE_STORAGE_CONTAINER`（默认 `$web`）、`AZURE_CDN_RESOURCE_GROUP`、`AZURE_CDN_PROFILE`、`AZURE_CDN_ENDPOINT`、`AZURE_CDN_CONTENT_PATHS`

只有当 `AZURE_CDN_RESOURCE_GROUP`、`AZURE_CDN_PROFILE`、`AZURE_CDN_ENDPOINT` 都存在时，部署脚本才会执行 CDN purge；否则会把 purge 标记为 skipped，但不会让部署失败。

### 回滚方式

回滚不需要重新构建旧版本。选择一个已经 published 的历史 release tag，然后手动触发 `deploy-azure-static-website.yml` 并传入该 tag，即可复用当时冻结的 release asset 重新部署。

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
- `src/lib/analytics/`：51LA 统计脚本加载与初始化逻辑

## 当前范围与免责声明

- 当前只交付静态首页与方法论/功能占位
- 未实现真实表单提交流程、评分逻辑、结果页或后端接口
- 页面中的蓝图区块用于验证后续复杂表单的布局、视觉与可访问性基线
