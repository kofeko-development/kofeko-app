const GENERIC_DISPLAY_NAMES = new Set(['company admin', 'admin user']);

export function isGenericDisplayName(name: string | undefined | null): boolean {
  if (!name?.trim()) return true;
  return GENERIC_DISPLAY_NAMES.has(name.trim().toLowerCase());
}

export function nameFromEmail(email: string): string {
  const local = email.split('@')[0]?.trim() ?? '';
  if (!local) return email;

  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function getUserDisplayName(user: {
  name?: string | null;
  email: string;
  company?: string | null;
}): string {
  if (user.company?.trim()) {
    return user.company.trim();
  }

  if (user.name?.trim() && !isGenericDisplayName(user.name)) {
    return user.name.trim();
  }

  const fromEmail = nameFromEmail(user.email);
  if (fromEmail && fromEmail !== user.email) {
    return fromEmail;
  }

  return user.email;
}

export function getUserInitials(user: {
  name?: string | null;
  email: string;
  company?: string | null;
}): string {
  const displayName = getUserDisplayName(user);
  const parts = displayName.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }

  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (user.email.charAt(0) || '?').toUpperCase();
}
