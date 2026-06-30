/** Auth helpers — token management & user data */

export interface UserData {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  user_type: string;
  profile_image?: string;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

export function removeToken(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user_data');
}

export function getUserData(): UserData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user_data');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUserData(data: UserData): void {
  localStorage.setItem('user_data', JSON.stringify(data));
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function logout(): void {
  removeToken();
  window.location.href = '/login';
}
