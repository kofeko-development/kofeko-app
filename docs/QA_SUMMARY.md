# Kofeko — Full Integration Test Summary

**Last updated:** 2026-06-01 (Evaluation regression pass)  
**Original completion:** 2026-05-15  
**Total test cases (original):** 134  
**Environment:** Development (FE :3000, BE :5000)

## Module Results (original Phase 1 — 2026-05-15)

| Module | Cases | Passed | Failed | Verdict |
|--------|-------|--------|--------|---------|
| 1 — Auth & Signup | 24 | 24 | 0 | PASS |
| 2 — Team & Invite | 24 | 24 | 0 | PASS |
| 3 — Job Management | 18 | 18 | 0 | PASS |
| 4 — Candidates | 15 | 15 | 0 | PASS |
| 5 — Pipeline & Portal | 17 | 17 | 0 | PASS |
| 6 — AI Evaluation | 11 | 11 | 0 | PASS |
| 7 — Analytics & Audit | 11 | 11 | 0 | PASS |
| 8 — Super Admin | 14 | 14 | 0 | PASS |
| **Total** | **134** | **134** | **0** | **PASS** |

## 2026-06-01 Evaluation regression

| Check | Result |
|-------|--------|
| FE/BE typecheck | PASS |
| Supabase DB + seed | PASS |
| Live API evaluation script | **PARTIAL** — 9/13 PASS; 6.1 blocked by invalid `REPLICATE_API_TOKEN` (401) |
| AI provider | Replicate-first via `jsonCompletion.ts` |
| Jest `stage6.evaluation` | Not re-run |
| LinkedIn impact on Evaluation | None observed |

Details: [QA_MODULE_06_AI_EVALUATION.md](./QA_MODULE_06_AI_EVALUATION.md)  
Backend: [kofeko_backend/docs/qa/QA_EVALUATION.md](../../kofeko_backend/docs/qa/QA_EVALUATION.md)

## Open bugs by severity

### Critical

- None in application code.

### Major

- **ENV-002:** `REPLICATE_API_TOKEN` in local `.env` rejected by Replicate (401). Blocks live `POST /evaluations/ai-evaluate` and script tests 6.1, 6.8–6.9. Fix: new token from https://replicate.com/account/api-tokens, restart backend.

### Minor

- Re-run `npm test -- stage6.evaluation` when convenient.

## Phase 1 Status

- [ ] READY  
- [x] **NEEDS FIXES** (environment: valid Replicate token for full Module 6 live PASS)

### Notes

Original Phase 1 (May 2025) passed all 134 cases. June 2026 regression confirms evaluation guards, batch, rankings, and script harness. **One env credential** remains for full green:

```powershell
cd kofeko_backend
# Update REPLICATE_API_TOKEN in .env, then:
npm run dev
powershell -ExecutionPolicy Bypass -File .\scripts\qa-evaluation-regression.ps1
```
