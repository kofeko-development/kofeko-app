# QA Results — Module 6: AI Evaluation (Regression)

**Date:** 2026-06-01 | **Tester:** Cursor Agent | **Frontend:** :3000 | **Backend:** :5000  
**Git (FE):** `rajdeep_dev` @ kofeko-development/kofeko-app | **Git (BE):** `rajdeep_dev` @ kofeko-development/kofeko-backend  
**Prior baseline:** 2026-05-15 (11/11 PASS) — see earlier rows below

## Regression context

Phase 1 was marked READY on 2026-05-15. This pass re-validates Evaluation after Supabase resume (Tokyo `ap-northeast-1`, pooler URLs), repo migration, script/seed alignment, and **Replicate-first AI provider** ([`jsonCompletion.ts`](../../kofeko_backend/src/common/ai/jsonCompletion.ts)).

## Environment checks

| Check | Status | Notes |
|-------|--------|-------|
| Frontend dev server | PASS | `http://localhost:3000` running |
| Backend `/health` | PASS | HTTP 200 |
| Backend DB (Prisma) | PASS | Pooler `aws-1-ap-northeast-1`; `seed-status` 200 |
| `NEXT_PUBLIC_API_BASE_URL` | PASS | `http://localhost:5000/api/v1` in `.env.local` |
| Backend typecheck | PASS | `npm run typecheck` |
| Frontend typecheck | PASS | `npx tsc --noEmit` |
| Jest `stage6.evaluation` | Not re-run | Run when convenient with DB up |
| `REPLICATE_API_TOKEN` | PASS | Valid token; live 6.1 via Replicate |

## Live API regression (2026-06-01)

Script: [kofeko_backend/scripts/qa-evaluation-regression.ps1](../../kofeko_backend/scripts/qa-evaluation-regression.ps1)  
Results JSON: [qa-evaluation-regression-results.json](../../kofeko_backend/scripts/qa-evaluation-regression-results.json)

**Prerequisites:** `npm run seed:test`, backend on `:5000`, **valid** `REPLICATE_API_TOKEN` (or `OPEN_ROUTE` if Replicate unset).

| ID | Test | Status | HTTP | Notes |
|----|------|--------|------|-------|
| ENV | Staff login | PASS | 200 | `recruiter1@kofeko-test.com` |
| 6.0 | Open job + skillWeights | PASS | 200 | Senior React Developer |
| 6.0b | Pipeline + resume | PASS | 200 | Amit Sharma |
| 6.2 | NO_SKILL_WEIGHTS | PASS | 400 | Open Internship job |
| 6.3 | NO_RESUME | PASS | 400 | `noresume@kofeko-test.com` |
| 6.4 | Invalid job 404 | PASS | 404 | NOT_FOUND |
| 6.1 | POST ai-evaluate | PASS | 201 | Replicate; unevaluated candidate with resume |
| 6.8 | GET evaluations list | PASS | 200 | |
| 6.8b | GET evaluation by id | PASS | 200 | |
| 6.9 | PATCH recruiter override | PASS | 200 | score=88; recruiter has `evaluation:update` |
| 6.5 | POST evaluate-all (1st) | PASS | 200 | evaluated=0 failed=2 |
| 6.6 | Batch skips evaluated | PASS | 200 | evaluated=0 on 2nd run |
| 6.7 | GET rankings sorted | PASS | 200 | count=4 |

**Score:** 13 PASS, 0 FAIL, 0 SKIP (2026-06-01 retest with valid Replicate token).

## Code changes (this pass)

| Change | Purpose |
|--------|---------|
| [`jsonCompletion.ts`](../../kofeko_backend/src/common/ai/jsonCompletion.ts) | Replicate first, OpenRouter (`OPEN_ROUTE`) fallback |
| [`analyzeResume.ts`](../../kofeko_backend/src/common/ai/analyzeResume.ts), [`parseResume.ts`](../../kofeko_backend/src/common/ai/parseResume.ts), [`jdCreator.service.ts`](../../kofeko_backend/src/services/ai/jdCreator.service.ts) | Use unified provider |
| [`seedTestData.ts`](../../kofeko_backend/src/scripts/seedTestData.ts) | `noresume@kofeko-test.com` + React pipeline |
| [`qa-evaluation-regression.ps1`](../../kofeko_backend/scripts/qa-evaluation-regression.ps1) | Prefer Senior React job; fix 6.1 candidate selection |

## Static / code-path verification

| Area | Status | Evidence |
|------|--------|----------|
| Evaluation routes | PASS | `POST /evaluations/ai-evaluate`, `GET/PATCH /evaluations/:id`, batch + rankings |
| Service guards | PASS | `NO_SKILL_WEIGHTS`, `NO_RESUME`, 404, audit `ai_evaluate` |
| AI provider wiring | PASS | Live 6.1 hits Replicate (not stale OpenRouter 401) |
| Frontend API client | PASS | `aiEvaluate`, `evaluateAll`, `getRankings`, list, update |

## Open issues

| Severity | Issue | Fix |
|----------|-------|-----|
| **Env** | `REPLICATE_API_TOKEN` returns 401 | Generate new token at https://replicate.com/account/api-tokens, update `.env`, restart backend |
| Optional | `OPEN_ROUTE` also invalid if used as fallback | New key at https://openrouter.ai/keys |

## Verdict: [x] PASS  [ ] PARTIAL  [ ] FAIL

Live regression script **13/13 PASS** with valid `REPLICATE_API_TOKEN`, `npm run seed:test`, and backend on `:5000`.

```powershell
cd kofeko_backend
npm run seed:test
powershell -ExecutionPolicy Bypass -File .\scripts\qa-evaluation-regression.ps1
```

## Frontend evaluation hardening (2026-06-01)

**Typecheck:** `cd Kofeko---App && npx tsc --noEmit` — PASS

**Full flow automation:** `cd kofeko_backend && powershell -ExecutionPolicy Bypass -File .\scripts\qa-evaluation-full-flow.ps1` — PASS

This creates a QA job, registers a candidate, uploads a real PDF resume, applies to the job, runs **Evaluate with AI**, verifies the assessment row, saves an override, and checks rankings.

### Manual UI checklist

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| 1 | Single evaluate success | Login `kofeko-test` / `recruiter1@kofeko-test.com` → **Senior React Developer** → **Amit Sharma** → **Evaluate with AI** | Toast success; score shows as `NN%` (not `Not assessed`); Assessments row appears |
| 2 | Not assessed vs 0% | View unevaluated candidate | Label **Not assessed**; no progress bar |
| 3 | Resume required | Candidate apply form / recruiter-created candidate API | Resume is mandatory before a candidate can apply or be added to a pipeline |
| 4 | No skill weights | **Open Internship** job | Banner + disabled AI; toast if batch attempted |
| 5 | Empty job | Job with zero pipelines | **No candidates in this job** card; **Evaluate all** disabled |
| 6 | Batch partial fail | **Evaluate all** on Senior React (mixed eligibility) | Toast with evaluated/failed counts; up to 3 error reasons |
| 7 | Rankings | After evaluations | **Rank #N** badge on evaluated rows when rankings API returns data |
| 8 | Assessments search | **Assessments** → search nonsense | **No matching assessments** (not “no evaluations yet”) |
| 9 | Override valid | Assessments → open row → score `88` → Save | PATCH success |
| 10 | Override invalid | Clear score field → Save | Inline validation; no `NaN` PATCH |
| 11 | No `evaluation:create` | Role without permission | No Evaluate buttons |
| 12 | No `evaluation:update` | Role without permission | Assessments detail read-only (no override form) |
| 13 | Closed job | Closed posting | AI actions disabled; info banner when applicable |

### Frontend files touched

- `src/lib/evaluation-utils.ts` — safe HI parse, score labels, batch messages, rankings map, override validation
- `src/lib/stage1-2-api.ts` — `EvaluationRecord`, `EvaluateAllResult`, `JobRankingEntry`
- `src/app/(main)/job-postings/[id]/page.tsx` — edge states, batch feedback, rankings, profile sync
- `src/app/(main)/assessments/page.tsx` — empty/search states, refresh, validation, richer HI
