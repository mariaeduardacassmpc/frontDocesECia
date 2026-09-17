import { useState } from "react";
import { Plus, Pencil, Search, Package, Download, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useProductsPage } from "@/hooks/useProductsPage";
import { cropProductImage, getProductImageSrc } from "@/services/ProductService";
import { productApi } from "@/services/productApi";

export default function Products() {
  const {
    products,
    loading,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    dialogOpen,
    setDialogOpen,
    editing,
    form,
    setForm,
    categories,
    lowStock,
    filtered,
    fmt,
    openNew,
    openEdit,
    handleSave,
  } = useProductsPage();
  const { toast } = useToast();
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 });

  const handleImageFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, image: reader.result as string });
      setImageZoom(1);
      setImagePosition({ x: 50, y: 50 });
    };
    reader.readAsDataURL(file);
  };

  const applyImageFraming = async () => {
    if (!form.image) return;

    try {
      const image = await cropProductImage(form.image, imageZoom, imagePosition.x, imagePosition.y);
      setForm({ ...form, image });
      setImageZoom(1);
      setImagePosition({ x: 50, y: 50 });
      toast({ title: "Enquadramento aplicado" });
    } catch {
      toast({ title: "Não foi possível ajustar a imagem", variant: "destructive" });
    }
  };

  const handleDownloadReport = async () => {
    try {
      const { blob, filename } = await productApi.downloadReport();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `relatorio-produtos-${new Date().toISOString().slice(0, 10)}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Erro ao gerar relatório',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Produtos</h1>
          <p className="text-muted-foreground">Gerencie seus produtos e estoque </p>
          <p className="text-sm font-medium text-secondary">
            {products.length} {products.length === 1 ? 'produto cadastrado' : 'produtos cadastrados'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleDownloadReport} className="gap-2 bg-white text-black hover:bg-gray-100">
            <Download className="h-4 w-4" /> Relatório
          </Button>
          <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="h-4 w-4" /> Novo Produto
          </Button>
        </div>
      </div>

      {lowStock.length > 0 && (
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-display font-semibold text-destructive">Produtos em Baixo Estoque</h3>
            </div>
            <div className="space-y-3">
              {lowStock.map(product => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg bg-destructive/5 border border-destructive/20 p-3 cursor-pointer hover:bg-destructive/10 transition-colors"
                  onClick={() => openEdit(product)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openEdit(product);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  title="Editar produto"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-semibold text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.categoryId}</p>
                    </div>
                  </div>
                  <span className="font-display font-bold text-destructive">{product.stock} un.</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produto"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white text-black pl-10"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 border border-input rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          style={{ backgroundColor: '#ffffff', color: '#000000' }}
        >
          <option value="">Todas as categorias</option>
          {categories.map(cat => (
            <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="w-full sm:w-auto px-3 py-2 border border-input rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          style={{ backgroundColor: '#ffffff', color: '#000000' }}
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </div>
    </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum produto encontrado. Comece adicionando um! 
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...filtered].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })).map((p, index) => (
            <Card key={p.id ?? index} className="shadow-card border-0 overflow-hidden group">
              {p.image && (
                <div className="h-56 w-full overflow-hidden bg-muted">
                  <img
                    src={getProductImageSrc(p.image)}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                    onError={event => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <CardContent className="p-5 space-y-3">
                <div className="space-y-1">
                <span className="inline-block rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                  {p.categoryId}
                </span>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {p.active === false && (
                      <span
                        className="h-2.5 w-2.5 rounded-full bg-destructive"
                        title="Produto inativo"
                        aria-label="Produto inativo"
                      />
                    )}
                    <h3 className="font-display font-bold text-lg">{p.name}</h3>
                  </div>
                  <span className="text-xl font-display font-bold text-secondary">
                    {fmt(p.salePrice)}
                  </span>
                </div>
              </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Custo: {fmt(p.purchasePrice)}</span>
                  <span className="text-secondary font-semibold">Lucro: {fmt((p.salePrice ?? 0) - (p.purchasePrice ?? 0))}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Package className="h-3.5 w-3.5" />
                  <span className={p.stock <= 5 ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                    Estoque: {p.stock} un.
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => openEdit(p)} className="flex-1 gap-1">
                    <Pencil className="h-3 w-3" /> Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-md overflow-y-auto sm:max-w-xl lg:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Nome</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Brigadeiro Gourmet" className="bg-white text-black" />
              </div>
              <div>
             <Label>Categoria</Label>
              <select
                value={form.categoryId}
                onChange={e =>
                  setForm({
                    ...form,
                    categoryId: parseInt(e.target.value) || 0
                  })
                }
                className="w-full px-3 py-2 border border-input rounded-md text-sm shadow-sm bg-white text-black placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value={0}>Selecione a categoria</option>

                {categories.map(cat => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.name}
                  </option>
                ))}
              </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Preço (R$)</Label><Input type="number" step="0.01" value={form.salePrice || ''} onChange={e => setForm({ ...form, salePrice: parseFloat(e.target.value) || 0 })} className="bg-white text-black" /></div>
              <div><Label>Custo (R$)</Label><Input type="number" step="0.01" value={form.purchasePrice || ''} onChange={e => setForm({ ...form, purchasePrice: parseFloat(e.target.value) || 0 })} className="bg-white text-black" /></div>
              <div><Label>Estoque</Label><Input type="number" min={0} value={form.stock || ''} onChange={e => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} className="bg-white text-black" /></div>
            </div>
            <div><Label>Descrição</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descrição do produto" className="bg-white text-black" /></div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Imagem</Label>
                {form.image && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setForm({ ...form, image: '' })}
                    className="h-8 gap-1 text-destructive"
                  >
                    <X className="h-3.5 w-3.5" /> Remover
                  </Button>
                )}
              </div>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-input px-3 py-2 text-sm hover:bg-muted">
                <ImagePlus className="h-4 w-4" /> Escolher foto
                <input type="file" accept="image/*" className="hidden" onChange={event => handleImageFile(event.target.files?.[0])} />
              </label>
              {form.image && (
                <>
                  <div className="mx-auto aspect-square max-h-72 w-full max-w-md overflow-hidden rounded-md bg-muted">
                    <img
                      src={getProductImageSrc(form.image)}
                      alt="Pré-visualização do produto"
                      className="h-full w-full object-cover"
                      style={{
                        transform: `scale(${imageZoom})`,
                        transformOrigin: `${imagePosition.x}% ${imagePosition.y}%`,
                      }}
                    />
                  </div>
                  <div className="space-y-2 rounded-md border border-input p-3">
                    <div className="flex items-center gap-3">
                      <Label htmlFor="image-zoom" className="w-16 text-xs">Zoom</Label>
                      <input id="image-zoom" type="range" min="1" max="2.5" step="0.05" value={imageZoom} onChange={event => setImageZoom(Number(event.target.value))} className="w-full accent-primary" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Label htmlFor="image-position-x" className="w-16 text-xs">Lateral</Label>
                      <input id="image-position-x" type="range" min="0" max="100" value={imagePosition.x} onChange={event => setImagePosition({ ...imagePosition, x: Number(event.target.value) })} className="w-full accent-primary" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Label htmlFor="image-position-y" className="w-16 text-xs">Altura</Label>
                      <input id="image-position-y" type="range" min="0" max="100" value={imagePosition.y} onChange={event => setImagePosition({ ...imagePosition, y: Number(event.target.value) })} className="w-full accent-primary" />
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={applyImageFraming} className="w-full">
                      Aplicar enquadramento
                    </Button>
                  </div>
                </>
              )}
            </div>
            {editing && (
              <label className="flex cursor-pointer items-center gap-3 rounded-md border p-3">
                <Checkbox
                  checked={form.active !== false}
                  onCheckedChange={checked => setForm({ ...form, active: checked === true })}
                />
                <span className="text-sm font-medium">
                  Produto ativo
                  {editing.active === false && <span className="ml-2 text-destructive">(inativo, marque para ativar)</span>}
                </span>
              </label>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={async () => {
                const result = await handleSave();
                if (result?.error) {
                  toast({ title: result.error, variant: "destructive" });
                  return;
                }
                toast({ title: editing ? "Produto atualizado!" : "Produto criado!" });
              }}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}