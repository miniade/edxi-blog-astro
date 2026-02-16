# Task: migration audit add duplicate legacyPath fail-fast gate

## Goal
在现有 slug/path 一致性审计基础上，补齐 `legacyPath` 重复占用检测，避免两篇 Astro 文章映射到同一 legacy URL 且 CI 仍通过。

## Scope
- In scope:
  - 扩展 `scripts/audit-migration-parity.mjs`，新增 `duplicateLegacyPath` 发现与报告
  - 将 `duplicateLegacyPath` 纳入 warnings 与 fail-fast (`hasDiffs`)
  - 更新 `docs/MIGRATION_AUDIT.md` / `docs/MIGRATION_AUDIT.json` 字段与摘要计数
- Out of scope:
  - 新增独立 lint 工具
  - 修改历史文章内容

## Plan
1. 在 spec 先记录需求与验证标准。
2. 使用 Codex CLI 修改审计脚本与报告输出。
3. 运行 `npm run audit:migration` 与 `npm run build` 验证。
4. 回填 spec 的 Change Log/Decisions，并提交代码与文档。

## Risks
- 审计 JSON 字段变更可能影响既有 CI summary 解析逻辑。
- 新增 fail-fast 条件若误判会阻塞部署。

## Validation
- [x] Build passes (`npm run build` at 2026-02-16T22:14:49Z)
- [x] Key routes/features verified (`npm run audit:migration` regenerated `docs/MIGRATION_AUDIT.md`/`docs/MIGRATION_AUDIT.json`, summary all zero, `hasDiffs=false`)
- [ ] Deployment workflow passes (not run in local workspace)

## Change Log
- 2026-02-16T22:15:00Z 创建任务 spec，定义 duplicate legacyPath 闸门目标。
- 2026-02-16T22:14:54Z 更新 `scripts/audit-migration-parity.mjs`：新增 metadata `duplicateLegacyPath` 检测、报告 section、JSON summary count、warning 文案与 fail-fast 纳入。
- 2026-02-16T22:14:45Z 执行 `npm run audit:migration`，产出更新后的 `docs/MIGRATION_AUDIT.md` 与 `docs/MIGRATION_AUDIT.json`（`Duplicate legacyPath: 0`）。
- 2026-02-16T22:14:49Z 执行 `npm run build` 通过。

## Decisions
- Decision: 将 duplicate legacyPath 定位为阻断级错误（非 warning-only）。
- Rationale: legacy URL 一对一映射是迁移正确性的硬约束，冲突应在 CI 即时拦截。
- Decision: 复用 metadata 现有 findings 聚合（`hasFindings`）承载 duplicate legacyPath fail-fast，不新增并行 gate 字段。
- Rationale: 保持审计出口与 CI 判定逻辑最小变更，同时保证 duplicate legacyPath 自动进入 `hasDiffs`。
