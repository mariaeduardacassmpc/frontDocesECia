const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:44309';

import { apiFetch } from '@/services/api';

export const expenseApi = {
  async getFinancial(year: number, month: number): Promise<any> {
    const params = new URLSearchParams({
      year: String(year),
      month: String(month),
    });

    const response = await apiFetch(
      `${BASE_URL}/api/Expense/financial-summary?${params}`
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar resumo financeiro');
    }

    return response.json();
  },

  async getAll(): Promise<any[]> {
    const response = await apiFetch(`${BASE_URL}/api/Expense`);

    if (!response.ok) {
      throw new Error('Erro ao buscar despesas');
    }

    const data = await response.json();

    if (Array.isArray(data)) return data;

    return data?.data || data?.Data || data?.expenses || data?.Expenses || [];
  },

  async create(expense: any): Promise<void> {
    const response = await apiFetch(
      `${BASE_URL}/api/Expense/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Description: expense.description,
          Value: expense.amount,
          Date: expense.date,
        }),
      }
    );

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        details || `Erro ao criar despesa (${response.status})`
      );
    }
  },

  async getById(id: number): Promise<any> {
    const response = await apiFetch(`${BASE_URL}/api/Expense/${id}`);

    if (!response.ok) {
      throw new Error('Erro ao buscar despesa');
    }

    return response.json();
  },

  async update(id: number, expense: any): Promise<void> {
    const response = await apiFetch(
      `${BASE_URL}/api/Expense/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: expense.description,
          amount: expense.amount,
          date: expense.date,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao atualizar despesa');
    }
  },

  async delete(id: number): Promise<void> {
    const response = await apiFetch(
      `${BASE_URL}/api/Expense/${id}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao deletar despesa');
    }
  },
};
