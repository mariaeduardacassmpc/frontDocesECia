import { Customer } from "@/types";
import { apiFetch } from "@/services/api";

const API_URL = import.meta.env.VITE_API_URL ?? "https://localhost:44309";

export const customerApi = {
  async downloadReport(): Promise<{ blob: Blob; filename?: string }> {
    const response = await apiFetch(`${API_URL}/api/Customer/report`);

    if (!response.ok) {
      const details = await response.text();
      throw new Error(details || `Erro ao gerar relatório (${response.status})`);
    }

    const contentDisposition = response.headers.get("Content-Disposition");

    const filename = contentDisposition?.match(
      /filename\*?=(?:UTF-8''|"?)([^;"?]+)/i
    )?.[1];

    return {
      blob: await response.blob(),
      filename: filename ? decodeURIComponent(filename) : undefined,
    };
  },

  async getAll(): Promise<any[]> {
    const response = await apiFetch(`${API_URL}/api/Customer`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar clientes");
    }

    const data = await response.json();
    if (Array.isArray(data)) return data;
    return data?.data || data?.Data || data?.customers || data?.Customers || [];
  },

  async getForSale(): Promise<any[]> {
    const response = await apiFetch(`${API_URL}/api/Customer/for-sale`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar clientes para venda");
    }

    const data = await response.json();
    if (Array.isArray(data)) return data;
    return data?.data || data?.Data || data?.customers || data?.Customers || [];
  },

  async create(c: Omit<Customer, "id">): Promise<void> {
    const response = await apiFetch(`${API_URL}/api/Customer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Name: c.name,
        Phone: c.phone,
        City: c.city,
        Email: c.email,
        Address: c.address,
        Obs: c.obs,
        Active: c.active,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Create - Error:", errorText);
      throw new Error("Erro ao criar cliente");
    }

    await response.text();
  },

  async getById(id: number): Promise<Customer> {
    const response = await apiFetch(`${API_URL}/api/Customer/${id}`);

    if (!response.ok) {
      throw new Error("Cliente não encontrado");
    }

    return response.json();
  },

  async update(
    id: number,
    c: Omit<Customer, "id">
  ): Promise<Customer> {
    const response = await apiFetch(`${API_URL}/api/Customer/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Name: c.name,
          Phone: c.phone,
          City: c.city,
          Email: c.email,
          Address: c.address,
          Obs: c.obs,
          Active: c.active,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Update - Error:", errorText);
      throw new Error("Erro ao atualizar cliente");
    }

    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await apiFetch(`${API_URL}/api/Customer/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Delete - Error:", errorText);
      throw new Error("Erro ao deletar cliente");
    }
  },

  async toggleActive(id: number): Promise<Customer> {
    const response = await apiFetch(
      `${API_URL}/api/Customer/toggleActive/${id}`,
      {
        method: "PUT",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Toggle Active - Error:", errorText);
      throw new Error("Erro ao alterar status do cliente");
    }

    return response.json();
  },
};