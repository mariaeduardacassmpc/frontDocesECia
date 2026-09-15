import { Plus, Trash2, ShoppingCart, Filter, Eye, Download, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useSalesPage } from "@/hooks/useSalesPage";
import { Sale } from "@/types";

export default function Sales() {
  const salesPage = useSalesPage();
const {
  products,
  sales,
  items,
  customerSearch,
  productSearch,
  quantity,
  paymentMethod,
  showProductList,
  showCustomerList,
  filteredCustomers,
  filteredProducts,
  total,
  filterPayment,
  filterSearchTerm,
  filterDateStart,
  filterDateEnd,
  sortBy,
  sortedSales,
  selectedSale,
  detailsOpen,
  editCustomerId,
  editPaymentMethod,
  editItems,
  editProductSearch,
  editSelectedProductId,
  editQuantity,
  editFilteredProducts,
  editTotal,
  showEditProductList,
  editDialogOpen,
  newSaleDialogOpen,
  setCustomerSearch,
  setProductSearch,
  setSelectedCustomerId,
  setSelectedProductId,
  setShowCustomerList,
  setShowProductList,
  setQuantity,
  setPaymentMethod,
  setFilterPayment,
  setFilterSearchTerm,
  setFilterDateStart,
  setFilterDateEnd,
  setSortBy,
  setDetailsOpen,
  setEditCustomerId,
  setEditPaymentMethod,
  setEditProductSearch,
  setEditSelectedProductId,
  setEditQuantity,
  setShowEditProductList,
  setEditDialogOpen,
  setNewSaleDialogOpen,
  saleCustomers,
  selectCustomer,
  selectProduct,
  addItem,
  removeItem,
  removeEditItem,
  finalizeSale,
  openNewSale,
  openSaleDetails,
  openSaleEdit,
  addEditItem,
  saveSaleEdit,
  downloadSale,
  handleDownloadReport,
  clearHistoryFilters,
  paymentLabels,
  fmt,
} = salesPage;
  const handlePaymentFilterChange = (value: string) => setFilterPayment(value as typeof filterPayment);

  return (
    <div className="w-full min-w-0 space-y-6 overflow-x-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Vendas</h1>
          <p className="text-muted-foreground">Registre suas vendas do dia</p>
          <p className="text-sm font-medium text-secondary">
            {sales.length} {sales.length === 1 ? 'venda registrada' : 'vendas registradas'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleDownloadReport} className="gap-2 bg-white text-black hover:bg-gray-100">
            <Download className="h-4 w-4" /> Relatório
          </Button>
          <Button onClick={openNewSale} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="h-4 w-4" /> Nova Venda
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Dialog open={newSaleDialogOpen} onOpenChange={setNewSaleDialogOpen}>
          <DialogContent className="max-h-[90vh] w-[calc(100%-1rem)] overflow-y-auto bg-[#fbf8f2] sm:w-full sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-secondary" /> Nova Venda</DialogTitle>
            </DialogHeader>
            <Card className="border-0 bg-transparent shadow-none">
          <CardContent className="space-y-4">
            <div className="relative">
              <Label>Cliente</Label>
              <Input 
                value={customerSearch} 
                onChange={e => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerList(true);
                  setSelectedCustomerId(null);
                }}
                onMouseDown={() => setShowCustomerList(true)}
                onBlur={() => setTimeout(() => setShowCustomerList(false), 200)}
                placeholder="Digite o nome do cliente..."
                className="border border-input bg-white text-black"
              />
              {showCustomerList && filteredCustomers.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredCustomers.map(c => (
                    <div
                      key={c.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectCustomer(c);
                      }}
                      className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                    >
                      <div className="font-medium">{c.name}</div>
                      {c.city && <div className="text-xs text-muted-foreground">{c.city}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1 relative">
                <Label>Produto</Label>
                <Input 
                  value={productSearch}
                  onChange={e => {
                    setProductSearch(e.target.value);
                    setShowProductList(true);
                    setSelectedProductId(null);
                  }}
                  onFocus={() => setShowProductList(true)}
                  onBlur={() => setTimeout(() => setShowProductList(false), 200)}
                  placeholder="Digite o nome do produto"
                  className="border border-input bg-white text-black"
                />
                {showProductList && filteredProducts.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredProducts.map(p => (
                      <div
                        key={p.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectProduct(p);
                        }}
                        className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                      >
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.category} - {fmt(p.price)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-full sm:w-20">
                <Label>Qtd</Label>
                <Input type="number" min={1} value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} className="border border-input bg-white text-black" />
              </div>
              <Button onClick={addItem} size="icon" className="w-full shrink-0 bg-secondary text-secondary-foreground hover:bg-secondary/90 sm:w-10">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {items.length > 0 && (
              <div className="space-y-2 rounded-lg bg-white p-3">
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
                <SelectTrigger className="border border-input bg-white text-black"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border z-50">
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setNewSaleDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={finalizeSale}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                disabled={items.length === 0}
              >
                Salvar
              </Button>
            </DialogFooter>
          </CardContent>
            </Card>
          </DialogContent>
        </Dialog>

        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Filter className="h-5 w-5 text-secondary" /> Histórico
            </CardTitle>
          </CardHeader>
          <CardContent>
                        <div className="space-y-3 mb-10">
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                            <div>
                              <Label className="text-xs">Pagamento</Label>
                              <Select value={filterPayment} onValueChange={handlePaymentFilterChange}>
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border z-50">
                                  <SelectItem value="todos">Todos</SelectItem>
                                  <SelectItem value="pix">Pix</SelectItem>
                                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                  <SelectItem value="cartao">Cartão</SelectItem>
                                  <SelectItem value="outro">Outro</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Ordenar</Label>
                              <Select value={sortBy} onValueChange={v => setSortBy(v as any)}>
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border z-50">
                                  <SelectItem value="recentes">Recentes</SelectItem>
                                  <SelectItem value="antigos">Antigos</SelectItem>
                                  <SelectItem value="maior">Maior Valor</SelectItem>
                                  <SelectItem value="menor">Menor Valor</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Data Início</Label>
                              <Input
                                type="date"
                                className="h-9"
                                value={filterDateStart}
                                onChange={e => setFilterDateStart(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Data Fim</Label>
                              <Input
                                type="date"
                                className="h-9"
                                value={filterDateEnd}
                                onChange={e => setFilterDateEnd(e.target.value)}
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                variant="outline"
                                className="h-9 w-full"
                                onClick={clearHistoryFilters}
                              >
                                Limpar filtro
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Cliente ou produto</Label>
                            <Input
                              className="h-9"
                              placeholder="Filtrar por cliente ou produto"
                              value={filterSearchTerm}
                              onChange={e => setFilterSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>

            {sales.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">Nenhuma venda registrada.</p>
            ) : sortedSales.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">Nenhuma venda encontrada com os filtros aplicados.</p>
            ) : (
              <div className="max-h-[420px] max-w-full overflow-auto rounded-lg border border-border">
                <table className="w-full min-w-[850px] text-sm">
                  <thead className="bg-muted/60 sticky top-0">
                    <tr>
                      <th className="text-left font-medium p-3 min-w-[130px]">Data</th>
                      <th className="text-left font-medium p-3 min-w-[140px]">Cliente</th>
                      <th className="text-left font-medium p-3 min-w-[220px]">Produtos</th>
                      <th className="text-left font-medium p-3 min-w-[110px]">Pagamento</th>
                      <th className="text-left font-medium p-3 min-w-[110px]">Total</th>
                      <th className="text-left font-medium p-3 min-w-[170px]">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSales.map((sale) => (
                      <tr key={sale.id} className="border-t border-border align-top">
                        <td className="p-3 text-muted-foreground">{new Date(sale.date).toLocaleString('pt-BR')}</td>
                        <td className="p-3 font-medium">{sale.customerName || 'Cliente'}</td>
                        <td className="p-3 text-muted-foreground">
                          {sale.items.slice(0, 2).map(item => item.productName).join(', ')}
                          {sale.items.length > 2 ? ` +${sale.items.length - 2}` : ''}
                        </td>
                        <td className="p-3">
                          <span className="text-xs rounded-full bg-info/15 text-info px-2 py-0.5">
                            {paymentLabels[sale.paymentMethod]}
                          </span>
                        </td>
                        <td className="p-3 font-display font-bold text-secondary">{fmt(sale.total)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openSaleEdit(sale)}
                              title="Editar"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openSaleDetails(sale)}
                              title="Visualizar"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => downloadSale(sale)}
                              title="Baixar"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

   <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
    <DialogContent
      onOpenAutoFocus={(e) => e.preventDefault()}
      className="max-h-[90vh] w-[calc(100%-1rem)] overflow-y-auto bg-[#fbf8f2] sm:w-full sm:max-w-md"
    >
      <DialogHeader>
        <DialogTitle className="font-display text-xl">
          Detalhes da Venda
        </DialogTitle>
      </DialogHeader>

      {selectedSale && (
        <div className="space-y-4">
          <div>
            <Label>Cliente</Label>

            <div className="mt-1 rounded-md border border-input bg-white px-3 py-2 text-sm text-black">
              {selectedSale.customerName || "Cliente não informado"}
            </div>
          </div>

          {/* Produtos */}
          <div>
            <Label>Produtos</Label>

            <div className="mt-1 space-y-2 rounded-md bg-white p-3">
              {selectedSale.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum produto na venda.
                </p>
              ) : (
                selectedSale.items.map((item) => (
                  <div
                    key={`${selectedSale.id}-${item.productId}`}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="min-w-0">
                      <span className="font-medium">
                        {item.productName}
                      </span>

                      <span className="ml-1 text-muted-foreground">
                        x{item.quantity}
                      </span>
                    </div>

                    <span className="shrink-0 font-semibold">
                      {fmt(item.subtotal)}
                    </span>
                  </div>
                ))
              )}

              <div className="flex justify-between border-t border-border pt-2 font-bold">
                <span>Total</span>

                <span className="text-secondary">
                  {fmt(selectedSale.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Forma de pagamento */}
          <div>
            <Label>Forma de Pagamento</Label>

            <div className="mt-1 rounded-md border border-input bg-white px-3 py-2 text-sm text-black">
              {paymentLabels[selectedSale.paymentMethod]}
            </div>
          </div>

          {/* Data */}
          <div>
            <Label>Data da Venda</Label>

            <div className="mt-1 rounded-md border border-input bg-white px-3 py-2 text-sm text-black">
              {new Date(selectedSale.date).toLocaleString("pt-BR")}
            </div>
          </div>  
        </div>
      )}
    </DialogContent>
  </Dialog>

  <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
    <DialogContent className="max-h-[90vh] w-[calc(100%-1rem)] overflow-y-auto bg-[#fbf8f2] sm:w-full sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="font-display text-xl">
          Editar Venda
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Cliente */}
        <div>
          <Label>Cliente</Label>

          <Select
            value={editCustomerId?.toString() ?? "none"}
            onValueChange={(value) =>
              setEditCustomerId(value === "none" ? null : Number(value))
            }
          >
            <SelectTrigger className="border border-input bg-white text-black">
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>

            <SelectContent className="bg-popover border z-50">
              <SelectItem value="none">
                Sem cliente
              </SelectItem>

              {saleCustomers.map((customer) => (
                <SelectItem
                  key={customer.id}
                  value={customer.id.toString()}
                >
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Adicionar produto */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="relative flex-1">
            <Label>Adicionar produto</Label>

            <Input
              value={editProductSearch}
              onChange={(e) => {
                setEditProductSearch(e.target.value);
                setShowEditProductList(true);
                setEditSelectedProductId(null);
              }}
              onFocus={() => setShowEditProductList(true)}
              onBlur={() =>
                setTimeout(() => setShowEditProductList(false), 200)
              }
              placeholder="Digite o nome do produto"
              className="border border-input bg-white text-black"
            />

            {showEditProductList && editFilteredProducts.length > 0 && (
              <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover shadow-lg">
                {editFilteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onMouseDown={(e) => {
                      e.preventDefault();

                      setEditSelectedProductId(product.id);
                      setEditProductSearch(product.name);
                      setShowEditProductList(false);
                    }}
                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent"
                  >
                    <div className="font-medium">
                      {product.name}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {product.category} - {fmt(product.price)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quantidade */}
          <div className="w-full sm:w-20">
            <Label>Qtd</Label>

            <Input
              type="number"
              min={1}
              value={editQuantity}
              onChange={(e) =>
                setEditQuantity(parseInt(e.target.value) || 1)
              }
              className="border border-input bg-white text-black"
            />
          </div>

          {/* Adicionar */}
          <Button
            onClick={addEditItem}
            size="icon"
            className="w-full shrink-0 bg-secondary text-secondary-foreground hover:bg-secondary/90 sm:w-10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Produtos da venda */}
        <div className="space-y-2 rounded-md bg-white p-3">
          {editItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum produto na venda.
            </p>
          ) : (
            editItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <div className="min-w-0">
                  <span className="font-medium">
                    {item.productName}
                  </span>

                  <span className="ml-1 text-muted-foreground">
                    x{item.quantity}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-semibold">
                    {fmt(item.subtotal)}
                  </span>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => removeEditItem(item.productId)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}

          <div className="flex justify-between border-t border-border pt-2 font-bold">
            <span>Total</span>

            <span className="text-secondary">
              {fmt(editTotal)}
            </span>
          </div>
        </div>

        {/* Forma de pagamento */}
        <div>
          <Label>Forma de Pagamento</Label>

          <Select
            value={editPaymentMethod}
            onValueChange={(value) =>
              setEditPaymentMethod(value as any)
            }
          >
            <SelectTrigger className="border border-input bg-white text-black">
              <SelectValue />
            </SelectTrigger>

            <SelectContent className="bg-popover border z-50">
              <SelectItem value="pix">Pix</SelectItem>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="cartao">Cartão</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setEditDialogOpen(false)}
          >
            Cancelar
          </Button>

          <Button
            onClick={saveSaleEdit}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            Salvar
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
    </div>
  );
}
