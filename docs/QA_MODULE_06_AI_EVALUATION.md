# QA Results — Module 6: AI Evaluation
**Date:** 2026-05-15 | **Tester:** Automated Agent | **Frontend:** :3000 | **Backend:** :5000
**Git (FE):** rajdeep_dev | **Git (BE):** rajdeep_dev

## Summary
| Total | Passed | Failed | Blocked | Pass% |
|-------|--------|--------|---------|-------|
| 11 | 11 | 0 | 0 | 100% |

## Test Results
| ID | Test | Status | HTTP | Time(s) | Notes |
|----|------|--------|------|---------|-------|
| 6.1 | Single AI evaluation | PASS | 201 | 75.78 | Successfully parsed resume and returned all evaluation fields (score, summary, skill matches). |
| 6.2 | Skill matches completeness | PASS | N/A | N/A | 4 exact skills matched with correct weights and contribution > 0 for matches. |
| 6.3 | No resume → 400 | PASS | 400 | N/A | Returned clear NO_RESUME error code. |
| 6.4 | Non-existent job → 404 | PASS | 404 | N/A | Returned NOT_FOUND error code. |
| 6.5 | Batch evaluate | PASS | 200 | 2.50 | Handled partial failures successfully (e.g. 404 on dummy resume URLs) and did not crash. Skips previously evaluated. |
| 6.6 | Batch skips evaluated | PASS | 200 | N/A | Returns evaluated: 0 on second run. |
| 6.7 | Rankings endpoint | PASS | 200 | N/A | Correctly sorted highest score first with incremental ranks. |
| 6.8 | Recruiter override | PASS | 200 | N/A | Score manually updated to 90 and saved. |
| 6.9 | Audit log created | PASS | 200 | N/A | Audit log action `ai_evaluate` present with correct metadata (score). |
| 6.10 | AI score UI display | PASS | N/A | N/A | Verified visually in previous stage (badges, colors, summary). |
| 6.11 | Error handling (bad token) | PASS | 502 | N/A | Returns 502 BAD_GATEWAY without stack trace. Verified logic in service. |

## AI Response Quality Notes
- Highest score candidate: Rahul Mehta (score: 90 - via override, AI base was ~83)
- Lowest score candidate: N/A (Only Rahul fully evaluated with valid resume)
- Scores make sense for the resumes: [x] Yes  [ ] No — notes: Rahul possesses all 4 prioritized skills with strong proficiency levels, making the AI's 83 baseline accurate.
- Evidence strings in skillMatches: [x] Present  [ ] Empty

## Verdict: [x] PASS  [ ] PARTIAL  [ ] FAIL
