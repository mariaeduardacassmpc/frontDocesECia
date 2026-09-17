import { apiFetch, setAuthToken } from "@/services/api";

const API_URL = import.meta.env.VITE_API_URL ?? "https://localhost:44309";

async function readError(response: Response, message: string) {
  const details = await response.text();
  return new Error(details || `${message} (${response.status})`);
}

export const userApi = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/api/Auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Email: email,
        Password: password,
      }),
    });

    if (!response.ok) {
      throw await readError(response, "Erro ao entrar");
    }

    const data = await response.json();

    setAuthToken(data.data.token);

    return {
      token: data.data.token,
      user: {
        id: data.data.user.id,
        email: data.data.user.email,
      },
    };
  },

  async update(
    id: number,
    user: { email: string; password: string }
  ): Promise<void> {
    const response = await apiFetch(`${API_URL}/api/User/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Id: id,
        Email: user.email,
        Password: user.password,
      }),
    });

    if (!response.ok) {
      const details = await response.text();

      throw new Error(
        details || `Erro ao salvar usuário (${response.status})`
      );
    }
  },

    async requestPasswordReset(email: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/Auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Email: email,
      }),
    });

    if (!response.ok) {
      throw await readError(response, "Erro ao enviar e-mail de recuperação");
    }
  },
  
    async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/Auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Token: token,
        NewPassword: newPassword,
      }),
    });

    if (!response.ok) {
      throw await readError(response, "Erro ao redefinir senha");
    }
  },
};