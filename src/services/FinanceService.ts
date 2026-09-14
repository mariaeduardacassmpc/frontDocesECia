import { Expense, Sale } from "@/types";

export const CHART_COLORS = [
  "hsl(145, 42%, 52%)",
  "hsl(0, 72%, 55%)",
  "hsl(200, 70%, 55%)",
  "hsl(45, 92%, 55%)",
  "hsl(340, 55%, 85%)",
];

export function getCurrentDateParts() {
  const today = new Date();
  const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  return { month, date: `${month}-${String(today.getDate()).padStart(2, "0")}` };
}

export function mapFinancialSummary(summary: Record<string, unknown>) {
  return {
    totalRevenue: Number(summary.totalRevenue ?? summary.TotalRevenue ?? summary.receitaTotal ?? summary.ReceitaTotal ?? summary.revenue ?? summary.Revenue ?? 0),
    totalExpenses: Number(summary.totalExpenses ?? summary.TotalExpenses ?? summary.despesasCustos ?? summary.DespesasCustos ?? summary.expenses ?? summary.Expenses ?? 0),
    totalCost: Number(summary.totalCost ?? summary.TotalCost ?? summary.cost ?? summary.Cost ?? 0),
    profit: Number(summary.profit ?? summary.Profit ?? summary.lucroLiquido ?? summary.LucroLiquido ?? 0),
  };
}

export function filterExpenses(expenses: Expense[], filter: "day" | "month", dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const selectedDate = new Date(year, month - 1, day);
  const startDate = filter === "month" ? new Date(year, month - 1, 1) : new Date(selectedDate);
  const endDate = filter === "month" ? new Date(year, month, 1) : new Date(year, month - 1, day + 1);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  return expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate < endDate;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function buildMonthlyData(sales: Sale[], expenses: Expense[]) {
  const months: Record<string, { receita: number; despesa: number; label: string }> = {};
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const addMonth = (date: string) => {
    const value = new Date(date);
    const key = `${value.getFullYear()}-${value.getMonth()}`;
    if (!months[key]) months[key] = { receita: 0, despesa: 0, label: `${monthNames[value.getMonth()]}/${value.getFullYear().toString().slice(2)}` };
    return months[key];
  };

  sales.forEach(sale => { addMonth(sale.date).receita += sale.total; });
  expenses.forEach(expense => { addMonth(expense.date).despesa += expense.amount; });

  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, value]) => ({ name: value.label, Receita: value.receita, Despesas: value.despesa }));
}

export function validateExpense(description: string, amount: number) {
  return description.trim() && amount > 0;
}
