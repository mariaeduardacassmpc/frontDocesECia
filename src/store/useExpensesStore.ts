import { useState, useCallback, useEffect } from 'react';
import { Expense } from '@/types';
import { expenseApi } from '@/services/expenseApi';

const EXPENSES_KEY = 'doceria_expenses';

function load<T>(key: string, fallback: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function mapExpense(e: any): Expense {
  return {
    id: String(e.ExpenseId ?? e.expenseId ?? e.id ?? e.Id ?? crypto.randomUUID()),
    date: e.date ?? e.Date ?? new Date().toISOString(),
    description: e.description ?? e.Description ?? 'Sem descrição',
    amount: Number(e.amount ?? e.Amount ?? e.value ?? e.Value ?? 0),
  };
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(() => load(EXPENSES_KEY, []));

  const fetchExpenses = useCallback(async () => {
    try {
      const data = await expenseApi.getAll();
      setExpenses(data.map(mapExpense));
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
    }
  }, []);

  const addExpense = useCallback(async (e: Omit<Expense, 'id'>) => {
    try {
      await expenseApi.create({ ...e, id: undefined });
      await fetchExpenses();
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      const next = [...expenses, { ...e, id: crypto.randomUUID() }];
      setExpenses(next);
      save(EXPENSES_KEY, next);
      throw error;
    }
  }, [expenses, fetchExpenses]);

  const deleteExpense = useCallback(async (id: string) => {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new Error('ID da despesa inválido');
    }

    try {
      await expenseApi.delete(numericId);
      const next = expenses.filter(x => x.id !== id);
      setExpenses(next);
      save(EXPENSES_KEY, next);
      await fetchExpenses();
    } catch (error) {
      console.error('Erro ao deletar despesa:', error);
      const next = expenses.filter(x => x.id !== id);
      setExpenses(next);
      save(EXPENSES_KEY, next);
      throw error;
    }
  }, [expenses, fetchExpenses]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return { expenses, addExpense, deleteExpense };
}
