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

- 权威工作流：`.github/workflows/deploy-azure-static-website.yml`
- 触发方式：发布 GitHub Release，或通过 `workflow_dispatch` 传入已发布 tag 重新部署
- 构建来源：工作流会先 checkout 发布 tag，再把版本号对齐到构建输入
- 生产 source of truth：`gh-pages` 分支，不再使用 Azure Static Web Apps 直接上传
- 发布 payload 契约：分支根目录保留 `esa.jsonc`，验证通过的静态站点产物统一位于 `dist/`
- 所需 GitHub 权限：deploy job 需要 `contents: write`
- 所需托管设置：托管层应读取 `gh-pages/esa.jsonc`，并把 `gh-pages/dist/` 作为生产目录
- 首次部署检查：确认 workflow summary 记录了发布 tag，确认 `gh-pages` 只包含 `esa.jsonc` 与 `dist/`，再验证 `https://cost.hagicode.com`
- 回滚方式：重新部署一个更早的已发布 tag，或重新发布修复版本；失败构建不会覆盖当前 `gh-pages` 快照

## i18n 维护

- 维护说明：[`docs/i18n-hagi18n.md`](./docs/i18n-hagi18n.md)
- 常用校验：`npm run i18n:check`

---

Powered by [hagicode.com](https://hagicode.com)
