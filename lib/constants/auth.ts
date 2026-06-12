export const AUTH_ROLES = ['admin', 'manager', 'counsellor'] as const;
export type AuthRole = (typeof AUTH_ROLES)[number];

export const AUTH_COOKIE_NAME = 'sb-auth-token';
export const DEFAULT_LOGIN_REDIRECT = '/dashboard';
export const DEFAULT_INVITE_REDIRECT = '/accept-invite';
