import { useCallback, useEffect, useState } from "react";
import { Customer } from "@/types";
import { customerApi } from "@/services/customerApi";

function mapCustomer(c: unknown): Customer {
  const customer = c as Record<string, unknown>;
  return {
    id: Number(customer.ClienteId ?? customer.CustomerId ?? customer.Id ?? customer.id ?? customer.customerId),
    name: String(customer.Name ?? customer.name ?? "Sem nome"),
    phone: String(customer.Phone ?? customer.phone ?? ""),
    city: String(customer.City ?? customer.city ?? ""),
    email: String(customer.Email ?? customer.email ?? ""),
    address: String(customer.Address ?? customer.address ?? ""),
    obs: String(customer.Obs ?? customer.obs ?? ""),
    active:
      customer.Active ??
      customer.active ??
      customer.IsActive ??
      customer.isActive ??
      customer.Ativo ??
      customer.ativo ??
      true,
  };
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);

    try {
      const data = await customerApi.getAll();
      const mapped = Array.from(
        new Map(data.map(mapCustomer).map((customer) => [customer.id, customer])).values()
      );

      setCustomers(mapped);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCustomer = useCallback(
    async (c: Omit<Customer, "id">) => {
      try {
        await customerApi.create(c);

        await fetchCustomers();
      } catch (error) {
        console.error("Erro ao criar cliente:", error);
        throw error;
      }
    },
    [fetchCustomers]
  );

  const updateCustomer = useCallback(
    async (c: Customer): Promise<Customer> => {
      if (!c.id) {
        throw new Error("ID do cliente é inválido");
      }

      try {
        const updated = await customerApi.update(c.id, {
          name: c.name,
          phone: c.phone,
          city: c.city,
          email: c.email,
          address: c.address,
          obs: c.obs,
          active: c.active,
        });

        await fetchCustomers();

        return mapCustomer(updated);
      } catch (error) {
        console.error("Erro ao atualizar cliente:", error);
        throw error;
      }
    },
    [fetchCustomers]
  );

  const deleteCustomer = useCallback(
    async (id: number) => {
      if (!id) {
        throw new Error("ID do cliente é inválido");
      }

      try {
        await customerApi.delete(id);
        await fetchCustomers();
      } catch (error) {
        console.error("Erro ao deletar cliente:", error);
        throw error;
      }
    },
    [fetchCustomers]
  );

  const toggleCustomer = useCallback(
    async (id: number): Promise<Customer> => {
      if (!id) {
        throw new Error("ID do cliente é inválido");
      }

      try {
        const updated = await customerApi.toggleActive(id);

        await fetchCustomers();

        return mapCustomer(updated);
      } catch (error) {
        console.error("Erro ao alterar status do cliente:", error);
        throw error;
      }
    },
    [fetchCustomers]
  );

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    toggleCustomer,
    fetchCustomers,
  };
}