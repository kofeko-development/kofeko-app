# QA Results — Module 1: Auth & Company Signup

**Date:** 2026-05-11  
**Tester:** Automated agent (code review + doc); browser/email tests **not executed** in this session — replace with human tester name after manual run.  
**Frontend:** http://localhost:3000 (default Next.js dev; use your configured port)  
**Backend:** Configure `PORT` in backend `.env` (prompt uses **5000**; backend default in code is often **3000** — **must match** `NEXT_PUBLIC_API_BASE_URL`).  
**Git commit (frontend):** `32584fd`  
**Git commit (backend):** `06e6b51`  

---

## Summary

| Metric | Value |
|--------|-------|
| Total test cases | 24 |
| Passed | 0 (manual execution pending) |
| Failed | 0 |
| Blocked | 24 (awaiting manual QA in browser + inbox) |
| Pass rate | — |

---

## Environment alignment (read before testing)

| Topic | Notes |
|-------|--------|
| API URL | [`src/lib/api-client.ts`](../src/lib/api-client.ts) fallback is `http://localhost:3000/api/v1`. For Module 1 prompt (**backend :5000**), set `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1` in `.env.local` **or** run backend on **3000** and keep API URL aligned. |
| Login wrong slug | Backend [`login`](../../Kofeko---Backend/src/services/auth/auth.service.ts) returns **401** Invalid credentials for wrong `tenantSlug`, not **404** — adjust expected outcome for **Test 1.17**. |
| Signup flow | [`signup/page.tsx`](../src/app/signup/page.tsx): OTP send/verify → `registerAdmin` → `POST /auth/register-company-request` (not `/register-admin`). Redirect **`/signup-success`** after submit. |
| Invited user login | Backend allows **invited** users to log in with temp password (activates account); see backend auth service comment. |

---

## Test Results

| ID | Test | Status | HTTP Code | Notes |
|----|------|--------|-----------|-------|
| 1.1 | Send OTP to valid email | **PENDING** | — | UI: [`signup/page.tsx`](../src/app/signup/page.tsx) calls `POST .../register-company-email-otp/send`; toast "Code sent" / check inbox. |
| 1.2 | OTP rate limit | **PENDING** | — | Expect **429** from backend on rapid resend; UI surfaces `ApiError.message`. |
| 1.3 | Wrong OTP code | **PENDING** | — | Verify endpoint shows toast on failure; stays on step 1. |
| 1.4 | Non-numeric OTP | **PASS** (code review) | — | OTP input strips non-digits; `handleConfirmEmailOtp` requires `/^\d{6}$/` before API — **no request** if invalid. |
| 1.5 | Correct OTP code | **PENDING** | — | Expect `emailVerificationToken` in response; step 2 enabled. |
| 1.6 | Email change resets token | **PASS** (code review) | — | `handleAdminEmailChange` clears token + OTP state when normalized email changes. |
| 1.7 | Password too short | **PASS** (code review) | — | `validateStep1` requires `password.length >= 8` before advancing. |
| 1.8 | Password mismatch | **PASS** (code review) | — | Inline "Passwords must match." + Continue disabled when mismatch (`showPasswordMismatch`). |
| 1.9 | Full signup submission | **PENDING** | — | Expect **201** from `register-company-request`; redirect `/signup-success`. |
| 1.10 | Submit without terms | **PASS** (code review) | — | Checkbox `required` — native form validation blocks submit. |
| 1.11 | Invalid website URL | **PASS** (code review) | — | `type="url"` on company website + logo fields; browser validation before submit. |
| 1.12 | Phone wrong format | **PENDING** | — | `buildE164Phone` + international field; verify backend message on failure. |
| 1.13 | Short description < 20 chars | **PASS** (code review) | — | `minLength={20}` on textarea + counter in UI. |
| 1.14 | Super Admin approves | **PENDING** | — | Requires superadmin UI + credentials. |
| 1.15 | Admin login after approval | **PENDING** | — | `POST /auth/login`; tokens in `localStorage`. |
| 1.16 | Login wrong password | **PENDING** | — | Expect **401**; no tokens. |
| 1.17 | Login with tenant slug | **PENDING** | — | Wrong slug: expect **401**, not **404** (see Environment alignment). |
| 1.18 | Session restore on refresh | **PENDING** | — | `GET /auth/me` from [`auth.tsx`](../src/lib/auth.tsx) bootstrap. |
| 1.19 | Token auto-refresh on 401 | **PENDING** | — | Verify [`api-client.ts`](../src/lib/api-client.ts) retry path in Network tab. |
| 1.20 | Logout | **PENDING** | — | Tokens cleared + redirect. |
| 1.21 | Forgot password email | **PENDING** | — | `POST /auth/forgot-password`. |
| 1.22 | Reset password happy path | **PENDING** | — | [`reset-password/page.tsx`](../src/app/reset-password/page.tsx) uses strong password regex client-side. |
| 1.23 | Used reset token blocked | **PENDING** | — | Expect **400** from API on replay. |
| 1.24 | Weak password on reset | **PASS** (code review) | — | Same regex as 1.22 before API call. |

---

## Failed Test Details

_No failures recorded — manual tests not yet run._

---

## Bugs Found

| # | Severity | Location | Description | Affects |
|---|----------|----------|-------------|---------|
| — | — | — | — | — |

---

## Email Delivery Check

| Email | Subject | Arrived | Time |
|-------|---------|---------|------|
| OTP verification email | — | Manual QA | — |
| Approval confirmation email | — | Manual QA | — |
| Password reset email | — | Manual QA | — |

---

## Environment Issues Found

- **Port mismatch risk:** Module 1 prompt assumes backend **:5000** and API **http://localhost:5000/api/v1**; repo default API fallback may be **:3000** unless `.env.local` overrides. Align **backend `PORT`** and **`NEXT_PUBLIC_API_BASE_URL`** before testing.

---

## Verdict

[ ] PASS — All critical tests pass, module ready for staging  
[x] **PARTIAL** — Code paths reviewed for several cases; **manual execution required** for OTP, email, superadmin approval, login, refresh, logout  
[ ] FAIL — Critical failures, must fix before proceeding to Module 2  

### Notes for next module:

- After manual run, update the Summary counts, fill HTTP codes, and change **Tester** / **Date**.
- Re-run `git rev-parse --short HEAD` in both repos before finalizing commits.

---

## Instructions for human tester

1. Start backend with the same origin as `NEXT_PUBLIC_API_BASE_URL`.  
2. Run `curl <API_BASE>/health` (or your health route) for **200**.  
3. Execute tests **1.1–1.3, 1.5, 1.9–1.24** in order where dependencies apply.  
4. Replace **PENDING** rows with PASS/FAIL and paste failure bodies into **Failed Test Details**.
