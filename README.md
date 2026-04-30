# AI 应用成本评估

站点地址：[cost.hagicode.com](https://cost.hagicode.com)

## 本地启动

```bash
cd repos/cost
npm install
npm run dev
```

## 构建与校验

```bash
npm run i18n:check
npm run test
npm run build
```

## 生产部署

- 权威工作流：`.github/workflows/cost-deploy-gh-pages.yml`
- 触发方式：向 `main` 推送，或手动触发 `workflow_dispatch`
- 生产 source of truth：`gh-pages` 分支，仅由 GitHub Actions 发布
- 发布 payload 契约：分支根目录保留 `esa.jsonc`，验证通过的静态站点产物统一位于 `dist/`
- 所需 GitHub 权限：deploy job 需要 `contents: write`，build job 保持只读
- 可选仓库变量：`COST_SITE_BASE_PATH` 与 `COST_SITE_URL`；未设置时默认 `/` 与 `https://cost.hagicode.com/`
- 所需托管设置：托管层应读取 `gh-pages/esa.jsonc`，并把 `gh-pages/dist/` 作为生产目录
- 首次部署检查：确认工作流实际发布了 `esa.jsonc` 和 `dist/`，确认托管目标仍指向 `gh-pages`，再验证 `https://cost.hagicode.com`
- 回滚方式：回退源代码变更，或从较早提交重新运行部署，让 CI 重新发布之前的静态快照

## i18n 维护

- 维护说明：[`docs/i18n-hagi18n.md`](./docs/i18n-hagi18n.md)
- 常用校验：`npm run i18n:check`

---

Powered by [hagicode.com](https://hagicode.com)
