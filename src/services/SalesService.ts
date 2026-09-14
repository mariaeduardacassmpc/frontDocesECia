import { Customer, Product, Sale, SaleItem } from "@/types";

export type SaleSortBy = "recentes" | "antigos" | "maior" | "menor";
export type SalePaymentFilter = "todos" | Sale["paymentMethod"];

export type SalesHistoryFilters = {
  payment: SalePaymentFilter;
  searchTerm: string;
  dateStart: string;
  dateEnd: string;
  sortBy: SaleSortBy;
};

export const DEFAULT_HISTORY_FILTERS: SalesHistoryFilters = {
  payment: "todos",
  searchTerm: "",
  dateStart: "",
  dateEnd: "",
  sortBy: "recentes",
};

export const PAYMENT_LABELS: Record<Sale["paymentMethod"], string> = {
  dinheiro: "Dinheiro",
  pix: "Pix",
  cartao: "Cartão",
  outro: "Outro",
};

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function filterCustomersBySearch(customers: Customer[], search: string) {
  const query = search.toLowerCase();
  return customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(query) ||
      (customer.city && customer.city.toLowerCase().includes(query))
  );
}

export function filterProductsBySearch(products: Product[], search: string) {
  const query = search.toLowerCase();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
  );
}

export function addItemToSale(items: SaleItem[], product: Product, quantity: number) {
  const productId = product.id.toString();
  const existing = items.find((item) => item.productId === productId);

  if (existing) {
    return items.map((item) =>
      item.productId === productId
        ? {
            ...item,
            quantity: item.quantity + quantity,
            subtotal: (item.quantity + quantity) * item.unitPrice,
          }
        : item
    );
  }

  return [
    ...items,
    {
      productId,
      productName: product.name,
      quantity,
      unitPrice: product.price,
      subtotal: quantity * product.price,
    },
  ];
}

export function removeItemFromSale(items: SaleItem[], productId: string) {
  return items.filter((item) => item.productId !== productId);
}

export function calculateSaleTotal(items: SaleItem[]) {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
}

export function createSalePayload(params: {
  items: SaleItem[];
  total: number;
  paymentMethod: Sale["paymentMethod"];
  customerSearch: string;
  selectedCustomerId: number | null;
  customers: Customer[];
}): Omit<Sale, "id"> {
  const { items, total, paymentMethod, customerSearch, selectedCustomerId, customers } = params;
  const customer = customers.find((entry) => entry.id === selectedCustomerId);

  return {
    date: new Date().toISOString(),
    items,
    total,
    paymentMethod,
    customerName: customer?.name || customerSearch || undefined,
    customerId: customer?.id || undefined,
  };
}

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function filterAndSortSales(sales: Sale[], filters: SalesHistoryFilters) {
  const filtered = sales.filter((sale) => {
    if (filters.payment !== "todos" && sale.paymentMethod !== filters.payment) return false;

    const searchTerm = normalizeText(filters.searchTerm);
    if (searchTerm) {
      const customerText = normalizeText(sale.customerName || "");
      const customerMatch = customerText.includes(searchTerm);
      const productMatch = sale.items.some((item) =>
        normalizeText(item.productName).includes(searchTerm)
      );
      if (!customerMatch && !productMatch) return false;
    }

    if (filters.dateStart) {
      const saleDate = new Date(sale.date).setHours(0, 0, 0, 0);
      const startDate = new Date(filters.dateStart).setHours(0, 0, 0, 0);
      if (saleDate < startDate) return false;
    }

    if (filters.dateEnd) {
      const saleDate = new Date(sale.date).setHours(0, 0, 0, 0);
      const endDate = new Date(filters.dateEnd).setHours(0, 0, 0, 0);
      if (saleDate > endDate) return false;
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    if (filters.sortBy === "recentes") return b.date.localeCompare(a.date);
    if (filters.sortBy === "antigos") return a.date.localeCompare(b.date);
    if (filters.sortBy === "maior") return b.total - a.total;
    if (filters.sortBy === "menor") return a.total - b.total;
    return 0;
  });
}

export function downloadSaleAsTxt(sale: Sale) {
  const createdAt = new Date(sale.date);
  const createdAtLabel = createdAt.toLocaleString("pt-BR");
  const fileDate = createdAt.toISOString().slice(0, 19).replace(/[:T]/g, "-");

  const lines = [
    `Venda: ${sale.id}`,
    `Data: ${createdAtLabel}`,
    `Cliente: ${sale.customerName || "Cliente nao informado"}`,
    `Pagamento: ${PAYMENT_LABELS[sale.paymentMethod]}`,
    "",
    "Itens:",
    ...sale.items.map(
      (item, index) =>
        `${index + 1}. ${item.productName} | Qtd: ${item.quantity} | Unitario: ${formatCurrency(item.unitPrice)} | Subtotal: ${formatCurrency(item.subtotal)}`
    ),
    "",
    `Total: ${formatCurrency(sale.total)}`,
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `venda-${fileDate}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
}
