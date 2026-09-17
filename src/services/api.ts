export const AUTH_TOKEN_KEY = "doceria_auth_token";

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function apiFetch(
  url: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    const result = await response.clone().json().catch(() => null);

    if (!response.ok || result?.success === false) {
      let message = `Erro na requisição (${response.status})`;

      if (result?.message?.trim()) {
        message = result.message;
      } else if (result?.title?.trim()) {
        message = result.title;
      } else if (result?.errors) {
        const errors = Object.values(result.errors)
          .flat()
          .filter(Boolean);

        if (errors.length > 0) {
          message = errors.join(" ");
        }
      }

      throw new Error(message);
    }
  } else if (!response.ok) {
    const text = await response.text();

    throw new Error(
      text || `Erro na requisição (${response.status})`
    );
  }

  return response;
}

export { productApi } from "./productApi";
export { customerApi } from "./customerApi";
export { salesApi } from "./salesApi";
export { expenseApi } from "./expenseApi";