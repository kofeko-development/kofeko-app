# Error & Toast Conventions (Requirements #5 + #17)

Standing rules for all Kofeko frontend and backend work.

## Toasts (frontend)

Use **`useAppToast()`** from [`src/lib/toast-helpers.ts`](../src/lib/toast-helpers.ts):

| Helper | Color | When |
|--------|-------|------|
| `toastSuccess` | Green | Action completed (saved, published, deleted, logged in) |
| `toastWarning` | Amber | Client-side validation, soft business rules, caution |
| `toastError` | Red | Failures when not using `showError` (rare) |
| `toastInfo` | Blue | Neutral informational messages |

Do **not** call `toast({ variant: 'destructive' })` directly in pages/components.

Inline `<Alert>` components should use matching variants: `success`, `warning`, `destructive`, `info`.

## API errors (frontend)

Use **`useApiErrorToast().showError(error)`** for any failed request.

- Never show `error.message` directly in UI copy.
- Validation (`VALIDATION` category + field details): map to form fields with `fieldErrors` from the result; **no duplicate toast** when all errors map to fields.
- Generic **"Something went wrong"** is reserved for unhandled `SERVER` / 500 errors only.

Resolver: [`resolveApiErrorDisplay()`](../src/lib/error-messages.ts) — priority:

1. Specific `errorCode` catalog entry
2. Category default
3. Backend `message` (especially for `NOT_FOUND`: "Job not found", etc.)

## API errors (backend)

Throw **`AppError(message, statusCode, errorCode, details?, category?)`**.

- `errorCategory` is auto-derived from `errorCode` via `getErrorCategory()` when omitted.
- Response envelope includes: `errorCode`, `errorCategory`, `message`, `statusCode`, optional `details`.

Categories:

| Category | Examples |
|----------|----------|
| `VALIDATION` | Zod failures, OTP invalid |
| `AUTH` | Invalid credentials, expired session/token |
| `PERMISSION` | 403, suspended user/tenant |
| `NOT_FOUND` | Job/Candidate/User not found (use specific message) |
| `BUSINESS` | Job closed, already in pipeline, conflicts |
| `SERVER` | Unhandled 500, AI/storage/email failures |
| `NETWORK` | Frontend-only (fetch failures) |

Login failures → `UNAUTHORIZED` + "Invalid credentials".  
Session/token expiry on protected routes → `TOKEN_EXPIRED` + "Session expired, please log in again".

## Quick checklist

- [ ] Success toast uses `toastSuccess`
- [ ] Client validation uses `toastWarning` or inline field errors
- [ ] API failure uses `showError(error)`
- [ ] Backend throws `AppError` with correct `errorCode`
- [ ] No generic "Something went wrong" except true 500s
