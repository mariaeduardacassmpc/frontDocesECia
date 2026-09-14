import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle, Package, Users } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useProducts } from "@/store/useStore";
import { useSales } from "@/store/useStore";
import { useExpenses } from "@/store/useStore";
import { useCustomers } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardMetrics } from "@/services/DashboardService";

export default function Dashboard() {
  const { products } = useProducts();
  const { customers } = useCustomers();
  const { sales } = useSales();
  const { expenses } = useExpenses();
  const { todaysSales, totalRevenue, paymentData, topProducts, maxQuantity, customerCount, productCount } =
    getDashboardMetrics(products, customers, sales, expenses);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Painel</h1>
        <p className="text-muted-foreground">Resumo geral</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total de Produtos" value={String(productCount)} icon={<Package className="h-6 w-6" />} color="primary" />
        <StatCard title="Vendas de Hoje" value={String(todaysSales.length)} icon={<ShoppingCart className="h-6 w-6" />} color="secondary" />
        <StatCard title="Faturamento Hoje" value={fmt(totalRevenue)} icon={<DollarSign className="h-6 w-6" />} color="info" />
        <StatCard title="Total de Clientes" value={String(customerCount)} icon={<Users className="h-6 w-6" />} color="accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="font-display">Vendas por Forma de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentData.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Nenhuma venda registrada ainda.</p>
            ) : (
              <div className="space-y-4">
                {paymentData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-muted-foreground">{item.value} vendas</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-secondary h-2.5 rounded-full transition-all" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="font-display">Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Nenhuma venda registrada ainda.</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-muted-foreground">{product.quantity} un.</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full transition-all" 
                        style={{ width: `${(product.quantity / maxQuantity) * 100}%` }}
                      ></div>
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
