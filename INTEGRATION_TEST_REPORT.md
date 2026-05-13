# Kofeko integration test report

Fill this during manual QA (Modules 1–14). Preconditions: backend `.env`, frontend `.env.local` with `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1`, SMTP configured for email flows.

| Field | Value |
| --- | --- |
| Date | |
| Tester | |
| Backend commit | |
| Frontend commit | |

## Critical (blocks user flow)

| # | Module | Bug | Steps | Expected | Actual |
| --- | --- | --- | --- | --- | --- |

## Major

| # | Module | Bug | Steps | Expected | Actual |
| --- | --- | --- | --- | --- | --- |

## Minor

| # | Module | Bug | Notes |
| --- | --- | --- | --- |

## Pre-fix verification (from integration plan)

| Item | Status |
| --- | --- |
| API default port aligned with backend (3000) | |
| Login optional company slug + 409 flow | |
| Candidate redirect after auth (`/find-jobs`) | |
| Job manual create/edit sends `skillWeights` | |
| Invite success toasts mention email + accept-invite | |
| `mapBackendUser` uses `roles.includes('candidate')` | |
| Invited user login behavior documented (temp password allowed; accept-invite preferred) | |

## Email delivery

| Trigger | Result |
| --- | --- |
| Staff invite | |
| Forgot password | |
| Candidate welcome | |
| Pipeline stage (if tested) | |

## Verdict

**READY FOR STAGING / NEEDS FIXES** — circle one after completing modules.

Notes:
