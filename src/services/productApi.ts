import { Category, Product } from "@/types";
import { apiFetch } from "@/services/api";

const API_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:44309';

const isNewOrAbsolute = (img: string) =>
  img.startsWith('data:') || img.startsWith('http://') || img.startsWith('https://');

const imagePayload = (img?: string) => {
  if (img === undefined || img === null) return undefined;
  if (img === '') return '';
  return isNewOrAbsolute(img) ? img : undefined; // caminho salvo (/uploads/...) não é reenviado
};

const readError = async (response: Response, fallback: string) => {
  const text = await response.text();
  try {
    const json = JSON.parse(text);
    return json?.message ?? json?.Message ?? json?.title ?? fallback;
  } catch {
    return text || fallback;
  }
};

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
    
  async getCategories(): Promise<Category[]> {
    const response = await apiFetch(`${API_URL}/api/Category`);

    if (!response.ok) {
      throw new Error("Erro ao buscar categorias");
    }

  const data = await response.json();

  const list = Array.isArray(data)
    ? data
    : data?.data ?? data?.Data ?? data?.items ?? data?.Items ?? data?.categories ?? data?.Categories ?? [];

  return list
    .map((c: any) => ({
      categoryId: Number(c.id ?? c.Id ?? c.categoryId ?? c.CategoryId),
      name: String(c.name ?? c.Name ?? c.description ?? ""),
    }))
    .filter((c: Category) => !Number.isNaN(c.categoryId));
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
    const response = await apiFetch(`${API_URL}/api/Product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Name: p.name,
        Active: p.active !== false,
        CategoryId: p.categoryId,
        Description: p.description,
        Image: imagePayload(p.image),
        SalePrice: p.salePrice,
        PurchasePrice: p.purchasePrice,
        Stock: p.stock,
      }),
    });

    if (!response.ok) {
      throw new Error(await readError(response, 'Erro ao criar produto'));
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
    const response = await apiFetch(`${API_URL}/api/Product/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Name: p.name,
        Active: p.active !== false,
        CategoryId: p.categoryId,
        Description: p.description,
        Image: imagePayload(p.image),
        SalePrice: p.salePrice,
        PurchasePrice: p.purchasePrice,
        Stock: p.stock,
      }),
    });

    if (!response.ok) {
      throw new Error(await readError(response, 'Erro ao atualizar produto'));
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