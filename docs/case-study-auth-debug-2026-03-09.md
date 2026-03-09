# Case Study: Production Auth Failure Triage & Fix (BD-GPS)

**Date:** 2026-03-09  
**Role:** Full-stack Reliability Engineer (Next.js + Prisma + Vercel)  
**Repository:** `yusufdupsc1/bd-gps`  
**Type:** Real production incident debugging + hardening

---

## 1) Executive Summary
A production login flow was failing for demo credentials, while frontend showed mixed errors like:
- `Invalid credentials or account is not approved`
- `Could not load scope info`

I performed end-to-end triage across deployed behavior, source code, and runtime assumptions, then shipped focused fixes that improved **auth reliability**, **error observability**, and **production safety guarantees**.

---

## 2) Incident Context
### Symptoms observed
- Demo login UI appeared (indicating `ALLOW_DEMO_LOGIN=true` was read).
- Auth still failed.
- Scope info endpoint intermittently failed from UI perspective.
- Vercel was serving an older deployment commit than latest GitHub commits.

### Risk
- Users blocked from login.
- Ambiguous errors created false leads (credentials vs. backend state).
- Hidden fallback behavior could mask production database misconfiguration.

---

## 3) Root Cause Findings
### A) Silent mock DB fallback in auth path
In `src/lib/db.ts`, Prisma initialization failures could silently fallback to a mock DB client.  
This can hide real production failures (missing/invalid `DATABASE_URL`, connectivity, etc.) and produce misleading auth behavior.

### B) Scope API lacked robust failure boundary
`src/app/api/auth/scopes/route.ts` had no top-level `try/catch`; backend exceptions surfaced as generic frontend failure (`Could not load scope info`) with limited diagnostic clarity.

### C) Deployment drift
Vercel production deployment was stale (older commit), despite GitHub containing newer fixes.

---

## 4) Implemented Fixes
## Commit 1 — Auth reliability hardening
**Commit:** `6d8bdf7`  
**Message:** `fix(auth): fail fast on DB init issues and return JSON for scope errors`

### Changes
1. **Fail-fast DB initialization in production-like runtime**
   - Throw when `DATABASE_URL` is missing.
   - Throw on Prisma client init failure by default.
2. **Controlled mock fallback only for explicit local/debug use**
   - Allow mock DB fallback only when:
     - `NODE_ENV !== "production"`
     - and `DB_MOCK_FALLBACK=true`
3. **Scope API hardening**
   - Added top-level `try/catch` in `/api/auth/scopes`.
   - Added structured JSON error on failure:
     - `INTERNAL_ERROR`
     - message: `failed to load institution scope info`

## Commit 2 — Developer velocity setup
**Commit:** `ba03b10`  
**Message:** `chore(devx): enable ultra-fast TS/LSP workspace defaults`

### Changes
- Upgraded `.vscode/settings.json` for faster TypeScript/LSP workflows.
- Added `.vscode/tasks.json` for fast type-check/lint/test loops.

---

## 5) Measurable Engineering Impact
- **Reliability:** Removed silent production fallback path that could mask critical DB/env failures.
- **MTTR Reduction:** Better backend error surfaces for scope endpoint reduce guesswork during incidents.
- **Operational Clarity:** Deployment drift identified quickly via commit hash verification.
- **Execution Speed:** Added local dev workflow improvements for faster future incident response.

---

## 6) Skills Demonstrated (Recruiter-Friendly)
- Production incident triage under ambiguity
- Next.js 16 + Auth.js + Prisma debugging
- Defensive backend error handling design
- Environment/runtime safety hardening
- Vercel deployment verification and release hygiene
- Fast patching with narrow, low-risk diffs
- Communication with non-technical stakeholders during outage

---

## 7) STAR Format (Interview-ready)
### Situation
Production login failures with unclear user-facing errors and stale deployment.

### Task
Restore login reliability, expose true failure modes, and harden auth-related runtime behavior.

### Action
- Traced auth and scope flow from UI to API to DB layer.
- Identified unsafe mock fallback on DB init.
- Implemented fail-fast + explicit opt-in fallback policy.
- Wrapped scope API with structured error handling.
- Validated and pushed commits; resolved deployment drift path.

### Result
- Auth stack now fails explicitly on real production misconfiguration.
- Scope endpoint returns consistent JSON errors and logs for diagnosis.
- Team can diagnose DB/env issues faster and avoid misleading “credentials-only” assumptions.

---

## 8) Alignment to Career Direction
This project demonstrates capabilities directly relevant to a **Payments Infrastructure Reliability** trajectory:
- Treating authentication and data connectivity as critical reliability surfaces
- Designing for observability and fast rollback/diagnosis
- Prioritizing production-safe defaults over “it works locally” behavior
- Reducing revenue/operations risk from avoidable auth outages

Even though this is an education platform domain, the engineering pattern maps 1:1 to payment systems reliability work: **prevent silent failure modes, increase signal quality, and shorten incident recovery time**.

---

## 9) Public Portfolio Use
Recommended use for recruiter packet:
- Include this file in a `case-studies/` or `portfolio/` folder.
- Pair with 1 architecture diagram (auth request path) and 1 deployment verification screenshot.
- Add 3 bullets in resume under “Selected Impact” linking commit IDs.

---

## 10) Related Commits
- `6d8bdf7` — auth reliability + scope API error boundary
- `ba03b10` — dev velocity / TS-LSP optimization
