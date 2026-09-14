export const AUTH_TOKEN_KEY = "doceria_auth_token";

export function setAuthToken(token: string) {
	localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
	localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
	const token = localStorage.getItem(AUTH_TOKEN_KEY);
	const headers = new Headers(init.headers);

	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	return fetch(input, { ...init, headers });
}

export { productApi } from './productApi';
export { customerApi } from './customerApi';
export { salesApi } from './salesApi';
export { expenseApi } from './expenseApi';
