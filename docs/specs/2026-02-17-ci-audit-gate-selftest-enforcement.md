# Task: CI audit gate self-test enforcement

## Goal
将现有 `audit:migration:verify-gate` 负向夹具验证接入 CI 主部署流水线，确保迁移审计闸门在未来变更中仍然具备“能拦截坏数据”的实证能力，而不是只跑正向审计。

## Scope
- In scope:
  - 在 `.github/workflows/deploy-to-publish-repo.yml` 中新增必跑步骤 `Verify migration audit gate (negative fixture)`。
  - 保留现有 `Audit migration parity` 步骤与位置语义（仍在 build 前）。
  - 扩展 `Append migration parity summary`，增加 `metadataFindings.hasFindings` 指示，并对旧 JSON 结构保持兼容。
  - 完成 spec 的验证项与决策/变更记录回填。
- Out of scope:
  - 修改 `audit:migration` 本体校验规则。
  - 改动发布目标仓、分支或 deploy key 配置。

## Plan
1. 先创建本 spec（spec-first）。
2. 在 deploy workflow 中插入 `npm run audit:migration:verify-gate`，命名为 `Verify migration audit gate (negative fixture)`。
3. 给该步骤注入 `LEGACY_BLOG_ROOT=legacy-source`，与正向审计保持一致数据基线。
4. 在 Step Summary 增补 metadata findings 指标，字段缺失时输出 `n/a` 以兼容旧报告。
5. 运行本地必检：`npm run audit:migration && npm run build`。
6. 核对 CI 与发布仓部署链路。

## Risks
- 负向夹具脚本若未来与内容结构耦合过强，可能导致 CI 误阻断。
- Step Summary 若强依赖新字段可能造成解析告警；需容错处理。

## Validation
- [x] 新增 spec：`docs/specs/2026-02-17-ci-audit-gate-selftest-enforcement.md`。
- [x] workflow 新增 `Verify migration audit gate (negative fixture)` 且位于 `Build Astro` 之前。
- [x] 既有 `Audit migration parity` 步骤保持不变。
- [x] Step Summary 增加 metadata findings 指标并具备 backward compatibility（字段缺失返回 `n/a`）。
- [x] `npm run audit:migration && npm run build` 本地通过。
- [x] CI workflow 通过并完成发布仓部署映射核对。

## Change Log
- 2026-02-17T08:47:00Z 创建 spec，定义 CI 强制自检接入范围与验证标准。
- 2026-02-17T08:48:00Z 在 deploy workflow 新增 `Verify migration audit gate (negative fixture)` 步骤，执行 `npm run audit:migration:verify-gate`（携带 `LEGACY_BLOG_ROOT=legacy-source`）。
- 2026-02-17T08:48:00Z 扩展 Step Summary，新增 `Metadata findings` 行（读取 `metadataFindings.hasFindings`，缺失时 `n/a`）。
- 2026-02-17T08:46:00Z 本地验证通过：`npm run audit:migration && npm run build`。
- 2026-02-17T08:46:00Z 本地自检通过：`npm run audit:migration:verify-gate`。
- 2026-02-17T08:47:00Z GitHub Actions run `22091697003` 全流程通过（含新增负向夹具闸门步骤）；发布仓 `origin/master` 更新为 `deploy: miniade/edxi-blog-astro@4ec81544e08088f023abf9ac43774327c9cadfd5`（`a6c4d97`）。

## Decisions
- Decision: 将负向夹具验证提升为部署流水线必经步骤。
- Rationale: 仅正向审计不能证明闸门“真能 fail”；负向验证可持续证明拦截能力。
- Decision: metadata 指标采用容错输出（`yes/no/n/a`）。
- Rationale: 防止 JSON schema 变化导致 summary 步骤本身失败。