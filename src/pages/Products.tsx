import { Plus, Pencil, Search, Package, Download, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useProductsPage } from "@/hooks/useProductsPage";
import { getProductImageSrc } from "@/services/ProductService";
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
    getCategoryName,
  } = useProductsPage();

  const { toast } = useToast();

  const handleImageFile = (file?: File) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setForm(current => ({
        ...current,
        image: reader.result as string,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleDownloadReport = async () => {
    try {
      const { blob, filename } = await productApi.downloadReport();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download =
        filename ||
        `relatorio-produtos-${new Date()
          .toISOString()
          .slice(0, 10)}`;

      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title:
          error instanceof Error
            ? error.message
            : "Erro ao gerar relatório",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>

          <p className="mt-4 text-muted-foreground">
            Carregando produtos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">
            Produtos
          </h1>

          <p className="text-muted-foreground">
            Gerencie seus produtos e estoque
          </p>

          <p className="text-sm font-medium text-secondary">
            {products.length}{" "}
            {products.length === 1
              ? "produto cadastrado"
              : "produtos cadastrados"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadReport}
            className="gap-2 bg-white text-black hover:bg-gray-100"
          >
            <Download className="h-4 w-4" />
            Relatório
          </Button>

          <Button
            onClick={openNew}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Produtos em baixo estoque */}
      {lowStock.length > 0 && (
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center gap-2">
              <h3 className="font-display font-semibold text-destructive">
                Produtos em Baixo Estoque
              </h3>
            </div>

            <div className="space-y-3">
              {lowStock.map(product => (
                <div
                  key={product.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3 transition-colors hover:bg-destructive/10"
                  onClick={() => openEdit(product)}
                  onKeyDown={event => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
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
                      <p className="text-sm font-semibold">
                        {product.name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {product.category ||
                          getCategoryName(product.categoryId) ||
                          "Sem categoria"}
                      </p>
                    </div>
                  </div>

                  <span className="font-display font-bold text-destructive">
                    {product.stock} un.
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Buscar produto"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white pl-10 text-black"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary sm:w-auto"
            style={{
              backgroundColor: "#ffffff",
              color: "#000000",
            }}
          >
            <option value="">Todas as categorias</option>

            {categories.map(cat => (
              <option
                key={cat.categoryId}
                value={String(cat.categoryId)}
              >
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e =>
              setStatusFilter(
                e.target.value as
                  | "all"
                  | "active"
                  | "inactive"
              )
            }
            className="w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary sm:w-auto"
            style={{
              backgroundColor: "#ffffff",
              color: "#000000",
            }}
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
      </div>

      {/* Produtos */}
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum produto encontrado. Comece adicionando um!
          </CardContent>
        </Card>
      ) : (
        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...filtered]
            .sort((a, b) =>
              a.name.localeCompare(b.name, "pt-BR", {
                sensitivity: "base",
              })
            )
            .map((p, index) => (
              <Card
                key={p.id ?? index}
                className="group flex h-full flex-col overflow-hidden rounded-lg border-0 shadow-card"
              >
                {p.image && (
                  <div className="h-56 w-full overflow-hidden bg-muted">
                    <img
                      src={getProductImageSrc(p.image)}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={event => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <CardContent className="flex flex-1 flex-col space-y-2 rounded-b-lg px-4 pb-0 pt-4">
                  <div className="space-y-1">
                    <span className="inline-block rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                      {p.category ||
                        getCategoryName(p.categoryId) ||
                        "Sem categoria"}
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

                        <h3 className="text-lg font-display font-bold">
                          {p.name}
                        </h3>
                      </div>

                      <span className="text-xl font-display font-bold text-secondary">
                        {fmt(p.salePrice)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Custo: {fmt(p.purchasePrice)}
                    </span>

                    <span className="font-semibold text-secondary">
                      Lucro:{" "}
                      {fmt(
                        (p.salePrice ?? 0) -
                          (p.purchasePrice ?? 0)
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <Package className="h-3.5 w-3.5" />

                    <span
                      className={
                        p.stock <= 5
                          ? "font-semibold text-destructive"
                          : "text-muted-foreground"
                      }
                    >
                      Estoque: {p.stock} un.
                    </span>
                  </div>

                  <div className="mt-auto flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(p)}
                      className="flex-1 gap-1"
                    >
                      <Pencil className="h-3 w-3" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent
    className="
      flex
      w-[calc(100%-2rem)]
      max-w-4xl
      max-h-[90vh]
      flex-col
      overflow-hidden
      p-0
    "
  >
    {/* Cabeçalho */}
    <DialogHeader className="shrink-0 border-b px-6 py-4">
      <DialogTitle className="font-display text-xl">
        {editing ? "Editar Produto" : "Novo Produto"}
      </DialogTitle>
    </DialogHeader>

    {/* Conteúdo com scroll */}
    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
      <div className="space-y-5">

        {/* Nome e categoria */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Nome</Label>

            <Input
              value={form.name}
              onChange={e =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              placeholder="Ex: Brigadeiro Gourmet"
              className="bg-white text-black"
            />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>

            <select
              value={String(form.categoryId)}
              onChange={e =>
                setForm({
                  ...form,
                  categoryId: Number(e.target.value) || 0,
                })
              }
              className="
                h-10
                w-full
                rounded-md
                border
                border-input
                bg-white
                px-3
                py-2
                text-sm
                text-black
                shadow-sm
                focus:border-primary
                focus:outline-none
                focus:ring-2
                focus:ring-primary
              "
            >
              <option value="0">
                Selecione a categoria
              </option>

              {form.categoryId > 0 &&
                !categories.some(
                  cat => cat.categoryId === form.categoryId
                ) && (
                  <option value={String(form.categoryId)}>
                    {form.category || "Categoria atual"}
                  </option>
                )}

              {categories.map(cat => (
                <option
                  key={cat.categoryId}
                  value={String(cat.categoryId)}
                >
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preço, custo e estoque */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Preço (R$)</Label>

            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.salePrice}
              onChange={e =>
                setForm({
                  ...form,
                  salePrice: Number(e.target.value) || 0,
                })
              }
              className="bg-white text-black"
            />
          </div>

          <div className="space-y-2">
            <Label>Custo (R$)</Label>

            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.purchasePrice}
              onChange={e =>
                setForm({
                  ...form,
                  purchasePrice: Number(e.target.value) || 0,
                })
              }
              className="bg-white text-black"
            />
          </div>

          <div className="space-y-2">
            <Label>Estoque</Label>

            <Input
              type="number"
              min={0}
              step="1"
              value={form.stock}
              onChange={e =>
                setForm({
                  ...form,
                  stock:
                    Number.parseInt(e.target.value, 10) || 0,
                })
              }
              className="bg-white text-black"
            />
          </div>
        </div>

        {/* Imagem */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Imagem</Label>

            {form.image && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setForm({
                    ...form,
                    image: "",
                  })
                }
                className="h-8 gap-1 text-destructive"
              >
                <X className="h-3.5 w-3.5" />
                Remover
              </Button>
            )}
          </div>

          <label
            className="
              flex
              cursor-pointer
              items-center
              justify-center
              gap-2
              rounded-md
              border
              border-dashed
              border-input
              px-3
              py-3
              text-sm
              transition-colors
              hover:bg-muted
            "
          >
            <ImagePlus className="h-4 w-4" />

            <span>Escolher foto</span>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={event =>
                handleImageFile(event.target.files?.[0])
              }
            />
          </label>

          {form.image && (
            <div className="mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-md bg-muted">
              <img
                src={getProductImageSrc(form.image)}
                alt="Pré-visualização do produto"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Status */}
        {editing && (
          <label className="flex cursor-pointer items-center gap-3 rounded-md border p-3">
            <Checkbox
              checked={form.active !== false}
              onCheckedChange={checked =>
                setForm({
                  ...form,
                  active: checked === true,
                })
              }
            />

            <span className="text-sm font-medium">
              Produto ativo

              {editing.active === false && (
                <span className="ml-2 text-destructive">
                  (inativo, marque para ativar)
                </span>
              )}
            </span>
          </label>
        )}
      </div>
    </div>

    {/* Rodapé */}
    <DialogFooter className="shrink-0 border-t bg-background px-6 py-4">
      <Button
        variant="outline"
        onClick={() => setDialogOpen(false)}
      >
        Cancelar
      </Button>

      <Button
        onClick={async () => {
          const result = await handleSave();

          if (result?.error) {
            toast({
              title: result.error,
              variant: "destructive",
            });

            return;
          }

          toast({
            title: editing
              ? "Produto atualizado!"
              : "Produto criado!",
          });
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