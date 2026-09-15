import { Product } from "@/types";
import { apiFetch } from "@/services/api";

const API_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:44309';

export const productApi = {
  async downloadReport(): Promise<{ blob: Blob; filename?: string }> {
    const response = await apiFetch(`${API_URL}/api/Product/report`);

    if (!response.ok) {
      const details = await response.text();
      throw new Error(details || `Erro ao gerar relatório (${response.status})`);
    }

    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = contentDisposition?.match(/filename\*?=(?:UTF-8''|\")?([^;\"]+)/i)?.[1];

    return {
      blob: await response.blob(),
      filename: filename ? decodeURIComponent(filename) : undefined,
    };
  },
    
  async getCategories(): Promise<string[]> {
    const response = await apiFetch(`${API_URL}/api/Category`);

    if (!response.ok) {
      throw new Error('Erro ao buscar categorias');
    }

    const data = await response.json();

    const items =
      Array.isArray(data)
        ? data
        : data?.data ??
          data?.Data ??
          data?.categories ??
          data?.Categories ??
          [];

    return items
      .map((item: any) =>
        typeof item === 'string'
          ? item.trim()
          : String(
              item?.Name ??
              item?.name ??
              item?.CategoryName ??
              item?.categoryName ??
              ''
            ).trim()
      )
      .filter(Boolean);
  },

  async getAll(): Promise<any[]> {
    const response = await apiFetch(`${API_URL}/api/Product`);

    if (!response.ok) {
      throw new Error('Erro ao buscar produtos');
    }

    const data = await response.json();
    if (Array.isArray(data)) return data;
    return data?.data || data?.Data || data?.products || data?.Products || [];
  },

    async create(p: Omit<Product, 'id'>): Promise<void> {
    const response = await apiFetch(
        `${API_URL}/api/Product`,
        {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            Name: p.name,
            Active: p.active !== false,
            Category: p.category,
            Description: p.description,
            Image: p.image,
            SalePrice: p.price,
            PurchasePrice: p.cost,
            Stock: p.stock,
        }),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        console.error('STATUS:', response.status);
        console.error('RESPOSTA DA API:', error);
        throw new Error(error || 'Erro ao criar produto');
    }
    },
  async getById(id: number): Promise<any> {
    const response = await apiFetch(`${API_URL}/api/Product/${id}`);

    if (!response.ok) {
      throw new Error('Produto não encontrado');
    }

    return response.json();
  },

  async update(id: number, p: Omit<Product, 'id'>): Promise<void> {
    const response = await apiFetch(
      `${API_URL}/api/Product/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      body: JSON.stringify({
            Name: p.name,
            Active: p.active !== false,
            Category: p.category,
            Description: p.description,
            Image: p.image,
            SalePrice: p.price,
            PurchasePrice: p.cost,
            Stock: p.stock,
            }),
      }
    );

    if (!response.ok) {
      const details = await response.text();
      throw new Error(details || `Erro ao atualizar produto (${response.status})`);
    }
  },

  async delete(id: number): Promise<void> {
    const response = await apiFetch(
      `${API_URL}/api/Product/${id}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao deletar produto');
    }
  },
};