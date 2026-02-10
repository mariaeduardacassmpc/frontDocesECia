import { useState } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useSales, useExpenses, useProducts } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/StatCard";
import { useToast } from "@/hooks/use-toast";

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
