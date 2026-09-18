import { useMemo, useState } from "react";
import { Customer } from "@/types";
import { useCustomers } from "@/store/useStore";
import { formatPhone, saveCustomer, validateCustomer } from "@/services/CustomerService";

const emptyCustomer = { name: '', phone: '', city: '', email: '', address: '', obs: '', active: true };

export function useCustomersPage() {
  const { customers, loading, addCustomer, updateCustomer, deleteCustomer, toggleCustomer } = useCustomers();
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<Omit<Customer, 'id'>>(emptyCustomer);

  const cities = useMemo(
    () => Array.from(new Set(customers.map((c) => c.city).filter(Boolean))).sort(),
    [customers],
  );

  const openNew = () => {
    setEditing(null);
    setForm(emptyCustomer);
    setDialogOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    setForm({
      name: customer.name,
      phone: customer.phone,
      city: customer.city,
      email: customer.email,
      address: customer.address,
      obs: customer.obs,
      active: customer.active !== false,
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id) {
      return { error: 'ID inválido' };
    }

    try {
      await deleteCustomer(id);
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
      return { success: true };
    } catch (error) {
      return { error: 'Erro ao remover cliente' };
    }
  };

  const handleSave = async () => {
    const errorMessage = validateCustomer(form);
    if (errorMessage) {
      return { error: errorMessage };
    }

    try {
      const formToSave = editing
        ? { ...form, active: editing.active !== false }
        : form;

      await saveCustomer({ form: formToSave, editing, addCustomer, updateCustomer });

      if (editing && form.active !== (editing.active !== false)) {
        await toggleCustomer(editing.id);
      }

      setDialogOpen(false);
      setEditing(null);
      setForm(emptyCustomer);
      return { success: true };
      } catch (error) {
      return {
        error: error instanceof Error
          ? error.message
          : 'Erro ao salvar cliente',
      };
    }
  };

  const handleInactivate = async (id?: number) => {
    if (!id) return { error: 'ID inválido' };

    try {
      await toggleCustomer(id);
      return { success: true };
    } catch (error) {
      return { error: 'Erro ao inativar cliente' };
    }
  };

  const filtered = useMemo(
    () =>
      customers.filter(
        (customer) =>
          ((customer.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
            (customer.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
            (customer.phone ?? '').toLowerCase().includes(search.toLowerCase()) ||
            (customer.city ?? '').toLowerCase().includes(search.toLowerCase())) &&
          (cityFilter === '' || customer.city === cityFilter) &&
          (statusFilter === 'all' ||
            (statusFilter === 'active' && customer.active !== false) ||
            (statusFilter === 'inactive' && customer.active === false)),
      ),
    [customers, search, cityFilter, statusFilter],
  );

  return {
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
    handleInactivate,
    handleSave,
    formatPhone,
  };
}
