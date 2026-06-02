// Maps backend errorCode → user-facing message + optional action hint
export type ErrorDisplay = {
  title: string;
  description: string;
  action?: string;          // e.g. "Request new invite", "Contact support"
  actionHref?: string;      // e.g. "/forgot-password"
};

export const ERROR_DISPLAY: Partial<Record<string, ErrorDisplay>> = {
  // Approval states
  APPROVAL_PENDING: {
    title: 'Registration Pending',
    description: 'Your company registration is awaiting approval from our team. You will receive an email once approved.',
    action: 'Contact Support',
    actionHref: 'mailto:support@kofeko.ai',
  },
  APPROVAL_REJECTED: {
    title: 'Registration Not Approved',
    description: 'Your company registration request was not approved. Please contact support for details.',
    action: 'Contact Support',
    actionHref: 'mailto:support@kofeko.ai',
  },

  // Account state
  ACCOUNT_NO_PASSWORD: {
    title: 'Account Not Activated',
    description: 'This account was created by the recruiting team. Check your email for an invite link to set your password.',
  },
  ACCOUNT_INVITED_ONLY: {
    title: 'Invite Not Accepted Yet',
    description: 'Please accept your invitation first. Check your email for the invite link.',
  },
  USER_SUSPENDED: {
    title: 'Account Suspended',
    description: 'Your account has been suspended. Contact your company admin to restore access.',
  },
  TENANT_SUSPENDED: {
    title: 'Company Account Suspended',
    description: 'This company account has been suspended. Contact support@kofeko.ai.',
    action: 'Contact Support',
    actionHref: 'mailto:support@kofeko.ai',
  },
  WRONG_PORTAL: {
    title: 'Wrong Login Portal',
    description: 'This email is registered as a candidate account. Please use the candidate login page.',
    action: 'Go to Candidate Login',
    actionHref: '/candidate-auth',
  },

  // Token errors
  INVITE_TOKEN_EXPIRED: {
    title: 'Invite Link Expired',
    description: 'This invite link has expired (valid for 72 hours). Ask your admin to send a new invitation.',
  },
  INVITE_TOKEN_USED: {
    title: 'Invite Already Accepted',
    description: 'This invite link has already been used. Try logging in instead.',
    action: 'Go to Login',
    actionHref: '/login',
  },
  INVITE_TOKEN_INVALID: {
    title: 'Invalid Invite Link',
    description: 'This invite link is not valid. Open the original invite email or ask your admin to resend.',
  },
  RESET_TOKEN_EXPIRED: {
    title: 'Reset Link Expired',
    description: 'This password reset link has expired (valid for 1 hour). Request a new one.',
    action: 'Reset Password Again',
    actionHref: '/forgot-password',
  },
  RESET_TOKEN_USED: {
    title: 'Reset Link Already Used',
    description: 'This reset link has already been used. Request a new one if needed.',
    action: 'Request New Reset',
    actionHref: '/forgot-password',
  },
  RESET_TOKEN_INVALID: {
    title: 'Invalid Reset Link',
    description: 'This reset link is not valid. Request a new password reset from the login page.',
    action: 'Forgot Password',
    actionHref: '/forgot-password',
  },

  // OTP
  OTP_RATE_LIMITED: {
    title: 'Wait Before Resending',
    description: 'A verification code was just sent. Please wait before requesting another.',
  },
  OTP_EXPIRED: {
    title: 'Code Expired',
    description: 'Verification code has expired. Request a new one.',
  },
  OTP_INVALID: {
    title: 'Incorrect Code',
    description: 'Incorrect verification code. Check the email and try again.',
  },
  OTP_MAX_ATTEMPTS: {
    title: 'Too Many Attempts',
    description: 'Too many incorrect attempts. Please request a new code.',
  },

  // Business rules
  JOB_NOT_OPEN: {
    title: 'Job Not Accepting Candidates',
    description: 'This job is not currently open. Only open jobs can accept candidates.',
  },
  JOB_IS_CLOSED: {
    title: 'Job Is Closed',
    description: 'This job has been permanently closed and cannot be edited or reopened.',
  },
  INVALID_STAGE_TRANSITION: {
    title: 'Invalid Stage Change',
    description: 'That stage transition is not allowed.',
  },
  ALREADY_IN_PIPELINE: {
    title: 'Already Applied',
    description: 'This candidate is already in this job\'s pipeline.',
  },
  NO_RESUME: {
    title: 'No Resume',
    description: 'Please upload a resume before running AI evaluation.',
  },
  NO_SKILL_WEIGHTS: {
    title: 'No Skill Weights',
    description: 'Add skill priorities to the job before running AI evaluation.',
  },
  CONFLICT: {
    title: 'Already Exists',
    description: 'This item already exists. Check for duplicates.',
  },
  NOT_FOUND: {
    title: 'Not Found',
    description: 'The item you\'re looking for could not be found.',
  },
  FORBIDDEN: {
    title: 'Access Denied',
    description: 'You don\'t have permission to do that.',
  },
  UNAUTHORIZED: {
    title: 'Invalid Credentials',
    description: 'The email or password is incorrect. Please try again.',
  },
  INTERNAL_SERVER_ERROR: {
    title: 'Something Went Wrong',
    description: 'A server error occurred. Please try again in a moment.',
  },
  EMAIL_FAILED: {
    title: 'Email Could Not Be Sent',
    description: 'We could not send the email right now. Please try again later.',
  },
  TOKEN_EXPIRED: {
    title: 'Link Expired',
    description: 'This link has expired. Request a new one to continue.',
  },
  INVALID_TOKEN: {
    title: 'Invalid Link',
    description: 'This link is not valid. Open the original email or request a new one.',
  },
  VALIDATION_ERROR: {
    title: 'Validation Error',
    description: 'Please check your input and try again.',
  },
  AI_EVALUATION_FAILED: {
    title: 'AI Evaluation Failed',
    description: 'The AI evaluation service encountered an error. Please try again in a moment.',
  },
  STORAGE_ERROR: {
    title: 'Upload Failed',
    description: 'File upload failed. Please try again.',
  },

  // LinkedIn
  LINKEDIN_NOT_CONNECTED: {
    title: 'LinkedIn not connected',
    description: 'Connect your LinkedIn account in Settings → Integrations to use auto-post.',
    action: 'Open Integrations',
    actionHref: '/settings/integrations',
  },
  LINKEDIN_TOKEN_EXPIRED: {
    title: 'LinkedIn session expired',
    description: 'Disconnect and reconnect your LinkedIn account in Settings → Integrations.',
    action: 'Open Integrations',
    actionHref: '/settings/integrations',
  },
  LINKEDIN_DUPLICATE_POST: {
    title: 'Duplicate post on LinkedIn',
    description:
      'LinkedIn already has a post with the same content. Change the text, use a different share image, or wait before posting again.',
  },
  LINKEDIN_ORG_NOT_FOUND: {
    title: 'Company page not available',
    description: 'Post as your personal profile, refresh company pages, or link your page ID in Integrations.',
    action: 'Open Integrations',
    actionHref: '/settings/integrations',
  },
  LINKEDIN_SCOPE_DENIED: {
    title: 'LinkedIn permission denied',
    description:
      'Your app or token lacks permission for this action. Reconnect after Community Management API approval, or post as personal profile.',
    action: 'Open Integrations',
    actionHref: '/settings/integrations',
  },
  LINKEDIN_RATE_LIMITED: {
    title: 'LinkedIn daily limit',
    description: 'LinkedIn limits how many posts you can publish per day. Try again tomorrow.',
  },
  LINKEDIN_POST_FAILED: {
    title: 'Could not post to LinkedIn',
    description: 'LinkedIn rejected the post. Check your connection and try again.',
  },
  LINKEDIN_OAUTH_FAILED: {
    title: 'LinkedIn connection failed',
    description: 'Authorization did not complete. Check app credentials and redirect URL, then try again.',
    action: 'Open Integrations',
    actionHref: '/settings/integrations',
  },
  LINKEDIN_NETWORK_ERROR: {
    title: 'LinkedIn unreachable',
    description: 'Could not reach LinkedIn. Check your internet connection and try again.',
  },
};

// Helper: get display info from ApiError
export function getErrorDisplay(errorCode?: string, fallbackMessage?: string): ErrorDisplay {
  if (errorCode && ERROR_DISPLAY[errorCode]) {
    return ERROR_DISPLAY[errorCode]!;
  }
  return {
    title: 'Error',
    description: fallbackMessage ?? 'Something went wrong. Please try again.',
  };
}
