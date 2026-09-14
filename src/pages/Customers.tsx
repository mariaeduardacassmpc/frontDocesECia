import { Plus, Pencil, Trash2, Search, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useCustomersPage } from "@/hooks/useCustomersPage";
import { customerApi } from "@/services/customerApi";

export default function Customers() {
  const {
    customers,
    loading,
    search,
    setSearch,
    cityFilter,
    setCityFilter,
    statusFilter,
    setStatusFilter,
    dialogOpen,
    setDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    customerToDelete,
    editing,
    form,
    setForm,
    cities,
    filtered,
    openNew,
    openEdit,
    openDeleteDialog,
    handleDelete,
    handleSave,
    formatPhone,
  } = useCustomersPage();
  const { toast } = useToast();

  const handleDownloadReport = async () => {
    try {
      const { blob, filename } = await customerApi.downloadReport();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `relatorio-clientes-${new Date().toISOString().slice(0, 10)}`;
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
          <p className="text-muted-foreground mt-4">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus clientes</p>
          <p className="text-sm font-medium text-secondary">
            {customers.length} {customers.length === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleDownloadReport} className="gap-2 bg-white text-black hover:bg-gray-100">
            <Download className="h-4 w-4" /> Relatório
          </Button>
          <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="h-4 w-4" /> Novo Cliente
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative w-full sm:max-w-sm sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar cliente" value={search} onChange={e => setSearch(e.target.value)} className="bg-white text-black pl-10" />
        </div>
        <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:flex sm:flex-none">
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:w-40"
            style={{ backgroundColor: '#ffffff', color: '#000000' }}
          >
            <option value="">Todas as cidades</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="w-full px-3 py-2 border border-input rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:w-40"
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
            Nenhum cliente encontrado. Comece adicionando um! 
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, index) => (
            <Card key={c.id ?? index} className="shadow-card border-0 overflow-hidden group">
              <CardContent className="p-5 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {c.active === false && (
                        <span
                          className="h-2.5 w-2.5 rounded-full bg-destructive"
                          title="Cliente inativo"
                          aria-label="Cliente inativo"
                        />
                      )}
                      <h3 className="font-display font-bold text-lg">{c.name}</h3>
                    </div>
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  {c.email && (
                    <div className="flex items-start gap-2">
                      <span className="font-semibold min-w-[60px]">Email:</span>
                      <span className="break-all">{c.email}</span>
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-start gap-2">
                      <span className="font-semibold min-w-[60px]">Telefone:</span>
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c.city && (
                    <div className="flex items-start gap-2">
                      <span className="font-semibold min-w-[60px]">Cidade:</span>
                      <span>{c.city}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-start gap-2">
                      <span className="font-semibold min-w-[60px]">Endereço:</span>
                      <span>{c.address}</span>
                    </div>
                  )}
                  {c.obs && (
                    <div className="flex items-start gap-2">
                      <span className="font-semibold min-w-[60px]">Obs:</span>
                      <span className="line-clamp-2">{c.obs}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => openEdit(c)} className="flex-1 gap-1">
                    <Pencil className="h-3 w-3" /> Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: João Silva" className="bg-white text-black" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="exemplo@email.com" className="bg-white text-black" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Telefone *</Label>
                <Input value={form.phone} onChange={e => setForm({...form, phone: formatPhone(e.target.value)})} placeholder="(00) 00000-0000" className="bg-white text-black"/>
              </div>
              <div>
                <Label>Cidade *</Label>
                <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Bela Vista do Paraíso" className="bg-white text-black" />
              </div>
            </div>
            <div>
              <Label>Endereço *</Label>
              <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Rua, número, bairro" className="bg-white text-black" />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea 
                value={form.obs} 
                onChange={e => setForm({ ...form, obs: e.target.value })} 
                placeholder="Informações adicionais..."
                rows={3}
                className="bg-white text-black"
              />
            </div>
            {editing && (
              <label className="flex items-center gap-3 rounded-md border p-3 cursor-pointer">
                <Checkbox
                  checked={form.active !== false}
                  onCheckedChange={checked => setForm({ ...form, active: checked === true })}
                />
                <span className="text-sm font-medium">
                  Cliente ativo
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
                  toast({ title: "Dados inválidos", description: result.error, variant: "destructive" });
                  return;
                }
                toast({ title: editing ? "Cliente atualizado" : "Cliente cadastrado" });
                setDialogOpen(false);
              }}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente <strong>{customerToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const result = await handleDelete(customerToDelete?.id);
                if (result?.error) {
                  toast({ title: result.error, description: "Tente novamente mais tarde", variant: "destructive" });
                  return;
                }
                toast({ title: "Cliente removido" });
                setDeleteDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}