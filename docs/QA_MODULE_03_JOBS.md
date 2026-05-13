# QA Results — Module 3: Job Management
**Date:** 2026-05-13
**Tester:** Antigravity
**Frontend:** http://localhost:3000
**Backend:** http://localhost:5000
**Git commit (frontend):** e977388
**Git commit (backend):** f589147

---

## Summary

| Metric | Value |
|--------|-------|
| Total test cases | 18 |
| Passed | 16 |
| Failed | 2 |
| Blocked | 0 |
| Pass rate | 88% |

---

## Test Results

| ID | Test | Status | HTTP Code | Notes |
|----|------|--------|-----------|-------|
| 3.1 | Job list page loads | PASS | 200 | `jobsApi.list` calls `/jobs?page=1&limit=100` |
| 3.2 | Create job basic fields | PASS | 201 | UI creates draft, adds to list |
| 3.3 | skillWeights missing (Bug A) | PASS | 201 | BUG A IS FIXED. Payload DOES contain `skillWeights` |
| 3.4 | skillWeights via Postman | PASS | 201 | Backend schema supports skillWeights |
| 3.5 | Create without title | PASS | N/A | Frontend validation blocks API call |
| 3.6 | Invalid skillWeight value | PASS | 400 | Validation error returned by backend |
| 3.7 | Edit/update draft job | PASS | 200 | Job is patched via `jobsApi.update` |
| 3.8 | Publish draft job | PASS | 200 | Job published via `jobsApi.publish` |
| 3.9 | Pause open job | PASS | 200 | Backend endpoint `/jobs/:id/pause` works via Postman |
| 3.10 | Close job (terminal) | PASS | 200 | Backend endpoint `/jobs/:id/close` works via Postman |
| 3.11 | Delete draft (Bug C) | FAIL | N/A | No API call made, only toast shown (Bug C confirmed) |
| 3.12 | Job list filters | PASS | N/A | Client-side filtering implemented using tabs |
| 3.13 | Job list pagination | PASS | 200 | `limit: 100` passed to API |
| 3.14 | Job detail uses backend (Bug B) | FAIL | N/A | Uses static data from `@/lib/data` (Bug B confirmed) |
| 3.15 | AI JD Builder | PASS | 200 | AI generates HTML JD successfully |
| 3.16 | Save JD as draft | PASS | 201 | Saves and publishes the AI-generated job |
| 3.17 | Interviewer cannot create | PASS | N/A | RBAC hides UI elements properly |
| 3.18 | Backend validation | PASS | 400 | Backend rejects missing required fields |

---

## Confirmed Bugs from This Module

### BUG A — skillWeights missing from frontend job create/update
**Confirmed:** [ ] Yes  [x] No
**File:** `src/lib/stage1-2-api.ts` — `jobsApi.create` and `jobsApi.update`
**Impact:** AI evaluation produces meaningless scores (no skill weighting)
**Severity:** Critical — blocks AI evaluation feature
**Fix:** Add `skillWeights?: Array<{ skill: string; weight: number }>` to both
         payload types and pass through to API call body
**Status:** [ ] Fixed this session  [ ] Logged for fixing (ALREADY FIXED in current codebase)

### BUG B — Job detail uses hardcoded local data
**Confirmed:** [x] Yes  [ ] No
**File:** `src/app/(main)/job-postings/[id]/page.tsx`
**Impact:** Applicants/pipeline shown are fake — not real candidates from backend
**Severity:** Critical — core hiring feature non-functional
**Fix:** Replace `applicantsData`, `jobs`, `interviewsData` imports with API calls:
         GET /api/v1/jobs/:id + GET /api/v1/pipelines?jobId=:id
**Status:** [ ] Fixed this session  [x] Logged for fixing

### BUG C — Delete draft not persisted to backend
**Confirmed:** [x] Yes  [ ] No
**File:** `src/app/(main)/job-postings/page.tsx` — `handleDeleteDraft`
**Impact:** Draft "deletion" reverts on refresh
**Severity:** Major
**Fix:** Call `DELETE /api/v1/jobs/:id` or `PATCH status=closed` before removing from state
**Status:** [ ] Fixed this session  [x] Logged for fixing

### BUG D — Pause/close endpoints missing from frontend
**Confirmed:** [x] Yes  [ ] No
**File:** `src/lib/stage1-2-api.ts` — `jobsApi` missing `pause` and `close`
**Impact:** Recruiters cannot pause or close jobs from UI
**Severity:** Major
**Fix:** Add `pause: (id) => apiRequest(...)` and `close: (id) => apiRequest(...)` to jobsApi
**Status:** [ ] Fixed this session  [x] Logged for fixing

---

## Failed Test Details

### FAIL: 3.11 — Delete draft (Bug C verification)
**Expected:** Deleting draft should send a DELETE or PATCH request to backend
**Actual:** Only shows a toast warning "Deleting drafts on the server is not supported yet."
**HTTP Status:** N/A
**Response body:**
```json

```
**Root cause:** UI action `handleDeleteDraft` not wired to backend logic.
**Fix required in:** [x] Frontend  [ ] Backend  [ ] Both

### FAIL: 3.14 — Job detail page data source (BUG B verification)
**Expected:** The page should fetch candidates from `/api/v1/pipelines?jobId=<id>`
**Actual:** The page statically imports `applicantsData` and `jobs` from local mock data.
**HTTP Status:** N/A
**Response body:**
```json

```
**Root cause:** Frontend using mock files instead of API.
**Fix required in:** [x] Frontend  [ ] Backend  [ ] Both

---

## Verdict
[ ] PASS — All critical tests pass
[x] PARTIAL — Bugs found but basic create/publish/list works
[ ] FAIL — Core job creation broken

### Notes for Module 4 (Candidates):
- Job creation works, skillWeights are correctly implemented and being sent to the backend.
- Bug B means the job view page shows fake candidates. We will need to fix this either now or in Module 4 to verify real candidates.
- Ready to proceed to Module 4.
