import { useState, useCallback, useEffect } from 'react';
import { Sale } from '@/types';
import { salesApi } from '@/services/salesApi';

function mapSale(s: any): Sale {
  const items = s.items ?? s.Items ?? [];
  const customer = s.customer ?? s.Customer;

  return {
    id: String(s.SaleId ?? s.VendaId ?? s.id ?? s.Id ?? crypto.randomUUID()),
    date: s.date ?? s.Date ?? s.SaleDate ?? s.saleDate ?? new Date().toISOString(),
    items: items.map((item: any) => ({
      productId: String(item.productId ?? item.ProductId ?? ''),
      productName: item.productName ?? item.ProductName ?? item.Product?.Name ?? '',
      quantity: Number(item.quantity ?? item.Quantity ?? 0),
      unitPrice: Number(item.unitPrice ?? item.UnitPrice ?? item.Product?.SalePrice ?? 0),
      subtotal: Number(item.subtotal ?? item.Subtotal ?? (Number(item.Quantity ?? item.quantity ?? 0) * Number(item.UnitPrice ?? item.unitPrice ?? 0))),
    })),
    total: Number(s.total ?? s.Total ?? s.TotalAmount ?? s.totalAmount ?? 0),
    paymentMethod: s.paymentMethod ?? s.PaymentMethod ?? 'outro',
    customerName: s.customerName ?? s.CustomerName ?? customer?.Name ?? customer?.name,
    customerId: s.customerId ?? s.CustomerId ?? customer?.CustomerId ?? customer?.id,
  };
}

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);

  const fetchSales = useCallback(async () => {
    try {
      const data = await salesApi.getAll();
      setSales(data.map(mapSale));
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      setSales([]);
    }
  }, []);

  const addSale = useCallback(async (s: Omit<Sale, 'id'>) => {
    await salesApi.create(s);
    await fetchSales();
  }, [fetchSales]);

  const updateSale = useCallback(async (s: Sale) => {
    await salesApi.update(Number(s.id), s);
    await fetchSales();
  }, [fetchSales]);

  const deleteSale = useCallback(async (id: string) => {
    await salesApi.delete(Number(id));
    await fetchSales();
  }, [fetchSales]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return { sales, addSale, updateSale, deleteSale };
}
