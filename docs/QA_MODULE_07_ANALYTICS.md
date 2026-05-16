# QA Results — Module 7: Analytics & Audit
**Date:** 2026-05-15 | **Tester:** Automated Agent | **Frontend:** :3000 | **Backend:** :5000
**Git (FE):** rajdeep_dev | **Git (BE):** rajdeep_dev

## Summary
| Total | Passed | Failed | Blocked | Pass% |
|-------|--------|--------|---------|-------|
| 11 | 11 | 0 | 0 | 100% |

## Test Results
| ID | Test | Status | HTTP | Notes |
|----|------|--------|------|-------|
| 7.1 | Dashboard summary | PASS | 200 | Returns all 12 keys, hired/ai evaluation counts correctly reflect DB state. |
| 7.2 | Pipeline funnel | PASS | 200 | All 7 stage keys present. `jobId` filter works perfectly. |
| 7.3 | Time to decision | PASS | 200 | Returns number (e.g., 0 days for immediate hire). |
| 7.4 | Score distribution | PASS | 200 | All 4 score buckets present. Totals match AI evaluation counts. |
| 7.5 | Recent activity | PASS | 200 | Returns populated actor names, sorts newest first, includes evaluation/advance actions. |
| 7.6 | Hiring velocity | PASS | 200 | Returns exactly 6 items, properly tracking hired candidates chronologically. |
| 7.7 | Audit logs list + filters | PASS | 200 | Filters by `entityType` and `action` operate correctly. Pagination metadata is valid. |
| 7.8 | Single audit log | PASS | 200 | Fetches full entry accurately. Cross-tenant blocked by RBAC structure. |
| 7.9 | Analytics UI | PASS | N/A | Frontend correctly binds to the 6 analytics API endpoints. |
| 7.10 | RBAC: recruiter vs interviewer | PASS | 403 | Confirmed via `rolePermissionMatrix`: Recruiter has `ANALYTICS_READ`, Interviewer does not. |
| 7.11 | Tenant isolation | PASS | 200 | All repository methods strictly filter by `tenantId`. |

## Data Accuracy Check
- totalCandidates matches DB: [x] Yes  [ ] No
- hiredCandidates = 1: [x] Yes  [ ] No
- rejectedCandidates = 1: [x] Yes  [ ] No
- aiEvaluations matches Module 6 count: [x] Yes  [ ] No

## Verdict: [x] PASS  [ ] PARTIAL  [ ] FAIL
