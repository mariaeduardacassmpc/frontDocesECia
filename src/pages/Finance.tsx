import { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useSales, useExpenses } from "@/store/useStore";
import { expenseApi } from "@/services/expenseApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/StatCard";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  buildMonthlyData,
  calculateLocalSummary,
  filterExpenses,
  mapFinancialSummary,
} from "@/services/FinanceService";

const CHART_COLORS = [
  "hsl(145, 42%, 52%)",
  "hsl(0, 72%, 55%)",
  "hsl(200, 70%, 55%)",
  "hsl(45, 92%, 55%)",
  "hsl(340, 55%, 85%)",
];

export default function Finance() {
  const { sales } = useSales();
  const { expenses, addExpense, deleteExpense } = useExpenses();
  const { toast } = useToast();

  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState(0);
  const [expenseFilter, setExpenseFilter] = useState<'day' | 'month'>('day');
  const [financialSummary, setFinancialSummary] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    totalCost: 0,
    profit: 0,
  });
  const [summaryMonth, setSummaryMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [filterDate, setFilterDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  useEffect(() => {
    const [year, month] = summaryMonth.split('-').map(Number);
    let active = true;

    expenseApi.getFinancial(year, month)
      .then(summary => {
        if (active) {
          setFinancialSummary(mapFinancialSummary(summary));
        }
      })
      .catch(error => {
        console.error('Erro ao buscar resumo financeiro:', error);
        if (active) {
          setFinancialSummary(calculateLocalSummary(sales, expenses, summaryMonth));
        }
      });

    return () => {
      active = false;
    };
  }, [summaryMonth, sales, expenses]);

  const filteredExpenses = useMemo(
    () => filterExpenses(expenses, expenseFilter, filterDate),
    [expenses, expenseFilter, filterDate],
  );

  const monthlyData = useMemo(
    () => buildMonthlyData(sales, expenses),
    [sales, expenses],
  );

  const handleAdd = async () => {
    if (!desc.trim() || amount <= 0) { toast({ title: "Preencha todos os campos", variant: "destructive" }); return; }
    try {
      const now = new Date();
      const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 19);

      await addExpense({ date: localDate, description: desc.trim(), amount });
      toast({ title: "Despesa adicionada!" });
      setDesc(''); setAmount(0);
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Erro ao adicionar despesa',
        variant: "destructive",
      });
    }
  };

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Financeiro</h1>
          <p className="text-muted-foreground">Controle suas finanças</p>
        </div>
        <div className="w-full sm:w-48">
          <Label htmlFor="summary-month">Mês dos indicadores</Label>
          <Input
            id="summary-month"
            type="month"
            value={summaryMonth}
            onChange={e => setSummaryMonth(e.target.value)}
            className="mt-1 bg-white text-black"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Receita Total" value={fmt(financialSummary.totalRevenue)} icon={<TrendingUp className="h-6 w-6" />} color="secondary" />
        <StatCard title="Despesas + Custos" value={fmt(financialSummary.totalExpenses + financialSummary.totalCost)} icon={<TrendingDown className="h-6 w-6" />} color="accent" />
        <StatCard title="Lucro Líquido" value={fmt(financialSummary.profit)} icon={<DollarSign className="h-6 w-6" />} color={financialSummary.profit >= 0 ? 'info' : 'primary'} />
      </div>

      <Card className="shadow-card border-0 w-full">
        <CardHeader><CardTitle className="font-display">Nova Despesa</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><Label>Descrição</Label><Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Ingredientes, Embalagens" /></div>
            <div><Label>Valor (R$)</Label><Input type="number" step="0.01" value={amount || ''} onChange={e => setAmount(parseFloat(e.target.value) || 0)} /></div>
          </div>
          <Button onClick={handleAdd} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2">
            <Plus className="h-4 w-4" /> Adicionar Despesa
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.7fr]">
        <Card className="shadow-card border-0">
          <CardHeader className="space-y-4">
            <CardTitle className="font-display">Despesas Recentes</CardTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="expense-filter">Período</Label>
                <select
                  id="expense-filter"
                  value={expenseFilter}
                  onChange={e => setExpenseFilter(e.target.value as 'day' | 'month')}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="day">Dia</option>
                  <option value="month">Mês</option>
                </select>
              </div>
              <div>
                <Label htmlFor="expense-filter-date">Data</Label>
                <Input
                  id="expense-filter-date"
                  type="date"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">Nenhuma despesa registrada.</p>
            ) : filteredExpenses.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">Nenhuma despesa encontrada neste período.</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredExpenses.map(exp => (
                  <div key={exp.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <div>
                      <p className="font-semibold text-sm">{exp.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(exp.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-destructive">-{fmt(exp.amount)}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteExpense(exp.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="font-display text-lg">Receita vs Despesas</CardTitle></CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">Registre vendas e despesas para ver o gráfico.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 20%, 88%)" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} />
                  <YAxis fontSize={12} tickLine={false} tickFormatter={v => `R$${v}`} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Bar dataKey="Receita" fill="hsl(145, 42%, 52%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Despesas" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
