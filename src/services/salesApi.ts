import { apiFetch } from "@/services/api";

const API_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:44309';
const SALES_URL = `${API_URL}/api/Sales`;

export const salesApi = {
  async downloadReport() {
    const response = await apiFetch(`${API_URL}/api/Sales/report`, {
      method: "GET",
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(details || `Erro ao gerar relatório (${response.status})`);
    }

    const blob = await response.blob();

    const contentDisposition = response.headers.get("Content-Disposition");
    const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);

    return {
      blob,
      filename: filenameMatch?.[1] ?? "relatorio-vendas",
    };
  },

 async create(sale: any): Promise<any> {
  const backendSale = {
    SaleId: 0,
    Description:
      sale.items?.map((item: any) => item.productName).join(', ') || 'Venda',

    CustomerId: sale.customerId ?? 0,

    Customer: {
      CustomerId: sale.customerId ?? 0,
      Name: sale.customerName ?? 'Cliente não informado',
      Phone: '',
      City: '',
      Address: '',
      Active: true,
      Email: '',
      Obs: '',
    },

    PaymentMethod: sale.paymentMethod,
    TotalAmount: sale.total,
    SaleDate: sale.date,

    Items: (sale.items ?? []).map((item: any) => ({
      SaleItemId: 0,
      SaleId: 0,
      ProductId: Number(item.productId),
      Quantity: Number(item.quantity),
      UnitPrice: Number(item.unitPrice),
    })),
  };

  const response = await apiFetch(SALES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(backendSale),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      details || `Erro ao criar venda (${response.status})`
    );
  }

  const responseText = await response.text();

  try {
    return responseText ? JSON.parse(responseText) : undefined;
  } catch {
    return responseText;
  }
},
  async getAll(): Promise<any[]> {
    const response = await apiFetch(SALES_URL);

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        details || `Erro ao buscar vendas (${response.status})`
      );
    }

    const data = await response.json();

    return Array.isArray(data)
      ? data
      : data?.data ??
          data?.Data ??
          data?.result ??
          data?.Result ??
          data?.sales ??
          data?.Sales ??
          [];
  },

  async update(id: number, sale: any): Promise<any> {
    const backendSale = {
      SaleId: id,
      Description:
        sale.items?.map((item: any) => item.productName).join(', ') || 'Venda',
      CustomerId: sale.customerId ?? 0,
      Customer: {
        CustomerId: sale.customerId ?? 0,
        Name: sale.customerName ?? 'Cliente não informado',
        Phone: '',
        City: '',
        Address: '',
        Active: true,
        Email: '',
        Obs: '',
      },
      PaymentMethod: sale.paymentMethod,
      TotalAmount: sale.total,
      SaleDate: sale.date,
      Items: (sale.items ?? []).map((item: any) => ({
        SaleItemId: 0,
        SaleId: id,
        ProductId: Number(item.productId),
        Quantity: Number(item.quantity),
        UnitPrice: Number(item.unitPrice),
      })),
    };

    const response = await apiFetch(`${SALES_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendSale),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(details || `Erro ao atualizar venda (${response.status})`);
    }

    const responseText = await response.text();
    try {
      return responseText ? JSON.parse(responseText) : undefined;
    } catch {
      return responseText;
    }
  },

  async delete(id: number): Promise<void> {
    const response = await apiFetch(`${SALES_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erro ao deletar venda');
    }
  },
};