import { useState, useMemo } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useSales, useExpenses, useProducts } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/StatCard";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const CHART_COLORS = [
  "hsl(145, 42%, 52%)",
  "hsl(0, 72%, 55%)",
  "hsl(200, 70%, 55%)",
  "hsl(45, 92%, 55%)",
  "hsl(340, 55%, 85%)",
];

export default function Finance() {
  const { sales } = useSales();
  const { products } = useProducts();
  const { expenses, addExpense, deleteExpense } = useExpenses();
  const { toast } = useToast();

  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('');

  const totalRevenue = sales.reduce((s, sale) => s + sale.total, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalCost = sales.reduce((sum, s) => sum + s.items.reduce((is, i) => {
    const product = products.find(p => p.id === i.productId);
    return is + (product?.cost ?? 0) * i.quantity;
  }, 0), 0);
  const profit = totalRevenue - totalExpenses - totalCost;

  // Monthly bar chart data
  const monthlyData = useMemo(() => {
    const months: Record<string, { receita: number; despesa: number }> = {};
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    sales.forEach(s => {
      const d = new Date(s.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = `${monthNames[d.getMonth()]}/${d.getFullYear().toString().slice(2)}`;
      if (!months[key]) months[key] = { receita: 0, despesa: 0 };
      months[key].receita += s.total;
      (months[key] as any).label = label;
    });

    expenses.forEach(e => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = `${monthNames[d.getMonth()]}/${d.getFullYear().toString().slice(2)}`;
      if (!months[key]) months[key] = { receita: 0, despesa: 0 };
      months[key].despesa += e.amount;
      (months[key] as any).label = label;
    });

    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([, v]) => ({ name: (v as any).label, Receita: v.receita, Despesas: v.despesa }));
  }, [sales, expenses]);

  // Expense category pie chart
  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses.forEach(e => {
      cats[e.category] = (cats[e.category] || 0) + e.amount;
    });
    if (totalCost > 0) cats['Custo de Produção'] = (cats['Custo de Produção'] || 0) + totalCost;
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [expenses, totalCost]);

  const handleAdd = () => {
    if (!desc.trim() || amount <= 0) { toast({ title: "Preencha todos os campos", variant: "destructive" }); return; }
    addExpense({ date: new Date().toISOString(), description: desc, amount, category: category || 'Geral' });
    toast({ title: "Despesa adicionada! ✅" });
    setDesc(''); setAmount(0); setCategory('');
  };

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Financeiro</h1>
        <p className="text-muted-foreground">Controle suas finanças 💰</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Receita Total" value={fmt(totalRevenue)} icon={<TrendingUp className="h-6 w-6" />} color="secondary" />
        <StatCard title="Despesas + Custos" value={fmt(totalExpenses + totalCost)} icon={<TrendingDown className="h-6 w-6" />} color="accent" />
        <StatCard title="Lucro Líquido" value={fmt(profit)} icon={<DollarSign className="h-6 w-6" />} color={profit >= 0 ? 'info' : 'primary'} />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
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

        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="font-display text-lg">Despesas por Categoria</CardTitle></CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">Nenhuma despesa registrada ainda.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} fontSize={11}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add expense */}
        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="font-display">Nova Despesa</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Descrição</Label><Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Ingredientes, Embalagens" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Valor (R$)</Label><Input type="number" step="0.01" value={amount || ''} onChange={e => setAmount(parseFloat(e.target.value) || 0)} /></div>
              <div><Label>Categoria</Label><Input value={category} onChange={e => setCategory(e.target.value)} placeholder="Ex: Ingredientes" /></div>
            </div>
            <Button onClick={handleAdd} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2">
              <Plus className="h-4 w-4" /> Adicionar Despesa
            </Button>
          </CardContent>
        </Card>

        {/* Expenses list */}
        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="font-display">Despesas Recentes</CardTitle></CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">Nenhuma despesa registrada.</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {[...expenses].sort((a, b) => b.date.localeCompare(a.date)).map(exp => (
                  <div key={exp.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <div>
                      <p className="font-semibold text-sm">{exp.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(exp.date).toLocaleDateString('pt-BR')} · {exp.category}
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
      </div>
    </div>
  );
}
