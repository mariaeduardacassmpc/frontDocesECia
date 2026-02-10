import { Cookie, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useProducts } from "@/store/useStore";
import { useSales } from "@/store/useStore";
import { useExpenses } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { products } = useProducts();
  const { sales } = useSales();
  const { expenses } = useExpenses();

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCost = sales.reduce((sum, s) => sum + s.items.reduce((is, i) => {
    const product = products.find(p => p.id === i.productId);
    return is + (product?.cost ?? 0) * i.quantity;
  }, 0), 0);
  const profit = totalRevenue - totalExpenses - totalCost;

  const recentSales = [...sales].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Painel</h1>
        <p className="text-muted-foreground">Resumo geral da sua doceria 🍰</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Produtos" value={String(products.length)} icon={<Cookie className="h-6 w-6" />} color="primary" />
        <StatCard title="Vendas" value={String(sales.length)} icon={<ShoppingCart className="h-6 w-6" />} color="secondary" />
        <StatCard title="Receita Total" value={fmt(totalRevenue)} icon={<DollarSign className="h-6 w-6" />} color="info" />
        <StatCard title="Lucro Estimado" value={fmt(profit)} icon={<TrendingUp className="h-6 w-6" />} color="accent" />
      </div>

      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="font-display">Últimas Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSales.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">Nenhuma venda registrada ainda.</p>
          ) : (
            <div className="space-y-3">
              {recentSales.map(sale => (
                <div key={sale.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div>
                    <p className="font-semibold text-sm">{sale.customerName || 'Cliente'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(sale.date).toLocaleDateString('pt-BR')} · {sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'}
                    </p>
                  </div>
                  <span className="font-display font-bold text-secondary">{fmt(sale.total)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
