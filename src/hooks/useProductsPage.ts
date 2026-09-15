import { useEffect, useMemo, useState } from "react";
import { useProducts } from "@/store/useStore";
import { productApi } from "@/services/productApi";
import { Product } from "@/types";
import { getProductForm, removeProduct, saveProduct, validateProduct } from "@/services/ProductService";


const emptyProduct = { active: true, name: '', category: '', price: 0, cost: 0, description: '', stock: 0, image: '' };

export function useProductsPage() {
  const { products, loading, addProduct, updateProduct, deleteProduct, toggleProduct } = useProducts();
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const lowStock = useMemo(() => products.filter((p) => p.stock <= 5), [products]);

  useEffect(() => {
    let active = true;

    productApi.getCategories()
      .then((data) => {
        if (active) setCategories(data);
      })
      .catch(() => {
        if (active) setCategories([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const availableCategories = categories;
  const openNew = () => {
    setEditing(null);
    setForm(emptyProduct);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm(getProductForm(product));
    setDialogOpen(true);
  };

  const handleToggleActive = async (id?: number) => {
    if (!id) return { error: 'ID inválido' };

    try {
      await toggleProduct(id);
      return { success: true };
    } catch (error) {
      return { error: 'Erro ao inativar produto' };
    }
  };

  const handleSave = async () => {
    const errorMessage = validateProduct(form);
    if (errorMessage) {
      return { error: errorMessage };
    }

    try {
      const formToSave = { ...form, active: form.active ?? true };
      await saveProduct({ form: formToSave, editing, addProduct, updateProduct });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyProduct);
      return { success: true };
    } catch (error) {
      return { error: 'Erro ao salvar produto' };
    }
  };

  const handleDelete = async (id?: number) => {
    try {
      await removeProduct({ id, deleteProduct });
      return { success: true };
    } catch (error) {
      return { error: 'Erro ao remover produto' };
    }
  };

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          ((p.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
            (p.category ?? '').toLowerCase().includes(search.toLowerCase())) &&
          (categoryFilter === '' || p.category === categoryFilter) &&
          (statusFilter === 'all' ||
            (statusFilter === 'active' && p.active !== false) ||
            (statusFilter === 'inactive' && p.active === false)),
      ),
    [products, search, categoryFilter, statusFilter],
  );

  const fmt = (value?: number | string) => {
    if (value === undefined || value === null || value === '') return '-';
    const numeric = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
    if (Number.isNaN(numeric)) return '-';
    return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return {
    products,
    loading,
    categories: availableCategories,
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
    lowStock,
    filtered,
    fmt,
    openNew,
    openEdit,
    handleSave,
    handleDelete,
    handleToggleActive,
  };
}
