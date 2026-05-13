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
| 15 | 14 | 0 | 1 | 93% |

---

## Test Results

| ID | Test | Status | HTTP | Notes |
|----|------|--------|------|-------|
| 4.1 | Candidate list loads | PASS | 200 | `GET /candidates?page=1&limit=100` returned 2 candidates (from prior run) |
| 4.2 | Upload PDF | PASS | 200 | URL returned: `http://localhost:5000/uploads/<uuid>-test.pdf` |
| 4.3 | Upload DOCX | PASS | 200 | `mimeType: application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| 4.4 | Upload TXT | PASS | 200 | `mimeType: text/plain` |
| 4.5 | Upload JPG rejected | PASS | 415 | `"Unsupported format. Use PDF, DOCX, or TXT."` |
| 4.6 | Upload >8MB rejected | PASS | 413 | `"File is too large (max 8 MB)."` |
| 4.7 | Create candidate | PASS | 201 | ID: `7db130b1-7955-4c65-b561-8e9ced2b6e14` — Amit Sharma created |
| 4.8 | Duplicate email | PASS | 409 | `"Candidate with this email already exists"` |
| 4.9 | Create 2 more candidates | PASS | 201 | Priya & Rahul created successfully |
| 4.10 | Filter by skills | PASS | 200 | `?skills=React,TypeScript` matched 3 candidates correctly |
| 4.11 | Filter by status | PASS | 200 | `?status=new` returned 5 candidates |
| 4.12 | Update candidate | PASS | 200 | Location updated to "Mumbai, India", salary to 1,500,000 |
| 4.13 | Update status | PASS | 200 | Status updated from `new` → `screening` |
| 4.14 | Invalid status value | PASS | 400 | `"promoted"` rejected with validation error |
| 4.15 | Interviewer blocked | BLOCKED | N/A | No `interviewer` role user exists in DB — needs a team invite via Module 2 first |

---

## Gap Status

- **GAP A** (no create UI in staff dashboard): `[ ]` Fixed  `[x]` Still missing — tested via automated script
- **GAP B** (no resume upload UI): `[ ]` Fixed  `[x]` Still missing — tested via automated script

### Notes on GAPs:
- Both gaps are backend-functional — all endpoints work correctly.
- The upload URL is a **local `http://localhost:5000/uploads/...`** URL. In production, this should be a Supabase public URL. The `uploadFile` utility may be using local disk storage rather than Supabase Storage. This is acceptable for dev environment but **must be switched to Supabase Storage before production**.
- The frontend `/admin/candidates` page shows a list but no "Add Candidate" button or form. This is a UI gap only; backend is ready.

---

## Candidate IDs for Module 5+

| Candidate | Name | ID |
|-----------|------|----|
| Amit | Amit Sharma | `7db130b1-7955-4c65-b561-8e9ced2b6e14` |
| Priya | Priya Patel | `174b507b-9d0a-4eba-937f-58e9d6e239df` |
| Rahul | Rahul Mehta | `92d30673-a58d-4eff-abff-46eca7869d2c` |
| Open Job ID | — | *(Use a published job from Module 3 — fetch via `GET /api/v1/jobs?status=open`)* |

---

## Verdict
`[ ]` PASS — All critical tests pass  
`[x]` PARTIAL — 1 BLOCKED (RBAC test needs interviewer user), all others PASS  
`[ ]` FAIL — Core functionality broken

### Notes for Module 5 (Pipeline & Portal):
- All 3 candidates are created and ready to be added to a pipeline.
- Resume upload works but stores files locally in dev. Supabase Storage integration to verify in a production-equivalent environment.
- The frontend UI for creating candidates and uploading resumes is not built yet (GAP A & B); these will be needed for Module 5's candidate portal flow.
- TEST 4.15 (interviewer RBAC) can be re-run after inviting an interviewer via the Module 2 team invite flow.
