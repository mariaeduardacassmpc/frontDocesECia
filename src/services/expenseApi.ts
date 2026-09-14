const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:44309';

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token'); // ajuste conforme onde você guarda o token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const expenseApi = {
  async getFinancial(year: number, month: number): Promise<any> {
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    const response = await fetch(`${BASE_URL}/api/Expense/financial-summary?${params}`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao buscar resumo financeiro');
    return response.json();
  },

  async getAll(): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/api/Expense`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao buscar despesas');
    return response.json();
  },

  async create(expense: any): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/Expense/create`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        Description: expense.description,
        Value: expense.amount,
        Date: expense.date,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(details || `Erro ao criar despesa (${response.status})`);
    }
  },

  async getById(id: number): Promise<any> {
    const response = await fetch(`${BASE_URL}/api/Expense/${id}`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao buscar despesa');
    return response.json();
  },

  async update(id: number, expense: any): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/Expense/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
      }),
    });

    if (!response.ok) throw new Error('Erro ao atualizar despesa');
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/Expense/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    if (!response.ok) throw new Error('Erro ao deletar despesa');
  },
};