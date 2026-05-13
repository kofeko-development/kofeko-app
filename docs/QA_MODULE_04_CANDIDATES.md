# QA Results — Module 4: Candidate Management
**Date:** 2026-05-13
**Tester:** Antigravity (automated via test_module_4.js)
**Frontend:** http://localhost:3000
**Backend:** http://localhost:5000
**Git (FE):** 0fe459a
**Git (BE):** cf877a1

---

## Summary

| Total | Passed | Failed | Blocked | Pass% |
|-------|--------|--------|---------|-------|
| 15 | 15 | 0 | 0 | **100%** |

---

## Test Results

| ID | Test | Status | HTTP | Notes |
|----|------|--------|------|-------|
| 4.1 | Candidate list loads | PASS | 200 | `GET /candidates?page=1&limit=100` returned candidates |
| 4.2 | Upload PDF | PASS | 200 | URL returned successfully |
| 4.3 | Upload DOCX | PASS | 200 | `mimeType: application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| 4.4 | Upload TXT | PASS | 200 | `mimeType: text/plain` |
| 4.5 | Upload JPG rejected | PASS | 415 | `"Unsupported format. Use PDF, DOCX, or TXT."` |
| 4.6 | Upload >8MB rejected | PASS | 413 | `"File is too large (max 8 MB)."` |
| 4.7 | Create candidate | PASS | 201 | Amit Sharma created |
| 4.8 | Duplicate email | PASS | 409 | `"Candidate with this email already exists"` |
| 4.9 | Create 2 more candidates | PASS | 201 | Priya & Rahul created |
| 4.10 | Filter by skills | PASS | 200 | `?skills=React,TypeScript` matched correctly |
| 4.11 | Filter by status | PASS | 200 | `?status=new` returned correctly |
| 4.12 | Update candidate | PASS | 200 | Location and salary updated correctly |
| 4.13 | Update status | PASS | 200 | Status updated from `new` → `screening` |
| 4.14 | Invalid status value | PASS | 400 | `"promoted"` rejected with validation error |
| 4.15 | Interviewer blocked | PASS | 403 | Interviewer correctly blocked from creating candidates |

---

## Gap Status

- **GAP A** (no create UI in staff dashboard): `[x]` Fixed — `candidatesApi` added to frontend; UI dialog built
- **GAP B** (no resume upload UI): `[x]` Fixed — `candidatesApi.uploadResume()` added to `stage1-2-api.ts`

---

## Fixes Applied This Session

| Fix | File | Change |
|-----|------|--------|
| Bug C — Delete draft wired | `job-postings/page.tsx` | `handleDeleteDraft` now calls `jobsApi.delete()` |
| Bug D — Pause/Close frontend | `stage1-2-api.ts` | Added `pause`, `close`, `delete` to `jobsApi` |
| GAP B — Upload resume frontend | `stage1-2-api.ts` | Added `candidatesApi` with `uploadResume`, `create`, `list`, `update`, `updateStatus` |
| 4.15 RBAC — Interviewer blocked | Backend seeder | Created `interviewer.rajdeep@kofeko.dev` user in Rajdeep Org with no `candidate:create` perm |
| Backend DELETE /jobs/:id | `job.service.ts`, `job.repository.ts`, `job.controller.ts`, `job.routes.ts` | Full implementation of draft deletion |

---

## Candidate IDs for Module 5+

| Candidate | Name | ID |
|-----------|------|----|
| Amit | Amit Sharma | `4a54a1b2-aebe-4e57-826f-dfc7b8ef23c1` |
| Priya | Priya Patel | `a7c8aa66-2243-4637-aca3-72824ab6ade5` |
| Rahul | Rahul Mehta | `1e62ca4e-9038-4e7e-83ba-ddddcc9a8406` |

---

## Verdict
`[x]` PASS — All 15 tests pass (100%)
`[ ]` PARTIAL
`[ ]` FAIL
