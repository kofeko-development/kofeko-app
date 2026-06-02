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

## 2026-06-01 Auth UX consistency

Standardized auth error handling across company signup/login, candidate auth, OTP, invite, password reset, and superadmin login.

| Area | Change |
|------|--------|
| Backend | Candidate OTP uses `OTP_RATE_LIMITED`, `OTP_EXPIRED`, `OTP_INVALID`, `OTP_MAX_ATTEMPTS`; staff/candidate refresh JWT failures return `401 UNAUTHORIZED` |
| FE shared | `ApiError.details` typed; `mapFieldErrors()`; `useApiErrorToast` returns `{ display, fieldErrors }` + catalog action links in toast |
| Auth screens | All auth pages use `showError` + inline field errors from backend validation |
| Redirects | Open-position apply → `/candidate-auth`; apply questions → `/candidate-auth?mode=signup` |

### Manual QA matrix (auth feedback)

| Scenario | Expected UX |
|----------|-------------|
| Wrong password (staff / candidate / superadmin) | Toast: **Invalid Credentials** (`UNAUTHORIZED`); no misleading slug/company field message |
| Suspended user / tenant | Catalog toast (`USER_SUSPENDED` / `TENANT_SUSPENDED`) |
| Approval pending / rejected | Catalog toast + redirect to `/signup-success?status=pending\|rejected` |
| Wrong portal (candidate on staff login) | Toast with **Go to Candidate Login** action → `/candidate-auth` |
| Invited-only account | `ACCOUNT_INVITED_ONLY` catalog message |
| Candidate no-password (recruiter-created) | `ACCOUNT_NO_PASSWORD` catalog message |
| OTP wrong / expired / max attempts / rate limit | Matching `OTP_*` catalog toasts (company + candidate signup) |
| Invite token expired / used / invalid | `INVITE_TOKEN_*` catalog; used → redirect login |
| Reset token expired / used / invalid | `RESET_TOKEN_*` catalog; expired → redirect forgot-password |
| Backend validation (Zod) | Toast **Validation Error** + inline message on mapped field (`body.email` → email, etc.) |
| Unauthenticated job apply | Toast + redirect `/candidate-auth` (not staff `/login`) |
| Expired refresh token (API) | `401 UNAUTHORIZED` from backend (not 500) |

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
