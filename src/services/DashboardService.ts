import { Customer, Expense, Product, Sale } from "@/types";

export const DASHBOARD_PAYMENT_LABELS: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "Pix",
  cartao: "Cartão",
  outro: "Outro",
};

export function getDashboardMetrics(
  products: Product[],
  customers: Customer[],
  sales: Sale[],
  expenses: Expense[],
) {
  const today = new Date();
  const isToday = (date: string) => {
    const saleDate = new Date(date);
    return saleDate.getFullYear() === today.getFullYear() &&
      saleDate.getMonth() === today.getMonth() &&
      saleDate.getDate() === today.getDate();
  };

  const todaysSales = sales.filter(sale => isToday(sale.date));
  const totalRevenue = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalCost = sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => {
    const product = products.find(entry => String(entry.id) === String(item.productId));
    return itemSum + (product?.cost ?? 0) * item.quantity;
  }, 0), 0);

  const paymentStats = sales.reduce((stats, sale) => {
    const paymentMethod = String(sale.paymentMethod).toLowerCase();
    stats[paymentMethod] = (stats[paymentMethod] || 0) + 1;
    return stats;
  }, {} as Record<string, number>);

  const paymentData = Object.entries(paymentStats).map(([key, value]) => ({
    label: DASHBOARD_PAYMENT_LABELS[key] || key,
    value,
    percentage: sales.length > 0 ? (value / sales.length) * 100 : 0,
  }));

  const productSales = sales.reduce((result, sale) => {
    sale.items.forEach(item => {
      if (!result[item.productId]) result[item.productId] = { name: item.productName, quantity: 0 };
      result[item.productId].quantity += item.quantity;
    });
    return result;
  }, {} as Record<string, { name: string; quantity: number }>);

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return {
    todaysSales,
    totalRevenue,
    totalExpenses,
    totalCost,
    profit: totalRevenue - totalExpenses - totalCost,
    lowStock: products.filter(product => product.stock <= 5),
    paymentData,
    topProducts,
    maxQuantity: Math.max(...topProducts.map(product => product.quantity), 1),
    customerCount: customers.length,
    productCount: products.length,
  };
}
