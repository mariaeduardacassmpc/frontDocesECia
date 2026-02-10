import { useState, useCallback } from 'react';
import { Product, Sale, Expense } from '@/types';

const PRODUCTS_KEY = 'doceria_products';
const SALES_KEY = 'doceria_sales';
const EXPENSES_KEY = 'doceria_expenses';

function load<T>(key: string, fallback: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

const defaultProducts: Product[] = [
  { id: '1', name: 'Brigadeiro Gourmet', category: 'Doces', price: 4.5, cost: 1.5, description: 'Brigadeiro tradicional com granulado belga' },
  { id: '2', name: 'Bolo de Cenoura', category: 'Bolos', price: 45, cost: 18, description: 'Bolo de cenoura com cobertura de chocolate' },
  { id: '3', name: 'Trufa de Maracujá', category: 'Doces', price: 6, cost: 2.5, description: 'Trufa artesanal de maracujá' },
  { id: '4', name: 'Cento de Beijinho', category: 'Festa', price: 80, cost: 30, description: 'Cento de beijinho para festas' },
];

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(() => load(PRODUCTS_KEY, defaultProducts));

  const addProduct = useCallback((p: Omit<Product, 'id'>) => {
    setProducts(prev => {
      const next = [...prev, { ...p, id: crypto.randomUUID() }];
      save(PRODUCTS_KEY, next);
      return next;
    });
  }, []);

  const updateProduct = useCallback((p: Product) => {
    setProducts(prev => {
      const next = prev.map(x => x.id === p.id ? p : x);
      save(PRODUCTS_KEY, next);
      return next;
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => {
      const next = prev.filter(x => x.id !== id);
      save(PRODUCTS_KEY, next);
      return next;
    });
  }, []);

  return { products, addProduct, updateProduct, deleteProduct };
}

export function useSales() {
  const [sales, setSales] = useState<Sale[]>(() => load(SALES_KEY, []));

  const addSale = useCallback((s: Omit<Sale, 'id'>) => {
    setSales(prev => {
      const next = [...prev, { ...s, id: crypto.randomUUID() }];
      save(SALES_KEY, next);
      return next;
    });
  }, []);

  const deleteSale = useCallback((id: string) => {
    setSales(prev => {
      const next = prev.filter(x => x.id !== id);
      save(SALES_KEY, next);
      return next;
    });
  }, []);

  return { sales, addSale, deleteSale };
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(() => load(EXPENSES_KEY, []));

  const addExpense = useCallback((e: Omit<Expense, 'id'>) => {
    setExpenses(prev => {
      const next = [...prev, { ...e, id: crypto.randomUUID() }];
      save(EXPENSES_KEY, next);
      return next;
    });
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => {
      const next = prev.filter(x => x.id !== id);
      save(EXPENSES_KEY, next);
      return next;
    });
  }, []);

  return { expenses, addExpense, deleteExpense };
}
