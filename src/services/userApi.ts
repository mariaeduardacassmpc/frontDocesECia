import { apiFetch, setAuthToken } from "@/services/api";

const API_URL = import.meta.env.VITE_API_URL ?? "https://localhost:44309";

export const userApi = {
  async login(email: string, password: string) {
    const response = await apiFetch(`${API_URL}/api/Auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Email: email,
        Password: password,
      }),
    });

    const result = await response.json();

    setAuthToken(result.data.token);

    return {
      token: result.data.token,
      user: {
        id: result.data.user.id,
        email: result.data.user.email,
      },
    };
  },

  async update(
    id: number,
    user: { email?: string; password?: string }
  ): Promise<void> {
    const body: {
      Id: number;
      Email?: string;
      Password?: string;
    } = {
      Id: id,
    };

    if (user.email?.trim()) {
      body.Email = user.email.trim();
    }

    if (user.password?.trim()) {
      body.Password = user.password;
    }

    if (!body.Email && !body.Password) {
      throw new Error("Informe pelo menos um dado para alterar.");
    }

    await apiFetch(`${API_URL}/api/User/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  },

  async getById(id: number) {
    const response = await apiFetch(`${API_URL}/api/User/${id}`, {
      method: "GET",
    });

    const result = await response.json();

    return result.data;
  },

  async requestPasswordReset(email: string): Promise<void> {
    await apiFetch(`${API_URL}/api/Auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Email: email,
      }),
    });
  },
  async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    await apiFetch(`${API_URL}/api/Auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Email: email,
        Token: token,
        NewPassword: newPassword,
      }),
    });
  },
};