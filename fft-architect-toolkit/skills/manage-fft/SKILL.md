---
name: manage-fft
description: Full-Function Tree (FFT) v2.1 — initialize, update, or impact_analysis for architecture documentation. Produces a five-section document covering Meta-Model, Functional Hierarchy (Domain→Service→Function→Feature), Lifecycle Table, Impact Analysis Matrix, and detailed Function Specifications with typed I/O and numbered process steps (no Mermaid).
argument-hint: "[initialize|update|impact_analysis] [source_path] [--fid=FID]"
---

# manage-fft — Full-Function Tree Manager (v2.1)

## Purpose

Build and maintain a **Full-Function Tree (FFT)** at `docs/FFT.md` that covers three core dimensions:

1. **基础元数据** — standard node attributes (FID, Type, Status, Logic_Ref, Dependencies)
2. **功能层级结构** — Domain → Service → Function → Feature hierarchy
3. **影响分析矩阵** — change propagation mapping across the codebase

FID convention: `<MODULE>-<NN>[-<NN>[-<LETTER>]]`  
Examples: `FTM-01`, `EDI-02-01`, `UI-01-03-A`

---

## Document Structure (v2.1.0)

### Section I — 节点定义元模型 (Meta-Model)
Standard block, always included verbatim. Defines the five node attributes.

### Section II — 核心功能树结构 (Hierarchy)
Indented bullet list: Domain → Service → Function → Feature.  
Each node carries: `Type`, `Status`, `Logic_Ref`, and cross-references (`Refs: OTHER-FID`).

### Section III — 全生命周期维护属性映射表
Markdown table: FID | Logic_Ref | 负责人 | 维护记录 | 关键SLO.  
One row per Function/Feature FID.

### Section IV — 演进影响分析矩阵 (Impact Analysis Matrix)
Markdown table: 变更目标FID | 变更类型 | 直接影响面 | 间接连锁影响.  
Cover the 5–10 most impactful FIDs.

### Section V — 功能节点详细规格 (Function Specifications)
**Apply the leaf-node template to every Function and Feature node.**  
Use **numbered steps** for Process — no Mermaid diagrams.

Leaf-node template:
```
### [FID: MOD-NN-NN] functionName / 中文名

* **功能描述 (Description):** 一句话描述功能目的和边界。

* **输入 (Input):**
  * `paramName`: [Type] 描述

* **处理逻辑 (Process):**
  1. **步骤名**: 具体操作。
  2. **步骤名**: 具体操作。

* **输出 (Output):**
  * `returnName`: [Type] 描述；异常情况说明。

* **技术规范 (Specification):**
  * **协议**: REST / gRPC / IPC / 纯函数
  * **事务性**: none / read-only / write
  * **幂等性**: 是 / 否 — 原因
  * **监控埋点**: 指标名 或 无

* **约束条件 (Constraints):**
  * 性能 / 安全 / 依赖约束描述
  * **Dependencies**: [FID-XX, FID-YY]
```

---

## Actions

The argument selects the action. If omitted, ask the user which to run.

### Action: `initialize`

Scan the codebase and build the first `docs/FFT.md`.

**Steps:**

1. **Determine source path.** Use `source_path` if provided; otherwise use the project root.

2. **Discover files.** Glob for Controllers, Services, Handlers, Managers, Repositories, React components (`.jsx`/`.tsx`), Electron main/preload files, and utility modules.

3. **Design domain structure.** Group discovered files into 3–8 logical Domains. Assign uppercase MODULE abbreviations (e.g., `FTM`, `EDI`, `SYS`).

4. **Assign FIDs.** Follow `MODULE-NN[-NN[-L]]` convention. Never reuse a FID. Skip trivial functions (getters, one-line pass-throughs, constructors with no logic).

5. **Write Section I.** Standard Meta-Model block (copy verbatim from this skill).

6. **Write Section II.** Indented bullet hierarchy. Each node: `[FID: X]`, bold name, backtick-tagged `Type:`, `Status:`, `Logic_Ref:`, and any `Refs:` cross-references.

7. **Write Section III.** One table row per Function/Feature. Populate `Logic_Ref` from file paths. Use `-` for unknown owner/changelog/SLO.

8. **Write Section IV.** Identify high-impact FIDs (those with most dependents). Document direct and transitive chain impact.

9. **Write Section V.** Full leaf-node spec for every Function and Feature. Use numbered Process steps — no Mermaid.

10. **Write `docs/FFT.md`** with header `# [ProjectName] 全量功能树 (v2.1.0)`. Create `docs/` if missing.

11. **Report**: Print summary — domains / services / functions / features documented.

---

### Action: `update`

Sync `docs/FFT.md` with code changes.

**Steps:**

1. Read existing `docs/FFT.md` to extract FID → function mapping.
2. Scan source files for added, modified, or deleted functions.
3. Unchanged functions (same signature + same guard logic) → skip.
4. Changed functions → re-generate Section V spec; update `Last Synced`.
5. New functions → assign new FID; add to Sections II, III, V.
6. Deleted functions → mark `Status: Legacy` in hierarchy (do not delete).
7. Update Section IV if new cross-FID dependencies detected.
8. Write updated `docs/FFT.md`.
9. Report: list updated / added / deprecated FIDs.

---

### Action: `impact_analysis`

Given a FID, produce a change-impact report.

**Required argument**: `--fid=<FID>`

**Steps:**

1. Read `docs/FFT.md` — extract dependency graph from `Dependencies` fields and `Refs:` annotations in Section II.
2. Grep the codebase for direct callers of the target function (by function name and FID comment).
3. Recurse to depth 3 to find transitive impacts.
4. Append to `docs/FFT.md` (do NOT overwrite) or print inline:
   - Direct callers with FIDs
   - Transitive impact list (depth 2–3)
   - Recommended refactoring scope

---

## General Rules

- **FIDs are permanent.** Never renumber existing FIDs after assignment.
- **No Mermaid in Process sections.** Numbered steps avoid syntax errors across all Mermaid versions.
- **Leaf coverage**: every Function and Feature node must have a Section V entry.
- **Dependencies field**: always use FID references, not function names.
- **Status accuracy**: use `Refactoring` for actively changing functions, `Legacy` for deprecated ones.
- **Write language**: match the project's primary language. Chinese section headers are standard; English code identifiers always stay in English.
- **Output default**: `docs/FFT.md` relative to project root.
