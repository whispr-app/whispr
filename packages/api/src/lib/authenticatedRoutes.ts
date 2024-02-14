import { env } from './env';

export const excludedRoutes = [
  'v0/users/register',
  'v0/users/get-user-password-salt/*',
  'v0/auth/sign-in',
  'v0/gateway/*/.websocket',
];
export const refreshRoutes = [
  'v0/auth/generate-access-token',
  'v0/auth/generate-refresh-token',
];

export const matchRoute = (route: string): boolean => {
  if (env === 'prod' && route.startsWith('api/')) route = route.slice(4);
  for (const r of excludedRoutes) {
    const parts = r.split('/');
    const routeParts = route.split('/');
    if (parts.length !== routeParts.length) continue;
    let match = true;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part === '*') continue;
      if (part !== routeParts[i]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
};
