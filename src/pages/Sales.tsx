import { useState } from "react";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { useProducts, useSales } from "@/store/useStore";
import { SaleItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Sales() {
  const { products } = useProducts();
  const { sales, addSale, deleteSale } = useSales();
  const { toast } = useToast();

  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'pix' | 'cartao' | 'outro'>('pix');
  const [customerName, setCustomerName] = useState('');

  const addItem = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) { toast({ title: "Selecione um produto", variant: "destructive" }); return; }
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      setItems(items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + quantity, subtotal: (i.quantity + quantity) * i.unitPrice } : i));
    } else {
      setItems([...items, { productId: product.id, productName: product.name, quantity, unitPrice: product.price, subtotal: quantity * product.price }]);
    }
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeItem = (productId: string) => setItems(items.filter(i => i.productId !== productId));
  const total = items.reduce((s, i) => s + i.subtotal, 0);

  const finalizeSale = () => {
    if (items.length === 0) { toast({ title: "Adicione itens à venda", variant: "destructive" }); return; }
    addSale({ date: new Date().toISOString(), items, total, paymentMethod, customerName: customerName || undefined });
    toast({ title: "Venda registrada! 🎉" });
    setItems([]); setCustomerName('');
  };

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const paymentLabels = { dinheiro: 'Dinheiro', pix: 'Pix', cartao: 'Cartão', outro: 'Outro' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Vendas</h1>
        <p className="text-muted-foreground">Registre suas vendas do dia 🛒</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* New Sale */}
        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="font-display flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-secondary" /> Nova Venda</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Cliente (opcional)</Label><Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nome do cliente" /></div>

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label>Produto</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent className="bg-popover border z-50">
                    {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} - {fmt(p.price)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-20">
                <Label>Qtd</Label>
                <Input type="number" min={1} value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} />
              </div>
              <Button onClick={addItem} size="icon" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {items.length > 0 && (
              <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                {items.map(item => (
                  <div key={item.productId} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{item.productName}</span>
                      <span className="text-muted-foreground"> x{item.quantity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{fmt(item.subtotal)}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeItem(item.productId)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-t border-border pt-2 flex justify-between font-display font-bold text-lg">
                  <span>Total</span><span className="text-secondary">{fmt(total)}</span>
                </div>
              </div>
            )}

            <div>
              <Label>Forma de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={v => setPaymentMethod(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border z-50">
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={finalizeSale} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-base" disabled={items.length === 0}>
              Finalizar Venda
            </Button>
          </CardContent>
        </Card>

        {/* Sales History */}
        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="font-display">Histórico</CardTitle></CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">Nenhuma venda registrada.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {[...sales].sort((a, b) => b.date.localeCompare(a.date)).map(sale => (
                  <div key={sale.id} className="rounded-lg border border-border p-3 space-y-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-sm">{sale.customerName || 'Cliente'}</span>
                        <span className="ml-2 text-xs rounded-full bg-info/15 text-info px-2 py-0.5">{paymentLabels[sale.paymentMethod]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-secondary">{fmt(sale.total)}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteSale(sale.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(sale.date).toLocaleString('pt-BR')} · {sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'}</p>
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
